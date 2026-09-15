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
                "Menu Transfer Masuk mencatat seluruh pasokan stok fisik yang dikirimkan oleh toko cabang lain atau gudang pusat ke toko Anda. Halaman ini menjadi gerbang verifikasi sebelum barang kiriman resmi dibukukan ke inventaris toko Anda.",
            placement: "bottom",
        },
        {
            target: "#transfer-stat-cards",
            title: "2. Indikator Status Penerimaan",
            content:
                "Pantau kondisi pengiriman masuk melalui 4 kartu indikator:\n• 'Total Transfer Masuk': Akumulasi seluruh surat jalan yang ditujukan ke cabang Anda.\n• 'Dikirim': Armada kurir/ekspedisi sedang dalam perjalanan membawa fisik barang.\n• 'Diterima Sebagian': Barang telah dicek sebagian atau ada selisih yang dilaporkan.\n• 'Selesai': Seluruh barang sukses diterima dan stok masuk 100% ke inventaris.",
            placement: "bottom",
        },
        {
            target: "#transfer-list-filters",
            title: "3. Filter & Pencarian Surat Jalan",
            content:
                "Saring daftar transfer masuk berdasarkan nomor dokumen surat jalan, rentang tanggal kirim, maupun cabang asal pengirim agar proses pengecekan bongkar muatan barang lebih cepat dan terorganisir.",
            placement: "bottom",
        },
        {
            target: "#transfer-row-0",
            title: "4. Pilih Dokumen Transfer untuk Diproses",
            content:
                "Baris ini memuat data simulasi transfer masuk berstatus 'Dikirim' dari Gudang Pusat Surabaya ke cabang Anda. Perhatikan nomor transfer, rute toko, dan status pengiriman aktif.\n\nKlik 'Selanjutnya' untuk membuka formulir manifes dan verifikasi fisik penerimaan barang.",
            placement: "bottom",
        },
        {
            target: "#transfer-detail-stepper",
            title: "5. Stepper Progres Distribusi",
            content:
                "Indikator 4-tahap ini menampilkan posisi alur pengiriman secara real-time. Dokumen saat ini berada pada tahap 'Penerimaan', menandakan armada kurir telah tiba di toko Anda dan barang siap dicek secara fisik.",
            placement: "bottom",
        },
        {
            target: "#transfer-detail-info-cards",
            title: "6. Rute Toko & Catatan Pengiriman",
            content:
                "Panel informasi merangkum detail toko asal pengirim (Gudang Pusat Surabaya), toko tujuan penerima (cabang Anda), tanggal keberangkatan armada, serta instruksi catatan khusus dari bagian logistik pengirim.",
            placement: "left",
        },
        {
            target: "#transfer-detail-items-header",
            title: "7. Manifes Barang & Pengecekan Fisik",
            content:
                "Tabel manifes ini memuat daftar produk dan jumlah kuantitas unit yang dikirim. Saat staf membongkar muatan kardus fisik, lakukan penghitungan teliti satu per satu untuk dicocokkan dengan angka pada kolom 'Dikirim'.",
            placement: "bottom",
        },
        {
            target: "#transfer-receive-qty-0",
            title: "8. Input Kuantitas Diterima Aktual",
            content:
                "Secara default, kolom 'Qty Diterima' terisi sama dengan kuantitas kiriman. Jika terdapat kekurangan fisik barang (misal: hanya sampai 8 dari 10 unit), staf dapat langsung mengedit angka kuantitas yang diterima secara nyata di lapangan.",
            placement: "bottom",
        },
        {
            target: "#transfer-btn-terima-0",
            title: "9. Tombol Konfirmasi Penerimaan",
            content:
                "Setelah menghitung fisik barang, tombol 'Terima' ini digunakan untuk membuka dialog konfirmasi dan memvalidasi penerimaan produk. Klik 'Selanjutnya' untuk melihat dialog konfirmasi penerimaan barang.",
            placement: "left",
        },
        {
            target: "#transfer-dialog-confirm-receive",
            title: "10. Dialog Verifikasi Penerimaan Item",
            content:
                "Dialog ini menampilkan rincian barang yang akan diterima beserta status selisih. Anda dapat memeriksa kuantitas aktual barang sebelum diverifikasi ke sistem, atau memilih alasan selisih bila terjadi kekurangan unit.",
            placement: "top",
            variant: "overlay_nav",
            overlayNav: true,
        },
        {
            target: "#transfer-btn-tolak-0",
            title: "11. Opsi Penolakan Barang (Tolak)",
            content:
                "Jika produk yang tiba rusak parah, tidak sesuai pesanan, atau salah kirim dari cabang asal, Anda dapat memilih tombol 'Tolak' ini. Klik 'Selanjutnya' untuk membuka dialog peringatan penolakan dan memahami konsekuensinya.",
            placement: "left",
        },
        {
            target: "#transfer-dialog-confirm-receive",
            title: "12. Dialog Konfirmasi Penolakan & Dampaknya",
            content:
                "Dialog peringatan ini memastikan penolakan produk. Dampak penting penolakan:\n• Kuantitas diterima dicatat 0 pcs dan barang TIDAK ditambahkan ke stok toko Anda.\n• Status pengiriman berubah menjadi 'Menunggu Validasi'.\n• Cabang pengirim harus memvalidasi klaim dan memproses pengembalian (retur) fisik barang.",
            placement: "top",
            variant: "overlay_nav",
            overlayNav: true,
        },
        {
            target: "body",
            title: "🎉 Panduan Penerimaan Transfer Masuk Selesai!",
            content:
                "Selamat! Anda telah menguasai alur penerimaan transfer masuk secara menyeluruh: mulai dari memilih surat jalan di daftar transfer, pengecekan manifes barang, penyesuaian kuantitas fisik dan selisih, hingga pemahaman mekanisme penerimaan serta penolakan produk.",
            placement: "center",
            action: {
                type: "navigate",
                url: "/admin/inventory/stock-transfer/terima",
            },
        },
    ],
    stock_transfer_validation: [
        {
            target: "#transfer-list-header",
            title: "1. Pengenalan Validasi Transfer Stok",
            content:
                "Menu Validasi Transfer adalah pusat kontrol bagi toko asal (pengirim) untuk meninjau dan menyelesaikan klaim selisih stok (retur barang rusak/hilang atau koreksi kelebihan) yang dilaporkan oleh cabang penerima saat pembongkaran kiriman.",
            placement: "bottom",
        },
        {
            target: "#transfer-stat-cards",
            title: "2. Indikator Beban & Status Validasi",
            content:
                "Pantau pergerakan penyelesaian selisih transfer:\n• 'Menunggu Validasi': Pengiriman yang melaporkan adanya barang rusak, hilang, atau kelebihan dan memerlukan persetujuan toko asal.\n• 'Selesai': Seluruh transfer yang selisihnya telah divalidasi dan saldo stok antartoko telah sinkron.",
            placement: "bottom",
        },
        {
            target: "#transfer-list-filters",
            title: "3. Filter Surat Jalan & Cabang Pemohon",
            content:
                "Gunakan kolom pencarian dan filter untuk menyaring dokumen berdasarkan nomor transfer atau toko cabang tujuan yang mengajukan klaim selisih barang.",
            placement: "bottom",
        },
        {
            target: "#transfer-row-0",
            title: "4. Pilih Transfer Menunggu Validasi",
            content:
                "Baris ini memuat simulasi transfer stok TRF-2026-0902 yang dikirim ke Cabang Malang Kota dengan status 'Menunggu Validasi'.\n\nKlik 'Selanjutnya' untuk membuka rincian dokumen dan memeriksa laporan selisih fisik barang.",
            placement: "bottom",
        },
        {
            target: "#transfer-detail-stepper",
            title: "5. Indikator Menunggu Validasi",
            content:
                "Banner status kuning ini menegaskan bahwa pengiriman berada pada tahap peninjauan selisih. Sebagai toko pengirim, Anda berwenang memutuskan: menyetujui pengembalian (retur) stok ke toko Anda atau menolak klaim jika ada ketidaksesuaian laporan.",
            placement: "bottom",
        },
        {
            target: "#transfer-detail-info-cards",
            title: "6. Rincian Rute & Kronologi Ekspedisi",
            content:
                "Panel samping menampilkan rincian toko cabang pemohon klaim (Cabang Malang Kota), tanggal keberangkatan armada, nomor surat jalan, serta catatan pengiriman untuk mempermudah investigasi dengan pihak kurir/logistik.",
            placement: "left",
        },
        {
            target: "#transfer-detail-items-header",
            title: "7. Manifes Produk & Laporan Selisih",
            content:
                "Tabel ini merinci produk kiriman yang bermasalah. Perhatikan perbandingan kolom 'Dikirim' vs 'Diterima', badge 'Alasan Selisih' (misal: Barang Rusak), serta catatan keterangan dari staf penerima cabang.",
            placement: "bottom",
        },
        {
            target: "#transfer-validation-qty-0",
            title: "8. Penyesuaian Kuantitas Retur",
            content:
                "Secara default, kolom ini terisi selisih kekurangan (misal: 4 pcs). Anda dapat menyesuaikan kuantitas yang disetujui untuk diretur kembali ke inventaris toko Anda jika telah ada kesepakatan sebagian dengan cabang.",
            placement: "bottom",
        },
        {
            target: "#transfer-btn-validate-approve-0",
            title: "9. Tombol Setujui Validasi Retur",
            content:
                "Tombol hijau 'Validasi' ini digunakan untuk menyetujui klaim pengembalian produk. Klik 'Selanjutnya' untuk melihat dialog konfirmasi dan dampak penyesuaian stoknya.",
            placement: "left",
        },
        {
            target: "#transfer-dialog-confirm-validate",
            title: "10. Dialog Konfirmasi Validasi Retur",
            content:
                "Dialog ini menegaskan konsekuensi validasi:\n• Kuantitas retur (4 pcs) akan otomatis dikembalikan ke saldo stok toko asal Anda.\n• Nilai selisih dicatat dalam laporan audit inventaris.\n• Status item berubah menjadi 'Sudah Divalidasi'.",
            placement: "top",
            variant: "overlay_nav",
            overlayNav: true,
        },
        {
            target: "#transfer-btn-validate-reject-0",
            title: "11. Opsi Penolakan Klaim (Tolak)",
            content:
                "Bila laporan selisih cabang tidak terbukti (misal: ada bukti foto serah terima dari kurir bahwa kardus diterima utuh dan segel sempurna), Anda berhak menolak klaim selisih. Klik 'Selanjutnya' untuk melihat dialog penolakan.",
            placement: "left",
        },
        {
            target: "#transfer-dialog-confirm-validate",
            title: "12. Konsekuensi Penolakan Klaim",
            content:
                "Pada dialog ini, jika klaim ditolak:\n• Seluruh kuantitas awal (24 pcs) tetap dianggap sukses diterima dan dibebankan penuh ke cabang penerima.\n• Tidak ada pengembalian fisik stok ke toko asal.",
            placement: "top",
            variant: "overlay_nav",
            overlayNav: true,
        },
        {
            target: "body",
            title: "🎉 Panduan Validasi Transfer Selesai!",
            content:
                "Luar biasa! Anda telah memahami seluruh alur validasi transfer stok antartoko: evaluasi daftar transfer selisih, pengecekan manifes & alasan klaim, penyesuaian kuantitas, hingga dampak persetujuan dan penolakan retur barang.",
            placement: "center",
            action: {
                type: "navigate",
                url: "/admin/inventory/stock-transfer/validasi",
            },
        },
    ],
};
