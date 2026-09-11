import { useCheckoutStore } from "@/stores/checkout-store";
import { useTutorialStore } from "@/stores/tutorial-store";
import type { TutorialAction, TutorialDialogType } from "../types/tutorial";
import { TYPING_SPEED } from "../constants/tutorial-constants";

export interface TutorialContextControls {
    openDialog: (dialog: TutorialDialogType) => void;
    closeDialog: (dialog: TutorialDialogType) => void;
    setActiveMobileTab?: (tab: "cart" | "totals") => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function setInputValueWithEvents(inputEl: HTMLInputElement, value: string) {
    if (typeof window === "undefined") return;
    const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
    )?.set;
    if (nativeSetter) {
        nativeSetter.call(inputEl, value);
    } else {
        inputEl.value = value;
    }
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
}

export async function simulateTyping(
    inputEl: HTMLInputElement,
    text: string,
    onProgress?: (val: string) => void
) {
    inputEl.focus();
    setInputValueWithEvents(inputEl, "");

    for (let i = 0; i < text.length; i++) {
        await sleep(TYPING_SPEED);
        setInputValueWithEvents(inputEl, text.slice(0, i + 1));
        onProgress?.(inputEl.value);
    }
}

export async function executeTutorialAction(
    action: TutorialAction,
    controls: TutorialContextControls
): Promise<void> {
    const store = useCheckoutStore.getState();

    switch (action.type) {
        case "inject_cart": {
            store.setCart(action.items);
            break;
        }

        case "inject_member": {
            store.setSelectedMember(action.member);
            break;
        }

        case "clear_member": {
            store.setSelectedMember(null);
            break;
        }

        case "set_discount": {
            store.setDiscountType(action.discountType);
            store.setDiscountValue(action.value);
            break;
        }

        case "set_nama": {
            store.setNamaTransaksi(action.nama);
            break;
        }

        case "clear_cart": {
            store.clearCart();
            break;
        }

        case "clear_input": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement
                ? container
                : container?.querySelector("input")) as HTMLInputElement | null;
            if (el) {
                setInputValueWithEvents(el, "");
                el.blur();
            }
            break;
        }

        case "inject_hold": {
            store.addHoldTransaction(action.hold);
            store.clearCart();
            store.setNamaTransaksi("");
            break;
        }

        case "clear_hold": {
            store.clearHoldList();
            break;
        }

        case "open_dialog": {
            controls.openDialog(action.dialog);
            break;
        }

        case "close_dialog": {
            controls.closeDialog(action.dialog);
            break;
        }

        case "type_text": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement
                ? container
                : container?.querySelector("input")) as HTMLInputElement | null;
            if (el) {
                useTutorialStore.getState().updateCursor({ label: "Mengetik..." });
                await simulateTyping(el, action.text);
                useTutorialStore.getState().updateCursor({ label: undefined });
            }
            break;
        }

        case "click": {
            const el = document.querySelector(action.target) as HTMLElement | null;
            if (el) {
                useTutorialStore.getState().triggerCursorClick();
                await sleep(200);
                el.click();
            }
            break;
        }

        case "wait": {
            await sleep(action.ms);
            break;
        }

        case "sequence": {
            for (const subAction of action.actions) {
                await executeTutorialAction(subAction, controls);
                await sleep(250);
            }
            break;
        }
    }
}
