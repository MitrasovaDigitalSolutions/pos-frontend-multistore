import qz from "qz-tray";
import axios from "axios";

const QZ_CERT_CACHE_KEY = "qz_certificate_cache";
const QZ_CONNECT_RETRIES = 2;

class QZService {
    private initialized = false;
    private securityMode: "signed" | "unsigned" | null = null;

    /**
     * Initialise QZ Tray security (certificate + signature).
     *
     * Signed mode needs the backend for both certificate and per-request signing.
     * Serwist can keep the app available offline, but it cannot create QZ
     * signatures for POST payloads while the backend is unreachable.
     */
    private async initSecurity() {
        if (this.initialized) return;

        try {
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                throw new Error("Browser offline, backend signer unavailable");
            }

            const { data: certificate } = await axios.get<string>("/api/proxy/v1/qz/certificate", { timeout: 2000 });

            if (!certificate) {
                throw new Error("Certificate tidak ditemukan");
            }

            try {
                localStorage.setItem(QZ_CERT_CACHE_KEY, certificate);
            } catch {
                // localStorage might be full — non-critical
            }

            qz.security.setCertificatePromise((resolve) => {
                resolve(certificate);
            });

            qz.security.setSignaturePromise((toSign: string) => async (resolve, reject) => {
                try {
                    if (typeof navigator !== "undefined" && !navigator.onLine) {
                        throw new Error("Backend signer unavailable while offline");
                    }

                    const { data: sig } = await axios.post<string>(
                        "/api/proxy/v1/qz/sign",
                        { toSign },
                        { timeout: 2000 }
                    );
                    if (!sig) {
                        throw new Error("Signature gagal dibuat");
                    }
                    resolve(sig);
                } catch (error) {
                    reject(error);
                }
            });

            this.securityMode = "signed";
        } catch (err) {
            console.warn("Gagal memuat signer QZ Tray, beralih ke mode unsigned:", err);
            this.useUnsignedMode();
        } finally {
            this.initialized = true;
        }
    }

    private useUnsignedMode() {
        this.securityMode = "unsigned";
        try {
            // QZ Tray still expects resolver-style handlers. Resolving with no
            // value enables anonymous/unsigned mode when QZ Tray allows it.
            qz.security.setCertificatePromise((resolve) => {
                resolve();
            });
            qz.security.setSignaturePromise(() => (resolve) => {
                resolve();
            });
        } catch (clearErr) {
            console.warn("Gagal mereset keamanan QZ Tray:", clearErr);
        }
    }

    async connect() {
        await this.initSecurity();
        if (qz.websocket.isActive()) {
            return;
        }

        let lastError: unknown;
        for (let attempt = 1; attempt <= QZ_CONNECT_RETRIES; attempt += 1) {
            try {
                await qz.websocket.connect();
                return;
            } catch (error) {
                lastError = error;
                console.warn(`Percobaan koneksi QZ Tray ${attempt} gagal:`, error);

                if (qz.websocket.isActive()) {
                    try {
                        await qz.websocket.disconnect();
                    } catch {
                        // Ignore cleanup failure before retrying.
                    }
                }
            }
        }

        console.error("Gagal terhubung ke QZ Tray:", lastError);
        const unsignedHint = this.securityMode === "unsigned"
            ? " Jika sedang offline, pastikan QZ Tray mengizinkan unsigned requests."
            : "";
        throw new Error(`Gagal terhubung ke QZ Tray. Pastikan aplikasi QZ Tray sedang berjalan.${unsignedHint}`);
    }

    async disconnect() {
        if (qz.websocket.isActive()) {
            await qz.websocket.disconnect();
        }
    }

    async findAllPrinters(): Promise<string[]> {
        await this.connect();
        const printers = await qz.printers.find();
        return Array.isArray(printers) ? printers : [printers];
    }

    async print(printer: string, text: string) {
        await this.connect();

        const config = qz.configs.create(printer);

        await qz.print(config, [
            {
                type: "raw",
                format: "plain",
                data: text
            }
        ]);
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new QZService();