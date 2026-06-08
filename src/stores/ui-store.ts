import { create } from "zustand";

// ─── UI Store ───────────────────────────────────────────────────────────────
// Manages global modal/dialog states to avoid prop drilling.

interface UIState {
    // Confirm dialog
    confirmDialog: {
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: (() => void) | null;
        variant: "default" | "destructive";
    };
    openConfirmDialog: (params: {
        title: string;
        description: string;
        onConfirm: () => void;
        variant?: "default" | "destructive";
    }) => void;
    closeConfirmDialog: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
    confirmDialog: {
        isOpen: false,
        title: "",
        description: "",
        onConfirm: null,
        variant: "default",
    },

    openConfirmDialog: ({
        title,
        description,
        onConfirm,
        variant = "destructive",
    }) =>
        set({
            confirmDialog: {
                isOpen: true,
                title,
                description,
                onConfirm,
                variant,
            },
        }),

    closeConfirmDialog: () =>
        set((state) => ({
            confirmDialog: {
                ...state.confirmDialog,
                isOpen: false,
                onConfirm: null,
            },
        })),
}));
