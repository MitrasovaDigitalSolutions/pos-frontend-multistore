import type { CartItem, HoldTransaction } from "@/features/checkout/types";
import type { Member } from "@/features/master/members/types";
import type { TutorialId, TutorialMeta, TutorialPreSnapshot } from "../types/tutorial";

export const TUTORIAL_IDS: Record<string, TutorialId> = {
    SESI_KASIR: "sesi_kasir",
    TRANSAKSI_KASIR: "transaksi_kasir",
    HUTANG_MEMBER: "hutang_member",
    HOLD_RECALL_VOID: "hold_recall_void",
    TRANSAKSI_OFFLINE: "transaksi_offline",
    CETAK_ULANG_STRUK: "cetak_ulang_struk",
} as const;

export const TUTORIAL_LIST: TutorialMeta[] = [
    {
        id: "sesi_kasir",
        title: "Pembukaan Sesi Kasir",
        description: "Pelajari cara membuka dan menutup shift kasir serta mengisi saldo modal awal laci kasir.",
        category: "Kasir & Shift",
        stepCount: 4,
        badge: "Wajib Pertama",
    },
    {
        id: "transaksi_kasir",
        title: "Transaksi Penjualan Kasir",
        description: "Alur lengkap scan produk, tambah member, diskon, hingga proses pembayaran F1.",
        category: "Penjualan",
        stepCount: 7,
        badge: "Demo Paling Populer",
    },
    {
        id: "hutang_member",
        title: "Pembayaran Hutang Member",
        description: "Cara mengecek info tunggakan dan menerima cicilan atau pelunasan hutang member.",
        category: "Pelanggan",
        stepCount: 7,
    },
    {
        id: "hold_recall_void",
        title: "Hold, Recall & Void Transaksi",
        description: "Simpan sementara belanjaan antrean (F5), panggil kembali (F6), dan batalkan keranjang (F10).",
        category: "Antrean & Kasir",
        stepCount: 8,
        badge: "Penting Cepat",
    },
    {
        id: "transaksi_offline",
        title: "Mode Transaksi Offline",
        description: "Memahami indikator jaringan, sinkronisasi otomatis, dan keamanan transaksi saat internet mati.",
        category: "Konektivitas",
        stepCount: 5,
    },
    {
        id: "cetak_ulang_struk",
        title: "Cetak Ulang Struk",
        description: "Buka riwayat struk sebelumnya dan cetak kembali receipt belanjaan pelanggan.",
        category: "Riwayat & Struk",
        stepCount: 5,
    },
];

// Mock Products for Interactive Simulation
export const MOCK_PRODUCTS: CartItem[] = [
    {
        product_uid: "tutorial-mock-001",
        name: "Kopi Susu Gula Aren",
        price: 25000,
        qty: 2,
        stock: 100,
        barcode: "8991234567890",
        is_jasa: false,
    },
    {
        product_uid: "tutorial-mock-002",
        name: "Roti Bakar Coklat Keju",
        price: 18000,
        qty: 1,
        stock: 50,
        barcode: "8991234567891",
        is_jasa: false,
    },
    {
        product_uid: "tutorial-mock-003",
        name: "Es Teh Manis Jumbo",
        price: 8000,
        qty: 3,
        stock: 200,
        barcode: "8991234567892",
        is_jasa: false,
    },
];

export const MOCK_MEMBER_NORMAL: Member = {
    uid: "tutorial-mock-member-1",
    kode: "MBR-0042",
    nama: "Budi Santoso",
    email: "budi.santoso@example.com",
    nomor_telepon: "081234567890",
    alamat: "Jl. Merdeka No. 45, Jakarta",
    tanggal_lahir: "1990-05-12",
    jenis_kelamin: "L",
    poin: 1250,
    status: "active",
    hutang: 0,
};

export const MOCK_MEMBER_WITH_DEBT: Member = {
    uid: "tutorial-mock-member-debt",
    kode: "MBR-0099",
    nama: "Siti Rahmawati",
    email: "siti.rahma@example.com",
    nomor_telepon: "085678901234",
    alamat: "Jl. Melati Blok C2, Bandung",
    tanggal_lahir: "1988-11-20",
    jenis_kelamin: "P",
    poin: 480,
    status: "active",
    hutang: 175000,
};

export const MOCK_HOLD_TRANSACTION: HoldTransaction = {
    uid: "tutorial-mock-hold-1",
    nama_transaksi: "Pelanggan A (Pending)",
    items_count: 2,
    subtotal: 43000,
    created_at: new Date().toISOString(),
    discountType: "nominal",
    discountValue: 0,
    items: [
        {
            product_uid: "tutorial-mock-001",
            name: "Kopi Susu Gula Aren",
            price: 25000,
            qty: 1,
            stock: 100,
            barcode: "8991234567890",
        },
        {
            product_uid: "tutorial-mock-002",
            name: "Roti Bakar Coklat Keju",
            price: 18000,
            qty: 1,
            stock: 50,
            barcode: "8991234567891",
        },
    ],
    member: null,
};

export const MOCK_OFFLINE_TRANSACTION = {
    uid: "tutorial-mock-offline-1",
    payload: {
        nomor_transaksi: "TRX-OFF-0042",
        total: 68000,
        metode_pembayaran: "cash",
        customer_name: "Pak Bambang",
    },
    receiptData: {
        transaction_id: "TRX-OFF-0042",
        date: new Date().toISOString(),
        customer_name: "Pak Bambang",
        items: [
            {
                name: "Kopi Susu Gula Aren",
                qty: 2,
                price: 25000,
                subtotal: 50000,
            },
            {
                name: "Roti Bakar Coklat Keju",
                qty: 1,
                price: 18000,
                subtotal: 18000,
            },
        ],
        subtotal: 68000,
        tax: 0,
        discount: 0,
        total: 68000,
        payment_method: "cash",
        cash_amount: 100000,
        change_amount: 32000,
    },
    status: "pending" as const,
    timestamp: new Date().toISOString(),
};

// Timing configurations
export const CURSOR_MOVE_DURATION = 550; // ms for smooth glide
export const CLICK_RIPPLE_DURATION = 350; // ms for ripple pulse
export const TYPING_SPEED = 60; // ms per simulated character
export const ACTION_WAIT_AFTER_CLICK = 300; // ms

// ─── Tutorial Mock Data Detection & Filter Utilities ─────────────────────────
export function isMockProductId(id: string): boolean {
    return typeof id === "string" && id.startsWith("tutorial-mock-");
}

export function isMockCartItem(item: CartItem): boolean {
    return isMockProductId(item.product_uid);
}

export function isMockMember(member: Member | null): boolean {
    return Boolean(member && typeof member.uid === "string" && member.uid.startsWith("tutorial-mock-"));
}

export function isMockHold(hold: HoldTransaction): boolean {
    return typeof hold.uid === "string" && hold.uid.startsWith("tutorial-mock-");
}

export function isMockNamaTransaksi(name: string): boolean {
    if (!name) return false;
    const trimmed = name.trim();
    return (
        trimmed === "Meja 5 - Budi" ||
        trimmed === "Meja 4 - Pak Agus" ||
        trimmed === "Pesanan Meja 12" ||
        trimmed === "Pelanggan A (Pending)" ||
        trimmed === "Pelanggan B" ||
        trimmed.startsWith("Meja 5 - Budi")
    );
}

export function filterOutMockData(snapshot: TutorialPreSnapshot): TutorialPreSnapshot {
    return {
        cart: snapshot.cart.filter((item) => !isMockCartItem(item)),
        selectedMember: isMockMember(snapshot.selectedMember) ? null : snapshot.selectedMember,
        discountType: snapshot.discountType || "nominal",
        discountValue: snapshot.discountValue || 0,
        namaTransaksi: isMockNamaTransaksi(snapshot.namaTransaksi) ? "" : (snapshot.namaTransaksi || ""),
        holdList: snapshot.holdList.filter((h) => !isMockHold(h)),
    };
}

