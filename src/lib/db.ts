import Dexie, { type Table } from "dexie";
import type { Product } from "@/features/products/types";
import type { Member } from "@/features/members/types";

export interface OfflineTransaction {
    id?: number; // Auto-incremented local primary key
    uid: string; // Client-generated UUID (for idempotency)
    payload: any; // The request body for /v1/transactions
    timestamp: string;
    status: "pending" | "syncing" | "failed";
    errorMessage?: string;
}

class POSDatabase extends Dexie {
    products!: Table<Product, number>;
    members!: Table<Member, number>;
    offlineQueue!: Table<OfflineTransaction, number>;

    constructor() {
        super("POSDatabase");
        this.version(1).stores({
            products: "id, nama, barcode, status, updated_at",
            members: "id, nama, kode, updated_at",
            offlineQueue: "++id, uid, timestamp, status",
        });
    }
}

export const db = new POSDatabase();
