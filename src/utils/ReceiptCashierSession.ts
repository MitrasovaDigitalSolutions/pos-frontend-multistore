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

const WIDTH = 32

function center(text: string) {
    const left = Math.max(0, Math.floor((WIDTH - text.length) / 2))
    return " ".repeat(left) + text
}

function hr() {
    return "-".repeat(WIDTH)
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

    const lines: string[] = []

    lines.push(center(data.app_setting.app_name.toUpperCase()))

    if (data.app_setting.app_address) {
        lines.push(center(data.app_setting.app_address))
    }

    lines.push("")
    lines.push(center("STRUK SETORAN KASIR"))
    lines.push(hr())

    lines.push(`Waktu : ${formatDate(data.waktu)}`)
    lines.push(`Kasir : ${data.session.user.name}`)

    lines.push(hr())

    lines.push(center("SAlDO AWAL"))
    lines.push("")
    lines.push(center(`Rp ${rupiah(data.session.opening_balance)}`))

    lines.push(hr())

    lines.push(center("PENDAPATAN"))
    lines.push("")
    lines.push(center(`Rp ${rupiah(data.session.cash_sales_total)}`))

    lines.push(hr())
    lines.push(center("Terima Kasih"))

    lines.push("")
    lines.push("")
    lines.push("")

    return lines.join("\n")
}