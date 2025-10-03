import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addCoins,
  fetchLeaderboard,
  postWordHistory,
  fetchTypingSessions,
} from "./statsRequests";
import instance from "../index";

// Мокируем axios instance
vi.mock("../index");

describe("statsRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addCoins", () => {
    it("должен отправлять POST запрос на /stats/add-coins", async () => {
      const amount = 50;
      const mockResponse = { data: { shilka_coins: 150 } };
      vi.mocked(instance.post).mockResolvedValue(mockResponse);

      const result = await addCoins(amount);

      expect(instance.post).toHaveBeenCalledWith("/stats/add-coins", {
        amount,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("fetchLeaderboard", () => {
    it("должен отправлять GET запрос на /stats/leaderboard", async () => {
      const mockLeaderboard = [
        { username: "user1", shilka_coins: 1000 },
        { username: "user2", shilka_coins: 900 },
      ];
      const mockResponse = { data: mockLeaderboard };
      vi.mocked(instance.get).mockResolvedValue(mockResponse);

      const result = await fetchLeaderboard();

      expect(instance.get).toHaveBeenCalledWith("/stats/leaderboard");
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe("postWordHistory", () => {
    it("должен отправлять POST запрос с payload", async () => {
      const payload = {
        words: ["hello", "world"],
        history: [
          [
            { char: "h", correct: true, time: 100 },
            { char: "e", correct: true, time: 200 },
          ],
        ],
        duration: 120,
      };
      const mockResponse = {
        data: {
          id: 1,
          wpm: 60,
          accuracy: 95,
          duration: 120,
          created_at: "2025-10-03T00:00:00Z",
        },
      };
      vi.mocked(instance.post).mockResolvedValue(mockResponse);

      const result = await postWordHistory(payload);

      expect(instance.post).toHaveBeenCalledWith(
        "/stats/typing-session",
        payload
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("fetchTypingSessions", () => {
    it("должен отправлять GET запрос с параметром limit по умолчанию", async () => {
      const mockSessions = [
        {
          id: 1,
          wpm: 60,
          accuracy: 95,
          duration: 120,
          created_at: "2025-10-03",
        },
      ];
      const mockResponse = { data: mockSessions };
      vi.mocked(instance.get).mockResolvedValue(mockResponse);

      const result = await fetchTypingSessions();

      expect(instance.get).toHaveBeenCalledWith("/stats/typing-sessions", {
        params: { limit: 100 },
      });
      expect(result).toEqual(mockSessions);
    });

    it("должен отправлять GET запрос с кастомным limit", async () => {
      const mockSessions = [
        {
          id: 1,
          wpm: 60,
          accuracy: 95,
          duration: 120,
          created_at: "2025-10-03",
        },
      ];
      const mockResponse = { data: mockSessions };
      vi.mocked(instance.get).mockResolvedValue(mockResponse);

      const result = await fetchTypingSessions(50);

      expect(instance.get).toHaveBeenCalledWith("/stats/typing-sessions", {
        params: { limit: 50 },
      });
      expect(result).toEqual(mockSessions);
    });
  });
});
