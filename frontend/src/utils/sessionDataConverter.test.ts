import { describe, it, expect } from "vitest";
import { convertSessionToPayload } from "./sessionDataConverter";
import type { TypingSessionNew } from "../types/TypingTypes";

describe("sessionDataConverter", () => {
  it("должен правильно конвертировать сессию в payload с относительным временем", () => {
    const mockSession: TypingSessionNew = {
      words: [
        {
          text: "hello",
          chars: [
            { char: "h", correct: true, typed: true, time: 100 }, // 100ms с начала
            { char: "e", correct: true, typed: true, time: 250 }, // 250ms с начала
            { char: "l", correct: true, typed: true, time: 400 },
            { char: "l", correct: true, typed: true, time: 550 },
            { char: "o", correct: true, typed: true, time: 700 },
          ],
          completed: true,
          active: false,
        },
        {
          text: "world",
          chars: [
            { char: "w", correct: true, typed: true, time: 850 },
            { char: "o", correct: true, typed: true, time: 1000 },
            { char: "r", correct: false, typed: true, time: 1150 },
            { char: "l", correct: true, typed: true, time: 1300 },
            { char: "d", correct: true, typed: true, time: 1450 },
          ],
          completed: true,
          active: false,
        },
      ],
      currentWordIndex: 2,
      currentCharIndex: 0,
      initialTime: 30,
      startTime: 1000000000000, // Unix timestamp начала сессии
      endTime: 1000000002000,
      isStarted: true,
      isCompleted: true,
      stats: {
        wpm: 60,
        accuracy: 90,
        correctChars: 9,
        incorrectChars: 1,
        totalChars: 10,
      },
    };

    const payload = convertSessionToPayload(mockSession, 30, "words", "en");

    // Проверяем слова
    expect(payload.words).toEqual(["hello", "world"]);

    // Проверяем метрики
    // WPM и accuracy теперь считаются только на сервере, поэтому их нет в payload
    expect(payload.duration).toBe(30);
    expect(payload.mode).toBe("words");
    expect(payload.language).toBe("en");

    // Проверяем, что время берется из реальных данных (относительное время)
    expect(payload.history[0][0].time).toBe(100);
    expect(payload.history[0][1].time).toBe(250);
    expect(payload.history[1][0].time).toBe(850);

    // Проверяем правильность символов
    expect(payload.history[0][0].char).toBe("h");
    expect(payload.history[0][0].correct).toBe(true);
    expect(payload.history[1][2].char).toBe("r");
    expect(payload.history[1][2].correct).toBe(false);
  });

  it("должен использовать 0 для времени, если time не задан", () => {
    const mockSession: TypingSessionNew = {
      words: [
        {
          text: "test",
          chars: [
            { char: "t", correct: true, typed: false }, // Без времени
            { char: "e", correct: true, typed: false },
            { char: "s", correct: true, typed: false },
            { char: "t", correct: true, typed: false },
          ],
          completed: false,
          active: true,
        },
      ],
      currentWordIndex: 0,
      currentCharIndex: 0,
      initialTime: 30,
      startTime: null,
      endTime: null,
      isStarted: false,
      isCompleted: false,
      stats: {
        wpm: 0,
        accuracy: 0,
        correctChars: 0,
        incorrectChars: 0,
        totalChars: 0,
      },
    };

    const payload = convertSessionToPayload(mockSession, 30);

    // Проверяем, что для символов без времени используется 0
    expect(payload.history[0][0].time).toBe(0);
    expect(payload.history[0][1].time).toBe(0);
  });
});
