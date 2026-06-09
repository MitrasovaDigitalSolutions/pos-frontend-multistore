import { Suspense } from "react";
import { Users } from "@/features/users/users";
import { PageLoader } from "@/components/feedback/page-loader";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<PageLoader message="Memuat halaman..." />}>
      <Users />
    </Suspense>
  );
}


