import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function AdminOldProductionPage() {
    redirect(ROUTES.ADMIN_PRODUCTION);
}
