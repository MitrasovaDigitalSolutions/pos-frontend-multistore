import Dexie, { type Table } from "dexie";
import type { Product } from "@/features/master/products/types";
import type { Member } from "@/features/master/members/types";
import type { Receipt } from "@/features/checkout/types";

export interface OfflineTransaction {
    id?: number; // Auto-incremented local primary key
    uid: string; // Client-generated UUID (for idempotency)
    payload: Record<string, unknown>; // The request body for /v1/transactions
    timestamp: string;
    status: "pending" | "syncing" | "failed";
    errorMessage?: string;
}

import type { CashDrawerSession, CashDrawerMovement } from "@/features/checkout/types";

export interface OfflineDrawerAction {
    id?: number;
    session_uid: string;
    type: "cash_in" | "cash_out";
    payload: {
        amount: number;
        note?: string;
        expense_category_uid?: string | null;
    };
    timestamp: string;
    status: "pending" | "syncing" | "failed";
    errorMessage?: string;
}

// Permanent offline transaction history (for monitoring)
export interface OfflineTransactionRecord {
    uid: string;              // Client-generated UUID (matches offlineQueue.uid)
    payload: Record<string, unknown>;
    receiptData: Receipt;     // Snapshot receipt for display
    status: "pending" | "synced" | "failed";
    timestamp: string;        // created_at (ISO string)
    syncedAt?: string;        // When it was successfully synced
    errorMessage?: string;
}

// Offline debt payment record (for member debt payments made while offline)
export interface OfflineDebtPaymentRecord {
    uid: string;              // Client-generated UUID for idempotency
    member_uid: string;       // UID of the member paying
    member_nama: string;      // Member name snapshot for display
    payload: Record<string, unknown>; // The pay-debt payload + uid + tanggal_bayar
    status: "pending" | "synced" | "failed";
    timestamp: string;        // created_at (ISO string)
    syncedAt?: string;
    errorMessage?: string;
    amount: number;           // Payment amount for display
    metode_pembayaran: "cash" | "card"; // Payment method for display
}

import { useActiveStoreStore } from "@/stores/active-store-store";

export class POSDatabase extends Dexie {
    products!: Table<Product, string>;
    members!: Table<Member, string>;
    offlineQueue!: Table<OfflineTransaction, number>;
    offlineTransactions!: Table<OfflineTransactionRecord, string>;
    cashDrawerSessions!: Table<CashDrawerSession, string>;
    cashDrawerMovements!: Table<CashDrawerMovement, string>;
    offlineDrawerActions!: Table<OfflineDrawerAction, number>;
    offlineDebtPayments!: Table<OfflineDebtPaymentRecord, string>;

    constructor(dbName = "POSDatabase") {
        super(dbName);
        this.version(2).stores({
            products: "uid, nama, barcode, status, updated_at",
            members: "uid, nama, kode, status, updated_at",
            offlineQueue: "++id, uid, timestamp, status",
        });
        this.version(3).stores({
            products: "uid, nama, barcode, status, updated_at",
            members: "uid, nama, kode, status, updated_at",
            offlineQueue: "++id, uid, timestamp, status",
            offlineTransactions: "uid, timestamp, status",
        });
        this.version(4).stores({
            products: "uid, nama, barcode, status, updated_at",
            members: "uid, nama, kode, status, updated_at",
            offlineQueue: "++id, uid, timestamp, status",
            offlineTransactions: "uid, timestamp, status",
            cashDrawerSessions: "uid, status, opened_at",
            cashDrawerMovements: "uid, cash_drawer_session_uid, type, created_at",
            offlineDrawerActions: "++id, session_uid, type, timestamp, status",
        });
        this.version(5).stores({
            products: "uid, nama, barcode, status, updated_at",
            members: "uid, nama, kode, status, updated_at",
            offlineQueue: "++id, uid, timestamp, status",
            offlineTransactions: "uid, timestamp, status",
            cashDrawerSessions: "uid, status, opened_at",
            cashDrawerMovements: "uid, cash_drawer_session_uid, type, created_at",
            offlineDrawerActions: "++id, session_uid, type, timestamp, status",
            offlineDebtPayments: "uid, member_uid, timestamp, status",
        });
    }
}

// Multi-Store Database Instance Cache
const dbInstances = new Map<string, POSDatabase>();

export function getDb(storeUid?: string | null): POSDatabase {
    const activeUid = storeUid ?? useActiveStoreStore.getState().activeStoreUid;
    const dbName = activeUid ? `POSDatabase_${activeUid}` : "POSDatabase";

    let instance = dbInstances.get(dbName);
    if (!instance) {
        instance = new POSDatabase(dbName);
        dbInstances.set(dbName, instance);

        if (typeof window !== "undefined") {
            instance.open().catch((err) => {
                console.warn(`Gagal membuka database ${dbName}, mereset schema:`, err);
                Dexie.delete(dbName).then(() => {
                    instance?.open().catch((err2) => {
                        console.error(`Gagal membuka database ${dbName} setelah reset:`, err2);
                    });
                });
            });
        }
    }
    return instance;
}

/**
 * Dynamic DB Proxy yang secara otomatis mengarah ke database cabang (Store) yang sedang aktif.
 * Memastikan data produk, member, stok, dan antrean transaksi offline terisolasi 100% per cabang!
 */
export const db = new Proxy({} as POSDatabase, {
    get(_target, prop) {
        const activeDb = getDb();
        const value = (activeDb as unknown as Record<string, unknown>)[prop as string];
        if (typeof value === "function") {
            return value.bind(activeDb);
        }
        return value;
    },
});
