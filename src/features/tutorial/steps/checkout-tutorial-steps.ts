import type { TutorialId, TutorialStep } from "../types/tutorial";
import {
    MOCK_PRODUCTS,
    MOCK_MEMBER_NORMAL,
    MOCK_MEMBER_WITH_DEBT,
    MOCK_HOLD_TRANSACTION,
} from "../constants/tutorial-constants";

export const CHECKOUT_TUTORIAL_STEPS: Record<TutorialId, TutorialStep[]> = {
    sesi_kasir: [
        {
            target: "#topbar-cash-drawer-btn",
            title: "1. Tombol Laci Kasir & Shift",
            content: "Langkah pertama sebelum melayani pelanggan: klik tombol ini untuk membuka sesi shift kasir harian Anda.",
            placement: "bottom",
        },
        {
            target: "#barcode-input",
            title: "2. Input Modal Awal Kas",
            content: "Saat membuka shift, Anda diminta memasukkan uang modal awal di laci fisik agar rekonsiliasi selisih kas di akhir hari akurat.",
            placement: "bottom",
        },
        {
            target: "#btn-bayar-sekarang",
            title: "3. Transaksi & Catatan Kas",
            content: "Setiap transaksi tunai dan non-tunai yang berhasil akan otomatis tercatat ke dalam ringkasan sesi shift aktif Anda.",
            placement: "top",
        },
        {
            target: "#checkout-shortcuts-bar",
            title: "4. Shift Aktif & Siap Melayani",
            content: "Shift siap! Anda dapat menggunakan tombol cepat di bawah atau shortcut keyboard F1–F12 untuk bekerja lebih gesit.",
            placement: "top",
        },
    ],

    transaksi_kasir: [
        {
            target: "#barcode-input",
            title: "1. Scan Barcode / Cari Produk",
            content: "Pindai barcode fisik dengan scanner atau ketik nama produk pada kolom pencarian ini. Produk otomatis masuk ke keranjang belanja.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    { type: "type_text", target: "#barcode-input", text: "Kopi Susu" },
                    { type: "inject_cart", items: MOCK_PRODUCTS },
                ],
            },
        },
        {
            target: "#checkout-cart-table",
            title: "2. Kelola Item Keranjang",
            content: "Daftar pesanan tampil rapi di sini. Anda dapat mengubah jumlah item (+/-), merubah harga satuan manual, atau menghapus barang.",
            placement: "right",
        },
        {
            target: "#nama-transaksi-input",
            title: "3. Catatan / Nama Transaksi",
            content: "Beri nama pelanggan, nomor meja, atau keterangan pesanan (misal: 'Meja 5 - Budi') agar pesanan mudah dilacak.",
            placement: "left",
            action: {
                type: "set_nama",
                nama: "Meja 5 - Budi",
            },
        },
        {
            target: "#member-selection-card",
            title: "4. Member Pelanggan & Poin",
            content: "Pilih member pelanggan terdaftar untuk menambahkan poin loyalitas reward secara otomatis pada setiap transaksi.",
            placement: "left",
            action: {
                type: "inject_member",
                member: MOCK_MEMBER_NORMAL,
            },
        },
        {
            target: "#discount-section",
            title: "5. Berikan Diskon Belanja",
            content: "Anda dapat memberikan potongan harga transaksi dalam bentuk nominal rupiah (Rp) maupun persentase (%). Diskon langsung memotong total.",
            placement: "left",
            action: {
                type: "set_discount",
                discountType: "percent",
                value: 10,
            },
        },
        {
            target: "#grand-total-display",
            title: "6. Total Pembayaran Akhir",
            content: "Hero card menampilkan total bersih yang harus dibayar pelanggan secara jelas, sudah terhitung diskon dan pajak (PPN).",
            placement: "left",
        },
        {
            target: "#btn-bayar-sekarang",
            title: "7. Proses Pembayaran (F1)",
            content: "Tekan tombol **BAYAR SEKARANG** atau shortcut **F1** untuk memilih metode pembayaran (Tunai, Debit/QRIS, atau Hutang).",
            placement: "top",
        },
    ],

    hutang_member: [
        {
            target: "#member-selection-card",
            title: "1. Pilih Member Pelanggan",
            content: "Ketika memilih member yang memiliki catatan hutang sebelumnya, sistem kasir akan mendeteksi status tunggakan otomatis.",
            placement: "left",
            action: {
                type: "inject_member",
                member: MOCK_MEMBER_WITH_DEBT,
            },
        },
        {
            target: "#member-debt-info",
            title: "2. Informasi Tunggakan Hutang",
            content: "Rincian saldo tunggakan hutang tampil dengan warna merah mencolok beserta tombol **BAYAR** untuk melunasi.",
            placement: "left",
        },
        {
            target: "#grand-total-display",
            title: "3. Pembayaran Fleksibel",
            content: "Pembayaran hutang dapat dicicil sebagian atau dilunasi penuh kapan saja di kasir, bahkan tanpa harus berbelanja barang.",
            placement: "left",
        },
        {
            target: "#btn-bayar-sekarang",
            title: "4. Selesai & Terdata Rapi",
            content: "Setiap pembayaran hutang langsung memotong saldo pinjaman member dan tercatat rapi pada laporan kasir harian.",
            placement: "top",
            action: {
                type: "clear_member",
            },
        },
    ],

    hold_recall_void: [
        {
            target: "#checkout-cart-table",
            title: "1. Belanjaan Pelanggan Tertunda",
            content: "Misalkan pelanggan sedang mengambil barang tambahan dan antrean di belakangnya sudah menunggu untuk dilayani.",
            placement: "right",
            action: {
                type: "sequence",
                actions: [
                    { type: "inject_cart", items: MOCK_PRODUCTS.slice(0, 2) },
                    { type: "set_nama", nama: "Pelanggan A (Pending)" },
                ],
            },
        },
        {
            target: "#btn-hold",
            title: "2. Hold Transaksi (F5)",
            content: "Klik tombol **Hold** (atau tekan **F5**). Belanjaan Pelanggan A disimpan sementara dan keranjang langsung dikosongkan.",
            placement: "top",
            action: {
                type: "inject_hold",
                hold: MOCK_HOLD_TRANSACTION,
            },
        },
        {
            target: "#barcode-input",
            title: "3. Layani Pelanggan Berikutnya",
            content: "Sekarang kasir bisa melayani antrean pelanggan baru tanpa khawatir data belanjaan pelanggan sebelumnya hilang.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    { type: "inject_cart", items: [MOCK_PRODUCTS[2]] },
                    { type: "set_nama", nama: "Pelanggan B" },
                ],
            },
        },
        {
            target: "#btn-recall",
            title: "4. Recall Transaksi (F6)",
            content: "Saat Pelanggan A kembali ke meja kasir, klik **Recall** (atau **F6**) untuk memanggil kembali belanjaan yang di-hold tadi.",
            placement: "top",
        },
        {
            target: "#btn-void",
            title: "5. Void Transaksi (F10)",
            content: "Gunakan tombol **Void** (atau **F10**) jika pelanggan membatalkan seluruh belanjaan untuk mengosongkan keranjang dalam 1 klik.",
            placement: "top",
            action: {
                type: "clear_cart",
            },
        },
        {
            target: "#checkout-shortcuts-bar",
            title: "6. Selesai: Fitur Antrean Cepat",
            content: "Kombinasi Hold (F5), Recall (F6), dan Void (F10) membuat kasir melayani jam sibuk antrean ramai dengan cepat dan rapi.",
            placement: "top",
        },
    ],

    transaksi_offline: [
        {
            target: "#topbar-network-status",
            title: "1. Status Jaringan Online / Offline",
            content: "Indikator ini mendeteksi koneksi secara real-time. Jika internet mati, sistem secara mulus beralih ke Mode Offline.",
            placement: "bottom",
        },
        {
            target: "#topbar-offline-readiness",
            title: "2. Kesiapan Katalog Offline",
            content: "Katalog produk dan data member tersimpan di database lokal browser (IndexedDB), sehingga tetap bisa dicari dan discan tanpa internet.",
            placement: "bottom",
        },
        {
            target: "#checkout-cart-table",
            title: "3. Transaksi Tetap Berjalan Normal",
            content: "Dalam mode offline, kasir tetap dapat scan barcode, hitung total, dan mencetak struk belanja seperti biasa.",
            placement: "right",
        },
        {
            target: "#checkout-shortcuts-bar",
            title: "4. Sinkronisasi Otomatis",
            content: "Begitu koneksi internet tersambung kembali, sistem akan otomatis mengirim seluruh transaksi offline ke server pusat tanpa perlu input ulang.",
            placement: "top",
        },
    ],

    cetak_ulang_struk: [
        {
            target: "#btn-reprint",
            title: "1. Tombol Reprint Struk (F7)",
            content: "Klik tombol **Reprint** (atau tekan shortcut **F7**) untuk mengakses riwayat transaksi yang pernah diproses oleh kasir.",
            placement: "top",
        },
        {
            target: "#grand-total-display",
            title: "2. Cari Riwayat Transaksi",
            content: "Cari struk berdasarkan nomor nota, nominal bayar, metode pembayaran, atau kasir yang bertugas.",
            placement: "left",
        },
        {
            target: "#checkout-cart-table",
            title: "3. Periksa Rincian Transaksi",
            content: "Anda dapat melihat kembali daftar item belanjaan dan rincian harga sebelum mengirim perintah cetak ulang.",
            placement: "right",
        },
        {
            target: "#checkout-shortcuts-bar",
            title: "4. Selesai: Struk Siap Dicetak",
            content: "Struk belanja akan langsung tercetak kembali ke printer thermal kasir dengan format yang rapi dan aman.",
            placement: "top",
        },
    ],
};
