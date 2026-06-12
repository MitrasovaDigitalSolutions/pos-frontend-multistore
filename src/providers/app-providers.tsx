"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "./session-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageLoadingTracker } from "@/components/shared/page-loading-tracker";
import { PageLoader } from "@/components/shared/page-loader";
import { Suspense } from "react";

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <SessionProvider>
            <QueryProvider>
                <TooltipProvider delayDuration={200}>
                    <Suspense fallback={null}>
                        <PageLoadingTracker />
                    </Suspense>
                    <PageLoader />
                    {children}
                </TooltipProvider>
                <Toaster position="top-right" />
            </QueryProvider>
        </SessionProvider>
    );
}


