"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useAccountingTutorialStore } from "@/stores/accounting-tutorial-store";
import { COA_TUTORIAL_STEPS } from "../steps/coa-tutorial-steps";
import { MOCK_COA } from "../constants/accounting-tutorial-constants";
import type { AccountingTutorialStep } from "../types/accounting-tutorial";
import type { ChartOfAccount } from "@/features/accounting/types";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";

export interface CoaTutorialControls {
    setDialogOpen?: (open: boolean) => void;
    setSelectedAccount?: (account: ChartOfAccount | null) => void;
    setParentForCreate?: (account: ChartOfAccount | null) => void;
    setDeleteOpen?: (open: boolean) => void;
    setAccountToDelete?: (account: ChartOfAccount | null) => void;
    setSearchQuery?: (query: string) => void;
    sampleAccount?: ChartOfAccount | null;
}

const DEFAULT_SAMPLE_ACCOUNT = MOCK_COA[1]; // Mock leaf account: Kas Kecil (Demo)

async function waitForElement(selector: string, timeout = 2500): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    if (selector === "body") return document.body;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = document.querySelector(selector);
        if (el) return el;
        await new Promise((r) => setTimeout(r, 50));
    }
    return document.querySelector(selector);
}

export function useCoaTutorial(controls: CoaTutorialControls) {
    const activeTutorial = useAccountingTutorialStore((state) => state.activeTutorial);
    const stepIndex = useAccountingTutorialStore((state) => state.stepIndex);
    const isRunning = useAccountingTutorialStore((state) => state.isRunning);

    const startTutorial = useAccountingTutorialStore((state) => state.startTutorial);
    const stopTutorial = useAccountingTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useAccountingTutorialStore((state) => state.setStepIndex);
    const updateCursor = useAccountingTutorialStore((state) => state.updateCursor);

    const controlsRef = useRef(controls);
    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    const tutorialSteps: AccountingTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return COA_TUTORIAL_STEPS[activeTutorial] || [];
    }, [activeTutorial]);

    const positionCursorAt = useCallback(
        (targetSelector: string) => {
            if (!targetSelector || targetSelector === "body") {
                updateCursor({ visible: false });
                return;
            }
            const el = document.querySelector(targetSelector);
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

    const syncModalForStep = useCallback((tutorialId: string | null, idx: number) => {
        if (!tutorialId) return;

        // Demo safety: edit & hapus SELALU pakai akun mock, jangan pernah akun asli toko.
        // (Pelajaran dari bug tutorial aset: sample akun asli sempat tampil di dialog hapus.)
        const demoSample = DEFAULT_SAMPLE_ACCOUNT;

        if (tutorialId === "tambah_akun") {
            if (idx === 0) {
                controlsRef.current.setDialogOpen?.(false);
                controlsRef.current.setSelectedAccount?.(null);
                controlsRef.current.setParentForCreate?.(null);
                controlsRef.current.setSearchQuery?.("");
            } else if (idx >= 1) {
                controlsRef.current.setSelectedAccount?.(null);
                controlsRef.current.setParentForCreate?.(null);
                controlsRef.current.setDialogOpen?.(true);
            }
        } else if (tutorialId === "edit_akun") {
            if (idx === 0) {
                controlsRef.current.setDialogOpen?.(false);
                controlsRef.current.setSelectedAccount?.(null);
                controlsRef.current.setSearchQuery?.("");
            } else if (idx >= 1) {
                controlsRef.current.setSelectedAccount?.(demoSample);
                controlsRef.current.setParentForCreate?.(null);
                controlsRef.current.setDialogOpen?.(true);
            }
        } else if (tutorialId === "hapus_akun") {
            if (idx === 0) {
                controlsRef.current.setDeleteOpen?.(false);
                controlsRef.current.setAccountToDelete?.(null);
                controlsRef.current.setSearchQuery?.("");
            } else if (idx >= 1) {
                controlsRef.current.setAccountToDelete?.(demoSample);
                controlsRef.current.setDeleteOpen?.(true);
            }
        }
    }, []);

    const cleanupAndRestore = useCallback(() => {
        controlsRef.current.setDialogOpen?.(false);
        controlsRef.current.setSelectedAccount?.(null);
        controlsRef.current.setParentForCreate?.(null);
        controlsRef.current.setDeleteOpen?.(false);
        controlsRef.current.setAccountToDelete?.(null);
        controlsRef.current.setSearchQuery?.("");
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

        return tutorialSteps.map((s, idx) => {
            const isOverlayNav = Boolean(s.overlayNav || s.variant === "overlay_nav" || s.variant === "banner");
            return {
                target: s.target,
                title: s.title,
                content: s.content,
                placement: isMobile && (s.placement === "left" || s.placement === "right")
                    ? "auto"
                    : (s.placement || "bottom"),
                disableBeacon: true,
                skipBeacon: true,
                skipScroll: true,
                spotlightClicks: s.spotlightClicks ?? true,
                spotlightPadding: 6,
                data: {
                    autoFill: s.autoFill,
                    overlayNav: isOverlayNav,
                    variant: s.variant || (isOverlayNav ? "overlay_nav" : "tooltip"),
                },
                floatingOptions: {
                    strategy: "fixed",
                },
                before: async () => {
                    syncModalForStep(activeTutorial, idx);

                    if (typeof document !== "undefined" && s.target && s.target !== "body") {
                        await waitForElement(s.target, 1500);
                        const el = document.querySelector(s.target);
                        if (el) {
                            el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                            window.dispatchEvent(new Event("resize"));
                        }
                    }

                    await new Promise((res) => setTimeout(res, 80));
                },
            };
        });
    }, [tutorialSteps, activeTutorial, syncModalForStep]);

    // Keep Joyride spotlight in sync with mobile/tablet scroll
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
                        syncModalForStep(activeTutorial, nextIndex);
                        const nextTarget = tutorialSteps[nextIndex]?.target;
                        if (nextTarget) {
                            await waitForElement(nextTarget, 1500);
                            const el = document.querySelector(nextTarget);
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
                        syncModalForStep(activeTutorial, prevIndex);
                        const prevTarget = tutorialSteps[prevIndex]?.target;
                        if (prevTarget) {
                            await waitForElement(prevTarget, 1500);
                            const el = document.querySelector(prevTarget);
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
                    syncModalForStep(activeTutorial, index);
                    if (typeof document !== "undefined" && step.target && step.target !== "body") {
                        const el = document.querySelector(step.target);
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            if (rect.top < 80 || rect.bottom > window.innerHeight - 80 || rect.left < 10 || rect.right > window.innerWidth - 10) {
                                el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                                window.dispatchEvent(new Event("resize"));
                            }
                        }
                    }
                    setTimeout(() => {
                        positionCursorAt(step.target);
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
            activeTutorial,
            positionCursorAt,
            setStepIndex,
            syncModalForStep,
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
