import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../tests/test-utils";
import { TypingHistory } from "./TypingHistory";
import type { TypingSession } from "../../types/TypingSession";

describe("TypingHistory", () => {
  const mockSessions: TypingSession[] = [
    {
      id: 1,
      wpm: 75.5,
      accuracy: 95.3,
      duration: 30,
      typing_mode: "words",
      language: "en",
      test_type: "time",
      created_at: "2024-01-15T10:30:00",
    },
    {
      id: 2,
      wpm: 82.1,
      accuracy: 98.7,
      duration: 60,
      typing_mode: "sentences",
      language: "ru",
      test_type: "words",
      created_at: "2024-01-15T11:00:00",
    },
    {
      id: 3,
      wpm: 68.9,
      accuracy: 92.1,
      duration: null,
      typing_mode: null,
      language: null,
      test_type: null,
      created_at: "2024-01-15T12:00:00",
    },
  ];

  it("должен отображать заголовок", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    expect(screen.getByText("История сессий")).toBeInTheDocument();
  });

  it("должен отображать все сессии", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    expect(screen.getByText("75.5")).toBeInTheDocument();
    expect(screen.getByText("82.1")).toBeInTheDocument();
    expect(screen.getByText("68.9")).toBeInTheDocument();
  });

  it("должен отображать WPM для каждой сессии", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    const wpmLabels = screen.getAllByText("WPM");
    expect(wpmLabels).toHaveLength(3);
  });

  it("должен отображать точность для каждой сессии", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    expect(screen.getByText("95.3%")).toBeInTheDocument();
    expect(screen.getByText("98.7%")).toBeInTheDocument();
    expect(screen.getByText("92.1%")).toBeInTheDocument();
  });

  it("должен отображать длительность сессии", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    expect(screen.getByText("30с")).toBeInTheDocument();
    expect(screen.getByText("60с")).toBeInTheDocument();
  });

  it("не должен отображать длительность, если она null", () => {
    renderWithProviders(<TypingHistory sessions={[mockSessions[2]]} />);
    expect(screen.queryByText(/с$/)).not.toBeInTheDocument();
  });

  it("должен отображать бейдж типа теста", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    expect(screen.getByText(/⏱️ По времени/i)).toBeInTheDocument();
    expect(screen.getByText(/🔢 По словам/i)).toBeInTheDocument();
  });

  it("должен отображать бейдж режима", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    expect(screen.getByText(/📝 Слова/i)).toBeInTheDocument();
    expect(screen.getByText(/📜 Предложения/i)).toBeInTheDocument();
  });

  it("должен отображать бейдж языка", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    expect(screen.getByText(/🇺🇸 English/i)).toBeInTheDocument();
    expect(screen.getByText(/🇷🇺 Русский/i)).toBeInTheDocument();
  });

  it("не должен отображать бейджи для null значений", () => {
    renderWithProviders(<TypingHistory sessions={[mockSessions[2]]} />);
    expect(screen.queryByText(/По времени/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Слова/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/English/i)).not.toBeInTheDocument();
  });

  it("должен отображать форматированную дату", () => {
    renderWithProviders(<TypingHistory sessions={mockSessions} />);
    // Проверяем, что дата отформатирована (содержит точки и двоеточия)
    const dateElements = screen.getAllByText(/\d{2}\.\d{2}\.\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("должен корректно работать с пустым массивом сессий", () => {
    renderWithProviders(<TypingHistory sessions={[]} />);
    expect(screen.getByText("История сессий")).toBeInTheDocument();
    expect(screen.queryByText("WPM")).not.toBeInTheDocument();
  });

  it("должен принимать дополнительные BoxProps", () => {
    const { container } = renderWithProviders(
      <TypingHistory sessions={mockSessions} data-testid="custom-history" />
    );
    expect(
      container.querySelector('[data-testid="custom-history"]')
    ).toBeInTheDocument();
  });
});
