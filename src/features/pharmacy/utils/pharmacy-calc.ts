/**
 * Pharmacy Compounding Calculation Helpers
 */

/**
 * Automatically calculate dose per package based on quantity and pack count.
 * Example: 5 tabs / 10 packs => "0.5 tab/kemasan"
 * Example: 10 tabs / 10 packs => "1 tab/kemasan"
 */
export function formatDosisKalkulasi(
    kuantitas: number,
    jumlahKemasan: number,
    satuan?: string
): string {
    const safeKemasan = Math.max(1, Number(jumlahKemasan) || 1);
    const safeQty = Math.max(0, Number(kuantitas) || 0);
    const dosisNum = safeQty / safeKemasan;

    // Format to max 2 decimals, trim trailing zeros (e.g. 0.5 instead of 0.50, 1 instead of 1.00)
    const formattedNum = Number(dosisNum.toFixed(2)).toString();
    const unit = satuan || "satuan";
    return `${formattedNum} ${unit}/kemasan`;
}
