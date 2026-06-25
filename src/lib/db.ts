import Dexie, { type Table } from "dexie";
import type { Product } from "@/features/products/types";
import type { Member } from "@/features/members/types";

export interface OfflineTransaction {
    id?: number; // Auto-incremented local primary key
    uid: string; // Client-generated UUID (for idempotency)
    payload: Record<string, unknown>; // The request body for /v1/transactions
    timestamp: string;
    status: "pending" | "syncing" | "failed";
    errorMessage?: string;
}

class POSDatabase extends Dexie {
    products!: Table<Product, string>;
    members!: Table<Member, string>;
    offlineQueue!: Table<OfflineTransaction, number>;

    constructor() {
        super("POSDatabase");
        this.version(2).stores({
            products: "uid, nama, barcode, status, updated_at",
            members: "uid, nama, kode, status, updated_at",
            offlineQueue: "++id, uid, timestamp, status",
        });
    }
}

export const db = new POSDatabase();

if (typeof window !== "undefined") {
    // Auto-recovery for database upgrade schema changes (e.g. changing primary key)
    db.open().catch((err) => {
        console.warn("Gagal membuka database, menghapus dan membuat ulang database lokal:", err);
        Dexie.delete("POSDatabase").then(() => {
            db.open().catch((err2) => {
                console.error("Gagal membuka database baru setelah pembuatan ulang:", err2);
            });
        });
    });
}
