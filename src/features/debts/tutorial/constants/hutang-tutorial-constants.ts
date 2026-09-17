import type { Member } from "@/features/master/members/types";
import type { SupplierDebtSummary, Receiving } from "@/features/purchase/types";
import type { MemberPayment } from "@/features/master/members/api/members-api";
import type { HutangTutorialMeta } from "../types/hutang-tutorial";

/**
 * Mock data in-memory untuk modul Hutang. Dipakai hanya saat tutorial berjalan agar
 * tabel selalu terisi data contoh (prefix uid `tutorial-mock-`), tanpa menyentuh backend.
 */

export const MOCK_MEMBER_DEBTS: {
    data: Member[];
    summary: { total_members_with_debt: number; total_hutang: number };
} = {
    data: [
        {
            uid: "tutorial-mock-member-1",
            kode: "MBR-DEMO-01",
            nama: "Budi Santoso (Demo)",
            email: null,
            nomor_telepon: "0812-0000-0001",
            alamat: "Jl. Demo No. 1",
            tanggal_lahir: null,
            jenis_kelamin: "L",
            poin: 120,
            status: "active",
            hutang: 450000,
        },
        {
            uid: "tutorial-mock-member-2",
            kode: "MBR-DEMO-02",
            nama: "Siti Aminah (Demo)",
            email: "siti@demo.local",
            nomor_telepon: "0812-0000-0002",
            alamat: null,
            tanggal_lahir: null,
            jenis_kelamin: "P",
            poin: 80,
            status: "active",
            hutang: 275000,
        },
    ],
    summary: { total_members_with_debt: 2, total_hutang: 725000 },
};

export const MOCK_SUPPLIER_DEBTS: SupplierDebtSummary[] = [
    {
        supplier_uid: "tutorial-mock-supplier-1",
        nama_supplier: "PT Sumber Rejeki (Demo)",
        email: null,
        nomor_telepon: "021-0000001",
        alamat: "Kawasan Industri Demo",
        total_nilai_faktur: 12500000,
        total_dibayar: 8000000,
        total_hutang: 4500000,
    },
    {
        supplier_uid: "tutorial-mock-supplier-2",
        nama_supplier: "CV Makmur Sentosa (Demo)",
        email: null,
        nomor_telepon: "021-0000002",
        alamat: null,
        total_nilai_faktur: 6200000,
        total_dibayar: 4000000,
        total_hutang: 2200000,
    },
];

export const MOCK_SUPPLIER_RECEIVINGS: Receiving[] = [
    {
        uid: "tutorial-mock-rec-1",
        nomor_penerimaan: "RCV/Demo/0001",
        supplier_uid: "tutorial-mock-supplier-1",
        supplier: "PT Sumber Rejeki (Demo)",
        nomor_faktur: "INV/Demo/0001",
        nilai_faktur: 7500000,
        status: "completed",
        status_pembayaran: "partial",
        total_dibayar: 4000000,
        sisa_hutang: 3500000,
        catatan: null,
        created_at: "2026-09-05T08:00:00.000Z",
        tanggal_terima: "2026-09-05",
    },
    {
        uid: "tutorial-mock-rec-2",
        nomor_penerimaan: "RCV/Demo/0002",
        supplier_uid: "tutorial-mock-supplier-1",
        supplier: "PT Sumber Rejeki (Demo)",
        nomor_faktur: "INV/Demo/0002",
        nilai_faktur: 5000000,
        status: "completed",
        status_pembayaran: "unpaid",
        total_dibayar: 4000000,
        sisa_hutang: 1000000,
        catatan: null,
        created_at: "2026-09-08T08:00:00.000Z",
        tanggal_terima: "2026-09-08",
    },
];

export const MOCK_MEMBER_PAYMENTS: MemberPayment[] = [
    {
        uid: "tutorial-mock-pay-1",
        member_uid: "tutorial-mock-member-1",
        nomor_pembayaran: "PAY/Demo/0001",
        jumlah_bayar: 150000,
        metode_pembayaran: "cash",
        cash_received: 150000,
        kembalian: 0,
        jenis_kartu: null,
        nomor_kartu_akhir: null,
        referensi_edc: null,
        hutang_sebelum: 600000,
        hutang_sesudah: 450000,
        tanggal_bayar: "2026-09-14T09:00:00.000Z",
        catatan: "Cicilan ke-1 (Demo)",
        catatan_void: null,
        status: "success",
        created_at: "2026-09-14T09:00:00.000Z",
        member: {
            uid: "tutorial-mock-member-1",
            kode: "MBR-DEMO-01",
            nama: "Budi Santoso (Demo)",
            email: null,
            nomor_telepon: null,
            alamat: null,
            tanggal_lahir: null,
            jenis_kelamin: "L",
            poin: 120,
            status: "active",
            hutang: 450000,
        },
    },
];

export const HUTANG_TUTORIAL_LIST: HutangTutorialMeta[] = [
    {
        id: "jelajah_hutang_member",
        title: "Jelajah Hutang Member",
        description: "Memahami piutang member, pembayaran hutang, dan riwayat mutasi.",
        category: "Hutang",
        stepCount: 8,
        badge: "Piutang Member",
        isAvailable: true,
    },
    {
        id: "jelajah_hutang_sales",
        title: "Jelajah Hutang Sales",
        description: "Daftar hutang usaha ke supplier beserta ringkasan akumulasi.",
        category: "Hutang",
        stepCount: 6,
        badge: "Hutang Supplier",
        isAvailable: true,
    },
    {
        id: "jelajah_hutang_supplier",
        title: "Detail Hutang Supplier",
        description: "Rincian hutang per transaksi penerimaan & pelunasan sekaligus.",
        category: "Hutang",
        stepCount: 7,
        badge: "Penerimaan",
        isAvailable: true,
    },
    {
        id: "jelajah_pembayaran_member",
        title: "Jelajah Pembayaran Hutang Member",
        description: "Membaca log pembayaran/cicilan hutang member dan aksi void.",
        category: "Hutang",
        stepCount: 7,
        badge: "Riwayat Bayar",
        isAvailable: true,
    },
];
