"use client";

import React, { useState } from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useProductsTutorialStore } from "@/stores/products-tutorial-store";
import type { ProductsTutorialAutoFill } from "../types/products-tutorial";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";

async function simulateFill(targetSelector: string, text: string) {
    const container = document.querySelector(targetSelector);
    const input = (container instanceof HTMLInputElement
        ? container
        : container?.querySelector("input, textarea, select")) as HTMLInputElement | null;
    if (!input) return;

    input.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
    )?.set;

    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, text);
    } else {
        input.value = text;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function ProductsTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useProductsTutorialStore((state) => state.stopTutorial);
    const [isFilling, setIsFilling] = useState(false);

    const step = props.step as unknown as { autoFill?: ProductsTutorialAutoFill; data?: { autoFill?: ProductsTutorialAutoFill } };
    const autoFill = step.data?.autoFill || step.autoFill;

    const handleAutoFillClick = async () => {
        if (!autoFill || isFilling) return;
        setIsFilling(true);
        try {
            if (autoFill.fields && autoFill.fields.length > 0) {
                for (const field of autoFill.fields) {
                    await simulateFill(field.target, field.value);
                }
            } else if (autoFill.target && autoFill.value) {
                await simulateFill(autoFill.target, autoFill.value);
            }
        } finally {
            setIsFilling(false);
        }
    };

    // If autoFill is specified, augment step content with quick auto-fill button
    const enhancedStep = {
        ...props.step,
        content: (
            <div>
                <div>{props.step.content}</div>
                {autoFill && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">Contoh Input:</span>
                        <button
                            type="button"
                            onClick={handleAutoFillClick}
                            disabled={isFilling}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                        >
                            {isFilling ? (
                                <IconLoader2 size={12} className="animate-spin text-emerald-600" />
                            ) : (
                                <IconSparkles size={12} className="text-emerald-600 animate-pulse" />
                            )}
                            <span>{autoFill.label || "✨ Isi Otomatis"}</span>
                        </button>
                    </div>
                )}
            </div>
        ),
    };

    return (
        <CompactTutorialTooltip
            {...props}
            step={enhancedStep}
            onStop={stopTutorial}
        />
    );
}
