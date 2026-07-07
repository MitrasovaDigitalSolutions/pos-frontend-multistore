import { Products } from "@/features/products/products";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export const metadata = {
  title: "Daftar Barang",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat data produk...</div>}>
      <div className="flex flex-col min-h-screen bg-slate-50 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/checkout">
            <Button
              variant="outline"
              className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
            >
              <IconArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="text-base font-bold text-slate-900">Kembali ke Checkout</h2>
            <p className="text-xs text-slate-400">Pencarian dan detail produk</p>
          </div>
        </div>
        <Products />
      </div>
    </Suspense>
  );
}
