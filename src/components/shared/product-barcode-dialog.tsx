"use client";

import { useMemo, useState } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { AppButton } from "@/components/shared/app-button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    downloadBarcodeAsPng,
    downloadBarcodeAsSvg,
    copyBarcodeImageToClipboard,
    generateBarcodePreviewDataUrl,
    type BarcodePreviewResult,
} from "@/lib/barcode-utils";
import { toast } from "sonner";
import {
    IconBarcode,
    IconCheck,
    IconCopy,
    IconDownload,
    IconInfoCircle,
    IconPrinter,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface ProductBarcodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    barcode: string;
    productName: string;
    price?: number | null;
    categoryName?: string | null;
}

type BarcodeFormat = "CODE128" | "EAN13" | "UPC" | "CODE39";

export function ProductBarcodeDialog({
    open,
    onOpenChange,
    barcode,
    productName,
    price,
    categoryName,
}: ProductBarcodeDialogProps) {
    // Customization states
    const [format, setFormat] = useState<BarcodeFormat>("CODE128");
    const [showName, setShowName] = useState(true);
    const [showPrice, setShowPrice] = useState(true);
    const [showText, setShowText] = useState(true);
    const [widthScale, setWidthScale] = useState(2);
    const [isCopied, setIsCopied] = useState(false);

    const priceFormatted = price ? formatRupiah(price) : "";
    const cleanBarcode = barcode?.trim() || "";

    // Generate preview directly during render via useMemo
    const previewResult = useMemo<BarcodePreviewResult | null>(() => {
        if (!open || !cleanBarcode) {
            return null;
        }

        return generateBarcodePreviewDataUrl({
            barcode: cleanBarcode,
            format,
            widthScale,
            showText,
        });
    }, [open, cleanBarcode, format, widthScale, showText]);

    const exportOptions = {
        barcode: cleanBarcode,
        productName,
        priceFormatted: price ? priceFormatted : undefined,
        format,
        showName,
        showPrice: showPrice && Boolean(price),
        showText,
        widthScale,
    };

    const handleDownloadPng = () => {
        if (!cleanBarcode) return;
        downloadBarcodeAsPng(exportOptions);
        toast.success("Label barcode PNG berhasil diunduh.");
    };

    const handleDownloadSvg = () => {
        if (!cleanBarcode) return;
        downloadBarcodeAsSvg(exportOptions);
        toast.success("Vektor SVG barcode berhasil diunduh.");
    };

    const handleCopyImage = async () => {
        if (!cleanBarcode) return;
        const success = await copyBarcodeImageToClipboard(exportOptions);
        if (success) {
            setIsCopied(true);
            toast.success("Gambar barcode berhasil disalin ke clipboard.");
            setTimeout(() => setIsCopied(false), 2000);
        } else {
            toast.error("Gagal menyalin gambar barcode ke clipboard.");
        }
    };

    const handlePrint = () => {
        if (!cleanBarcode || !previewResult?.dataUrl) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Popup window diblokir oleh browser. Izinkan popup untuk mencetak.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Barcode - ${productName || cleanBarcode}</title>
                <style>
                    @page { size: auto; margin: 4mm; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 0;
                        padding: 8px;
                        text-align: center;
                        background: #fff;
                    }
                    .label-card {
                        display: inline-block;
                        padding: 8px 12px;
                        border: 1px dashed #ccc;
                        text-align: center;
                        page-break-inside: avoid;
                    }
                    .title {
                        font-size: 10pt;
                        font-weight: bold;
                        color: #111;
                        margin-bottom: 4px;
                        max-width: 240px;
                        word-wrap: break-word;
                    }
                    .price {
                        font-size: 12pt;
                        font-weight: 800;
                        color: #047857;
                        margin-top: 4px;
                    }
                    img {
                        display: block;
                        margin: 0 auto;
                        max-width: 100%;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                <div class="label-card">
                    ${showName && productName ? `<div class="title">${productName}</div>` : ""}
                    <img src="${previewResult.dataUrl}" alt="${cleanBarcode}" />
                    ${showPrice && price ? `<div class="price">${priceFormatted}</div>` : ""}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <IconBarcode size={15} />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                            Label &amp; Barcode Produk
                        </span>
                        <p className="text-[10.5px] font-normal text-slate-400 leading-none mt-0.5">
                            Format stiker thermal siap cetak &amp; unduh
                        </p>
                    </div>
                </div>
            }
            className="sm:max-w-md p-4 sm:p-5 flex flex-col"
        >
            <div className="space-y-3 pt-1">
                {/* ── Compact Realistic Thermal Sticker Preview ── */}
                <div className="relative rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4 flex flex-col items-center justify-center min-h-[170px]">
                    {/* Badge Format Tag */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                        <Badge variant="outline" className="text-[9px] font-mono uppercase bg-white dark:bg-slate-900 px-1.5 py-0 h-4.5">
                            {previewResult?.usedFormat || format}
                        </Badge>
                        {categoryName && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4.5">
                                {categoryName}
                            </Badge>
                        )}
                    </div>

                    {cleanBarcode && previewResult?.dataUrl ? (
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-3 shadow-xs border border-slate-200/90 dark:border-slate-800 text-center w-full max-w-[290px] transition-all">
                            {/* Product Title on Sticker */}
                            {showName && productName && (
                                <h4 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1 mb-1.5">
                                    {productName}
                                </h4>
                            )}

                            {/* Barcode Graphic */}
                            <div className="flex items-center justify-center py-0.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewResult.dataUrl}
                                    alt={cleanBarcode}
                                    className="mx-auto block h-auto max-w-full rounded select-none"
                                />
                            </div>

                            {/* Format Fallback Note */}
                            {previewResult.isFallback && (
                                <div className="mt-1 flex items-center justify-center gap-1 text-[9.5px] text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 rounded px-1.5 py-0.5 border border-amber-200/50">
                                    <IconInfoCircle size={11} className="shrink-0" />
                                    <span>Dialihkan ke CODE128 agar dapat dipindai.</span>
                                </div>
                            )}

                            {/* Price on Sticker */}
                            {showPrice && price ? (
                                <p className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                                    {priceFormatted}
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 space-y-1 py-2">
                            <IconBarcode size={26} className="mx-auto opacity-40" />
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Barcode Masih Kosong
                            </p>
                            <p className="text-[10px] text-slate-400">
                                Masukkan kode barcode atau SKU pada form produk.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Compact Toolbar: Format & Quick Micro-Toggles ── */}
                <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs">
                    {/* Baris 1: Format Selector */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Format Barcode
                        </span>
                        <div className="flex items-center gap-1">
                            {(["CODE128", "EAN13", "UPC", "CODE39"] as BarcodeFormat[]).map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFormat(f)}
                                    className={cn(
                                        "px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-colors cursor-pointer border",
                                        format === f
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Baris 2: Elemen Label (Micro-Chips) + Ukuran Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">
                                Tampil:
                            </span>

                            {/* Toggle Nama */}
                            <button
                                type="button"
                                onClick={() => setShowName((prev) => !prev)}
                                className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border",
                                    showName
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-semibold"
                                        : "bg-slate-100 text-slate-400 border-transparent dark:bg-slate-800 dark:text-slate-500"
                                )}
                            >
                                Nama
                            </button>

                            {/* Toggle Harga */}
                            <button
                                type="button"
                                onClick={() => setShowPrice((prev) => !prev)}
                                disabled={!price}
                                className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border",
                                    !price
                                        ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-transparent"
                                        : showPrice
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-semibold"
                                            : "bg-slate-100 text-slate-400 border-transparent dark:bg-slate-800 dark:text-slate-500"
                                )}
                            >
                                Harga
                            </button>

                            {/* Toggle Teks Angka */}
                            <button
                                type="button"
                                onClick={() => setShowText((prev) => !prev)}
                                className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border",
                                    showText
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-semibold"
                                        : "bg-slate-100 text-slate-400 border-transparent dark:bg-slate-800 dark:text-slate-500"
                                )}
                            >
                                Teks
                            </button>
                        </div>

                        {/* Ukuran Bar Segmented Pill */}
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 mr-0.5">Ukuran:</span>
                            {[1.5, 2, 2.5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setWidthScale(s)}
                                    className={cn(
                                        "w-5 h-5 rounded text-[9.5px] font-bold flex items-center justify-center cursor-pointer transition-colors",
                                        widthScale === s
                                            ? "bg-emerald-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                    )}
                                >
                                    {s === 1.5 ? "S" : s === 2 ? "M" : "L"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Compact Single-Row Action Footer ── */}
                <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                        <AppButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyImage}
                            disabled={!cleanBarcode || !previewResult?.dataUrl}
                            className="gap-1 text-xs rounded-xl h-8 px-2.5"
                            title="Salin gambar barcode ke clipboard"
                        >
                            {isCopied ? (
                                <>
                                    <IconCheck size={13} className="text-emerald-600" />
                                    <span>Tersalin!</span>
                                </>
                            ) : (
                                <>
                                    <IconCopy size={13} />
                                    <span>Salin</span>
                                </>
                            )}
                        </AppButton>

                        <AppButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            disabled={!cleanBarcode || !previewResult?.dataUrl}
                            className="gap-1 text-xs rounded-xl h-8 px-2.5"
                            title="Cetak langsung ke printer label"
                        >
                            <IconPrinter size={13} />
                            <span>Cetak</span>
                        </AppButton>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <AppButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadSvg}
                            disabled={!cleanBarcode}
                            className="gap-1 text-xs rounded-xl h-8 px-2.5"
                            title="Unduh format vektor SVG resolusi tak terbatas"
                        >
                            <IconDownload size={13} />
                            <span>SVG</span>
                        </AppButton>

                        <AppButton
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleDownloadPng}
                            disabled={!cleanBarcode}
                            className="gap-1 text-xs rounded-xl h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs shadow-emerald-600/20"
                            title="Unduh gambar PNG 300DPI"
                        >
                            <IconDownload size={13} />
                            <span>Unduh PNG</span>
                        </AppButton>
                    </div>
                </div>
            </div>
        </BaseDialog>
    );
}
