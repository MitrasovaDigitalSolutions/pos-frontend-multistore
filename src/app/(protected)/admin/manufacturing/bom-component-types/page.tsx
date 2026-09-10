import { BomComponentTypes } from "@/features/manufacturing/bom-component-types/bom-component-types";

export const metadata = {
    title: "Tipe Komponen BOM — Manufaktur",
    description: "Kelola daftar tipe komponen dan driver alokasi HPP pada resep BOM.",
};

export default function AdminManufacturingBomComponentTypesPage() {
    return <BomComponentTypes />;
}
