import {
    MOCK_REQUEST_ITEMS,
    MOCK_REQUEST_NOTE,
    MOCK_REQUEST_STORE
} from "../constants/transfer-tutorial-constants";
import type { TransferTutorialStep } from "../types/transfer-tutorial";

export const TRANSFER_TUTORIAL_STEPS: Record<string, TransferTutorialStep[]> = {
    request_transfer_create: [
        {
            target: "#req-target-store",
            title: "1. Pilih Toko / Gudang Tujuan Request",
            content:
                "Tentukan toko sumber atau gudang pusat yang akan Anda mintai pasokan stok. Toko tujuan ini yang nantinya akan memproses dan mengirimkan barang ke toko Anda.",
            placement: "bottom",
            action: {
                type: "set_field",
                field: "request_to",
                value: MOCK_REQUEST_STORE.uid,
            },
        },
        {
            target: "#req-supplier-catalog-box",
            title: "2. Pilihan Supplier & Katalog Sales (Opsional)",
            content:
                "Jika permintaan barang berkaitan dengan supplier rekanan atau promo katalog distributor tertentu, Anda dapat memilihnya di sini untuk memfilter atau mengimpor daftar produk secara otomatis.",
            placement: "bottom",
        },
        {
            target: "#req-notes-box",
            title: "3. Catatan Khusus Permintaan",
            content:
                "Sematkan instruksi penting untuk tim gudang pengirim, misalnya prioritas pengiriman mendesak, nomor surat jalan internal, atau instruksi kemasan khusus.",
            placement: "top",
            action: {
                type: "type_text",
                target: "#req-notes-input",
                text: MOCK_REQUEST_NOTE,
            },
        },
        {
            target: "#req-barcode-box",
            title: "4. Cari & Scan Barcode Produk",
            content:
                "Gunakan barcode scanner atau ketik nama/SKU produk yang ingin diminta. Sistem simulasi demo otomatis menginput barcode dan memasukkan produk ke dalam tabel barang.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    { type: "type_text", target: "#req-barcode-input", text: "8991111222333" },
                    { type: "wait", ms: 350 },
                    { type: "inject_items", items: MOCK_REQUEST_ITEMS },
                    { type: "clear_input", target: "#req-barcode-input" },
                ],
            },
        },
        {
            target: "#req-items-table",
            title: "5. Tabel & Penyesuaian Kuantitas (Qty)",
            content:
                "Periksa daftar barang yang diminta. Anda dapat mengatur jumlah kuantitas fisik (Qty) yang dibutuhkan toko menggunakan tombol plus/minus atau mengetikkan angka secara langsung.",
            placement: "top",
        },
        {
            target: "#req-summary-card",
            title: "6. Ringkasan & Checklist Validasi",
            content:
                "Panel ringkasan menampilkan toko tujuan, total variasi SKU, total unit kuantitas, dan checklist persyaratan. Formulir hanya dapat dikirim jika seluruh persyaratan bertanda centang hijau.",
            placement: "left",
        },
        {
            target: "#req-submit-btn",
            title: "7. Kirim Permintaan Transfer",
            content:
                "Klik tombol 'Kirim Request Transfer' untuk menerbitkan permintaan. Permintaan akan langsung masuk ke menu 'Kelola Request Masuk' di toko tujuan untuk segera disetujui dan disiapkan pengirimannya.",
            placement: "top",
        },
        {
            target: "body",
            title: "8. Selesai: Request Transfer Siap!",
            content:
                "Selamat! Anda telah memahami alur pengajuan permintaan stok antar toko. Tim toko tujuan kini dapat meninjau permintaan dan memproses pengiriman transfer stok fisik.",
            placement: "center",
            action: {
                type: "clear_items",
            },
        },
    ],
    request_transfer_incoming: [
        {
            target: "#req-incoming-list-header",
            title: "1. Pengenalan Request Masuk",
            content:
                "Halaman ini menampung seluruh permintaan pasokan stok barang yang masuk dari berbagai toko cabang. Sistem secara cerdas mengelompokkan (summary) permintaan berdasarkan toko tujuan dan supplier agar pengadaan stok terkoordinasi secara terpusat.",
            placement: "bottom",
        },
        {
            target: "#req-incoming-btn-generate-link",
            title: "2. Generate Link Request Publik",
            content:
                "Gunakan tombol ini untuk membuat tautan formulir mandiri. Pihak cabang atau staf operasional dapat mengajukan permintaan stok langsung melalui tautan publik tanpa memerlukan akun login admin penuh.",
            placement: "bottom",
        },
        {
            target: "#req-incoming-filter",
            title: "3. Pencarian & Filter Supplier",
            content:
                "Gunakan kolom pencarian ini untuk menyaring rangkuman permintaan masuk berdasarkan nama supplier rekanan atau nama katalog sales tertentu.",
            placement: "bottom",
        },
        {
            target: "#req-incoming-row-0",
            title: "4. Rangkuman Permintaan Cabang",
            content:
                "Tabel ini merangkum nama supplier, jumlah cabang yang meminta, total baris produk, dan tanggal request terbaru. Klik tombol Selanjutnya untuk membuka rincian matrix stok antar cabang dan memproses pengiriman.",
            placement: "bottom",
        },
        {
            target: "#req-incoming-route-card",
            title: "5. Analisis Rute Toko & Supplier Target",
            content:
                "Di panel samping, Anda dapat memeriksa toko tujuan (toko/gudang Anda saat ini), daftar cabang yang mengajukan permintaan (misal: Cabang Malang & Cabang Sidoarjo), serta Supplier target jika stok harus dipesan ke distributor.",
            placement: "left",
        },
        {
            target: "#req-incoming-matrix-row-0",
            title: "6. Matrix Distribusi Kebutuhan Cabang",
            content:
                "Baris matrix ini menampilkan rincian sebaran produk yang diminta oleh masing-masing cabang secara berdampingan. Anda dapat membandingkan total kebutuhan gabungan dengan ketersediaan stok fisik aktual di gudang sumber ('Stok Cukup' atau 'Stok Kurang').",
            placement: "bottom",
        },
        {
            target: "#req-incoming-view-toggle",
            title: "7. Mode Tampilan Matrix vs Dokumen",
            content:
                "Anda dapat dengan fleksibel beralih antara tampilan 'Matrix' (untuk rekap total per cabang) dan tampilan 'Dokumen' (untuk meninjau nomor surat jalan request, tanggal, dan catatan pengajuan dari tiap cabang peminta).",
            placement: "bottom",
        },
        {
            target: "#req-incoming-stock-card",
            title: "8. Ringkasan Kesiapan Stok",
            content:
                "Kartu ini merangkum total akumulasi unit barang, jumlah dokumen cabang yang masuk, dan status ketersediaan stok ('Stok Cukup' atau 'Perlu Order PO') secara otomatis.",
            placement: "left",
        },
        {
            target: "#req-incoming-actions-bar",
            title: "9. Keputusan & Tindakan Eksekusi",
            content:
                "Tersedia 3 keputusan utama:\n• 'Tolak Request': Batalkan permintaan jika tidak sesuai.\n• 'Buat PO': Buat Purchase Order ke supplier otomatis jika stok gudang kurang.\n• 'Kirim Transfer Stok': Terbitkan dokumen transfer keluar draft ke cabang peminta!",
            placement: "bottom",
        },
        {
            target: "body",
            title: "🎉 Panduan Kelola Request Masuk Selesai!",
            content:
                "Luar biasa! Anda telah menguasai alur evaluasi permintaan masuk antar cabang, verifikasi matrix ketersediaan stok, hingga eksekusi pengiriman transfer stok.",
            placement: "center",
        },
    ],
};
