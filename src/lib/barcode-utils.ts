import JsBarcode from "jsbarcode";

/**
 * Calculates EAN-13 check digit using standard modulo 10 algorithm.
 */
export function calculateEan13CheckDigit(digits12: string): number {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const num = parseInt(digits12[i], 10) || 0;
        sum += i % 2 === 0 ? num : num * 3;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
}

/**
 * Generates a valid standard 13-digit internal retail barcode (GS1 prefix 20-29).
 */
export function generateEan13Barcode(prefix = "20"): string {
    const timestamp = Date.now().toString().slice(-8); // 8 digits
    const random = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0"); // 2 digits
    const base12 = (prefix + timestamp + random).slice(0, 12);
    const checkDigit = calculateEan13CheckDigit(base12);
    return `${base12}${checkDigit}`;
}

/**
 * Generates an alphanumeric SKU code (e.g., PRD-2026-X8K9).
 */
export function generateSkuCode(prefix = "PRD"): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    return `${prefix}${year}${month}-${randomPart}`;
}

export interface BarcodeExportOptions {
    barcode: string;
    productName?: string;
    priceFormatted?: string;
    format?: "CODE128" | "EAN13" | "UPC" | "CODE39";
    showName?: boolean;
    showPrice?: boolean;
    showText?: boolean;
    widthScale?: number;
}

export interface BarcodePreviewResult {
    dataUrl: string;
    usedFormat: string;
    isFallback: boolean;
}

/**
 * Generates a standalone barcode data URL with automatic fallback to CODE128
 * if the selected format does not support the given input string.
 */
export function generateBarcodePreviewDataUrl(options: BarcodeExportOptions): BarcodePreviewResult | null {
    if (typeof window === "undefined" || !options.barcode?.trim()) {
        return null;
    }

    const cleanBarcode = options.barcode.trim();
    const desiredFormat = options.format || "CODE128";
    const widthScale = options.widthScale || 2;
    const showText = options.showText ?? true;

    const canvas = document.createElement("canvas");
    let usedFormat = desiredFormat;
    let isFallback = false;

    // Try desired format first
    let success = false;
    try {
        JsBarcode(canvas, cleanBarcode, {
            format: desiredFormat,
            width: widthScale,
            height: 64,
            displayValue: showText,
            font: "monospace",
            fontSize: 13,
            textMargin: 4,
            margin: 6,
            lineColor: "#000000",
            background: "#ffffff",
        });
        success = true;
    } catch {
        success = false;
    }

    // If failed and not already CODE128, automatically fallback to universal CODE128
    if (!success && desiredFormat !== "CODE128") {
        try {
            JsBarcode(canvas, cleanBarcode, {
                format: "CODE128",
                width: widthScale,
                height: 64,
                displayValue: showText,
                font: "monospace",
                fontSize: 13,
                textMargin: 4,
                margin: 6,
                lineColor: "#000000",
                background: "#ffffff",
            });
            usedFormat = "CODE128";
            isFallback = true;
            success = true;
        } catch {
            success = false;
        }
    }

    if (!success) {
        return null;
    }

    return {
        dataUrl: canvas.toDataURL("image/png"),
        usedFormat,
        isFallback,
    };
}

/**
 * Renders a high-resolution label sticker canvas suitable for thermal printing and PNG export.
 */
export function createBarcodeLabelCanvas(options: BarcodeExportOptions): HTMLCanvasElement {
    const {
        barcode,
        productName = "",
        priceFormatted = "",
        format = "CODE128",
        showName = true,
        showPrice = true,
        showText = true,
        widthScale = 2,
    } = options;

    const canvas = document.createElement("canvas");
    const dpr = 2; // high-res scale for crisp 300dpi thermal printing

    // Virtual label dimensions in px
    const baseWidth = 360;
    const padding = 20;
    let baseHeight = 150;

    if (showName && productName) baseHeight += 32;
    if (showPrice && priceFormatted) baseHeight += 34;

    canvas.width = baseWidth * dpr;
    canvas.height = baseHeight * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    ctx.scale(dpr, dpr);

    // Clean white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    let currentY = padding;

    // Product Title
    if (showName && productName) {
        ctx.fillStyle = "#0f172a"; // slate-900
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        let displayName = productName;
        const maxTextWidth = baseWidth - padding * 2;
        while (ctx.measureText(displayName).width > maxTextWidth && displayName.length > 5) {
            displayName = `${displayName.slice(0, -4)}...`;
        }

        ctx.fillText(displayName, baseWidth / 2, currentY);
        currentY += 24;
    }

    // Temporary canvas to generate barcode bars using JsBarcode with fallback
    const tempCanvas = document.createElement("canvas");
    let renderOk = false;
    try {
        JsBarcode(tempCanvas, barcode, {
            format,
            width: widthScale,
            height: 60,
            displayValue: showText,
            font: "monospace",
            fontSize: 13,
            textMargin: 4,
            margin: 0,
            lineColor: "#000000",
            background: "#ffffff",
        });
        renderOk = true;
    } catch {
        // Fallback to CODE128
        try {
            JsBarcode(tempCanvas, barcode, {
                format: "CODE128",
                width: widthScale,
                height: 60,
                displayValue: showText,
                font: "monospace",
                fontSize: 13,
                textMargin: 4,
                margin: 0,
                lineColor: "#000000",
                background: "#ffffff",
            });
            renderOk = true;
        } catch {
            renderOk = false;
        }
    }

    if (renderOk && tempCanvas.width > 0) {
        const barcodeWidth = tempCanvas.width;
        const barcodeHeight = tempCanvas.height;
        const barcodeX = Math.max(padding, (baseWidth - barcodeWidth) / 2);

        ctx.drawImage(tempCanvas, barcodeX, currentY);
        currentY += barcodeHeight + 8;
    } else {
        ctx.fillStyle = "#64748b";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(barcode, baseWidth / 2, currentY + 16);
        currentY += 32;
    }

    // Price
    if (showPrice && priceFormatted) {
        ctx.fillStyle = "#047857"; // emerald-700
        ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(priceFormatted, baseWidth / 2, currentY + 4);
    }

    return canvas;
}

/**
 * Downloads the barcode label as a crisp PNG image.
 */
export function downloadBarcodeAsPng(options: BarcodeExportOptions, filename?: string) {
    const canvas = createBarcodeLabelCanvas(options);
    const link = document.createElement("a");
    const sanitizedName = (options.productName || "produk")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 30);
    link.download = filename || `barcode-${sanitizedName}-${options.barcode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

/**
 * Downloads the barcode as an SVG vector file.
 */
export function downloadBarcodeAsSvg(options: BarcodeExportOptions, filename?: string) {
    if (typeof window === "undefined") return;

    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    try {
        JsBarcode(svgElement, options.barcode, {
            format: options.format || "CODE128",
            width: options.widthScale || 2,
            height: 64,
            displayValue: options.showText ?? true,
            font: "monospace",
            fontSize: 13,
            textMargin: 4,
            margin: 8,
            lineColor: "#000000",
            background: "#ffffff",
        });
    } catch {
        try {
            JsBarcode(svgElement, options.barcode, {
                format: "CODE128",
                width: options.widthScale || 2,
                height: 64,
                displayValue: options.showText ?? true,
                font: "monospace",
                fontSize: 13,
                textMargin: 4,
                margin: 8,
                lineColor: "#000000",
                background: "#ffffff",
            });
        } catch {
            return;
        }
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedName = (options.productName || "produk")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 30);
    link.download = filename || `barcode-${sanitizedName}-${options.barcode}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Copies the barcode label image directly to clipboard.
 */
export async function copyBarcodeImageToClipboard(options: BarcodeExportOptions): Promise<boolean> {
    try {
        const canvas = createBarcodeLabelCanvas(options);
        return new Promise((resolve) => {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    resolve(false);
                    return;
                }
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            "image/png": blob,
                        }),
                    ]);
                    resolve(true);
                } catch {
                    resolve(false);
                }
            }, "image/png");
        });
    } catch {
        return false;
    }
}
