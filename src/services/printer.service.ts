import axios from "axios";

const BASE_URL = "http://localhost:62000";
const CONNECT_RETRIES = 2;

class PrinterService {
    private connected = false;

    async connect() {
        if (this.connected) return;

        let lastError: unknown;
        for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt += 1) {
            try {
                const { data } = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
                if (data?.message === "ok" || data?.connected) {
                    this.connected = true;
                    return;
                }
                throw new Error("Server tidak merespon dengan status ok");
            } catch (error) {
                lastError = error;
                console.warn(`Percobaan koneksi ke local printer service ${attempt} gagal:`, error);
            }
        }

        throw new Error(
            `Gagal terhubung ke local printer service. Pastikan server printer berjalan.`
        );
    }

    async disconnect() {
        this.connected = false;
    }

    async findAllPrinters() {
        await this.connect();

        const { data } = await axios.get(`${BASE_URL}/printers`, {
            timeout: 3000,
        });

        return data.data || [];
    }

    async print(printer: string, text: string) {
        await this.connect();

        await axios.post(
            `${BASE_URL}/print`,
            { printer, content: text },
            { timeout: 10000 }
        );
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new PrinterService();