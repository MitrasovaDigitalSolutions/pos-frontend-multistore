import type { User } from "@/features/users/types";
import type { UsersTutorialMeta } from "../types/users-tutorial";

export const USERS_TUTORIAL_LIST: UsersTutorialMeta[] = [
    {
        id: "tambah_karyawan",
        title: "Tambah Karyawan Baru",
        description: "Daftarkan akun staf baru: tentukan nama, username, password, dan hak akses peran.",
        category: "Kelola Karyawan",
        stepCount: 6,
        badge: "Alur Lengkap",
        isAvailable: true,
    },
    {
        id: "edit_karyawan",
        title: "Edit Data Karyawan",
        description: "Perbarui profil, username, atau tingkatan peran staf toko yang terdaftar.",
        category: "Kelola Karyawan",
        stepCount: 4,
        isAvailable: true,
    },
    {
        id: "nonaktifkan_karyawan",
        title: "Nonaktifkan Karyawan",
        description: "Cabut hak akses login akun karyawan yang sudah tidak bertugas secara aman.",
        category: "Kelola Karyawan",
        stepCount: 3,
        badge: "Keamanan",
        isAvailable: true,
    },
    {
        id: "filter_karyawan",
        title: "Pencarian & Filter Karyawan",
        description: "Temukan akun staf dengan cepat berdasarkan nama, username, atau status keaktifan.",
        category: "Kelola Karyawan",
        stepCount: 3,
        badge: "Pencarian Cepat",
        isAvailable: true,
    },
];

export const MOCK_USERS: User[] = [
    {
        uid: "tutorial-mock-user-1",
        name: "Dewi Lestari (Demo)",
        username: "dewikasir",
        email: "dewi.lestari@tokocontoh.com",
        store_uid: "store-tutorial-1",
        status: "active",
        roles: ["kasir"],
        permissions: [],
    },
    {
        uid: "tutorial-mock-user-2",
        name: "Agus Prasetyo (Demo)",
        username: "agusspv",
        email: "agus.prasetyo@tokocontoh.com",
        store_uid: "store-tutorial-1",
        status: "active",
        roles: ["supervisor"],
        permissions: [],
    },
];
