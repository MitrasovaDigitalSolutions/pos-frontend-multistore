"use client";

import React, { useState } from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useJournalTutorialStore } from "@/stores/journal-tutorial-store";
import type { JournalTutorialAutoFill } from "../types/journal-tutorial";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";

async function simulateFill(targetSelector: string, text: string, fillIfEmpty?: boolean) {
    if (typeof document === "undefined") return;
    const elements = Array.from(document.querySelectorAll(targetSelector));
    let container: Element | null = null;
    if (elements.length > 0) {
        container =
            elements.find((el) => {
                if (!(el instanceof HTMLElement || el instanceof SVGElement)) return false;
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            }) || elements[0];
    }

    const input = (container instanceof HTMLInputElement
        ? container
        : container?.querySelector("input, textarea, select")) as HTMLInputElement | null;
    if (!input) return;

    if (fillIfEmpty && input.value && input.value.trim() !== "" && input.value.trim() !== "0") {
        return;
    }

    input.focus();

    const tracker = (input as unknown as { _valueTracker?: { setValue: (v: string) => void } })._valueTracker;
    if (tracker) {
        tracker.setValue(input.value + "_force");
    }

    const nativeInputValueSetter =
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set ||
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), "value")?.set;

    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, text);
    } else {
        input.value = text;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    input.blur();
}

export function JournalTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useJournalTutorialStore((state) => state.stopTutorial);
    const [isFilling, setIsFilling] = useState(false);

    const step = props.step as unknown as {
        autoFill?: JournalTutorialAutoFill;
        data?: { autoFill?: JournalTutorialAutoFill };
    };
    const autoFill = step.data?.autoFill || step.autoFill;

    const handleAutoFillClick = async () => {
        if (!autoFill || isFilling) return;
        setIsFilling(true);
        try {
            if (autoFill.fields && autoFill.fields.length > 0) {
                for (const field of autoFill.fields) {
                    await simulateFill(field.target, field.value, autoFill.fillIfEmpty);
                }
            } else if (autoFill.target && autoFill.value) {
                await simulateFill(autoFill.target, autoFill.value, autoFill.fillIfEmpty);
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
                        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer disabled:opacity-50"
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
