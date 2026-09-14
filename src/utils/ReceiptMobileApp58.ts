export interface ReceiptRawItem {
    nama_produk?: string;
    kuantitas?: number;
    harga_satuan?: number;
    harga_grosir?: number | null;
    min_qty_grosir?: number | null;
    diskon_item?: number | null;
    [key: string]: unknown;
}

export interface ReceiptData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sale: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setting: Record<string, any>;
}

const WIDTH = 32;

const money = (value: number | string) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDate = (
    value?: string | Date | null,
): string => {
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

const center = (
    text: string,
    width = WIDTH,
): string => {
    if (text.length >= width) {
        return text.substring(0, width);
    }

    const left = Math.floor(
        (width - text.length) / 2,
    );

    return " ".repeat(left) + text;
};

const leftRight = (
    left: string,
    right: string,
    width = WIDTH,
): string => {
    const available =
        width - left.length - right.length;

    if (available < 1) {
        return (
            left.substring(
                0,
                Math.max(0, width - right.length - 1),
            ) +
            " " +
            right
        ).substring(0, width);
    }

    return (
        left +
        " ".repeat(available) +
        right
    );
};

const wrapText = (
    text: string,
    width = WIDTH,
): string[] => {
    const words = String(text || "").split(/\s+/);

    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        if (!word) continue;

        if (!current) {
            current = word;
            continue;
        }

        if (
            current.length + 1 + word.length <=
            width
        ) {
            current += ` ${word}`;
        } else {
            lines.push(current);
            current = word;
        }
    }

    if (current) {
        lines.push(current);
    }

    return lines;
};

const divider = (
    char = "-",
): string => char.repeat(WIDTH);

export function buildReceiptMobileApp58(
    data: ReceiptData,
): string {
    const { sale, setting: app } = data;

    const isDebt =
        sale.metode_pembayaran === "debt";

    const isOffline =
        String(sale.uid).startsWith(
            "OFFLINE-",
        );

    const hasCardDp =
        isDebt &&
        (sale.card_amount ?? 0) > 0;

    const items =
        ((sale.items as ReceiptRawItem[]) || []);

    const lines: string[] = [];

    // =========================
    // HEADER
    // =========================

    lines.push(
        center(
            String(
                app.app_name ??
                    "Mitrasova POS",
            ).toUpperCase(),
        ),
    );

    if (app.app_address) {
        lines.push(
            ...wrapText(
                String(app.app_address),
            ).map(center),
        );
    }

    if (app.app_phone) {
        lines.push(
            center(
                `TELP: ${app.app_phone}`,
            ),
        );
    }

    lines.push(divider());

    // =========================
    // OFFLINE
    // =========================

    if (isOffline) {
        lines.push(
            center(
                "*** OFFLINE DRAFT ***",
            ),
        );

        lines.push(
            center(
                "BELUM DISINKRONISASI",
            ),
        );

        lines.push(divider());
    }

    // =========================
    // TRANSACTION
    // =========================

    lines.push(
        leftRight(
            `Kasir: ${sale.user?.name ?? "-"}`,
            "POS-01",
        ),
    );

    lines.push(
        leftRight(
            String(
                sale.nomor_transaksi ??
                    "-",
            ),
            formatDate(
                sale.created_at,
            ),
        ),
    );

    if (sale.member?.nama) {
        lines.push(
            leftRight(
                "Member:",
                String(
                    sale.member.nama,
                ),
            ),
        );

        if (sale.member.kode) {
            lines.push(
                leftRight(
                    "Kode:",
                    String(
                        sale.member.kode,
                    ),
                ),
            );
        }
    }

    lines.push(divider());

    // =========================
    // ITEMS
    // =========================

    for (const item of items) {
        const qty = Number(
            item.kuantitas || 0,
        );

        const price = Number(
            item.harga_satuan || 0,
        );

        const productName =
            String(
                item.nama_produk ??
                    "-",
            );

        lines.push(
            ...wrapText(
                productName,
            ),
        );

        lines.push(
            leftRight(
                `${qty} x ${money(price)}`,
                money(qty * price),
            ),
        );

        if (
            item.diskon_item &&
            item.diskon_item > 0
        ) {
            lines.push(
                leftRight(
                    "*Potongan Grosir:",
                    `-${money(
                        item.diskon_item,
                    )}`,
                ),
            );
        }

        lines.push("");
    }

    lines.push(divider());

    // =========================
    // TOTAL
    // =========================

    lines.push(
        leftRight(
            "Subtotal:",
            money(sale.subtotal ?? 0),
        ),
    );

    if ((sale.diskon ?? 0) > 0) {
        lines.push(
            leftRight(
                "Diskon:",
                `-${money(
                    sale.diskon,
                )}`,
            ),
        );
    }

    if (
        (sale.diskon_grosir ?? 0) > 0
    ) {
        lines.push(
            leftRight(
                "Diskon Grosir:",
                `-${money(
                    sale.diskon_grosir,
                )}`,
            ),
        );
    }

    if ((sale.pajak ?? 0) > 0) {
        lines.push(
            leftRight(
                "Pajak:",
                money(sale.pajak),
            ),
        );
    }

    lines.push(
        leftRight(
            "TOTAL:",
            money(sale.total ?? 0),
        ),
    );

    lines.push(divider());

    // =========================
    // PAYMENT
    // =========================

    if (isDebt) {
        lines.push(
            leftRight(
                "DP Tunai:",
                money(
                    sale.cash_amount ??
                        sale.cash_received ??
                        0,
                ),
            ),
        );

        if (hasCardDp) {
            lines.push(
                leftRight(
                    "DP Transfer:",
                    money(
                        sale.card_amount,
                    ),
                ),
            );

            lines.push(
                leftRight(
                    "Kartu:",
                    String(
                        sale.jenis_kartu ??
                            "Debit",
                    ).toUpperCase(),
                ),
            );

            lines.push(
                leftRight(
                    "No Kartu:",
                    `**** ${
                        sale.nomor_kartu_akhir ??
                        "0000"
                    }`,
                ),
            );
        }

        lines.push(
            leftRight(
                "Hutang Baru:",
                money(
                    sale.debt_amount ?? 0,
                ),
            ),
        );
    } else if (
        sale.metode_pembayaran ===
        "cash"
    ) {
        lines.push(
            leftRight(
                "Tunai:",
                money(
                    sale.nominal_bayar ??
                        0,
                ),
            ),
        );

        lines.push(
            leftRight(
                "Kembali:",
                money(
                    sale.kembalian ?? 0,
                ),
            ),
        );
    } else {
        lines.push(
            leftRight(
                `Kartu ${
                    sale.jenis_kartu ?? ""
                }:`,
                `**** ${
                    sale.nomor_kartu_akhir ??
                    ""
                }`,
            ),
        );
    }

    lines.push(divider());

    // =========================
    // FOOTER
    // =========================

    lines.push(
        center(
            "Terima Kasih Atas",
        ),
    );

    lines.push(
        center(
            "Kunjungan Anda",
        ),
    );

    lines.push(
        center(
            "Barang yang sudah dibeli",
        ),
    );

    lines.push(
        center(
            "tidak dapat ditukar/dikembalikan",
        ),
    );

    return lines.join("\n");
}