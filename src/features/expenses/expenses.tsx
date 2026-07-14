"use client";

import { useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useExpenses } from "./api/expenses-api";
import { ExpenseList } from "./components/expense-list";
import { ExpenseDialog } from "./components/expense-dialog";
import { UpcomingExpenses } from "./components/upcoming-expenses";
import { expenseSchema, type ExpenseInput } from "./schemas/expense-schema";
import type { Expense } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { useExpenseCategories } from "./api/expenses-api";
import { useCashAccounts } from "@/features/cash/api/cash-api";
import { getDefaultDateRange, todayStr, formatToISO } from "@/lib/date-utils";

interface ExpenseFilterValues {
    search: string;
    expense_category_uid: string;
    cash_account_uid: string;
    date_start: string;
    date_end: string;
}

export function Expenses() {
    const { from: defaultStart, to: defaultEnd } = getDefaultDateRange();

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        expense_category_uid?: string;
        cash_account_uid?: string;
        date_start?: string;
        date_end?: string;
    }>({
        date_start: defaultStart,
        date_end: defaultEnd,
    });

    const { data: categories = [] } = useExpenseCategories();
    const { data: cashAccounts = [] } = useCashAccounts();

    const filterMethods = useForm<ExpenseFilterValues>({
        defaultValues: {
            search: "",
            expense_category_uid: "all",
            cash_account_uid: "all",
            date_start: defaultStart,
            date_end: defaultEnd,
        },
    });

    const handleFilterSubmit = (data: ExpenseFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            expense_category_uid: data.expense_category_uid !== "all" ? data.expense_category_uid : undefined,
            cash_account_uid: data.cash_account_uid !== "all" ? data.cash_account_uid : undefined,
            date_start: data.date_start || undefined,
            date_end: data.date_end || undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            expense_category_uid: "all",
            cash_account_uid: "all",
            date_start: defaultStart,
            date_end: defaultEnd,
        });
        setAppliedFilters({
            date_start: defaultStart,
            date_end: defaultEnd,
        });
        setPage(1);
    };

    const { data: expensesData, isLoading, isFetching } = useExpenses({
        page,
        per_page: perPage,
        ...appliedFilters,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const dialogMethods = useForm<ExpenseInput>({
        resolver: zodResolver(expenseSchema) as Resolver<ExpenseInput>,
        defaultValues: {
            expense_category_uid: "",
            cash_account_uid: "",
            amount: 0,
            nama: "",
            catatan: "",
            tanggal: todayStr(),
        },
    });

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        dialogMethods.reset({
            expense_category_uid: expense.expense_category_uid,
            cash_account_uid: expense.cash_account_uid,
            amount: expense.amount,
            nama: expense.nama || "",
            catatan: expense.catatan || "",
            tanggal: formatToISO(expense.tanggal) || todayStr(),
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingExpense(null);
        dialogMethods.reset({
            expense_category_uid: "",
            cash_account_uid: "",
            amount: 0,
            nama: "",
            catatan: "",
            tanggal: todayStr(),
        });
        setIsDialogOpen(true);
    };

    // Quick payment trigger from Upcoming dues sidebar
    const handlePayCategory = (catUid: string, catName: string) => {
        setEditingExpense(null);
        dialogMethods.reset({
            expense_category_uid: catUid,
            cash_account_uid: "",
            amount: 0,
            nama: `Pembayaran ${catName}`,
            catatan: "",
            tanggal: todayStr(),
        });
        setIsDialogOpen(true);
    };

    const categoryOptions = [
        { value: "all", label: "Semua Kategori" },
        ...categories.map((c) => ({ value: String(c.uid), label: c.nama })),
    ];

    const accountOptions = [
        { value: "all", label: "Semua Akun" },
        ...cashAccounts.map((a) => ({ value: String(a.uid), label: a.nama })),
    ];

    return (
        <FormProvider {...dialogMethods}>
            <div className="w-full space-y-6 relative">
                <ExpenseList
                    expenses={expensesData?.data || []}
                    meta={expensesData?.meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    onEdit={handleEdit}
                    onAddClick={handleAddClick}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    filterElement={
                        <FilterForm
                            methods={filterMethods}
                            onSubmit={handleFilterSubmit}
                            onReset={handleFilterReset}
                            cols={3}
                        >
                            <FormInput<ExpenseFilterValues>
                                name="search"
                                label="Cari Transaksi"
                                placeholder="Nomor atau nama pengeluaran..."
                            />
                            <FormDatePicker<ExpenseFilterValues>
                                name="date_start"
                                label="Dari Tanggal"
                                placeholder="Tanggal awal"
                            />
                            <FormDatePicker<ExpenseFilterValues>
                                name="date_end"
                                label="Sampai Tanggal"
                                placeholder="Tanggal akhir"
                            />
                            <FormSelect<ExpenseFilterValues>
                                name="expense_category_uid"
                                label="Kategori"
                                options={categoryOptions}
                                placeholder="Semua Kategori"
                            />
                            <FormSelect<ExpenseFilterValues>
                                name="cash_account_uid"
                                label="Sumber Kas"
                                options={accountOptions}
                                placeholder="Semua Akun"
                            />
                        </FilterForm>
                    }
                />

                <UpcomingExpenses onPayCategory={handlePayCategory} />

                <ExpenseDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingExpense={editingExpense}
                />
            </div>
        </FormProvider>
    );
}
