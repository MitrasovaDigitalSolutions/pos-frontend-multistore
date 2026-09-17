"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useReportsTutorialStore } from "@/stores/reports-tutorial-store";
import { REPORTS_TUTORIAL_STEPS } from "../steps";
import type { ReportsTutorialId, ReportsTutorialStep } from "../types/reports-tutorial";
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
void getVisibleHtmlElement;

/**
 * Pastikan switch (Switch) tertentu aktif saat step ini tampil. Berguna untuk
 * flow yang butuh "Sertakan Detail Barang" menyala agar narasi & tabel konsisten.
 */
function ensureSwitchOn(switchSelector: string) {
    if (typeof document === "undefined" || !switchSelector) return;
    const sw = document.querySelector(switchSelector);
    if (!sw) return;
    const isOn = sw.getAttribute("aria-checked") === "true" || sw.hasAttribute("data-checked");
    if (isOn) return;
    (sw as HTMLElement).click();
}

function resolveStepTargetSelector(step: ReportsTutorialStep): string {
    if (typeof document === "undefined" || !step.target) return step.target || "body";
    if (step.target === "body") return "body";

    // Selector yang cocok ke banyak elemen (mis. tombol expand baris pada layout
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

export function useReportsTutorial() {
    const activeTutorial = useReportsTutorialStore((state) => state.activeTutorial);
    const stepIndex = useReportsTutorialStore((state) => state.stepIndex);
    const isRunning = useReportsTutorialStore((state) => state.isRunning);

    const rawStartTutorial = useReportsTutorialStore((state) => state.startTutorial);
    const stopTutorial = useReportsTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useReportsTutorialStore((state) => state.setStepIndex);
    const updateCursor = useReportsTutorialStore((state) => state.updateCursor);
    const triggerCursorClick = useReportsTutorialStore((state) => state.triggerCursorClick);

    const startTutorial = useCallback(
        (id: ReportsTutorialId) => {
            rawStartTutorial(id);
            return true;
        },
        [rawStartTutorial]
    );

    const tutorialSteps: ReportsTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return REPORTS_TUTORIAL_STEPS[activeTutorial] || [];
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
                // Target string statis (bukan fungsi). Semua selector Laporan bersifat
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
                    // Jalankan simulateClick saat step INI aktif (on-arrival) agar
                    // efeknya (mis. ekspansi baris) sudah terlihat di layar selama
                    // step ditampilkan — bukan tertunda ke step berikutnya.
                    if (s.simulateClick) {
                        triggerCursorClick();
                        triggerSimulateClick(s.simulateClick);
                        await new Promise((res) => setTimeout(res, 100));
                    }
                    if (s.ensureSwitchOn) {
                        ensureSwitchOn(s.ensureSwitchOn);
                    }
                    // Penting: JANGAN paksa scrollIntoView + dispatch resize di sini.
                    // Aksi itu memicu re-layout panjang SEBELUM card kustom sempat
                    // mount, sehingga floater + panah (yang dirender Joyride lebih
                    // dulu) tampak "muncul duluan" sedangkan card nyusul terlambat.
                    // Sinkronisasi scroll & posisi ditangani pada event TOOLTIP di
                    // bawah — setelah card benar-benar tampil.
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
