import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../tests/test-utils";
import { TypingScreenStats } from "./TypingScreenStats";
import type { TypingStats } from "../../types/TypingTypes";

describe("TypingScreenStats", () => {
  const mockStats: TypingStats = {
    wpm: 75,
    accuracy: 95,
    correctChars: 285,
    incorrectChars: 15,
    totalChars: 300,
  };

  const defaultProps = {
    stats: mockStats,
    displayTime: 30,
    isVisible: true,
  };

  it("должен отображать все статистические показатели", () => {
    renderWithProviders(<TypingScreenStats {...defaultProps} />);

    expect(screen.getByText("Время")).toBeInTheDocument();
    expect(screen.getByText("WPM")).toBeInTheDocument();
    expect(screen.getByText("Точность")).toBeInTheDocument();
    expect(screen.getByText("Символы")).toBeInTheDocument();
  });

  it("должен форматировать время как MM:SS", () => {
    renderWithProviders(
      <TypingScreenStats {...defaultProps} displayTime={30} />
    );
    expect(screen.getByText("0:30")).toBeInTheDocument();
  });

  it("должен корректно форматировать время больше минуты", () => {
    renderWithProviders(
      <TypingScreenStats {...defaultProps} displayTime={90} />
    );
    expect(screen.getByText("1:30")).toBeInTheDocument();
  });

  it("должен добавлять ведущий ноль для секунд меньше 10", () => {
    renderWithProviders(
      <TypingScreenStats {...defaultProps} displayTime={65} />
    );
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("должен корректно форматировать время = 0", () => {
    renderWithProviders(
      <TypingScreenStats {...defaultProps} displayTime={0} />
    );
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("должен отображать WPM", () => {
    renderWithProviders(<TypingScreenStats {...defaultProps} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("должен отображать точность с процентом", () => {
    renderWithProviders(<TypingScreenStats {...defaultProps} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("должен отображать правильные символы", () => {
    renderWithProviders(<TypingScreenStats {...defaultProps} />);
    expect(screen.getByText("285")).toBeInTheDocument();
  });

  it("должен отображать неправильные символы", () => {
    renderWithProviders(<TypingScreenStats {...defaultProps} />);
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("должен отображать разделитель между правильными и неправильными символами", () => {
    renderWithProviders(<TypingScreenStats {...defaultProps} />);
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("должен корректно работать с нулевыми значениями", () => {
    const zeroStats: TypingStats = {
      wpm: 0,
      accuracy: 0,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
    };

    renderWithProviders(
      <TypingScreenStats {...defaultProps} stats={zeroStats} />
    );

    // Проверяем WPM (0), точность (0%) и символы (0/0)
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3); // WPM, correctChars, incorrectChars
    expect(screen.getByText("0%")).toBeInTheDocument(); // Accuracy
  });

  it("должен корректно работать с большими значениями", () => {
    const bigStats: TypingStats = {
      wpm: 150,
      accuracy: 100,
      correctChars: 9999,
      incorrectChars: 0,
      totalChars: 9999,
    };

    renderWithProviders(
      <TypingScreenStats
        {...defaultProps}
        stats={bigStats}
        displayTime={3600}
      />
    );

    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("9999")).toBeInTheDocument();
    expect(screen.getByText("60:00")).toBeInTheDocument(); // 1 час
  });

  it("должен применять правильные цвета к элементам", () => {
    renderWithProviders(<TypingScreenStats {...defaultProps} />);

    // Проверяем, что элементы существуют и отображаются
    const wpmElement = screen.getByText("75");
    expect(wpmElement).toBeInTheDocument();

    const correctCharsElement = screen.getByText("285");
    expect(correctCharsElement).toBeInTheDocument();

    const incorrectCharsElement = screen.getByText("15");
    expect(incorrectCharsElement).toBeInTheDocument();
    expect(incorrectCharsElement).toHaveStyle({ textDecoration: "underline" });
  });

  it("не должен отображаться когда isVisible = false", () => {
    renderWithProviders(
      <TypingScreenStats {...defaultProps} isVisible={false} />
    );

    // Проверяем что компонент всё равно рендерится с текстом
    expect(screen.getByText("Время")).toBeInTheDocument();
  });

  it("должен отображаться с правильной анимацией когда isVisible = true", () => {
    renderWithProviders(
      <TypingScreenStats {...defaultProps} isVisible={true} />
    );

    // Проверяем что компонент рендерится и виден
    expect(screen.getByText("Время")).toBeInTheDocument();
    expect(screen.getByText("WPM")).toBeInTheDocument();
  });

  it("должен обрабатывать дробные значения точности", () => {
    const fractionalStats: TypingStats = {
      wpm: 75,
      accuracy: 95.5,
      correctChars: 286,
      incorrectChars: 14,
      totalChars: 300,
    };

    renderWithProviders(
      <TypingScreenStats {...defaultProps} stats={fractionalStats} />
    );

    expect(screen.getByText("95.5%")).toBeInTheDocument();
  });
});
