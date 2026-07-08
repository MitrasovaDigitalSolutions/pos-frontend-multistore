import { UnderDevelopment } from "@/components/feedback/under-development";
import { IconGitBranch } from "@tabler/icons-react";

export default function CoaMappingPage() {
    return (
        <UnderDevelopment
            title="Mapping COA"
            description="Fitur Mapping COA sedang dalam proses pengembangan. Halaman ini nantinya digunakan untuk memetakan jenis transaksi operasional harian (seperti penjualan, pembelian, pengeluaran) ke akun COA masing-masing secara otomatis."
            icon={<IconGitBranch className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
        />
    );
}
