"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useJournalTutorialStore } from "@/stores/journal-tutorial-store";
import { JOURNAL_TUTORIAL_STEPS } from "../steps";
import type { JournalTutorialId, JournalTutorialStep } from "../types/journal-tutorial";
import { toast } from "sonner";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";

function getVisibleElement(selector: string): Element | null {
    if (typeof document === "undefined" || !selector) return null;
    if (selector === "body") return document.body;
    const elements = Array.from(document.querySelectorAll(selector));
    if (elements.length === 0) return null;

    const visible = elements.find((el) => {
        if (!(el instanceof HTMLElement || el instanceof SVGElement)) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return false;
        if (el instanceof HTMLElement && el.offsetParent === null && window.getComputedStyle(el).position !== "fixed") {
            return false;
        }
        return true;
    });

    return visible || elements[0];
}

async function waitForElement(
    selector: string,
    timeout = 2500,
    fallbackSelector?: string
): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    if (selector === "body") return document.body;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = getVisibleElement(selector);
        if (el) return el;
        await new Promise((r) => setTimeout(r, 50));
    }
    const primary = getVisibleElement(selector);
    if (primary) return primary;
    if (fallbackSelector) {
        return getVisibleElement(fallbackSelector);
    }
    return null;
}

function triggerSimulateClick(target: string | { selector: string }) {
    if (typeof document === "undefined") return;
    const selector = typeof target === "string" ? target : target?.selector;
    if (!selector) return;
    const el = getVisibleElement(selector) as HTMLElement | null;
    if (el) {
        const isInteractive = el.matches("button, a, input, select, textarea, [role='button']");
        const clickTarget = isInteractive
            ? el
            : el.querySelector<HTMLElement>("button, a, input, [role='button'], select, textarea") || el;
        clickTarget.click();
    }
}

function closeDialogsByTitle(titles: string[]) {
    if (typeof document === "undefined") return;
    const dialogs = Array.from(document.querySelectorAll<HTMLElement>("[role='dialog']"));
    for (const dialog of dialogs) {
        const text = dialog.innerText || "";
        const matchesTitle = titles.some((title) => text.includes(title));
        if (!matchesTitle) continue;

        const buttons = Array.from(dialog.querySelectorAll<HTMLElement>("button, [data-slot='dialog-close']"));

        let closeBtn = buttons.find((btn) => {
            const btnText = (btn.innerText || "").trim().toLowerCase();
            return btnText === "tutup" || btnText === "batal" || btnText.includes("tutup") || btnText.includes("batal");
        });

        if (!closeBtn) {
            closeBtn = buttons.find((btn) => {
                const label = (btn.getAttribute("aria-label") || "").toLowerCase();
                return label.includes("close") || label.includes("tutup") || label.includes("batal");
            });
        }

        if (!closeBtn) {
            closeBtn = dialog.querySelector<HTMLElement>("[data-slot='dialog-close']") || undefined;
        }

        if (closeBtn) {
            closeBtn.click();
        }
    }
}

function resolveStepTargetSelector(step: JournalTutorialStep): string {
    if (typeof document === "undefined" || !step.target) return step.target || "body";
    if (step.target === "body") return "body";
    const primary = getVisibleElement(step.target);
    if (primary) return step.target;
    if (step.fallbackTarget) {
        const fallback = getVisibleElement(step.fallbackTarget);
        if (fallback) return step.fallbackTarget;
    }
    return step.target;
}

export function useJournalTutorial() {
    const activeTutorial = useJournalTutorialStore((state) => state.activeTutorial);
    const stepIndex = useJournalTutorialStore((state) => state.stepIndex);
    const isRunning = useJournalTutorialStore((state) => state.isRunning);

    const rawStartTutorial = useJournalTutorialStore((state) => state.startTutorial);
    const stopTutorial = useJournalTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useJournalTutorialStore((state) => state.setStepIndex);
    const updateCursor = useJournalTutorialStore((state) => state.updateCursor);
    const triggerCursorClick = useJournalTutorialStore((state) => state.triggerCursorClick);

    const startTutorial = useCallback(
        (id: JournalTutorialId) => {
            if (id === "buat_jurnal") {
                if (typeof window !== "undefined" && !window.location.search.includes("action=new")) {
                    toast.error(
                        "Gunakan tombol 'Buat Jurnal' di halaman List Jurnal atau buka rute dengan ?action=new untuk memulai simulasi ini."
                    );
                    return false;
                }
            }
            rawStartTutorial(id);
            return true;
        },
        [rawStartTutorial]
    );

    const tutorialSteps: JournalTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return JOURNAL_TUTORIAL_STEPS[activeTutorial] || [];
    }, [activeTutorial]);

    const positionCursorAt = useCallback(
        (targetSelector: string, fallbackSelector?: string) => {
            if (!targetSelector || targetSelector === "body") {
                updateCursor({ visible: false });
                return;
            }
            let el = getVisibleElement(targetSelector);
            if (!el && fallbackSelector) {
                el = getVisibleElement(fallbackSelector);
            }
            if (el) {
                const rect = el.getBoundingClientRect();
                updateCursor({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    visible: true,
                });
            } else {
                updateCursor({ visible: false });
            }
        },
        [updateCursor]
    );

    // Polling posisi target tiap 500ms saat running
    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            const currentStep = tutorialSteps[stepIndex];
            if (currentStep?.target) {
                positionCursorAt(currentStep.target, currentStep.fallbackTarget);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [isRunning, stepIndex, tutorialSteps, positionCursorAt]);

    const cleanupAndRestore = useCallback(() => {
        updateCursor({ visible: false, label: undefined });
    }, [updateCursor]);

    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    const joyrideSteps: Step[] = useMemo(() => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

        return tutorialSteps.map((s, index) => {
            const isOverlayNav = Boolean(s.overlayNav || s.variant === "overlay_nav" || s.variant === "banner");
            const activeTarget = resolveStepTargetSelector(s);
            return {
                target: activeTarget,
                title: s.title,
                content: s.content,
                placement:
                    isMobile && (s.placement === "left" || s.placement === "right")
                        ? "auto"
                        : s.placement || "bottom",
                disableBeacon: true,
                skipBeacon: true,
                skipScroll: true,
                spotlightClicks: s.spotlightClicks ?? true,
                spotlightPadding: 6,
                data: {
                    autoFill: s.autoFill,
                    simulateClick: s.simulateClick,
                    overlayNav: isOverlayNav,
                    variant: s.variant || (isOverlayNav ? "overlay_nav" : "tooltip"),
                    isLastStep: s.isLastStep,
                    nextLabel: s.nextLabel,
                    showNext: s.showNext,
                    showBack: s.showBack,
                },
                floatingOptions: {
                    strategy: "fixed",
                },
                before: async () => {
                    if (s.id === "mj-step-4") {
                        if (!getVisibleElement(".coa-picker-select-btn")) {
                            triggerSimulateClick("#mj-coa-trigger-0");
                            await waitForElement(".coa-picker-select-btn", 2500);
                        }
                    }
                    if (s.id?.startsWith("mj-step-") && index >= 4) {
                        closeDialogsByTitle(["Pilih Akun", "Lawan Akun"]);
                    }
                    if (typeof document !== "undefined" && s.target && s.target !== "body") {
                        const el = await waitForElement(s.target, 1500, s.fallbackTarget);
                        if (el) {
                            el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                            window.dispatchEvent(new Event("resize"));
                        }
                    }
                    await new Promise((res) => setTimeout(res, 80));
                },
            };
        });
    }, [tutorialSteps]);

    // Keep Joyride spotlight in sync with scroll
    useEffect(() => {
        if (!isRunning) return;
        const handleScroll = () => {
            window.dispatchEvent(new Event("resize"));
        };
        window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
        };
    }, [isRunning]);

    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    const currentStep = tutorialSteps[index];
                    if (currentStep?.id === "mj-step-4" || (activeTutorial === "buat_jurnal" && index === 3)) {
                        const selectBtn = getVisibleElement(".coa-picker-select-btn") as HTMLElement | null;
                        if (selectBtn) {
                            triggerCursorClick();
                            selectBtn.click();
                        }
                    } else if (currentStep?.simulateClick) {
                        triggerCursorClick();
                        triggerSimulateClick(currentStep.simulateClick);
                    }

                    const nextIndex = index + 1;
                    if (nextIndex < tutorialSteps.length) {
                        const nextStep = tutorialSteps[nextIndex];
                        if (nextStep?.id?.startsWith("mj-step-") && nextIndex >= 4) {
                            closeDialogsByTitle(["Pilih Akun", "Lawan Akun"]);
                        }
                        if (nextStep?.target) {
                            const el = await waitForElement(nextStep.target, 1500, nextStep.fallbackTarget);
                            if (el) {
                                el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                                window.dispatchEvent(new Event("resize"));
                            }
                        }
                        setStepIndex(nextIndex);
                    } else {
                        cleanupAndRestore();
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    const prevIndex = index - 1;
                    if (prevIndex === 3 && activeTutorial === "buat_jurnal") {
                        triggerSimulateClick("#mj-coa-trigger-0");
                        await waitForElement(".coa-picker-select-btn", 2500);
                    }
                    if (prevIndex === 2 && activeTutorial === "buat_jurnal") {
                        closeDialogsByTitle(["Pilih Akun", "Lawan Akun"]);
                    }
                    if (prevIndex >= 0) {
                        const prevStep = tutorialSteps[prevIndex];
                        if (prevStep?.target) {
                            const el = await waitForElement(prevStep.target, 1500, prevStep.fallbackTarget);
                            if (el) {
                                el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                                window.dispatchEvent(new Event("resize"));
                            }
                        }
                        setStepIndex(prevIndex);
                    }
                }
            }

            if (type === EVENTS.TOOLTIP) {
                setStepIndex(index);
                const step = tutorialSteps[index];
                if (step) {
                    if (step.id?.startsWith("mj-step-") && index >= 4) {
                        closeDialogsByTitle(["Pilih Akun", "Lawan Akun"]);
                    }
                    if (typeof document !== "undefined" && step.target && step.target !== "body") {
                        let el = getVisibleElement(step.target);
                        if (!el && step.fallbackTarget) {
                            el = getVisibleElement(step.fallbackTarget);
                        }
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            if (
                                rect.top < 80 ||
                                rect.bottom > window.innerHeight - 80 ||
                                rect.left < 10 ||
                                rect.right > window.innerWidth - 10
                            ) {
                                el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                                window.dispatchEvent(new Event("resize"));
                            }
                        }
                    }
                    setTimeout(() => {
                        positionCursorAt(step.target, step.fallbackTarget);
                    }, 80);
                }
            }

            if (
                status === STATUS.FINISHED ||
                status === STATUS.SKIPPED ||
                action === ACTIONS.CLOSE ||
                action === ACTIONS.RESET ||
                type === EVENTS.TOUR_END
            ) {
                cleanupAndRestore();
                stopTutorial();
            }
        },
        [
            tutorialSteps,
            positionCursorAt,
            setStepIndex,
            cleanupAndRestore,
            stopTutorial,
            triggerCursorClick,
            activeTutorial,
        ]
    );

    return {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
        startTutorial,
        stopTutorial,
    };
}
