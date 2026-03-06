"use client";

import { useWebHaptics } from "web-haptics/react";

export function useHaptics() {
  const { trigger, cancel } = useWebHaptics();

  return {
    checkHabit: () => trigger("success"),
    uncheckHabit: () => trigger("light"),
    celebrate: () => trigger("success"),
    tap: () => trigger("selection"),
    drag: () => trigger("medium"),
    // Short 30ms pulse for rapid hold-to-check feedback
    buzz: () => trigger({ pattern: [{ duration: 30, intensity: 0.8 }] }),
    error: () => trigger("error"),
    cancel,
  };
}
