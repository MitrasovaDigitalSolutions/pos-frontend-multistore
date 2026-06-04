"use client";

import { useState } from "react";
import {
  IconHome,
  IconShoppingCart,
  IconPackage,
  IconCategory,
  IconBox,
  IconTruckDelivery,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconCalendar,
  IconCash,
  IconReceipt,
  IconChartPie,
  IconAlertTriangle,
  IconArrowUpRight,
  IconArrowDownRight,
  IconShoppingBag,
  IconX,
  IconUserCheck,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconPrinter,
  IconDeviceLaptop,
} from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock database for admin tabs
interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Aktif" | "Nonaktif";
}

const INITIAL_PRODUCTS: Product[] = [
  { sku: "IDM-001", name: "Indomie Goreng Rasa Ayam", category: "Mie Instan", price: 3500, stock: 148, status: "Aktif" },
  { sku: "AQA-001", name: "Air Mineral Aqua 600ml", category: "Minuman Ringan", price: 4000, stock: 92, status: "Aktif" },
  { sku: "BRS-001", name: "Beras Pandan Wangi 5kg", category: "Bahan Pokok", price: 65000, stock: 23, status: "Aktif" },
  { sku: "GUL-001", name: "Gula Pasir Gulaku 1kg", category: "Bahan Pokok", price: 17500, stock: 85, status: "Aktif" },
  { sku: "MIN-001", name: "Minyak Goreng Bimoli 2L", category: "Bahan Pokok", price: 34000, stock: 5, status: "Aktif" },
  { sku: "TEH-001", name: "Teh Celup Sariwangi isi 25", category: "Minuman Ringan", price: 6500, stock: 120, status: "Aktif" },
];

const TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard Analitik Toko",
  products: "Manajemen Produk",
  categories: "Kategori Produk",
  inventory: "Stok Barang & Inventori",
  receiving: "Penerimaan Barang Masuk Log",
  reports: "Laporan Penjualan & Analitik",
  settings: "Pengaturan Profil Toko",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // Search state for product list
  const [searchProduct, setSearchProduct] = useState("");
  
  // Add Product Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Bahan Pokok");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");

  // Settings form states
  const [storeName, setStoreName] = useState("GroceryMart");
  const [storeAddress, setStoreAddress] = useState("Jl. Raya Contoh No. 1, Jakarta");
  const [storePhone, setStorePhone] = useState("021-123456");
  const [taxRate, setTaxRate] = useState("11");

  const handleLogout = () => {
    toast.error("Logout sukses!");
    router.push("/login");
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName || !newPrice || !newStock) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    const pPrice = parseFloat(newPrice);
    const pStock = parseFloat(newStock);

    if (products.some((p) => p.sku.toUpperCase() === newSku.toUpperCase())) {
      toast.error(`SKU ${newSku} sudah terdaftar!`);
      return;
    }

    const newProd: Product = {
      sku: newSku.toUpperCase(),
      name: newName,
      category: newCategory,
      price: pPrice,
      stock: pStock,
      status: "Aktif",
    };

    setProducts((prev) => [...prev, newProd]);
    toast.success("Produk berhasil ditambahkan!");
    
    // reset form
    setNewSku("");
    setNewName("");
    setNewPrice("");
    setNewStock("");
    setIsAddProductOpen(false);
  };

  const handleRemoveProduct = (sku: string) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan/menghapus produk SKU ${sku}?`)) {
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
      toast.error(`Produk ${sku} telah dinonaktifkan.`);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount).replace(/,00$/, "");
  };

  // Filtered products list for product tab
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const getLinkClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
        : "text-slate-400 hover:text-white hover:bg-slate-900"
    }`;
  };

  return (
    <div className="flex-grow flex h-screen overflow-hidden bg-slate-100 pb-8">
      {/* Sidebar - Deep Navy */}
      <aside className="w-[210px] bg-slate-950 text-slate-400 flex flex-col justify-between p-4 py-6 border-r border-slate-900 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-3">
            <IconShoppingCart size={22} className="text-indigo-400" />
            <span className="font-extrabold text-[14px] text-white tracking-wide">GroceryPOS</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest px-3 block">
                Menu Utama
              </span>
              <ul className="space-y-0.5">
                <li>
                  <button onClick={() => setActiveTab("dashboard")} className={getLinkClass("dashboard")}>
                    <IconHome size={18} />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/checkout")} className={getLinkClass("pos")}>
                    <IconDeviceLaptop size={18} />
                    <span>Layar Kasir (POS)</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab("products")} className={getLinkClass("products")}>
                    <IconPackage size={18} />
                    <span>Manajemen Produk</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab("categories")} className={getLinkClass("categories")}>
                    <IconCategory size={18} />
                    <span>Kategori Produk</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest px-3 block">
                Inventori & Laporan
              </span>
              <ul className="space-y-0.5">
                <li>
                  <button onClick={() => setActiveTab("inventory")} className={getLinkClass("inventory")}>
                    <IconBox size={18} />
                    <span>Stok Barang</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab("receiving")} className={getLinkClass("receiving")}>
                    <IconTruckDelivery size={18} />
                    <span>Penerimaan</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab("reports")} className={getLinkClass("reports")}>
                    <IconChartBar size={18} />
                    <span>Laporan Penjualan</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest px-3 block">
            Sistem
          </span>
          <ul className="space-y-0.5">
            <li>
              <button onClick={() => setActiveTab("settings")} className={getLinkClass("settings")}>
                <IconSettings size={18} />
                <span>Pengaturan Toko</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all text-left cursor-pointer"
              >
                <IconLogout size={18} />
                <span>Keluar</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 px-8 overflow-y-auto h-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-slate-900">
            {TAB_TITLES[activeTab] || activeTab}
          </h2>
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-2 font-bold text-xs select-none">
            <IconCalendar size={15} />
            <span>Hari Ini: 04 Juni 2026</span>
          </div>
        </header>

        {/* ==============================================================================
             TAB 1: DASHBOARD
             ============================================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <section className="grid grid-cols-4 gap-4">
              <Card className="bg-indigo-600 border-none text-white rounded-2xl shadow-md p-5 flex flex-col gap-1.5 justify-between">
                <div className="flex justify-between items-center text-indigo-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Penjualan Hari Ini</span>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg text-white">
                    <IconCash size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-none select-all tabular-nums">Rp 12.854.000</h3>
                <div className="text-[10px] font-semibold text-emerald-200 flex items-center gap-0.5">
                  <IconArrowUpRight size={14} /> +15.4% dari kemarin
                </div>
              </Card>

              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Transaksi</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                    <IconReceipt size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">138 Trx</h3>
                <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <IconArrowUpRight size={14} /> +8.2% dari kemarin
                </div>
              </Card>

              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Rata-rata Struk (AOV)</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                    <IconChartPie size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">Rp 93.144</h3>
                <div className="text-[10px] font-semibold text-rose-500 flex items-center gap-0.5">
                  <IconArrowDownRight size={14} /> -2.1% dari kemarin
                </div>
              </Card>

              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Produk Kritis (Stok Tipis)</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                    <IconAlertTriangle size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">5 Item</h3>
                <div className="text-[10px] font-semibold text-amber-600">Butuh re-order segera</div>
              </Card>
            </section>

            {/* Split Grid */}
            <section className="grid grid-cols-[1.4fr_1fr] gap-6">
              {/* Sales Chart Card */}
              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4 p-0">
                  <CardTitle className="text-xs font-bold text-slate-900">Grafik Penjualan 7 Hari Terakhir</CardTitle>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Dalam Juta Rp</span>
                </CardHeader>
                <CardContent className="p-0 pt-6">
                  <div className="h-[180px] flex items-end justify-between px-2 gap-4">
                    {[
                      { day: "Jum", height: "60%", val: "Rp 8.2Jt" },
                      { day: "Sab", height: "80%", val: "Rp 10.5Jt" },
                      { day: "Min", height: "95%", val: "Rp 12.1Jt" },
                      { day: "Sen", height: "50%", val: "Rp 7.1Jt" },
                      { day: "Sel", height: "65%", val: "Rp 9.0Jt" },
                      { day: "Rab", height: "70%", val: "Rp 9.8Jt" },
                      { day: "Kam", height: "88%", val: "Rp 12.8Jt" },
                    ].map((bar) => (
                      <div key={bar.day} className="flex flex-col items-center flex-grow group gap-2">
                        <div className="w-full relative flex flex-col justify-end h-[150px]">
                          <div
                            style={{ height: bar.height }}
                            className="w-full bg-indigo-100 group-hover:bg-indigo-500 rounded-t-lg transition-all cursor-pointer relative"
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 select-none">
                              {bar.val}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold select-none">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4 p-0 mb-4">
                  <CardTitle className="text-xs font-bold text-slate-900">Aktivitas Kasir Terbaru</CardTitle>
                  <button onClick={() => setActiveTab("reports")} className="text-indigo-600 font-bold text-[11px] hover:underline bg-transparent border-none cursor-pointer">Semua →</button>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><IconShoppingBag size={18} /></div>
                    <div className="flex-grow">
                      <div className="font-bold text-[11px] text-slate-800">Kasir Ani M. menyelesaikan transaksi</div>
                      <div className="text-[9px] text-slate-400 font-medium">TRX-00042 • Baru saja</div>
                    </div>
                    <span className="font-bold text-xs text-slate-900 tabular-nums">Rp 138.750</span>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><IconX size={18} /></div>
                    <div className="flex-grow">
                      <div className="font-bold text-[11px] text-slate-800">Supervisor approve VOID Item</div>
                      <div className="text-[9px] text-slate-400 font-medium">Budi S. • 5 menit lalu</div>
                    </div>
                    <span className="font-bold text-xs text-rose-500 tabular-nums">- Rp 12.000</span>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><IconUserCheck size={18} /></div>
                    <div className="flex-grow">
                      <div className="font-bold text-[11px] text-slate-800">Kasir Ani M. masuk ke sistem</div>
                      <div className="text-[9px] text-slate-400 font-medium">POS Terminal 02 • 12 menit lalu</div>
                    </div>
                    <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wide">Login</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Top Selling Products Summary Table */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
              <div className="border-b border-slate-50 pb-4 mb-4 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900">Produk Paling Laku Hari Ini</h3>
                <button onClick={() => setActiveTab("products")} className="text-indigo-600 font-bold text-[11px] hover:underline bg-transparent border-none cursor-pointer">Lihat Semua Produk →</button>
              </div>
              <Table className="w-full">
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">SKU</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">Kategori</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500">Qty Terjual</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500">Total Penjualan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-800 text-xs">Indomie Goreng Rasa Ayam</TableCell>
                    <TableCell className="text-slate-500 text-xs">IDM-001</TableCell>
                    <TableCell className="text-slate-500 text-xs">Mie Instan</TableCell>
                    <TableCell className="text-right font-bold text-slate-800 text-xs">148 pcs</TableCell>
                    <TableCell className="text-right font-bold text-indigo-600 text-xs">Rp 518.000</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-800 text-xs">Air Mineral Aqua 600ml</TableCell>
                    <TableCell className="text-slate-500 text-xs">AQA-001</TableCell>
                    <TableCell className="text-slate-500 text-xs">Minuman Ringan</TableCell>
                    <TableCell className="text-right font-bold text-slate-800 text-xs">92 pcs</TableCell>
                    <TableCell className="text-right font-bold text-indigo-600 text-xs">Rp 368.000</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-800 text-xs">Beras Pandan Wangi 5kg</TableCell>
                    <TableCell className="text-slate-500 text-xs">BRS-001</TableCell>
                    <TableCell className="text-slate-500 text-xs">Bahan Pokok</TableCell>
                    <TableCell className="text-right font-bold text-slate-800 text-xs">23 kantong</TableCell>
                    <TableCell className="text-right font-bold text-indigo-600 text-xs">Rp 1.495.000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>
          </div>
        )}

        {/* ==============================================================================
             TAB 2: PRODUCT MANAGEMENT
             ============================================================================== */}
        {activeTab === "products" && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daftar Produk Toko</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Manajemen inventori produk aktif dan SKU.</p>
              </div>
              <Button
                onClick={() => setIsAddProductOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPlus size={16} /> Tambah Produk
              </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-grow max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  type="text"
                  placeholder="Cari produk berdasarkan SKU, nama, atau kategori..."
                  className="pl-9 h-9 text-[11px] border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
              </div>
            </div>

            <Table className="w-full">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-slate-500">SKU</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Kategori</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-slate-500">Harga Jual</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-slate-500">Stok</TableHead>
                  <TableHead className="text-center text-[10px] font-bold text-slate-500">Status</TableHead>
                  <TableHead className="text-center w-24 text-[10px] font-bold text-slate-500">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      Tidak ada produk ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <TableRow key={p.sku} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-slate-900 text-xs">{p.sku}</TableCell>
                      <TableCell className="font-semibold text-slate-800 text-xs">{p.name}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{p.category}</TableCell>
                      <TableCell className="text-right font-bold text-slate-800 text-xs">{formatRupiah(p.price)}</TableCell>
                      <TableCell className={`text-right font-bold text-xs ${p.stock <= 10 ? "text-amber-500" : "text-slate-800"}`}>
                        {p.stock} {p.category === "Bahan Pokok" ? "kantong/pack" : "pcs"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="badge success">Aktif</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => toast.info(`Fitur Edit ${p.sku} akan dikoneksikan ke Laravel API!`)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveProduct(p.sku)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>
        )}

        {/* ==============================================================================
             TAB 3: CATEGORY MANAGEMENT
             ============================================================================== */}
        {activeTab === "categories" && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Kategori Produk</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Kategori klasifikasi barang dagang.</p>
              </div>
              <Button
                onClick={() => toast.success("Fitur tambah kategori baru dibuka.")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPlus size={16} /> Tambah Kategori
              </Button>
            </div>

            <Table className="w-full">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-slate-500">Nama Kategori</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Total Produk</TableHead>
                  <TableHead className="text-center w-24 text-[10px] font-bold text-slate-500">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Bahan Pokok", count: 4 },
                  { name: "Mie Instan", count: 1 },
                  { name: "Minuman Ringan", count: 2 },
                  { name: "Bumbu Dapur", count: 0 },
                  { name: "Makanan Ringan", count: 0 },
                ].map((cat) => (
                  <TableRow key={cat.name} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-800 text-xs">{cat.name}</TableCell>
                    <TableCell className="font-semibold text-slate-500 text-xs">{cat.count} Produk</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => toast.info(`Mengubah kategori ${cat.name}`)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={() => toast.error(`Kategori ${cat.name} dinonaktifkan.`)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        {/* ==============================================================================
             TAB 4: INVENTORY / STOCK LEVEL
             ============================================================================== */}
        {activeTab === "inventory" && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Status Stok & Inventori</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Daftar stok yang menipis dan butuh pemesanan ulang.</p>
              </div>
              <Button
                onClick={() => toast.success("Purchase order (PO) otomatis dihasilkan.")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPrinter size={16} /> Print Laporan Stok Rendah
              </Button>
            </div>

            <Table className="w-full">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-slate-500">SKU</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-slate-500">Sisa Stok</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Batas Minimal</TableHead>
                  <TableHead className="text-center text-[10px] font-bold text-slate-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products
                  .filter((p) => p.stock <= 25)
                  .map((p) => (
                    <TableRow key={p.sku} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-slate-800 text-xs">{p.sku}</TableCell>
                      <TableCell className="font-semibold text-slate-800 text-xs">{p.name}</TableCell>
                      <TableCell className="text-right font-bold text-rose-500 text-xs">{p.stock}</TableCell>
                      <TableCell className="text-slate-500 text-xs">25</TableCell>
                      <TableCell className="text-center">
                        <span className="badge danger">Stok Kritis</span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </section>
        )}

        {/* ==============================================================================
             TAB 5: STOCK RECEIVING LOG
             ============================================================================== */}
        {activeTab === "receiving" && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Penerimaan Barang Masuk</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Daftar riwayat pasokan barang masuk dari distributor.</p>
              </div>
              <Button
                onClick={() => toast.success("Form penerimaan barang baru terbuka.")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPlus size={16} /> Terima Barang Masuk
              </Button>
            </div>

            <Table className="w-full">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-slate-500">Tanggal</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">No. Surat Jalan</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Supplier</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Jumlah Produk</TableHead>
                  <TableHead className="text-center text-[10px] font-bold text-slate-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { date: "03 Jun 2026 10:20", id: "SJ-20260603-01", supplier: "PT Indofood Sukses Makmur", count: "10 Karton Indomie", status: "Selesai" },
                  { date: "01 Jun 2026 14:15", id: "SJ-20260601-04", supplier: "PT Aqua Golden Mississippi", count: "25 Galon/Dus Aqua", status: "Selesai" },
                  { date: "28 Mei 2026 09:00", id: "SJ-20260528-09", supplier: "Bulog Divre Jakarta", count: "50 Karung Beras 5kg", status: "Selesai" },
                ].map((rec) => (
                  <TableRow key={rec.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-slate-600 text-xs">{rec.date}</TableCell>
                    <TableCell className="font-bold text-slate-900 text-xs">{rec.id}</TableCell>
                    <TableCell className="font-semibold text-slate-800 text-xs">{rec.supplier}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{rec.count}</TableCell>
                    <TableCell className="text-center">
                      <span className="badge success">{rec.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        {/* ==============================================================================
             TAB 6: REPORTS & DETAILED ANALYTICS
             ============================================================================== */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="grid grid-cols-[1.5fr_1fr] gap-6">
              {/* Sales Stats Detailed */}
              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
                <CardHeader className="p-0 pb-4 border-b border-slate-50 mb-6">
                  <CardTitle className="text-xs font-bold text-slate-900">Performa Keuangan Bulan Ini</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold text-xs">Total Omset Pendapatan</span>
                    <span className="font-bold text-xs text-slate-900">Rp 384.502.000</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold text-xs">Jumlah PPN Terkumpul</span>
                    <span className="font-bold text-xs text-slate-900">Rp 42.295.220</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold text-xs">Total Void Transaksi</span>
                    <span className="font-bold text-xs text-rose-500">- Rp 1.250.000</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500 font-bold text-xs">Pendapatan Bersih (Net)</span>
                    <span className="font-extrabold text-xs text-indigo-600">Rp 341.256.780</span>
                  </div>
                </div>
              </Card>

              {/* Top Payment Methods */}
              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
                <CardHeader className="p-0 pb-4 border-b border-slate-50 mb-6">
                  <CardTitle className="text-xs font-bold text-slate-900">Metode Pembayaran Terpopuler</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                      <span className="text-xs text-slate-700 font-bold">Tunai (Cash)</span>
                    </div>
                    <span className="font-bold text-xs text-slate-900">72% (99 Transaksi)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-xs text-slate-700 font-bold">QRIS / Non-Tunai</span>
                    </div>
                    <span className="font-bold text-xs text-slate-900">20% (28 Transaksi)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-xs text-slate-700 font-bold">Kartu Debit/Kredit</span>
                    </div>
                    <span className="font-bold text-xs text-slate-900">8% (11 Transaksi)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ==============================================================================
             TAB 7: STORE SETTINGS
             ============================================================================== */}
        {activeTab === "settings" && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="text-sm font-bold text-slate-900">Pengaturan Profil Toko</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Ubah identitas toko dan parameter cetak struk thermal.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Pengaturan profil toko berhasil diperbarui!");
              }}
              className="space-y-5 max-w-lg"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Toko</label>
                <Input
                  type="text"
                  className="h-10 text-[13px] border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alamat Toko</label>
                <Input
                  type="text"
                  className="h-10 text-[13px] border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nomor Telepon Toko</label>
                <Input
                  type="text"
                  className="h-10 text-[13px] border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Besaran PPN (%)</label>
                <Input
                  type="number"
                  className="h-10 text-[13px] border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-6 rounded-xl flex gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/10"
              >
                Simpan Perubahan
              </Button>
            </form>
          </section>
        )}
      </main>

      {/* ==============================================================================
           MODAL DIALOG: TAMBAH PRODUK (DUMMY STATE)
           ============================================================================== */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-[440px] bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconPlus size={20} className="text-indigo-500" />
              <span>Tambah Produk Baru</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddProductSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kode SKU / Barcode</label>
              <Input
                type="text"
                placeholder="Contoh: IDM-002"
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl uppercase"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Produk</label>
              <Input
                type="text"
                placeholder="Nama produk lengkap..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori</label>
              <select
                className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold px-3 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Bahan Pokok">Bahan Pokok</option>
                <option value="Mie Instan">Mie Instan</option>
                <option value="Minuman Ringan">Minuman Ringan</option>
                <option value="Makanan Ringan">Makanan Ringan</option>
                <option value="Bumbu Dapur">Bumbu Dapur</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Harga Satuan (Rp)</label>
                <Input
                  type="number"
                  placeholder="3500"
                  className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stok Awal</label>
                <Input
                  type="number"
                  placeholder="50"
                  className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              Simpan Produk
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
