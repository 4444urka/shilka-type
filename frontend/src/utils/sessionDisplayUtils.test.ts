import { describe, it, expect } from "vitest";
import {
  getModeDisplay,
  getLanguageDisplay,
  getTestTypeDisplay,
} from "./sessionDisplayUtils";

describe("sessionDisplayUtils", () => {
  describe("getModeDisplay", () => {
    it("должен вернуть правильное отображение для режима 'words'", () => {
      const result = getModeDisplay("words");
      expect(result.label).toBe("Слова");
      expect(result.icon).toBe("📝");
      expect(result.color).toBe("blue.500");
    });

    it("должен вернуть правильное отображение для режима 'sentences'", () => {
      const result = getModeDisplay("sentences");
      expect(result.label).toBe("Предложения");
      expect(result.icon).toBe("📜");
      expect(result.color).toBe("teal.500");
    });

    it("должен вернуть правильное отображение для режима 'time'", () => {
      const result = getModeDisplay("time");
      expect(result.label).toBe("Время");
      expect(result.icon).toBe("⏱️");
      expect(result.color).toBe("green.500");
    });

    it("должен вернуть правильное отображение для режима 'quote'", () => {
      const result = getModeDisplay("quote");
      expect(result.label).toBe("Цитата");
      expect(result.icon).toBe("💬");
      expect(result.color).toBe("purple.500");
    });

    it("должен вернуть правильное отображение для режима 'zen'", () => {
      const result = getModeDisplay("zen");
      expect(result.label).toBe("Дзен");
      expect(result.icon).toBe("🧘");
      expect(result.color).toBe("orange.500");
    });

    it("должен вернуть дефолтное отображение для неизвестного режима", () => {
      const result = getModeDisplay("unknown");
      expect(result.label).toBe("unknown");
      expect(result.icon).toBe("❓");
      expect(result.color).toBe("gray.500");
    });

    it("должен вернуть дефолтное отображение для null", () => {
      const result = getModeDisplay(null);
      expect(result.label).toBe("Неизвестно");
      expect(result.icon).toBe("❓");
      expect(result.color).toBe("gray.500");
    });
  });

  describe("getLanguageDisplay", () => {
    it("должен вернуть правильное отображение для языка 'ru'", () => {
      const result = getLanguageDisplay("ru");
      expect(result.label).toBe("Русский");
      expect(result.flag).toBe("🇷🇺");
      expect(result.color).toBe("red.500");
    });

    it("должен вернуть правильное отображение для языка 'en'", () => {
      const result = getLanguageDisplay("en");
      expect(result.label).toBe("English");
      expect(result.flag).toBe("🇺🇸");
      expect(result.color).toBe("blue.500");
    });

    it("должен вернуть правильное отображение для языка 'de'", () => {
      const result = getLanguageDisplay("de");
      expect(result.label).toBe("Deutsch");
      expect(result.flag).toBe("🇩🇪");
      expect(result.color).toBe("yellow.600");
    });

    it("должен вернуть правильное отображение для языка 'fr'", () => {
      const result = getLanguageDisplay("fr");
      expect(result.label).toBe("Français");
      expect(result.flag).toBe("🇫🇷");
      expect(result.color).toBe("blue.400");
    });

    it("должен вернуть правильное отображение для языка 'es'", () => {
      const result = getLanguageDisplay("es");
      expect(result.label).toBe("Español");
      expect(result.flag).toBe("🇪🇸");
      expect(result.color).toBe("red.400");
    });

    it("должен вернуть правильное отображение для языка 'it'", () => {
      const result = getLanguageDisplay("it");
      expect(result.label).toBe("Italiano");
      expect(result.flag).toBe("🇮🇹");
      expect(result.color).toBe("green.500");
    });

    it("должен вернуть дефолтное отображение для неизвестного языка", () => {
      const result = getLanguageDisplay("unknown");
      expect(result.label).toBe("unknown");
      expect(result.flag).toBe("🌐");
      expect(result.color).toBe("gray.500");
    });

    it("должен вернуть дефолтное отображение для null", () => {
      const result = getLanguageDisplay(null);
      expect(result.label).toBe("Неизвестно");
      expect(result.flag).toBe("🌐");
      expect(result.color).toBe("gray.500");
    });
  });

  describe("getTestTypeDisplay", () => {
    it("должен вернуть правильное отображение для типа 'time'", () => {
      const result = getTestTypeDisplay("time");
      expect(result.label).toBe("По времени");
      expect(result.icon).toBe("⏱️");
      expect(result.color).toBe("purple.500");
    });

    it("должен вернуть правильное отображение для типа 'words'", () => {
      const result = getTestTypeDisplay("words");
      expect(result.label).toBe("По словам");
      expect(result.icon).toBe("🔢");
      expect(result.color).toBe("cyan.500");
    });

    it("должен вернуть дефолтное отображение для неизвестного типа", () => {
      const result = getTestTypeDisplay("unknown");
      expect(result.label).toBe("unknown");
      expect(result.icon).toBe("❓");
      expect(result.color).toBe("gray.500");
    });

    it("должен вернуть дефолтное отображение для null", () => {
      const result = getTestTypeDisplay(null);
      expect(result.label).toBe("Неизвестно");
      expect(result.icon).toBe("❓");
      expect(result.color).toBe("gray.500");
    });
  });
});
