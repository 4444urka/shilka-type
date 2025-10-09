import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../tests/test-utils";
import VictoryScreen from "./VictoryScreen";
import type { TypingSessionNew } from "../../types/TypingTypes";

// Мокируем API запросы
vi.mock("../../api/stats/statsRequests", () => ({
  addCoins: vi.fn().mockResolvedValue({}),
}));

describe("VictoryScreen", () => {
  const mockSession: TypingSessionNew = {
    words: [
      {
        text: "test",
        chars: [
          { char: "t", correct: true, typed: true, time: 100 },
          { char: "e", correct: true, typed: true, time: 200 },
          { char: "s", correct: true, typed: true, time: 300 },
          { char: "t", correct: true, typed: true, time: 400 },
        ],
        completed: true,
        active: false,
      },
    ],
    currentWordIndex: 1,
    currentCharIndex: 0,
    initialTime: 30,
    startTime: 1000000000000,
    endTime: 1000000030000,
    isStarted: true,
    isCompleted: true,
    stats: {
      wpm: 75,
      accuracy: 95.5,
      correctChars: 95,
      incorrectChars: 5,
      totalChars: 100,
    },
  };

  const defaultProps = {
    session: mockSession,
    shilkaCoins: { value: 90 },
    testType: "time" as const,
    typingMode: "words",
    language: "en",
  };

  it("должен отображать время сессии для типа 'time'", () => {
    renderWithProviders(<VictoryScreen {...defaultProps} testType="time" />);
    expect(screen.getByText(/Время:/)).toBeInTheDocument();
    expect(screen.getByText(/30с/)).toBeInTheDocument();
  });

  it("должен отображать WPM", () => {
    renderWithProviders(<VictoryScreen {...defaultProps} />);
    expect(screen.getByText("WPM:")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("должен отображать точность", () => {
    renderWithProviders(<VictoryScreen {...defaultProps} />);
    expect(screen.getByText("Accuracy:")).toBeInTheDocument();
    expect(screen.getByText("96%")).toBeInTheDocument(); // Округлено
  });

  it("должен отображать правильные и неправильные символы", () => {
    renderWithProviders(<VictoryScreen {...defaultProps} />);
    expect(screen.getByText("Символы:")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument(); // Правильные
    expect(screen.getByText("5")).toBeInTheDocument(); // Неправильные
  });

  it("должен отображать 'Время' для типа теста 'time'", () => {
    renderWithProviders(<VictoryScreen {...defaultProps} testType="time" />);
    expect(screen.getByText(/Время:/)).toBeInTheDocument();
  });

  it("должен отображать 'Слова' для типа теста 'words'", () => {
    renderWithProviders(<VictoryScreen {...defaultProps} testType="words" />);
    expect(screen.getByText(/Слова:/)).toBeInTheDocument();
  });

  it("должен отображать кнопку рестарта", () => {
    renderWithProviders(<VictoryScreen {...defaultProps} />);
    const restartButton = screen.getByRole("button");
    expect(restartButton).toBeInTheDocument();
  });

  it("должен отображать заработанные монеты для авторизованного пользователя", () => {
    const preloadedState = {
      user: {
        user: { id: 1, username: "testuser", email: "test@test.com" },
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<VictoryScreen {...defaultProps} />, {
      preloadedState,
    });
    expect(screen.getByText("+90")).toBeInTheDocument();
  });

  it("не должен отображать монеты для неавторизованного пользователя", () => {
    const preloadedState = {
      user: {
        user: null,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<VictoryScreen {...defaultProps} />, {
      preloadedState,
    });
    expect(screen.queryByText("+90")).not.toBeInTheDocument();
  });

  it("должен отображать отрицательные монеты", () => {
    const preloadedState = {
      user: {
        user: { id: 1, username: "testuser", email: "test@test.com" },
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(
      <VictoryScreen {...defaultProps} shilkaCoins={{ value: -10 }} />,
      { preloadedState }
    );
    expect(screen.getByText("-10")).toBeInTheDocument();
  });

  it("должен отображать количество слов по умолчанию, если testType не передан", () => {
    renderWithProviders(
      <VictoryScreen
        session={mockSession}
        shilkaCoins={{ value: 0 }}
        testType={undefined}
      />
    );
    // Когда testType не передан, отображается количество слов
    expect(screen.getByText(/Слова:/)).toBeInTheDocument();
  });
});
