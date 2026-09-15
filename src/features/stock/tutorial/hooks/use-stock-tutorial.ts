"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useStockTutorialStore } from "@/stores/stock-tutorial-store";
import { getStockTutorialSteps } from "../steps/stock-tutorial-steps";
import {
    setInputValueWithEvents,
    simulateTyping,
} from "@/features/tutorial/hooks/tutorial-action-executor";
import type { StockTutorialAction } from "../types/stock-tutorial";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";
import { useAppRouter } from "@/hooks/use-app-router";
import { toast } from "sonner";
import { MOCK_OPNAME_UID } from "../constants/stock-tutorial-constants";

function getVisibleElement(selector: string): Element | null {
    if (typeof document === "undefined") return null;
    if (!selector || selector === "body") return document.body;

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return null;

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            return el;
        }
    }

    return elements[0] || null;
}

async function waitForElement(selector: string, timeout = 3000): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    if (selector === "body") return document.body;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = getVisibleElement(selector);
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return el;
        }
        await new Promise((r) => setTimeout(r, 60));
    }
    return getVisibleElement(selector);
}

async function runStockAction(
    action: StockTutorialAction,
    routerPush: (url: string) => void
): Promise<void> {
    switch (action.type) {
        case "open_dialog": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("stock-tutorial-open-dialog", {
                        detail: { dialog: action.dialog },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 200));
            break;
        }

        case "close_dialog": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("stock-tutorial-close-dialog"));
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "set_dialog_tab": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("stock-tutorial-set-tab", {
                        detail: { tab: action.tab },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "set_mock_excel_file": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("stock-tutorial-set-mock-file"));
            }
            await new Promise((r) => setTimeout(r, 200));
            break;
        }

        case "navigate": {
            if (typeof window !== "undefined" && window.location.pathname !== action.url) {
                routerPush(action.url);
                await new Promise((r) => setTimeout(r, 600));
            }
            break;
        }

        case "type_text": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement
                ? container
                : container?.querySelector("input")) as HTMLInputElement | null;
            if (el) {
                useStockTutorialStore.getState().updateCursor({ label: "Mengetik..." });
                await simulateTyping(el, action.text);
                useStockTutorialStore.getState().updateCursor({ label: undefined });
            }
            break;
        }

        case "click": {
            const el = document.querySelector(action.target) as HTMLElement | null;
            if (el) {
                useStockTutorialStore.getState().triggerCursorClick();
                await new Promise((r) => setTimeout(r, 200));
                el.click();
            }
            break;
        }

        case "wait": {
            await new Promise((r) => setTimeout(r, action.ms));
            break;
        }

        case "inject_mock_item": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("stock-tutorial-inject-item"));
            }
            await new Promise((r) => setTimeout(r, 200));
            break;
        }

        case "sequence": {
            for (const subAction of action.actions) {
                await runStockAction(subAction, routerPush);
                await new Promise((r) => setTimeout(r, 200));
            }
            break;
        }
    }
}

export function useStockTutorial() {
    const router = useAppRouter();
    const activeTutorial = useStockTutorialStore((state) => state.activeTutorial);
    const selectedBranch = useStockTutorialStore((state) => state.selectedBranch);
    const setSelectedBranch = useStockTutorialStore((state) => state.setSelectedBranch);
    const stepIndex = useStockTutorialStore((state) => state.stepIndex);
    const isRunning = useStockTutorialStore((state) => state.isRunning);

    const startTutorial = useStockTutorialStore((state) => state.startTutorial);
    const stopTutorial = useStockTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useStockTutorialStore((state) => state.setStepIndex);
    const clearSnapshot = useStockTutorialStore((state) => state.clearSnapshot);
    const updateCursor = useStockTutorialStore((state) => state.updateCursor);

    // Steps configuration dynamically calculated based on selected branch
    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return getStockTutorialSteps(selectedBranch);
    }, [activeTutorial, selectedBranch]);

    // Action executor
    const executeAction = useCallback(
        async (action: StockTutorialAction) => {
            await runStockAction(action, router.push);
        },
        [router]
    );

    // Listen for branch selection event from Step 4 card buttons
    useEffect(() => {
        const handleBranchSelect = async (e: Event) => {
            const customEvent = e as CustomEvent<{ branch: "excel" | "manual" }>;
            const branch = customEvent.detail?.branch;
            if (!branch) return;
            setSelectedBranch(branch);
            if (branch === "excel") {
                await executeAction({ type: "set_dialog_tab", tab: "import" });
            } else {
                await executeAction({ type: "set_dialog_tab", tab: "manual" });
            }
            // Move to Step 5 (index 4)
            setStepIndex(4);
        };
        window.addEventListener("stock-tutorial-select-branch", handleBranchSelect);
        return () => {
            window.removeEventListener("stock-tutorial-select-branch", handleBranchSelect);
        };
    }, [executeAction, setSelectedBranch, setStepIndex]);

    // Position cursor helper
    const positionCursorAt = useCallback(
        (targetSelector: string) => {
            if (!targetSelector || targetSelector === "body") {
                updateCursor({ visible: false });
                return;
            }
            const el = getVisibleElement(targetSelector);
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

    // Ensure target element is scrolled into view immediately
    const ensureElementVisible = useCallback((targetSelector: string) => {
        if (typeof document === "undefined" || !targetSelector || targetSelector === "body") return;
        const el = getVisibleElement(targetSelector);
        if (el) {
            el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
            window.dispatchEvent(new Event("resize"));
        }
    }, []);

    // Cleanup & Restore Snapshot
    const cleanupAndRestore = useCallback(() => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("stock-tutorial-cleanup"));
        }
        clearSnapshot();

        // Clean up DOM input fields
        if (typeof document !== "undefined") {
            const scannerInput = document.querySelector("#barcode-scanner-section input") as HTMLInputElement | null;
            if (scannerInput) {
                setInputValueWithEvents(scannerInput, "");
                scannerInput.blur();
            }

            const notesInput = document.querySelector("#opname-manual-notes-input") as HTMLInputElement | null;
            if (notesInput) {
                setInputValueWithEvents(notesInput, "");
                notesInput.blur();
            }

            const excelNotes = document.querySelector("#opname-excel-notes-input") as HTMLInputElement | null;
            if (excelNotes) {
                setInputValueWithEvents(excelNotes, "");
                excelNotes.blur();
            }

            // Remove any lingering Joyride portal
            const portal = document.getElementById("react-joyride-portal");
            if (portal) {
                portal.style.display = "none";
                setTimeout(() => portal.remove(), 50);
            }
        }

        updateCursor({ visible: false, clicking: false, label: undefined });
    }, [clearSnapshot, updateCursor]);

    // Watchdog for abrupt stopping
    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (useStockTutorialStore.getState().isRunning) {
                cleanupAndRestore();
                useStockTutorialStore.getState().stopTutorial();
            }
        };
    }, [cleanupAndRestore]);

    // Joyride Steps format with center placement for last step
    const joyrideSteps: Step[] = useMemo(() => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

        return tutorialSteps.map((s, idx) => {
            const isLastStep = idx === tutorialSteps.length - 1;
            const isCentered = isLastStep || s.placement === "center" || s.target === "body";
            const isOverlayNav = Boolean(s.overlayNav || s.variant === "overlay_nav" || s.variant === "banner");

            return {
                target: isCentered ? "body" : s.target,
                title: s.title,
                content: s.content,
                placement: isCentered
                    ? ("center" as const)
                    : isMobile && (s.placement === "left" || s.placement === "right")
                    ? "auto"
                    : (s.placement || "bottom"),
                skipBeacon: true,
                disableBeacon: true,
                skipScroll: true,
                spotlightClicks: false,
                floatingOptions: {
                    strategy: "fixed",
                },
                data: {
                    overlayNav: isOverlayNav,
                    variant: s.variant || (isOverlayNav ? "overlay_nav" : "tooltip"),
                },
            };
        });
    }, [tutorialSteps]);

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

    // Handle Joyride events
    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    const nextIndex = index + 1;
                    if (nextIndex < tutorialSteps.length) {
                        const nextStep = tutorialSteps[nextIndex];

                        // Transition from Step 3 (btn-new-opname) to Step 4 (Branching Step)
                        if (index === 2) {
                            await executeAction({ type: "open_dialog", dialog: "opname_create" });
                            await executeAction({ type: "set_dialog_tab", tab: "import" });
                        }

                        // Transition from Step 4 if user clicked "Next" without clicking branch cards
                        if (index === 3 && !selectedBranch) {
                            setSelectedBranch("excel");
                            await executeAction({ type: "set_dialog_tab", tab: "import" });
                        }

                        // Transition from Dialog Submit Step to Items Page (Step 7 -> Step 8):
                        // In both Excel and Manual, dialog submit is at index 6
                        if (index === 6) {
                            await executeAction({ type: "close_dialog" });
                            await executeAction({
                                type: "navigate",
                                url: `/admin/inventory/stock-opname/${MOCK_OPNAME_UID}/items`,
                            });
                        }

                        // Transition from Finalize Step to Completion Step:
                        // Excel: index === 9 (Step 10 finalize -> Step 11 completion)
                        // Manual: index === 12 (Step 13 finalize -> Step 14 completion)
                        const isFinalizeStep =
                            (selectedBranch === "excel" && index === 9) ||
                            (selectedBranch === "manual" && index === 12) ||
                            index === tutorialSteps.length - 2;

                        if (isFinalizeStep) {
                            toast.success("Proses finalisasi stock opname selesai!");
                            await executeAction({
                                type: "navigate",
                                url: "/admin/inventory/stock-opname",
                            });
                        }

                        // Handle page navigation if step contains navigate action
                        if (nextStep.action?.type === "navigate") {
                            await executeAction(nextStep.action);
                        }

                        // Pre-inject mock state if next step needs them
                        if (
                            nextStep.action &&
                            ["inject_mock_item"].includes(nextStep.action.type)
                        ) {
                            await executeAction(nextStep.action);
                        }

                        ensureElementVisible(nextStep.target);
                        await waitForElement(nextStep.target, 2500);
                        setStepIndex(nextIndex);
                    } else {
                        cleanupAndRestore();
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        const prevStep = tutorialSteps[prevIndex];

                        // Backward transition: if navigating back to Step 3 or earlier, ensure opname modal is closed!
                        if (prevIndex <= 2) {
                            await executeAction({ type: "close_dialog" });
                        }

                        // Backward transition from Step 5 to Step 4 (Branching Step)
                        if (prevIndex === 3) {
                            await executeAction({ type: "open_dialog", dialog: "opname_create" });
                        }

                        // Backward transition from Step 8 (items page) back to Step 7 (opname dialog submit)
                        if (prevIndex === 6) {
                            await executeAction({
                                type: "navigate",
                                url: "/admin/inventory/stock-opname",
                            });
                            await executeAction({
                                type: "open_dialog",
                                dialog: "opname_create",
                            });
                            await executeAction({
                                type: "set_dialog_tab",
                                tab: selectedBranch === "manual" ? "manual" : "import",
                            });
                        }

                        // Backward transition from completion step back to finalize step
                        const isPrevFinalizeStep =
                            (selectedBranch === "excel" && prevIndex === 9) ||
                            (selectedBranch === "manual" && prevIndex === 12);

                        if (isPrevFinalizeStep) {
                            await executeAction({
                                type: "navigate",
                                url: `/admin/inventory/stock-opname/${MOCK_OPNAME_UID}/items`,
                            });
                        }

                        ensureElementVisible(prevStep.target);
                        await waitForElement(prevStep.target, 2500);
                        setStepIndex(prevIndex);
                    }
                }
            }

            if (type === EVENTS.TOOLTIP) {
                const step = tutorialSteps[index];
                if (step) {
                    setTimeout(() => {
                        positionCursorAt(step.target);
                    }, 80);

                    // Execute step action (sequence, seeder typing, notes, etc.)
                    if (step.action && !["close_dialog", "navigate"].includes(step.action.type)) {
                        await executeAction(step.action);
                        setTimeout(() => {
                            positionCursorAt(step.target);
                        }, 80);
                    }
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
            selectedBranch,
            setSelectedBranch,
            executeAction,
            ensureElementVisible,
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
