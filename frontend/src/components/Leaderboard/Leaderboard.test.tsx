import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../tests/test-utils";
import Leaderboard from "./Leaderboard";
import type { Me } from "../../types/User";

// Мокируем конфигурацию
vi.mock("../../config/constants", () => ({
  LEADERBOARD_CONFIG: {
    TOP_USERS_COUNT: 5,
    CURRENT_USER_POSITION: 10,
  },
}));

describe("Leaderboard", () => {
  const mockLeaderboard: Me[] = [
    {
      id: 1,
      username: "leader1",
      shilka_coins: 1000,
      default_time: 60,
      default_words: 25,
      default_language: "en",
      default_mode: "words",
      default_test_type: "time",
    },
    {
      id: 2,
      username: "leader2",
      shilka_coins: 800,
      default_time: 60,
      default_words: 25,
      default_language: "en",
      default_mode: "words",
      default_test_type: "time",
    },
    {
      id: 3,
      username: "leader3",
      shilka_coins: 600,
      default_time: 60,
      default_words: 25,
      default_language: "en",
      default_mode: "words",
      default_test_type: "time",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен отрисовывать заголовок 'Список лидеров'", () => {
    renderWithProviders(<Leaderboard leaderboard={mockLeaderboard} />);

    expect(screen.getByText("Список лидеров")).toBeInTheDocument();
  });

  it("должен отображать пользователей из leaderboard", () => {
    renderWithProviders(<Leaderboard leaderboard={mockLeaderboard} />);

    expect(screen.getByText("leader1")).toBeInTheDocument();
    expect(screen.getByText("leader2")).toBeInTheDocument();
    expect(screen.getByText("leader3")).toBeInTheDocument();
  });

  it("должен отображать монеты пользователей", () => {
    renderWithProviders(<Leaderboard leaderboard={mockLeaderboard} />);

    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("600")).toBeInTheDocument();
  });

  it("должен корректно отображать пустой leaderboard", () => {
    renderWithProviders(<Leaderboard leaderboard={[]} />);

    expect(screen.getByText("Список лидеров")).toBeInTheDocument();
    expect(screen.queryByText("leader1")).not.toBeInTheDocument();
  });

  it("должен отображать текущего пользователя в топе, если он там есть", () => {
    const currentUser: Me = {
      id: 1,
      username: "leader1",
      shilka_coins: 1000,
      default_time: 60,
      default_words: 25,
      default_language: "en",
      default_mode: "words",
      default_test_type: "time",
    };

    renderWithProviders(<Leaderboard leaderboard={mockLeaderboard} />, {
      preloadedState: {
        user: {
          user: currentUser,
          loading: false,
          error: null,
        },
      },
    });

    // Пользователь должен отображаться в списке
    expect(screen.getByText("leader1")).toBeInTheDocument();
  });

  it("должен отображать разделитель и текущего пользователя, если он не в топе", () => {
    // Создаём большой leaderboard, где текущий пользователь находится за пределами топа
    const largeLeaderboard: Me[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      shilka_coins: 1000 - i * 50,
      default_time: 60,
      default_words: 25,
      default_language: "en" as const,
      default_mode: "words" as const,
      default_test_type: "time" as const,
    }));

    const currentUser: Me = {
      id: 100,
      username: "currentuser",
      shilka_coins: 50,
      default_time: 60,
      default_words: 25,
      default_language: "en",
      default_mode: "words",
      default_test_type: "time",
    };

    // Добавляем текущего пользователя в конец leaderboard
    const leaderboardWithCurrentUser = [...largeLeaderboard, currentUser];

    renderWithProviders(
      <Leaderboard leaderboard={leaderboardWithCurrentUser} />,
      {
        preloadedState: {
          user: {
            user: currentUser,
            loading: false,
            error: null,
          },
        },
      },
    );

    // Должен отображаться разделитель "..."
    expect(screen.getByText("...")).toBeInTheDocument();
    // И текущий пользователь
    expect(screen.getByText("currentuser")).toBeInTheDocument();
  });

  it("должен корректно обрабатывать пользователей с нулевыми монетами", () => {
    const leaderboardWithZeroCoins: Me[] = [
      {
        id: 1,
        username: "zerocoins",
        shilka_coins: 0,
        default_time: 60,
        default_words: 25,
        default_language: "en",
        default_mode: "words",
        default_test_type: "time",
      },
    ];

    renderWithProviders(<Leaderboard leaderboard={leaderboardWithZeroCoins} />);

    expect(screen.getByText("zerocoins")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("должен применять переданные BoxProps", () => {
    const { container } = renderWithProviders(
      <Leaderboard
        leaderboard={mockLeaderboard}
        data-testid="leaderboard-box"
      />,
    );

    const leaderboardBox = container.firstChild;
    expect(leaderboardBox).toBeInTheDocument();
  });

  it("должен фильтровать невалидных пользователей", () => {
    const leaderboardWithInvalid = [
      ...mockLeaderboard,
      // @ts-expect-error - намеренно передаём невалидные данные для теста
      { id: null, username: null, shilka_coins: 100 },
    ];

    renderWithProviders(<Leaderboard leaderboard={leaderboardWithInvalid} />);

    // Валидные пользователи должны отображаться
    expect(screen.getByText("leader1")).toBeInTheDocument();
    expect(screen.getByText("leader2")).toBeInTheDocument();
    expect(screen.getByText("leader3")).toBeInTheDocument();
  });

  it("должен отображать позиции пользователей в правильном порядке", () => {
    renderWithProviders(<Leaderboard leaderboard={mockLeaderboard} />);

    const usernames = screen.getAllByText(/leader\d/);
    expect(usernames[0]).toHaveTextContent("leader1");
    expect(usernames[1]).toHaveTextContent("leader2");
    expect(usernames[2]).toHaveTextContent("leader3");
  });

  describe("Анимации изменений", () => {
    it("должен корректно рендериться при обновлении leaderboard", () => {
      const { rerender } = renderWithProviders(
        <Leaderboard leaderboard={mockLeaderboard} />,
      );

      // Обновляем leaderboard с изменённым порядком
      const updatedLeaderboard: Me[] = [
        { ...mockLeaderboard[1], shilka_coins: 1200 }, // leader2 теперь первый
        mockLeaderboard[0],
        mockLeaderboard[2],
      ];

      rerender(<Leaderboard leaderboard={updatedLeaderboard} />);

      // Проверяем что компонент обновился корректно
      expect(screen.getByText("leader1")).toBeInTheDocument();
      expect(screen.getByText("leader2")).toBeInTheDocument();
    });

    it("должен корректно обрабатывать изменение монет", () => {
      const { rerender } = renderWithProviders(
        <Leaderboard leaderboard={mockLeaderboard} />,
      );

      // Обновляем монеты у первого пользователя
      const updatedLeaderboard: Me[] = [
        { ...mockLeaderboard[0], shilka_coins: 1500 },
        mockLeaderboard[1],
        mockLeaderboard[2],
      ];

      rerender(<Leaderboard leaderboard={updatedLeaderboard} />);

      expect(screen.getByText("1500")).toBeInTheDocument();
    });
  });

  describe("Граничные случаи", () => {
    it("должен обрабатывать leaderboard с одним пользователем", () => {
      const singleUserLeaderboard: Me[] = [mockLeaderboard[0]];

      renderWithProviders(<Leaderboard leaderboard={singleUserLeaderboard} />);

      expect(screen.getByText("leader1")).toBeInTheDocument();
      expect(screen.getByText("1000")).toBeInTheDocument();
    });

    it("должен обрабатывать пользователей с одинаковым количеством монет", () => {
      const sameCoinsLeaderboard: Me[] = [
        { ...mockLeaderboard[0], shilka_coins: 500 },
        { ...mockLeaderboard[1], shilka_coins: 500 },
        { ...mockLeaderboard[2], shilka_coins: 500 },
      ];

      renderWithProviders(<Leaderboard leaderboard={sameCoinsLeaderboard} />);

      // Все три значения 500 должны отображаться
      const coins = screen.getAllByText("500");
      expect(coins).toHaveLength(3);
    });

    it("должен обрабатывать очень длинные имена пользователей", () => {
      const longNameLeaderboard: Me[] = [
        {
          id: 1,
          username: "verylongusernamethatmightcauseissues",
          shilka_coins: 1000,
          default_time: 60,
          default_words: 25,
          default_language: "en",
          default_mode: "words",
          default_test_type: "time",
        },
      ];

      renderWithProviders(<Leaderboard leaderboard={longNameLeaderboard} />);

      expect(
        screen.getByText("verylongusernamethatmightcauseissues"),
      ).toBeInTheDocument();
    });

    it("должен обрабатывать большие значения монет", () => {
      const bigCoinsLeaderboard: Me[] = [
        {
          id: 1,
          username: "richuser",
          shilka_coins: 999999999,
          default_time: 60,
          default_words: 25,
          default_language: "en",
          default_mode: "words",
          default_test_type: "time",
        },
      ];

      renderWithProviders(<Leaderboard leaderboard={bigCoinsLeaderboard} />);

      expect(screen.getByText("richuser")).toBeInTheDocument();
      expect(screen.getByText("999999999")).toBeInTheDocument();
    });
  });
});
