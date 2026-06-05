import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import ShowcaseToolbar from "@/components/ShowcaseToolbar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GroceryPOS — Sistem Point of Sale",
  description: "Sistem Point of Sale Modern untuk Supermarket / Grocery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
          <ShowcaseToolbar />
        </AuthProvider>
      </body>
    </html>
  );
}
