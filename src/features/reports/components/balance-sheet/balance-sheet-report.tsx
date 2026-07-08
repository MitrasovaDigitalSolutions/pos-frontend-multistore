"use client";

import { useState, useMemo } from "react";
import { startOfMonth, endOfMonth, isValid, parseISO, format } from "date-fns";
import { id } from "date-fns/locale";
import { useBalanceSheet } from "@/features/reports/api/reports-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BalanceSheetReport() {
    const [startDate, setStartDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));

    const dateRange = useMemo(() => {
        const from = startDate ? parseISO(startDate) : undefined;
        const to = endDate ? parseISO(endDate) : undefined;
        return {
            from: from && isValid(from) ? from : undefined,
            to: to && isValid(to) ? to : undefined,
        };
    }, [startDate, endDate]);

    const { data, isLoading, isError } = useBalanceSheet(startDate, endDate);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Neraca (Balance Sheet)</h2>
                    <div className="flex items-center space-x-2">
                        <DatePicker
                            value={startDate}
                            onChange={(val) => {
                                setStartDate(val)
                                setEndDate(val)
                            }}
                            label="Tanggal"
                        />
                    </div>
            </div>

            {isLoading && (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {isError && (
                <div className="text-center p-8 text-destructive">
                    Gagal memuat data neraca. Silakan coba lagi.
                </div>
            )}

            {data && (
                <>
                    <div className={cn(
                        "flex items-center justify-center p-4 rounded-lg border",
                        data.data.is_balanced 
                            ? "bg-green-50/50 border-green-200 text-green-700"
                            : "bg-red-50/50 border-red-200 text-red-700"
                    )}>
                        {data.data.is_balanced ? (
                            <><CheckCircle2 className="w-5 h-5 mr-2" /> <span>Neraca Seimbang (Balanced)</span></>
                        ) : (
                            <><AlertCircle className="w-5 h-5 mr-2" /> <span>Neraca Tidak Seimbang (Unbalanced)</span></>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Aset</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.data.assets.items.map((item, idx) => (
                                            <div key={`${item.kode}-${idx}`} className="flex justify-between items-center border-b pb-2">
                                                <span className="text-muted-foreground">{item.nama}</span>
                                                <span className="font-medium">{formatRupiah(item.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                            <span>Total Aset</span>
                                            <span>{formatRupiah(data.data.assets.total_assets)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Kewajiban</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.data.liabilities.items.map((item, idx) => (
                                            <div key={`${item.kode}-${idx}`} className="flex justify-between items-center border-b pb-2">
                                                <span className="text-muted-foreground">{item.nama}</span>
                                                <span className="font-medium">{formatRupiah(item.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                            <span>Total Kewajiban</span>
                                            <span>{formatRupiah(data.data.liabilities.total_liabilities)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ekuitas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.data.equity.items.map((item, idx) => (
                                            <div key={`${item.kode}-${idx}`} className="flex justify-between items-center border-b pb-2">
                                                <span className="text-muted-foreground">{item.nama}</span>
                                                <span className="font-medium">{formatRupiah(item.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                            <span>Total Ekuitas</span>
                                            <span>{formatRupiah(data.data.equity.total_equity)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={data.data.is_balanced ? "" : "border-red-200"}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center font-bold text-xl">
                                        <span>Total Kewajiban & Ekuitas</span>
                                        <span className={data.data.is_balanced ? "" : "text-red-600"}>
                                            {formatRupiah(data.data.liabilities.total_liabilities + data.data.equity.total_equity)}
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
