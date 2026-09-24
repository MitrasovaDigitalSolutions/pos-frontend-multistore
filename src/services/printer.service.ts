import axios from "axios";

const BASE_URL = "http://localhost:62000";
const CONNECT_RETRIES = 2;

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

        for (
            let attempt = 1;
            attempt <= CONNECT_RETRIES;
            attempt += 1
        ) {
            try {
                const { data } = await axios.get(
                    `${BASE_URL}/health`,
                    {
                        timeout: 3000,
                    }
                );

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

        const { data } = await axios.get(
            `${BASE_URL}/printers`,
            {
                timeout: 3000,
            }
        );

        return data.data || [];
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
         * TIDAK DIUBAH
         */
        await this.connect();

        await axios.post(
            `${BASE_URL}/print`,
            {
                printer,
                content: text,
            },
            {
                timeout: 10000,
            }
        );
    }
}

const printerService = new PrinterService();
export default printerService;