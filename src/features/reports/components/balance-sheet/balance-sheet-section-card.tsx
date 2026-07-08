"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { 
    IconWallet, 
    IconBuildingBank, 
    IconReceipt, 
    IconCoin, 
    IconReportMoney 
} from "@tabler/icons-react";

// Reusable Helper to map account icons
const getAccountIcon = (nama: string) => {
    const lowerName = nama.toLowerCase();
    if (lowerName.includes("kas") || lowerName.includes("tunai") || lowerName.includes("cash")) {
        return <IconWallet className="w-4 h-4 text-emerald-500" />;
    }
    if (lowerName.includes("bank") || lowerName.includes("giro")) {
        return <IconBuildingBank className="w-4 h-4 text-blue-500" />;
    }
    if (lowerName.includes("piutang") || lowerName.includes("receivable")) {
        return <IconReceipt className="w-4 h-4 text-sky-500" />;
    }
    if (lowerName.includes("persediaan") || lowerName.includes("stok") || lowerName.includes("inventory")) {
        return <IconReportMoney className="w-4 h-4 text-indigo-500" />;
    }
    if (lowerName.includes("utang") || lowerName.includes("hutang") || lowerName.includes("payable")) {
        return <IconCoin className="w-4 h-4 text-amber-500" />;
    }
    return <IconReportMoney className="w-4 h-4 text-slate-400" />;
};

interface BalanceSheetSectionCardProps {
    title: string;
    description: string;
    items: { kode: string; nama: string; amount: number }[];
    total: number;
    accentColor: "emerald" | "amber" | "indigo";
    totalLabel: string;
    icon: React.ReactNode;
}

export function BalanceSheetSectionCard({
    title,
    description,
    items = [],
    total,
    accentColor,
    totalLabel,
    icon
}: BalanceSheetSectionCardProps) {
    const borderColors = {
        emerald: "border-t-emerald-500",
        amber: "border-t-amber-500",
        indigo: "border-t-indigo-500"
    };

    const bgTotals = {
        emerald: "bg-emerald-50/50 text-emerald-800 border-emerald-100",
        amber: "bg-amber-50/50 text-amber-800 border-amber-100",
        indigo: "bg-indigo-50/50 text-indigo-800 border-indigo-100"
    };

    const progressColors = {
        emerald: "bg-emerald-500",
        amber: "bg-amber-500",
        indigo: "bg-indigo-500"
    };

    return (
        <Card className={cn("bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden border-t-4", borderColors[accentColor])}>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <CardTitle className="text-sm font-bold text-slate-800">{title}</CardTitle>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {description}
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50 px-6">
                    {items.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                            Tidak ada item akun untuk kategori ini.
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const percent = total > 0 ? Math.round((item.amount / total) * 100) : 0;
                            return (
                                <div key={`${item.kode}-${idx}`} className="py-3.5 group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                                                {item.kode}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {getAccountIcon(item.nama)}
                                                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                    {item.nama}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-slate-800">
                                                {formatRupiah(item.amount)}
                                            </span>
                                            {percent > 0 && (
                                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                                    {percent}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {item.amount > 0 && total > 0 && (
                                        <div className="w-full bg-slate-50 rounded-full h-1 mt-2 overflow-hidden">
                                            <div 
                                                className={cn("h-full rounded-full transition-all duration-500", progressColors[accentColor])} 
                                                style={{ width: `${percent}%` }} 
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                
                {/* Total Row */}
                <div className={cn("px-6 py-4 border-t flex justify-between items-center", bgTotals[accentColor])}>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                        {totalLabel}
                    </span>
                    <span className="text-sm font-extrabold">
                        {formatRupiah(total)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
