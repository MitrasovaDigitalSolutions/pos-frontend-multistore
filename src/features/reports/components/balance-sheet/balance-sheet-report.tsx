"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import { useBalanceSheet } from "@/features/reports/api/reports-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { formatRupiah } from "@/lib/utils";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BalanceSheetReport() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
    const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

    const { data, isLoading, isError } = useBalanceSheet(startDate, endDate);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Neraca (Balance Sheet)</h2>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange 
                        date={dateRange} 
                        setDate={setDateRange} 
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
                        data.is_balanced 
                            ? "bg-green-50/50 border-green-200 text-green-700"
                            : "bg-red-50/50 border-red-200 text-red-700"
                    )}>
                        {data.is_balanced ? (
                            <><CheckCircle2 className="w-5 h-5 mr-2" /> <span>Neraca Seimbang (Balanced)</span></>
                        ) : (
                            <><AlertCircle className="w-5 h-5 mr-2" /> <span>Neraca Tidak Seimbang (Unbalanced)</span></>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Aset (Assets) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Aset</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Kas & Bank</span>
                                        <span className="font-medium">{formatRupiah(data.assets.kas_dan_bank)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Piutang Usaha</span>
                                        <span className="font-medium">{formatRupiah(data.assets.piutang_usaha)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Persediaan Barang</span>
                                        <span className="font-medium">{formatRupiah(data.assets.persediaan_barang)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Aset Tetap</span>
                                        <span className="font-medium">{formatRupiah(data.assets.aset_tetap)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                        <span>Total Aset</span>
                                        <span>{formatRupiah(data.assets.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            {/* Kewajiban (Liabilities) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Kewajiban</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-muted-foreground">Hutang Usaha</span>
                                            <span className="font-medium">{formatRupiah(data.liabilities.hutang_usaha)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-muted-foreground">Kewajiban Lainnya</span>
                                            <span className="font-medium">{formatRupiah(data.liabilities.kewajiban_lainnya)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                            <span>Total Kewajiban</span>
                                            <span>{formatRupiah(data.liabilities.total)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ekuitas (Equity) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ekuitas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-muted-foreground">Modal Disetor</span>
                                            <span className="font-medium">{formatRupiah(data.equity.modal_disetor)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-muted-foreground">Laba/Rugi Berjalan</span>
                                            <span className="font-medium">{formatRupiah(data.equity.laba_rugi_berjalan)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                            <span>Total Ekuitas</span>
                                            <span>{formatRupiah(data.equity.total)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={data.is_balanced ? "" : "border-red-200"}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center font-bold text-xl">
                                        <span>Total Kewajiban & Ekuitas</span>
                                        <span className={data.is_balanced ? "" : "text-red-600"}>
                                            {formatRupiah(data.liabilities.total + data.equity.total)}
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
