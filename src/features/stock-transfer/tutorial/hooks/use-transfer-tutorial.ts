"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { type Step, ACTIONS, EVENTS, STATUS, type EventData } from "react-joyride";
import { useTransferTutorialStore } from "@/stores/transfer-tutorial-store";
import { TRANSFER_TUTORIAL_STEPS } from "../steps/transfer-tutorial-steps";
import type { TransferTutorialAction } from "../types/transfer-tutorial";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePathname } from "next/navigation";

import {
    MOCK_INCOMING_SUMMARY_UID,
    MOCK_INCOMING_STOCK_TRANSFER_UID,
    MOCK_VALIDATION_STOCK_TRANSFER_UID,
} from "../constants/transfer-tutorial-constants";

function setInputValueWithEvents(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const proto =
        input instanceof HTMLTextAreaElement
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, value);
    } else {
        input.value = value;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function simulateTyping(el: HTMLInputElement | HTMLTextAreaElement, text: string) {
    el.focus();
    setInputValueWithEvents(el, "");
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        setInputValueWithEvents(el, el.value + char);
        await new Promise((r) => setTimeout(r, 35));
    }
}

function getVisibleElement(selector: string): HTMLElement | null {
    if (typeof document === "undefined" || !selector || selector === "body") return null;

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return null;

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            return el;
        }
    }

    return (elements[0] as HTMLElement) || null;
}

async function waitForPathname(substr: string, timeout = 4000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (typeof window !== "undefined" && window.location.pathname.includes(substr)) {
            return true;
        }
        await new Promise((r) => setTimeout(r, 50));
    }
    return false;
}

async function waitForElement(selector: string, timeout = 4000): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    const start = Date.now();
    if (selector === "body") {
        while (Date.now() - start < timeout) {
            const pageEl = document.querySelector("main, .space-y-6, [data-page-ready='true']");
            const hasFullSkeleton = document.querySelector(".animate-pulse > .bg-white");
            if (pageEl && !hasFullSkeleton) return document.body;
            await new Promise((r) => setTimeout(r, 60));
        }
        return document.body;
    }
    while (Date.now() - start < timeout) {
        const el = getVisibleElement(selector);
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const isSkeleton = el.closest(".animate-pulse") !== null;
                if (!isSkeleton) return el;
            }
        }
        await new Promise((r) => setTimeout(r, 60));
    }
    return getVisibleElement(selector);
}

async function runTransferAction(
    action: TransferTutorialAction,
    routerPush: (url: string) => void
): Promise<void> {
    switch (action.type) {
        case "set_field": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("transfer-tutorial-set-field", {
                        detail: { field: action.field, value: action.value },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "inject_items": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("transfer-tutorial-inject-items", {
                        detail: { items: action.items },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 200));
            break;
        }

        case "clear_items": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("transfer-tutorial-clear-items"));
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "type_text": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement || container instanceof HTMLTextAreaElement
                ? container
                : container?.querySelector("input, textarea")) as HTMLInputElement | HTMLTextAreaElement | null;
            if (el) {
                useTransferTutorialStore.getState().updateCursor({ label: "Mengetik..." });
                await simulateTyping(el, action.text);
                useTransferTutorialStore.getState().updateCursor({ label: undefined });
            }
            break;
        }

        case "clear_input": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement || container instanceof HTMLTextAreaElement
                ? container
                : container?.querySelector("input, textarea")) as HTMLInputElement | HTMLTextAreaElement | null;
            if (el) {
                setInputValueWithEvents(el, "");
                el.blur();
            }
            break;
        }

        case "click": {
            const el = document.querySelector(action.target) as HTMLElement | null;
            if (el) {
                useTransferTutorialStore.getState().triggerCursorClick();
                await new Promise((r) => setTimeout(r, 200));
                el.click();
            }
            break;
        }

        case "navigate": {
            if (typeof window !== "undefined") {
                const current = window.location.pathname + window.location.search;
                if (current !== action.url) {
                    routerPush(action.url);
                    await new Promise((r) => setTimeout(r, 600));
                }
            }
            break;
        }

        case "wait": {
            await new Promise((r) => setTimeout(r, action.ms));
            break;
        }

        case "sequence": {
            for (const subAction of action.actions) {
                await runTransferAction(subAction, routerPush);
            }
            break;
        }
    }
}

export function useTransferTutorial() {
    const router = useAppRouter();
    const routerRef = useRef(router);
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    const activeTutorial = useTransferTutorialStore((state) => state.activeTutorial);
    const activeTutorialRef = useRef(activeTutorial);
    useEffect(() => {
        if (activeTutorial) {
            activeTutorialRef.current = activeTutorial;
        }
    }, [activeTutorial]);

    const isRunning = useTransferTutorialStore((state) => state.isRunning);
    const stepIndex = useTransferTutorialStore((state) => state.stepIndex);
    const setStepIndex = useTransferTutorialStore((state) => state.setStepIndex);
    const startTutorial = useTransferTutorialStore((state) => state.startTutorial);
    const stopTutorial = useTransferTutorialStore((state) => state.stopTutorial);
    const updateCursor = useTransferTutorialStore((state) => state.updateCursor);
    const clearSnapshot = useTransferTutorialStore((state) => state.clearSnapshot);

    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return TRANSFER_TUTORIAL_STEPS[activeTutorial] || [];
    }, [activeTutorial]);

    // Position virtual cursor on target element
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

    // Ensure target element is smoothly scrolled into view
    const ensureElementVisible = useCallback((targetSelector: string) => {
        if (typeof document === "undefined" || !targetSelector || targetSelector === "body") return;
        const el = getVisibleElement(targetSelector);
        if (el && !el.closest("[role='dialog']") && !targetSelector.startsWith("#transfer-dialog-")) {
            const isTall = el.offsetHeight > 250;
            el.scrollIntoView({ behavior: "smooth", block: isTall ? "start" : "center" });
        }
    }, []);

    // Cleanup & Restore Snapshot
    const cleanupAndRestore = useCallback(() => {
        const snap = useTransferTutorialStore.getState().preSnapshot;
        if (snap) {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("transfer-tutorial-restore-snapshot", {
                        detail: snap,
                    })
                );
            }
            clearSnapshot();
        } else {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("transfer-tutorial-clear-items"));
            }
        }

        // Clean up DOM input fields if leftover
        if (typeof document !== "undefined") {
            const reqNotesInput = document.querySelector("#req-notes-input") as HTMLTextAreaElement | HTMLInputElement | null;
            if (reqNotesInput) {
                setInputValueWithEvents(reqNotesInput, "");
                reqNotesInput.blur();
            }
            const transferNotesInput = document.querySelector("#transfer-notes-input") as HTMLTextAreaElement | HTMLInputElement | null;
            if (transferNotesInput) {
                setInputValueWithEvents(transferNotesInput, "");
                transferNotesInput.blur();
            }
            const reqBarcodeInput = document.querySelector("#req-barcode-input") as HTMLInputElement | null;
            if (reqBarcodeInput) {
                setInputValueWithEvents(reqBarcodeInput, "");
                reqBarcodeInput.blur();
            }
            const transferBarcodeInput = document.querySelector("#transfer-barcode-input") as HTMLInputElement | null;
            if (transferBarcodeInput) {
                setInputValueWithEvents(transferBarcodeInput, "");
                transferBarcodeInput.blur();
            }

            // Dismiss any open confirmation dialog
            const transferDialogCancelBtn = document.querySelector("#transfer-dialog-btn-cancel") as HTMLButtonElement | null;
            if (transferDialogCancelBtn) {
                transferDialogCancelBtn.click();
            }

            const validateDialogCancelBtn = document.querySelector("#transfer-dialog-btn-cancel-validate") as HTMLButtonElement | null;
            if (validateDialogCancelBtn) {
                validateDialogCancelBtn.click();
            }
        }

        if (typeof window !== "undefined" && window.location.search.includes(MOCK_INCOMING_SUMMARY_UID)) {
            routerRef.current.push("/admin/request-transfer/incoming");
        }

        if (
            typeof window !== "undefined" &&
            window.location.pathname.includes(MOCK_INCOMING_STOCK_TRANSFER_UID)
        ) {
            routerRef.current.push("/admin/inventory/stock-transfer/terima");
        }

        if (
            typeof window !== "undefined" &&
            window.location.pathname.includes(MOCK_VALIDATION_STOCK_TRANSFER_UID)
        ) {
            routerRef.current.push("/admin/inventory/stock-transfer/validasi");
        }

        if (
            typeof window !== "undefined" &&
            window.location.pathname === "/admin/inventory/stock-transfer/new" &&
            (useTransferTutorialStore.getState().activeTutorial === "stock_transfer_create" ||
                activeTutorialRef.current === "stock_transfer_create")
        ) {
            routerRef.current.push("/admin/inventory/stock-transfer");
        }
    }, [clearSnapshot]);

    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    const pathname = usePathname();

    // Route guard: immediately auto-stop and cleanup if user navigates outside allowed tutorial pages
    useEffect(() => {
        if (!isRunning || !activeTutorial) return;

        if (activeTutorial === "request_transfer_create") {
            if (pathname !== "/admin/request-transfer/create") {
                cleanupAndRestore();
                stopTutorial();
            }
        } else if (activeTutorial === "request_transfer_incoming") {
            const isIncomingList = pathname === "/admin/request-transfer/incoming";
            const isIncomingDetail = pathname === "/admin/request-transfer/incoming/detail";
            if (!isIncomingList && !isIncomingDetail) {
                cleanupAndRestore();
                stopTutorial();
            } else if (isIncomingList && stepIndex >= 4) {
                cleanupAndRestore();
                stopTutorial();
            }
        } else if (activeTutorial === "stock_transfer_create") {
            const isList = pathname === "/admin/inventory/stock-transfer" || pathname === "/admin/stock-transfer";
            const isNew = pathname === "/admin/inventory/stock-transfer/new" || pathname === "/admin/stock-transfer/new";
            if (!isList && !isNew) {
                cleanupAndRestore();
                stopTutorial();
            } else if (isList && stepIndex >= 4) {
                cleanupAndRestore();
                stopTutorial();
            }
        } else if (activeTutorial === "stock_transfer_receive") {
            const isList = pathname === "/admin/inventory/stock-transfer/terima" || pathname === "/admin/inventory/stock-transfer";
            const isDetail = pathname.includes(MOCK_INCOMING_STOCK_TRANSFER_UID) || (pathname.startsWith("/admin/inventory/stock-transfer/") && pathname !== "/admin/inventory/stock-transfer/terima" && pathname !== "/admin/inventory/stock-transfer/validasi");
            if (!isList && !isDetail) {
                cleanupAndRestore();
                stopTutorial();
            } else if (isList && stepIndex >= 4 && stepIndex < 12) {
                if (typeof window !== "undefined" && !window.location.pathname.includes(MOCK_INCOMING_STOCK_TRANSFER_UID)) {
                    cleanupAndRestore();
                    stopTutorial();
                }
            } else if (isDetail && stepIndex < 4) {
                setStepIndex(4);
            }
        } else if (activeTutorial === "stock_transfer_validation") {
            const isList = pathname === "/admin/inventory/stock-transfer/validasi";
            const isDetail =
                pathname.includes(MOCK_VALIDATION_STOCK_TRANSFER_UID) ||
                (pathname.startsWith("/admin/inventory/stock-transfer/") &&
                    pathname !== "/admin/inventory/stock-transfer/terima" &&
                    pathname !== "/admin/inventory/stock-transfer/validasi");
            if (!isList && !isDetail) {
                cleanupAndRestore();
                stopTutorial();
            } else if (isList && stepIndex >= 4 && stepIndex < 12) {
                if (typeof window !== "undefined" && !window.location.pathname.includes(MOCK_VALIDATION_STOCK_TRANSFER_UID)) {
                    cleanupAndRestore();
                    stopTutorial();
                }
            } else if (isDetail && stepIndex < 4) {
                setStepIndex(4);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, isRunning, activeTutorial, stepIndex, cleanupAndRestore, stopTutorial]);

    // Global Escape key listener to stop tutorial
    useEffect(() => {
        if (!isRunning) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                cleanupAndRestore();
                stopTutorial();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isRunning, cleanupAndRestore, stopTutorial]);

    // Joyride Steps format
    const joyrideSteps: Step[] = useMemo(() => {
        return tutorialSteps.map((s, idx) => {
            const isLastStep = idx === tutorialSteps.length - 1;
            const isTargetBody = isLastStep || s.target === "body";
            const isOverlayNav = Boolean(s.overlayNav || s.variant === "overlay_nav");

            return {
                target: isTargetBody ? "body" : s.target,
                title: s.title,
                content: s.content,
                placement: isTargetBody ? ("center" as const) : (s.placement || "bottom"),
                skipBeacon: true,
                disableBeacon: true,
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

    const isIncomingListTarget = useCallback((target: string) => {
        return [
            "#req-incoming-list-header",
            "#req-incoming-btn-generate-link",
            "#req-incoming-filter",
            "#req-incoming-row-0",
            "#req-incoming-summary-table",
        ].includes(target);
    }, []);

    const isStockTransferListTarget = useCallback((target: string) => {
        return [
            "#transfer-list-header",
            "#transfer-stat-cards",
            "#transfer-list-filters",
            "#transfer-btn-create-new",
        ].includes(target);
    }, []);

    const isStockTransferReceiveListTarget = useCallback((target: string) => {
        return [
            "#transfer-list-header",
            "#transfer-stat-cards",
            "#transfer-list-filters",
            "#transfer-row-0",
            "#transfer-btn-detail-0",
            "#transfer-btn-detail-0-btn",
        ].includes(target);
    }, []);

    const isStockTransferValidationListTarget = useCallback((target: string) => {
        return [
            "#transfer-list-header",
            "#transfer-stat-cards",
            "#transfer-list-filters",
            "#transfer-row-0",
            "#transfer-btn-detail-0",
            "#transfer-btn-detail-0-btn",
        ].includes(target);
    }, []);

    // Action executor
    const executeAction = useCallback(
        async (action: TransferTutorialAction) => {
            await runTransferAction(action, routerRef.current.push);
        },
        []
    );

    // Handle Joyride events
    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    const nextIndex = index + 1;
                    if (nextIndex < tutorialSteps.length) {
                        const currentStep = tutorialSteps[index];
                        const nextStep = tutorialSteps[nextIndex];

                        // Transition from List page to Detail page for request transfer incoming
                        if (
                            activeTutorial === "request_transfer_incoming" &&
                            isIncomingListTarget(currentStep.target) &&
                            !isIncomingListTarget(nextStep.target) &&
                            nextStep.target.startsWith("#req-incoming-")
                        ) {
                            routerRef.current.push(`/admin/request-transfer/incoming/detail?summary_uid=${MOCK_INCOMING_SUMMARY_UID}`);
                            await waitForPathname("/request-transfer/incoming/detail");
                        }

                        // Transition from Stock Transfer Outgoing List page to New Form (step 4 -> step 5)
                        if (
                            activeTutorial === "stock_transfer_create" &&
                            isStockTransferListTarget(currentStep.target) &&
                            !isStockTransferListTarget(nextStep.target) &&
                            (nextStep.target.startsWith("#transfer-route") || nextStep.target.startsWith("#transfer-"))
                        ) {
                            routerRef.current.push("/admin/inventory/stock-transfer/new");
                            await waitForPathname("/stock-transfer/new");
                        }

                        // Transition from Stock Transfer Incoming List page to Detail page (step 4 -> step 5)
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            isStockTransferReceiveListTarget(currentStep.target) &&
                            !isStockTransferReceiveListTarget(nextStep.target) &&
                            nextStep.target.startsWith("#transfer-detail-")
                        ) {
                            routerRef.current.push(`/admin/inventory/stock-transfer/${MOCK_INCOMING_STOCK_TRANSFER_UID}?from=incoming`);
                            await waitForPathname(MOCK_INCOMING_STOCK_TRANSFER_UID);
                        }

                        // Open confirm receive dialog when advancing from Step 9 to Step 10
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            currentStep.target === "#transfer-btn-terima-0" &&
                            nextStep.target.startsWith("#transfer-dialog-")
                        ) {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-open-dialog", { detail: { mode: "receive" } }));
                            await waitForElement("#transfer-dialog-confirm-receive", 2500);
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Close confirm receive dialog when advancing from Step 10 to Step 11
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            currentStep.target.startsWith("#transfer-dialog-") &&
                            nextStep.target === "#transfer-btn-tolak-0"
                        ) {
                            const cancelBtn = document.querySelector("#transfer-dialog-btn-cancel") as HTMLButtonElement | null;
                            if (cancelBtn) {
                                cancelBtn.click();
                            } else {
                                // dialog may already be closed (e.g., after tab switch)
                            }
                            await new Promise((r) => setTimeout(r, 250));
                        }

                        // Open rejection warning dialog when advancing from Step 11 to Step 12
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            currentStep.target === "#transfer-btn-tolak-0" &&
                            nextStep.target.startsWith("#transfer-dialog-")
                        ) {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-open-dialog", { detail: { mode: "reject" } }));
                            await waitForElement("#transfer-dialog-confirm-receive", 2500);
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Close rejection warning dialog when advancing from Step 12 to Step 13 (body)
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            currentStep.target.startsWith("#transfer-dialog-") &&
                            nextStep.target === "body"
                        ) {
                            const cancelBtn = document.querySelector("#transfer-dialog-btn-cancel") as HTMLButtonElement | null;
                            if (cancelBtn) {
                                cancelBtn.click();
                            }
                            await new Promise((r) => setTimeout(r, 250));
                        }

                        // Transition from Stock Transfer Validation List page to Detail page (step 4 -> step 5)
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            isStockTransferValidationListTarget(currentStep.target) &&
                            !isStockTransferValidationListTarget(nextStep.target) &&
                            nextStep.target.startsWith("#transfer-detail-")
                        ) {
                            routerRef.current.push(`/admin/inventory/stock-transfer/${MOCK_VALIDATION_STOCK_TRANSFER_UID}?from=validations`);
                            await waitForPathname(MOCK_VALIDATION_STOCK_TRANSFER_UID);
                        }

                        // Open approve validation dialog when advancing from Step 9 to Step 10
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            currentStep.target === "#transfer-btn-validate-approve-0" &&
                            nextStep.target.startsWith("#transfer-dialog-")
                        ) {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-open-dialog", { detail: { mode: "approve_validation" } }));
                            await waitForElement("#transfer-dialog-confirm-validate", 2500);
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Close approve validation dialog when advancing from Step 10 to Step 11
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            currentStep.target.startsWith("#transfer-dialog-") &&
                            nextStep.target === "#transfer-btn-validate-reject-0"
                        ) {
                            const cancelBtn = document.querySelector("#transfer-dialog-btn-cancel-validate") as HTMLButtonElement | null;
                            if (cancelBtn) {
                                cancelBtn.click();
                            }
                            await new Promise((r) => setTimeout(r, 250));
                        }

                        // Open reject validation dialog when advancing from Step 11 to Step 12
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            currentStep.target === "#transfer-btn-validate-reject-0" &&
                            nextStep.target.startsWith("#transfer-dialog-")
                        ) {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-open-dialog", { detail: { mode: "reject_validation" } }));
                            await waitForElement("#transfer-dialog-confirm-validate", 2500);
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Close reject validation dialog when advancing from Step 12 to Step 13 (body)
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            currentStep.target.startsWith("#transfer-dialog-") &&
                            nextStep.target === "body"
                        ) {
                            const cancelBtn = document.querySelector("#transfer-dialog-btn-cancel-validate") as HTMLButtonElement | null;
                            if (cancelBtn) {
                                cancelBtn.click();
                            }
                            await new Promise((r) => setTimeout(r, 250));
                        }

                        // Ensure matrix view is active if target is matrix
                        if (nextStep.target.startsWith("#req-incoming-matrix")) {
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new CustomEvent("transfer-tutorial-set-matrix-view"));
                            }
                        }

                        // Pre-inject mock state if next step needs them
                        if (
                            nextStep.action &&
                            ["inject_items", "clear_items", "set_field"].includes(nextStep.action.type)
                        ) {
                            await executeAction(nextStep.action);
                        }

                        ensureElementVisible(nextStep.target);
                        await waitForElement(nextStep.target, 4000);
                        await new Promise((r) => setTimeout(r, 150));
                        setStepIndex(nextIndex);
                    } else {
                        cleanupAndRestore();
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        const currentStep = tutorialSteps[index];
                        const prevStep = tutorialSteps[prevIndex];

                        // Transition BACK from Detail page to List page for request transfer incoming
                        if (
                            activeTutorial === "request_transfer_incoming" &&
                            !isIncomingListTarget(currentStep.target) &&
                            isIncomingListTarget(prevStep.target) &&
                            currentStep.target.startsWith("#req-incoming-")
                        ) {
                            routerRef.current.push("/admin/request-transfer/incoming");
                            await waitForPathname("/request-transfer/incoming");
                        }

                        // Transition BACK from New Form to Stock Transfer Outgoing List page
                        if (
                            activeTutorial === "stock_transfer_create" &&
                            !isStockTransferListTarget(currentStep.target) &&
                            isStockTransferListTarget(prevStep.target) &&
                            (currentStep.target.startsWith("#transfer-route") || currentStep.target.startsWith("#transfer-"))
                        ) {
                            routerRef.current.push("/admin/inventory/stock-transfer");
                            await waitForPathname("/inventory/stock-transfer");
                        }

                        // Transition BACK from Detail page to Stock Transfer Incoming List page (step 5 -> step 4)
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            !isStockTransferReceiveListTarget(currentStep.target) &&
                            isStockTransferReceiveListTarget(prevStep.target) &&
                            currentStep.target.startsWith("#transfer-detail-")
                        ) {
                            routerRef.current.push("/admin/inventory/stock-transfer/terima");
                            await waitForPathname("/stock-transfer/terima");
                        }

                        // Close confirm receive dialog when going BACK from Step 10 to Step 9
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            currentStep.target.startsWith("#transfer-dialog-") &&
                            prevStep.target === "#transfer-btn-terima-0"
                        ) {
                            const cancelBtn = document.querySelector("#transfer-dialog-btn-cancel") as HTMLButtonElement | null;
                            if (cancelBtn) {
                                cancelBtn.click();
                                await new Promise((r) => setTimeout(r, 200));
                            }
                        }

                        // Re-open confirm receive dialog when going BACK from Step 11 to Step 10
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            currentStep.target === "#transfer-btn-tolak-0" &&
                            prevStep.target.startsWith("#transfer-dialog-")
                        ) {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-open-dialog", { detail: { mode: "receive" } }));
                            await waitForElement("#transfer-dialog-confirm-receive", 2500);
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Close rejection warning dialog when going BACK from Step 12 to Step 11
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            currentStep.target.startsWith("#transfer-dialog-") &&
                            prevStep.target === "#transfer-btn-tolak-0"
                        ) {
                            const cancelBtn = document.querySelector("#transfer-dialog-btn-cancel") as HTMLButtonElement | null;
                            if (cancelBtn) {
                                cancelBtn.click();
                            }
                            await new Promise((r) => setTimeout(r, 250));
                        }

                        // Re-open rejection warning dialog when going BACK from Step 13 (body) to Step 12
                        if (
                            activeTutorial === "stock_transfer_receive" &&
                            currentStep.target === "body" &&
                            prevStep.target.startsWith("#transfer-dialog-")
                        ) {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-open-dialog", { detail: { mode: "reject" } }));
                            await waitForElement("#transfer-dialog-confirm-receive", 2500);
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Transition BACK from Detail page to Stock Transfer Validation List page (step 5 -> step 4)
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            !isStockTransferValidationListTarget(currentStep.target) &&
                            isStockTransferValidationListTarget(prevStep.target) &&
                            currentStep.target.startsWith("#transfer-detail-")
                        ) {
                            routerRef.current.push("/admin/inventory/stock-transfer/validasi");
                            await waitForPathname("/stock-transfer/validasi");
                        }

                        // Close approve validation dialog when going BACK from Step 10 to Step 9
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            currentStep.target.startsWith("#transfer-dialog-") &&
                            prevStep.target === "#transfer-btn-validate-approve-0"
                        ) {
                            const cancelBtn = document.querySelector("#transfer-dialog-btn-cancel-validate") as HTMLButtonElement | null;
                            if (cancelBtn) {
                                cancelBtn.click();
                                await new Promise((r) => setTimeout(r, 200));
                            }
                        }

                        // Re-open approve validation dialog when going BACK from Step 11 to Step 10
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            currentStep.target === "#transfer-btn-validate-reject-0" &&
                            prevStep.target.startsWith("#transfer-dialog-")
                        ) {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-open-dialog", { detail: { mode: "approve_validation" } }));
                            await waitForElement("#transfer-dialog-confirm-validate", 2500);
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Close reject validation dialog when going BACK from Step 12 to Step 11
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            currentStep.target.startsWith("#transfer-dialog-") &&
                            prevStep.target === "#transfer-btn-validate-reject-0"
                        ) {
                            const cancelBtn = document.querySelector("#transfer-dialog-btn-cancel-validate") as HTMLButtonElement | null;
                            if (cancelBtn) {
                                cancelBtn.click();
                            }
                            await new Promise((r) => setTimeout(r, 250));
                        }

                        // Re-open reject validation dialog when going BACK from Step 13 (body) to Step 12
                        if (
                            activeTutorial === "stock_transfer_validation" &&
                            currentStep.target === "body" &&
                            prevStep.target.startsWith("#transfer-dialog-")
                        ) {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-open-dialog", { detail: { mode: "reject_validation" } }));
                            await waitForElement("#transfer-dialog-confirm-validate", 2500);
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Ensure matrix view is active if target is matrix
                        if (prevStep.target.startsWith("#req-incoming-matrix")) {
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new CustomEvent("transfer-tutorial-set-matrix-view"));
                            }
                        }

                        ensureElementVisible(prevStep.target);
                        await waitForElement(prevStep.target, 4000);
                        await new Promise((r) => setTimeout(r, 150));
                        setStepIndex(prevIndex);
                    }
                }
            }

            if (type === EVENTS.TOOLTIP) {
                const step = tutorialSteps[index];
                if (step) {
                    if (step.target.startsWith("#req-incoming-matrix")) {
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-set-matrix-view"));
                        }
                    }

                    setTimeout(() => {
                        positionCursorAt(step.target);
                    }, 80);

                    // Execute step action
                    if (step.action && !["clear_items", "navigate"].includes(step.action.type)) {
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
                action === ACTIONS.RESET
            ) {
                cleanupAndRestore();
                stopTutorial();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            tutorialSteps,
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
