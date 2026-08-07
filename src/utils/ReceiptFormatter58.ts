export interface ReceiptData {
    sale: any;
    setting: any;
}

const money = (value: number | string) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(value || 0));

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

export function buildReceipt58(data: ReceiptData): string {
    const { sale, setting: app } = data;

    const isDebt = sale.metode_pembayaran === "debt";
    const isOffline = String(sale.uid).startsWith("OFFLINE-");
    const hasCardDp = isDebt && (sale.card_amount ?? 0) > 0;

    const items = (sale.items || []).map((item: any) => {
        const qty = Number(item.kuantitas);
        const normalPrice = item.harga_satuan;
        const hGrosir = item.harga_grosir;
        const minQty = item.min_qty_grosir;

        const isWholesaleActive =
            hGrosir !== null &&
            hGrosir !== undefined &&
            hGrosir > 0 &&
            minQty !== null &&
            minQty !== undefined &&
            minQty > 0 &&
            qty >= minQty;

        console.log(isWholesaleActive)

        const wholesaleQty = isWholesaleActive ? Math.floor(qty / minQty!) * minQty : 0;
        const normalQty = qty - wholesaleQty;
        const totalSavings = isWholesaleActive
            ? Math.max(0, qty * normalPrice - (wholesaleQty * hGrosir + normalQty * normalPrice))
            : 0;

        return { ...item, qty, isWholesaleActive, wholesaleQty, totalSavings };
    });

    return `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>

<style>
*{
    box-sizing:border-box;
}

@page {
    size : 48mm auto;
}

body{
    width:48mm;
    margin:0;
    padding:2px;
    font-family: tahoma;
    font-size:9px;
    line-height:1.35;
    color:#000;
    background:#fff;
}

.header{
    text-align:center;
    margin-bottom:4px;
}

.title{
    font-weight:bold;
    font-size:11px;
    letter-spacing:1px;
    text-transform:uppercase;
}

hr{
    border:none;
    border-top:1px dashed #000;
    margin:4px 0;
}

.row{
    display:flex;
    justify-content:space-between;
    margin:1px 0;
}

.trx {
    font-size: 9px;
    white-space: nowrap;
}

.product-name {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    max-height: calc(1.3em * 2);
    word-break: break-word;
}

.date {
    font-size: 9px;
    white-space: nowrap;
}

.banner{
    text-align:center;
    font-weight:bold;
    border:1px solid #000;
    padding:3px;
    margin:4px 0;
    text-transform:uppercase;
}

.item{
    margin-bottom:4px;
}

.item-detail{
    display:flex;
    justify-content:space-between;
    padding-left:6px;
}

.total-row{
    display:flex;
    justify-content:space-between;
    margin:1px 0;
}

.grand-total{
    display:flex;
    justify-content:space-between;
    font-weight:bold;
    font-size:10px;
    padding-top:2px;
    border-top:1px dotted #000;
}

.card-note{
    display:flex;
    justify-content:space-between;
    font-size:8px;
    padding-left:6px;
    color:#555;
}

.footer{
    margin-top:6px;
    text-align:center;
}
</style>
</head>

<body>

<div class="header">
    <div style="height:12px;"></div>
    <div class="title">${app.app_name ?? "Mitrasova POS"}</div>

    ${
        app.app_address
            ? `<div>${app.app_address}</div>`
            : ""
    }

    ${
        app.app_phone
            ? `<div style="font-weight:bold">TELP: ${app.app_phone}</div>`
            : ""
    }
</div>

<hr/>

${
    isOffline
        ? `
<div class="banner">
    *** OFFLINE DRAFT ***<br/>
    BELUM DISINKRONISASI
</div>`
        : ""
}

<div class="row">
    <span>Kasir: ${sale.user?.name ?? "-"}</span>
    <span>POS-01</span>
</div>

<div class="row">
    <span class="trx">${sale.nomor_transaksi}</span>
    <span class="date">${formatDate(sale.created_at)}</span>
</div>

${
    sale.member?.nama
        ? `
<div class="row" style="font-weight:bold">
    <span>Member:</span>
    <span>${sale.member.nama} (${sale.member.kode ?? ""})</span>
</div>`
        : ""
}

<hr/>

${items.map((item: any) => `
<div class="item">
    <div class="product-name">
        ${item.nama_produk}
    </div>

    <div class="item-detail">
        <span style="padding-left:20px"><b>${item.qty} x </b> ${money(item.harga_satuan)}</span>
        <span>${money(item.qty * item.harga_satuan)}</span>
    </div>

    ${
        item.diskon_item && item.diskon_item > 0
            ? `
    <div class="item-detail" style="font-weight:bold">
        <span>*Potongan Grosir :</span>
        <span>-${money(item.diskon_item)}</span>
    </div>`
            : ""
    }
</div>
`).join("")}

<hr/>

<div class="total-row">
    <span>Subtotal:</span>
    <span>${money(sale.subtotal ?? 0)}</span>
</div>

${
    (sale.diskon ?? 0) > 0
        ? `
<div class="total-row">
    <span>Diskon:</span>
    <span>- ${money(sale.diskon)}</span>
</div>`
        : ""
}

${
    (sale.diskon_grosir ?? 0) > 0
        ? `
<div class="total-row">
    <span>Diskon Grosir:</span>
    <span>- ${money(sale.diskon_grosir)}</span>
</div>`
        : ""
}

${
    (sale.pajak ?? 0) > 0
        ? `
<div class="total-row">
    <span>Pajak:</span>
    <span>${money(sale.pajak)}</span>
</div>`
        : ""
}

<div class="grand-total">
    <span>TOTAL:</span>
    <span>${money(sale.total ?? 0)}</span>
</div>

<hr/>

${
isDebt
? `
<div class="total-row" style="font-weight:bold">
    <span>DP Tunai:</span>
    <span>${money(sale.cash_amount ?? sale.cash_received ?? 0)}</span>
</div>

${
hasCardDp
? `
<div class="total-row" style="font-weight:bold">
    <span>DP Transfer:</span>
    <span>${money(sale.card_amount)}</span>
</div>

<div class="card-note">
    <span>Kartu:</span>
    <span style="text-transform:uppercase">${sale.jenis_kartu ?? "Debit"}</span>
</div>

<div class="card-note">
    <span>No Kartu:</span>
    <span>**** ${sale.nomor_kartu_akhir ?? "0000"}</span>
</div>
`
: ""
}

<div class="total-row" style="font-weight:bold">
    <span>Hutang Baru:</span>
    <span>${money(sale.debt_amount ?? 0)}</span>
</div>
`
: sale.metode_pembayaran === "cash"
? `
<div class="total-row" style="font-weight:bold">
    <span>Tunai:</span>
    <span>${money(sale.nominal_bayar ?? 0)}</span>
</div>

<div class="total-row" style="font-weight:bold">
    <span>Kembali:</span>
    <span>${money(sale.kembalian ?? 0)}</span>
</div>
`
: `
<div class="total-row" style="font-weight:bold; text-transform:capitalize">
    <span>Kartu ${sale.jenis_kartu ?? ""}:</span>
    <span>**** ${sale.nomor_kartu_akhir ?? ""}</span>
</div>
`
}

<hr/>

<div class="footer">
    <div>Terima Kasih Atas Kunjungan Anda</div>
    <div>Barang yang sudah dibeli</div>
    <div>tidak dapat ditukar/dikembalikan</div>
</div>

</body>
</html>
`;
}
