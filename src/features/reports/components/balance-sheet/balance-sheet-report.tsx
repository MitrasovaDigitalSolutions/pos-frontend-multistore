"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useBalanceSheet } from "@/features/reports/api/reports-api";
import { format } from "date-fns";
import { useState } from "react";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { 
    IconScale, 
    IconWallet, 
    IconInfoCircle,
    IconCoin,
    IconReceipt,
    IconBuildingBank,
    IconTrendingUp,
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

// Reusable Card Component for Balance Sheet sections (Assets, Liabilities, Equity)
interface SectionCardProps {
    title: string;
    description: string;
    items: { kode: string; nama: string; amount: number }[];
    total: number;
    accentColor: "emerald" | "amber" | "indigo";
    totalLabel: string;
    icon: React.ReactNode;
}

function BalanceSheetSectionCard({
    title,
    description,
    items = [],
    total,
    accentColor,
    totalLabel,
    icon
}: SectionCardProps) {
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

// Skeleton UI during Loading state
function BalanceSheetSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Visual Balance Card Skeleton */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="flex items-start gap-4 w-full">
                    <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                    <div className="space-y-2 w-full max-w-md">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
                <div className="w-full lg:w-[450px] shrink-0 space-y-3">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                    <div className="flex justify-between">
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-3.5 w-24" />
                    </div>
                </div>
            </div>

            {/* Content Cards Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Left: Assets */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-5 rounded-md" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="space-y-4 pt-4">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="space-y-2 pb-2 border-b border-slate-50 last:border-0">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-1.5 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Liabilities & Equity */}
                <div className="space-y-6">
                    {/* Liabilities */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-5 rounded-md" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="space-y-4 pt-4">
                            {Array.from({ length: 2 }).map((_, idx) => (
                                <div key={idx} className="space-y-2 pb-2 border-b border-slate-50 last:border-0">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    <Skeleton className="h-1.5 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Equity */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-5 rounded-md" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="space-y-4 pt-4">
                            {Array.from({ length: 2 }).map((_, idx) => (
                                <div key={idx} className="space-y-2 pb-2 border-b border-slate-50 last:border-0">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-1.5 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BalanceSheetReport() {
    const [startDate, setStartDate] = useState<string>(() => 
        format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
    );
    const [endDate, setEndDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));

    const { data, isLoading, isError } = useBalanceSheet(startDate, endDate);

    // Presets trigger
    const setPreset = (preset: "today" | "thisMonth" | "thisYear") => {
        const today = new Date();
        if (preset === "today") {
            const dateStr = format(today, "yyyy-MM-dd");
            setStartDate(dateStr);
            setEndDate(dateStr);
        } else if (preset === "thisMonth") {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartDate(format(start, "yyyy-MM-dd"));
            setEndDate(format(today, "yyyy-MM-dd"));
        } else if (preset === "thisYear") {
            const start = new Date(today.getFullYear(), 0, 1);
            setStartDate(format(start, "yyyy-MM-dd"));
            setEndDate(format(today, "yyyy-MM-dd"));
        }
    };

    // Calculate metrics
    const totalAssets = data?.assets?.total_assets ?? 0;
    const totalLiabilities = data?.liabilities?.total_liabilities ?? 0;
    const totalEquity = data?.equity?.total_equity ?? 0;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
    const isBalanced = data?.is_balanced ?? false;

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Neraca Keuangan (Balance Sheet)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Menampilkan posisi Aset, Kewajiban (Liabilitas), dan Ekuitas Modal dalam periode yang Anda pilih.
                    </p>
                </div>
                
                {/* Date Filter Control Bar */}
                <div className="flex flex-col sm:flex-row items-end gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                    <div className="flex gap-3 w-full sm:w-auto">
                        <DatePicker
                            value={startDate}
                            onChange={(val) => setStartDate(val || "")}
                            label="Dari Tanggal"
                            className="w-[160px]"
                        />
                        <DatePicker
                            value={endDate}
                            onChange={(val) => setEndDate(val || "")}
                            label="Sampai Tanggal"
                            className="w-[160px]"
                        />
                    </div>
                    {/* Preset buttons */}
                    <div className="flex gap-1.5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-3">
                        <button
                            type="button"
                            onClick={() => setPreset("today")}
                            className={cn(
                                "flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all duration-200",
                                startDate === format(new Date(), "yyyy-MM-dd") && endDate === format(new Date(), "yyyy-MM-dd")
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                            )}
                        >
                            Hari Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreset("thisMonth")}
                            className={cn(
                                "flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all duration-200",
                                startDate === format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd") && endDate === format(new Date(), "yyyy-MM-dd")
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                            )}
                        >
                            Bulan Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreset("thisYear")}
                            className={cn(
                                "flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all duration-200",
                                startDate === format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd") && endDate === format(new Date(), "yyyy-MM-dd")
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                            )}
                        >
                            Tahun Ini
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Tutorial Callout */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex gap-3 items-start">
                <IconInfoCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">
                        Cara Membaca Laporan Neraca
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Neraca Keuangan disusun berdasarkan prinsip dasar persamaan akuntansi: <span className="font-semibold text-slate-700">Aset = Kewajiban + Ekuitas</span>. 
                        Aset menggambarkan semua kekayaan yang dimiliki bisnis. Kewajiban mewakili pendanaan dari utang pihak ketiga, 
                        sementara Ekuitas menunjukkan modal bersih dari pemilik bisnis. Posisi kiri (Aset) harus selalu seimbang dengan posisi kanan (Kewajiban + Ekuitas).
                    </p>
                </div>
            </div>

            {isLoading && <BalanceSheetSkeleton />}

            {isError && (
                <div className="text-center p-12 text-destructive bg-rose-50/50 border border-rose-100 rounded-2xl">
                    <p className="font-bold">Gagal memuat data neraca.</p>
                    <p className="text-xs mt-1 text-rose-600/80">Pastikan koneksi internet stabil dan coba segarkan halaman.</p>
                </div>
            )}

            {data && !isLoading && (
                <>
                    {/* Visual Balance Card */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 overflow-hidden relative">
                        {/* Background visual detail */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 -z-10 opacity-60" />
                        
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                            {/* Status Message */}
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-3.5 rounded-2xl shrink-0 shadow-sm",
                                    isBalanced 
                                        ? "bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50" 
                                        : "bg-rose-50 text-rose-600 ring-4 ring-rose-50/50"
                                )}>
                                    <IconScale className="w-7 h-7 animate-pulse" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-extrabold text-sm text-slate-800">
                                            Status Persamaan Neraca
                                        </h3>
                                        <span className={cn(
                                            "text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider shadow-sm",
                                            isBalanced 
                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                                : "bg-rose-100 text-rose-800 border border-rose-200"
                                        )}>
                                            {isBalanced ? "Seimbang (Balanced)" : "Tidak Seimbang"}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-2 max-w-xl leading-relaxed">
                                        {isBalanced 
                                            ? "Sempurna! Nilai aset Anda tepat sama dengan gabungan kewajiban dan ekuitas. Ini menunjukkan pencatatan keuangan Anda tercatat dengan benar."
                                            : "Perhatian! Total Aset tidak sama dengan gabungan Kewajiban & Ekuitas. Mohon periksa kembali transaksi atau jurnal penyesuaian Anda."}
                                        {!isBalanced && difference > 0 && (
                                            <span className="block font-bold text-rose-600 mt-1">
                                                Selisih (Discrepancy): {formatRupiah(difference)}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Balance Bar & Metrics */}
                            <div className="w-full lg:w-[420px] shrink-0 space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Total Aset (A)
                                        </span>
                                        <span className="text-base font-extrabold text-emerald-600">
                                            {formatRupiah(totalAssets)}
                                        </span>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Kewajiban + Ekuitas (K + E)
                                        </span>
                                        <span className={cn(
                                            "text-base font-extrabold",
                                            isBalanced ? "text-indigo-600" : "text-rose-600"
                                        )}>
                                            {formatRupiah(totalLiabilitiesAndEquity)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Comparison Progress Bar */}
                                <div className="w-full bg-slate-100 rounded-full h-2.5 relative overflow-hidden">
                                    {isBalanced ? (
                                        <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full w-full animate-pulse" />
                                    ) : (
                                        <div className="flex h-full rounded-full overflow-hidden w-full">
                                            <div 
                                                className="bg-emerald-500 h-full transition-all duration-500"
                                                style={{ width: `${(totalAssets / (totalAssets + totalLiabilitiesAndEquity || 1)) * 100}%` }}
                                            />
                                            <div 
                                                className="bg-rose-500 h-full transition-all duration-500"
                                                style={{ width: `${(totalLiabilitiesAndEquity / (totalAssets + totalLiabilitiesAndEquity || 1)) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full block" />
                                        Aset
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className={cn("w-2 h-2 rounded-full block", isBalanced ? "bg-indigo-500" : "bg-rose-500")} />
                                        Kewajiban & Ekuitas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Side: Assets */}
                        <div className="space-y-6">
                            <BalanceSheetSectionCard
                                title="Aset"
                                description="Seluruh harta kekayaan, hak paten, persediaan barang, serta piutang dagang yang dikuasai oleh bisnis Anda."
                                items={data.assets?.items}
                                total={totalAssets}
                                accentColor="emerald"
                                totalLabel="Total Aset"
                                icon={<IconWallet className="w-4 text-emerald-500" />}
                            />
                        </div>

                        {/* Right Side: Liabilities & Equities */}
                        <div className="space-y-6">
                            <BalanceSheetSectionCard
                                title="Kewajiban (Liabilitas)"
                                description="Kewajiban finansial berupa utang usaha, pinjaman bank, atau kewajiban pembayaran lainnya kepada pihak luar."
                                items={data.liabilities?.items}
                                total={totalLiabilities}
                                accentColor="amber"
                                totalLabel="Total Kewajiban"
                                icon={<IconCoin className="w-4 text-amber-500" />}
                            />

                            <BalanceSheetSectionCard
                                title="Ekuitas"
                                description="Modal bersih yang diinvestasikan oleh pemilik bisnis dan laba ditahan setelah dikurangi seluruh kewajiban."
                                items={data.equity?.items}
                                total={totalEquity}
                                accentColor="indigo"
                                totalLabel="Total Ekuitas"
                                icon={<IconTrendingUp className="w-4 text-indigo-500" />}
                            />

                            {/* Total Liabilities & Equity Summary Card */}
                            <Card className={cn(
                                "border shadow-sm rounded-2xl overflow-hidden bg-slate-900 border-slate-800 text-white transition-all duration-300",
                                isBalanced ? "hover:shadow-indigo-500/10 hover:shadow-lg" : "border-red-400 bg-red-950/20 text-red-900"
                            )}>
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div className="space-y-1">
                                        <span className={cn(
                                            "text-[10px] font-extrabold uppercase tracking-wider block",
                                            isBalanced ? "text-slate-400" : "text-red-700/80"
                                        )}>
                                            Total Kewajiban & Ekuitas
                                        </span>
                                        <span className="text-xs leading-normal block max-w-xs text-slate-400">
                                            {isBalanced 
                                                ? "Hasil gabungan total kewajiban dan ekuitas pemegang saham." 
                                                : "Persamaan tidak seimbang dengan nilai Aset."
                                            }
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={cn(
                                            "text-lg font-extrabold",
                                            isBalanced ? "text-white" : "text-red-600"
                                        )}>
                                            {formatRupiah(totalLiabilitiesAndEquity)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
