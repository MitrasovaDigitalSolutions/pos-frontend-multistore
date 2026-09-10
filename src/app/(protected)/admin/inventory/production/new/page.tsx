import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function AdminOldProductionCreatePage() {
    redirect(ROUTES.ADMIN_PRODUCTION_CREATE);
}
