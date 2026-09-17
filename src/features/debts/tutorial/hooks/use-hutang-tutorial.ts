"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useHutangTutorialStore } from "@/stores/hutang-tutorial-store";
import { HUTANG_TUTORIAL_STEPS } from "../steps";
import type { HutangTutorialId, HutangTutorialStep } from "../types/hutang-tutorial";
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

function isElementVisible(el: Element | null): boolean {
    if (!el || !(el instanceof HTMLElement || el instanceof SVGElement)) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    if (el instanceof HTMLElement && el.offsetParent === null && window.getComputedStyle(el).position !== "fixed") {
        return false;
    }
    return true;
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

/**
 * Pastikan switch (Switch) tertentu aktif saat step ini tampil. Berguna untuk
 * flow yang butuh opsi tertentu menyala agar narasi & tabel konsisten.
 */
function ensureSwitchOn(switchSelector: string) {
    if (typeof document === "undefined" || !switchSelector) return;
    const sw = document.querySelector(switchSelector);
    if (!sw) return;
    const isOn = sw.getAttribute("aria-checked") === "true" || sw.hasAttribute("data-checked");
    if (isOn) return;
    (sw as HTMLElement).click();
}

function resolveStepTargetSelector(step: HutangTutorialStep): string {
    if (typeof document === "undefined" || !step.target) return step.target || "body";
    if (step.target === "body") return "body";

    // Selector yang cocok ke banyak elemen (mis. tombol aksi baris pada layout
    // desktop dan mobile yang tersembunyi) dapat membuat Joyride memilih elemen
    // pertama yang tidak terlihat. Tandai elemen pertama yang VISIBLE dengan id
    // runtime unik agar spotlight selalu mengunci target yang benar.
    const matches = document.querySelectorAll(step.target);
    if (matches.length > 1) {
        document.getElementById("tutorial-active-target")?.removeAttribute("id");
        const visible = Array.from(matches).find(isElementVisible);
        if (visible) {
            visible.id = "tutorial-active-target";
            return "#tutorial-active-target";
        }
    }

    const primary = getVisibleElement(step.target);
    if (primary) return step.target;
    if (step.fallbackTarget) {
        const fallback = getVisibleElement(step.fallbackTarget);
        if (fallback) return step.fallbackTarget;
    }
    return step.target;
}

export function useHutangTutorial() {
    const activeTutorial = useHutangTutorialStore((state) => state.activeTutorial);
    const stepIndex = useHutangTutorialStore((state) => state.stepIndex);
    const isRunning = useHutangTutorialStore((state) => state.isRunning);

    const rawStartTutorial = useHutangTutorialStore((state) => state.startTutorial);
    const stopTutorial = useHutangTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useHutangTutorialStore((state) => state.setStepIndex);
    const updateCursor = useHutangTutorialStore((state) => state.updateCursor);
    const triggerCursorClick = useHutangTutorialStore((state) => state.triggerCursorClick);

    const startTutorial = useCallback(
        (id: HutangTutorialId) => {
            rawStartTutorial(id);
            return true;
        },
        [rawStartTutorial]
    );

    const tutorialSteps: HutangTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return HUTANG_TUTORIAL_STEPS[activeTutorial] || [];
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

        return tutorialSteps.map((s) => {
            const isOverlayNav = Boolean(s.overlayNav || s.variant === "overlay_nav" || s.variant === "banner");
            const activeTarget = resolveStepTargetSelector(s);
            return {
                // Target string statis (bukan fungsi). Semua selector Hutang bersifat
                // unik, jadi cukup pakai `activeTarget` yang sudah di-resolve. Target
                // berupa FUNGSI memicu Joyride mengukur ulang + stamp id DOM setiap
                // render → feedback loop yang menunda mount card kustom ~500ms lebih
                // lambat dari panah. Pola string ini sama seperti modul lain yang stabil.
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
                    // Aksi simulateClick TIDAK dijalankan di sini. Aksi dipicu saat
                    // transisi MASUK ke step (lihat STEP_AFTER → NEXT) agar dialog
                    // sudah ada di DOM sebelum target step ini di-resolve, sehingga
                    // tooltip tidak lagi mengambang menimpa dialog yang baru dibuka.
                    if (s.ensureSwitchOn) {
                        ensureSwitchOn(s.ensureSwitchOn);
                    }
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
                    const nextIndex = index + 1;
                    if (nextIndex < tutorialSteps.length) {
                        const nextStep = tutorialSteps[nextIndex];
                        // Tutup dialog bila step tujuan tidak butuh dialog terbuka
                        // (mis. kembali ke daftar), supaya spotlight bersih.
                        if (nextStep?.closeDialog) {
                            triggerSimulateClick(nextStep.closeDialog);
                            await new Promise((res) => setTimeout(res, 150));
                        }
                        // Buka dialog / picu aksi step berikutnya SEBELUM target
                        // step itu di-resolve, supaya elemen di dalam dialog sudah
                        // ada di DOM saat Joyride mengukur spotlight.
                        if (nextStep?.simulateClick) {
                            triggerCursorClick();
                            triggerSimulateClick(nextStep.simulateClick);
                            await new Promise((res) => setTimeout(res, 150));
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
                    if (prevIndex >= 0) {
                        const prevStep = tutorialSteps[prevIndex];
                        // Tutup dialog bila step tujuan tidak butuh dialog terbuka
                        // (mis. mundur dari step 6 → 5 ke daftar).
                        if (prevStep?.closeDialog) {
                            triggerSimulateClick(prevStep.closeDialog);
                            await new Promise((res) => setTimeout(res, 150));
                        }
                        // Saat mundur ke step yang butuh dialog terbuka (mis. kembali
                        // dari step 7 → 6), picu aksinya lagi supaya dialog kembali
                        // terbuka dan target di dalamnya tersedia.
                        if (prevStep?.simulateClick) {
                            triggerCursorClick();
                            triggerSimulateClick(prevStep.simulateClick);
                            await new Promise((res) => setTimeout(res, 150));
                        }
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
                    if (step.ensureSwitchOn) {
                        ensureSwitchOn(step.ensureSwitchOn);
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
