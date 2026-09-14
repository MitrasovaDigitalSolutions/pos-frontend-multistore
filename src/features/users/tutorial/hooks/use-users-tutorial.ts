import { useCallback, useEffect, useMemo, useRef } from "react";
import type { EventData, Step } from "react-joyride";
import { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { useUsersTutorialStore } from "@/stores/users-tutorial-store";
import type { User } from "@/features/users/types";
import { USERS_TUTORIAL_STEPS } from "../steps/users-tutorial-steps";
import { MOCK_USERS } from "../constants/users-tutorial-constants";

export interface UsersTutorialControls {
    setIsDialogOpen: (open: boolean) => void;
    setEditingUser?: (user: User | null) => void;
    setIsConfirmOpen?: (open: boolean) => void;
    setUserToDeactivate?: (user: User | null) => void;
    sampleUser?: User;
}

const DEFAULT_SAMPLE_USER: User = MOCK_USERS[0];

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

export function useUsersTutorial(controls: UsersTutorialControls) {
    const activeTutorial = useUsersTutorialStore((state) => state.activeTutorial);
    const stepIndex = useUsersTutorialStore((state) => state.stepIndex);
    const isRunning = useUsersTutorialStore((state) => state.isRunning);

    const startTutorial = useUsersTutorialStore((state) => state.startTutorial);
    const stopTutorial = useUsersTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useUsersTutorialStore((state) => state.setStepIndex);
    const updateCursor = useUsersTutorialStore((state) => state.updateCursor);

    const controlsRef = useRef(controls);
    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return USERS_TUTORIAL_STEPS[activeTutorial] || [];
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

        const effectiveSample = controlsRef.current.sampleUser || DEFAULT_SAMPLE_USER;

        if (tutorialId === "tambah_karyawan") {
            if (idx === 0) {
                controlsRef.current.setIsDialogOpen(false);
            } else if (idx >= 1) {
                controlsRef.current.setEditingUser?.(null);
                controlsRef.current.setIsDialogOpen(true);
            }
        } else if (tutorialId === "edit_karyawan") {
            if (idx === 0) {
                controlsRef.current.setIsDialogOpen(false);
            } else if (idx >= 1) {
                controlsRef.current.setEditingUser?.(effectiveSample);
                controlsRef.current.setIsDialogOpen(true);
            }
        } else if (tutorialId === "nonaktifkan_karyawan") {
            if (idx === 0) {
                controlsRef.current.setIsConfirmOpen?.(false);
            } else if (idx >= 1) {
                controlsRef.current.setUserToDeactivate?.(effectiveSample);
                controlsRef.current.setIsConfirmOpen?.(true);
            }
        }
        // filter_karyawan: no modal sync needed
    }, []);

    const cleanupAndRestore = useCallback(() => {
        controlsRef.current.setIsDialogOpen(false);
        controlsRef.current.setEditingUser?.(null);
        controlsRef.current.setIsConfirmOpen?.(false);
        controlsRef.current.setUserToDeactivate?.(null);
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

        return tutorialSteps.map((s, idx) => ({
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
        }));
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
