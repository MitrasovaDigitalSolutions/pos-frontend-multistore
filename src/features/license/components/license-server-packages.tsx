"use client";

import { IconServer } from "@tabler/icons-react";
import type { ServerPackage } from "../types";
import { LicenseServerCard } from "./catalog/license-server-card";

interface LicenseServerPackagesProps {
    serverPackages: ServerPackage[];
    billingView: "monthly" | "annual";
    onSelectServer: (serverCode?: string) => void;
}

/**
 * Single Responsibility: Section layout coordinating the Cloud & Server Infrastructure showcase.
 */
export function LicenseServerPackages({
    serverPackages = [],
    billingView,
    onSelectServer,
}: LicenseServerPackagesProps) {
    if (serverPackages.length === 0) return null;

    return (
        <div className="pt-4 border-t border-slate-100 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <IconServer size={15} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Paket Server & Cloud Hosting
                            </h4>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                {serverPackages.length} Pilihan
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Infrastruktur server cloud yang dioptimalkan untuk sinkronisasi POS multi-cabang tanpa putus
                        </p>
                    </div>
                </div>
            </div>

            {/* Server Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {serverPackages.map((server) => (
                    <LicenseServerCard
                        key={server.id}
                        server={server}
                        billingView={billingView}
                        onSelectServer={onSelectServer}
                    />
                ))}
            </div>
        </div>
    );
}
