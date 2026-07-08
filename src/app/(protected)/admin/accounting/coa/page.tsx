import { UnderDevelopment } from "@/components/feedback/under-development";
import { IconNotebook } from "@tabler/icons-react";

export default function ChartOfAccountsPage() {
    return (
        <UnderDevelopment
            title="Chart of Accounts (COA)"
            description="Fitur manajemen Chart of Accounts (COA) / Daftar Akun sedang dalam proses pengembangan. Halaman ini nantinya memungkinkan Anda membuat, memperbarui, dan mengelola daftar akun standar akuntansi bisnis."
            icon={<IconNotebook className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
        />
    );
}
