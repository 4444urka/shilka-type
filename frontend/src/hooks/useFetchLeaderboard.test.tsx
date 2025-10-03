import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useFetchLeaderboard from "./useFetchLeaderboard";
import { fetchLeaderboard } from "../api/stats/statsRequests";

// Мокируем API запросы
vi.mock("../api/stats/statsRequests");

describe("useFetchLeaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен загружать список лидеров успешно", async () => {
    const mockLeaderboard = [
      { id: 1, username: "user1", shilka_coins: 1000 },
      { id: 2, username: "user2", shilka_coins: 900 },
    ];
    vi.mocked(fetchLeaderboard).mockResolvedValue(mockLeaderboard);

    const { result } = renderHook(() => useFetchLeaderboard());

    // Изначально должен быть isLoading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.leaderboard).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.leaderboard).toEqual(mockLeaderboard);
    expect(result.current.error).toBe(null);
  });

  it("должен обрабатывать ошибку при загрузке", async () => {
    vi.mocked(fetchLeaderboard).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useFetchLeaderboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.leaderboard).toEqual([]);
    expect(result.current.error).toBe("Не удалось загрузить список лидеров");
  });

  it("должен предоставлять функцию reload", async () => {
    const mockLeaderboard = [{ id: 1, username: "user1", shilka_coins: 1000 }];
    vi.mocked(fetchLeaderboard).mockResolvedValue(mockLeaderboard);

    const { result } = renderHook(() => useFetchLeaderboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Вызываем reload
    vi.mocked(fetchLeaderboard).mockClear();
    await result.current.reload();

    await waitFor(() => {
      expect(fetchLeaderboard).toHaveBeenCalledOnce();
    });
  });
});
