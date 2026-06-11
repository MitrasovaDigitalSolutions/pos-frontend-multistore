"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconBarcode, IconSearch, IconLoader2 } from "@tabler/icons-react";
import { lookupProductByBarcode } from "../../api/purchase-api";
import type { Product } from "@/features/products/types";

interface BarcodeInputProps {
    onProductFound: (product: Product) => void;
    onError?: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    products?: Product[];
}

export function BarcodeInput({
    onProductFound,
    onError,
    disabled = false,
    placeholder = "Scan barcode atau ketik nama produk...",
    products = [],
}: BarcodeInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [flashState, setFlashState] = useState<"success" | "error" | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-focus on mount
    useEffect(() => {
        if (!disabled) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [disabled]);

    // Clear flash after animation
    useEffect(() => {
        if (flashState) {
            const timer = setTimeout(() => setFlashState(null), 600);
            return () => clearTimeout(timer);
        }
    }, [flashState]);

    const triggerFlash = (type: "success" | "error") => {
        setFlashState(type);
    };

    const refocusInput = useCallback(() => {
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = value.trim();
        setValue("");

        if (!query) {
            refocusInput();
            return;
        }

        setIsSearching(true);

        try {
            // 1. Try local match by barcode
            let found = products.find(
                (p) => p.barcode?.toLowerCase() === query.toLowerCase(),
            );

            // 2. Try local match by name
            if (!found) {
                found = products.find((p) =>
                    p.nama.toLowerCase().includes(query.toLowerCase()),
                );
            }

            // 3. Try API barcode lookup
            if (!found) {
                try {
                    found = await lookupProductByBarcode(query);
                } catch {
                    // API lookup failed
                }
            }

            if (found) {
                triggerFlash("success");
                onProductFound(found);
            } else {
                triggerFlash("error");
                onError?.(`Produk "${query}" tidak ditemukan!`);
            }
        } catch {
            triggerFlash("error");
            onError?.("Terjadi kesalahan saat mencari produk.");
        } finally {
            setIsSearching(false);
            refocusInput();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Debounce for rapid scanner input
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (e.key === "Enter") {
            e.preventDefault();
            debounceRef.current = setTimeout(() => {
                const form = inputRef.current?.form;
                if (form) {
                    form.requestSubmit();
                }
            }, 100);
        }
    };

    const flashClasses =
        flashState === "success"
            ? "ring-2 ring-emerald-400 bg-emerald-50/50"
            : flashState === "error"
              ? "ring-2 ring-rose-400 bg-rose-50/50 animate-shake"
              : "";

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div
                className={`
                    relative flex items-center gap-2 rounded-2xl border border-slate-200 
                    bg-white px-4 py-3 transition-all duration-200
                    focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    ${flashClasses}
                `}
            >
                {isSearching ? (
                    <IconLoader2 size={20} className="text-emerald-500 animate-spin shrink-0" />
                ) : (
                    <IconBarcode size={20} className="text-slate-400 shrink-0" />
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isSearching}
                    autoComplete="off"
                    className="
                        flex-1 bg-transparent border-none outline-none text-sm text-slate-800
                        placeholder:text-slate-400 font-medium
                        disabled:cursor-not-allowed
                    "
                />

                <button
                    type="submit"
                    disabled={disabled || isSearching || !value.trim()}
                    className="
                        flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
                        bg-emerald-50 text-emerald-600 hover:bg-emerald-100
                        disabled:opacity-40 disabled:cursor-not-allowed
                        transition-colors cursor-pointer
                    "
                >
                    <IconSearch size={14} />
                    <span>Cari</span>
                </button>
            </div>

            {/* Auto-focus indicator */}
            <div className="flex items-center gap-1.5 mt-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-medium">
                    Scanner aktif — otomatis fokus ke input
                </span>
            </div>

        </form>
    );
}
