import { useCallback, useEffect, useMemo, useRef } from "react";
import type { EventData, Step } from "react-joyride";
import { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { useAuditTutorialStore } from "@/stores/audit-tutorial-store";
import type { ActivityLog } from "@/features/stock/api/stock-api";
import { AUDIT_TUTORIAL_STEPS } from "../steps/audit-tutorial-steps";
import { MOCK_AUDIT_LOGS } from "../constants/audit-tutorial-constants";

export interface AuditTutorialControls {
    setViewMode: (mode: "table" | "timeline") => void;
    setSelectedLog: (log: ActivityLog | null) => void;
    setInspectorTab?: (tab: "info" | "properties" | "json") => void;
    sampleLog?: ActivityLog;
}

const DEFAULT_SAMPLE_LOG: ActivityLog = MOCK_AUDIT_LOGS[1]; // Use index 1 (stock_adjustment with old & new) to demonstrate change properties diff!

function waitForElement(selector: string, timeout = 1200): Promise<Element | null> {
    return new Promise((resolve) => {
        const existing = document.querySelector(selector);
        if (existing) {
            resolve(existing);
            return;
        }

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            resolve(document.querySelector(selector));
        }, timeout);
    });
}

export function useAuditTutorial(controls: AuditTutorialControls) {
    const activeTutorial = useAuditTutorialStore((state) => state.activeTutorial);
    const stepIndex = useAuditTutorialStore((state) => state.stepIndex);
    const isRunning = useAuditTutorialStore((state) => state.isRunning);

    const startTutorial = useAuditTutorialStore((state) => state.startTutorial);
    const stopTutorial = useAuditTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useAuditTutorialStore((state) => state.setStepIndex);
    const updateCursor = useAuditTutorialStore((state) => state.updateCursor);

    const controlsRef = useRef(controls);
    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return AUDIT_TUTORIAL_STEPS[activeTutorial] || [];
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

        const effectiveSample = controlsRef.current.sampleLog || DEFAULT_SAMPLE_LOG;

        if (tutorialId === "inspeksi_aktivitas") {
            if (idx === 0) {
                controlsRef.current.setViewMode("table");
                controlsRef.current.setSelectedLog(null);
                controlsRef.current.setInspectorTab?.("info");
            } else if (idx === 1) {
                controlsRef.current.setSelectedLog(effectiveSample);
                controlsRef.current.setInspectorTab?.("info");
            } else if (idx === 2) {
                controlsRef.current.setSelectedLog(effectiveSample);
                controlsRef.current.setInspectorTab?.("properties");
            } else if (idx === 3) {
                controlsRef.current.setSelectedLog(effectiveSample);
                controlsRef.current.setInspectorTab?.("json");
            } else if (idx === 4) {
                controlsRef.current.setSelectedLog(effectiveSample);
            }
        } else if (tutorialId === "filter_aktivitas") {
            controlsRef.current.setViewMode("table");
            controlsRef.current.setSelectedLog(null);
        } else if (tutorialId === "mode_linimasa") {
            if (idx === 0) {
                controlsRef.current.setSelectedLog(null);
                controlsRef.current.setViewMode("table");
            } else if (idx === 1) {
                controlsRef.current.setSelectedLog(null);
                controlsRef.current.setViewMode("timeline");
            } else if (idx === 2) {
                controlsRef.current.setSelectedLog(null);
                controlsRef.current.setViewMode("timeline");
            }
        }
    }, []);

    const cleanupAndRestore = useCallback(() => {
        controlsRef.current.setSelectedLog(null);
        controlsRef.current.setViewMode("table");
        controlsRef.current.setInspectorTab?.("info");
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

    // Keep Joyride spotlight in sync with mobile/tablet scroll in <main> and inner containers
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
                    positionCursorAt(step.target);
                }
            }

            if (
                status === STATUS.FINISHED ||
                status === STATUS.SKIPPED ||
                action === ACTIONS.CLOSE
            ) {
                cleanupAndRestore();
                stopTutorial();
            }
        },
        [
            tutorialSteps,
            setStepIndex,
            stopTutorial,
            cleanupAndRestore,
            activeTutorial,
            syncModalForStep,
            positionCursorAt,
        ]
    );

    return {
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
        startTutorial,
        stopTutorial,
        syncModalForStep,
        currentStep: tutorialSteps[stepIndex] || null,
        totalSteps: tutorialSteps.length,
    };
}
