import { ProductBom } from "@/features/manufacturing/product-bom/product-bom";

export const metadata = {
    title: "Produk BOM (Resep Manufaktur) — Manufaktur",
    description: "Kelola resep Bill of Materials (BOM) untuk setiap produk barang jadi konveksi/manufaktur.",
};

export default function AdminManufacturingProductBomPage() {
    return <ProductBom />;
}
