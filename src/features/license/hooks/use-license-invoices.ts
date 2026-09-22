import { useMemo, useState } from "react";
import type { Invoice } from "../types";
import { licenseApi } from "../api/license-api";
import { toast } from "sonner";

export interface InvoiceFinancialStats {
    totalPaid: number;
    totalUnpaid: number;
    paidCount: number;
    unpaidCount: number;
}

export function useLicenseInvoices(invoices: Invoice[]) {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // Download PDF invoice
    const handleDownloadPdf = async (invoiceNumber: string) => {
        setDownloadingId(invoiceNumber);
        try {
            await licenseApi.downloadInvoicePdf(invoiceNumber);
        } catch {
            toast.error("Gagal mengunduh faktur invoice PDF.");
        } finally {
            setDownloadingId(null);
        }
    };

    // Aggregate financial statistics
    const stats = useMemo<InvoiceFinancialStats>(() => {
        let totalPaid = 0;
        let totalUnpaid = 0;
        let paidCount = 0;
        let unpaidCount = 0;

        invoices.forEach((inv) => {
            const amount = inv.total_amount ?? inv.amount ?? 0;
            if (inv.status === "paid") {
                totalPaid += amount;
                paidCount++;
            } else if (inv.status === "unpaid") {
                totalUnpaid += amount;
                unpaidCount++;
            }
        });

        return { totalPaid, totalUnpaid, paidCount, unpaidCount };
    }, [invoices]);

    return {
        stats,
        selectedInvoice,
        setSelectedInvoice,
        downloadingId,
        handleDownloadPdf,
    };
}
