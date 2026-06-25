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
        this.version(1).stores({
            products: "uid, nama, barcode, status, updated_at",
            members: "uid, nama, kode, updated_at",
            offlineQueue: "++uid, uid, timestamp, status",
        });
    }
}

export const db = new POSDatabase();
