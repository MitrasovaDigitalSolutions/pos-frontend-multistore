import { IconInfoCircle } from "@tabler/icons-react";

export function ReturnInstructionPanel() {
    return (
        <div className="bg-emerald-50/45 border border-emerald-100/50 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <IconInfoCircle size={16} className="text-emerald-600" />
                <span>Petunjuk Retur Barang</span>
            </h4>
            <ul className="text-[11px] text-emerald-800/90 space-y-2.5 list-disc pl-4 leading-relaxed font-medium">
                <li>Scan barcode barang yang datang dari supplier atau isi kuantitas secara manual pada tabel.</li>
                <li>Kuantitas retur dibatasi maksimal sesuai sisa barang yang tertera di faktur penerimaan.</li>
                <li>Tentukan alasan pengembalian untuk setiap barang yang Anda retur.</li>
                <li>
                    Gunakan tombol <strong>Simpan Retur</strong> untuk menyimpan data sebagai draft (bisa diedit kembali nanti).
                </li>
                <li>
                    Klik tombol <strong>Finalisasi Retur</strong> di kanan atas jika data retur sudah sesuai untuk langsung memotong stok barang.
                </li>
            </ul>
        </div>
    );
}
