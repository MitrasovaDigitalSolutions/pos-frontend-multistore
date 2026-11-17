/**
 * Printer Store — client-side only (localStorage).
 *
 * Menyimpan konfigurasi printer per-device kasir secara lokal.
 * Tidak dikirim ke server karena printer bersifat lokal per-terminal.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

const PRINTER_STORAGE_KEY = "pos_printer_config";

interface PrinterState {
    /** ID / nama printer yang dipilih kasir di terminal ini */
    printerId: string;
    setPrinterId: (id: string) => void;
    clearPrinterId: () => void;
}

export const usePrinterStore = create<PrinterState>()(
    persist(
        (set) => ({
            printerId: "",
            setPrinterId: (id) => set({ printerId: id }),
            clearPrinterId: () => set({ printerId: "" }),
        }),
        {
            name: PRINTER_STORAGE_KEY,
        }
    )
);
