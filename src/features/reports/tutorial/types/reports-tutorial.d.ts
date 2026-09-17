export type ReportsTutorialId =
    | "jelajah_laba_rugi"
    | "jelajah_penjualan"
    | "jelajah_kategori"
    | "jelajah_pembelian"
    | "jelajah_pengeluaran";

export type ReportsTutorialSimulateClick = { selector: string } | string;

export interface ReportsTutorialStep {
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
    simulateClick?: ReportsTutorialSimulateClick;
    navigate?: string;
    overlayNav?: boolean;
    waitForElement?: string;
    variant?: "tooltip" | "overlay_nav" | "banner";
    skipScroll?: boolean;
    /** Paksa switch tertentu aktif saat step ini tampil (mis. Switch detail barang). */
    ensureSwitchOn?: string;
}

export interface ReportsTutorialMeta {
    id: ReportsTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
