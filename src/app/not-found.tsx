import Link from "next/link";
import { IconHome } from "@tabler/icons-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="text-center space-y-4 max-w-md">
                <h1 className="text-6xl font-extrabold text-emerald-600">
                    404
                </h1>
                <h2 className="text-lg font-bold text-slate-900">
                    Halaman Tidak Ditemukan
                </h2>
                <p className="text-xs text-slate-500">
                    Halaman yang Anda cari tidak ada atau telah dipindahkan.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl transition-colors"
                >
                    <IconHome size={16} />
                    <span>Kembali ke Beranda</span>
                </Link>
            </div>
        </div>
    );
}
