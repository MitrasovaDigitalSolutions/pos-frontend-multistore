export interface ReceiptData {
    sale: any;
    setting: any;
}

const WIDTH = 80;
const LEFT_WIDTH = 38;
const RIGHT_WIDTH = WIDTH - LEFT_WIDTH;

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

const wrapText = (text: string, width: number) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const next = current ? `${current} ${word}` : word;

        if (next.length <= width) {
            current = next;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }

    if (current) lines.push(current);

    return lines.join("\n");
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

const footerLine = (
    left: string,
    label: string,
    value: number | string
) => {
    const leftText = pad(left, LEFT_WIDTH);

    const rightText =
        `${label.padEnd(10)}Rp. ${money(value).padStart(15)}`;

    return leftText + rightText.padStart(RIGHT_WIDTH);
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
    txt += wrapText(app.app_address ?? "", 60) + "\n";

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

    txt += leftRight(
        `No. TRX : ${sale.nomor_transaksi}`,
        sale.nama_transaksi ?? "-"
    ) + "\n";


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

    txt += footerLine("Terima kasih atas kepercayaan Anda.","Jumlah  :",sale.subtotal) + "\n";
    txt += footerLine("Silahkan Datang Kembali.","Diskon  :",sale.diskon ?? 0 ) + "\n";
    
    if (isDebt) {
        const cashAmount = sale.cash_amount ?? sale.cash_received ?? 0;
        const cardAmount = sale.card_amount ?? 0;
        
        if (cardAmount > 0) {
            txt += footerLine("", "DP Tunai:", cashAmount) + "\n";
            txt += footerLine("", "DP Transfer:", cardAmount) + "\n";
            if (sale.nomor_kartu_akhir) {
                txt += padLeft(`Kartu: ${sale.jenis_kartu || "Debit"} (**** ${sale.nomor_kartu_akhir})`, WIDTH) + "\n";
            }
        } else {
            txt += footerLine("", "DP Tunai:", cashAmount) + "\n";
        }
        txt += footerLine("", "Kurang  :", sale.debt_amount ?? 0) + "\n";
    } else {
        txt += footerLine("", "Tunai   :", bayar) + "\n";
        txt += footerLine("", "Kembali :", kembali) + "\n";
    }

    return txt;
}