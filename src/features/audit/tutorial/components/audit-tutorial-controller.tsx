"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useAuditTutorial, type AuditTutorialControls } from "../hooks/use-audit-tutorial";
import { useAuditTutorialStore } from "@/stores/audit-tutorial-store";
import { AuditTutorialTooltip } from "./audit-tutorial-tooltip";
import { AuditTutorialCursor } from "./audit-tutorial-cursor";
import { AuditTutorialMenuDialog } from "./audit-tutorial-menu-dialog";

export type AuditTutorialControllerProps = AuditTutorialControls;

export function AuditTutorialController(props: AuditTutorialControllerProps) {
    const activeTutorial = useAuditTutorialStore((state) => state.activeTutorial);
    const {
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useAuditTutorial(props);

    return (
        <>
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "audit-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={AuditTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <AuditTutorialCursor />
            <AuditTutorialMenuDialog />
        </>
    );
}
