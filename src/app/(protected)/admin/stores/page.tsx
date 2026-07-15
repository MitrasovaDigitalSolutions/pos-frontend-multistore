import { Stores } from "@/features/stores/stores";
import { Suspense } from "react";

export default function AdminStoresPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat data toko...</div>}>
      <Stores />
    </Suspense>
  );
}