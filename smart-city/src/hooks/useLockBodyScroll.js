import { useEffect } from "react";

/** Locks page scroll while `locked` is true (used for the incident modal). */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [locked]);
}
