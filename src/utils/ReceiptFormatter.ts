export interface ReceiptData {
    sale: any;
    setting: any;
}

const WIDTH = 80;

const line = () => "-".repeat(WIDTH);

const money = (n: number | string) =>
    new Intl.NumberFormat("id-ID").format(Number(n));

const center = (text: string) => {
    const left = Math.max(0, Math.floor((WIDTH - text.length) / 2));
    return " ".repeat(left) + text;
};

const leftRight = (left: string, right: string) => {
    const space = WIDTH - left.length - right.length;
    return left + " ".repeat(Math.max(1, space)) + right;
};

const pad = (value: string, len: number) =>
    value.length > len
        ? value.substring(0, len)
        : value.padEnd(len, " ");

const padLeft = (value: string, len: number) =>
    value.length > len
        ? value.substring(0, len)
        : value.padStart(len, " ");

export function buildReceipt(data: ReceiptData) {

    const sale = data.sale;
    const app = data.setting;

    let txt = "";

    // ===============================
    // HEADER
    // ===============================

    txt += leftRight(
        app.app_name ?? "",
        "FAKTUR PENJUALAN KREDIT"
    ) + "\n";

    txt += (app.app_address ?? "") + "\n";

    if (app.app_phone) {
        txt += "Telp : " + app.app_phone + "\n";
    }

    txt += "\n";

    txt += leftRight(
        "Tanggal : " + sale.created_at,
        "Kepada Yth."
    ) + "\n";

    txt += leftRight(
        "Kasir   : " + sale.user.name,
        sale.member?.nama ?? "-"
    ) + "\n";

    txt += "No.Trx  : " + sale.nomor_transaksi + "\n";

    txt += line() + "\n";

    // ===============================
    // TABLE HEADER
    // ===============================

    txt +=
        pad("QTY", 5) +
        pad("SAT", 5) +
        pad("KODE / NAMA BARANG", 35) +
        padLeft("HARGA", 15) +
        padLeft("SUBTOTAL", 20) +
        "\n";

    txt += line() + "\n";

    // ===============================
    // ITEMS
    // ===============================

    sale.items.forEach((item: any) => {

        txt +=
            pad(item.kuantitas.toString(), 5) +
            pad("PCS", 5) +
            pad(item.nama_produk, 35) +
            padLeft(money(item.harga_satuan), 15) +
            padLeft(money(item.subtotal), 20) +
            "\n";

    });

    txt += line() + "\n";

    // ===============================
    // FOOTER
    // ===============================

    const total = money(sale.subtotal);

    const diskon = money(sale.diskon ?? 0);

    const bayar =
        sale.metode_pembayaran === "debt"
            ? sale.subtotal - sale.debt_amount
            : sale.nominal_bayar;

    const kembali =
        sale.metode_pembayaran === "debt"
            ? sale.debt_amount
            : sale.kembalian;

    txt += leftRight(
        "Terima kasih telah berbelanja",
        "Jumlah : " + total
    ) + "\n";

    txt += leftRight(
        "Silakan datang kembali",
        "Diskon : " + diskon
    ) + "\n";

    txt += leftRight(
        "",
        (
            sale.metode_pembayaran === "debt"
                ? "Bayar  : "
                : "Tunai  : "
        ) + money(bayar)
    ) + "\n";

    txt += leftRight(
        "",
        (
            sale.metode_pembayaran === "debt"
                ? "Kurang : "
                : "Kembali: "
        ) + money(kembali)
    ) + "\n";

    txt += line() + "\n";

    txt += "\n";
    txt += center("=== TERIMA KASIH ===") + "\n";
    txt += center("Silakan Datang Kembali") + "\n";

    txt += "\n\n\n";

    return txt;
}