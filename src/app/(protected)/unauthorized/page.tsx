import Link from "next/link";
import { IconDeviceLaptop, IconLock } from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="text-center space-y-4 max-w-md flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                    <IconLock size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">
                    Akses Ditolak
                </h1>
                <h2 className="text-sm font-bold text-slate-600">
                    Izin Tidak Mencukupi
                </h2>
                <p className="text-xs text-slate-400 max-w-xs">
                    Anda tidak memiliki hak akses untuk membuka halaman
                    administrasi ini. Silakan kembali ke terminal kasir.
                </p>
                <Link
                    href={ROUTES.CHECKOUT}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl transition-colors mt-2"
                >
                    <IconDeviceLaptop size={16} />
                    <span>Kembali ke Layar Kasir</span>
                </Link>
            </div>
        </div>
    );
}
