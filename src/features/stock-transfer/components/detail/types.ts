export interface ReceiveItemFormValue {
  product_uid: string;
  kuantitas_diterima: number;
  kuantitas_return?: number;
  keterangan?: string;
  status?: "received" | "rejected" | null;
  jenis_selisih?: "salah_input" | "rusak" | "hilang" | null;
}

export interface ReceiveFormValues {
  items: ReceiveItemFormValue[];
}
