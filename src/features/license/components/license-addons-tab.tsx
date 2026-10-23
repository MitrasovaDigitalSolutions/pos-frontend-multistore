"use client";

import { LicenseExpiredWrapper } from "./license-expired-wrapper";
import { LicenseAddonsHeader } from "./addons/license-addons-header";
import { LicenseAddonRow } from "./addons/license-addon-row";
import { LicenseAddonsEmptyState } from "./addons/license-addons-empty-state";
import { useLicenseAddons } from "../hooks/use-license-addons";

interface LicenseAddonsTabProps {
    activeAddons: string[];
    isOperable?: boolean;
    expiresAt?: string | null;
    daysRemaining?: number | null;
    onGoToCatalog?: () => void;
    onRenewClick?: () => void;
}

export function LicenseAddonsTab({
    activeAddons,
    isOperable = true,
    expiresAt,
    daysRemaining,
    onGoToCatalog,
    onRenewClick,
}: LicenseAddonsTabProps) {
    const {
        purchasedAddons,
        filteredAddons,
        searchQuery,
        setSearchQuery,
        isProrateLoading,
    } = useLicenseAddons(activeAddons, isOperable);

    return (
        <div className="space-y-3.5">
            {/* Top Toolbar: Title, Count Badge, & Search */}
            <LicenseAddonsHeader
                count={purchasedAddons.length}
                isOperable={isOperable}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                showSearch={purchasedAddons.length > 3}
            />

            {/* List / Empty States */}
            {filteredAddons.length > 0 ? (
                <LicenseExpiredWrapper
                    isExpired={!isOperable}
                    title="Add-on Dinonaktifkan Sementara"
                    description="Masa aktif langganan POS telah kedaluwarsa. Seluruh fitur add-on yang terpasang tidak dapat dioperasikan hingga langganan toko diperbarui."
                    actionLabel="Perbarui Langganan"
                    onRenew={onRenewClick}
                >
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
                        {filteredAddons.map((addon) => (
                            <LicenseAddonRow
                                key={addon.code}
                                addon={addon}
                                isOperable={isOperable}
                                isProrateLoading={isProrateLoading}
                                fallbackExpiresAt={expiresAt}
                                fallbackDaysRemaining={daysRemaining}
                            />
                        ))}
                    </div>
                </LicenseExpiredWrapper>
            ) : purchasedAddons.length === 0 ? (
                <LicenseAddonsEmptyState
                    type="no_addons"
                    onGoToCatalog={onGoToCatalog}
                />
            ) : (
                <LicenseAddonsEmptyState
                    type="no_search_results"
                />
            )}
        </div>
    );
}

