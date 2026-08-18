"use client";

import { Suspense } from "react";
import { RequestTransferCreatePage } from "./request-transfer-create-page";

export function RequestTransferCreate() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat form request transfer...</div>}>
            <RequestTransferCreatePage />
        </Suspense>
    );
}
