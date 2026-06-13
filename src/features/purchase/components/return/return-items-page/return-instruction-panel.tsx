import { IconInfoCircle } from "@tabler/icons-react";

export function ReturnInstructionPanel() {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <IconInfoCircle size={16} className="text-blue-500" />
                <span>Petunjuk Retur Barang</span>
            </h4>
            <ul className="text-[11px] text-slate-500 space-y-2.5 list-disc pl-4 leading-relaxed">
                <li>Isi kuantitas pada baris barang yang ingin dikembalikan.</li>
                <li>Kuantitas retur dibatasi maksimal sesuai sisa barang yang diterima.</li>
                <li>Tentukan alasan pengembalian untuk setiap barang yang Anda retur.</li>
                <li>Scan barcode produk penerimaan untuk secara otomatis menambahkan item retur.</li>
                <li>Klik tombol <strong>Simpan Semua Items ke Server</strong> di bagian bawah untuk menyimpan progres retur.</li>
            </ul>
        </div>
    );
}
