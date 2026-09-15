"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useBalanceSheetTutorialStore } from "@/stores/balance-sheet-tutorial-store";
import { BALANCE_SHEET_TUTORIAL_STEPS } from "../steps";
import type { BalanceSheetTutorialId, BalanceSheetTutorialStep } from "../types/balance-sheet-tutorial";
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

function getVisibleHtmlElement(selector: string): HTMLElement | null {
    const el = getVisibleElement(selector);
    return el instanceof HTMLElement ? el : null;
}

function ensureDetailDkEnabled() {
    if (typeof document === "undefined") return;
    // Utamakan sakelar di dalam grup filter Neraca; fallback ke pencarian global.
    const scoped = document.querySelector('#neraca-switch-dk [data-slot="switch"][role="switch"]');
    const sw = scoped || document.querySelector('[data-slot="switch"][role="switch"]');
    if (!sw) return;
    const isOn = sw.getAttribute("aria-checked") === "true" || sw.hasAttribute("data-checked");
    if (isOn) return;
    (sw as HTMLElement).click();
}

/**
 * Pastikan minimal satu baris rincian kategori (tombol Detail) terbuka sehingga
 * spotlight `.neraca-detail-btn` selalu memiliki target yang terlihat.
 * Hanya beroperasi pada tombol yang benar-benar tampil (mengabaikan layout mobile
 * tersembunyi pada viewport desktop dan sebaliknya).
 */
function ensureDetailRowOpen() {
    if (typeof document === "undefined") return;
    const btns = Array.from(document.querySelectorAll<HTMLElement>(".neraca-detail-btn")).filter(
        isElementVisible
    );
    if (btns.length === 0) return;
    const alreadyOpen = btns.some((b) => b.innerText.trim().toLowerCase().startsWith("tutup"));
    if (alreadyOpen) return;
    btns[0]?.click();
}

function resolveStepTargetSelector(step: BalanceSheetTutorialStep): string {
    if (typeof document === "undefined" || !step.target) return step.target || "body";
    if (step.target === "body") return "body";

    // Selector yang cocok ke banyak elemen (mis. `.neraca-detail-btn` pada layout
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

export function useBalanceSheetTutorial() {
    const activeTutorial = useBalanceSheetTutorialStore((state) => state.activeTutorial);
    const stepIndex = useBalanceSheetTutorialStore((state) => state.stepIndex);
    const isRunning = useBalanceSheetTutorialStore((state) => state.isRunning);

    const rawStartTutorial = useBalanceSheetTutorialStore((state) => state.startTutorial);
    const stopTutorial = useBalanceSheetTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useBalanceSheetTutorialStore((state) => state.setStepIndex);
    const updateCursor = useBalanceSheetTutorialStore((state) => state.updateCursor);
    const triggerCursorClick = useBalanceSheetTutorialStore((state) => state.triggerCursorClick);

    const startTutorial = useCallback(
        (id: BalanceSheetTutorialId) => {
            rawStartTutorial(id);
            return true;
        },
        [rawStartTutorial]
    );

    const tutorialSteps: BalanceSheetTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return BALANCE_SHEET_TUTORIAL_STEPS[activeTutorial] || [];
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
                // Target dievaluasi ulang secara live agar mengikuti elemen yang
                // benar-benar terlihat setelah mutasi DOM pada `before` (mis. baris
                // rincian yang baru dibuka, atau layout desktop vs mobile).
                target: () =>
                    getVisibleHtmlElement(resolveStepTargetSelector(s)) ||
                    getVisibleHtmlElement(activeTarget) ||
                    document.body,
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
                    // Jalankan simulateClick saat step INI aktif (on-arrival) agar
                    // efeknya (mis. perpindahan mode laporan) sudah terlihat di
                    // layar selama step ditampilkan — bukan tertunda ke step
                    // berikutnya.
                    if (s.simulateClick) {
                        triggerCursorClick();
                        triggerSimulateClick(s.simulateClick);
                        await new Promise((res) => setTimeout(res, 150));
                    }
                    if (s.ensureDkOn) {
                        ensureDetailDkEnabled();
                    }
                    if (s.ensureDetailOpen) {
                        await new Promise((res) => setTimeout(res, 120));
                        ensureDetailRowOpen();
                        await new Promise((res) => setTimeout(res, 60));
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
    }, [tutorialSteps, triggerCursorClick]);

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
                    if (step.ensureDkOn) {
                        ensureDetailDkEnabled();
                    }
                    if (step.ensureDetailOpen) {
                        ensureDetailRowOpen();
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
