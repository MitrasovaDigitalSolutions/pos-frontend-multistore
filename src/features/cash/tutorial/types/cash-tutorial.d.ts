export type CashTutorialId =
    | "jelajah_kas"
    | "tambah_akun_kas"
    | "mutasi_kas"
    | "transfer_kas"
    | "kelola_akun_kas";

export type CashTutorialSimulateClick = { selector: string } | string;

export interface CashTutorialStep {
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
    simulateClick?: CashTutorialSimulateClick;
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

export interface CashTutorialMeta {
    id: CashTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
