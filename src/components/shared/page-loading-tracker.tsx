"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { usePageLoadingStore } from "@/stores/page-loading-store";

export function PageLoadingTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const stopLoading = usePageLoadingStore((state) => state.stopLoading);
    const startLoading = usePageLoadingStore((state) => state.startLoading);

    // Stop loading when pathname or searchParams changes
    useEffect(() => {
        stopLoading();
    }, [pathname, searchParams, stopLoading]);

    // Handle page restore from back-forward cache (bfcache) to prevent stuck loading state
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                stopLoading();
            }
        };
        window.addEventListener("pageshow", handlePageShow);
        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, [stopLoading]);

    // Intercept clicks on local links
    useEffect(() => {
        const handleAnchorClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const anchor = target.closest("a");

            if (!anchor) return;

            const href = anchor.getAttribute("href");
            const targetAttr = anchor.getAttribute("target");

            // Ignore external links, links with target="_blank", mailto/tel, javascript, and anchors
            if (
                !href ||
                href.startsWith("http://") ||
                href.startsWith("https://") ||
                targetAttr === "_blank" ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                href.startsWith("#") ||
                href.startsWith("javascript:") ||
                href.startsWith("blob:") ||
                href.startsWith("data:") ||
                anchor.hasAttribute("download")
            ) {
                return;
            }

            // Ignore modifier keys (Cmd/Ctrl click to open in new tab)
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            // Get the current path + search
            const currentUrl = window.location.pathname + window.location.search;
            const targetUrl = href;

            // If navigating to the exact same URL, don't trigger loading
            if (targetUrl === currentUrl || targetUrl === window.location.pathname) {
                return;
            }

            // Trigger loading screen
            startLoading();
        };

        // Listen in capturing phase to intercept before React/Next.js prevent default
        document.addEventListener("click", handleAnchorClick, { capture: true });
        return () => {
            document.removeEventListener("click", handleAnchorClick, { capture: true });
        };
    }, [pathname, startLoading]);

    return null;
}
