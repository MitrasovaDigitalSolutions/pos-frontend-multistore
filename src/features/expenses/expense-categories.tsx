"use client";

import { useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useExpenseCategories } from "./api/expenses-api";
import { CategoryList } from "./components/category-list";
import { CategoryDialog } from "./components/category-dialog";
import { expenseCategorySchema, type ExpenseCategoryInput } from "./schemas/expense-schema";
import type { ExpenseCategory } from "./types";
import { ExpensesTutorialController } from "./tutorial/components/expenses-tutorial-controller";
import { MOCK_CATEGORIES } from "./tutorial/constants/expenses-tutorial-constants";
import { useExpensesTutorialStore } from "@/stores/expenses-tutorial-store";

export function ExpenseCategories() {
    const { data: categories = [], isLoading, isFetching } = useExpenseCategories();

    const isTutorialRunning = useExpensesTutorialStore((state) => state.isRunning);

    // Saat tutorial berjalan, pakai data contoh agar walkthrough selalu utuh.
    const activeCategories = isTutorialRunning ? MOCK_CATEGORIES : categories;
    const isLoadingActive = isLoading && !isTutorialRunning;
    const isFetchingActive = isFetching && !isTutorialRunning;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

    const dialogMethods = useForm<ExpenseCategoryInput>({
        resolver: zodResolver(expenseCategorySchema) as Resolver<ExpenseCategoryInput>,
        defaultValues: {
            nama: "",
            chart_of_account_uid: "",
            keterangan: "",
            is_recurring: false,
            hari_jatuh_tempo: null,
        },
    });

    const handleEdit = (category: ExpenseCategory) => {
        setEditingCategory(category);
        dialogMethods.reset({
            nama: category.nama,
            chart_of_account_uid: category.chart_of_account_uid || "",
            keterangan: category.keterangan || "",
            is_recurring: !!category.is_recurring,
            hari_jatuh_tempo: category.hari_jatuh_tempo ? Number(category.hari_jatuh_tempo) : null,
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingCategory(null);
        dialogMethods.reset({
            nama: "",
            chart_of_account_uid: "",
            keterangan: "",
            is_recurring: false,
            hari_jatuh_tempo: null,
        });
        setIsDialogOpen(true);
    };

    return (
        <FormProvider {...dialogMethods}>
            <div className="space-y-6">
                <CategoryList
                    categories={activeCategories}
                    onEdit={handleEdit}
                    onAddClick={handleAddClick}
                    isLoading={isLoadingActive}
                    isFetching={isFetchingActive}
                />

                <CategoryDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingCategory={editingCategory}
                />

                <ExpensesTutorialController />
            </div>
        </FormProvider>
    );
}
