"use client";

import { useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useExpenseCategories } from "./api/expenses-api";
import { CategoryList } from "./components/category-list";
import { CategoryDialog } from "./components/category-dialog";
import { expenseCategorySchema, type ExpenseCategoryInput } from "./schemas/expense-schema";
import type { ExpenseCategory } from "./types";

export function ExpenseCategories() {
    const { data: categories = [], isLoading, isFetching } = useExpenseCategories();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

    const dialogMethods = useForm<ExpenseCategoryInput>({
        resolver: zodResolver(expenseCategorySchema) as Resolver<ExpenseCategoryInput>,
        defaultValues: {
            nama: "",
            keterangan: "",
            is_recurring: false,
            hari_jatuh_tempo: null,
        },
    });

    const handleEdit = (category: ExpenseCategory) => {
        setEditingCategory(category);
        dialogMethods.reset({
            nama: category.nama,
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
                    categories={categories}
                    onEdit={handleEdit}
                    onAddClick={handleAddClick}
                    isLoading={isLoading}
                    isFetching={isFetching}
                />

                <CategoryDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingCategory={editingCategory}
                />
            </div>
        </FormProvider>
    );
}
