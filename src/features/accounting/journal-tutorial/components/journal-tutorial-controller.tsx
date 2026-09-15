"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Joyride } from "react-joyride";
import { useJournalTutorial } from "../hooks/use-journal-tutorial";
import { JournalTutorialTooltip } from "./journal-tutorial-tooltip";
import { JournalTutorialCursor } from "./journal-tutorial-cursor";
import { JournalTutorialMenuDialog } from "./journal-tutorial-menu-dialog";

export function JournalTutorialController() {
    const pathname = usePathname();
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useJournalTutorial();

    // Gardu rute: batasi tutorial yang boleh berjalan sesuai halaman aktif
    const isTutorialAllowed = useMemo(() => {
        if (!activeTutorial || !pathname) return false;
        if (pathname.includes("general-ledger")) {
            return activeTutorial === "buku_besar";
        }
        if (pathname.includes("manual-journal")) {
            return activeTutorial === "buat_jurnal";
        }
        if (pathname.includes("journals")) {
            return activeTutorial === "list_jurnal";
        }
        return false;
    }, [activeTutorial, pathname]);

    const shouldRun = isRunning && isTutorialAllowed && joyrideSteps.length > 0;

    return (
        <>
            {shouldRun && (
                <Joyride
                    key={activeTutorial || "journal-tutorial"}
                    steps={joyrideSteps}
                    run={shouldRun}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={JournalTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <JournalTutorialCursor />
            <JournalTutorialMenuDialog />
        </>
    );
}
