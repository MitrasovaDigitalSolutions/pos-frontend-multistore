import { IconInfoCircle } from "@tabler/icons-react";

export function POInstructionPanel() {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <IconInfoCircle size={16} className="text-emerald-600" />
                <span>Petunjuk Penggunaan</span>
            </h4>
            <ul className="text-[11px] text-slate-500 space-y-2.5 list-disc pl-4 leading-relaxed">
                <li>Scan barcode barang yang ingin dipesan dari supplier atau cari manual jika tidak ada barcode.</li>
                <li>Jika produk sudah ada, kuantitas otomatis bertambah 1.</li>
                <li>Anda dapat mengubah <strong>kuantitas</strong> secara langsung di dalam tabel.</li>
                <li>Gunakan tombol <strong>Simpan PO</strong> di bawah untuk memproses dan menyimpan seluruh data header serta item pesanan ke server secara langsung.</li>
            </ul>
        </div>
    );
}
