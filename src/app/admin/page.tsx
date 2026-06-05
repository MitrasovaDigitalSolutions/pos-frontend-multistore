"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
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
  IconUsers,
  IconActivity,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard Analitik Toko",
  products: "Manajemen Produk",
  categories: "Kategori Produk",
  inventory: "Stok Barang & Inventori",
  receiving: "Penerimaan Barang Masuk Log",
  reports: "Laporan Penjualan & Analitik",
  users: "Kelola Pengguna Sistem",
  settings: "Pengaturan Profil Toko",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading, logout, hasRole, hasPermission } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // API Data States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [receivings, setReceivings] = useState<any[]>([]);
  const [opnames, setOpnames] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [selectedReportDate, setSelectedReportDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Search & Filters
  const [searchProduct, setSearchProduct] = useState("");
  const [searchUser, setSearchUser] = useState("");

  // Product Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("");
  const [newProductBarcode, setNewProductBarcode] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");

  // User Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("kasir");
  const [userStatus, setUserStatus] = useState("active");

  // Adjustment Modal states
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjProductId, setAdjProductId] = useState("");
  const [adjQty, setAdjQty] = useState("");
  const [adjReason, setAdjReason] = useState("");

  // Receiving Modal states
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
  const [recSupplier, setRecSupplier] = useState("");
  const [recFaktur, setRecFaktur] = useState("");
  const [recNote, setRecNote] = useState("");
  const [recItems, setRecItems] = useState<any[]>([{ product_id: "", kuantitas: "" }]);

  // Opname Modal states
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [opnameNote, setOpnameNote] = useState("");
  const [opnameItems, setOpnameItems] = useState<any[]>([]);
  const [isDetailOpnameOpen, setIsDetailOpnameOpen] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState<any>(null);

  // Route protection
  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    } else if (!isLoading && user) {
      const canAccessAdmin = user.roles.includes("admin") || user.roles.includes("manajer_toko") || user.roles.includes("supervisor");
      if (!canAccessAdmin) {
        toast.error("Anda tidak memiliki izin untuk mengakses Dashboard Admin.");
        router.push("/checkout");
      }
    }
  }, [isLoading, token, user, router]);

  // Adjust default active tab based on permissions
  useEffect(() => {
    if (user) {
      const hasViewReports = user.roles.includes("admin") || user.permissions.includes("view_reports");
      const hasManageProducts = user.roles.includes("admin") || user.permissions.includes("manage_products");
      
      if (!hasViewReports && hasManageProducts) {
        setActiveTab("products");
      }
    }
  }, [user]);

  // API Fetch Functions
  const fetchUsers = async () => {
    try {
      const res = await apiFetch("/v1/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiFetch("/v1/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await apiFetch("/v1/inventory/movements");
      if (res.ok) {
        const data = await res.json();
        setMovements(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch movements:", err);
    }
  };

  const fetchReceivings = async () => {
    try {
      const res = await apiFetch("/v1/inventory/receiving");
      if (res.ok) {
        const data = await res.json();
        setReceivings(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch receivings:", err);
    }
  };

  const fetchOpnames = async () => {
    try {
      const res = await apiFetch("/v1/inventory/opname");
      if (res.ok) {
        const data = await res.json();
        setOpnames(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch opnames:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await apiFetch("/v1/reports/summary");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  const fetchDailyReport = async (dateStr: string) => {
    try {
      const res = await apiFetch(`/v1/reports/sales/daily?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setDailyReport(data);
      }
    } catch (err) {
      console.error("Failed to fetch daily report:", err);
    }
  };

  // Fetch data dynamically on tab change
  useEffect(() => {
    if (!token) return;
    
    if (activeTab === "dashboard") {
      fetchSummary();
    } else if (activeTab === "products") {
      fetchProducts();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "inventory") {
      fetchProducts();
      fetchMovements();
      fetchOpnames();
    } else if (activeTab === "receiving") {
      fetchReceivings();
      fetchProducts();
    } else if (activeTab === "reports") {
      fetchDailyReport(selectedReportDate);
    }
  }, [activeTab, token, selectedReportDate]);

  const handleLogout = async () => {
    await logout();
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUserName("");
    setUserUsername("");
    setUserPassword("");
    setUserRole("kasir");
    setUserStatus("active");
    setIsUserModalOpen(true);
  };

  const openEditUser = (u: any) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserUsername(u.username);
    setUserPassword("");
    setUserRole(u.roles[0] || "kasir");
    setUserStatus(u.status);
    setIsUserModalOpen(true);
  };

  // User Submit Handler
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userUsername || (!editingUser && !userPassword)) {
      toast.error("Nama, Username, dan Password (untuk user baru) wajib diisi!");
      return;
    }

    const payload: any = {
      name: userName,
      username: userUsername,
      roles: [userRole],
      status: userStatus,
    };
    if (userPassword) {
      payload.password = userPassword;
    }

    try {
      const url = editingUser ? `/v1/users/${editingUser.id}` : "/v1/users";
      const method = editingUser ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingUser ? "User berhasil diperbarui!" : "User berhasil ditambahkan!");
        setIsUserModalOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || "Operasi gagal.");
      }
    } catch (err) {
      toast.error("Gagal mengirim data.");
    }
  };

  const handleDeactivateUser = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan pengguna ini?")) {
      try {
        const res = await apiFetch(`/v1/users/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Pengguna berhasil dinonaktifkan.");
          fetchUsers();
        } else {
          toast.error("Gagal menonaktifkan pengguna.");
        }
      } catch (err) {
        toast.error("Gagal terhubung ke server.");
      }
    }
  };

  // Product Submit Handler
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductStock) {
      toast.error("Nama produk, harga, dan stok awal wajib diisi!");
      return;
    }

    const payload = {
      nama: newProductName,
      merek: newProductBrand || "Umum",
      barcode: newProductBarcode || null,
      harga: parseInt(newProductPrice),
      stok: parseInt(newProductStock),
      status: "active",
    };

    try {
      const url = editingProduct ? `/v1/products/${editingProduct.id}` : "/v1/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingProduct ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
        setIsAddProductOpen(false);
        setEditingProduct(null);
        setNewProductName("");
        setNewProductBrand("");
        setNewProductBarcode("");
        setNewProductPrice("");
        setNewProductStock("");
        fetchProducts();
      } else {
        toast.error(data.message || "Operasi gagal.");
      }
    } catch (err) {
      toast.error("Gagal mengirim data.");
    }
  };

  const handleToggleProductStatus = async (p: any) => {
    const nextStatus = p.status === "active" ? "inactive" : "active";
    try {
      const res = await apiFetch(`/v1/products/${p.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(`Status ${p.nama} diperbarui menjadi ${nextStatus}.`);
        fetchProducts();
      } else {
        toast.error("Gagal memperbarui status produk.");
      }
    } catch (err) {
      toast.error("Koneksi gagal.");
    }
  };

  const handleRemoveProduct = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        const res = await apiFetch(`/v1/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Produk berhasil dihapus.");
          fetchProducts();
        } else {
          toast.error("Gagal menghapus produk.");
        }
      } catch (err) {
        toast.error("Koneksi gagal.");
      }
    }
  };

  // Stock Adjustment Submit
  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjProductId || !adjQty || !adjReason) {
      toast.error("Semua field penyesuaian wajib diisi!");
      return;
    }

    try {
      const res = await apiFetch("/v1/inventory/adjustment", {
        method: "POST",
        body: JSON.stringify({
          product_id: parseInt(adjProductId),
          kuantitas: parseInt(adjQty),
          alasan: adjReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Penyesuaian stok manual berhasil disimpan!");
        setIsAdjustmentOpen(false);
        setAdjProductId("");
        setAdjQty("");
        setAdjReason("");
        fetchProducts();
        fetchMovements();
      } else {
        toast.error(data.message || "Gagal melakukan penyesuaian.");
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server.");
    }
  };

  // Receiving Row Helpers
  const addRecItemRow = () => {
    setRecItems((prev) => [...prev, { product_id: "", kuantitas: "" }]);
  };

  const removeRecItemRow = (index: number) => {
    setRecItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRecItemChange = (index: number, field: string, value: any) => {
    setRecItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleReceivingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recSupplier || recItems.some((item) => !item.product_id || !item.kuantitas)) {
      toast.error("Supplier dan seluruh item kuantitas wajib diisi!");
      return;
    }

    const payload = {
      supplier: recSupplier,
      nomor_faktur: recFaktur || null,
      catatan: recNote || null,
      items: recItems.map((item) => ({
        product_id: parseInt(item.product_id),
        kuantitas: parseInt(item.kuantitas),
      })),
    };

    try {
      const res = await apiFetch("/v1/inventory/receiving", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Penerimaan barang berhasil disimpan.");
        setIsReceivingModalOpen(false);
        setRecSupplier("");
        setRecFaktur("");
        setRecNote("");
        setRecItems([{ product_id: "", kuantitas: "" }]);
        fetchProducts();
        fetchReceivings();
      } else {
        toast.error(data.message || "Gagal mencatat penerimaan.");
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server.");
    }
  };

  // Opname Modal Helpers
  const openNewOpname = () => {
    setOpnameNote("");
    setOpnameItems(
      products.map((p) => ({
        product_id: p.id,
        nama: p.nama,
        stok_sistem: p.stok,
        stok_fisik: p.stok,
        alasan: "Opname rutin",
      }))
    );
    setIsOpnameModalOpen(true);
  };

  const handleOpnameItemChange = (index: number, field: string, value: any) => {
    setOpnameItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleOpnameSubmit = async (e: React.FormEvent, status: "draft" | "completed") => {
    e.preventDefault();
    const payload = {
      catatan: opnameNote || "Opname fisik",
      status: "draft",
      items: opnameItems.map((item) => ({
        product_id: item.product_id,
        stok_fisik: parseInt(item.stok_fisik),
        alasan: item.alasan,
      })),
    };

    try {
      // 1. Create draft opname
      const res = await apiFetch("/v1/inventory/opname", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Gagal menyimpan opname.");
        return;
      }

      // 2. If finalization requested immediately, complete it
      if (status === "completed") {
        const opnameId = data.data.id;
        const compRes = await apiFetch(`/v1/inventory/opname/${opnameId}`, {
          method: "PUT",
          body: JSON.stringify({
            status: "completed",
            items: opnameItems.map((item) => ({
              product_id: item.product_id,
              stok_fisik: parseInt(item.stok_fisik),
              alasan: item.alasan,
            })),
          }),
        });

        if (compRes.ok) {
          toast.success("Stock opname berhasil difinalisasi & stok diperbarui!");
        } else {
          toast.warning("Draf opname disimpan, namun gagal finalisasi.");
        }
      } else {
        toast.success("Draf stock opname berhasil disimpan.");
      }

      setIsOpnameModalOpen(false);
      fetchProducts();
      fetchOpnames();
    } catch (err) {
      toast.error("Gagal terhubung ke server.");
    }
  };

  const handleFinalizeExistingOpname = async (id: number, items: any[]) => {
    if (confirm("Finalisasi opname ini sekarang? Stok sistem akan dikoreksi.")) {
      try {
        const res = await apiFetch(`/v1/inventory/opname/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            status: "completed",
            items: items.map((it) => ({
              product_id: it.product_id,
              stok_fisik: it.stok_fisik,
              alasan: it.alasan || "Finalisasi opname",
            })),
          }),
        });

        if (res.ok) {
          toast.success("Stock opname berhasil difinalisasi!");
          fetchProducts();
          fetchOpnames();
        } else {
          toast.error("Gagal memfinalisasi opname.");
        }
      } catch (err) {
        toast.error("Koneksi gagal.");
      }
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0).replace(/,00$/, "");
  };

  // Loading screen
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchProduct.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchProduct.toLowerCase())) ||
      p.merek.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase())
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
                {(hasRole("admin") || hasPermission("view_reports")) && (
                  <li>
                    <button onClick={() => setActiveTab("dashboard")} className={getLinkClass("dashboard")}>
                      <IconHome size={18} />
                      <span>Dashboard</span>
                    </button>
                  </li>
                )}
                {(hasRole("admin") || hasPermission("create_sales")) && (
                  <li>
                    <button onClick={() => router.push("/checkout")} className={getLinkClass("pos")}>
                      <IconDeviceLaptop size={18} />
                      <span>Layar Kasir (POS)</span>
                    </button>
                  </li>
                )}
                {(hasRole("admin") || hasPermission("manage_products")) && (
                  <li>
                    <button onClick={() => setActiveTab("products")} className={getLinkClass("products")}>
                      <IconPackage size={18} />
                      <span>Manajemen Produk</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {(hasRole("admin") || hasPermission("manage_products") || hasPermission("view_reports")) && (
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest px-3 block">
                  Inventori & Laporan
                </span>
                <ul className="space-y-0.5">
                  {(hasRole("admin") || hasPermission("manage_products")) && (
                    <li>
                      <button onClick={() => setActiveTab("inventory")} className={getLinkClass("inventory")}>
                        <IconBox size={18} />
                        <span>Stok Barang</span>
                      </button>
                    </li>
                  )}
                  {(hasRole("admin") || hasPermission("manage_products")) && (
                    <li>
                      <button onClick={() => setActiveTab("receiving")} className={getLinkClass("receiving")}>
                        <IconTruckDelivery size={18} />
                        <span>Penerimaan</span>
                      </button>
                    </li>
                  )}
                  {(hasRole("admin") || hasPermission("view_reports")) && (
                    <li>
                      <button onClick={() => setActiveTab("reports")} className={getLinkClass("reports")}>
                        <IconChartBar size={18} />
                        <span>Laporan Penjualan</span>
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest px-3 block">
            Sistem
          </span>
          <ul className="space-y-0.5">
            {(hasRole("admin") || hasPermission("manage_users")) && (
              <li>
                <button onClick={() => setActiveTab("users")} className={getLinkClass("users")}>
                  <IconUsers size={18} />
                  <span>Kelola Pengguna</span>
                </button>
              </li>
            )}
            {hasRole("admin") && (
              <li>
                <button onClick={() => setActiveTab("settings")} className={getLinkClass("settings")}>
                  <IconSettings size={18} />
                  <span>Pengaturan Toko</span>
                </button>
              </li>
            )}
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
        <header className="flex justify-between items-center mb-6 border-b border-slate-200/60 pb-4">
          <h2 className="text-base font-extrabold text-slate-900">
            {TAB_TITLES[activeTab] || activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-2 font-bold text-xs select-none">
              <IconCalendar size={15} />
              <span>Hari Ini: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>

            <div className="h-5 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                <div className="text-[9px] font-extrabold uppercase text-indigo-600 tracking-wider leading-none mt-0.5">{user.roles[0]?.replace('_', ' ')}</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-xs shadow-sm shadow-indigo-600/5 select-none">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
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
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Penjualan Bersih</span>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg text-white">
                    <IconCash size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-none select-all tabular-nums">
                  {summary ? formatRupiah(summary.net_sales) : "Rp 0"}
                </h3>
                <div className="text-[10px] font-semibold text-indigo-200">Bulan Berjalan</div>
              </Card>

              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Transaksi Sukses</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                    <IconReceipt size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">
                  {summary ? `${summary.sales_count} Trx` : "0 Trx"}
                </h3>
                <div className="text-[10px] font-semibold text-slate-500">
                  Total item: {summary ? summary.items_sold : 0} pcs
                </div>
              </Card>

              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">PPN Terkumpul</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                    <IconChartPie size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">
                  {summary ? formatRupiah(summary.tax_total) : "Rp 0"}
                </h3>
                <div className="text-[10px] font-semibold text-slate-500">Besaran PPN 11%</div>
              </Card>

              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Potongan Diskon</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                    <IconAlertTriangle size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">
                  {summary ? formatRupiah(summary.discount_total) : "Rp 0"}
                </h3>
                <div className="text-[10px] font-semibold text-slate-500">Total diskon transaksi</div>
              </Card>
            </section>

            {/* Split Grid */}
            <section className="grid grid-cols-[1.4fr_1fr] gap-6">
              {/* Sales Chart Card */}
              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4 p-0">
                  <CardTitle className="text-xs font-bold text-slate-900">Perbandingan Penjualan</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-6">
                  <div className="h-[180px] flex items-end justify-around px-2 gap-4">
                    <div className="flex flex-col items-center flex-grow group gap-2">
                      <div className="w-16 bg-indigo-600 rounded-t-lg h-[130px] flex items-center justify-center text-white text-[10px] font-bold">
                        {summary ? formatRupiah(summary.net_sales) : "Rp 0"}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">Bersih (Net)</span>
                    </div>
                    <div className="flex flex-col items-center flex-grow group gap-2">
                      <div className="w-16 bg-slate-300 rounded-t-lg h-[150px] flex items-center justify-center text-slate-800 text-[10px] font-bold">
                        {summary ? formatRupiah(summary.gross_sales) : "Rp 0"}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">Kotor (Gross)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Selling Products */}
              <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4 p-0 mb-4">
                  <CardTitle className="text-xs font-bold text-slate-900">Produk Terlaris</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {summary && summary.top_products && summary.top_products.length > 0 ? (
                    summary.top_products.map((tp: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          #{i + 1}
                        </div>
                        <div className="flex-grow">
                          <div className="font-bold text-[11px] text-slate-800">{tp.product_name}</div>
                          <div className="text-[9px] text-slate-400 font-medium">Terjual {tp.quantity} pcs</div>
                        </div>
                        <span className="font-bold text-xs text-slate-900 tabular-nums">{formatRupiah(tp.revenue)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">Belum ada data transaksi.</div>
                  )}
                </CardContent>
              </Card>
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
                onClick={() => {
                  setEditingProduct(null);
                  setNewProductName("");
                  setNewProductBrand("");
                  setNewProductBarcode("");
                  setNewProductPrice("");
                  setNewProductStock("");
                  setIsAddProductOpen(true);
                }}
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
                  placeholder="Cari produk berdasarkan barcode, nama, atau merek..."
                  className="pl-9 h-9 text-[11px] border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
              </div>
            </div>

            <Table className="w-full">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-slate-500">Barcode / SKU</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Merek</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-slate-500">Harga Jual</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-slate-500">Stok</TableHead>
                  <TableHead className="text-center text-[10px] font-bold text-slate-500">Status</TableHead>
                  <TableHead className="text-center w-28 text-[10px] font-bold text-slate-500">Aksi</TableHead>
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
                    <TableRow key={p.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-slate-900 text-xs">{p.barcode || "-"}</TableCell>
                      <TableCell className="font-semibold text-slate-800 text-xs">{p.nama}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{p.merek}</TableCell>
                      <TableCell className="text-right font-bold text-slate-800 text-xs">{formatRupiah(p.harga)}</TableCell>
                      <TableCell className={`text-right font-bold text-xs ${p.stok <= 10 ? "text-amber-500" : "text-slate-800"}`}>
                        {p.stok} pcs
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleToggleProductStatus(p)}
                          className={`badge text-[10px] border-none cursor-pointer ${p.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                        >
                          {p.status === "active" ? "Aktif" : "Nonaktif"}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setNewProductName(p.nama);
                              setNewProductBrand(p.merek);
                              setNewProductBarcode(p.barcode || "");
                              setNewProductPrice(p.harga.toString());
                              setNewProductStock(p.stok.toString());
                              setIsAddProductOpen(true);
                            }}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveProduct(p.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer"
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
             TAB 3: INVENTORY & STOCK LEVEL & OPNAME
             ============================================================================== */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            {/* Stock Levels & Movements */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Inventori & Level Stok</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Peninjauan stok real-time, opname fisik, dan adjustment manual.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsAdjustmentOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                  >
                    <IconActivity size={16} /> Penyesuaian Stok (Manual)
                  </Button>
                  <Button
                    onClick={openNewOpname}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                  >
                    <IconClipboardCheck size={16} /> Stock Opname Baru
                  </Button>
                </div>
              </div>

              {/* Low Stock Warning Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <IconAlertTriangle size={16} className="text-amber-500" />
                  <span>Alert: Produk Stok Rendah (&le; 10 pcs)</span>
                </h4>
                <Table className="w-full">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold text-slate-500">Barcode</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                      <TableHead className="text-right text-[10px] font-bold text-slate-500">Sisa Stok</TableHead>
                      <TableHead className="text-center text-[10px] font-bold text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.filter((p) => p.stok <= 10).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-slate-400 text-xs">
                          Semua produk memiliki stok di atas batas minimum.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.filter((p) => p.stok <= 10).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs font-bold">{p.barcode || "-"}</TableCell>
                          <TableCell className="text-xs font-semibold">{p.nama}</TableCell>
                          <TableCell className="text-right text-xs font-bold text-rose-500">{p.stok} pcs</TableCell>
                          <TableCell className="text-center">
                            <span className="bg-rose-50 text-rose-700 text-[10px] px-2.5 py-1 rounded-full font-bold">Stok Kritis</span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Opname List */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-50 pb-2">Daftar Dokumen Stock Opname</h3>
              <Table className="w-full">
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold text-slate-500">No. Opname</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">Tanggal</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">Catatan</TableHead>
                    <TableHead className="text-center text-[10px] font-bold text-slate-500">Status</TableHead>
                    <TableHead className="text-center w-28 text-[10px] font-bold text-slate-500">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opnames.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-slate-400 text-xs">Belum ada rekaman stock opname.</TableCell>
                    </TableRow>
                  ) : (
                    opnames.map((op) => (
                      <TableRow key={op.id}>
                        <TableCell className="text-xs font-bold">{op.nomor_opname}</TableCell>
                        <TableCell className="text-xs text-slate-500">{new Date(op.created_at).toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-xs text-slate-600">{op.catatan || "-"}</TableCell>
                        <TableCell className="text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${op.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {op.status === "completed" ? "Completed" : "Draft"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOpname(op);
                                setIsDetailOpnameOpen(true);
                              }}
                              className="text-xs font-bold text-indigo-600 hover:underline bg-transparent border-none cursor-pointer"
                            >
                              Detail
                            </button>
                            {op.status === "draft" && (
                              <button
                                onClick={() => handleFinalizeExistingOpname(op.id, op.items || [])}
                                className="text-xs font-bold text-emerald-600 hover:underline bg-transparent border-none cursor-pointer"
                              >
                                Finalisasi
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>

            {/* Movements Ledger */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-50 pb-2">Kartu Kendali Mutasi Stok (Terbaru)</h3>
              <Table className="w-full">
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold text-slate-500">Waktu</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">Tipe</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500">Perubahan</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500">Sebelum</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500">Sesudah</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">Alasan / Referensi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-slate-400 text-xs">Belum ada log pergerakan stok.</TableCell>
                    </TableRow>
                  ) : (
                    movements.slice(0, 15).map((mv) => (
                      <TableRow key={mv.id}>
                        <TableCell className="text-[11px] text-slate-500">{new Date(mv.created_at).toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800">{mv.product?.nama || "-"}</TableCell>
                        <TableCell className="text-xs capitalize font-medium">{mv.tipe}</TableCell>
                        <TableCell className={`text-right text-xs font-bold ${mv.kuantitas > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                          {mv.kuantitas > 0 ? `+${mv.kuantitas}` : mv.kuantitas}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-500">{mv.stok_sebelum}</TableCell>
                        <TableCell className="text-right text-xs text-slate-800 font-bold">{mv.stok_sesudah}</TableCell>
                        <TableCell className="text-[11px] text-slate-600">{mv.alasan || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>
          </div>
        )}

        {/* ==============================================================================
             TAB 4: STOCK RECEIVING LOG
             ============================================================================== */}
        {activeTab === "receiving" && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Penerimaan Barang Masuk</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Daftar riwayat pasokan barang masuk dari distributor.</p>
              </div>
              <Button
                onClick={() => {
                  setRecSupplier("");
                  setRecFaktur("");
                  setRecNote("");
                  setRecItems([{ product_id: "", kuantitas: "" }]);
                  setIsReceivingModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPlus size={16} /> Terima Barang Masuk
              </Button>
            </div>

            <Table className="w-full">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-slate-500">Tanggal</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">No. Penerimaan</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Supplier</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Faktur</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                      Belum ada pasokan barang masuk yang tercatat.
                    </TableCell>
                  </TableRow>
                ) : (
                  receivings.map((rec) => (
                    <TableRow key={rec.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-600 text-xs">{new Date(rec.created_at).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="font-bold text-slate-900 text-xs">{rec.nomor_penerimaan}</TableCell>
                      <TableCell className="font-semibold text-slate-800 text-xs">{rec.supplier || "-"}</TableCell>
                      <TableCell className="text-slate-600 text-xs">{rec.nomor_faktur || "-"}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{rec.catatan || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>
        )}

        {/* ==============================================================================
             TAB 5: REPORTS & DETAILED ANALYTICS
             ============================================================================== */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Laporan Penjualan Harian</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Analisis performa transaksi per kasir dan metode pembayaran.</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600">Pilih Tanggal:</label>
                  <Input
                    type="date"
                    className="h-9 text-xs w-36 border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                    value={selectedReportDate}
                    onChange={(e) => setSelectedReportDate(e.target.value)}
                  />
                </div>
              </div>

              {dailyReport ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-[9px] font-bold uppercase text-slate-400">Total Omset Harian</div>
                      <div className="text-lg font-bold text-indigo-600 mt-1">{formatRupiah(dailyReport.total_sales)}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-[9px] font-bold uppercase text-slate-400">Transaksi Sukses</div>
                      <div className="text-lg font-bold text-slate-800 mt-1">{dailyReport.transactions_count} Trx</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-[9px] font-bold uppercase text-slate-400">Rerata Nilai Struk</div>
                      <div className="text-lg font-bold text-slate-800 mt-1">{formatRupiah(dailyReport.average_transaction_value)}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-[9px] font-bold uppercase text-slate-400">Transaksi Void</div>
                      <div className="text-lg font-bold text-rose-500 mt-1">{dailyReport.void_count} Void</div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">Breakdown Metode Pembayaran</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.keys(dailyReport.payment_methods || {}).map((method) => {
                        const pm = dailyReport.payment_methods[method];
                        return (
                          <div key={method} className="border border-slate-100 p-4 rounded-xl bg-white flex justify-between items-center">
                            <div>
                              <div className="text-xs font-bold uppercase text-slate-600 capitalize">{method}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{pm.count} Transaksi</div>
                            </div>
                            <span className="font-bold text-sm text-slate-800">{formatRupiah(pm.total)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">10 Produk Terlaris Hari Ini</h4>
                    <Table className="w-full">
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                          <TableHead className="text-right text-[10px] font-bold text-slate-500">Jumlah Terjual</TableHead>
                          <TableHead className="text-right text-[10px] font-bold text-slate-500">Total Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyReport.top_products && dailyReport.top_products.length > 0 ? (
                          dailyReport.top_products.map((tp: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs font-semibold text-slate-800">{tp.product_name}</TableCell>
                              <TableCell className="text-right text-xs font-bold">{tp.quantity} pcs</TableCell>
                              <TableCell className="text-right text-xs font-bold text-indigo-600">{formatRupiah(tp.revenue)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-slate-400 text-xs">Belum ada item terjual pada tanggal ini.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">Memuat laporan penjualan...</div>
              )}
            </Card>
          </div>
        )}

        {/* ==============================================================================
             TAB 6: USER MANAGEMENT (NEW)
             ============================================================================== */}
        {activeTab === "users" && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Kelola Pengguna Sistem</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Manajemen user kasir, supervisor, manajer toko, dan admin.</p>
              </div>
              <Button
                onClick={openAddUser}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
              >
                <IconPlus size={16} /> Tambah Pengguna
              </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-grow max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  type="text"
                  placeholder="Cari user berdasarkan nama atau username..."
                  className="pl-9 h-9 text-[11px] border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
              </div>
            </div>

            <Table className="w-full">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-slate-500">Nama Lengkap</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Username</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Email</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500">Role Peran</TableHead>
                  <TableHead className="text-center text-[10px] font-bold text-slate-500">Status</TableHead>
                  <TableHead className="text-center w-28 text-[10px] font-bold text-slate-500">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                      Tidak ada pengguna ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-slate-900 text-xs">{u.name}</TableCell>
                      <TableCell className="text-slate-500 text-xs font-mono">{u.username}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{u.email || "-"}</TableCell>
                      <TableCell className="text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          u.roles.includes("admin") ? "bg-indigo-50 text-indigo-700" :
                          u.roles.includes("manajer_toko") ? "bg-amber-50 text-amber-700" :
                          u.roles.includes("supervisor") ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {u.roles[0]?.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {u.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => openEditUser(u)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <IconEdit size={16} />
                          </button>
                          {u.id !== user.id && u.status === "active" && (
                            <button
                              onClick={() => handleDeactivateUser(u.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                            >
                              <IconTrash size={16} />
                            </button>
                          )}
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
             TAB 7: STORE SETTINGS
             ============================================================================== */}
        {activeTab === "settings" && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="text-sm font-bold text-slate-900">Pengaturan Profil Toko</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Identitas toko POS ritel.</p>
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-md">
              <p className="font-bold text-slate-800">Profil Store Aktif</p>
              <p className="mt-1">ID Store Terdaftar: <strong className="font-mono">{user.store_id || "1 (Toko Utama)"}</strong></p>
              <p>Toko ritel terhubung langsung dengan REST API database terpusat.</p>
            </div>
          </section>
        )}
      </main>

      {/* ==============================================================================
           MODAL DIALOG: TAMBAH/EDIT PRODUK
           ============================================================================== */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-[440px] bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconPlus size={20} className="text-indigo-500" />
              <span>{editingProduct ? "Edit Detail Produk" : "Tambah Produk Baru"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProductSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Barcode / SKU</label>
              <Input
                type="text"
                placeholder="Contoh: 8990002004"
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={newProductBarcode}
                onChange={(e) => setNewProductBarcode(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Produk</label>
              <Input
                type="text"
                placeholder="Nama produk lengkap..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Merek</label>
              <Input
                type="text"
                placeholder="Merek produk..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={newProductBrand}
                onChange={(e) => setNewProductBrand(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Harga Jual (Rp)</label>
                <Input
                  type="number"
                  placeholder="3500"
                  className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stok</label>
                <Input
                  type="number"
                  placeholder="50"
                  className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
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

      {/* ==============================================================================
           MODAL DIALOG: TAMBAH/EDIT USER
           ============================================================================== */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-[440px] bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconPlus size={20} className="text-indigo-500" />
              <span>{editingUser ? "Edit Profil Pengguna" : "Daftarkan Pengguna Baru"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUserSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
              <Input
                type="text"
                placeholder="Nama user lengkap..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <Input
                type="text"
                placeholder="Username untuk login..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={userUsername}
                onChange={(e) => setUserUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password {editingUser && "(Kosongkan jika tidak diubah)"}</label>
              <Input
                type="password"
                placeholder="Password minimal 6 karakter..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role Peran</label>
                <select
                  className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold px-3 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="kasir">Kasir</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manajer_toko">Manajer Toko</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select
                  className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold px-3 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              Simpan Pengguna
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           MODAL DIALOG: PENYESUAIAN STOK MANUAL
           ============================================================================== */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent className="max-w-[440px] bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconActivity size={20} className="text-amber-500" />
              <span>Penyesuaian Stok Manual</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustmentSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pilih Produk</label>
              <select
                className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold px-3 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                value={adjProductId}
                onChange={(e) => setAdjProductId(e.target.value)}
              >
                <option value="">-- Pilih Produk --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama} (Stok saat ini: {p.stok})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Perubahan Kuantitas</label>
              <Input
                type="number"
                placeholder="Gunakan tanda minus (-) untuk kehilangan/kerusakan"
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={adjQty}
                onChange={(e) => setAdjQty(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alasan Penyesuaian</label>
              <Input
                type="text"
                placeholder="Contoh: Beras basah tumpah, botol pecah..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              Simpan Penyesuaian
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           MODAL DIALOG: TERIMA BARANG MASUK SUPPLIER
           ============================================================================== */}
      <Dialog open={isReceivingModalOpen} onOpenChange={setIsReceivingModalOpen}>
        <DialogContent className="max-w-[500px] bg-white rounded-2xl border-slate-100 p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconTruckDelivery size={20} className="text-indigo-500" />
              <span>Penerimaan Barang Dari Supplier</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReceivingSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supplier</label>
                <Input
                  type="text"
                  placeholder="Nama supplier/distributor..."
                  className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={recSupplier}
                  onChange={(e) => setRecSupplier(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Faktur</label>
                <Input
                  type="text"
                  placeholder="FAK-XXXX..."
                  className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                  value={recFaktur}
                  onChange={(e) => setRecFaktur(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan</label>
              <Input
                type="text"
                placeholder="Catatan penerimaan..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={recNote}
                onChange={(e) => setRecNote(e.target.value)}
              />
            </div>

            {/* Items Rows */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-bold text-slate-800">Daftar Item Masuk</h5>
                <Button
                  type="button"
                  onClick={addRecItemRow}
                  className="h-7 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 rounded-lg cursor-pointer"
                >
                  + Baris Item
                </Button>
              </div>

              {recItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-grow">
                    <select
                      className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold px-3 focus:outline-none focus:border-indigo-600 focus:ring-1"
                      value={item.product_id}
                      onChange={(e) => handleRecItemChange(idx, "product_id", e.target.value)}
                    >
                      <option value="">-- Pilih Produk --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Qty"
                      className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                      value={item.kuantitas}
                      onChange={(e) => handleRecItemChange(idx, "kuantitas", e.target.value)}
                    />
                  </div>
                  {recItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRecItemRow(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <IconX size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              Simpan Penerimaan Barang
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           MODAL DIALOG: STOCK OPNAME (FORM FISIK & KOREKSI)
           ============================================================================== */}
      <Dialog open={isOpnameModalOpen} onOpenChange={setIsOpnameModalOpen}>
        <DialogContent className="max-w-[650px] bg-white rounded-2xl border-slate-100 p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IconClipboardCheck size={20} className="text-indigo-500" />
              <span>Stock Opname Fisik Ritel</span>
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan Opname</label>
              <Input
                type="text"
                placeholder="Contoh: Opname akhir bulan Juni..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                value={opnameNote}
                onChange={(e) => setOpnameNote(e.target.value)}
              />
            </div>

            {/* Opname Items Grid/Table */}
            <div className="border-t border-slate-100 pt-2 space-y-2">
              <h5 className="text-xs font-bold text-slate-800 mb-2">Input Perhitungan Fisik Lapangan</h5>
              <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {opnameItems.map((item, idx) => (
                  <div key={item.product_id} className="border border-slate-100 p-3 rounded-xl bg-slate-50/50 grid grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-2 items-center">
                    <span className="text-xs font-bold text-slate-800 truncate">{item.nama}</span>
                    <span className="text-xs text-slate-400 text-right">Sistem: {item.stok_sistem} pcs</span>
                    <div>
                      <Input
                        type="number"
                        placeholder="Fisik"
                        className="h-8 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-lg text-right"
                        value={item.stok_fisik}
                        onChange={(e) => handleOpnameItemChange(idx, "stok_fisik", e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Alasan selisih..."
                        className="h-8 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-lg"
                        value={item.alasan}
                        onChange={(e) => handleOpnameItemChange(idx, "alasan", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                onClick={(e) => handleOpnameSubmit(e, "draft")}
                className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer"
              >
                Simpan Sebagai Draf
              </Button>
              <Button
                type="button"
                onClick={(e) => handleOpnameSubmit(e, "completed")}
                className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer shadow-sm shadow-indigo-600/15"
              >
                Simpan & Finalisasi Stok
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           MODAL DIALOG: DETAIL OPNAME / REVIEW ITEMS
           ============================================================================== */}
      <Dialog open={isDetailOpnameOpen} onOpenChange={setIsDetailOpnameOpen}>
        <DialogContent className="max-w-[500px] bg-white rounded-2xl border-slate-100 p-6">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900">
              Detail Stock Opname: {selectedOpname?.nomor_opname}
            </DialogTitle>
          </DialogHeader>

          {selectedOpname && (
            <div className="space-y-4 pt-4">
              <div>
                <p className="text-xs text-slate-500">Catatan: <strong className="text-slate-800">{selectedOpname.catatan || "-"}</strong></p>
                <p className="text-xs text-slate-500 mt-1">Status: <strong className="text-slate-800 capitalize">{selectedOpname.status}</strong></p>
              </div>

              <Table className="w-full">
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold text-slate-500">Nama Produk</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500">Sistem</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500">Fisik</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-slate-500">Selisih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOpname.items && selectedOpname.items.length > 0 ? (
                    selectedOpname.items.map((it: any) => (
                      <TableRow key={it.id}>
                        <TableCell className="text-xs font-semibold text-slate-800">{it.product?.nama || "Produk ID: " + it.product_id}</TableCell>
                        <TableCell className="text-right text-xs text-slate-500">{it.stok_sistem} pcs</TableCell>
                        <TableCell className="text-right text-xs text-slate-800 font-bold">{it.stok_fisik} pcs</TableCell>
                        <TableCell className={`text-right text-xs font-bold ${it.selisih === 0 ? "text-slate-500" : it.selisih > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                          {it.selisih > 0 ? `+${it.selisih}` : it.selisih}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-slate-400 text-xs">Tidak ada item tercatat.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
