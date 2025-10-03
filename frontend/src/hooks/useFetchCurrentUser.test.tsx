import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useFetchCurrentUser from "./useFetchCurrentUser";
import { fetchCurrentUser } from "../api/auth/authRequests";
import type { Me } from "../types/User";
import { createTestWrapper } from "../tests/test-utils";

// Мокируем API запросы
vi.mock("../api/auth/authRequests");

describe("useFetchCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен загружать пользователя успешно", async () => {
    const mockUser: Me = {
      id: 1,
      username: "testuser",
      shilka_coins: 100,
    };
    vi.mocked(fetchCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useFetchCurrentUser(), {
      wrapper: createTestWrapper(),
    });

    // Изначально isLoading должен быть true
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);

    // Ждём завершения загрузки
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Проверяем что пользователь загружен
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
    expect(fetchCurrentUser).toHaveBeenCalledOnce();
  });

  it("должен обрабатывать ошибку при загрузке", async () => {
    const errorMessage = "Network error";
    vi.mocked(fetchCurrentUser).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFetchCurrentUser(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Проверяем что ошибка обработана
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(
      `Failed to fetch current user: ${errorMessage}`
    );
    expect(fetchCurrentUser).toHaveBeenCalledOnce();
  });

  it("должен устанавливать isLoading в false после завершения", async () => {
    const mockUser: Me = {
      id: 2,
      username: "user2",
      shilka_coins: 50,
    };
    vi.mocked(fetchCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useFetchCurrentUser(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLoading).toBe(false);
  });
});
