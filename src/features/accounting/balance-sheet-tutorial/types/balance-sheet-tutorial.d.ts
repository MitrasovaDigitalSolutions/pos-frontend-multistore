export type BalanceSheetTutorialId = "jelajah_neraca" | "mode_laporan";

export type BalanceSheetTutorialSimulateClick = { selector: string } | string;

export interface BalanceSheetTutorialStep {
    id?: string;
    target: string;
    fallbackTarget?: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto";
    showNext?: boolean;
    showBack?: boolean;
    isLastStep?: boolean;
    nextLabel?: string;
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    simulateClick?: BalanceSheetTutorialSimulateClick;
    navigate?: string;
    overlayNav?: boolean;
    waitForElement?: string;
    variant?: "tooltip" | "overlay_nav" | "banner";
    skipScroll?: boolean;
    /** Paksa sakelar "Detail D/K" (kolom Debit & Kredit) aktif saat step ini tampil. */
    ensureDkOn?: boolean;
    /** Paksa baris rincian kategori (tombol Detail) terbuka agar spotlight `.neraca-detail-btn` selalu ada. */
    ensureDetailOpen?: boolean;
}

export interface BalanceSheetTutorialMeta {
    id: BalanceSheetTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
