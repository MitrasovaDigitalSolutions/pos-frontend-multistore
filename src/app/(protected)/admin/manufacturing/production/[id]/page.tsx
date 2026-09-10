import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default async function AdminManufacturingProductionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    redirect(ROUTES.ADMIN_PRODUCTION_EDIT(id));
}
