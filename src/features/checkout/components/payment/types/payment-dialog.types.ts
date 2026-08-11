import type { Receipt, CartItem } from "@/features/checkout/types";
import type { Member } from "@/features/master/members/types";

export type PaymentMode = "cash" | "card" | "debt";

export interface PaymentFormValues {
    cashReceived: number | null;
    cardAmount: number | null;
    cardType: string;
    cardLast4: string;
    cardRef: string;
}

export interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    grandTotal: number;
    cartItems: { product_uid: string; quantity: number; harga_satuan?: number }[];
    discount: number;
    tax: number;
    selectedMember: Member | null;
    onPaySuccess: (receipt: Receipt) => void;
    cartList: CartItem[];
    onLocalProductsReload?: () => void;
    namaTransaksi: string;
}

export interface PaymentModeOption {
    key: PaymentMode;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    activeColor: "emerald" | "indigo" | "rose";
}
