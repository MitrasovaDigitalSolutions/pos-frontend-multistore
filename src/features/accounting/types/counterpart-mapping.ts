import type { ChartOfAccount } from "./index";

export interface CoaCounterpartMapping {
    uid: string;
    coa_uid: string;
    counterpart_coa_uid: string;
    keterangan: string | null;
    created_at?: string;
    updated_at?: string;
    coa?: ChartOfAccount | null;
    counterpart?: ChartOfAccount | null;
}

export interface CreateCoaCounterpartMappingInput {
    coa_uid: string;
    counterpart_coa_uid: string;
    keterangan?: string | null;
}

export interface UpdateCoaCounterpartMappingInput {
    coa_uid: string;
    counterpart_coa_uid: string;
    keterangan?: string | null;
}
