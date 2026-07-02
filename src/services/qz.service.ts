import qz from "qz-tray";
import axios from "axios";

const QZ_CERT_CACHE_KEY = "qz_certificate_cache";

class QZService {
    private initialized = false;
    private activeConnectionSigned = false;

    private setUnsignedMode() {
        try {
            qz.security.setCertificatePromise(() => Promise.resolve(""));
            qz.security.setSignaturePromise(() => Promise.resolve(""));
        } catch (err) {
            console.warn("Gagal mengatur QZ Tray ke mode unsigned:", err);
        }
    }

    /**
     * Initialise QZ Tray security (certificate + signature).
     *
     * Strategy:
     *  1. Try to fetch the certificate from the backend API.
     *  2. On success → cache it in localStorage for offline use.
     *  3. On failure → fall back to a previously cached certificate.
     *  4. If neither is available → run in unsigned mode.
     */
    private async initSecurity() {
        if (this.initialized) return;

        try {
            let certificate: string | null = null;

            // 1. Try fetching from backend
            try {
                const { data } = await axios.get("/api/proxy/v1/qz/certificate", { timeout: 2000 });
                if (data) {
                    certificate = data;
                    // Cache for offline use
                    try {
                        localStorage.setItem(QZ_CERT_CACHE_KEY, data);
                    } catch {
                        // localStorage might be full — non-critical
                    }
                }
            } catch {
                // API unreachable — try cached certificate
                try {
                    certificate = localStorage.getItem(QZ_CERT_CACHE_KEY);
                } catch {
                    // localStorage unavailable
                }
            }

            if (!certificate) {
                throw new Error("Certificate tidak ditemukan (API dan cache kosong)");
            }

            qz.security.setCertificatePromise(() => Promise.resolve(certificate));

            qz.security.setSignaturePromise(async (toSign: string) => {
                try {
                    const { data: sig } = await axios.post(
                        "/api/proxy/v1/qz/sign",
                        { toSign },
                        { timeout: 2000 }
                    );
                    if (!sig) {
                        throw new Error("Signature gagal dibuat");
                    }
                    return sig;
                } catch (signErr) {
                    console.warn("Gagal membuat signature, mereset QZ Tray ke mode unsigned:", signErr);
                    this.setUnsignedMode();
                    this.initialized = false;
                    this.activeConnectionSigned = false;
                    try {
                        await qz.websocket.disconnect();
                    } catch (discErr) {
                        console.warn("Gagal memutuskan koneksi saat reset:", discErr);
                    }
                    throw signErr;
                }
            });

            this.initialized = true;
        } catch (err) {
            console.warn("Gagal memuat sertifikat QZ Tray, beralih ke mode unsigned:", err);
            this.setUnsignedMode();
        }
    }

    async connect() {
        const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

        // If the network status (online/offline) doesn't match the active connection mode,
        // we must disconnect the websocket so it can reconnect in the correct mode.
        if (qz.websocket.isActive()) {
            if (isOffline && this.activeConnectionSigned) {
                console.log("Aplikasi offline tapi koneksi QZ aktif dalam mode signed. Memutus koneksi...");
                try {
                    await this.disconnect();
                } catch (err) {
                    console.warn("Gagal memutus koneksi signed:", err);
                }
            } else if (!isOffline && !this.activeConnectionSigned && this.initialized) {
                console.log("Aplikasi online tapi koneksi QZ aktif dalam mode unsigned. Memutus koneksi...");
                try {
                    await this.disconnect();
                } catch (err) {
                    console.warn("Gagal memutus koneksi unsigned:", err);
                }
            }
        }

        if (isOffline) {
            console.warn("Aplikasi offline. Menggunakan mode unsigned untuk QZ Tray.");
            this.setUnsignedMode();
            this.initialized = false;
            this.activeConnectionSigned = false;
        } else {
            await this.initSecurity();
            this.activeConnectionSigned = true;
        }

        if (qz.websocket.isActive()) {
            return;
        }
        try {
            await qz.websocket.connect();
        } catch (error) {
            console.error("Gagal terhubung ke QZ Tray:", error);
            throw new Error("Gagal terhubung ke QZ Tray. Pastikan aplikasi QZ Tray sedang berjalan.");
        }
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