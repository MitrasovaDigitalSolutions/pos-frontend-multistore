import {
    MOCK_REQUEST_ITEMS,
    MOCK_REQUEST_NOTE,
    MOCK_REQUEST_STORE,
    MOCK_STOCK_TRANSFER_DEST_STORE,
    MOCK_STOCK_TRANSFER_ITEMS,
    MOCK_STOCK_TRANSFER_NOTE
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
    stock_transfer_create: [
        {
            target: "#transfer-list-header",
            title: "1. Pengenalan Transfer Keluar",
            content:
                "Menu Transfer Keluar digunakan untuk mengelola pengiriman pasokan stok fisik dari toko/gudang Anda ke cabang lain. Fitur ini memastikan pemerataan inventaris antarcabang secara terkontrol dan terdokumentasi rapi.",
            placement: "bottom",
        },
        {
            target: "#transfer-stat-cards",
            title: "2. Status Operasional Pengiriman",
            content:
                "Pantau pergerakan pengiriman melalui 4 kartu indikator:\n• 'Draft': Pengiriman baru dirancang, stok belum terpotong.\n• 'Dalam Pengiriman': Stok toko asal sudah terpotong dan barang sedang dalam perjalanan ekspedisi/kurir.\n• 'Menunggu Validasi': Cabang tujuan melaporkan adanya retur atau selisih barang.\n• 'Total Selesai': Seluruh transfer yang sukses diterima.",
            placement: "bottom",
        },
        {
            target: "#transfer-list-filters",
            title: "3. Filter & Pencarian Pengiriman",
            content:
                "Saring riwayat transfer berdasarkan rentang tanggal pembuatan, toko tujuan penerima, maupun status dokumen untuk mempermudah audit dan penelusuran surat jalan.",
            placement: "bottom",
        },
        {
            target: "#transfer-btn-create-new",
            title: "4. Mulai Buat Transfer Baru",
            content:
                "Klik tombol 'Buat Transfer Baru' untuk menerbitkan surat pengiriman stok. Mari kita buka formulir transfer untuk mempelajari cara pengisian data pengiriman barang.",
            placement: "left",
        },
        {
            target: "#transfer-route-box",
            title: "5. Tentukan Rute Distribusi Stok",
            content:
                "Toko asal otomatis terkunci sesuai cabang aktif Anda saat ini. Pilih Toko Tujuan penerima (misal: Cabang Malang Kota) dan sematkan Catatan Pengiriman untuk sopir/kurir.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    {
                        type: "set_field",
                        field: "destination_uid",
                        value: MOCK_STOCK_TRANSFER_DEST_STORE.uid,
                    },
                    {
                        type: "type_text",
                        target: "#transfer-notes-input",
                        text: MOCK_STOCK_TRANSFER_NOTE,
                    },
                ],
            },
        },
        {
            target: "#transfer-barcode-box",
            title: "6. Cari & Scan Barcode Produk",
            content:
                "Gunakan scanner barcode atau ketik SKU/nama barang yang akan dikirim. Sistem demo secara otomatis menginput kode barcode dan memasukkan produk ke daftar transfer.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    { type: "type_text", target: "#transfer-barcode-input", text: "8991111222333" },
                    { type: "wait", ms: 350 },
                    { type: "inject_items", items: MOCK_STOCK_TRANSFER_ITEMS },
                    { type: "clear_input", target: "#transfer-barcode-input" },
                ],
            },
        },
        {
            target: "#transfer-items-table",
            title: "7. Tabel Barang & Penyesuaian Kuantitas",
            content:
                "Periksa rincian barang yang akan dikirim. Anda dapat melihat informasi 'Stok Toko' asal dan mengatur jumlah unit (Qty) pengiriman menggunakan tombol plus/minus atau mengetik langsung.",
            placement: "top",
        },
        {
            target: "#transfer-summary-card",
            title: "8. Ringkasan Transfer & Checklist Validasi",
            content:
                "Panel ringkasan menampilkan rute toko, total jenis SKU, akumulasi unit barang, dan checklist persyaratan. Tombol simpan hanya akan aktif jika toko tujuan dan minimal 1 barang telah terisi.",
            placement: "left",
        },
        {
            target: "#transfer-btn-submit",
            title: "9. Simpan Dokumen Transfer",
            content:
                "Klik 'Simpan & Lanjutkan' untuk menerbitkan pengiriman sebagai 'Draft'. Pada halaman detail berikutnya, Anda dapat mencetak Surat Jalan fisik dan menekan 'Kirim Transfer' untuk memotong stok toko secara permanen.",
            placement: "top",
        },
        {
            target: "body",
            title: "🎉 Panduan Pengiriman Transfer Keluar Selesai!",
            content:
                "Luar biasa! Anda telah memahami seluruh alur transfer keluar: dari pemantauan daftar riwayat, penetapan rute distribusi antar cabang, input barang dan kuantitas, hingga mekanisme penerbitan dokumen.",
            placement: "center",
            action: {
                type: "clear_items",
            },
        },
    ],
    stock_transfer_receive: [
        {
            target: "#transfer-list-header",
            title: "1. Pengenalan Transfer Masuk",
            content:
                "Menu Transfer Masuk mencatat seluruh pasokan stok fisik yang dikirimkan oleh toko cabang lain atau gudang pusat ke toko Anda. Halaman ini menjadi pos verifikasi sebelum barang resmi dicatat ke inventaris toko.",
            placement: "bottom",
        },
        {
            target: "#transfer-stat-cards",
            title: "2. Indikator Status Pengiriman",
            content:
                "Pantau kiriman yang masuk melalui 4 kartu indikator:\n• 'Dalam Pengiriman': Barang telah diberangkatkan dari toko asal dan sedang dibawa kurir/ekspedisi.\n• 'Menunggu Validasi': Cabang Anda melaporkan adanya selisih/retur dan menunggu konfirmasi toko asal.\n• 'Total Selesai': Transfer yang sukses diverifikasi dan stok telah masuk penuh.",
            placement: "bottom",
        },
        {
            target: "#transfer-list-filters",
            title: "3. Filter & Pencarian Surat Jalan",
            content:
                "Gunakan filter untuk melacak kiriman berdasarkan nomor surat jalan, rentang tanggal kirim, maupun cabang asal pengirim agar proses penerimaan barang lebih cepat dan terstruktur.",
            placement: "bottom",
        },
        {
            target: "#transfer-row-0",
            title: "4. Pilih Transfer Masuk (Data Simulasi)",
            content:
                "Baris ini menampilkan data simulasi kiriman transfer masuk berstatus 'Dikirim' dari Gudang Pusat Surabaya ke toko Anda. Perhatikan nomor surat jalan, rute distribusi, dan status pengiriman aktif. Klik 'Selanjutnya' untuk membuka halaman detail dan memproses penerimaan barang.",
            placement: "bottom",
        },
        {
            target: "#transfer-detail-stepper",
            title: "5. Manifes & Stepper Progres",
            content:
                "Stepper visual 4-tahap memudahkan pemantauan alur pengiriman. Dokumen saat ini berada pada tahap 'Penerimaan', menandakan armada kurir telah tiba dan barang siap dicek secara fisik.",
            placement: "bottom",
        },
        {
            target: "#transfer-detail-info-cards",
            title: "6. Catatan Pengiriman & Rute Toko",
            content:
                "Panel informasi merangkum toko asal pengirim, nama sopir armada, tanggal keberangkatan, serta instruksi khusus dari gudang pusat (misal: verifikasi segel kemasan barang).",
            placement: "left",
        },
        {
            target: "#transfer-detail-items-table",
            title: "7. Manifes Barang & Pengecekan Fisik",
            content:
                "Tabel ini memuat daftar produk dan jumlah unit yang dikirim oleh toko asal. Saat proses bongkar muatan, lakukan penghitungan fisik satu per satu untuk dicocokkan dengan angka pada kolom 'Dikirim'.",
            placement: "top",
        },
        {
            target: "#transfer-receive-qty-0",
            title: "8. Penyesuaian Kuantitas Diterima",
            content:
                "Secara default, kolom 'Qty Diterima' terisi sesuai jumlah kiriman. Jika terdapat selisih (misal: barang kurang atau kemasan rusak di perjalanan), staf dapat langsung mengetikkan kuantitas fisik aktual.",
            placement: "bottom",
        },
        {
            target: "#transfer-btn-terima-0",
            title: "9. Konfirmasi Penerimaan Produk",
            content:
                "Klik tombol 'Terima' pada baris produk yang telah selesai dihitung dan sesuai. Kotak konfirmasi penerimaan akan terbuka untuk mencatat persetujuan item.",
            placement: "left",
            action: {
                type: "click",
                target: "#transfer-btn-terima-0",
            },
        },
        {
            target: "#transfer-dialog-confirm-receive",
            title: "10. Dialog Konfirmasi & Pencatatan Selisih",
            content:
                "Periksa rincian jumlah penerimaan pada dialog. Jika terdapat selisih, pilih alasan selisih (seperti 'Rusak', 'Hilang', atau 'Salah Input') agar toko asal dapat memvalidasi pengembalian atau koreksi stok.",
            placement: "center",
            action: {
                type: "click",
                target: "#transfer-dialog-btn-cancel",
            },
        },
        {
            target: "body",
            title: "🎉 Panduan Penerimaan Transfer Masuk Selesai!",
            content:
                "Luar biasa! Anda telah menguasai alur penerimaan transfer masuk secara menyeluruh: dari pemantauan armada tiba, pencocokan fisik barang, penanganan selisih dan retur, hingga otomatisasi penambahan stok masuk ke inventaris toko.",
            placement: "center",
            action: {
                type: "navigate",
                url: "/admin/inventory/stock-transfer/terima",
            },
        },
    ],
};
