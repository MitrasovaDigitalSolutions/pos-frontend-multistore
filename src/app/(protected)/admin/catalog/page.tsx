import { ProductCatalog } from "@/features/catalog/catalog";
import { CatalogSkeleton } from "@/features/catalog/components/catalog-skeleton";
import { Suspense } from "react";

export const metadata = {
    title: "Katalog Produk — Multi-Toko",
    description: "Kelola distribusi produk master ke seluruh toko dan cabang.",
};

export default function AdminCatalogPage() {
    return (
        <Suspense fallback={<CatalogSkeleton />}>
            <ProductCatalog />
        </Suspense>
    );
}
