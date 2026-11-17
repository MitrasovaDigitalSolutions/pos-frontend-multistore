import axios from "axios";

const BASE_URL = "http://localhost:62000";
const CONNECT_RETRIES = 2;
// Percobaan pertama bisa memunculkan prompt LNA; beri waktu user klik Allow.
const FIRST_CONNECT_TIMEOUT = 15000;
// Scanning seluruh printer di Windows butuh waktu ekstra bila ada printer offline/network.
const PRINTER_SCAN_TIMEOUT = 20000;

export interface PrinterDevice {
    id?: string;
    name: string;
    description?: string;
    isDefault?: boolean;
}

interface FlutterResponse {
    requestId: string;
    success: boolean;
    data?: unknown;
    message?: string;
}

declare global {
    interface Window {
        FlutterBridge?: {
            postMessage: (message: string) => void;
        };

        FlutterPrinterCallback?: (message: string) => void;
    }
}

class PrinterService {
    private connected = false;

    private pendingRequests = new Map<
        string,
        {
            resolve: (data: unknown) => void;
            reject: (error: Error) => void;
        }
    >();

    constructor() {
        if (typeof window !== "undefined") {
            window.FlutterPrinterCallback = (message: string) => {
                this.handleFlutterResponse(message);
            };
        }
    }

    /**
     * true hanya ketika website sedang dibuka
     * melalui Flutter WebView.
     */
    private isFlutter(): boolean {
        return (
            typeof window !== "undefined" &&
            typeof window.FlutterBridge?.postMessage === "function"
        );
    }

    /**
     * Chrome 136+ memblokir request ke localhost sampai origin diizinkan
     * lewat izin "Aplikasi di perangkat" (Apps on device) di site settings.
     * Izin ini muncul di UI Chrome sebagai "Apps on device" dan di
     * chrome://settings/content/loopbackNetwork untuk akses localhost.
     *
     * Permissions API: Chrome mengenali nama "local-network-access" ATAU
     * "loopback-network" tergantung versi — kita coba keduanya dengan fallback.
     * Prompt hanya muncul saat request dipicu oleh gesture user (klik tombol).
     */
    private async assertLocalNetworkAccess(): Promise<void> {
        const permissions = typeof navigator !== "undefined" ? navigator.permissions : undefined;
        if (!permissions?.query) return; // browser tanpa Permissions API

        // Coba "local-network-access" (Chrome 136+), fallback ke "loopback-network"
        const state = await permissions
            .query({ name: "local-network-access" as PermissionName })
            .catch(() =>
                permissions
                    .query({ name: "loopback-network" as PermissionName })
                    .catch(() => ({ state: "prompt" as PermissionState }))
            )
            .then((status) => (status as PermissionStatus).state ?? "prompt");

        if (state === "denied") {
            throw new Error(
                'Akses printer diblokir browser. Klik ikon setelan situs di samping kiri alamat URL → "Setelan situs" → "Aplikasi di perangkat" (Apps on device) → ubah ke Izinkan, lalu muat ulang halaman.'
            );
        }
    }

    /**
     * =========================================================
     * FLUTTER RESPONSE
     * =========================================================
     */
    private handleFlutterResponse(message: string): void {
        try {
            const response: FlutterResponse = JSON.parse(message);

            const pending = this.pendingRequests.get(
                response.requestId
            );

            if (!pending) {
                console.warn(
                    "Flutter request tidak ditemukan:",
                    response.requestId
                );
                return;
            }

            this.pendingRequests.delete(
                response.requestId
            );

            if (response.success) {
                pending.resolve(response.data);
            } else {
                pending.reject(
                    new Error(
                        response.message ||
                        "Printer operation failed"
                    )
                );
            }
        } catch (error) {
            console.error(
                "Invalid Flutter response:",
                error
            );
        }
    }

    /**
     * Kirim request ke Flutter dan tunggu response.
     */
    private sendToFlutter<T = unknown>(
        action: string,
        data?: unknown
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (!this.isFlutter()) {
                reject(
                    new Error(
                        "Flutter printer bridge tidak tersedia"
                    )
                );

                return;
            }

            const requestId = crypto.randomUUID();

            this.pendingRequests.set(requestId, {
                resolve: (data: unknown) => {
                    resolve(data as T);
                },
                reject,
            });

            window.FlutterBridge!.postMessage(
                JSON.stringify({
                    action,
                    requestId,
                    data,
                })
            );
        });
    }

    /**
     * =========================================================
     * CONNECT
     * =========================================================
     */
    async connect(printer?: string) {
        /**
         * FLUTTER
         */
        if (this.isFlutter()) {
            await this.sendToFlutter(
                "printer_connect",
                printer
                    ? {
                        printer,
                    }
                    : undefined
            );

            this.connected = true;
            return;
        }

        /**
         * HTTP DESKTOP
         * TIDAK DIUBAH
         */
        if (this.connected) {
            return;
        }

        await this.assertLocalNetworkAccess();

        for (
            let attempt = 1;
            attempt <= CONNECT_RETRIES;
            attempt += 1
        ) {
            try {
                const timeoutMs = attempt === 1 ? FIRST_CONNECT_TIMEOUT : 5000;
                let data: { message?: string; connected?: boolean } | undefined;

                try {
                    const res = await axios.get(
                        `${BASE_URL}/health`,
                        {
                            // Percobaan pertama = pemicu prompt izin LNA, beri waktu user klik Allow
                            timeout: timeoutMs,
                        }
                    );
                    data = res.data;
                } catch (axiosErr) {
                    // Fallback ke native fetch jika XHR diblokir atau timeout
                    if (typeof window !== "undefined" && typeof window.fetch === "function") {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                        try {
                            const fetchRes = await fetch(`${BASE_URL}/health`, {
                                signal: controller.signal,
                            });
                            clearTimeout(timeoutId);
                            if (fetchRes.ok) {
                                data = await fetchRes.json();
                            } else {
                                throw axiosErr;
                            }
                        } catch {
                            clearTimeout(timeoutId);
                            throw axiosErr;
                        }
                    } else {
                        throw axiosErr;
                    }
                }

                if (
                    data?.message === "ok" ||
                    data?.connected
                ) {
                    this.connected = true;
                    return;
                }

                throw new Error(
                    "Server tidak merespon dengan status ok"
                );
            } catch (error) {
                console.warn(
                    `Percobaan koneksi ke local printer service ${attempt} gagal:`,
                    error
                );
            }
        }

        throw new Error(
            "Gagal terhubung ke local printer service. Pastikan server printer berjalan."
        );
    }

    /**
     * =========================================================
     * DISCONNECT
     * =========================================================
     */
    async disconnect() {
        /**
         * FLUTTER
         */
        if (this.isFlutter()) {
            await this.sendToFlutter(
                "printer_disconnect"
            );

            this.connected = false;
            return;
        }

        /**
         * HTTP DESKTOP
         * TETAP SEPERTI SEBELUMNYA
         */
        this.connected = false;
    }

    /**
     * =========================================================
     * FIND PRINTERS
     * =========================================================
     */
    async findAllPrinters(): Promise<PrinterDevice[]> {
        /**
         * FLUTTER
         */
        if (this.isFlutter()) {
            return await this.sendToFlutter<
                PrinterDevice[]
            >("printer_scan");
        }

        /**
         * HTTP DESKTOP
         * TIDAK DIUBAH
         */
        await this.connect();

        let rawData: unknown;
        try {
            const { data } = await axios.get(
                `${BASE_URL}/printers`,
                {
                    timeout: PRINTER_SCAN_TIMEOUT,
                }
            );
            rawData = data;
        } catch (axiosErr) {
            // Fallback ke native fetch jika XMLHttpRequest (Axios) timeout/dibatalkan oleh browser
            if (typeof window !== "undefined" && typeof window.fetch === "function") {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), PRINTER_SCAN_TIMEOUT);
                try {
                    const res = await fetch(`${BASE_URL}/printers`, {
                        signal: controller.signal,
                        headers: {
                            Accept: "application/json, text/plain, */*",
                            // targetAddressSpace: 'loopback',
                        },
                    });
                    clearTimeout(timeoutId);
                    if (res.ok) {
                        rawData = await res.json();
                    } else {
                        throw axiosErr;
                    }
                } catch {
                    clearTimeout(timeoutId);
                    throw axiosErr;
                }
            } else {
                throw axiosErr;
            }
        }

        if (Array.isArray(rawData)) {
            return rawData as PrinterDevice[];
        }

        return ((rawData as { data?: PrinterDevice[] })?.data) || [];
    }

    /**
     * =========================================================
     * PRINT
     * =========================================================
     */
    async print(
        printer: string,
        text: string
    ) {
        /**
         * FLUTTER
         */
        if (this.isFlutter()) {
            await this.sendToFlutter(
                "print",
                {
                    printer,
                    text,
                }
            );

            return;
        }

        /**
         * HTTP DESKTOP
         */
        await this.connect();

        try {
            await axios.post(
                `${BASE_URL}/print`,
                {
                    printer,
                    content: text,
                },
                {
                    timeout: 15000,
                }
            );
        } catch (axiosErr) {
            if (typeof window !== "undefined" && typeof window.fetch === "function") {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);
                try {
                    const res = await fetch(`${BASE_URL}/print`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            printer,
                            content: text,
                        }),
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                    if (!res.ok) {
                        throw axiosErr;
                    }
                } catch {
                    clearTimeout(timeoutId);
                    throw axiosErr;
                }
            } else {
                throw axiosErr;
            }
        }
    }
}

const printerService = new PrinterService();
export default printerService;