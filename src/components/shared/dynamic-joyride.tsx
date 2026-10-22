"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { Joyride } from "react-joyride";

/**
 * Lazy-loaded Joyride component to prevent loading the heavy `react-joyride`
 * library (and its floater DOM scripts) until a tour is actively started.
 */
export const DynamicJoyride = dynamic(
    () => import("react-joyride").then((mod) => mod.Joyride),
    { ssr: false }
);

export type DynamicJoyrideProps = ComponentProps<typeof Joyride>;
