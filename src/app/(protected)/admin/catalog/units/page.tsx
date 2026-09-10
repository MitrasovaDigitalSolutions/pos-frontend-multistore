import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function AdminCatalogUnitsRedirect() {
    redirect(ROUTES.ADMIN_UNITS);
}
