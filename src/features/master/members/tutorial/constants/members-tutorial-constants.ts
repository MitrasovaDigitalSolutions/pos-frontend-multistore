import type { Member } from "@/features/master/members/types";
import type { MembersTutorialMeta } from "../types/members-tutorial";

export const MEMBERS_TUTORIAL_LIST: MembersTutorialMeta[] = [
    {
        id: "tambah_member",
        title: "Tambah Member Baru",
        description: "Daftarkan pelanggan baru ke sistem loyalitas: isi nama, kontak, dan poin awal.",
        category: "Master Member",
        stepCount: 6,
        badge: "Alur Lengkap",
        isAvailable: true,
    },
    {
        id: "edit_member",
        title: "Edit Data Member",
        description: "Perbarui nama, kontak, alamat, atau status keanggotaan pelanggan yang sudah terdaftar.",
        category: "Master Member",
        stepCount: 3,
        isAvailable: true,
    },
    {
        id: "sesuaikan_poin",
        title: "Penyesuaian Poin Loyalitas",
        description: "Tambah atau kurangi poin member secara manual beserta catatan keterangan.",
        category: "Master Member",
        stepCount: 4,
        badge: "Poin",
        isAvailable: true,
    },
    {
        id: "hapus_member",
        title: "Hapus Member",
        description: "Hapus data pelanggan yang sudah tidak aktif dari sistem.",
        category: "Master Member",
        stepCount: 2,
        isAvailable: true,
    },
    {
        id: "filter_member",
        title: "Pencarian & Filter Member",
        description: "Cari cepat berdasarkan kode, nama, email, telepon, dan filter status aktif/nonaktif.",
        category: "Master Member",
        stepCount: 2,
        badge: "Pencarian Cepat",
        isAvailable: true,
    },
];

export const MOCK_MEMBERS: Member[] = [
    {
        uid: "tutorial-mock-member-1",
        kode: "MBR-0001",
        nama: "Budi Santoso (Demo)",
        email: "budi.santoso@email.com",
        nomor_telepon: "081234567890",
        alamat: "Jl. Merdeka No. 45, Jakarta Selatan",
        tanggal_lahir: "1990-05-15",
        jenis_kelamin: "L",
        poin: 1250,
        status: "active",
    },
    {
        uid: "tutorial-mock-member-2",
        kode: "MBR-0002",
        nama: "Siti Rahayu (Demo)",
        email: "siti.rahayu@email.com",
        nomor_telepon: "087654321098",
        alamat: "Jl. Sudirman No. 12, Bandung",
        tanggal_lahir: "1985-11-20",
        jenis_kelamin: "P",
        poin: 800,
        status: "active",
    },
];
