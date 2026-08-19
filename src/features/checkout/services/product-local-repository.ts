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
}

export interface PaginatedLocalProductsResult {
    items: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export class ProductLocalRepository {
    private static instance: ProductLocalRepository | null = null;

    private constructor() {}

    public static getInstance(): ProductLocalRepository {
        if (!ProductLocalRepository.instance) {
            ProductLocalRepository.instance = new ProductLocalRepository();
        }
        return ProductLocalRepository.instance;
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

        try {
            const collection = db.products.filter((p) => {
                // Hanya produk aktif yang bisa dijual
                if (p.status !== "active") return false;

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

            const total = await collection.count();
            const totalPages = Math.ceil(total / perPage) || 1;
            const offset = (page - 1) * perPage;

            const items = await collection.offset(offset).limit(perPage).toArray();

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
     */
    public async getDistinctCategoriesAndBrands(): Promise<{
        categories: Array<{ uid: string; nama: string }>;
        brands: Array<{ uid: string; nama: string }>;
    }> {
        try {
            const categoriesMap = new Map<string, string>();
            const brandsMap = new Map<string, string>();

            await db.products.each((p) => {
                if (p.category?.uid && p.category?.nama) {
                    categoriesMap.set(p.category.uid, p.category.nama);
                }
                if (p.brand?.uid && p.brand?.nama) {
                    brandsMap.set(p.brand.uid, p.brand.nama);
                } else if (p.merek) {
                    brandsMap.set(p.merek, p.merek);
                }
            });

            return {
                categories: Array.from(categoriesMap.entries()).map(([uid, nama]) => ({ uid, nama })),
                brands: Array.from(brandsMap.entries()).map(([uid, nama]) => ({ uid, nama })),
            };
        } catch (err) {
            console.error("Error getting distinct categories & brands from IndexedDB:", err);
            return { categories: [], brands: [] };
        }
    }
}

export const productLocalRepository = ProductLocalRepository.getInstance();
