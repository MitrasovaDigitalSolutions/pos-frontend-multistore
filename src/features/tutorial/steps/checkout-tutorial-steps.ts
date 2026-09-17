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
            title: "1. Buka Shift Kasir",
            content: "Sebelum mulai melayani pelanggan, kasir wajib membuka sesi shift dengan menekan tombol laci kasir ini.",
            placement: "bottom",
        },
        {
            target: "#cash-drawer-opening-balance",
            title: "2. Input Saldo Awal Kas",
            content: "Dialog pembukaan shift muncul. Masukkan uang modal awal tunai yang ada di laci fisik kasir untuk rekonsiliasi kas di akhir hari.",
            placement: "bottom",
            action: {
                type: "type_text",
                target: "#cash-drawer-opening-balance",
                text: "500000",
            },
        },
        {
            target: "#cash-drawer-start-shift-btn",
            title: "3. Mulai Shift Kasir",
            content: "Setelah saldo awal diisi, klik tombol Mulai Shift (Buka Laci) untuk mengaktifkan sesi kasir dan mulai bertransaksi.",
            placement: "top",
        },
        {
            target: "body",
            title: "4. Selesai: Shift Kasir Siap",
            content: "Shift aktif dan siap melayani pelanggan! Anda dapat menggunakan tombol cepat di bawah atau shortcut keyboard F1–F12 untuk bekerja lebih gesit.",
            placement: "center",
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
                    { type: "wait", ms: 300 },
                    { type: "inject_cart", items: MOCK_PRODUCTS },
                    { type: "clear_input", target: "#barcode-input" },
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
                type: "sequence",
                actions: [
                    { type: "type_text", target: "#nama-transaksi-input", text: "Meja 5 - Budi" },
                    { type: "set_nama", nama: "Meja 5 - Budi" },
                ],
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
            target: "body",
            title: "7. Selesai: Transaksi Siap Diproses",
            content: "Tekan tombol BAYAR SEKARANG atau shortcut F1 untuk memilih metode pembayaran (Tunai, Debit/QRIS, atau Hutang). Alur transaksi kasir telah selesai dipelajari!",
            placement: "center",
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
            target: "#btn-pay-debt-action",
            title: "2. Informasi Tunggakan & Tombol Bayar",
            content: "Rincian saldo tunggakan hutang tampil mencolok berwarna merah. Klik tombol BAYAR untuk membuka dialog pelunasan hutang.",
            placement: "left",
        },
        {
            target: "#pay-debt-method-toggle",
            title: "3. Pilih Metode Pembayaran",
            content: "Dialog pembayaran terbuka. Pilih metode pelunasan yang digunakan oleh pelanggan: Tunai (Cash) atau Kartu / EDC / Transfer.",
            placement: "bottom",
        },
        {
            target: "#pay-debt-cash-input",
            title: "4. Masukkan Nominal Bayar",
            content: "Ketik nominal uang yang diserahkan pelanggan. Sistem kasir mendukung cicilan sebagian maupun pelunasan penuh hutang.",
            placement: "bottom",
            action: {
                type: "type_text",
                target: "#pay-debt-cash-input",
                text: "175000",
            },
        },
        {
            target: "#pay-debt-quick-cash",
            title: "5. Pilihan Cepat Nominal",
            content: "Gunakan tombol pilihan cepat untuk memilih uang pas atau pecahan rupiah dengan satu klik cepat tanpa perlu mengetik manual.",
            placement: "bottom",
        },
        {
            target: "#pay-debt-submit-btn",
            title: "6. Simpan Pembayaran Hutang",
            content: "Klik tombol Simpan Pembayaran untuk memproses pelunasan hutang member, mencatat kas masuk, dan mencetak bukti pembayaran.",
            placement: "top",
        },
        {
            target: "body",
            title: "7. Selesai: Hutang Terlunasi",
            content: "Pelunasan hutang langsung memotong saldo pinjaman member dan tercatat rapi pada laporan kasir harian.",
            placement: "center",
            action: {
                type: "sequence",
                actions: [
                    { type: "close_dialog", dialog: "pay_debt" },
                    { type: "clear_member" },
                ],
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
            content: "Klik tombol Hold (atau tekan F5). Belanjaan Pelanggan A disimpan sementara dan keranjang langsung dikosongkan.",
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
            title: "4. Tombol Recall Transaksi (F6)",
            content: "Saat Pelanggan A kembali ke meja kasir, klik Recall (atau F6) untuk membuka daftar transaksi belanjaan yang ditahan.",
            placement: "top",
        },
        {
            target: "#btn-recall-first",
            title: "5. Pilih & Panggil Transaksi Hold",
            content: "Dialog daftar hold terbuka. Pilih transaksi Pelanggan A lalu klik tombol Recall untuk mengembalikan belanjaan ke keranjang kasir.",
            placement: "left",
        },
        {
            target: "#btn-void",
            title: "6. Tombol Batal Transaksi (Void F10)",
            content: "Belanjaan Pelanggan A telah dikembalikan ke keranjang. Gunakan tombol Void (atau F10) jika pelanggan membatalkan seluruh pesanan.",
            placement: "top",
            action: {
                type: "sequence",
                actions: [
                    { type: "clear_hold" },
                    { type: "inject_cart", items: MOCK_HOLD_TRANSACTION.items },
                    { type: "set_nama", nama: "Pelanggan A (Pending)" },
                ],
            },
        },
        {
            target: "#btn-confirm-void",
            title: "7. Konfirmasi Pembatalan Keranjang",
            content: "Dialog peringatan konfirmasi muncul untuk mencegah ketidaksengajaan. Klik Ya, Batalkan untuk menyetujui pembatalan, dan seluruh item keranjang akan dikosongkan.",
            placement: "top",
        },
        {
            target: "body",
            title: "8. Selesai: Fitur Antrean Cepat",
            content: "Kombinasi Hold (F5), Recall (F6), dan Void (F10) membuat kasir melayani jam sibuk antrean ramai dengan cepat, aman, dan rapi.",
            placement: "center",
            action: {
                type: "sequence",
                actions: [
                    { type: "clear_cart" },
                    { type: "set_nama", nama: "" },
                ],
            },
        },
    ],

    transaksi_offline: [
        {
            target: "#topbar-network-status",
            title: "1. Tombol & Status Jaringan Online / Offline",
            content: "Indikator ini menampilkan koneksi secara real-time. Klik tombol Online / Offline ini untuk membuka dialog Transaksi Offline.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    { type: "click", target: "#topbar-network-status button" },
                    { type: "open_dialog", dialog: "offline" },
                    { type: "wait", ms: 300 },
                ],
            },
        },
        {
            target: "#offline-pending-summary",
            title: "2. Ringkasan Antrean Transaksi Offline",
            content: "Dialog transaksi offline terbuka. Kasir dapat memantau jumlah transaksi yang Belum Dikirim (Pending), Gagal, dan Terkirim ke server.",
            placement: "bottom",
        },
        {
            target: "#btn-sync-selected",
            title: "3. Kirim Ulang Transaksi Terpilih",
            content: "Centang transaksi yang tertunda lalu klik tombol Kirim Terpilih untuk sinkronisasi ulang ke server pusat saat internet aktif kembali.",
            placement: "bottom",
        },
        {
            target: "#offline-transactions-table-wrap",
            title: "4. Kelola & Hapus Transaksi Tertunda",
            content: "Pada tabel ini, kasir dapat memeriksa rincian transaksi tertunda, atau menghapus data jika pesanan offline dibatalkan oleh pelanggan.",
            placement: "top",
        },
        {
            target: "body",
            title: "5. Selesai: Transaksi Tetap Aman",
            content: "Sistem kasir tetap dapat scan produk dan melayani penjualan saat offline, lalu menyelaraskan data secara otomatis saat online kembali.",
            placement: "center",
            action: {
                type: "close_dialog",
                dialog: "offline",
            },
        },
    ],

    cetak_ulang_struk: [
        {
            target: "#btn-reprint",
            title: "1. Tombol Reprint Struk (F7)",
            content: "Klik tombol Reprint (atau shortcut F7) untuk mengakses riwayat seluruh transaksi yang pernah diproses oleh kasir.",
            placement: "top",
            action: {
                type: "sequence",
                actions: [
                    { type: "click", target: "#btn-reprint" },
                    { type: "open_dialog", dialog: "reprint" },
                    { type: "wait", ms: 300 },
                ],
            },
        },
        {
            target: "#past-transactions-filter-container",
            title: "2. Cari & Filter Riwayat Transaksi",
            content: "Cari riwayat transaksi berdasarkan nomor nota, nama, tanggal, atau cetak nota terakhir.",
            placement: "bottom",
        },
        {
            target: "#past-transactions-table-wrap",
            title: "3. Daftar Riwayat Transaksi Kasir",
            content: "Tabel menampilkan riwayat penjualan lengkap dengan tanggal transaksi, nama kasir, metode pembayaran, status, dan total rupiah belanja.",
            placement: "top",
        },
        {
            target: "#btn-reprint-action-first",
            title: "4. Tombol Cetak Ulang Struk",
            content: "Klik tombol Cetak pada baris transaksi yang dipilih. Struk belanja akan langsung dicetak kembali ke printer thermal kasir.",
            placement: "left",
        },
        {
            target: "body",
            title: "5. Selesai: Struk Berhasil Dicetak",
            content: "Struk belanja siap diserahkan kembali kepada pelanggan dengan format yang rapi dan aman tanpa mempengaruhi laporan keuangan.",
            placement: "center",
            action: {
                type: "close_dialog",
                dialog: "reprint",
            },
        },
    ],
};
