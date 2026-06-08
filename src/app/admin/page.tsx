"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  IconHome,
  IconPackage,
  IconShoppingCart,
  IconUsers,
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
  IconActivity,
  IconClipboardCheck,
  IconDownload,
  IconDotsVertical,
  IconChevronDown,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkline, BarChart, DoughnutChart } from "@/components/ui/charts";

const TAB_TITLES: Record<string, string> = {
  dashboard: "Overview Analitik Toko",
  products: "Katalog & Manajemen Produk",
  inventory: "Pembelian & Inventori Barang",
  users: "Database & Keanggotaan Kasir",
  reports: "Analisis Laporan & Performa",
  settings: "Pengaturan Profil Toko",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading, logout, hasRole, hasPermission } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [productsSubTab, setProductsSubTab] = useState<"list" | "categories">("list");
  const [purchasesSubTab, setPurchasesSubTab] = useState<"receiving" | "opname" | "adjustment" | "movements">("receiving");

  // API Data States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [receivings, setReceivings] = useState<any[]>([]);
  const [opnames, setOpnames] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
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

  const fetchTransactions = async () => {
    try {
      const res = await apiFetch("/v1/transactions?per_page=5");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data?.data || data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
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
      fetchTransactions();
      fetchProducts(); // needed for total product volume count
    } else if (activeTab === "products") {
      fetchProducts();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "inventory") {
      fetchProducts();
      fetchMovements();
      fetchOpnames();
      fetchReceivings();
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

  // Custom navigation link styling
  const getNavLinkClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `text-xs font-extrabold pb-2 -mb-2 transition-all cursor-pointer border-none bg-transparent ${
      isActive
        ? "text-slate-900 border-b-[3px] border-slate-900 font-black"
        : "text-slate-400 hover:text-slate-600 font-bold"
    }`;
  };

  // Mock bar chart datasets for the Revenue card
  const monthlyRevenueData = [
    { label: "Jan", value: 3400 },
    { label: "Feb", value: 2800 },
    { label: "Mar", value: 4000, pattern: true },
    { label: "May", value: 2500, pattern: true },
    { label: "Apr", value: 4500 },
  ];

  // Dynamic doughnut shares based on real top products
  const doughnutSegments = summary?.top_products && summary.top_products.length > 0
    ? summary.top_products.slice(0, 4).map((tp: any, index: number) => {
        const colors = ["#0f172a", "#6366f1", "#94a3b8", "#cbd5e1"];
        return {
          label: tp.product_name,
          value: tp.quantity,
          color: colors[index] || "#cbd5e1",
        };
      })
    : [
        { label: "Shoes", value: 40, color: "#0f172a" },
        { label: "Electronics", value: 30, color: "#6366f1" },
        { label: "Furniture", value: 20, color: "#94a3b8" },
        { label: "Clothes", value: 10, color: "#cbd5e1" },
      ];

  const doughnutTotalValue = summary?.top_products && summary.top_products.length > 0
    ? summary.top_products.slice(0, 4).reduce((acc: number, curr: any) => acc + curr.quantity, 0)
    : 23324;

  return (
    <div className="flex-grow flex flex-col h-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      
      {/* ─── NEW TOP NAVIGATION BAR (Ecomora Style) ───────────────────────────────── */}
      <header className="bg-white border-b border-slate-200/80 h-16 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-10">
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg tracking-tighter">
              t
            </div>
            <span className="font-black text-[16px] text-slate-900 tracking-tight">TumbasPOS</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 h-full pt-1">
            {(hasRole("admin") || hasPermission("view_reports")) && (
              <button onClick={() => setActiveTab("dashboard")} className={getNavLinkClass("dashboard")}>
                Dashboard
              </button>
            )}
            {(hasRole("admin") || hasPermission("manage_products")) && (
              <button onClick={() => setActiveTab("products")} className={getNavLinkClass("products")}>
                Products
              </button>
            )}
            {(hasRole("admin") || hasPermission("manage_products")) && (
              <button onClick={() => setActiveTab("inventory")} className={getNavLinkClass("inventory")}>
                Purchases
              </button>
            )}
            {(hasRole("admin") || hasPermission("manage_users")) && (
              <button onClick={() => setActiveTab("users")} className={getNavLinkClass("users")}>
                Customers
              </button>
            )}
            {(hasRole("admin") || hasPermission("view_reports")) && (
              <button onClick={() => setActiveTab("reports")} className={getNavLinkClass("reports")}>
                Analytics
              </button>
            )}
            {hasRole("admin") && (
              <button onClick={() => setActiveTab("settings")} className={getNavLinkClass("settings")}>
                Settings
              </button>
            )}
          </nav>
        </div>

        {/* User profile section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/checkout")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-dashed border-slate-300 h-8 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <IconDeviceLaptop size={15} />
            <span>Layar Kasir (POS)</span>
          </Button>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          {/* User profile dropdown trigger */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
              <div className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">
                {user.roles[0]?.replace("_", " ")}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-1 hover:bg-slate-100 rounded text-rose-500 transition-colors border-none bg-transparent cursor-pointer"
              title="Logout"
            >
              <IconLogout size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ────────────────────────────────────────────────── */}
      <main className="flex-grow p-8 overflow-y-auto max-w-[1440px] mx-auto w-full">
        
        {/* Dynamic header title & actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-950 leading-tight">
              {TAB_TITLES[activeTab] || activeTab}
            </h1>
            <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
              <IconCalendar size={14} className="text-indigo-500" />
              <span>Hari Ini: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </p>
          </div>

          {activeTab === "dashboard" && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-48 sm:w-64">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <Input
                  type="text"
                  placeholder="Search product..."
                  className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-slate-950 rounded-xl bg-white w-full"
                  value={searchProduct}
                  onChange={(e) => {
                    setSearchProduct(e.target.value);
                    setActiveTab("products");
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => toast.success("Exporting data to CSV...")}
                className="h-9 text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 rounded-xl flex gap-1.5 cursor-pointer shrink-0"
              >
                <IconDownload size={14} />
                <span>Export CSV</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Downloading reports...")}
                className="h-9 text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 rounded-xl flex gap-1.5 cursor-pointer shrink-0"
              >
                <IconDownload size={14} />
                <span>Download Report</span>
              </Button>
            </div>
          )}
        </div>

        {/* ─── TAB 1: DASHBOARD (Ecomora Premium redrawn) ───────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[28%_40%_32%] gap-6">
              
              {/* Stack 1: Left Stats Stack */}
              <div className="flex flex-col gap-6">
                {/* Stat 1: Total Sales Volume */}
                <Card className="bg-white border-none rounded-3xl shadow-sm p-6 flex flex-col justify-between min-h-[145px]">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Total Products Sales
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-slate-950 tracking-tight tabular-nums">
                        {summary ? (summary.items_sold).toLocaleString("id-ID") : "0"}
                      </span>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center">
                        +10%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setActiveTab("reports")}
                      className="text-[10px] font-extrabold text-slate-900 border-b border-slate-900 hover:text-slate-600 hover:border-slate-400 pb-0.5 transition-all cursor-pointer bg-transparent border-none"
                    >
                      View Sales Details →
                    </button>
                    <Sparkline data={[12, 18, 10, 24, 16, 30, 25, 38]} width={70} height={25} />
                  </div>
                </Card>

                {/* Stat 2: Total Volume of Products */}
                <Card className="bg-white border-none rounded-3xl shadow-sm p-6 flex flex-col justify-between min-h-[145px]">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Total Volume of Products
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-slate-950 tracking-tight tabular-nums">
                        {summary ? `${summary.sales_count}` : "0"}
                      </span>
                      <span className="bg-rose-50 text-rose-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center">
                        -12%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setActiveTab("products")}
                      className="text-[10px] font-extrabold text-slate-900 border-b border-slate-900 hover:text-slate-600 hover:border-slate-400 pb-0.5 transition-all cursor-pointer bg-transparent border-none"
                    >
                      View All Products →
                    </button>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                      <IconShoppingBag size={18} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Stack 2: Middle Sales Revenue Chart Card */}
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Total Products Sales
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-slate-950 tracking-tight tabular-nums">
                        {summary ? formatRupiah(summary.net_sales) : "Rp 0"}
                      </span>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center">
                        +45%
                      </span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer border-none bg-transparent">
                    <IconDotsVertical size={16} />
                  </button>
                </div>

                <div className="mt-6">
                  {/* Legend */}
                  <div className="flex gap-4 justify-end text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                      <span>Total Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                      <span>Total Profit</span>
                    </div>
                  </div>

                  <BarChart data={monthlyRevenueData} height={140} />
                </div>
              </Card>

              {/* Stack 3: Right Sales Statistics Doughnut Card */}
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Total Sales Statistics
                  </span>
                  <select className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none">
                    <option>Monthly</option>
                    <option>Weekly</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-4 mt-4">
                  {/* Doughnut Widget */}
                  <DoughnutChart
                    data={doughnutSegments}
                    size={130}
                    strokeWidth={14}
                    centerValue={doughnutTotalValue.toLocaleString("id-ID")}
                    centerBadge="+45%"
                    centerLabel="Terjual"
                  />

                  <div className="flex-grow space-y-2.5">
                    {doughnutSegments.map((seg: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
                          <span className="truncate max-w-[85px] font-bold text-slate-800">{seg.label}</span>
                        </div>
                        <span className="tabular-nums font-extrabold text-slate-900">
                          {seg.value.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Total Number of Sales</span>
                  <span className="text-slate-900 tabular-nums">
                    {summary ? (summary.items_sold).toLocaleString("id-ID") : "0"}
                  </span>
                </div>
              </Card>

            </div>

            {/* Bottom Grid: Recent Orders & Top Selling */}
            <div className="grid grid-cols-1 xl:grid-cols-[64%_36%] gap-6">
              
              {/* Recent Orders Card */}
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-950">Recent Orders</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Keep track of recent order data and other transactions.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab("reports")}
                      className="text-[10px] font-extrabold text-slate-900 flex items-center gap-1 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                    >
                      <span>View All</span>
                      <IconArrowUpRight size={14} />
                    </Button>
                  </div>

                  <Table>
                    <TableHeader className="bg-slate-50/50 border-none rounded-xl">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Order Id</TableHead>
                        <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Product Name</TableHead>
                        <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Payment</TableHead>
                        <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Amount</TableHead>
                        <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Status</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                            Belum ada transaksi terekam.
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((trx: any) => {
                          const dateObj = new Date(trx.created_at);
                          const dateStr = dateObj.toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          });

                          return (
                            <TableRow key={trx.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-100">
                              <TableCell className="font-bold text-slate-950 text-xs">
                                #{trx.nomor_transaksi?.replace("TRX-", "").slice(0, 7) || trx.id}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <IconShoppingBag size={14} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-[11px] truncate max-w-[120px]">
                                      {trx.items && trx.items[0] ? trx.items[0].nama_produk : "Item POS"}
                                    </div>
                                    {trx.items && trx.items.length > 1 && (
                                      <div className="text-[9px] text-indigo-500 font-bold mt-0.5">
                                        +{trx.items.length - 1} item lainnya
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-500 text-xs font-medium">{dateStr}</TableCell>
                              <TableCell className="text-slate-700 text-xs font-bold capitalize">
                                {trx.metode_pembayaran === "cash"
                                  ? "Cash/Tunai"
                                  : trx.metode_pembayaran === "card"
                                  ? "Card / EDC"
                                  : trx.metode_pembayaran || "Draft"}
                              </TableCell>
                              <TableCell className="text-right font-black text-slate-950 text-xs tabular-nums">
                                {formatRupiah(trx.total)}
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block tracking-wider uppercase ${
                                    trx.status === "completed"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : trx.status === "void"
                                      ? "bg-rose-50 text-rose-600"
                                      : "bg-amber-50 text-amber-600"
                                  }`}
                                >
                                  {trx.status === "completed"
                                    ? "Complete"
                                    : trx.status === "void"
                                    ? "Voided"
                                    : "In Progress"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <button className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                                  <IconDotsVertical size={15} />
                                </button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Top Selling Products Card */}
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                    <h3 className="text-sm font-black text-slate-950">Top Selling Products</h3>
                    <select className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none">
                      <option>Monthly</option>
                      <option>Weekly</option>
                    </select>
                  </div>

                  {summary?.top_products && summary.top_products[0] ? (
                    <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-md">
                          <IconDeviceLaptop size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 truncate max-w-[150px]">
                            {summary.top_products[0].product_name}
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                            Brand: Terlaris • Terjual {summary.top_products[0].quantity} pcs
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-xs text-slate-900 block">
                          {formatRupiah(summary.top_products[0].revenue)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Belum ada penjualan tercatat.
                    </div>
                  )}

                  {/* Weekly mini volume bar chart */}
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-end h-[70px] px-2 gap-4">
                      {[
                        { day: "Tue", val: 840, h: "h-3" },
                        { day: "Wed", val: 2000, h: "h-6" },
                        { day: "Thu", val: 6000, h: "h-14" },
                        { day: "Fri", val: 1200, h: "h-4" },
                      ].map((d, i) => (
                        <div key={i} className="flex flex-col items-center flex-grow group gap-1">
                          <span className="text-[8px] font-black text-slate-400 scale-0 group-hover:scale-100 transition-all select-none">
                            {d.val}
                          </span>
                          <div className={`w-3 bg-slate-950 rounded-full transition-all duration-500 ${d.h}`}></div>
                          <span className="text-[9px] font-extrabold text-slate-400 mt-1 uppercase">{d.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        )}

        {/* ─── TAB 2: PRODUCTS TAB (CRUD & Mock Categories sub-tabs) ──────────────── */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Sub-tabs toggles */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setProductsSubTab("list")}
                className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                  productsSubTab === "list"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 bg-transparent border-none"
                }`}
              >
                Manajemen Produk
              </button>
              <button
                onClick={() => setProductsSubTab("categories")}
                className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                  productsSubTab === "categories"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 bg-transparent border-none"
                }`}
              >
                Kategori Produk
              </button>
            </div>

            {productsSubTab === "list" ? (
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Daftar Produk Toko</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manajemen inventori produk aktif dan SKU.</p>
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
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer border-none"
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
                      className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-slate-950 rounded-xl bg-white"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-none">
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Barcode / SKU</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Nama Produk</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Merek</TableHead>
                      <TableHead className="text-right text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Harga Jual</TableHead>
                      <TableHead className="text-right text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Stok</TableHead>
                      <TableHead className="text-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-center w-24 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                          Tidak ada produk ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                          <TableCell className="font-bold text-slate-950 text-xs">{p.barcode || "-"}</TableCell>
                          <TableCell className="font-bold text-slate-900 text-xs">{p.nama}</TableCell>
                          <TableCell className="text-slate-500 text-xs font-semibold">{p.merek}</TableCell>
                          <TableCell className="text-right font-black text-slate-900 text-xs tabular-nums">
                            {formatRupiah(p.harga)}
                          </TableCell>
                          <TableCell className={`text-right font-black text-xs tabular-nums ${p.stok <= 10 ? "text-amber-500" : "text-slate-800"}`}>
                            {p.stok} pcs
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => handleToggleProductStatus(p)}
                              className={`badge text-[9px] font-black border-none cursor-pointer px-2.5 py-0.5 rounded-full select-none uppercase tracking-wider ${
                                p.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {p.status === "active" ? "Aktif" : "Nonaktif"}
                            </button>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1">
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
              </Card>
            ) : (
              // Mock Categories
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Kategori & Klasifikasi</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Klasifikasi produk ritel yang terdaftar.</p>
                </div>

                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-none">
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Nama Kategori</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Estimasi Item</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Shoes / Sepatu", count: 42, status: "active" },
                      { name: "Electronics / Elektronik", count: 18, status: "active" },
                      { name: "Furniture / Mebel", count: 12, status: "active" },
                      { name: "Clothes / Pakaian", count: 68, status: "active" },
                      { name: "Beverages / Minuman", count: 50, status: "active" },
                      { name: "Foods / Makanan", count: 110, status: "active" },
                    ].map((cat, idx) => (
                      <TableRow key={idx} className="border-b border-slate-100">
                        <TableCell className="font-bold text-slate-900 text-xs">{cat.name}</TableCell>
                        <TableCell className="font-bold text-slate-700 text-xs tabular-nums">{cat.count} Produk</TableCell>
                        <TableCell className="text-xs">
                          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {cat.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        )}

        {/* ─── TAB 3: PURCHASES TAB (Inventory logic sub-tabs) ────────────────────── */}
        {activeTab === "inventory" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Sub-tabs toggles */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
              <button
                onClick={() => setPurchasesSubTab("receiving")}
                className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                  purchasesSubTab === "receiving" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600 bg-transparent border-none"
                }`}
              >
                Log Penerimaan Supplier
              </button>
              <button
                onClick={() => setPurchasesSubTab("opname")}
                className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                  purchasesSubTab === "opname" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600 bg-transparent border-none"
                }`}
              >
                Stock Opname Fisik
              </button>
              <button
                onClick={() => setPurchasesSubTab("adjustment")}
                className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                  purchasesSubTab === "adjustment" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600 bg-transparent border-none"
                }`}
              >
                Adjustment Stok (Manual)
              </button>
              <button
                onClick={() => setPurchasesSubTab("movements")}
                className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                  purchasesSubTab === "movements" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600 bg-transparent border-none"
                }`}
              >
                Log Mutasi Stok Ledger
              </button>
            </div>

            {/* Sub-tab 1: Log Penerimaan */}
            {purchasesSubTab === "receiving" && (
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Penerimaan Log Ritel</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Catatan riwayat pasokan barang masuk dari supplier.</p>
                  </div>
                  <Button
                    onClick={() => setIsReceivingModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer border-none"
                  >
                    <IconPlus size={16} /> Terima Barang Masuk
                  </Button>
                </div>

                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-none">
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">No. Faktur</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Supplier</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Diterima Pada</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Catatan</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Petugas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">Belum ada rekaman penerimaan.</TableCell>
                      </TableRow>
                    ) : (
                      receivings.map((rec) => (
                        <TableRow key={rec.id} className="border-b border-slate-100">
                          <TableCell className="font-bold text-slate-900 text-xs">{rec.nomor_faktur || `REC-${rec.id}`}</TableCell>
                          <TableCell className="font-bold text-slate-800 text-xs">{rec.supplier}</TableCell>
                          <TableCell className="text-slate-500 text-xs font-medium">{new Date(rec.created_at).toLocaleString("id-ID")}</TableCell>
                          <TableCell className="text-slate-500 text-xs font-medium">{rec.catatan || "-"}</TableCell>
                          <TableCell className="text-slate-800 text-xs font-bold">{rec.user?.name || "Petugas"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}

            {/* Sub-tab 2: Stock Opname */}
            {purchasesSubTab === "opname" && (
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Stock Opname Fisik</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Penyesuaian stok sistem dengan hitungan fisik lapangan.</p>
                  </div>
                  <Button
                    onClick={openNewOpname}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer border-none"
                  >
                    <IconPlus size={16} /> Buat Opname Baru
                  </Button>
                </div>

                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-none">
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">No. Opname</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Tanggal</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Catatan</TableHead>
                      <TableHead className="text-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-center w-24 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opnames.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">Belum ada rekaman stock opname.</TableCell>
                      </TableRow>
                    ) : (
                      opnames.map((op) => (
                        <TableRow key={op.id} className="border-b border-slate-100">
                          <TableCell className="font-bold text-slate-900 text-xs">{op.nomor_opname}</TableCell>
                          <TableCell className="text-slate-500 text-xs font-medium">{new Date(op.created_at).toLocaleString("id-ID")}</TableCell>
                          <TableCell className="text-slate-550 text-xs font-medium">{op.catatan || "-"}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                op.status === "completed"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {op.status === "completed" ? "Completed" : "Draft"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await apiFetch(`/v1/inventory/opname/${op.id}`);
                                    const data = await res.json();
                                    if (res.ok) {
                                      setSelectedOpname(data.data || data);
                                      setIsDetailOpnameOpen(true);
                                    } else {
                                      setSelectedOpname(op);
                                      setIsDetailOpnameOpen(true);
                                    }
                                  } catch {
                                    setSelectedOpname(op);
                                    setIsDetailOpnameOpen(true);
                                  }
                                }}
                                className="text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors border-none cursor-pointer"
                              >
                                Detail
                              </button>
                              {op.status === "draft" && (
                                <button
                                  onClick={() => handleFinalizeExistingOpname(op.id, op.items || [])}
                                  className="text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-lg transition-colors border-none cursor-pointer"
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
              </Card>
            )}

            {/* Sub-tab 3: Manual Adjustment */}
            {purchasesSubTab === "adjustment" && (
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Penyesuaian Manual</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Koreksi stok instan untuk barang rusak, hilang, atau kadaluarsa.</p>
                  </div>
                  <Button
                    onClick={() => setIsAdjustmentOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer border-none"
                  >
                    <IconPlus size={16} /> Buat Penyesuaian
                  </Button>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-5 rounded-2xl max-w-md">
                  <h4 className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                    <IconAlertTriangle className="text-amber-500" size={16} />
                    <span>Catatan Penting</span>
                  </h4>
                  <p className="leading-relaxed">
                    Setiap penyesuaian manual akan memicu pencatatan ledger mutasi stok baru dan langsung mengubah stok produk di katalog.
                  </p>
                </div>
              </Card>
            )}

            {/* Sub-tab 4: Movements Ledger */}
            {purchasesSubTab === "movements" && (
              <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Mutasi Stok Ledger</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Jurnal kronologis seluruh aliran pergerakan stok barang.</p>
                </div>

                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-none">
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">ID</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Nama Produk</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Jenis</TableHead>
                      <TableHead className="text-right text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Qyt Mutasi</TableHead>
                      <TableHead className="text-right text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Stok Sebelum</TableHead>
                      <TableHead className="text-right text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Stok Sesudah</TableHead>
                      <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Alasan / Referensi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-slate-400 text-xs">Belum ada jurnal mutasi terekam.</TableCell>
                      </TableRow>
                    ) : (
                      movements.map((mov) => (
                        <TableRow key={mov.id} className="border-b border-slate-100">
                          <TableCell className="font-bold text-slate-950 text-xs">#{mov.id}</TableCell>
                          <TableCell className="font-bold text-slate-900 text-xs">{mov.product?.nama || "Produk dihapus"}</TableCell>
                          <TableCell className="text-xs">
                            <span
                              className={`text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                mov.tipe === "sale"
                                  ? "bg-slate-100 text-slate-700"
                                  : mov.tipe === "receiving"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : mov.tipe === "adjustment"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-indigo-50 text-indigo-600" // void/opname
                              }`}
                            >
                              {mov.tipe}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-black text-xs tabular-nums text-slate-900">
                            {mov.kuantitas > 0 ? `+${mov.kuantitas}` : mov.kuantitas}
                          </TableCell>
                          <TableCell className="text-right text-slate-500 text-xs tabular-nums font-semibold">{mov.stok_sebelum} pcs</TableCell>
                          <TableCell className="text-right text-slate-950 text-xs tabular-nums font-bold">{mov.stok_sesudah} pcs</TableCell>
                          <TableCell className="text-slate-500 text-xs font-semibold">{mov.alasan || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        )}

        {/* ─── TAB 4: CUSTOMERS / USERS TAB (CRUD) ────────────────────────────────── */}
        {activeTab === "users" && (
          <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Database Pengguna & Petugas POS</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Daftar akun login kasir, supervisor, dan manajer toko.</p>
              </div>
              <Button
                onClick={openAddUser}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer border-none"
              >
                <IconPlus size={16} /> Daftar Pengguna Baru
              </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-grow max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  type="text"
                  placeholder="Cari user berdasarkan nama atau username..."
                  className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-slate-950 rounded-xl bg-white"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-none">
                  <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Nama Lengkap</TableHead>
                  <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Username</TableHead>
                  <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Store ID</TableHead>
                  <TableHead className="text-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Hak Peran (Role)</TableHead>
                  <TableHead className="text-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-center w-24 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">Tidak ada user ditemukan.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="border-b border-slate-100">
                      <TableCell className="font-bold text-slate-900 text-xs">{u.name}</TableCell>
                      <TableCell className="font-bold text-slate-550 text-xs">{u.username}</TableCell>
                      <TableCell className="text-slate-500 text-xs font-semibold">{u.store_id || "1"}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {u.roles[0]?.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          u.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {u.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
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
          </Card>
        )}

        {/* ─── TAB 5: ANALYTICS TAB (Daily reports summary picker) ────────────────── */}
        {activeTab === "reports" && (
          <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Laporan Penjualan Harian</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Analisis performa transaksi per kasir dan metode pembayaran.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Pilih Tanggal:</label>
                <Input
                  type="date"
                  className="h-9 text-xs w-36 border-slate-200 focus-visible:ring-slate-950 rounded-xl bg-white"
                  value={selectedReportDate}
                  onChange={(e) => setSelectedReportDate(e.target.value)}
                />
              </div>
            </div>

            {dailyReport ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Omset Harian</div>
                    <div className="text-xl font-black text-slate-950 mt-1">{formatRupiah(dailyReport.total_sales)}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Transaksi Sukses</div>
                    <div className="text-xl font-black text-slate-950 mt-1">{dailyReport.transactions_count} Trx</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Rerata Nilai Struk</div>
                    <div className="text-xl font-black text-slate-950 mt-1">{formatRupiah(dailyReport.average_transaction_value)}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Transaksi Void</div>
                    <div className="text-xl font-black text-rose-500 mt-1">{dailyReport.void_count} Void</div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div>
                  <h4 className="text-xs font-black text-slate-900 mb-3 uppercase tracking-wider">Breakdown Metode Pembayaran</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(dailyReport.payment_methods || {}).map((method) => {
                      const pm = dailyReport.payment_methods[method];
                      return (
                        <div key={method} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/20 flex justify-between items-center">
                          <div>
                            <div className="text-xs font-black uppercase text-slate-600 capitalize">{method}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{pm.count} Transaksi</div>
                          </div>
                          <span className="font-black text-sm text-slate-950">{formatRupiah(pm.total)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Products */}
                <div>
                  <h4 className="text-xs font-black text-slate-900 mb-3 uppercase tracking-wider">10 Produk Terlaris Hari Ini</h4>
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="border-none">
                        <TableHead className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Nama Produk</TableHead>
                        <TableHead className="text-right text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Jumlah Terjual</TableHead>
                        <TableHead className="text-right text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyReport.top_products && dailyReport.top_products.length > 0 ? (
                        dailyReport.top_products.map((tp: any, i: number) => (
                          <TableRow key={i} className="border-b border-slate-100">
                            <TableCell className="font-bold text-slate-900 text-xs">{tp.product_name}</TableCell>
                            <TableCell className="text-right text-xs font-black tabular-nums">{tp.quantity} pcs</TableCell>
                            <TableCell className="text-right text-xs font-black text-indigo-600 tabular-nums">
                              {formatRupiah(tp.revenue)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-slate-400 text-xs">
                            Belum ada item terjual pada tanggal ini.
                          </TableCell>
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
        )}

        {/* ─── TAB 6: SETTINGS TAB (Store profile settings) ───────────────────────── */}
        {activeTab === "settings" && (
          <Card className="bg-white border-none rounded-3xl shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Pengaturan Profil Toko</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Identitas toko POS ritel terhubung database.</p>
            </div>
            <div className="text-xs text-slate-600 bg-slate-55 p-5 rounded-2xl border border-slate-100 max-w-md space-y-2.5">
              <p className="font-extrabold text-slate-900 text-sm">Profil Toko Aktif</p>
              <div className="space-y-1 mt-2">
                <p>ID Store Terdaftar: <strong className="font-mono text-slate-950 font-bold">{user.store_id || "1 (Toko Utama)"}</strong></p>
                <p>Koneksi Database: <span className="text-emerald-600 font-bold">Terhubung PostgreSQL</span></p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Sistem admin terhubung langsung dengan REST API database terpusat untuk sinkronisasi inventory real-time.
              </p>
            </div>
          </Card>
        )}

      </main>

      {/* ==============================================================================
           MODAL DIALOG: TAMBAH/EDIT PRODUK
           ============================================================================== */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-[440px] bg-white rounded-3xl border-none p-6 shadow-xl">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <IconPlus size={20} className="text-slate-900" />
              <span>{editingProduct ? "Edit Detail Produk" : "Tambah Produk Baru"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProductSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Barcode / SKU</label>
              <Input
                type="text"
                placeholder="Contoh: 8990002004"
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={newProductBarcode}
                onChange={(e) => setNewProductBarcode(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Produk</label>
              <Input
                type="text"
                placeholder="Nama produk lengkap..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Merek</label>
              <Input
                type="text"
                placeholder="Merek produk..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={newProductBrand}
                onChange={(e) => setNewProductBrand(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Harga Jual (Rp)</label>
                <Input
                  type="number"
                  placeholder="3500"
                  className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stok</label>
                <Input
                  type="number"
                  placeholder="50"
                  className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4 border-none"
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
        <DialogContent className="max-w-[440px] bg-white rounded-3xl border-none p-6 shadow-xl">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <IconPlus size={20} className="text-slate-900" />
              <span>{editingUser ? "Edit Profil Pengguna" : "Daftarkan Pengguna Baru"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUserSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
              <Input
                type="text"
                placeholder="Nama user lengkap..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Username</label>
              <Input
                type="text"
                placeholder="Username untuk login..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={userUsername}
                onChange={(e) => setUserUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Password {editingUser && "(Kosongkan jika tidak diubah)"}
              </label>
              <Input
                type="password"
                placeholder="Password minimal 6 karakter..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Role Peran</label>
                <select
                  className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-bold px-3 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                <select
                  className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-bold px-3 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
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
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4 border-none"
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
        <DialogContent className="max-w-[440px] bg-white rounded-3xl border-none p-6 shadow-xl">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <IconActivity size={20} className="text-slate-900" />
              <span>Penyesuaian Stok Manual</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustmentSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pilih Produk</label>
              <select
                className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs font-bold px-3 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                value={adjProductId}
                onChange={(e) => setAdjProductId(e.target.value)}
              >
                <option value="">-- Pilih Produk Terdaftar --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} (Stok: {p.stok} pcs)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty Mutasi (Gunakan negatif untuk pengurangan)</label>
              <Input
                type="number"
                placeholder="Contoh: -5 untuk barang hilang/rusak"
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={adjQty}
                onChange={(e) => setAdjQty(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alasan Penyesuaian</label>
              <Input
                type="text"
                placeholder="Contoh: Barang Rusak di Display / Kadaluarsa"
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4 border-none"
            >
              Simpan Penyesuaian
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           MODAL DIALOG: PENERIMAAN BARANG SUPPLIER
           ============================================================================== */}
      <Dialog open={isReceivingModalOpen} onOpenChange={setIsReceivingModalOpen}>
        <DialogContent className="max-w-[580px] bg-white rounded-3xl border-none p-6 shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <IconTruckDelivery size={20} className="text-slate-900" />
              <span>Formulir Penerimaan Pasokan Supplier</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReceivingSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Supplier</label>
                <Input
                  type="text"
                  placeholder="Nama PT / Distributor..."
                  className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                  value={recSupplier}
                  onChange={(e) => setRecSupplier(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nomor Faktur / Ref (Opsional)</label>
                <Input
                  type="text"
                  placeholder="Contoh: INV/Supplier/2026"
                  className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                  value={recFaktur}
                  onChange={(e) => setRecFaktur(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Catatan Tambahan</label>
              <Input
                type="text"
                placeholder="Catatan penerimaan..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={recNote}
                onChange={(e) => setRecNote(e.target.value)}
              />
            </div>

            {/* List Item Rows */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Daftar Produk Masuk</span>
                <button
                  type="button"
                  onClick={addRecItemRow}
                  className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 bg-transparent border-none cursor-pointer"
                >
                  + Tambah Baris
                </button>
              </div>

              {recItems.map((rowItem, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100/60">
                  <div className="flex-grow select-wrapper">
                    <select
                      className="w-full h-9 border border-slate-200 rounded-lg bg-white text-xs font-bold px-2 focus:outline-none"
                      value={rowItem.product_id}
                      onChange={(e) => handleRecItemChange(idx, "product_id", e.target.value)}
                    >
                      <option value="">-- Pilih Produk --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Qty"
                      className="h-9 text-xs border-slate-200 rounded-lg bg-white"
                      value={rowItem.kuantitas}
                      onChange={(e) => handleRecItemChange(idx, "kuantitas", e.target.value)}
                    />
                  </div>

                  {recItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRecItemRow(idx)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <IconX size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4 border-none"
            >
              Simpan Penerimaan Barang
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           MODAL DIALOG: BUAT OPNAME BARU
           ============================================================================== */}
      <Dialog open={isOpnameModalOpen} onOpenChange={setIsOpnameModalOpen}>
        <DialogContent className="max-w-[660px] bg-white rounded-3xl border-none p-6 shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <IconClipboardCheck size={20} className="text-slate-900" />
              <span>Pembuatan Formulir Stock Opname Baru</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Catatan Opname</label>
              <Input
                type="text"
                placeholder="Catatan tujuan opname..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                value={opnameNote}
                onChange={(e) => setOpnameNote(e.target.value)}
              />
            </div>

            <div className="space-y-2.5 border-t border-slate-100 pt-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Hitungan Stok Fisik Lapangan
              </span>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {opnameItems.map((item, idx) => (
                  <div key={item.product_id} className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-3 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-[11px] font-bold text-slate-900 truncate">{item.nama}</span>
                    <span className="text-[10px] text-slate-400 font-bold text-center">Sistem: {item.stok_sistem} pcs</span>
                    <Input
                      type="number"
                      placeholder="Fisik"
                      className="h-9 text-xs border-slate-200 rounded-lg bg-white"
                      value={item.stok_fisik}
                      onChange={(e) => handleOpnameItemChange(idx, "stok_fisik", e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Alasan selisih..."
                      className="h-9 text-xs border-slate-200 rounded-lg bg-white"
                      value={item.alasan}
                      onChange={(e) => handleOpnameItemChange(idx, "alasan", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Button
                type="button"
                onClick={(e) => handleOpnameSubmit(e, "draft")}
                className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer border-none"
              >
                Simpan sebagai Draf
              </Button>
              <Button
                type="button"
                onClick={(e) => handleOpnameSubmit(e, "completed")}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl cursor-pointer border-none"
              >
                Finalisasi Opname Fisik
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==============================================================================
           MODAL DIALOG: DETAIL OPNAME
           ============================================================================== */}
      <Dialog open={isDetailOpnameOpen} onOpenChange={setIsDetailOpnameOpen}>
        <DialogContent className="max-w-[560px] bg-white rounded-3xl border-none p-6 shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-black text-slate-900">
              Detail Stock Opname: {selectedOpname?.nomor_opname}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-3 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p>Status: <strong className="uppercase font-extrabold text-indigo-600">{selectedOpname?.status || "-"}</strong></p>
              <p>Tanggal: <strong>{selectedOpname ? new Date(selectedOpname.created_at).toLocaleString("id-ID") : "-"}</strong></p>
              <p className="col-span-2">Catatan: <strong>{selectedOpname?.catatan || "-"}</strong></p>
              <p className="col-span-2">Petugas: <strong>{selectedOpname?.user?.name || "Sistem"}</strong></p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Item Terdata</span>
              <div className="max-h-[260px] overflow-y-auto space-y-2">
                {selectedOpname?.items && selectedOpname.items.length > 0 ? (
                  selectedOpname.items.map((item: any, idx: number) => {
                    const selisih = (item.stok_fisik ?? 0) - (item.stok_sistem ?? 0);
                    return (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div>
                          <p className="font-extrabold text-slate-900">{item.product?.nama || item.nama_produk || "Produk"}</p>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Alasan: {item.alasan || "-"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">Fisik: {item.stok_fisik} pcs</p>
                          <p className={`text-[10px] font-bold ${selisih < 0 ? "text-rose-500" : selisih > 0 ? "text-emerald-500" : "text-slate-400"}`}>
                            Selisih: {selisih > 0 ? `+${selisih}` : selisih} pcs
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-4 text-slate-400 text-xs">Tidak ada item tercatat dalam opname ini.</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
