"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconShoppingCart, IconUser, IconLock, IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin_pos");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username dan password wajib diisi!");
      return;
    }

    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login berhasil! Selamat datang, Kasir Budi.");
      router.push("/checkout");
    }, 1200);
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-indigo-50/50 p-6 min-h-screen">
      <Card className="w-full max-w-[400px] shadow-xl border-slate-100 rounded-2xl animate-fade-in">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto w-12 h-12 bg-indigo-100/80 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4">
            <IconShoppingCart size={24} />
          </div>
          <CardTitle className="text-lg font-bold text-slate-900">GroceryPOS</CardTitle>
          <CardDescription className="text-xs text-slate-400">Sistem Point of Sale Supermarket</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Username / Email
              </label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="text"
                  placeholder="Masukkan username..."
                  className="pl-10 h-11 bg-slate-50/50 focus-visible:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-indigo-600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password..."
                  className="pl-10 pr-10 h-11 bg-slate-50/50 focus-visible:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-indigo-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-md shadow-indigo-600/10 active:scale-[0.99] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="animate-spin" size={18} />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <span>Masuk Ke Aplikasi</span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center border-t border-slate-50 pt-6 pb-6 bg-slate-50/30 rounded-b-2xl">
          <div className="text-[11px] text-slate-400 text-center">
            Default Akun: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">admin_pos</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">password</code>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
