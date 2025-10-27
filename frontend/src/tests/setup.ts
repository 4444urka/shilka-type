import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Очистка после каждого теста
afterEach(() => {
  // unmount mounted components and remove DOM nodes
  cleanup();

  // restore any mocks/stubs created with vi
  try {
    vi.restoreAllMocks();
  } catch {
    // ignore if not applicable
  }

  // clear timers and revert to real timers to avoid leaked fake timers
  try {
    vi.clearAllTimers();
    vi.useRealTimers();
  } catch {
    // ignore if timers weren't faked
  }
});

// Mock для window.matchMedia (используется в Chakra UI)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
