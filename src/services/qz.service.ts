import qz from "qz-tray";
import axios from "axios";

class QZService {
    private initialized = false;
    private initSecurity() {
        if (this.initialized) return;

        qz.security.setCertificatePromise(async () => {
            const { data } = await axios.get("/api/proxy/v1/qz/certificate");
            if (!data) {
                throw new Error("Certificate tidak ditemukan");
            }
            return data;
        });

        qz.security.setSignaturePromise(async (toSign: string) => {
            const { data } = await axios.post("/api/proxy/v1/qz/sign", { toSign });
            if (!data) {
                throw new Error("Signature gagal dibuat");
            }
            return data;
        });

        this.initialized = true;
    }

    async connect() { 
        this.initSecurity(); 
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