export type HutangTutorialId =
    | "jelajah_hutang_member"
    | "jelajah_hutang_sales"
    | "jelajah_hutang_supplier"
    | "jelajah_pembayaran_member";

export type HutangTutorialSimulateClick = { selector: string } | string;

export interface HutangTutorialStep {
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
    simulateClick?: HutangTutorialSimulateClick;
    navigate?: string;
    overlayNav?: boolean;
    waitForElement?: string;
    variant?: "tooltip" | "overlay_nav" | "banner";
    skipScroll?: boolean;
    /** Paksa switch tertentu aktif saat step ini tampil (mis. Switch detail barang). */
    ensureSwitchOn?: string;
    /** Tutup dialog yang sedang terbuka saat step ini tampil (mis. kembali ke daftar). */
    closeDialog?: string;
}

export interface HutangTutorialMeta {
    id: HutangTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
