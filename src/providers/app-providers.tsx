"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "./session-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <SessionProvider>
            <QueryProvider>
                <TooltipProvider delayDuration={200}>
                    {children}
                </TooltipProvider>
                <Toaster position="top-right" />
            </QueryProvider>
        </SessionProvider>
    );
}

