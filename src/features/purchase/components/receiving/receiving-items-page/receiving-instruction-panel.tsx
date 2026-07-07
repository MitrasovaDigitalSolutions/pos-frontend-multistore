import { IconInfoCircle } from "@tabler/icons-react";

interface ReceivingInstructionPanelProps {
    poId: string | null;
}

export function ReceivingInstructionPanel({ poId }: ReceivingInstructionPanelProps) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <IconInfoCircle size={16} className="text-emerald-600" />
                <span>Petunjuk Penerimaan</span>
            </h4>
            <ul className="text-[11px] text-slate-500 space-y-2.5 list-disc pl-4 leading-relaxed">
                <li>Scan barcode barang yang datang dari supplier atau cari manual jika tidak ada barcode.</li>
                <li>Pastikan harga beli disesuaikan agar sama dengan faktur fisik.</li>
                <li>
                    Gunakan tombol <strong>Simpan Penerimaan</strong> untuk menyimpan data ke server sebagai draft (bisa diedit kembali nanti).
                </li>
                <li>
                    Klik tombol <strong>Proses Penerimaan</strong> untuk langsung memproses, memperbarui stok barang, dan menyesuaikan harga jual produk.
                </li>
                {poId && (
                    <li>
                        <strong>Batas sisa PO</strong>: Kuantitas barang yang diterima tidak boleh melebihi sisa barang yang dipesan di PO terkait.
                    </li>
                )}
            </ul>
        </div>
    );
}
