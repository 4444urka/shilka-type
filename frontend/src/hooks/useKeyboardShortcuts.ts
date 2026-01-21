import { useEffect, useCallback, useRef } from "react";

interface UseKeyboardShortcutsOptions {
  onRestart: () => void;
  onEscape?: () => void;
  enabled?: boolean;
  /** Keys that trigger restart (default: Tab, Escape) */
  restartKeys?: string[];
}

/**
 * Hook for handling keyboard shortcuts in the typing app
 * - Tab: Quick restart (common in typing trainers)
 * - Escape: Quick restart / cancel
 */
export const useKeyboardShortcuts = ({
  onRestart,
  onEscape,
  enabled = true,
  restartKeys = ["Tab", "Escape"],
}: UseKeyboardShortcutsOptions) => {
  const lastKeyTimeRef = useRef<number>(0);
  const DEBOUNCE_MS = 200; // Prevent accidental double-triggers

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if focus is on form elements (except our hidden typing input)
      const activeElement = document.activeElement;
      if (activeElement) {
        const tag = activeElement.tagName.toUpperCase();
        const isHiddenTypingInput =
          activeElement.getAttribute("aria-label") === "typing-input";

        if (
          (tag === "INPUT" && !isHiddenTypingInput) ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          (activeElement as HTMLElement).isContentEditable
        ) {
          return;
        }
      }

      // Ignore if any modifier keys are pressed (except Shift)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const now = Date.now();
      const isRestartKey = restartKeys.includes(event.key);

      if (isRestartKey) {
        event.preventDefault();

        // Debounce to prevent double-triggers
        if (now - lastKeyTimeRef.current < DEBOUNCE_MS) {
          return;
        }
        lastKeyTimeRef.current = now;

        if (event.key === "Escape" && onEscape) {
          onEscape();
        } else {
          onRestart();
        }
      }
    },
    [enabled, onRestart, onEscape, restartKeys]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
};

export default useKeyboardShortcuts;
