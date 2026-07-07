import { Products } from "@/features/products/products";
import { Suspense } from "react";

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat data produk...</div>}>
      <Products />
    </Suspense>
  );
}


