import type { UsersTutorialId, UsersTutorialStep } from "../types/users-tutorial";

export const USERS_TUTORIAL_STEPS: Record<UsersTutorialId, UsersTutorialStep[]> = {
    tambah_karyawan: [
        {
            target: "#btn-tambah-user",
            title: "1. Tombol Tambah Karyawan",
            content: "Klik tombol 'Tambah Karyawan' untuk membuka form pendaftaran akun staf POS atau tingkat pengawas baru.",
            placement: "bottom",
        },
        {
            target: "#form-user-name",
            title: "2. Nama Lengkap",
            content: "Masukkan nama lengkap karyawan. Nama ini akan tertera pada struk kasir dan catatan riwayat aktivitas sistem.",
            placement: "bottom",
            autoFill: {
                label: "✨ Isi Nama Lengkap",
                target: "#form-user-name input",
                value: "Dewi Lestari",
            },
        },
        {
            target: "#form-user-username",
            title: "3. Username Login",
            content: "Tentukan username unik untuk karyawan masuk (login) ke aplikasi kasir maupun portal admin.",
            placement: "bottom",
            autoFill: {
                label: "✨ Isi Username",
                target: "#form-user-username input",
                value: "dewikasir",
            },
        },
        {
            target: "#form-user-password",
            title: "4. Kata Sandi Awal",
            content: "Buat kata sandi awal minimal 6 karakter. Pastikan karyawan mengganti sandi secara berkala.",
            placement: "bottom",
            autoFill: {
                label: "✨ Isi Kata Sandi",
                target: "#form-user-password input",
                value: "karyawan123",
            },
        },
        {
            target: "#form-user-role-status",
            title: "5. Peran & Status Akun",
            content: "Pilih peran hak akses yang sesuai (Kasir, Supervisor, Manajer Toko, Admin) serta tentukan status akun (Aktif/Nonaktif).",
            placement: "bottom",
        },
        {
            target: "#btn-submit-user",
            title: "6. Simpan Karyawan",
            content: "Klik tombol 'Simpan Pengguna' untuk menyimpan dan mengaktifkan akun karyawan baru di sistem.",
            placement: "top",
        },
    ],

    edit_karyawan: [
        {
            target: ".table-action-edit",
            title: "1. Tombol Edit Karyawan",
            content: "Klik tombol Edit (ikon pensil kuning) pada baris akun yang ingin diperbarui profil atau hak aksesnya.",
            placement: "left",
        },
        {
            target: "#form-user-name",
            title: "2. Perbarui Informasi Profil",
            content: "Ubah nama lengkap atau data profil karyawan jika ada perbaikan data administrasi.",
            placement: "bottom",
            autoFill: {
                label: "✨ Ubah Nama",
                target: "#form-user-name input",
                value: "Dewi Lestari (Senior)",
            },
        },
        {
            target: "#form-user-role",
            title: "3. Ubah Tingkat Peran",
            content: "Sesuaikan tingkatan hak akses karyawan saat terjadi promosi jabatan atau rotasi tanggung jawab.",
            placement: "bottom",
        },
        {
            target: "#btn-submit-user",
            title: "4. Simpan Perubahan",
            content: "Klik tombol 'Simpan Pengguna' untuk menerapkan pembaruan data akun secara instan.",
            placement: "top",
        },
    ],

    nonaktifkan_karyawan: [
        {
            target: ".table-action-delete",
            title: "1. Tombol Nonaktifkan",
            content: "Klik tombol Nonaktifkan (ikon tempat sampah merah) pada baris karyawan yang ingin dinonaktifkan aksesnya.",
            placement: "left",
        },
        {
            target: "#confirm-deactivate-user-dialog",
            title: "2. Konfirmasi & Keamanan",
            content: "Tinjau konfirmasi sistem. Akun yang dinonaktifkan tidak akan dapat login lagi ke kasir POS maupun dashboard admin.",
            placement: "bottom",
        },
        {
            target: "#btn-confirm-deactivate-user",
            title: "3. Konfirmasi Tindakan",
            content: "Klik tombol 'Ya, Nonaktifkan' untuk mencabut izin akses masuk karyawan tersebut.",
            placement: "top",
        },
    ],

    filter_karyawan: [
        {
            target: "#filter-user-search",
            title: "1. Cari Karyawan",
            content: "Ketik nama lengkap atau username untuk menyaring daftar karyawan secara instan.",
            placement: "bottom",
            autoFill: {
                label: "✨ Ketik Pencarian",
                target: "#filter-user-search input",
                value: "dewi",
            },
        },
        {
            target: "#filter-user-status",
            title: "2. Filter Berdasarkan Status",
            content: "Pilih status akun (Semua Status, Aktif, atau Nonaktif) untuk memfokuskan daftar karyawan yang ditampilkan.",
            placement: "bottom",
        },
        {
            target: "#filter-user-actions",
            title: "3. Terapkan & Reset Filter",
            content: "Gunakan tombol Terapkan untuk menjalankan pencarian, atau Reset untuk mengembalikan filter ke kondisi awal.",
            placement: "bottom",
        },
    ],
};
