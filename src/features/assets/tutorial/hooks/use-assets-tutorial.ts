"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useAssetsTutorialStore } from "@/stores/assets-tutorial-store";
import { ASSET_TUTORIAL_STEPS } from "../steps/assets-tutorial-steps";
import { MOCK_ASSETS } from "../constants/assets-tutorial-constants";
import type { AssetTutorialStep } from "../types/assets-tutorial";
import type { Asset } from "@/features/assets/types";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";

export interface AssetsTutorialControls {
    setIsCreateDialogOpen?: (open: boolean) => void;
    setIsEditDialogOpen?: (open: boolean) => void;
    setEditingAsset?: (asset: Asset | null) => void;
    setIsDetailSheetOpen?: (open: boolean) => void;
    setDetailSheetMode?: (mode: "history" | "form") => void;
    setSelectedAssetForDetail?: (asset: Asset | null) => void;
    setIsBulkDialogOpen?: (open: boolean) => void;
    setIsConfirmDeleteDialogOpen?: (open: boolean) => void;
    setAssetToDelete?: (asset: Asset | null) => void;
    setIsCategoryDialogOpen?: (open: boolean) => void;
    sampleAsset?: Asset | null;
}

const DEFAULT_SAMPLE_ASSET = MOCK_ASSETS[0];

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

export function useAssetsTutorial(controls: AssetsTutorialControls) {
    const activeTutorial = useAssetsTutorialStore((state) => state.activeTutorial);
    const stepIndex = useAssetsTutorialStore((state) => state.stepIndex);
    const isRunning = useAssetsTutorialStore((state) => state.isRunning);

    const startTutorial = useAssetsTutorialStore((state) => state.startTutorial);
    const stopTutorial = useAssetsTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useAssetsTutorialStore((state) => state.setStepIndex);
    const updateCursor = useAssetsTutorialStore((state) => state.updateCursor);

    const controlsRef = useRef(controls);
    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    const tutorialSteps: AssetTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return ASSET_TUTORIAL_STEPS[activeTutorial] || [];
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

        const effectiveSample = controlsRef.current.sampleAsset || DEFAULT_SAMPLE_ASSET;

        if (tutorialId === "catat_aset") {
            if (idx === 0) {
                controlsRef.current.setIsCreateDialogOpen?.(false);
            } else if (idx >= 1) {
                controlsRef.current.setIsCreateDialogOpen?.(true);
            }
        } else if (tutorialId === "edit_aset") {
            if (idx === 0) {
                controlsRef.current.setIsEditDialogOpen?.(false);
                controlsRef.current.setEditingAsset?.(null);
            } else if (idx >= 1) {
                controlsRef.current.setEditingAsset?.(effectiveSample);
                controlsRef.current.setIsEditDialogOpen?.(true);
            }
        } else if (tutorialId === "susut_single") {
            if (idx === 0) {
                controlsRef.current.setIsDetailSheetOpen?.(false);
                controlsRef.current.setSelectedAssetForDetail?.(null);
            } else if (idx >= 1) {
                controlsRef.current.setSelectedAssetForDetail?.(effectiveSample);
                controlsRef.current.setDetailSheetMode?.("form");
                controlsRef.current.setIsDetailSheetOpen?.(true);
            }
        } else if (tutorialId === "susut_bulk") {
            if (idx === 0) {
                controlsRef.current.setIsBulkDialogOpen?.(false);
            } else if (idx >= 1) {
                controlsRef.current.setIsBulkDialogOpen?.(true);
            }
        } else if (tutorialId === "detail_hapus") {
            if (idx === 0) {
                controlsRef.current.setIsDetailSheetOpen?.(false);
                controlsRef.current.setIsConfirmDeleteDialogOpen?.(false);
            } else if (idx === 1 || idx === 2) {
                controlsRef.current.setSelectedAssetForDetail?.(effectiveSample);
                controlsRef.current.setDetailSheetMode?.("history");
                controlsRef.current.setIsDetailSheetOpen?.(true);
                controlsRef.current.setIsConfirmDeleteDialogOpen?.(false);
            } else if (idx === 3) {
                controlsRef.current.setIsDetailSheetOpen?.(false);
                controlsRef.current.setIsConfirmDeleteDialogOpen?.(false);
            } else if (idx >= 4) {
                controlsRef.current.setIsDetailSheetOpen?.(false);
                // ponytail: selalu mock — jangan pernah tampilkan/hapus aset asli saat tutorial
                controlsRef.current.setAssetToDelete?.(DEFAULT_SAMPLE_ASSET);
                controlsRef.current.setIsConfirmDeleteDialogOpen?.(true);
            }
        } else if (tutorialId === "kategori_aset") {
            // Catatan: Flow ini berjalan pada halaman /admin/assets/categories
            if (idx === 0) {
                controlsRef.current.setIsCategoryDialogOpen?.(false);
            } else if (idx >= 1) {
                controlsRef.current.setIsCategoryDialogOpen?.(true);
            }
        }
    }, []);

    const cleanupAndRestore = useCallback(() => {
        controlsRef.current.setIsCreateDialogOpen?.(false);
        controlsRef.current.setIsEditDialogOpen?.(false);
        controlsRef.current.setEditingAsset?.(null);
        controlsRef.current.setIsDetailSheetOpen?.(false);
        controlsRef.current.setSelectedAssetForDetail?.(null);
        controlsRef.current.setIsBulkDialogOpen?.(false);
        controlsRef.current.setIsConfirmDeleteDialogOpen?.(false);
        controlsRef.current.setAssetToDelete?.(null);
        controlsRef.current.setIsCategoryDialogOpen?.(false);
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
