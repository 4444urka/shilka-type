import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { useIsAuthed } from "../hooks/useIsAuthed";
import { createTestStore } from "../tests/test-utils";
import type { User } from "../types/User";

describe("useIsAuthed Hook", () => {
  it("должен вернуть false когда пользователь не авторизован", () => {
    const store = createTestStore({
      user: { user: null },
    });

    const { result } = renderHook(() => useIsAuthed(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current).toBe(false);
  });

  it("должен вернуть true когда пользователь авторизован", () => {
    const mockUser: User = {
      id: 1,
      username: "testuser",
      access_token: "mock_token",
    };

    const store = createTestStore({
      user: { user: mockUser },
    });

    const { result } = renderHook(() => useIsAuthed(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current).toBe(true);
  });
});
