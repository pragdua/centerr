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
    error: () => trigger("error"),
    cancel,
  };
}
