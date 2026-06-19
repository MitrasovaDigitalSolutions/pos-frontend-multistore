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

interface ExpenseFilterValues {
    search: string;
    expense_category_id: string;
    cash_account_id: string;
    date_start: string;
    date_end: string;
}

export function Expenses() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        expense_category_id?: number;
        cash_account_id?: number;
        date_start?: string;
        date_end?: string;
    }>({});

    const { data: categories = [] } = useExpenseCategories();
    const { data: cashAccounts = [] } = useCashAccounts();

    const filterMethods = useForm<ExpenseFilterValues>({
        defaultValues: {
            search: "",
            expense_category_id: "all",
            cash_account_id: "all",
            date_start: "",
            date_end: "",
        },
    });

    const handleFilterSubmit = (data: ExpenseFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            expense_category_id: data.expense_category_id !== "all" ? Number(data.expense_category_id) : undefined,
            cash_account_id: data.cash_account_id !== "all" ? Number(data.cash_account_id) : undefined,
            date_start: data.date_start || undefined,
            date_end: data.date_end || undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            expense_category_id: "all",
            cash_account_id: "all",
            date_start: "",
            date_end: "",
        });
        setAppliedFilters({});
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
            expense_category_id: 0,
            cash_account_id: 0,
            amount: 0,
            nama: "",
            catatan: "",
            tanggal: new Date().toISOString().split("T")[0],
        },
    });

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        dialogMethods.reset({
            expense_category_id: expense.expense_category_id,
            cash_account_id: expense.cash_account_id,
            amount: expense.amount,
            nama: expense.nama || "",
            catatan: expense.catatan || "",
            tanggal: expense.tanggal || new Date().toISOString().split("T")[0],
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingExpense(null);
        dialogMethods.reset({
            expense_category_id: 0,
            cash_account_id: 0,
            amount: 0,
            nama: "",
            catatan: "",
            tanggal: new Date().toISOString().split("T")[0],
        });
        setIsDialogOpen(true);
    };

    // Quick payment trigger from Upcoming dues sidebar
    const handlePayCategory = (catId: number, catName: string) => {
        setEditingExpense(null);
        dialogMethods.reset({
            expense_category_id: catId,
            cash_account_id: 0,
            amount: 0,
            nama: `Pembayaran ${catName}`,
            catatan: "",
            tanggal: new Date().toISOString().split("T")[0],
        });
        setIsDialogOpen(true);
    };

    const categoryOptions = [
        { value: "all", label: "Semua Kategori" },
        ...categories.map((c) => ({ value: String(c.id), label: c.nama })),
    ];

    const accountOptions = [
        { value: "all", label: "Semua Akun" },
        ...cashAccounts.map((a) => ({ value: String(a.id), label: a.nama })),
    ];

    return (
        <FormProvider {...dialogMethods}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-8">
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
                                    name="expense_category_id"
                                    label="Kategori"
                                    options={categoryOptions}
                                    placeholder="Semua Kategori"
                                />
                                <FormSelect<ExpenseFilterValues>
                                    name="cash_account_id"
                                    label="Sumber Kas"
                                    options={accountOptions}
                                    placeholder="Semua Akun"
                                />
                            </FilterForm>
                        }
                    />
                </div>

                <div className="xl:col-span-4">
                    <UpcomingExpenses onPayCategory={handlePayCategory} />
                </div>

                <ExpenseDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingExpense={editingExpense}
                />
            </div>
        </FormProvider>
    );
}
