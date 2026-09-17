"use client";

import React, { useState } from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useMembersTutorialStore } from "@/stores/members-tutorial-store";
import type { MembersTutorialAutoFill } from "../types/members-tutorial";
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

export function MembersTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useMembersTutorialStore((state) => state.stopTutorial);
    const [isFilling, setIsFilling] = useState(false);

    const step = props.step as unknown as { autoFill?: MembersTutorialAutoFill; data?: { autoFill?: MembersTutorialAutoFill } };
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

    const enhancedStep = {
        ...props.step,
        content: (
            <div>
                <div>{props.step.content}</div>
                {autoFill && (
                    <button
                        type="button"
                        onClick={handleAutoFillClick}
                        disabled={isFilling}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isFilling ? (
                            <IconLoader2 size={13} className="animate-spin" />
                        ) : (
                            <IconSparkles size={13} />
                        )}
                        {autoFill.label || "Auto-Fill Demo"}
                    </button>
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
