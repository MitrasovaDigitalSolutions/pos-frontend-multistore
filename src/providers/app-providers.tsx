"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "./session-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <SessionProvider>
            <QueryProvider>
                {children}
                <Toaster position="top-right" />
            </QueryProvider>
        </SessionProvider>
    );
}
