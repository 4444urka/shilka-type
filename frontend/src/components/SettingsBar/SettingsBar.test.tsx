import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../tests/test-utils";
import SettingsBar from "./SettingsBar";

describe("SettingsBar", () => {
  const defaultProps = {
    isVisible: true,
    selectedTime: 30,
    selectedWords: 25,
    selectedLanguage: "en" as const,
    selectedMode: "words" as const,
    selectedTestType: "time" as const,
    onTimeChange: vi.fn(),
    onWordsChange: vi.fn(),
    onLanguageChange: vi.fn(),
    onModeChange: vi.fn(),
    onTestTypeChange: vi.fn(),
  };

  it("должен отображаться, когда isVisible = true", () => {
    renderWithProviders(<SettingsBar {...defaultProps} />);
    expect(screen.getByText("Время")).toBeInTheDocument();
  });

  it("не должен отображаться, когда isVisible = false", () => {
    renderWithProviders(<SettingsBar {...defaultProps} isVisible={false} />);
    expect(screen.queryByText("Время")).not.toBeInTheDocument();
  });

  describe("Переключатель типа теста", () => {
    it("должен отображать кнопки 'Время' и 'Слова'", () => {
      renderWithProviders(
        <SettingsBar {...defaultProps} selectedTestType="time" />
      );

      // Получаем все кнопки "Время" и "Слова"
      const timeButtons = screen.getAllByRole("button", { name: /Время/i });
      const wordsButtons = screen.getAllByRole("button", { name: /Слова/i });

      // Должна быть одна кнопка "Время" (в переключателе типа теста)
      expect(timeButtons).toHaveLength(1);
      // Должно быть две кнопки "Слова" - одна в типе теста, одна в режиме
      expect(wordsButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("должен выделять активный тип теста", () => {
      renderWithProviders(
        <SettingsBar {...defaultProps} selectedTestType="time" />
      );

      const timeButton = screen.getByRole("button", { name: /Время/i });
      expect(timeButton).toBeInTheDocument();
    });

    it("должен вызывать onTestTypeChange при клике", async () => {
      const user = userEvent.setup();
      const onTestTypeChange = vi.fn();
      renderWithProviders(
        <SettingsBar {...defaultProps} onTestTypeChange={onTestTypeChange} />
      );

      // Кликаем на первую кнопку "Слова" (которая в типе теста)
      const wordsButtons = screen.getAllByRole("button", { name: /Слова/i });
      await user.click(wordsButtons[0]);

      expect(onTestTypeChange).toHaveBeenCalledWith("words");
    });
  });

  describe("Настройки времени", () => {
    it("должен отображать опции времени когда выбран тип 'time'", () => {
      renderWithProviders(
        <SettingsBar {...defaultProps} selectedTestType="time" />
      );
      expect(screen.getByRole("button", { name: "15с" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "30с" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "60с" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "120с" })).toBeInTheDocument();
    });

    it("не должен отображать опции времени когда выбран тип 'words'", () => {
      renderWithProviders(
        <SettingsBar {...defaultProps} selectedTestType="words" />
      );
      expect(
        screen.queryByRole("button", { name: "15с" })
      ).not.toBeInTheDocument();
    });

    it("должен вызывать onTimeChange при клике на время", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();
      renderWithProviders(
        <SettingsBar
          {...defaultProps}
          selectedTestType="time"
          onTimeChange={onTimeChange}
        />
      );

      const time60Button = screen.getByRole("button", { name: "60с" });
      await user.click(time60Button);

      expect(onTimeChange).toHaveBeenCalledWith(60);
    });
  });

  describe("Настройки количества слов", () => {
    it("должен отображать опции слов когда выбран тип 'words'", () => {
      renderWithProviders(
        <SettingsBar {...defaultProps} selectedTestType="words" />
      );
      expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "25" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "50" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "100" })).toBeInTheDocument();
    });

    it("не должен отображать опции слов когда выбран тип 'time'", () => {
      renderWithProviders(
        <SettingsBar {...defaultProps} selectedTestType="time" />
      );
      expect(
        screen.queryByRole("button", { name: "10" })
      ).not.toBeInTheDocument();
    });

    it("должен вызывать onWordsChange при клике на количество", async () => {
      const user = userEvent.setup();
      const onWordsChange = vi.fn();
      renderWithProviders(
        <SettingsBar
          {...defaultProps}
          selectedTestType="words"
          onWordsChange={onWordsChange}
        />
      );

      const words50Button = screen.getByRole("button", { name: "50" });
      await user.click(words50Button);

      expect(onWordsChange).toHaveBeenCalledWith(50);
    });
  });

  describe("Настройки режима", () => {
    it("должен отображать кнопки 'Слова' и 'Предложения'", () => {
      renderWithProviders(<SettingsBar {...defaultProps} />);
      const modeButtons = screen.getAllByRole("button", {
        name: /Слова|Предложения/i,
      });
      expect(modeButtons.length).toBeGreaterThanOrEqual(2);
    });

    it("должен вызывать onModeChange при клике", async () => {
      const user = userEvent.setup();
      const onModeChange = vi.fn();
      renderWithProviders(
        <SettingsBar {...defaultProps} onModeChange={onModeChange} />
      );

      const sentencesButton = screen.getByRole("button", {
        name: /Предложения/i,
      });
      await user.click(sentencesButton);

      expect(onModeChange).toHaveBeenCalledWith("sentences");
    });
  });

  describe("Настройки языка", () => {
    it("должен отображать кнопки 'English' и 'Русский'", () => {
      renderWithProviders(<SettingsBar {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "English" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Русский" })
      ).toBeInTheDocument();
    });

    it("должен вызывать onLanguageChange при клике", async () => {
      const user = userEvent.setup();
      const onLanguageChange = vi.fn();
      renderWithProviders(
        <SettingsBar {...defaultProps} onLanguageChange={onLanguageChange} />
      );

      const russianButton = screen.getByRole("button", { name: "Русский" });
      await user.click(russianButton);

      expect(onLanguageChange).toHaveBeenCalledWith("ru");
    });
  });
});
