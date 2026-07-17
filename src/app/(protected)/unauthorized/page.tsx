import { AccessDeniedState } from "@/components/ui/access-denied-state";

export const metadata = {
    title: "Akses Ditolak — Multi Store POS",
};

export default function UnauthorizedPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <AccessDeniedState
                title="Akses Ditolak — Izin Tidak Mencukupi"
                description="Anda tidak memiliki hak akses yang sesuai untuk melihat atau mengelola halaman administrasi ini. Silakan kembali ke Dashboard atau Layar Kasir."
                showBackButton={true}
                showHomeButton={true}
            />
        </div>
    );
}
