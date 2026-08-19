"use client";

import { db } from "@/lib/db";
import type { Product } from "@/features/master/products/types";

export interface PaginatedLocalProductsParams {
    search?: string;
    category_uid?: string;
    brand_uid?: string;
    stock?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface PaginatedLocalProductsResult {
    items: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export class ProductLocalRepository {
    private static instance: ProductLocalRepository | null = null;
    private cachedCategoriesAndBrands: {
        categories: Array<{ uid: string; nama: string }>;
        brands: Array<{ uid: string; nama: string }>;
        timestamp: number;
    } | null = null;

    private constructor() { }

    public static getInstance(): ProductLocalRepository {
        if (!ProductLocalRepository.instance) {
            ProductLocalRepository.instance = new ProductLocalRepository();
        }
        return ProductLocalRepository.instance;
    }

    public invalidateCache(): void {
        this.cachedCategoriesAndBrands = null;
    }

    /**
     * Cari produk exact berdasarkan barcode atau nama di IndexedDB (kecepatan <1ms via index).
     */
    public async lookupBarcodeLocal(query: string): Promise<Product | null> {
        const cleanQuery = query.trim();
        if (!cleanQuery) return null;

        try {
            // 1. Exact match Barcode (Case-insensitive)
            const byBarcode = await db.products
                .where("barcode")
                .equalsIgnoreCase(cleanQuery)
                .first();
            if (byBarcode && byBarcode.status === "active") return byBarcode;

            // 2. Exact match Nama
            const byName = await db.products
                .where("nama")
                .equalsIgnoreCase(cleanQuery)
                .first();
            if (byName && byName.status === "active") return byName;

            // 3. Substring match Nama jika query pendek
            const byNamePartial = await db.products
                .filter((p) => p.status === "active" && p.nama.toLowerCase().includes(cleanQuery.toLowerCase()))
                .first();
            if (byNamePartial) return byNamePartial;

            return null;
        } catch (err) {
            console.error("Error looking up product in IndexedDB:", err);
            return null;
        }
    }

    /**
     * Autocomplete suggestions cepat untuk scanner bar / search bar (limit default 8).
     * Menggunakan filter dengan limit agar tidak membebani memori.
     */
    public async searchSuggestionsLocal(query: string, limit = 8): Promise<Product[]> {
        const cleanQuery = query.toLowerCase().trim();
        if (cleanQuery.length < 2) return [];

        try {
            const queryWords = cleanQuery.split(/\s+/);
            const results: Product[] = [];

            // Iterasi dengan early exit jika sudah mencapai limit
            await db.products
                .filter((p) => {
                    if (p.status !== "active") return false;
                    const barcodeMatch = p.barcode?.toLowerCase().includes(cleanQuery) ?? false;
                    const nameMatch = queryWords.every((w) => p.nama.toLowerCase().includes(w));
                    const brandMatch =
                        p.brand?.nama.toLowerCase().includes(cleanQuery) ||
                        p.merek?.toLowerCase().includes(cleanQuery) ||
                        false;

                    return barcodeMatch || nameMatch || brandMatch;
                })
                .until(() => results.length >= limit)
                .each((p) => {
                    if (results.length < limit) {
                        results.push(p);
                    }
                });

            return results;
        } catch (err) {
            console.error("Error searching suggestions in IndexedDB:", err);
            return [];
        }
    }

    /**
     * Mengambil data produk terpaginasi dari IndexedDB untuk dialog pencarian produk.
     * Mendukung pengurutan (sorting) global pada seluruh 19.000+ data secara instan.
     */
    public async getPaginatedProductsLocal(
        params: PaginatedLocalProductsParams
    ): Promise<PaginatedLocalProductsResult> {
        const page = Math.max(1, params.page || 1);
        const perPage = Math.max(1, params.perPage || 10);
        const search = (params.search || "").toLowerCase().trim();
        const categoryUid = params.category_uid || "all";
        const brandUid = params.brand_uid || "all";
        const stockFilter = params.stock || "all";
        const sortBy = params.sortBy;
        const sortOrder = params.sortOrder;
        const offset = (page - 1) * perPage;

        try {
            const collection = db.products.filter((p) => {
                // Hanya produk aktif yang bisa dijual (fallback jika status undefined maka tetap dianggap active)
                if (p.status && p.status !== "active") return false;

                // Filter Kata Kunci (Nama, Barcode, Merek)
                if (search) {
                    const words = search.split(/\s+/);
                    const isMatch = words.every((w) => {
                        const nameMatch = p.nama.toLowerCase().includes(w);
                        const barcodeMatch = p.barcode?.toLowerCase().includes(w) ?? false;
                        const brandMatch =
                            p.brand?.nama.toLowerCase().includes(w) ||
                            p.merek?.toLowerCase().includes(w) ||
                            false;
                        return nameMatch || barcodeMatch || brandMatch;
                    });
                    if (!isMatch) return false;
                }

                // Filter Kategori
                if (categoryUid !== "all") {
                    if (p.category_uid !== categoryUid && p.category?.uid !== categoryUid) {
                        return false;
                    }
                }

                // Filter Brand
                if (brandUid !== "all") {
                    if (p.brand_uid !== brandUid && p.brand?.uid !== brandUid && p.merek !== brandUid) {
                        return false;
                    }
                }

                // Filter Stok
                if (stockFilter !== "all") {
                    if (p.is_jasa) {
                        if (stockFilter !== "available") return false;
                    } else {
                        if (stockFilter === "available" && p.stok <= 0) return false;
                        if (stockFilter === "low" && (p.stok <= 0 || p.stok > 5)) return false;
                        if (stockFilter === "empty" && p.stok > 0) return false;
                    }
                }

                return true;
            });

            // Ambil semua matching data untuk sorting komprehensif pada seluruh dataset
            const allItems = await collection.toArray();
            const total = allItems.length;

            if (sortBy && sortOrder) {
                const isDesc = sortOrder === "desc";
                allItems.sort((a, b) => {
                    let valA: unknown;
                    let valB: unknown;

                    if (sortBy === "category.nama") {
                        valA = a.category?.nama || "";
                        valB = b.category?.nama || "";
                    } else {
                        valA = (a as unknown as Record<string, unknown>)[sortBy];
                        valB = (b as unknown as Record<string, unknown>)[sortBy];
                    }

                    // Numeric comparison untuk harga dan stok
                    if (typeof valA === "number" && typeof valB === "number") {
                        return isDesc ? valB - valA : valA - valB;
                    }

                    if (typeof valA === "string") valA = valA.toLowerCase();
                    if (typeof valB === "string") valB = valB.toLowerCase();

                    if (valA === undefined || valA === null) return isDesc ? -1 : 1;
                    if (valB === undefined || valB === null) return isDesc ? 1 : -1;

                    if (valA < valB) return isDesc ? 1 : -1;
                    if (valA > valB) return isDesc ? -1 : 1;
                    return 0;
                });
            }

            const items = allItems.slice(offset, offset + perPage);
            const totalPages = Math.max(1, Math.ceil(total / perPage));

            return {
                items,
                total,
                totalPages,
                currentPage: page,
            };
        } catch (err) {
            console.error("Error fetching paginated products from IndexedDB:", err);
            return {
                items: [],
                total: 0,
                totalPages: 1,
                currentPage: page,
            };
        }
    }

    /**
     * Mengambil daftar unik kategori dan brand dari IndexedDB untuk filter dialog.
     * Menggunakan short-term cache (60 detik) untuk efisiensi memory & I/O 19.000+ produk.
     */
    public async getDistinctCategoriesAndBrands(): Promise<{
        categories: Array<{ uid: string; nama: string }>;
        brands: Array<{ uid: string; nama: string }>;
    }> {
        const now = Date.now();
        if (
            this.cachedCategoriesAndBrands &&
            now - this.cachedCategoriesAndBrands.timestamp < 60_000
        ) {
            return {
                categories: this.cachedCategoriesAndBrands.categories,
                brands: this.cachedCategoriesAndBrands.brands,
            };
        }

        try {
            const categoriesMap = new Map<string, string>();
            const brandsMap = new Map<string, string>();

            await db.products.where("status").equals("active").each((p) => {
                if (p.category?.uid && p.category?.nama) {
                    categoriesMap.set(p.category.uid, p.category.nama);
                }
                if (p.brand?.uid && p.brand?.nama) {
                    brandsMap.set(p.brand.uid, p.brand.nama);
                } else if (p.merek) {
                    brandsMap.set(p.merek, p.merek);
                }
            });

            const categories = Array.from(categoriesMap.entries()).map(([uid, nama]) => ({ uid, nama }));
            const brands = Array.from(brandsMap.entries()).map(([uid, nama]) => ({ uid, nama }));

            this.cachedCategoriesAndBrands = {
                categories,
                brands,
                timestamp: now,
            };

            return { categories, brands };
        } catch (err) {
            console.error("Error getting distinct categories & brands from IndexedDB:", err);
            return { categories: [], brands: [] };
        }
    }
}

export const productLocalRepository = ProductLocalRepository.getInstance();
