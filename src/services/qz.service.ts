import qz from "qz-tray";
import axios from "axios";

class QZService {
    private initialized = false;
    private async initSecurity() {
        if (this.initialized) return;

        try {
            if (typeof window !== "undefined" && !window.navigator.onLine) {
                throw new Error("Browser is offline");
            }

            const { data } = await axios.get("/api/proxy/v1/qz/certificate", { timeout: 1000 });
            console.log("CERTIFICATE:", data);
            if (!data) {
                throw new Error("Certificate tidak ditemukan");
            }

            qz.security.setCertificatePromise(() => Promise.resolve(data));

            qz.security.setSignaturePromise(async (toSign) => {
                const res = await fetch("/api/proxy/v1/qz/sign", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ toSign }),
                });

                const signature = await res.text();

                return signature;
            });
            qz.security.setSignaturePromise(async (toSign: string) => {
                console.log("TO SIGN:", toSign);
                const { data: sig } = await axios.post("/api/proxy/v1/qz/sign", { toSign }, { timeout: 2000 });
                console.log("SIGNATURE:", sig);
                if (!sig) {
                    throw new Error("Signature gagal dibuat");
                }
                return sig;
            });

            this.initialized = true;
        } catch (err) {
            console.warn("Gagal memuat sertifikat QZ Tray (offline/error), beralih ke mode unsigned:", err);
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                qz.security.setCertificatePromise(null as any);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                qz.security.setSignaturePromise(null as any);
            } catch (clearErr) {
                console.warn("Gagal mereset keamanan QZ Tray:", clearErr);
            }
        }
    }

    async connect() {
        await this.initSecurity();
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