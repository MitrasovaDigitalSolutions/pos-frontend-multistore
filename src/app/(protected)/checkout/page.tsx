import { Checkout } from "@/features/checkout/checkout";
import { LicenseAdminGuard } from "@/features/license/components/license-admin-guard";

export const metadata = {
  title: "Checkout / Kasir",
};

export default function CheckoutPage() {
  return (
    <LicenseAdminGuard>
      <Checkout />
    </LicenseAdminGuard>
  );
}
