"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";
import { settingsApi } from "@/features/settings/api/settings-api";
import { useCashAccounts } from "@/features/cash/api/cash-api";

interface StoreSettingsForm {
    app_name: string;
    app_address: string;
    app_phone: string;
    app_logo_url: string | File;
    tax_rate_ppn: string;
    cash_account_register_uid: string;
    cash_account_main_uid: string;
    cash_account_bank_uid: string;
}

export function StoreProfile() {
    const { data: session } = useSession();
    const user = session?.user;

    const { settings, fetchSettings, isLoading: isSettingsLoading } = useSettingsStore();
    const { data: cashAccountsData, isLoading: isCashAccountsLoading } = useCashAccounts();
    const cashAccounts = cashAccountsData || [];

    const [formData, setFormData] = useState<StoreSettingsForm>({
        app_name: "",
        app_address: "",
        app_phone: "",
        app_logo_url: "",
        tax_rate_ppn: "",
        cash_account_register_uid: "",
        cash_account_main_uid: "",
        cash_account_bank_uid: "",
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({
            app_name: settings.app_name || "",
            app_address: settings.app_address || "",
            app_phone: settings.app_phone || "",
            app_logo_url: settings.app_logo_url || "",
            tax_rate_ppn: settings.tax_rate_ppn || "",
            cash_account_register_uid: settings.cash_account_register_uid || "",
            cash_account_main_uid: settings.cash_account_main_uid || "",
            cash_account_bank_uid: settings.cash_account_bank_uid || "",
        });
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name as keyof StoreSettingsForm]: e.target.value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({
                ...prev,
                [e.target.name as keyof StoreSettingsForm]: e.target.files![0],
            }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            for (const key of Object.keys(formData) as Array<keyof StoreSettingsForm>) {
                if (settings[key] !== formData[key]) {
                    await settingsApi.update(key, formData[key]);
                }
            }
            await fetchSettings();
            toast.success("Pengaturan toko berhasil disimpan.");
        } catch (error) {
            toast.error("Gagal menyimpan pengaturan.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isSettingsLoading || isCashAccountsLoading) {
        return <div className="p-6">Memuat pengaturan...</div>;
    }

    return (
        <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-50 pb-2">
                <h3 className="text-sm font-bold text-slate-900">
                    Pengaturan Profil Toko
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    Konfigurasi nama toko, alamat, pajak, dan kas default.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="space-y-1">
                    <label className="font-semibold block">Nama Toko</label>
                    <input 
                        type="text" 
                        name="app_name" 
                        value={formData.app_name} 
                        onChange={handleChange} 
                        className="w-full border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                        required 
                    />
                </div>
                <div className="space-y-1">
                    <label className="font-semibold block">Nomor Telepon</label>
                    <input 
                        type="text" 
                        name="app_phone" 
                        value={formData.app_phone} 
                        onChange={handleChange} 
                        className="w-full border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500" 
                    />
                </div>
                <div className="space-y-1 md:col-span-2">
                    <label className="font-semibold block">Alamat Toko</label>
                    <input 
                        type="text" 
                        name="app_address" 
                        value={formData.app_address} 
                        onChange={handleChange} 
                        className="w-full border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                        required 
                    />
                </div>
                <div className="space-y-1 md:col-span-2">
                    <label className="font-semibold block">Logo Toko (Opsional)</label>
                    <div className="flex items-center gap-4">
                        {settings.app_logo_url && typeof formData.app_logo_url === 'string' && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={settings.app_logo_url} alt="Logo" className="w-12 h-12 object-contain bg-slate-100 rounded border border-slate-200" />
                        )}
                        <input 
                            type="file" 
                            name="app_logo_url" 
                            accept="image/*"
                            onChange={handleFileChange} 
                            className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500" 
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="font-semibold block">Tarif Pajak PPN (%)</label>
                    <input 
                        type="number" 
                        name="tax_rate_ppn" 
                        value={formData.tax_rate_ppn} 
                        onChange={handleChange} 
                        min="0"
                        max="100"
                        className="w-full border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                        required 
                    />
                </div>
            </div>

            <div className="border-t border-slate-50 pt-4 mt-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Pengaturan Kas Default
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                    <div className="space-y-1">
                        <label className="font-semibold block">Kas Kasir (Register)</label>
                        <select 
                            name="cash_account_register_uid" 
                            value={formData.cash_account_register_uid} 
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Pilih Akun Kas</option>
                            {cashAccounts.map((account) => (
                                <option key={account.uid} value={account.uid}>{account.nama}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="font-semibold block">Kas Utama (Main)</label>
                        <select 
                            name="cash_account_main_uid" 
                            value={formData.cash_account_main_uid} 
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Pilih Akun Kas</option>
                            {cashAccounts.map((account) => (
                                <option key={account.uid} value={account.uid}>{account.nama}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="font-semibold block">Saldo Bank</label>
                        <select 
                            name="cash_account_bank_uid" 
                            value={formData.cash_account_bank_uid} 
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Pilih Akun Kas</option>
                            {cashAccounts.map((account) => (
                                <option key={account.uid} value={account.uid}>{account.nama}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
            </div>
        </form>
    );
}
