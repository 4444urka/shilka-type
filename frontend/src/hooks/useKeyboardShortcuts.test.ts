import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  let onRestart: ReturnType<typeof vi.fn>;
  let onEscape: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onRestart = vi.fn();
    onEscape = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const dispatchKeyDown = (key: string, options: Partial<KeyboardEvent> = {}) => {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      ...options,
    });
    window.dispatchEvent(event);
  };

  it("should call onRestart when Tab is pressed", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
      })
    );

    dispatchKeyDown("Tab");

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it("should call onRestart when Escape is pressed (no onEscape handler)", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
      })
    );

    dispatchKeyDown("Escape");

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it("should call onEscape when Escape is pressed (with onEscape handler)", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        onEscape,
        enabled: true,
      })
    );

    dispatchKeyDown("Escape");

    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(onRestart).not.toHaveBeenCalled();
  });

  it("should not call any handler when disabled", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: false,
      })
    );

    dispatchKeyDown("Tab");
    dispatchKeyDown("Escape");

    expect(onRestart).not.toHaveBeenCalled();
  });

  it("should not trigger on non-restart keys", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
      })
    );

    dispatchKeyDown("a");
    dispatchKeyDown("Enter");
    dispatchKeyDown("Space");

    expect(onRestart).not.toHaveBeenCalled();
  });

  it("should not trigger when Ctrl key is pressed", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
      })
    );

    dispatchKeyDown("Tab", { ctrlKey: true });

    expect(onRestart).not.toHaveBeenCalled();
  });

  it("should not trigger when Meta key is pressed", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
      })
    );

    dispatchKeyDown("Tab", { metaKey: true });

    expect(onRestart).not.toHaveBeenCalled();
  });

  it("should not trigger when Alt key is pressed", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
      })
    );

    dispatchKeyDown("Tab", { altKey: true });

    expect(onRestart).not.toHaveBeenCalled();
  });

  it("should debounce rapid key presses", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
      })
    );

    // First press should work
    dispatchKeyDown("Tab");
    expect(onRestart).toHaveBeenCalledTimes(1);

    // Immediate second press should be debounced
    dispatchKeyDown("Tab");
    expect(onRestart).toHaveBeenCalledTimes(1);

    // After debounce period, should work again
    vi.advanceTimersByTime(250);
    dispatchKeyDown("Tab");
    expect(onRestart).toHaveBeenCalledTimes(2);
  });

  it("should support custom restart keys", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
        restartKeys: ["r", "R"],
      })
    );

    // Default keys should not work
    dispatchKeyDown("Tab");
    expect(onRestart).not.toHaveBeenCalled();

    // Custom key should work
    dispatchKeyDown("r");
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it("should cleanup event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        onRestart,
        enabled: true,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
