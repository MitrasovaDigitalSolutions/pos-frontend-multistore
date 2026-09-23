import { redirect } from "next/navigation";

/**
 * Backward-compatibility redirect: /admin/license → /licenses
 * The license management page is now a standalone page outside the admin layout.
 */
export default function AdminLicenseRedirectPage() {
    redirect("/licenses");
}
