/**
 * Currency formatter for Indonesian Rupiah.
 * Extracted from duplicated formatRupiah functions in admin and checkout pages.
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    })
        .format(amount || 0)
        .replace(/,00$/, "");
}
