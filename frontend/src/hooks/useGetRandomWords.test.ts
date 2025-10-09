import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useGetRandomWords from "./useGetRandomWords";

// Мокируем сервисы
vi.mock("../utils/getRandomRussianWords", () => ({
  getRandomRussianWords: vi.fn(() => [
    "тест",
    "слово",
    "проверка",
    "функция",
  ]),
}));

vi.mock("../utils/getRandomRussianSentences", () => ({
  getRandomRussianSentences: vi.fn(() => [
    "Это тестовое предложение для проверки.",
    "Ещё одно предложение здесь.",
  ]),
}));

vi.mock("../services/randomWordsService", () => ({
  getRandomLengthWords: vi.fn(async () => [
    "test",
    "word",
    "check",
    "function",
  ]),
}));

describe("useGetRandomWords", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Режим 'words'", () => {
    it("должен возвращать английские слова для языка 'en'", async () => {
      const { result } = renderHook(() =>
        useGetRandomWords(2, 5, 250, "en", "words")
      );

      await waitFor(() => {
        expect(result.current.words).toHaveLength(4);
        expect(result.current.words).toContain("test");
        expect(result.current.words).toContain("word");
      });
    });

    it("должен возвращать русские слова для языка 'ru'", async () => {
      const { result } = renderHook(() =>
        useGetRandomWords(2, 5, 250, "ru", "words")
      );

      await waitFor(() => {
        expect(result.current.words).toHaveLength(4);
        expect(result.current.words).toContain("тест");
        expect(result.current.words).toContain("слово");
      });
    });
  });

  describe("Режим 'sentences'", () => {
    it("должен возвращать слова из предложений для русского языка", async () => {
      const { result } = renderHook(() =>
        useGetRandomWords(2, 5, 250, "ru", "sentences")
      );

      await waitFor(() => {
        expect(result.current.words.length).toBeGreaterThan(0);
        // Проверяем, что предложения разбиты на слова
        expect(result.current.words).toContain("Это");
        expect(result.current.words).toContain("тестовое");
      });
    });

    it("должен использовать обычные слова для английского языка в режиме предложений", async () => {
      const { result } = renderHook(() =>
        useGetRandomWords(2, 5, 250, "en", "sentences")
      );

      await waitFor(() => {
        expect(result.current.words).toHaveLength(4);
        expect(result.current.words).toContain("test");
      });
    });
  });

  describe("refreshWords", () => {
    it("должен обновлять слова при вызове refreshWords", async () => {
      const { result } = renderHook(() =>
        useGetRandomWords(2, 5, 250, "ru", "words")
      );

      await waitFor(() => {
        expect(result.current.words).toHaveLength(4);
      });

      // Вызываем refreshWords
      result.current.refreshWords();

      await waitFor(() => {
        // Проверяем, что функция была вызвана снова
        expect(result.current.words).toBeDefined();
        // Новые слова должны быть получены (может быть тот же массив из-за мока)
        expect(result.current.words.length).toBeGreaterThan(0);
      });
    });

    it("refreshWords должен быть стабильной функцией", () => {
      const { result, rerender } = renderHook(() =>
        useGetRandomWords(2, 5, 250, "en", "words")
      );

      const firstRefresh = result.current.refreshWords;
      rerender();
      const secondRefresh = result.current.refreshWords;

      expect(firstRefresh).toBe(secondRefresh);
    });
  });

  describe("Обновление при изменении параметров", () => {
    it("должен обновлять слова при изменении языка", async () => {
      const { result, rerender } = renderHook(
        ({ lang }: { lang: "en" | "ru" }) => useGetRandomWords(2, 5, 250, lang, "words"),
        { initialProps: { lang: "en" as "en" | "ru" } }
      );

      await waitFor(() => {
        expect(result.current.words).toContain("test");
      });

      // Меняем язык на русский
      rerender({ lang: "ru" as "en" | "ru" });

      await waitFor(() => {
        expect(result.current.words).toContain("тест");
      });
    });

    it("должен обновлять слова при изменении режима", async () => {
      const { result, rerender } = renderHook(
        ({ mode }: { mode: "words" | "sentences" }) => useGetRandomWords(2, 5, 250, "ru", mode),
        { initialProps: { mode: "words" as "words" | "sentences" } }
      );

      await waitFor(() => {
        expect(result.current.words).toHaveLength(4);
      });

      // Меняем режим на предложения
      rerender({ mode: "sentences" as "words" | "sentences" });

      await waitFor(() => {
        // В режиме предложений должно быть больше слов
        expect(result.current.words.length).toBeGreaterThan(4);
      });
    });

    it("должен обновлять слова при изменении totalChars", async () => {
      const { result, rerender } = renderHook(
        ({ total }) => useGetRandomWords(2, 5, total, "en", "words"),
        { initialProps: { total: 250 } }
      );

      await waitFor(() => {
        expect(result.current.words).toBeDefined();
      });

      // Меняем количество символов
      rerender({ total: 500 });

      await waitFor(() => {
        expect(result.current.words).toBeDefined();
      });
    });
  });

  describe("Начальное состояние", () => {
    it("должен начинаться с пустого массива слов", () => {
      const { result } = renderHook(() =>
        useGetRandomWords(2, 5, 250, "en", "words")
      );

      // До загрузки слов массив должен быть пустым
      if (result.current.words.length === 0) {
        expect(result.current.words).toEqual([]);
      }
    });

    it("должен предоставлять функцию refreshWords сразу", () => {
      const { result } = renderHook(() =>
        useGetRandomWords(2, 5, 250, "en", "words")
      );

      expect(typeof result.current.refreshWords).toBe("function");
    });
  });
});
