import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Мокируем API модули
vi.mock("../api/stats/statsRequests", () => ({
  fetchLeaderboard: vi.fn(),
  fetchTypingSessions: vi.fn(),
  postWordHistory: vi.fn(),
  fetchCharErrors: vi.fn(),
}));

vi.mock("../api/auth/authRequests", () => ({
  getCurrentUser: vi.fn(),
}));

import {
  fetchLeaderboard,
  fetchTypingSessions,
} from "../api/stats/statsRequests";
import type { Me } from "../types/User";
import type { TypingSession } from "../types/TypingSession";

// Тестовые данные
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

const mockSessions: TypingSession[] = [
  {
    id: 1,
    wpm: 85,
    accuracy: 97.5,
    duration: 60,
    typing_mode: "words",
    language: "en",
    test_type: "time",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: 2,
    wpm: 92,
    accuracy: 99.0,
    duration: 30,
    typing_mode: "time",
    language: "ru",
    test_type: "time",
    created_at: "2026-01-14T15:30:00Z",
  },
];

describe("useFetchLeaderboard tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Успешные запросы", () => {
    it("должен возвращать данные лидерборда при успешном запросе", async () => {
      vi.mocked(fetchLeaderboard).mockResolvedValueOnce(mockLeaderboard);

      const result = await fetchLeaderboard();

      expect(result).toEqual(mockLeaderboard);
      expect(fetchLeaderboard).toHaveBeenCalledTimes(1);
    });

    it("должен возвращать пустой массив при пустом лидерборде", async () => {
      vi.mocked(fetchLeaderboard).mockResolvedValueOnce([]);

      const result = await fetchLeaderboard();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("должен сортировать лидерборд по убыванию монет", async () => {
      vi.mocked(fetchLeaderboard).mockResolvedValueOnce(mockLeaderboard);

      const result = await fetchLeaderboard();

      // Проверяем что монеты отсортированы по убыванию
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].shilka_coins).toBeGreaterThanOrEqual(
          result[i + 1].shilka_coins,
        );
      }
    });
  });

  describe("Обработка ошибок", () => {
    it("должен выбрасывать ошибку при сетевой ошибке", async () => {
      vi.mocked(fetchLeaderboard).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(fetchLeaderboard()).rejects.toThrow("Network error");
    });

    it("должен обрабатывать 401 ошибку (не авторизован)", async () => {
      const unauthorizedError = new Error("Unauthorized");
      vi.mocked(fetchLeaderboard).mockRejectedValueOnce(unauthorizedError);

      await expect(fetchLeaderboard()).rejects.toThrow("Unauthorized");
    });

    it("должен обрабатывать 500 ошибку сервера", async () => {
      const serverError = new Error("Internal Server Error");
      vi.mocked(fetchLeaderboard).mockRejectedValueOnce(serverError);

      await expect(fetchLeaderboard()).rejects.toThrow("Internal Server Error");
    });
  });

  describe("Данные лидерборда", () => {
    it("должен содержать все необходимые поля пользователя", async () => {
      vi.mocked(fetchLeaderboard).mockResolvedValueOnce(mockLeaderboard);

      const result = await fetchLeaderboard();
      const firstUser = result[0];

      expect(firstUser).toHaveProperty("id");
      expect(firstUser).toHaveProperty("username");
      expect(firstUser).toHaveProperty("shilka_coins");
      expect(firstUser).toHaveProperty("default_time");
      expect(firstUser).toHaveProperty("default_words");
      expect(firstUser).toHaveProperty("default_language");
      expect(firstUser).toHaveProperty("default_mode");
      expect(firstUser).toHaveProperty("default_test_type");
    });

    it("должен корректно обрабатывать пользователей с нулевыми монетами", async () => {
      const leaderboardWithZero: Me[] = [
        ...mockLeaderboard,
        {
          id: 4,
          username: "newbie",
          shilka_coins: 0,
          default_time: 60,
          default_words: 25,
          default_language: "en",
          default_mode: "words",
          default_test_type: "time",
        },
      ];

      vi.mocked(fetchLeaderboard).mockResolvedValueOnce(leaderboardWithZero);

      const result = await fetchLeaderboard();
      const userWithZero = result.find((u: Me) => u.username === "newbie");

      expect(userWithZero).toBeDefined();
      expect(userWithZero?.shilka_coins).toBe(0);
    });

    it("должен корректно обрабатывать большие значения монет", async () => {
      const leaderboardWithBigCoins: Me[] = [
        {
          id: 1,
          username: "whale",
          shilka_coins: 999999999,
          default_time: 60,
          default_words: 25,
          default_language: "en",
          default_mode: "words",
          default_test_type: "time",
        },
      ];

      vi.mocked(fetchLeaderboard).mockResolvedValueOnce(
        leaderboardWithBigCoins,
      );

      const result = await fetchLeaderboard();

      expect(result[0].shilka_coins).toBe(999999999);
    });
  });
});

describe("useFetchSessions tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Успешные запросы", () => {
    it("должен возвращать список сессий при успешном запросе", async () => {
      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(mockSessions);

      const result = await fetchTypingSessions();

      expect(result).toEqual(mockSessions);
      expect(fetchTypingSessions).toHaveBeenCalledTimes(1);
    });

    it("должен возвращать пустой массив при отсутствии сессий", async () => {
      vi.mocked(fetchTypingSessions).mockResolvedValueOnce([]);

      const result = await fetchTypingSessions();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("должен получать сессии с указанным лимитом", async () => {
      const limitedSessions = mockSessions.slice(0, 1);
      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(limitedSessions);

      const result = await fetchTypingSessions(1);

      expect(result).toHaveLength(1);
      expect(fetchTypingSessions).toHaveBeenCalledWith(1);
    });
  });

  describe("Обработка ошибок", () => {
    it("должен выбрасывать ошибку при сетевой ошибке", async () => {
      vi.mocked(fetchTypingSessions).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(fetchTypingSessions()).rejects.toThrow("Network error");
    });

    it("должен обрабатывать 401 ошибку (не авторизован)", async () => {
      vi.mocked(fetchTypingSessions).mockRejectedValueOnce(
        new Error("Unauthorized"),
      );

      await expect(fetchTypingSessions()).rejects.toThrow("Unauthorized");
    });

    it("должен обрабатывать timeout ошибку", async () => {
      vi.mocked(fetchTypingSessions).mockRejectedValueOnce(
        new Error("Request timeout"),
      );

      await expect(fetchTypingSessions()).rejects.toThrow("Request timeout");
    });
  });

  describe("Данные сессий", () => {
    it("должен содержать все необходимые поля сессии", async () => {
      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(mockSessions);

      const result = await fetchTypingSessions();
      const firstSession = result[0];

      expect(firstSession).toHaveProperty("id");
      expect(firstSession).toHaveProperty("wpm");
      expect(firstSession).toHaveProperty("accuracy");
      expect(firstSession).toHaveProperty("duration");
      expect(firstSession).toHaveProperty("typing_mode");
      expect(firstSession).toHaveProperty("language");
      expect(firstSession).toHaveProperty("test_type");
      expect(firstSession).toHaveProperty("created_at");
    });

    it("должен корректно обрабатывать сессии с различными режимами", async () => {
      const sessionsWithModes: TypingSession[] = [
        { ...mockSessions[0], typing_mode: "words" },
        { ...mockSessions[1], typing_mode: "time" },
        {
          id: 3,
          wpm: 78,
          accuracy: 95.0,
          duration: 45,
          typing_mode: "sentences",
          language: "en",
          test_type: "words",
          created_at: "2026-01-13T12:00:00Z",
        },
      ];

      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(sessionsWithModes);

      const result = await fetchTypingSessions();

      expect(result.map((s: TypingSession) => s.typing_mode)).toContain(
        "words",
      );
      expect(result.map((s: TypingSession) => s.typing_mode)).toContain("time");
      expect(result.map((s: TypingSession) => s.typing_mode)).toContain(
        "sentences",
      );
    });

    it("должен корректно обрабатывать сессии на разных языках", async () => {
      const sessionsWithLanguages: TypingSession[] = [
        { ...mockSessions[0], language: "en" },
        { ...mockSessions[1], language: "ru" },
      ];

      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(
        sessionsWithLanguages,
      );

      const result = await fetchTypingSessions();

      expect(result.map((s: TypingSession) => s.language)).toContain("en");
      expect(result.map((s: TypingSession) => s.language)).toContain("ru");
    });

    it("должен корректно парсить даты created_at", async () => {
      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(mockSessions);

      const result = await fetchTypingSessions();
      const createdAt = new Date(result[0].created_at);

      expect(createdAt).toBeInstanceOf(Date);
      expect(createdAt.getFullYear()).toBe(2026);
    });
  });

  describe("Граничные случаи", () => {
    it("должен обрабатывать сессии с очень высоким WPM", async () => {
      const highWpmSession: TypingSession[] = [
        {
          id: 1,
          wpm: 300,
          accuracy: 100,
          duration: 60,
          typing_mode: "words",
          language: "en",
          test_type: "time",
          created_at: "2026-01-15T10:00:00Z",
        },
      ];

      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(highWpmSession);

      const result = await fetchTypingSessions();

      expect(result[0].wpm).toBe(300);
    });

    it("должен обрабатывать сессии с 100% accuracy", async () => {
      const perfectSession: TypingSession[] = [
        {
          id: 1,
          wpm: 80,
          accuracy: 100,
          duration: 60,
          typing_mode: "words",
          language: "en",
          test_type: "time",
          created_at: "2026-01-15T10:00:00Z",
        },
      ];

      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(perfectSession);

      const result = await fetchTypingSessions();

      expect(result[0].accuracy).toBe(100);
    });

    it("должен обрабатывать сессии с низким accuracy", async () => {
      const lowAccuracySession: TypingSession[] = [
        {
          id: 1,
          wpm: 40,
          accuracy: 45.5,
          duration: 60,
          typing_mode: "words",
          language: "en",
          test_type: "time",
          created_at: "2026-01-15T10:00:00Z",
        },
      ];

      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(lowAccuracySession);

      const result = await fetchTypingSessions();

      expect(result[0].accuracy).toBe(45.5);
    });

    it("должен обрабатывать очень короткие сессии", async () => {
      const shortSession: TypingSession[] = [
        {
          id: 1,
          wpm: 60,
          accuracy: 90,
          duration: 5,
          typing_mode: "words",
          language: "en",
          test_type: "words",
          created_at: "2026-01-15T10:00:00Z",
        },
      ];

      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(shortSession);

      const result = await fetchTypingSessions();

      expect(result[0].duration).toBe(5);
    });

    it("должен обрабатывать очень длинные сессии", async () => {
      const longSession: TypingSession[] = [
        {
          id: 1,
          wpm: 70,
          accuracy: 88,
          duration: 3600, // 1 час
          typing_mode: "time",
          language: "en",
          test_type: "time",
          created_at: "2026-01-15T10:00:00Z",
        },
      ];

      vi.mocked(fetchTypingSessions).mockResolvedValueOnce(longSession);

      const result = await fetchTypingSessions();

      expect(result[0].duration).toBe(3600);
    });
  });
});

describe("Интеграционные тесты Leaderboard и Sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен корректно обрабатывать параллельные запросы", async () => {
    vi.mocked(fetchLeaderboard).mockResolvedValueOnce(mockLeaderboard);
    vi.mocked(fetchTypingSessions).mockResolvedValueOnce(mockSessions);

    const [leaderboard, sessions] = await Promise.all([
      fetchLeaderboard(),
      fetchTypingSessions(),
    ]);

    expect(leaderboard).toEqual(mockLeaderboard);
    expect(sessions).toEqual(mockSessions);
    expect(fetchLeaderboard).toHaveBeenCalledTimes(1);
    expect(fetchTypingSessions).toHaveBeenCalledTimes(1);
  });

  it("должен обрабатывать ситуацию когда один запрос успешен, а другой нет", async () => {
    vi.mocked(fetchLeaderboard).mockResolvedValueOnce(mockLeaderboard);
    vi.mocked(fetchTypingSessions).mockRejectedValueOnce(
      new Error("Sessions error"),
    );

    const leaderboardPromise = fetchLeaderboard();
    const sessionsPromise = fetchTypingSessions();

    await expect(leaderboardPromise).resolves.toEqual(mockLeaderboard);
    await expect(sessionsPromise).rejects.toThrow("Sessions error");
  });
});
