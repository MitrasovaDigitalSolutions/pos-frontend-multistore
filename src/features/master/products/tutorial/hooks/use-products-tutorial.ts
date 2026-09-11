"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useProductsTutorialStore } from "@/stores/products-tutorial-store";
import { PRODUCTS_TUTORIAL_STEPS } from "../steps/products-tutorial-steps";
import { MOCK_MASTER_PRODUCTS } from "../constants/products-tutorial-constants";
import type { ProductsTutorialStep } from "../types/products-tutorial";
import type { Product } from "@/features/master/products/types";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";

export interface ProductsTutorialControls {
    setIsCatalogMatchOpen: (open: boolean) => void;
    setIsProductFormOpen: (open: boolean) => void;
    setIsStoreEditOpen?: (open: boolean) => void;
    setEditingProduct?: (p: Product | null) => void;
    setIsConfirmOpen?: (open: boolean) => void;
    setProductToDelete?: (p: Product | null) => void;
    setIsUnarchiveOpen?: (open: boolean) => void;
    setProductToUnarchive?: (p: Product | null) => void;
    sampleProduct?: Product | null;
}

const DEFAULT_SAMPLE_PRODUCT = MOCK_MASTER_PRODUCTS[0];
const DEFAULT_ARCHIVED_PRODUCT = MOCK_MASTER_PRODUCTS[1];

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

export function useProductsTutorial(controls: ProductsTutorialControls) {
    const activeTutorial = useProductsTutorialStore((state) => state.activeTutorial);
    const stepIndex = useProductsTutorialStore((state) => state.stepIndex);
    const isRunning = useProductsTutorialStore((state) => state.isRunning);

    const startTutorial = useProductsTutorialStore((state) => state.startTutorial);
    const stopTutorial = useProductsTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useProductsTutorialStore((state) => state.setStepIndex);
    const updateCursor = useProductsTutorialStore((state) => state.updateCursor);

    const controlsRef = useRef(controls);
    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    // Steps configuration for active tutorial
    const tutorialSteps: ProductsTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return PRODUCTS_TUTORIAL_STEPS[activeTutorial] || [];
    }, [activeTutorial]);

    // Position virtual mouse cursor
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

    // Synchronize modal dialog states based on the active step
    const syncModalForStep = useCallback((tutorialId: string | null, idx: number) => {
        if (!tutorialId) return;

        const effectiveSample = controlsRef.current.sampleProduct || DEFAULT_SAMPLE_PRODUCT;

        if (tutorialId === "tambah_produk") {
            if (idx === 0) {
                controlsRef.current.setIsCatalogMatchOpen(false);
                controlsRef.current.setIsProductFormOpen(false);
            } else if (idx >= 1 && idx <= 2) {
                controlsRef.current.setIsCatalogMatchOpen(true);
                controlsRef.current.setIsProductFormOpen(false);
            } else if (idx >= 3) {
                controlsRef.current.setIsCatalogMatchOpen(false);
                controlsRef.current.setIsProductFormOpen(true);
            }
        } else if (tutorialId === "edit_produk") {
            if (idx === 0) {
                controlsRef.current.setIsStoreEditOpen?.(false);
            } else if (idx >= 1) {
                controlsRef.current.setEditingProduct?.(effectiveSample);
                controlsRef.current.setIsStoreEditOpen?.(true);
            }
        } else if (tutorialId === "hapus_produk") {
            if (idx === 0) {
                controlsRef.current.setIsConfirmOpen?.(false);
                controlsRef.current.setIsUnarchiveOpen?.(false);
            } else if (idx === 1) {
                controlsRef.current.setProductToDelete?.(effectiveSample);
                controlsRef.current.setIsConfirmOpen?.(true);
                controlsRef.current.setIsUnarchiveOpen?.(false);
            } else if (idx === 2) {
                controlsRef.current.setIsConfirmOpen?.(false);
                controlsRef.current.setIsUnarchiveOpen?.(false);
            } else if (idx === 3) {
                controlsRef.current.setIsConfirmOpen?.(false);
                controlsRef.current.setProductToUnarchive?.(DEFAULT_ARCHIVED_PRODUCT);
                controlsRef.current.setIsUnarchiveOpen?.(true);
            }
        }
    }, []);

    // Cleanup & close modals when tutorial ends
    const cleanupAndRestore = useCallback(() => {
        controlsRef.current.setIsCatalogMatchOpen(false);
        controlsRef.current.setIsProductFormOpen(false);
        controlsRef.current.setIsStoreEditOpen?.(false);
        controlsRef.current.setIsConfirmOpen?.(false);
        controlsRef.current.setIsUnarchiveOpen?.(false);
        updateCursor({ visible: false, label: undefined });
    }, [updateCursor]);

    // Reactive termination watchdog: guarantees full modal cleanup whenever tutorial stops
    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    // Joyride Steps format with fixed viewport strategy and native scroll-into-view
    const joyrideSteps: Step[] = useMemo(() => {
        return tutorialSteps.map((s, idx) => ({
            target: s.target,
            title: s.title,
            content: s.content,
            placement: s.placement || "bottom",
            disableBeacon: true,
            skipBeacon: true,
            spotlightClicks: s.spotlightClicks ?? true,
            spotlightPadding:
                s.target.includes("category") || s.target.includes("unit") || s.target.includes("select")
                    ? 8
                    : 6,
            data: {
                autoFill: s.autoFill,
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
                        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                    }
                }

                await new Promise((res) => setTimeout(res, 120));
            },
        }));
    }, [tutorialSteps, activeTutorial, syncModalForStep]);

    // Joyride Event Handler
    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            // Controlled step transition handling
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
                                el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
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
                                el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
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
                            if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
                                el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                            }
                        }
                    }
                    setTimeout(() => {
                        positionCursorAt(step.target);
                    }, 80);
                }
            }

            // Tour termination
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
