import { describe, it, expect } from "vitest";
import { calculateTotalStats } from "../lib/calculateTotalStats";
import type { TypingSession } from "../types/TypingSession";

describe("calculateTotalStats", () => {
  it("должен вернуть нули для пустого массива", () => {
    const result = calculateTotalStats([]);
    expect(result).toEqual({
      totalCharsTyped: 0,
      totalTimeTyping: 0,
    });
  });

  it("должен подсчитать статистику для одной сессии", () => {
    const sessions: TypingSession[] = [
      {
        id: 1,
        wpm: 60,
        accuracy: 95.5,
        duration: 120,
        typing_mode: "normal",
        language: "ru",
        test_type: "time",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    const result = calculateTotalStats(sessions);
    // 60 wpm * 5 * 2 минуты = 600 символов
    expect(result.totalCharsTyped).toBe(600);
    expect(result.totalTimeTyping).toBe(120);
  });

  it("должен подсчитать статистику для нескольких сессий", () => {
    const sessions: TypingSession[] = [
      {
        id: 1,
        wpm: 60,
        accuracy: 95.5,
        duration: 60,
        typing_mode: "normal",
        language: "ru",
        test_type: "time",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 2,
        wpm: 80,
        accuracy: 98.0,
        duration: 120,
        typing_mode: "normal",
        language: "ru",
        test_type: "words",
        created_at: "2024-01-02T00:00:00Z",
      },
    ];

    const result = calculateTotalStats(sessions);
    // Первая: 60 wpm * 5 * 1 минута = 300 символов
    // Вторая: 80 wpm * 5 * 2 минуты = 800 символов
    // Итого: 1100 символов
    expect(result.totalCharsTyped).toBe(1100);
    expect(result.totalTimeTyping).toBe(180); // 60 + 120
  });

  it("должен корректно работать с дробными значениями", () => {
    const sessions: TypingSession[] = [
      {
        id: 1,
        wpm: 40,
        accuracy: 95.5,
        duration: 90,
        typing_mode: "normal",
        language: "ru",
        test_type: "time",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    const result = calculateTotalStats(sessions);
    // 40 wpm * 5 * 1.5 минуты = 300 символов
    expect(result.totalCharsTyped).toBe(300);
    expect(result.totalTimeTyping).toBe(90);
  });
});
