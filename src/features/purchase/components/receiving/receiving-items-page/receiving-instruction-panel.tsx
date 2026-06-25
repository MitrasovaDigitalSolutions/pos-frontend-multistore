import { IconInfoCircle } from "@tabler/icons-react";

interface ReceivingInstructionPanelProps {
    poId: string | null;
}

export function ReceivingInstructionPanel({ poId }: ReceivingInstructionPanelProps) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <IconInfoCircle size={16} className="text-blue-500" />
                <span>Petunjuk Penerimaan</span>
            </h4>
            <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Scan barcode barang yang datang dari supplier.</li>
                <li>Pastikan harga beli disesuaikan dengan faktur fisik.</li>
                <li>Gunakan tombol <strong>Simpan Semua Items ke Server</strong> sewaktu-waktu untuk menyimpan progres draft Anda.</li>
                <li>Klik tombol <strong>Selesai & Tambah Stok</strong> jika semua item faktur sudah terinput lengkap dan sesuai.</li>
                {poId && <li>Kuantitas yang diinput tidak boleh melebihi sisa kuantitas barang yang dipesan di PO.</li>}
            </ul>
        </div>
    );
}
