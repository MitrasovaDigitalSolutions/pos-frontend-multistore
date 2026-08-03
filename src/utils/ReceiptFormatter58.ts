export interface ReceiptData {
    sale: any;
    setting: any;
}

// ============================================================
// CONSTANTS
// ============================================================

const WIDTH = 42;
const VALUE_COL = 16;
const LABEL_COL = WIDTH - VALUE_COL; // 16


// ============================================================
// PRIMITIVES
// ============================================================

const separator = (char = "-") => char.repeat(WIDTH);

const money = (value: number | string) =>
    new Intl.NumberFormat("id-ID").format(Number(value));

/** Potong / pad kanan sampai `length` karakter */
const pad = (value: string, length: number) =>
    value.length > length
        ? value.substring(0, length)
        : value.padEnd(length, " ");

/** Potong / pad kiri sampai `length` karakter */
const padLeft = (value: string, length: number) =>
    value.length > length
        ? value.substring(0, length)
        : value.padStart(length, " ");

const center = (value: string) => {
    const space = Math.max(0, WIDTH - value.length);
    const left = Math.floor(space / 2);
    return " ".repeat(left) + value;
};

const wrapText = (text: string, width: number): string => {
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

const formatDate = (value?: string | Date | null): string => {
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

// ============================================================
// ROW BUILDERS — semua pakai VALUE_COL agar angka sejajar
// ============================================================

/**
 * Baris item:
 *   Baris 1 → "Nx NamaProduk"
 *   Baris 2 → "  [harga satuan ........] [subtotal .............]"
 *              <- LABEL_COL (18) ->       <- VALUE_COL (24) ->
 */
const itemLine = (qty: number, name: string, price: number, total: number): string => {
    const qtyStr = `${qty}x`;
    const nameStr = name.substring(0, WIDTH - qtyStr.length - 1);
    const priceStr = padLeft(money(price), LABEL_COL - 2); // -2 untuk indent
    const totalStr = padLeft(money(total), VALUE_COL);
    return `${qtyStr} ${nameStr}\n  ${priceStr}${totalStr}\n`;
};

/**
 * Baris total / ringkasan:
 *   "[label ...........] [nilai ................]"
 *   <- LABEL_COL (18) -> <- VALUE_COL (24) ->
 *
 * Label yang lebih panjang dari LABEL_COL akan dipotong.
 */
const fmtTotal = (label: string, value: number): string => {
    const labelStr = pad(label, LABEL_COL);
    const valStr = padLeft(money(value), VALUE_COL);
    return `${labelStr}${valStr}\n`;
};

// ============================================================
// MAIN BUILDER
// ============================================================

export function buildReceipt58(data: ReceiptData): string {
    const { sale, setting: app } = data

    const isDebt = sale.metode_pembayaran === "debt"

    const bayar = isDebt
        ? (sale.cash_amount ?? sale.cash_received ?? 0)
        : sale.nominal_bayar

    const kembali = isDebt
        ? (sale.debt_amount ?? 0)
        : sale.kembalian

    const lines: string[] = []

    // ── HEADER ──────────────────────────────────────────────
    lines.push("")
    lines.push(center(app.app_name ?? "Mitrasova POS"))

    if (app.app_address) {
        lines.push(center(app.app_address))
    }

    if (app.app_phone) {
        lines.push(center(`Telp: ${app.app_phone}`))
    }

    lines.push(separator())

    lines.push(`Tgl  : ${formatDate(sale.created_at)}`)
    lines.push(`Kasir: ${sale.user.name}`)
    lines.push(`No   : ${sale.nomor_transaksi}`)

    if (sale.member?.nama) {
        lines.push(`Member: ${sale.member.nama}`)
    }

    lines.push(separator())

    // ── ITEMS ────────────────────────────────────────────────
    sale.items.forEach((item: any) => {
        lines.push(
            itemLine(
                Number(item.kuantitas),
                item.nama_produk,
                Number(item.harga_satuan),
                Number(item.subtotal)
            ).trimEnd()
        )
    })

    lines.push(separator())

    // ── TOTALS ───────────────────────────────────────────────
    lines.push(fmtTotal("Jumlah:", Number(sale.subtotal)).trimEnd())
    lines.push(fmtTotal("Diskon:", Number(sale.diskon ?? 0)).trimEnd())
    lines.push(fmtTotal("Pajak (PPN 11%):", Number(sale.pajak ?? 0)).trimEnd())

    if (isDebt) {
        const cashAmount = sale.cash_amount ?? sale.cash_received ?? 0
        const cardAmount = sale.card_amount ?? 0

        lines.push(fmtTotal("DP Tunai:", Number(cashAmount)).trimEnd())

        if (cardAmount > 0) {
            lines.push(fmtTotal("DP Transfer:", Number(cardAmount)).trimEnd())

            if (sale.nomor_kartu_akhir) {
                lines.push(
                    pad(
                        `${sale.jenis_kartu ?? "Debit"} ****${sale.nomor_kartu_akhir}`,
                        WIDTH
                    )
                )
            }
        }

        lines.push(fmtTotal("Kurang:", Number(sale.debt_amount ?? 0)).trimEnd())
    } else {
        lines.push(fmtTotal("Tunai:", Number(bayar)).trimEnd())
        lines.push(fmtTotal("Kembali:", Number(kembali)).trimEnd())
    }

    lines.push(separator())

    // ── FOOTER ───────────────────────────────────────────────
    lines.push(center("Terima kasih"))
    lines.push(center("Silahkan datang kembali"))

    return "\n" + lines.join("\n")
}