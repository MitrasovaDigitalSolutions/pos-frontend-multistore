"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useCashTutorialStore } from "@/stores/cash-tutorial-store";
import { CASH_TUTORIAL_STEPS } from "../steps";
import type { CashTutorialId, CashTutorialStep } from "../types/cash-tutorial";
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
 * Pastikan sakelar/select tertentu aktif saat step ini tampil. Berguna untuk
 * flow yang butuh opsi tertentu menyala agar narasi & field konsisten.
 */
function ensureSwitchOn(switchSelector: string) {
    if (typeof document === "undefined" || !switchSelector) return;
    const sw = document.querySelector(switchSelector);
    if (!sw) return;
    const isOn = sw.getAttribute("aria-checked") === "true" || sw.hasAttribute("data-checked");
    if (isOn) return;
    (sw as HTMLElement).click();
}

/**
 * Tutup satu atau beberapa dialog sekaligus. Selector bisa dipisah koma untuk
 * menangani step yang berada di antara dua dialog berbeda (mis. form ubah akun
 * dan dialog konfirmasi hapus).
 */
function closeDialogs(selectors: string) {
    if (typeof document === "undefined" || !selectors) return;
    selectors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((selector) => triggerSimulateClick(selector));
}

/**
 * Tutup semua dialog yang mungkin masih terbuka ketika tutorial berakhir
 * (finish/skip/close). Mencegah dialog "nyangkut" (mis. konfirmasi hapus akun,
 * form mutasi) setelah panduan keluar.
 */
const CASH_TUTORIAL_OPEN_DIALOG_CLOSE_SELECTORS = [
    "#kas-delete-confirm-cancel",
    "#kas-account-dialog-close",
    "#kas-mutation-dialog-close",
    "#kas-transfer-dialog-close",
    "#kas-ledger-detail-close",
].join(", ");

function closeTutorialDialogs() {
    closeDialogs(CASH_TUTORIAL_OPEN_DIALOG_CLOSE_SELECTORS);
}

function resolveStepTargetSelector(step: CashTutorialStep): string {
    if (typeof document === "undefined" || !step.target) return step.target || "body";
    if (step.target === "body") return "body";

    // Selector yang cocok ke banyak elemen (mis. tombol aksi yang tersembunyi)
    // dapat membuat Joyride memilih elemen pertama yang tidak terlihat. Tandai
    // elemen pertama yang VISIBLE dengan id runtime unik agar spotlight selalu
    // mengunci target yang benar.
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

export function useCashTutorial() {
    const activeTutorial = useCashTutorialStore((state) => state.activeTutorial);
    const stepIndex = useCashTutorialStore((state) => state.stepIndex);
    const isRunning = useCashTutorialStore((state) => state.isRunning);

    const rawStartTutorial = useCashTutorialStore((state) => state.startTutorial);
    const stopTutorial = useCashTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useCashTutorialStore((state) => state.setStepIndex);
    const updateCursor = useCashTutorialStore((state) => state.updateCursor);
    const triggerCursorClick = useCashTutorialStore((state) => state.triggerCursorClick);

    const startTutorial = useCallback(
        (id: CashTutorialId) => {
            rawStartTutorial(id);
            return true;
        },
        [rawStartTutorial]
    );

    const tutorialSteps: CashTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return CASH_TUTORIAL_STEPS[activeTutorial] || [];
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
            // Tutorial berhenti lewat jalur apa pun (finish/skip/close/stop):
            // pastikan dialog yang masih terbuka ikut ditutup agar tidak
            // ada modal "nyangkut" (mis. konfirmasi hapus akun).
            closeTutorialDialogs();
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
                // Target string statis (bukan fungsi). Target berupa FUNGSI memicu
                // Joyride mengukur ulang + stamp id DOM setiap render → feedback loop.
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
                    // transisi MASUK ke step (lihat STEP_AFTER → NEXT/PREV) agar dialog
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
                            closeDialogs(nextStep.closeDialog);
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
                        // Selesai dari step terakhir: tutup dialog yang masih terbuka
                        // (mis. konfirmasi hapus) sebelum menghentikan tutorial.
                        closeTutorialDialogs();
                        await new Promise((res) => setTimeout(res, 120));
                        cleanupAndRestore();
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        const prevStep = tutorialSteps[prevIndex];
                        // Tutup dialog bila step tujuan tidak butuh dialog terbuka
                        // (mis. mundur dari step dialog → daftar).
                        if (prevStep?.closeDialog) {
                            closeDialogs(prevStep.closeDialog);
                            await new Promise((res) => setTimeout(res, 150));
                        }
                        // Saat mundur ke step yang butuh dialog terbuka, picu aksinya
                        // lagi supaya dialog kembali terbuka dan target tersedia.
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
                // Tutup dialog yang masih terbuka (mis. konfirmasi hapus) saat
                // tutorial keluar, supaya tidak ada modal "nyangkut".
                closeTutorialDialogs();
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
