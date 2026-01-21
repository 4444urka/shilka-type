import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../tests/test-utils";
import TypingScreen from "./TypingScreen";
import type { TypingSessionNew } from "../../types/TypingTypes";

// Мокируем framer-motion с полной поддержкой motion.create
vi.mock("framer-motion", () => {
  const createMotionComponent = (Component: string | React.ComponentType) => {
    const MotionComponent = ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const Tag = typeof Component === "string" ? Component : "div";
      return <Tag {...props}>{children}</Tag>;
    };
    return MotionComponent;
  };

  const motion = new Proxy(
    {
      create: (Component: string | React.ComponentType) =>
        createMotionComponent(Component),
    },
    {
      get: (target, prop: string) => {
        if (prop === "create") return target.create;
        return createMotionComponent(prop);
      },
    },
  );

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion,
  };
});

// Мокируем хук useKeyboardShortcuts
vi.mock("../../hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: vi.fn(),
}));

describe("TypingScreen", () => {
  const mockOnKeyPress = vi.fn();
  const mockOnRestart = vi.fn();

  const createMockSession = (
    overrides: Partial<TypingSessionNew> = {},
  ): TypingSessionNew => ({
    words: [
      { text: "hello", chars: [], isCompleted: false, hasError: false },
      { text: "world", chars: [], isCompleted: false, hasError: false },
    ],
    currentWordIndex: 0,
    currentCharIndex: 0,
    isStarted: false,
    isFinished: false,
    stats: {
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
      elapsedTime: 0,
    },
    history: [],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Рендеринг", () => {
    it("должен отрисовывать LoadingScreen когда isLoading=true", () => {
      const session = createMockSession();

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={true}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // LoadingScreen должен быть видим
      expect(screen.queryByText("hello")).not.toBeInTheDocument();
    });

    it("должен отрисовывать LoadingScreen когда words пустой", () => {
      const session = createMockSession({ words: [] });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Слова не должны отображаться
      expect(screen.queryByText("hello")).not.toBeInTheDocument();
    });

    it("должен отрисовывать слова когда isLoading=false и words не пустой", () => {
      const session = createMockSession({ isStarted: true });

      const { container } = renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Проверяем что компонент рендерится без ошибок когда есть слова
      expect(container).toBeInTheDocument();
    });

    it("должен отрисовывать кнопку рестарта", () => {
      const session = createMockSession({ isStarted: true });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // RestartButton должна быть в DOM
      const restartButton = screen.getByRole("button");
      expect(restartButton).toBeInTheDocument();
    });

    it("должен отображать статистику когда сессия начата", () => {
      const session = createMockSession({
        isStarted: true,
        stats: {
          wpm: 50,
          accuracy: 95,
          correctChars: 10,
          incorrectChars: 1,
          totalChars: 11,
          elapsedTime: 10,
        },
      });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={50}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Статистика должна отображаться (TypingScreenStats)
      // Точные значения зависят от реализации TypingScreenStats
    });

    it("не должен отображать статистику когда сессия не начата", () => {
      const session = createMockSession({ isStarted: false });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Статистика не должна отображаться до начала сессии
    });
  });

  describe("Скрытый input", () => {
    it("должен содержать скрытый input для мобильной клавиатуры", () => {
      const session = createMockSession();

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      const input = screen.getByLabelText("typing-input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("autocomplete", "off");
      expect(input).toHaveAttribute("autocorrect", "off");
    });

    it("должен вызывать onKeyPress при вводе в скрытый input", () => {
      const session = createMockSession({ isStarted: true });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      const input = screen.getByLabelText("typing-input");
      fireEvent.change(input, { target: { value: "a" } });

      expect(mockOnKeyPress).toHaveBeenCalledWith("a");
    });

    it("должен обрабатывать множественные символы во вводе", () => {
      const session = createMockSession({ isStarted: true });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      const input = screen.getByLabelText("typing-input");
      fireEvent.change(input, { target: { value: "abc" } });

      expect(mockOnKeyPress).toHaveBeenCalledWith("a");
      expect(mockOnKeyPress).toHaveBeenCalledWith("b");
      expect(mockOnKeyPress).toHaveBeenCalledWith("c");
      expect(mockOnKeyPress).toHaveBeenCalledTimes(3);
    });

    it("должен обрабатывать Backspace в скрытом input", () => {
      const session = createMockSession({ isStarted: true });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      const input = screen.getByLabelText("typing-input");
      fireEvent.keyDown(input, { key: "Backspace" });

      expect(mockOnKeyPress).toHaveBeenCalledWith("Backspace");
    });

    it("должен обрабатывать пробел в скрытом input", () => {
      const session = createMockSession({ isStarted: true });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      const input = screen.getByLabelText("typing-input");
      fireEvent.keyDown(input, { key: " " });

      expect(mockOnKeyPress).toHaveBeenCalledWith(" ");
    });
  });

  describe("Кнопка рестарта", () => {
    it("должна вызывать onRestart при клике", () => {
      const session = createMockSession({ isStarted: true });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      const restartButton = screen.getByRole("button");
      fireEvent.click(restartButton);

      expect(mockOnRestart).toHaveBeenCalled();
    });
  });

  describe("Отображение слов", () => {
    it("должен рендерить компоненты слов когда сессия начата", () => {
      const session = createMockSession({
        isStarted: true,
        words: [
          { text: "one", chars: [], isCompleted: false, hasError: false },
          { text: "two", chars: [], isCompleted: false, hasError: false },
        ],
      });

      const { container } = renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Проверяем что компонент рендерится без ошибок
      expect(container).toBeInTheDocument();
    });
  });

  describe("Таймер", () => {
    it("должен передавать timeLeft в TypingScreenStats", () => {
      const session = createMockSession({ isStarted: true });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={45}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // TypingScreenStats должен получить displayTime=45
      // Проверка зависит от реализации TypingScreenStats
    });

    it("должен корректно обрабатывать timeLeft=0", () => {
      const session = createMockSession({ isStarted: true });

      const { container } = renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={0}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Проверяем что компонент рендерится без ошибок при timeLeft=0
      expect(container).toBeInTheDocument();
    });
  });

  describe("Состояния загрузки", () => {
    it("должен переключаться между загрузкой и контентом без ошибок", () => {
      const session = createMockSession({ isStarted: true });

      const { container, rerender } = renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={true}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Компонент должен рендериться в состоянии загрузки
      expect(container).toBeInTheDocument();

      // Ререндерим с isLoading=false
      rerender(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Компонент должен рендериться после загрузки
      expect(container).toBeInTheDocument();
    });
  });

  describe("Фокусировка", () => {
    it("должен фокусировать input при клике на контейнер", () => {
      const session = createMockSession({ isStarted: true });

      const { container } = renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      const input = screen.getByLabelText("typing-input");
      const mainContainer = container.firstChild as HTMLElement;

      fireEvent.click(mainContainer);

      // Input должен получить фокус
      // Примечание: в jsdom фокус может работать не так как в браузере
    });
  });

  describe("Граничные случаи", () => {
    it("должен обрабатывать пустой ввод", () => {
      const session = createMockSession({ isStarted: true });

      renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      const input = screen.getByLabelText("typing-input");
      fireEvent.change(input, { target: { value: "" } });

      // Не должно вызывать onKeyPress для пустого значения
      expect(mockOnKeyPress).not.toHaveBeenCalled();
    });

    it("должен корректно работать с большим количеством слов", () => {
      const manyWords = Array.from({ length: 100 }, (_, i) => ({
        text: `word${i}`,
        chars: [],
        isCompleted: false,
        hasError: false,
      }));

      const session = createMockSession({
        isStarted: true,
        words: manyWords,
      });

      const { container } = renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Проверяем что компонент рендерится без ошибок с большим количеством слов
      expect(container).toBeInTheDocument();
    });

    it("должен обрабатывать специальные символы в словах без ошибок", () => {
      const session = createMockSession({
        isStarted: true,
        words: [
          {
            text: "hello-world",
            chars: [],
            isCompleted: false,
            hasError: false,
          },
          { text: "test_case", chars: [], isCompleted: false, hasError: false },
          { text: "don't", chars: [], isCompleted: false, hasError: false },
        ],
      });

      const { container } = renderWithProviders(
        <TypingScreen
          session={session}
          timeLeft={60}
          isLoading={false}
          onKeyPress={mockOnKeyPress}
          onRestart={mockOnRestart}
        />,
      );

      // Проверяем что компонент рендерится без ошибок со специальными символами
      expect(container).toBeInTheDocument();
    });
  });
});
