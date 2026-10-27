import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconLock, IconPlus } from "@tabler/icons-react";

interface ProductTableHeaderProps {
    hasManageProducts: boolean;
    canCreateProduct: boolean;
    isCentralStore: boolean;
    onAddClick: () => void;
}

export function ProductTableHeader({
    hasManageProducts,
    canCreateProduct,
    isCentralStore,
    onAddClick,
}: ProductTableHeaderProps) {
    return (
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div>
                <h3 className="text-sm font-bold text-slate-900">
                    Daftar Produk
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    Manajemen inventori produk aktif dan SKU.
                </p>
            </div>
            <div className="flex items-center gap-2">
                {hasManageProducts && (
                    canCreateProduct ? (
                        <Button
                            id="btn-tambah-produk-master"
                            onClick={onAddClick}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                        >
                            <IconPlus size={16} /> Tambah Produk
                        </Button>
                    ) : (
                        <TooltipProvider delayDuration={150}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0} className="inline-block cursor-not-allowed">
                                        <Button
                                            id="btn-tambah-produk-master"
                                            disabled
                                            className="bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-not-allowed opacity-75"
                                        >
                                            <IconLock size={15} /> Tambah Produk
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs text-xs">
                                    Pembuatan produk baru di toko cabang dinonaktifkan oleh Pusat.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                )}
                {!isCentralStore && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Produk Dikelola Pusat
                    </span>
                )}
            </div>
        </div>
    );
}
