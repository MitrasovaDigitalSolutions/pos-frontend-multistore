export interface CashDepositReceiptData {
    session: {
        opening_balance: number
        cash_sales_total: number
        user: {
            name: string
        }
    }
    waktu: string
    app_setting: {
        app_name: string
        app_address?: string | null
    }
}

function rupiah(value: number) {
    return new Intl.NumberFormat("id-ID").format(value)
}

function formatDate(value: string) {
    return new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function buildCashDepositText(
    data: CashDepositReceiptData
): string {

    const total =
        data.session.opening_balance +
        data.session.cash_sales_total

    return `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Struk Setoran Kasir</title>

<style>
*{
    box-sizing:border-box;
    margin:0;
    padding:0;
}

@page{
    size:58mm auto;
    margin:2mm;
}

body{
    width:54mm;
    font-family:monospace;
    font-size:11px;
    line-height:1.35;
    color:#000;
}

.receipt{
    width:100%;
}

.center{
    text-align:center;
}

.row{
    display:flex;
    justify-content:space-between;
    gap:8px;
}

.section{
    margin:10px 0;
}

hr{
    border:none;
    border-top:1px dashed #000;
    margin:8px 0;
}

.amount{
    text-align:center;
    font-size:16px;
    font-weight:bold;
    margin-top:4px;
}

.title{
    font-weight:bold;
    font-size:13px;
    text-align:center;
    margin-bottom:8px;
}

.store{
    text-align:center;
    margin-bottom:8px;
}

.footer{
    text-align:center;
    margin-top:10px;
}
</style>

</head>

<body>

<div class="receipt">

    <div class="store">
        <div><strong>${data.app_setting.app_name}</strong></div>
        ${
            data.app_setting.app_address
                ? `<div>${data.app_setting.app_address}</div>`
                : ""
        }
    </div>

    <div class="title">
        STRUK SETORAN KASIR
    </div>

    <hr>

    <div class="row">
        <span>Waktu</span>
        <span>${formatDate(data.waktu)}</span>
    </div>

    <div class="row">
        <span>Kasir</span>
        <span>${data.session.user.name}</span>
    </div>

    <hr>

    <div class="section">
        <div class="center"><strong>SALDO AWAL</strong></div>
        <div class="amount">
            Rp ${rupiah(data.session.opening_balance)}
        </div>
    </div>

    <hr>

    <div class="section">
        <div class="center"><strong>PENDAPATAN</strong></div>
        <div class="amount">
            Rp ${rupiah(data.session.cash_sales_total)}
        </div>
    </div>

    <hr>

    <div class="section">
        <div class="center"><strong>TOTAL SETORAN</strong></div>
        <div class="amount">
            Rp ${rupiah(total)}
        </div>
    </div>

    <hr>

    <div class="footer">
        Selamat Istirahat
    </div>

</div>

</body>
</html>
`
}