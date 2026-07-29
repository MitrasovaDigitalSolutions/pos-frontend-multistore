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

class POSDatabase extends Dexie {
    products!: Table<Product, string>;
    members!: Table<Member, string>;
    offlineQueue!: Table<OfflineTransaction, number>;
    offlineTransactions!: Table<OfflineTransactionRecord, string>;
    cashDrawerSessions!: Table<CashDrawerSession, string>;
    cashDrawerMovements!: Table<CashDrawerMovement, string>;
    offlineDrawerActions!: Table<OfflineDrawerAction, number>;
    offlineDebtPayments!: Table<OfflineDebtPaymentRecord, string>;

    constructor() {
        super("POSDatabase");
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
