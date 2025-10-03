import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useFetchSessions from "./useFetchSessions";
import { fetchTypingSessions } from "../api/stats/statsRequests";

// Мокируем API запросы
vi.mock("../api/stats/statsRequests");

describe("useFetchSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен загружать сессии успешно", async () => {
    const mockSessions = [
      { id: 1, wpm: 60, accuracy: 95, duration: 120, created_at: "2025-10-03" },
      { id: 2, wpm: 70, accuracy: 97, duration: 180, created_at: "2025-10-02" },
    ];
    vi.mocked(fetchTypingSessions).mockResolvedValue(mockSessions);

    const { result } = renderHook(() => useFetchSessions());

    // Изначально isLoading должен быть true
    expect(result.current.isLoading).toBe(true);
    expect(result.current.sessions).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessions).toEqual(mockSessions);
    expect(fetchTypingSessions).toHaveBeenCalledOnce();
  });

  it("должен обрабатывать ошибку при загрузке", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(fetchTypingSessions).mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => useFetchSessions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessions).toEqual([]);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("должен устанавливать isLoading в false после завершения", async () => {
    const mockSessions = [
      { id: 1, wpm: 60, accuracy: 95, duration: 120, created_at: "2025-10-03" },
    ];
    vi.mocked(fetchTypingSessions).mockResolvedValue(mockSessions);

    const { result } = renderHook(() => useFetchSessions());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLoading).toBe(false);
  });
});
