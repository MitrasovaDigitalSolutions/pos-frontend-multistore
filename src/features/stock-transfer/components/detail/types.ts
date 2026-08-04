export interface ReceiveItemFormValue {
  product_uid: string;
  kuantitas_diterima: number;
  keterangan?: string;
  status?: "received" | "rejected";
  jenis_selisih?: "salah_input" | "rusak" | "hilang" | null;
}

export interface ReceiveFormValues {
  items: ReceiveItemFormValue[];
}
