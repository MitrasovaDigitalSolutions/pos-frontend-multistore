"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useMembersTutorialStore } from "@/stores/members-tutorial-store";
import { MEMBERS_TUTORIAL_STEPS } from "../steps/members-tutorial-steps";
import { MOCK_MEMBERS } from "../constants/members-tutorial-constants";
import type { MembersTutorialStep } from "../types/members-tutorial";
import type { Member } from "@/features/master/members/types";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";

export interface MembersTutorialControls {
    setIsDialogOpen: (open: boolean) => void;
    setEditingMember?: (m: Member | null) => void;
    setIsAdjustPointsOpen?: (open: boolean) => void;
    setSelectedMemberForPoints?: (m: Member | null) => void;
    setIsConfirmOpen?: (open: boolean) => void;
    setMemberToDelete?: (m: Member | null) => void;
    sampleMember?: Member | null;
}

const DEFAULT_SAMPLE_MEMBER = MOCK_MEMBERS[0];

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

export function useMembersTutorial(controls: MembersTutorialControls) {
    const activeTutorial = useMembersTutorialStore((state) => state.activeTutorial);
    const stepIndex = useMembersTutorialStore((state) => state.stepIndex);
    const isRunning = useMembersTutorialStore((state) => state.isRunning);

    const startTutorial = useMembersTutorialStore((state) => state.startTutorial);
    const stopTutorial = useMembersTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useMembersTutorialStore((state) => state.setStepIndex);
    const updateCursor = useMembersTutorialStore((state) => state.updateCursor);

    const controlsRef = useRef(controls);
    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    const tutorialSteps: MembersTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return MEMBERS_TUTORIAL_STEPS[activeTutorial] || [];
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

        const effectiveSample = controlsRef.current.sampleMember || DEFAULT_SAMPLE_MEMBER;

        if (tutorialId === "tambah_member") {
            if (idx === 0) {
                controlsRef.current.setIsDialogOpen(false);
            } else if (idx >= 1) {
                controlsRef.current.setIsDialogOpen(true);
            }
        } else if (tutorialId === "edit_member") {
            if (idx === 0) {
                controlsRef.current.setIsDialogOpen(false);
            } else if (idx >= 1) {
                controlsRef.current.setEditingMember?.(effectiveSample);
                controlsRef.current.setIsDialogOpen(true);
            }
        } else if (tutorialId === "sesuaikan_poin") {
            if (idx === 0) {
                controlsRef.current.setIsAdjustPointsOpen?.(false);
            } else if (idx >= 1) {
                controlsRef.current.setSelectedMemberForPoints?.(effectiveSample);
                controlsRef.current.setIsAdjustPointsOpen?.(true);
            }
        } else if (tutorialId === "hapus_member") {
            if (idx === 0) {
                controlsRef.current.setIsConfirmOpen?.(false);
            } else if (idx === 1) {
                controlsRef.current.setMemberToDelete?.(effectiveSample);
                controlsRef.current.setIsConfirmOpen?.(true);
            }
        }
        // filter_member: no modal sync needed
    }, []);

    const cleanupAndRestore = useCallback(() => {
        controlsRef.current.setIsDialogOpen(false);
        controlsRef.current.setEditingMember?.(null);
        controlsRef.current.setIsAdjustPointsOpen?.(false);
        controlsRef.current.setSelectedMemberForPoints?.(null);
        controlsRef.current.setIsConfirmOpen?.(false);
        controlsRef.current.setMemberToDelete?.(null);
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
        return tutorialSteps.map((s, idx) => ({
            target: s.target,
            title: s.title,
            content: s.content,
            placement: s.placement || "bottom",
            disableBeacon: true,
            skipBeacon: true,
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
                        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                    }
                }

                await new Promise((res) => setTimeout(res, 120));
            },
        }));
    }, [tutorialSteps, activeTutorial, syncModalForStep]);

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
