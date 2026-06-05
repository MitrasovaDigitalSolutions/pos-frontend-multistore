"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  IconScan,
  IconCategory,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconPrinter,
  IconCash,
  IconWifi,
  IconSearch,
  IconPackage,
  IconCreditCard,
  IconCircleCheck,
  IconX,
  IconHome,
  IconLogout,
  IconLoader2,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApiProduct {
  id: number;
  nama: string;
  merek: string;
  barcode: string | null;
  harga: number;
  stok: number;
  status: string;
}

interface CartItem {
  product_id: number;
  itemId?: number; // backend transaction_item id
  name: string;
  price: number;
  qty: number;
  stock: number;
  barcode: string | null;
}

interface HoldTransaction {
  id: number;
  items_count: number;
  subtotal: number;
  created_at: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, isLoading, logout, hasPermission, hasRole } = useAuth();

  // Products from API
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");

  // Active draft transaction
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // On-hold list
  const [holdList, setHoldList] = useState<HoldTransaction[]>([]);

  // UI state
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isHoldListOpen, setIsHoldListOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payMode, setPayMode] = useState<"cash" | "card">("cash");

  // Payment states
  const [cashReceived, setCashReceived] = useState("");
  const [cardType, setCardType] = useState("debit");
  const [cardLast4, setCardLast4] = useState("");
  const [cardRef, setCardRef] = useState("");

  // Receipt data (after successful payment)
  const [receipt, setReceipt] = useState<any>(null);

  const [trxTime, setTrxTime] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // ─── Auth Guard ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    } else if (!isLoading && user && !hasPermission("create_sales")) {
      toast.error("Anda tidak memiliki izin untuk mengakses Layar Kasir.");
      router.push("/admin");
    }
  }, [isLoading, token, user, router, hasPermission]);

  // ─── Load Products ─────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      const res = await apiFetch("/v1/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || data);
      }
    } catch {
      toast.error("Gagal memuat produk dari server.");
    }
  }, []);

  useEffect(() => {
    if (token) fetchProducts();
  }, [token, fetchProducts]);

  // ─── Clock & Keyboard Shortcuts ───────────────────────────────────────────

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTrxTime(
        `${now.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}`
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    barcodeInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        if (cart.length > 0) setIsPayModalOpen(true);
      } else if (e.key === "F2") {
        e.preventDefault();
        setIsCatalogOpen((p) => !p);
      } else if (e.key === "F5") {
        e.preventDefault();
        if (transactionId) handleHold();
      } else if (e.key === "F6") {
        e.preventDefault();
        openHoldList();
      } else if (e.key === "F10") {
        e.preventDefault();
        handleVoidDraft();
      } else if (e.key === "Escape") {
        setIsPayModalOpen(false);
        setIsCatalogOpen(false);
        setIsReceiptOpen(false);
        setIsHoldListOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cart, transactionId]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace(/,00$/, "");

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const ppn = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + ppn;

  const cashNum = parseFloat(cashReceived) || 0;
  const changeValue = cashNum - grandTotal;
  const isCashValid = cashNum >= grandTotal && grandTotal > 0;
  const isCardValid = cardLast4.length === 4 && grandTotal > 0;

  // ─── Transaction: Create Draft ─────────────────────────────────────────────

  const ensureDraftTransaction = async (): Promise<number | null> => {
    if (transactionId) return transactionId;
    try {
      const res = await apiFetch("/v1/transactions", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTransactionId(data.data.id);
        return data.data.id;
      }
      toast.error(data.message || "Gagal membuat transaksi.");
      return null;
    } catch {
      toast.error("Koneksi gagal.");
      return null;
    }
  };

  // ─── Add Item to Cart ──────────────────────────────────────────────────────

  const handleAddProduct = async (product: ApiProduct) => {
    if (product.status !== "active") {
      toast.error("Produk ini tidak aktif.");
      return;
    }
    if (product.stok <= 0) {
      toast.error(`Stok ${product.nama} habis!`);
      return;
    }

    // Check if already in cart
    const existing = cart.find((i) => i.product_id === product.id);
    if (existing && existing.qty >= product.stok) {
      toast.error(`Stok ${product.nama} tidak mencukupi!`);
      return;
    }

    const trxId = await ensureDraftTransaction();
    if (!trxId) return;

    try {
      setIsProcessing(true);
      const res = await apiFetch(`/v1/transactions/${trxId}/items`, {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      const data = await res.json();

      if (res.ok) {
        // Rebuild cart from response
        const trxRes = await apiFetch(`/v1/transactions/${trxId}`);
        const trxData = await trxRes.json();
        if (trxRes.ok) {
          buildCartFromTransaction(trxData.data);
        }
        toast.success(`${product.nama} ditambahkan.`);
        setTimeout(() => barcodeInputRef.current?.focus(), 50);
      } else {
        toast.error(data.message || "Gagal menambahkan item.");
      }
    } catch {
      toast.error("Koneksi gagal.");
    } finally {
      setIsProcessing(false);
    }
  };

  const buildCartFromTransaction = (trxData: any) => {
    const items: CartItem[] = (trxData.items || []).map((item: any) => ({
      product_id: item.product_id,
      itemId: item.id,
      name: item.nama_produk,           // backend: nama_produk
      price: item.harga_satuan,         // backend: harga_satuan
      qty: item.kuantitas,              // backend: kuantitas
      stock: item.product?.stok ?? 999,
      barcode: item.product?.barcode ?? item.barcode ?? null,
    }));
    setCart(items);
  };

  // ─── Update Item Quantity ──────────────────────────────────────────────────

  const handleUpdateQty = async (item: CartItem, newQty: number) => {
    if (!transactionId || !item.itemId) return;
    if (newQty <= 0) {
      handleRemoveItem(item);
      return;
    }

    try {
      setIsProcessing(true);
      const res = await apiFetch(
        `/v1/transactions/${transactionId}/items/${item.itemId}`,
        {
          method: "PUT",
          body: JSON.stringify({ quantity: newQty }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setCart((prev) =>
          prev.map((i) =>
            i.itemId === item.itemId ? { ...i, qty: newQty } : i
          )
        );
      } else {
        toast.error(data.message || "Gagal update kuantitas.");
      }
    } catch {
      toast.error("Koneksi gagal.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Remove Item ───────────────────────────────────────────────────────────

  const handleRemoveItem = async (item: CartItem) => {
    if (!transactionId || !item.itemId) return;
    try {
      setIsProcessing(true);
      const res = await apiFetch(
        `/v1/transactions/${transactionId}/items/${item.itemId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setCart((prev) => prev.filter((i) => i.itemId !== item.itemId));
        toast.error(`${item.name} dihapus.`);
      } else {
        toast.error("Gagal menghapus item.");
      }
    } catch {
      toast.error("Koneksi gagal.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Barcode / Name Search ─────────────────────────────────────────────────

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    setBarcodeInput("");
    if (!query) return;

    // Search by barcode first, then by name
    let found = products.find(
      (p) => p.barcode?.toLowerCase() === query.toLowerCase()
    );
    if (!found) {
      found = products.find((p) =>
        p.nama.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (found) {
      await handleAddProduct(found);
    } else {
      // Try API barcode lookup
      try {
        const res = await apiFetch(`/v1/products/barcode/${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          await handleAddProduct(data.data || data);
        } else {
          toast.error(`Produk "${query}" tidak ditemukan!`);
        }
      } catch {
        toast.error(`Produk "${query}" tidak ditemukan!`);
      }
    }
  };

  // ─── Hold ─────────────────────────────────────────────────────────────────

  const handleHold = async () => {
    if (!transactionId || cart.length === 0) return;
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/v1/transactions/${transactionId}/hold`, {
        method: "POST",
      });
      if (res.ok) {
        toast.info("Transaksi di-hold.");
        setTransactionId(null);
        setCart([]);
      } else {
        const d = await res.json();
        toast.error(d.message || "Gagal hold transaksi.");
      }
    } catch {
      toast.error("Koneksi gagal.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Hold List & Recall ────────────────────────────────────────────────────

  const openHoldList = async () => {
    try {
      const res = await apiFetch("/v1/transactions/on-hold");
      if (res.ok) {
        const data = await res.json();
        setHoldList(data.data || data);
        setIsHoldListOpen(true);
      }
    } catch {
      toast.error("Gagal memuat daftar hold.");
    }
  };

  const handleRecall = async (holdTrxId: number) => {
    try {
      setIsProcessing(true);
      const res = await apiFetch(`/v1/transactions/${holdTrxId}/recall`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setTransactionId(holdTrxId);
        buildCartFromTransaction(data.data);
        setIsHoldListOpen(false);
        toast.success("Transaksi di-recall.");
      } else {
        toast.error(data.message || "Gagal recall.");
      }
    } catch {
      toast.error("Koneksi gagal.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Void Draft ────────────────────────────────────────────────────────────

  const handleVoidDraft = async () => {
    if (cart.length === 0) return;
    if (!confirm("Batalkan seluruh transaksi ini?")) return;
    // Just discard locally — draft hasn't affected stock yet
    setCart([]);
    setTransactionId(null);
    toast.error("Transaksi dibatalkan.");
  };

  // ─── Pay ───────────────────────────────────────────────────────────────────

  const handlePay = async () => {
    if (!transactionId) return;
    setIsProcessing(true);

    try {
      let res: Response;

      if (payMode === "cash") {
        res = await apiFetch(`/v1/transactions/${transactionId}/pay/cash`, {
          method: "POST",
          body: JSON.stringify({ cash_received: cashNum }),
        });
      } else {
        res = await apiFetch(`/v1/transactions/${transactionId}/pay/card`, {
          method: "POST",
          body: JSON.stringify({
            card_type: cardType,
            last_four: cardLast4,
            reference_number: cardRef || `EDC-${Date.now()}`,
          }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setReceipt(data.data || data);
        setIsPayModalOpen(false);
        setIsReceiptOpen(true);
        // Refresh products to show updated stock
        fetchProducts();
      } else {
        toast.error(data.message || "Pembayaran gagal.");
      }
    } catch {
      toast.error("Koneksi gagal.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── New Transaction ───────────────────────────────────────────────────────

  const handleNewTransaction = () => {
    setCart([]);
    setTransactionId(null);
    setReceipt(null);
    setCashReceived("");
    setCardLast4("");
    setCardRef("");
    setIsReceiptOpen(false);
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // ─── Loading Screen ────────────────────────────────────────────────────────

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Memuat terminal kasir...</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.status === "active" &&
      (p.nama.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (p.barcode?.toLowerCase().includes(catalogSearch.toLowerCase()) ?? false) ||
        p.merek.toLowerCase().includes(catalogSearch.toLowerCase()))
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-grow flex flex-col h-screen overflow-hidden bg-slate-100 relative pb-8">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white h-12 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <IconScan size={20} className="text-indigo-400" />
          <span className="font-bold text-[13px] tracking-wide">GroceryPOS — Cashier Terminal</span>
          {transactionId && (
            <span className="bg-indigo-700 text-indigo-100 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
              TRX #{transactionId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {(hasRole("admin") || hasRole("manajer_toko") || hasRole("supervisor")) && (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/admin")}
                className="text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
              >
                <IconHome size={15} />
                <span>Dashboard Admin</span>
              </Button>
              <div className="w-[1px] h-4 bg-slate-800"></div>
            </>
          )}
          <Button
            variant="ghost"
            onClick={logout}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
          >
            <IconLogout size={15} />
            <span>Logout</span>
          </Button>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <IconWifi size={16} />
            <span>Sistem Online</span>
          </div>
          <div>Terminal: POS-01</div>
        </div>
      </div>

      <div className="grid grid-cols-[65%_35%] h-[calc(100vh-80px)] overflow-hidden">
        {/* Left: Cart */}
        <div className="bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
          {/* Scanner */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-3 items-center">
            <form onSubmit={handleBarcodeSubmit} className="flex-grow relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
              <Input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan Barcode atau ketik nama produk... (Enter)"
                className="w-full h-11 pl-10 pr-4 text-[13px] font-semibold bg-white border-2 border-indigo-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-600 rounded-xl"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                disabled={isProcessing}
              />
            </form>
            <Button
              variant="outline"
              onClick={() => setIsCatalogOpen(true)}
              className="h-11 border-dashed border-indigo-500 hover:bg-indigo-50 text-indigo-600 font-bold px-4 rounded-xl flex gap-2 cursor-pointer"
            >
              <IconCategory size={18} />
              <span>Katalog (F2)</span>
            </Button>
          </div>

          {/* Cart Table */}
          <div className="flex-grow overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <IconScan size={48} className="text-slate-200 mb-3" />
                <h4 className="text-[13px] font-bold text-slate-700">Belum Ada Item Belanja</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  Pindai barcode atau gunakan Katalog untuk menambahkan item.
                </p>
              </div>
            ) : (
              <Table className="w-full border-collapse">
                <TableHeader className="bg-slate-50 border-b border-slate-100">
                  <TableRow>
                    <TableHead className="w-12 text-center text-[10px] font-bold text-slate-500">#</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                    <TableHead className="text-center w-28 text-[10px] font-bold text-slate-500">Qty</TableHead>
                    <TableHead className="text-right w-24 text-[10px] font-bold text-slate-500">Harga</TableHead>
                    <TableHead className="text-right w-28 text-[10px] font-bold text-slate-500">Total</TableHead>
                    <TableHead className="text-center w-12 text-[10px] font-bold text-slate-500"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item, idx) => (
                    <TableRow key={item.itemId ?? item.product_id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-center text-slate-400 font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-800 text-[12px]">{item.name}</div>
                        {item.barcode && (
                          <div className="text-[10px] text-slate-400 font-medium">Barcode: {item.barcode}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleUpdateQty(item, item.qty - 1)}
                            disabled={isProcessing}
                            className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-indigo-50 text-indigo-600 font-bold disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                          <button
                            onClick={() => handleUpdateQty(item, item.qty + 1)}
                            disabled={isProcessing}
                            className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-indigo-50 text-indigo-600 font-bold disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-slate-700 font-medium tabular-nums">
                        {formatRupiah(item.price)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900 tabular-nums">
                        {formatRupiah(item.price * item.qty)}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleRemoveItem(item)}
                          disabled={isProcessing}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors disabled:opacity-40"
                        >
                          <IconTrash size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Right: Totals & Actions */}
        <div className="bg-indigo-50/30 p-6 flex flex-col justify-between h-full">
          <div>
            {/* Trx Info */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2.5 shadow-sm mb-4">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>No. Transaksi</span>
                <span className="text-slate-800 font-bold">
                  {transactionId ? `TRX-${transactionId}` : "Belum mulai"}
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Kasir Aktif</span>
                <span className="text-slate-800 font-bold">{user.name}</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Tanggal / Waktu</span>
                <span className="text-slate-800 font-bold">{trxTime}</span>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Subtotal</span>
                <span className="text-slate-800 tabular-nums font-bold">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Diskon Belanja</span>
                <span className="text-rose-500 font-bold">- Rp 0</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>PPN (11%)</span>
                <span className="text-slate-800 tabular-nums font-bold">{formatRupiah(ppn)}</span>
              </div>
              <div className="border-t border-dashed border-slate-150 pt-4 flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Total Belanja
                </span>
                <span className="text-[38px] font-extrabold text-indigo-600 leading-none tracking-tight tabular-nums">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleHold}
                disabled={cart.length === 0 || isProcessing}
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <IconPlayerPause size={16} /> Hold (F5)
              </Button>
              <Button
                variant="outline"
                onClick={openHoldList}
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPlayerPlay size={16} /> Recall (F6)
              </Button>
              <Button
                variant="outline"
                onClick={handleVoidDraft}
                disabled={cart.length === 0 || isProcessing}
                className="bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-rose-600 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <IconTrash size={16} /> Void (F10)
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Mencetak ulang struk terakhir...")}
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPrinter size={16} /> Re-print (F4)
              </Button>
            </div>

            <Button
              onClick={() => {
                setPayMode("cash");
                setCashReceived("");
                setIsPayModalOpen(true);
              }}
              disabled={cart.length === 0 || isProcessing}
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-base rounded-xl flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-indigo-600/10 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isProcessing ? (
                <IconLoader2 size={24} className="animate-spin" />
              ) : (
                <IconCash size={24} />
              )}
              <span>PROSES BAYAR (F1)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Shortcuts Bar */}
      <div className="absolute left-0 right-0 bottom-0 h-8 bg-slate-900 text-slate-400 flex items-center px-6 text-[10px] gap-6 font-semibold select-none z-10">
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F1</span> Bayar</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F2</span> Katalog</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F5</span> Hold</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F6</span> Recall</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F10</span> Void</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">Esc</span> Tutup</div>
      </div>

      {/* ─── DIALOG 1: PRODUCT CATALOG ─────────────────────────────────────────── */}
      <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconPackage size={20} className="text-indigo-500" />
              <span>Katalog Produk</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-3 space-y-3">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <Input
                placeholder="Cari produk..."
                className="pl-8 h-9 text-xs border-slate-200 rounded-xl"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-slate-400 text-xs">
                  Tidak ada produk ditemukan.
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={async () => {
                      await handleAddProduct(p);
                      setIsCatalogOpen(false);
                    }}
                    className={`border p-4 rounded-xl cursor-pointer text-center group transition-all ${
                      p.stok <= 0
                        ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                        : "bg-slate-50 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/50"
                    }`}
                  >
                    <h5 className="font-bold text-slate-800 text-[12px] group-hover:text-indigo-900 line-clamp-2">
                      {p.nama}
                    </h5>
                    <div className="text-indigo-600 font-extrabold text-xs mt-1.5">
                      {formatRupiah(p.harga)}
                    </div>
                    <div className={`text-[9px] font-bold mt-1 ${p.stok <= 5 ? "text-rose-500" : "text-slate-400"}`}>
                      Stok: {p.stok}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG 2: PAYMENT ─────────────────────────────────────────────────── */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="max-w-[500px] bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconCash size={20} className="text-indigo-500" />
              <span>Metode Pembayaran</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Grand total display */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</span>
              <h2 className="text-3xl font-extrabold text-slate-950 mt-1 leading-none tabular-nums">
                {formatRupiah(grandTotal)}
              </h2>
            </div>

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setPayMode("cash")}
                className={`h-11 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer ${
                  payMode === "cash"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                <IconCash size={16} /> TUNAI (CASH)
              </Button>
              <Button
                onClick={() => setPayMode("card")}
                className={`h-11 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer border ${
                  payMode === "card"
                    ? "bg-slate-700 text-white border-slate-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <IconCreditCard size={16} /> KARTU / EDC
              </Button>
            </div>

            {/* Cash fields */}
            {payMode === "cash" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nominal Uang Diterima
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none">Rp</span>
                    <Input
                      type="number"
                      placeholder="0"
                      className="h-14 pl-12 pr-4 text-2xl font-extrabold text-slate-950 bg-white border-2 border-indigo-500 focus-visible:ring-indigo-600 rounded-xl"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 20000, 50000, 100000, 200000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCashReceived(val.toString())}
                      className="bg-slate-50 hover:bg-indigo-50 hover:border-indigo-400 border border-slate-200 text-slate-800 py-2.5 text-xs font-bold rounded-xl transition-all tabular-nums"
                    >
                      {val.toLocaleString("id-ID")}
                    </button>
                  ))}
                  <button
                    onClick={() => setCashReceived(grandTotal.toString())}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold rounded-xl transition-all"
                  >
                    Uang Pas
                  </button>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kembalian</span>
                  <h2 className={`text-3xl font-extrabold mt-1 tracking-tight tabular-nums ${changeValue < 0 ? "text-rose-500" : "text-emerald-500"}`}>
                    {changeValue === 0 ? "Rp 0" : changeValue < 0 ? `Kurang ${formatRupiah(Math.abs(changeValue))}` : formatRupiah(changeValue)}
                  </h2>
                </div>
              </>
            )}

            {/* Card fields */}
            {payMode === "card" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jenis Kartu</label>
                  <select
                    className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold px-3 focus:outline-none focus:border-indigo-600"
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value)}
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Kredit</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">4 Digit Terakhir Kartu</label>
                  <Input
                    type="text"
                    maxLength={4}
                    placeholder="XXXX"
                    className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl tracking-[0.5rem] text-center font-mono text-lg"
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Referensi EDC (Opsional)</label>
                  <Input
                    type="text"
                    placeholder="Nomor referensi EDC..."
                    className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handlePay}
              disabled={isProcessing || (payMode === "cash" ? !isCashValid : !isCardValid)}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 disabled:cursor-not-allowed font-bold text-sm text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10"
            >
              {isProcessing ? (
                <IconLoader2 size={18} className="animate-spin" />
              ) : (
                <IconPrinter size={18} />
              )}
              <span>SELESAI &amp; CETAK STRUK</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG 3: HOLD LIST ───────────────────────────────────────────────── */}
      <Dialog open={isHoldListOpen} onOpenChange={setIsHoldListOpen}>
        <DialogContent className="max-w-[480px] bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconPlayerPlay size={20} className="text-indigo-500" />
              <span>Daftar Transaksi Hold</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-2 max-h-[350px] overflow-y-auto">
            {holdList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">Tidak ada transaksi yang di-hold.</div>
            ) : (
              holdList.map((h) => (
                <div key={h.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <div>
                    <div className="font-bold text-slate-800 text-xs">TRX #{h.id}</div>
                    <div className="text-[10px] text-slate-400">{h.items_count} item · {formatRupiah(h.subtotal)}</div>
                  </div>
                  <Button
                    onClick={() => handleRecall(h.id)}
                    disabled={isProcessing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-8 rounded-lg px-3 cursor-pointer"
                  >
                    Recall
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG 4: RECEIPT ────────────────────────────────────────────────── */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-[380px] bg-white rounded-2xl border-slate-100 p-6 flex flex-col items-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 animate-bounce">
            <IconCircleCheck size={28} />
          </div>
          <DialogTitle className="text-base font-bold text-slate-900">Pembayaran Sukses!</DialogTitle>
          <p className="text-[11px] text-slate-400 mt-0.5 text-center">Transaksi tercatat dan stok telah diperbarui.</p>

          {/* Thermal Receipt */}
          <div className="w-full max-w-[320px] bg-white border border-slate-200 p-5 mt-4 rounded shadow-inner font-mono text-[11px] text-slate-800 relative">
            <div className="text-center space-y-0.5 mb-4">
              <h4 className="font-extrabold text-[12px]">GROCERYMART</h4>
              <p className="text-[10px]">Jl. Raya Contoh No. 1, Jakarta</p>
            </div>
            <div className="border-t border-dashed border-slate-300 my-2"></div>
            <div className="space-y-0.5 text-[9px] text-slate-500">
              <div className="flex justify-between"><span>Kasir: {user.name}</span><span>POS-01</span></div>
              <div className="flex justify-between">
                <span>TRX #{receipt?.id}</span>
                <span>{new Date().toLocaleDateString("id-ID")}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-slate-300 my-2"></div>
            <div className="space-y-1.5">
              {(receipt?.items || []).map((item: any) => (
                <div key={item.id} className="flex justify-between text-[10px]">
                  <span>{item.kuantitas}x {String(item.nama_produk).substring(0, 16)}</span>
                  <span>{formatRupiah(item.harga_satuan * item.kuantitas)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-300 my-2"></div>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatRupiah(receipt?.subtotal ?? 0)}</span></div>
              <div className="flex justify-between"><span>PPN (11%):</span><span>{formatRupiah(receipt?.pajak ?? 0)}</span></div>
              <div className="flex justify-between font-extrabold text-[12px] text-slate-900">
                <span>TOTAL:</span><span>{formatRupiah(receipt?.total ?? 0)}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-slate-300 my-2"></div>
            <div className="space-y-1 text-[10px]">
              {receipt?.metode_pembayaran === "cash" ? (
                <>
                  <div className="flex justify-between"><span>Tunai:</span><span>{formatRupiah(receipt?.nominal_bayar ?? 0)}</span></div>
                  <div className="flex justify-between"><span>Kembali:</span><span>{formatRupiah(receipt?.kembalian ?? 0)}</span></div>
                </>
              ) : (
                <div className="flex justify-between capitalize">
                  <span>Kartu {receipt?.jenis_kartu}:</span>
                  <span>**** {receipt?.nomor_kartu_akhir}</span>
                </div>
              )}
            </div>
            <div className="border-t border-dashed border-slate-300 my-2"></div>
            <div className="text-center text-[9px] text-slate-400 mt-3">
              <p>Terima Kasih Atas Kunjungan Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <Button
              onClick={handleNewTransaction}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 rounded-xl flex gap-1.5 cursor-pointer"
            >
              Transaksi Baru
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="border-slate-200 text-slate-700 font-bold text-xs h-10 rounded-xl flex gap-1.5 cursor-pointer"
            >
              <IconPrinter size={16} /> Print Ulang
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
