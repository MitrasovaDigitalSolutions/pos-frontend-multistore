export interface ReceiptData {
    sale: any;
    setting: any;
}

const WIDTH = 42;

const line = () => "-".repeat(WIDTH);
const thin = () => "-".repeat(WIDTH);
const TOTAL_COL = 24; // lebar kolom subtotal (kanan)
const PRICE_COL = WIDTH - 2 - TOTAL_COL; // sisa untuk harga

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

const center = (value: string) => {
    const space = Math.max(0, WIDTH - value.length);
    const left = Math.floor(space / 2);
    return " ".repeat(left) + value;
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

const itemLine = (qty: number, name: string, price: number, total: number) => {
    const qtyStr = `${qty}x`;
    const nameStr = name.substring(0, WIDTH - qtyStr.length - 1);
    let txt = `${qtyStr} ${nameStr}\n`;

    const priceStr = padLeft(money(price), PRICE_COL);
    const totalStr = padLeft(money(total), TOTAL_COL);
    txt += " ".repeat(2) + priceStr + totalStr + "\n";

    return txt;
};

export function buildReceipt58(data: ReceiptData) {
    const { sale, setting: app } = data;

    const isDebt = sale.metode_pembayaran === "debt";
    const faktur = isDebt
        ? "FAKTUR KREDIT"
        : "FAKTUR CASH";

    const bayar = isDebt
        ? sale.subtotal - sale.debt_amount
        : sale.nominal_bayar;

    const kembali = isDebt
        ? sale.debt_amount
        : sale.kembalian;

    let txt = "\n\n";

    // ================= HEADER =================
    txt += "\n";
    txt += center(app.app_name ?? "Mitrasova POS") + "\n";
    txt += wrapText(app.app_address ?? "", WIDTH) + "\n";

    if (app.app_phone) {
        txt += `Telp: ${app.app_phone}\n`;
    }

    txt += thin() + "\n";

    txt += `Tgl  : ${formatDate(sale.created_at)}\n`;
    txt += `Kasir: ${sale.user.name}\n`;
    txt += `No   : ${sale.nomor_transaksi}\n`;

    if (sale.member?.nama) {
        txt += `Member: ${sale.member.nama}\n`;
    }

    txt += line() + "\n";

    // ================= ITEMS =================

    sale.items.forEach((item: any) => {
        txt += itemLine(
            Number(item.kuantitas),
            item.nama_produk,
            Number(item.harga_satuan),
            Number(item.subtotal)
        );
    });

    txt += line() + "\n";

    // ================= TOTALS =================

    const fmtTotal = (label: string, value: number) => {
        const val = money(value);
        return label + padLeft(val, WIDTH - label.length) + "\n";
    };

    txt += fmtTotal("Jumlah:", Number(sale.subtotal));
    txt += fmtTotal("Diskon:", Number(sale.diskon ?? 0));

    if (isDebt) {
        const cashAmount = sale.cash_amount ?? sale.cash_received ?? 0;
        const cardAmount = sale.card_amount ?? 0;

        txt += fmtTotal("DP Tunai:", Number(cashAmount));
        if (cardAmount > 0) {
            txt += fmtTotal("DP Transfer:", Number(cardAmount));
            if (sale.nomor_kartu_akhir) {
                const kartu = `${sale.jenis_kartu || "Debit"} ****${sale.nomor_kartu_akhir}`;
                txt += pad(kartu, WIDTH) + "\n";
            }
        }
        txt += fmtTotal("Kurang:", Number(sale.debt_amount ?? 0));
    } else {
        txt += fmtTotal("Tunai:", Number(bayar));
        txt += fmtTotal("Kembali:", Number(kembali));
    }

    txt += line() + "\n";

    // ================= FOOTER =================

    txt += center("Terima kasih") + "\n";
    txt += center("Silahkan datang kembali") + "\n";

    return txt;
}
