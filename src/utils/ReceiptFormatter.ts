export interface ReceiptData {
    sale: any;
    setting: any;
}

const WIDTH = 80;

const line = () => "-".repeat(WIDTH);

const money = (value: number | string) =>
    new Intl.NumberFormat("id-ID").format(Number(value));

const pad = (value: string, length: number) =>
    value.length > length
        ? value.substring(0, length)
        : value.padEnd(length, " ");

const padLeft = (value: string, length: number) =>
    value.length > length
        ? value.substring(0, length)
        : value.padStart(length, " ");

const leftRight = (left: string, right: string) => {
    const space = Math.max(1, WIDTH - left.length - right.length);
    return left + " ".repeat(space) + right;
};

const rightTotal = (label: string, value: number | string) => {
    const text =
        `${label.padEnd(10)}Rp. ${money(value).padStart(15)}`;

    return text.padStart(WIDTH);
};

const formatDate = (value?: string | Date | null) => {
    if (!value) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(value));
};

export function buildReceipt(data: ReceiptData) {
    const { sale, setting: app } = data;

    const isDebt = sale.metode_pembayaran === "debt";

    const faktur = isDebt
        ? "FAKTUR PENJUALAN KREDIT"
        : "FAKTUR PENJUALAN CASH";

    const bayar = isDebt
        ? sale.subtotal - sale.debt_amount
        : sale.nominal_bayar;

    const kembali = isDebt
        ? sale.debt_amount
        : sale.kembalian;

    let txt = "";

    // ================= HEADER =================

    txt += leftRight(app.app_name ?? "", faktur) + "\n";
    txt += (app.app_address ?? "") + "\n";

    if (app.app_phone) {
        txt += `Telp : ${app.app_phone}\n`;
    }

    txt += "\n";

    txt += leftRight(
        `Tanggal : ${formatDate(sale.created_at)}`,
        "Kepada Yth."
    ) + "\n";

    txt += leftRight(
        `Kasir   : ${sale.user.name}`,
        sale.member?.nama ?? "-"
    ) + "\n";

    txt += `No. Trx : ${sale.nomor_transaksi} - ${sale.nama_transaksi}\n`;

    txt += line() + "\n";
    txt += line() + "\n";

    // ================= TABLE HEADER =================

    txt +=
        pad("QTY", 5) +
        pad("Sat", 5) +
        pad("Kode/Nama Barang", 35) +
        padLeft("Harga", 15) +
        padLeft("Subtotal", 20) +
        "\n";

    txt += line() + "\n";

    // ================= ITEMS =================

    sale.items.forEach((item: any) => {
        txt +=
            pad(String(item.kuantitas), 5) +
            pad("PCS", 5) +
            pad(item.nama_produk, 35) +
            padLeft(money(item.harga_satuan), 15) +
            padLeft(money(item.subtotal), 20) +
            "\n";
    });

    txt += line() + "\n";

    // ================= FOOTER =================

    txt += "Terima kasih !!! Telah Percaya pada kami\n";
    txt += "Silahkan Datang Kembali\n\n";

    txt += rightTotal("Jumlah :", sale.subtotal) + "\n";
    txt += rightTotal("Diskon :", sale.diskon ?? 0) + "\n";
    txt += rightTotal(
        isDebt ? "Bayar :" : "Tunai :",
        bayar
    ) + "\n";
    txt += rightTotal(
        isDebt ? "Kurang :" : "Kembali :",
        kembali
    ) + "\n";

    txt += line() + "\n";

    return txt;
}