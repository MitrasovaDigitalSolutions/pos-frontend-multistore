"use client";

import { useSession } from "next-auth/react";

export function StoreProfile() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="border-b border-slate-50">
                <h3 className="text-sm font-bold text-slate-900">
                    Pengaturan Profil Toko
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    Peninjauan detail informasi toko yang terdaftar.
                </p>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
                <p>
                    Nama Toko:{" "}
                    <strong className="text-slate-800">
                        MSG POS Swalayan Induk
                    </strong>
                </p>
                <p>
                    Alamat Cabang:{" "}
                    <strong>Jl. Raya Indah No. 45, Jakarta Selatan</strong>
                </p>
                <p className="mt-1">
                    ID Store Terdaftar:{" "}
                    <strong className="font-mono">
                        {user?.store_id || "1 (Toko Utama)"}
                    </strong>
                </p>
                <p>
                    Toko ritel terhubung langsung dengan REST API database
                    terpusat.
                </p>
            </div>
        </section>
    );
}
