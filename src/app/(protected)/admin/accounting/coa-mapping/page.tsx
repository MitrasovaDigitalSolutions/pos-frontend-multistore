import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconSettings } from "@tabler/icons-react";

export default function CoaMappingPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Mapping COA</h2>
            </div>
            <Card className="border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <IconSettings className="w-5 h-5 text-indigo-500 animate-spin" />
                        <CardTitle className="text-sm font-bold text-slate-800">Sedang Dikembangkan</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pb-6">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Fitur Mapping COA sedang dalam proses pengembangan. 
                        Halaman ini nantinya digunakan untuk memetakan jenis transaksi operasional harian 
                        (seperti penjualan, pembelian, pengeluaran) ke akun COA masing-masing secara otomatis.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
