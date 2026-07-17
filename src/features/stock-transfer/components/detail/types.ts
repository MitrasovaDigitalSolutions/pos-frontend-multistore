export interface ReceiveItemFormValue {
  product_uid: string;
  kuantitas_diterima: number;
  keterangan?: string;
}

export interface ReceiveFormValues {
  items: ReceiveItemFormValue[];
}
