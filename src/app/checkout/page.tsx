"use client";

import { useState, useEffect, useRef } from "react";
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
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Database Produk Mock
interface Product {
  sku: string;
  name: string;
  price: number;
}

const PRODUCTS_DATABASE: Record<string, Product> = {
  "IDM-001": { sku: "IDM-001", name: "Indomie Goreng Rasa Ayam", price: 3500 },
  "AQA-001": { sku: "AQA-001", name: "Air Mineral Aqua 600ml", price: 4000 },
  "BRS-001": { sku: "BRS-001", name: "Beras Pandan Wangi 5kg", price: 65000 },
  "GUL-001": { sku: "GUL-001", name: "Gula Pasir Gulaku 1kg", price: 17500 },
  "MIN-001": { sku: "MIN-001", name: "Minyak Goreng Bimoli 2L", price: 34000 },
  "TEH-001": { sku: "TEH-001", name: "Teh Celup Sariwangi isi 25", price: 6500 },
  "ROT-001": { sku: "ROT-001", name: "Roti Tawar Sari Roti", price: 15000 },
  "SUS-001": { sku: "SUS-001", name: "Susu UHT Ultra Milk 1L", price: 19000 },
};

interface CartItem extends Product {
  qty: number;
  isNew?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, isLoading, logout, hasPermission, hasRole } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  
  // Payment States
  const [cashReceived, setCashReceived] = useState("");
  const [completedCash, setCompletedCash] = useState(0);
  const [completedChange, setCompletedChange] = useState(0);
  
  const [trxId, setTrxId] = useState("TRX-20260604-0001");
  const [trxTime, setTrxTime] = useState("");
  const [transactionCounter, setTransactionCounter] = useState(42);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Authentication route protection
  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    } else if (!isLoading && user && !hasPermission("create_sales")) {
      toast.error("Anda tidak memiliki izin untuk mengakses Layar Kasir.");
      router.push("/admin");
    }
  }, [isLoading, token, user, router, hasPermission]);

  // Loading screen
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

  // Time & Auto Focus on Mount
  useEffect(() => {
    updateTime();
    const timer = setInterval(updateTime, 60000);
    
    // Auto focus to barcode field
    barcodeInputRef.current?.focus();
    
    // Global Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        if (cart.length > 0) setIsPayModalOpen(true);
      } else if (e.key === "F2") {
        e.preventDefault();
        setIsCatalogOpen((prev) => !prev);
      } else if (e.key === "F5") {
        e.preventDefault();
        toast.info("Transaksi Berhasil di-Hold (F5)");
      } else if (e.key === "F6") {
        e.preventDefault();
        toast.info("Daftar Hold Transaksi Dibuka (F6)");
      } else if (e.key === "F10") {
        e.preventDefault();
        handleVoidAll();
      } else if (e.key === "Escape") {
        setIsPayModalOpen(false);
        setIsCatalogOpen(false);
        setIsReceiptOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cart]);

  const updateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    setTrxTime(`${dateStr} ${timeStr}`);
  };

  // Helper formats Currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount).replace(/,00$/, "");
  };

  // Computations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const ppn = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + ppn;

  // Add Product to Cart
  const handleAddProduct = (sku: string) => {
    const product = PRODUCTS_DATABASE[sku];
    if (!product) return;

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.sku === sku);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
        return updated;
      }
      return [...prev, { ...product, qty: 1, isNew: true }];
    });

    toast.success(`${product.name} dimasukkan ke keranjang.`);
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 50);
  };

  // Scan Code Trigger
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim().toUpperCase();
    setBarcodeInput("");
    if (!query) return;

    if (PRODUCTS_DATABASE[query]) {
      handleAddProduct(query);
    } else {
      // Find matching item name
      const foundSku = Object.keys(PRODUCTS_DATABASE).find((key) =>
        PRODUCTS_DATABASE[key].name.toUpperCase().includes(query)
      );
      if (foundSku) {
        handleAddProduct(foundSku);
      } else {
        toast.error(`Produk atau Barcode "${query}" tidak ditemukan!`);
      }
    }
  };

  // Adjust Quantities
  const handleAdjustQty = (sku: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.sku === sku) {
            return { ...item, qty: item.qty + amount };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  // Remove single row
  const handleRemoveItem = (sku: string, name: string) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
    toast.error(`${name} dihapus dari keranjang.`);
  };

  // Cancel/Void all items
  const handleVoidAll = () => {
    if (cart.length === 0) return;
    if (confirm("Apakah Anda yakin ingin membatalkan (VOID) seluruh transaksi ini?")) {
      setCart([]);
      toast.error("Seluruh transaksi belanja dibatalkan (VOID)!");
    }
  };

  // Payment Change Calculation
  const cashNum = parseFloat(cashReceived) || 0;
  const changeValue = cashNum - grandTotal;
  const isPaymentValid = cashNum >= grandTotal && grandTotal > 0;

  // Complete Order
  const handleCompleteTransaction = () => {
    if (!isPaymentValid) return;
    setCompletedCash(cashNum);
    setCompletedChange(changeValue);
    
    setIsPayModalOpen(false);
    setIsReceiptOpen(true);
  };

  const handleNewTransaction = () => {
    setCart([]);
    setIsReceiptOpen(false);
    setTransactionCounter((prev) => prev + 1);
    setTrxId(`TRX-20260604-000${transactionCounter}`);
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="flex-grow flex flex-col h-screen overflow-hidden bg-slate-100 relative pb-8">
      {/* Kasir Top Bar / Embedded header info */}
      <div className="bg-slate-900 text-white h-12 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <IconScan size={20} className="text-indigo-400" />
          <span className="font-bold text-[13px] tracking-wide">GroceryPOS — Cashier Terminal</span>
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
        {/* Left Side: Product Input & Cart */}
        <div className="bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
          {/* Scanner Field */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-3 items-center">
            <form onSubmit={handleBarcodeSubmit} className="flex-grow relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
              <Input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan Barcode atau ketik nama produk... (Ketik Enter)"
                className="w-full h-11 pl-10 pr-4 text-[13px] font-semibold bg-white border-2 border-indigo-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-600 rounded-xl"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
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

          {/* Cart Table Container */}
          <div className="flex-grow overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-fade-in">
                <IconScan size={48} className="text-slate-200 mb-3" />
                <h4 className="text-[13px] font-bold text-slate-700">Belum Ada Item Belanja</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  Silakan pindai barcode produk atau gunakan tombol Katalog di kanan atas untuk menambahkan item.
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
                    <TableRow
                      key={item.sku}
                      className={`hover:bg-slate-50/50 transition-colors ${item.isNew ? "bg-indigo-50/30 animate-pulse" : ""}`}
                    >
                      <TableCell className="text-center text-slate-400 font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-800 text-[12px]">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">SKU: {item.sku}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAdjustQty(item.sku, -1)}
                            className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-indigo-50 text-indigo-600 font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                          <button
                            onClick={() => handleAdjustQty(item.sku, 1)}
                            className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-indigo-50 text-indigo-600 font-bold"
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
                          onClick={() => handleRemoveItem(item.sku, item.name)}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors"
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

        {/* Right Side: Order Totals & Action Pad */}
        <div className="bg-indigo-50/30 p-6 flex flex-col justify-between h-full">
          <div>
            {/* Trx Details */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2.5 shadow-sm mb-4">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>No. Transaksi</span>
                <span className="text-slate-800 font-bold">{trxId}</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Kasir Aktif</span>
                <span className="text-slate-800 font-bold">{user.name} (ID: {user.id})</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Tanggal / Waktu</span>
                <span className="text-slate-800 font-bold">{trxTime}</span>
              </div>
            </div>

            {/* Price Calculations */}
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

          {/* Action Pad Buttons */}
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => toast.info("Fitur Hold Transaksi (F5) Berhasil")}
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPlayerPause size={16} /> Hold (F5)
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Hold List Terbuka (F6)")}
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPlayerPlay size={16} /> Recall (F6)
              </Button>
              <Button
                variant="outline"
                onClick={handleVoidAll}
                className="bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-rose-600 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
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
              onClick={() => setIsPayModalOpen(true)}
              disabled={cart.length === 0}
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-base rounded-xl flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-indigo-600/10 transition-all active:scale-[0.99]"
            >
              <IconCash size={24} />
              <span>PROSES BAYAR (F1)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Embedded Shortcuts Bar */}
      <div className="absolute left-0 right-0 bottom-0 h-8 bg-slate-900 text-slate-400 flex items-center px-6 text-[10px] gap-6 font-semibold select-none z-10">
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F1</span> Bayar</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F2</span> Katalog</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F5</span> Hold</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F6</span> Recall</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F10</span> Void</div>
        <div className="flex gap-1"><span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">Esc</span> Tutup Dialog</div>
      </div>

      {/* ==============================================================================
           DIALOG 1: CATALOG PRODUCTS SELECTOR
           ============================================================================== */}
      <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconPackage size={20} className="text-indigo-500" />
              <span>Katalog Produk Cepat</span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 pt-4 max-h-[350px] overflow-y-auto pr-1">
            {Object.keys(PRODUCTS_DATABASE).map((key) => {
              const prod = PRODUCTS_DATABASE[key];
              return (
                <div
                  key={prod.sku}
                  onClick={() => {
                    handleAddProduct(prod.sku);
                    setIsCatalogOpen(false);
                  }}
                  className="bg-slate-50 border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/50 p-4 rounded-xl cursor-pointer text-center group transition-all"
                >
                  <h5 className="font-bold text-slate-800 text-[12px] group-hover:text-indigo-900">
                    {prod.name}
                  </h5>
                  <div className="text-indigo-600 font-extrabold text-xs mt-1.5">
                    {formatRupiah(prod.price)}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium mt-1">
                    SKU: {prod.sku}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           DIALOG 2: CHECKOUT / PAYMENT FORM
           ============================================================================== */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="max-w-[480px] bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconCash size={20} className="text-indigo-500" />
              <span>Metode Pembayaran</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Tagihan Belanja
              </span>
              <h2 className="text-3xl font-extrabold text-slate-950 mt-1 leading-none tabular-nums">
                {formatRupiah(grandTotal)}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button className="h-11 font-bold text-xs bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100/50 rounded-xl flex gap-1.5 cursor-pointer">
                <IconCash size={16} /> TUNAI (CASH)
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.warning("Metode Non-Tunai / QRIS dipasang di tahap berikutnya!")}
                className="h-11 font-bold text-xs border-slate-200 text-slate-500 rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconCreditCard size={16} /> KARTU / QRIS
              </Button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nominal Uang Diterima (Cash In)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none">
                  Rp
                </span>
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

            {/* Quick cash suggestions */}
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/10"
              >
                Uang Pas
              </button>
            </div>

            {/* Change calc */}
            <div className="border-t border-dashed border-slate-200 pt-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Kembalian Uang
              </span>
              <h2
                className={`text-3xl font-extrabold mt-1 tracking-tight tabular-nums ${
                  changeValue < 0 ? "text-rose-500" : "text-emerald-500"
                }`}
              >
                {changeValue === 0
                  ? "Rp 0"
                  : changeValue < 0
                  ? `Kurang ${formatRupiah(Math.abs(changeValue))}`
                  : formatRupiah(changeValue)}
              </h2>
            </div>

            <Button
              onClick={handleCompleteTransaction}
              disabled={!isPaymentValid}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 disabled:cursor-not-allowed font-bold text-sm text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10"
            >
              <IconPrinter size={18} />
              <span>SELESAI & CETAK STRUK</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           DIALOG 3: SUCCESS & THERMAL RECEIPT DISPLAY
           ============================================================================== */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-[380px] bg-white rounded-2xl border-slate-100 p-6 flex flex-col items-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-3 animate-bounce">
            <IconCircleCheck size={28} />
          </div>
          <DialogTitle className="text-base font-bold text-slate-900">Pembayaran Sukses!</DialogTitle>
          <p className="text-[11px] text-slate-400 mt-0.5 text-center">Struk penjualan telah berhasil dicetak.</p>

          {/* Paper Thermal Receipt Mockup */}
          <div className="w-full max-w-[320px] bg-white border border-slate-200 p-5 mt-4 rounded shadow-inner font-mono text-[11px] text-slate-800 relative bg-[radial-gradient(#f1f1f1_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="text-center space-y-0.5 mb-4">
              <h4 className="font-extrabold text-[12px]">GROCERYMART</h4>
              <p className="text-[10px]">Jl. Raya Contoh No. 1, Jakarta</p>
              <p className="text-[9px] text-slate-500">Telp: 021-123456</p>
            </div>
            
            <div className="border-t border-dashed border-slate-300 my-2"></div>
            
            <div className="space-y-0.5 text-[9px] text-slate-500">
              <div className="flex justify-between"><span>Kasir: {user.name}</span><span>Trm: POS-01</span></div>
              <div className="flex justify-between"><span>No: {trxId}</span><span>04/06/2026</span></div>
            </div>

            <div className="border-t border-dashed border-slate-300 my-2"></div>
            
            {/* items */}
            <div className="space-y-1.5">
              {cart.map((item) => (
                <div key={item.sku} className="flex justify-between text-[10px]">
                  <span>{item.qty} x {item.name.substring(0, 16)}</span>
                  <span>{formatRupiah(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-300 my-2"></div>

            <div className="space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatRupiah(subtotal)}</span></div>
              <div className="flex justify-between"><span>PPN (11%):</span><span>{formatRupiah(ppn)}</span></div>
              <div className="flex justify-between font-extrabold text-[12px] text-slate-900">
                <span>TOTAL:</span><span>{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 my-2"></div>

            <div className="space-y-1">
              <div className="flex justify-between"><span>Tunai:</span><span>{formatRupiah(completedCash)}</span></div>
              <div className="flex justify-between"><span>Kembali:</span><span>{formatRupiah(completedChange)}</span></div>
            </div>

            <div className="border-t border-dashed border-slate-300 my-2"></div>

            <div className="text-center text-[9px] text-slate-400 space-y-0.5 mt-3">
              <p>Terima Kasih Atas Kunjungan Anda</p>
              <p>Barang yang sudah dibeli tidak dapat</p>
              <p>ditukar atau dikembalikan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <Button
              onClick={handleNewTransaction}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 rounded-xl flex gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/10"
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
