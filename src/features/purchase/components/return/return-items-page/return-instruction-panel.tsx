import { IconInfoCircle } from "@tabler/icons-react";

export function ReturnInstructionPanel() {
    return (
        <div className="bg-emerald-50/45 border border-emerald-100/50 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <IconInfoCircle size={16} className="text-emerald-600 animate-pulse" />
                <span>Petunjuk Retur Barang</span>
            </h4>
            <ul className="text-[11px] text-emerald-800/90 space-y-2.5 list-disc pl-4 leading-relaxed font-medium">
                <li>Isi kuantitas pada baris barang yang ingin dikembalikan.</li>
                <li>Kuantitas retur dibatasi maksimal sesuai sisa barang yang diterima.</li>
                <li>Tentukan alasan pengembalian untuk setiap barang yang Anda retur.</li>
                <li>Scan barcode produk penerimaan untuk secara otomatis menambahkan item retur.</li>
                <li>Klik tombol <strong>Simpan Semua Items ke Server</strong> di bagian bawah untuk menyimpan progres retur.</li>
                <li>Klik tombol <strong>Finalisasi Retur</strong> di kanan atas untuk memproses pemotongan stok dan penyelesaian retur.</li>
            </ul>
        </div>
    );
}
