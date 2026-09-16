"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useSalesTutorialStore } from "@/stores/sales-tutorial-store";
import { getSalesTutorialSteps } from "../steps/sales-tutorial-steps";
import {
    setInputValueWithEvents,
    simulateTyping,
} from "@/features/tutorial/hooks/tutorial-action-executor";
import type { SalesTutorialAction } from "../types/sales-tutorial";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";
import { toast } from "sonner";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePathname } from "next/navigation";

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

async function waitForElement(selector: string, timeout = 3500): Promise<Element | null> {
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

async function ensureTargetVisible(selector: string, preferredPlacement?: string): Promise<Element | null> {
    if (typeof document === "undefined" || !selector || selector === "body") return null;

    const el = await waitForElement(selector, 3500);
    if (!el) return null;

    // 1. Vertical alignment based on tooltip placement
    const verticalBlock: ScrollLogicalPosition =
        preferredPlacement === "bottom" ? "start" : preferredPlacement === "top" ? "end" : "center";

    el.scrollIntoView({ behavior: "smooth", block: verticalBlock, inline: "nearest" });

    // Also check parent scrollable vertical containers (like Scrollable in dialogs)
    let parent = el.parentElement;
    while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const overflowY = style.overflowY;
        const isScrollableY =
            (overflowY === "auto" || overflowY === "scroll") &&
            parent.scrollHeight > parent.clientHeight;

        if (isScrollableY) {
            const parentRect = parent.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();

            if (preferredPlacement === "bottom") {
                const topDiff = elRect.top - parentRect.top;
                if (topDiff > 60 || topDiff < 0) {
                    parent.scrollTo({
                        top: parent.scrollTop + topDiff - 16,
                        behavior: "smooth",
                    });
                }
            } else if (preferredPlacement === "top") {
                const bottomDiff = parentRect.bottom - elRect.bottom;
                if (bottomDiff > 60 || bottomDiff < 0) {
                    parent.scrollTo({
                        top: parent.scrollTop - (bottomDiff - 16),
                        behavior: "smooth",
                    });
                }
            }
            break;
        }
        parent = parent.parentElement;
    }

    // 2. Search for any scrollable horizontal container (e.g. DataTable overflow-auto container)
    parent = el.parentElement;
    while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const overflowX = style.overflowX;
        const isScrollableX =
            (overflowX === "auto" || overflowX === "scroll") &&
            parent.scrollWidth > parent.clientWidth;

        if (isScrollableX) {
            const parentRect = parent.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();

            const spaceFromRight = parentRect.right - elRect.right;
            const spaceFromLeft = elRect.left - parentRect.left;

            // In our DataTable, the action column is sticky right-0 (width ~100-150px).
            // We want generous breathing room (>= 260px) from the right edge so the target element
            // is scrolled well to the left and completely free of the sticky action column.
            const MIN_RIGHT_CLEARANCE = 260;

            if (spaceFromRight < MIN_RIGHT_CLEARANCE) {
                // Scroll container rightwards (increasing scrollLeft) so the element moves leftwards
                const extraScroll = (MIN_RIGHT_CLEARANCE - spaceFromRight) + 80;
                parent.scrollTo({
                    left: parent.scrollLeft + extraScroll,
                    behavior: "smooth",
                });
            } else if (spaceFromLeft < 60) {
                parent.scrollTo({
                    left: Math.max(0, parent.scrollLeft - (80 - spaceFromLeft)),
                    behavior: "smooth",
                });
            }
            break;
        }
        parent = parent.parentElement;
    }

    // Allow smooth scroll to settle, then notify Joyride to sync spotlight coords
    await new Promise((r) => setTimeout(r, 160));
    window.dispatchEvent(new Event("resize"));

    return el;
}

export function useSalesTutorial() {
    const router = useAppRouter();
    const pathname = usePathname();

    const activeTutorial = useSalesTutorialStore((state) => state.activeTutorial);
    const stepIndex = useSalesTutorialStore((state) => state.stepIndex);
    const isRunning = useSalesTutorialStore((state) => state.isRunning);
    const setStepIndex = useSalesTutorialStore((state) => state.setStepIndex);
    const stopTutorial = useSalesTutorialStore((state) => state.stopTutorial);
    const updateCursor = useSalesTutorialStore((state) => state.updateCursor);
    const triggerCursorClick = useSalesTutorialStore((state) => state.triggerCursorClick);

    const isTypingRef = useRef(false);

    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return getSalesTutorialSteps(activeTutorial);
    }, [activeTutorial]);

    // Restore search input and URL on cleanup
    const cleanupAndRestore = useCallback(() => {
        const searchInput = document.querySelector<HTMLInputElement>("#transactions-search-input");
        if (searchInput) {
            setInputValueWithEvents(searchInput, "");
        }
        if (typeof window !== "undefined" && window.location.pathname.includes("trx-dummy")) {
            router.push("/admin/transactions");
        }
    }, [router]);

    // Animate cursor to target element
    const animateCursorTo = useCallback(
        async (selector: string, label?: string) => {
            if (typeof document === "undefined") return;
            if (selector === "body") {
                updateCursor({ visible: false, label: undefined });
                return;
            }

            const el = await waitForElement(selector, 2000);
            if (!el) {
                updateCursor({ visible: false, label: undefined });
                return;
            }

            const rect = el.getBoundingClientRect();
            const targetX = rect.left + Math.min(rect.width / 2, 80);
            const targetY = rect.top + Math.min(rect.height / 2, 24);

            updateCursor({
                x: targetX,
                y: targetY,
                visible: true,
                label,
            });
        },
        [updateCursor]
    );

    // Execute automated simulated action
    const executeAction = useCallback(
        async (action: SalesTutorialAction) => {
            switch (action.type) {
                case "highlight_only": {
                    await animateCursorTo(action.selector);
                    break;
                }
                case "type_input": {
                    await animateCursorTo(action.selector, "Mengetik...");
                    const input = await waitForElement(action.selector);
                    if (input instanceof HTMLInputElement) {
                        isTypingRef.current = true;
                        await simulateTyping(input, action.text);
                        isTypingRef.current = false;
                    }
                    updateCursor({ label: undefined });
                    break;
                }
                case "click_element": {
                    await animateCursorTo(action.selector, "Mengklik...");
                    triggerCursorClick();
                    const el = await waitForElement(action.selector, 1500);
                    if (el instanceof HTMLElement) {
                        el.click();
                    }
                    await new Promise((r) => setTimeout(r, 200));
                    updateCursor({ label: undefined });
                    break;
                }
                default:
                    break;
            }
        },
        [animateCursorTo, triggerCursorClick, updateCursor]
    );

    // Run action on active step
    useEffect(() => {
        if (!isRunning || !tutorialSteps[stepIndex]) return;

        const currentStep = tutorialSteps[stepIndex];
        let cancelled = false;

        const runStep = async () => {
            if (currentStep.target !== "body") {
                await ensureTargetVisible(currentStep.target, currentStep.placement);
            }
            if (cancelled) return;

            if (currentStep.action) {
                await executeAction(currentStep.action);
            } else if (currentStep.target !== "body") {
                await animateCursorTo(currentStep.target);
            } else {
                updateCursor({ visible: false });
            }
        };

        runStep();

        return () => {
            cancelled = true;
        };
    }, [isRunning, stepIndex, tutorialSteps, executeAction, animateCursorTo, updateCursor]);

    // Cleanup on unmount or when navigating away from sales domain
    useEffect(() => {
        if (!isRunning) return;
        if (activeTutorial === "cash_drawer") {
            if (!pathname.startsWith("/admin/cash-drawer")) {
                cleanupAndRestore();
                stopTutorial();
            }
        } else if (activeTutorial === "transactions_list") {
            if (!pathname.startsWith("/admin/transactions")) {
                cleanupAndRestore();
                stopTutorial();
            }
        }
    }, [pathname, isRunning, activeTutorial, cleanupAndRestore, stopTutorial]);

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

    // Joyride Steps format with center placement for last step
    const joyrideSteps: Step[] = useMemo(() => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

        return tutorialSteps.map((s, idx) => {
            const isLastStep = idx === tutorialSteps.length - 1;
            const isCentered = isLastStep || s.placement === "center" || s.target === "body";

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
            };
        });
    }, [tutorialSteps]);

    // Handle Joyride events
    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    const nextIndex = index + 1;
                    if (nextIndex < tutorialSteps.length) {
                        // Multi-page routing for transactions_list
                        if (activeTutorial === "transactions_list") {
                            // Step 6 (index 5) -> Step 7 (index 6): Go to transaction detail page!
                            if (index === 5) {
                                router.push("/admin/transactions/trx-dummy-001");
                                await waitForElement("#trx-detail-header-info", 3500);
                            }
                            // Step 14 (index 13) -> Step 15 (index 14): Return to transactions list page for completion!
                            else if (index === 13) {
                                router.push("/admin/transactions");
                                await waitForElement("#transactions-header-bar", 3500);
                            }
                        }

                        // Tab navigation for cash_drawer
                        if (activeTutorial === "cash_drawer") {
                            // Moving to Step 16 (index 15) -> ensure movements tab is clicked
                            if (nextIndex === 15) {
                                const btn = document.querySelector<HTMLButtonElement>("#session-detail-tab-trigger-movements");
                                btn?.click();
                                await waitForElement("#session-detail-movement-item-first", 2000);
                            }
                            // Moving to Step 18 (index 17) -> ensure transactions tab is clicked
                            else if (nextIndex === 17) {
                                const btn = document.querySelector<HTMLButtonElement>("#session-detail-tab-trigger-transactions");
                                btn?.click();
                                await waitForElement("#session-detail-transaction-row-first", 2000);
                            }
                        }

                        // Toast on finish
                        if (nextIndex === tutorialSteps.length - 1) {
                            if (activeTutorial === "cash_drawer") {
                                toast.success("Tutorial Sesi Kasir & Shift selesai! Siap memantau laci kas toko.", {
                                    id: "sales-tutorial-complete",
                                    duration: 4000,
                                });
                            } else if (activeTutorial === "transactions_list") {
                                toast.success("Tutorial Riwayat Transaksi selesai! Siap mengaudit nota penjualan toko.", {
                                    id: "sales-tutorial-complete",
                                    duration: 4000,
                                });
                            }
                        }
                        setStepIndex(nextIndex);
                    } else {
                        cleanupAndRestore();
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    const prevIndex = Math.max(0, index - 1);

                    // Multi-page routing for transactions_list when going PREV
                    if (activeTutorial === "transactions_list") {
                        // Step 7 (index 6) on detail page -> Step 6 (index 5) on list page: Go back to list page!
                        if (index === 6) {
                            router.push("/admin/transactions");
                            await waitForElement("#transactions-btn-view-0, #transactions-sample-row-0", 3500);
                        }
                    }

                    // Tab navigation for cash_drawer when going PREV
                    if (activeTutorial === "cash_drawer") {
                        // Going back to Step 15 or earlier from Tab Transactions:
                        if (index === 17 && prevIndex <= 16) {
                            const btn = document.querySelector<HTMLButtonElement>("#session-detail-tab-trigger-movements");
                            btn?.click();
                            await waitForElement("#session-detail-movement-item-first", 2000);
                        }
                        // Going back to Step 14 or earlier from Tab Movements:
                        else if (index === 15 && prevIndex <= 14) {
                            const btn = document.querySelector<HTMLButtonElement>("#session-detail-tab-trigger-summary");
                            btn?.click();
                            await waitForElement("#session-detail-sales-summary-header", 2000);
                        }
                    }

                    setStepIndex(prevIndex);
                }
            } else if (type === EVENTS.STEP_BEFORE) {
                const step = tutorialSteps[index];
                if (step && step.target !== "body") {
                    await ensureTargetVisible(step.target, step.placement);
                }
            } else if (type === EVENTS.TARGET_NOT_FOUND) {
                const step = tutorialSteps[index];
                if (step && step.target !== "body") {
                    const el = await ensureTargetVisible(step.target, step.placement);
                    if (el) {
                        window.dispatchEvent(new Event("resize"));
                    }
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
        [tutorialSteps, activeTutorial, setStepIndex, stopTutorial, cleanupAndRestore, router]
    );

    return {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    };
}
