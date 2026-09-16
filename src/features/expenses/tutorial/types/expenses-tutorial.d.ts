export type ExpensesTutorialId =
    | "jelajah_pengeluaran"
    | "catat_pengeluaran"
    | "edit_pengeluaran"
    | "kelola_kategori";

export type ExpensesTutorialSimulateClick = { selector: string } | string;

export interface ExpensesTutorialStep {
    id?: string;
    target: string;
    fallbackTarget?: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    showNext?: boolean;
    showBack?: boolean;
    isLastStep?: boolean;
    nextLabel?: string;
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    simulateClick?: ExpensesTutorialSimulateClick;
    navigate?: string;
    overlayNav?: boolean;
    waitForElement?: string;
    variant?: "tooltip" | "overlay_nav" | "banner";
    skipScroll?: boolean;
    /** Paksa sakelar/select tertentu aktif saat step ini tampil. */
    ensureSwitchOn?: string;
    /** Tutup dialog yang sedang terbuka saat step ini tampil (mis. kembali ke daftar). */
    closeDialog?: string;
}

export interface ExpensesTutorialMeta {
    id: ExpensesTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
