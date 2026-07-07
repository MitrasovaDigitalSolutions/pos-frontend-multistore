import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "@/styles/globals.css";
import { AppProviders } from "@/providers/app-providers";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: "Mitrasova POS — Sistem Point of Sale",
    description: "Sistem Point of Sale Modern untuk Mitrasova POS",
    manifest: "/manifest.json",
    icons: {
        icon: "/icon.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="id"
            className={`${dmSans.variable} font-sans h-full antialiased`}
        >
            <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
                <AppProviders>
                    {children}
                    <ConfirmDialog />
                </AppProviders>
            </body>
        </html>
    );
}
