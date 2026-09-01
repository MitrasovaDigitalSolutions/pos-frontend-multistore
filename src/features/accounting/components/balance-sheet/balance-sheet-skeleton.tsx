"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BalanceSheetSkeleton() {
    return (
        <div className="space-y-3.5 animate-pulse pb-16">
            {/* 1. Header Toolbar & Filters Skeleton */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-3 sm:p-4 shadow-xs space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left: Page Title & Description */}
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-7 h-7 rounded-xl shrink-0" />
                            <Skeleton className="h-5 w-40 rounded-lg" />
                            <Skeleton className="h-4.5 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-64 rounded hidden sm:block" />
                    </div>

                    {/* Right: Actions & Switchers */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start lg:justify-end">
                        {/* Date Picker Skeleton */}
                        <Skeleton className="h-8 w-36 sm:w-40 rounded-xl" />

                        {/* View Switcher (Standar / Persamaan) Skeleton */}
                        <Skeleton className="h-8 w-36 sm:w-44 rounded-xl hidden sm:block" />

                        {/* Switch Debit & Credit Skeleton */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                            <Skeleton className="h-3.5 w-24 rounded" />
                            <Skeleton className="h-4.5 w-8 rounded-full" />
                        </div>

                        {/* Action Buttons Skeleton */}
                        <Skeleton className="h-8 w-24 rounded-xl" />
                        <Skeleton className="h-8 w-28 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* 2. Balance Status Card Skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left Status Indicator */}
                    <div className="flex items-center gap-2.5">
                        <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-44 rounded" />
                                <Skeleton className="h-4 w-20 rounded-md" />
                            </div>
                            <Skeleton className="h-3 w-56 rounded hidden sm:block" />
                        </div>
                    </div>

                    {/* Right Metric Summary */}
                    <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <div className="space-y-1 text-right">
                            <Skeleton className="h-2.5 w-16 ml-auto rounded" />
                            <Skeleton className="h-4 w-24 rounded font-mono" />
                        </div>
                        <Skeleton className="h-6 w-px" />
                        <div className="space-y-1 text-right">
                            <Skeleton className="h-2.5 w-24 ml-auto rounded" />
                            <Skeleton className="h-4 w-24 rounded font-mono" />
                        </div>
                        <Skeleton className="h-6 w-px" />
                        <div className="space-y-1 text-right">
                            <Skeleton className="h-2.5 w-14 ml-auto rounded" />
                            <Skeleton className="h-4 w-20 rounded font-mono" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Section Cards Stack Skeleton (1 Grid / Full-Width Columns with D/K) */}
            <div className="grid grid-cols-1 gap-3.5">
                {/* 1. Aset Card Skeleton */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-t-2 border-t-emerald-500 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-3 sm:px-4 sm:pt-3 sm:pb-2 border-b border-slate-100 dark:border-slate-800/60 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="w-4 h-4 rounded text-emerald-500" />
                            <Skeleton className="h-3.5 w-20 rounded font-extrabold" />
                        </div>
                        <Skeleton className="h-2.5 w-72 rounded hidden sm:block" />
                    </div>

                    {/* Desktop Full-Width 4-Column Table */}
                    <div className="hidden md:block">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/60">
                                    <th className="py-2 px-4"><Skeleton className="h-3 w-28 rounded" /></th>
                                    <th className="py-2 px-3 text-right w-44"><Skeleton className="h-3 w-16 ml-auto rounded" /></th>
                                    <th className="py-2 px-3 text-right w-44"><Skeleton className="h-3 w-16 ml-auto rounded" /></th>
                                    <th className="py-2 px-4 text-right w-44"><Skeleton className="h-3 w-24 ml-auto rounded" /></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-3.5 w-12 rounded font-mono" />
                                                    <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                                                    <Skeleton className="h-3.5 w-44 rounded font-bold" />
                                                </div>
                                                {idx === 0 && (
                                                    <Skeleton className="h-4.5 w-16 rounded-md shrink-0" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <Skeleton className="h-3.5 w-24 ml-auto rounded font-mono bg-emerald-50 dark:bg-emerald-950/30" />
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <Skeleton className="h-3.5 w-24 ml-auto rounded font-mono bg-rose-50 dark:bg-rose-950/30" />
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                            <Skeleton className="h-4 w-28 ml-auto rounded font-mono font-bold" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t bg-emerald-50/40 dark:bg-emerald-950/20">
                                    <td className="py-2.5 px-4"><Skeleton className="h-3.5 w-28 rounded font-extrabold" /></td>
                                    <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-24 ml-auto rounded font-mono font-extrabold text-emerald-600" /></td>
                                    <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-24 ml-auto rounded font-mono font-extrabold text-rose-600" /></td>
                                    <td className="py-2.5 px-4 text-right"><Skeleton className="h-4 w-32 ml-auto rounded font-mono font-black" /></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Mobile Stacked Layout */}
                    <div className="block md:hidden p-2.5 space-y-1.5">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Skeleton className="h-3.5 w-12 rounded font-mono" />
                                        <Skeleton className="h-3.5 w-28 rounded font-bold" />
                                    </div>
                                    <Skeleton className="h-4 w-12 rounded-md" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                                    <div className="space-y-1">
                                        <Skeleton className="h-2.5 w-10 rounded" />
                                        <Skeleton className="h-3 w-16 rounded font-mono" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-2.5 w-10 rounded" />
                                        <Skeleton className="h-3 w-16 rounded font-mono" />
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <Skeleton className="h-2.5 w-12 ml-auto rounded" />
                                        <Skeleton className="h-3.5 w-16 ml-auto rounded font-mono font-bold" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Kewajiban (Liabilitas) Card Skeleton */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-t-2 border-t-amber-500 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-3 sm:px-4 sm:pt-3 sm:pb-2 border-b border-slate-100 dark:border-slate-800/60 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="w-4 h-4 rounded text-amber-500" />
                            <Skeleton className="h-3.5 w-32 rounded font-extrabold" />
                        </div>
                        <Skeleton className="h-2.5 w-80 rounded hidden sm:block" />
                    </div>

                    {/* Desktop Full-Width 4-Column Table */}
                    <div className="hidden md:block">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/60">
                                    <th className="py-2 px-4"><Skeleton className="h-3 w-28 rounded" /></th>
                                    <th className="py-2 px-3 text-right w-44"><Skeleton className="h-3 w-16 ml-auto rounded" /></th>
                                    <th className="py-2 px-3 text-right w-44"><Skeleton className="h-3 w-16 ml-auto rounded" /></th>
                                    <th className="py-2 px-4 text-right w-44"><Skeleton className="h-3 w-24 ml-auto rounded" /></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-3.5 w-12 rounded font-mono" />
                                                <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                                                <Skeleton className="h-3.5 w-40 rounded font-bold" />
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <Skeleton className="h-3.5 w-24 ml-auto rounded font-mono bg-emerald-50 dark:bg-emerald-950/30" />
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <Skeleton className="h-3.5 w-24 ml-auto rounded font-mono bg-rose-50 dark:bg-rose-950/30" />
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                            <Skeleton className="h-4 w-28 ml-auto rounded font-mono font-bold" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t bg-amber-50/40 dark:bg-amber-950/20">
                                    <td className="py-2.5 px-4"><Skeleton className="h-3.5 w-32 rounded font-extrabold" /></td>
                                    <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-24 ml-auto rounded font-mono font-extrabold text-emerald-600" /></td>
                                    <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-24 ml-auto rounded font-mono font-extrabold text-rose-600" /></td>
                                    <td className="py-2.5 px-4 text-right"><Skeleton className="h-4 w-32 ml-auto rounded font-mono font-black" /></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Mobile Stacked Layout */}
                    <div className="block md:hidden p-2.5 space-y-1.5">
                        {Array.from({ length: 2 }).map((_, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Skeleton className="h-3.5 w-12 rounded font-mono" />
                                    <Skeleton className="h-3.5 w-28 rounded font-bold" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                                    <div className="space-y-1">
                                        <Skeleton className="h-2.5 w-10 rounded" />
                                        <Skeleton className="h-3 w-16 rounded font-mono" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-2.5 w-10 rounded" />
                                        <Skeleton className="h-3 w-16 rounded font-mono" />
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <Skeleton className="h-2.5 w-12 ml-auto rounded" />
                                        <Skeleton className="h-3.5 w-16 ml-auto rounded font-mono font-bold" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Ekuitas Card Skeleton */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-t-2 border-t-indigo-500 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-3 sm:px-4 sm:pt-3 sm:pb-2 border-b border-slate-100 dark:border-slate-800/60 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="w-4 h-4 rounded text-indigo-500" />
                            <Skeleton className="h-3.5 w-24 rounded font-extrabold" />
                        </div>
                        <Skeleton className="h-2.5 w-72 rounded hidden sm:block" />
                    </div>

                    {/* Desktop Full-Width 4-Column Table */}
                    <div className="hidden md:block">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/60">
                                    <th className="py-2 px-4"><Skeleton className="h-3 w-28 rounded" /></th>
                                    <th className="py-2 px-3 text-right w-44"><Skeleton className="h-3 w-16 ml-auto rounded" /></th>
                                    <th className="py-2 px-3 text-right w-44"><Skeleton className="h-3 w-16 ml-auto rounded" /></th>
                                    <th className="py-2 px-4 text-right w-44"><Skeleton className="h-3 w-24 ml-auto rounded" /></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-3.5 w-12 rounded font-mono" />
                                                <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                                                <Skeleton className="h-3.5 w-36 rounded font-bold" />
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <Skeleton className="h-3.5 w-24 ml-auto rounded font-mono bg-emerald-50 dark:bg-emerald-950/30" />
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <Skeleton className="h-3.5 w-24 ml-auto rounded font-mono bg-rose-50 dark:bg-rose-950/30" />
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                            <Skeleton className="h-4 w-28 ml-auto rounded font-mono font-bold" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t bg-indigo-50/40 dark:bg-indigo-950/20">
                                    <td className="py-2.5 px-4"><Skeleton className="h-3.5 w-28 rounded font-extrabold" /></td>
                                    <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-24 ml-auto rounded font-mono font-extrabold text-emerald-600" /></td>
                                    <td className="py-2.5 px-3 text-right"><Skeleton className="h-3.5 w-24 ml-auto rounded font-mono font-extrabold text-rose-600" /></td>
                                    <td className="py-2.5 px-4 text-right"><Skeleton className="h-4 w-32 ml-auto rounded font-mono font-black" /></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Mobile Stacked Layout */}
                    <div className="block md:hidden p-2.5 space-y-1.5">
                        {Array.from({ length: 2 }).map((_, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Skeleton className="h-3.5 w-12 rounded font-mono" />
                                    <Skeleton className="h-3.5 w-28 rounded font-bold" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                                    <div className="space-y-1">
                                        <Skeleton className="h-2.5 w-10 rounded" />
                                        <Skeleton className="h-3 w-16 rounded font-mono" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-2.5 w-10 rounded" />
                                        <Skeleton className="h-3 w-16 rounded font-mono" />
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <Skeleton className="h-2.5 w-12 ml-auto rounded" />
                                        <Skeleton className="h-3.5 w-16 ml-auto rounded font-mono font-bold" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
