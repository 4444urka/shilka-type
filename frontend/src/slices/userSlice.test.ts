import { describe, it, expect } from "vitest";
import userReducer, {
  setUser,
  clearUser,
  initializeUser,
} from "../slices/userSlice";
import type { Me } from "../types/User";

describe("User Slice", () => {
  const initialState = {
    user: null,
    isLoading: true,
    error: null,
  };

  const mockUser: Me = {
    id: 1,
    username: "testuser",
    shilka_coins: 100,
  };

  it("должен вернуть начальное состояние", () => {
    expect(userReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("должен установить пользователя при setUser", () => {
    const actual = userReducer(initialState, setUser(mockUser));
    expect(actual.user).toEqual(mockUser);
    expect(actual.error).toBeNull();
  });

  it("должен очистить пользователя при clearUser", () => {
    const stateWithUser = { ...initialState, user: mockUser };
    const actual = userReducer(stateWithUser, clearUser());
    expect(actual.user).toBeNull();
    expect(actual.error).toBeNull();
  });

  it("должен заменить существующего пользователя на нового", () => {
    const stateWithUser = { ...initialState, user: mockUser };
    const newUser: Me = {
      id: 2,
      username: "newuser",
      shilka_coins: 200,
    };
    const actual = userReducer(stateWithUser, setUser(newUser));
    expect(actual.user).toEqual(newUser);
  });

  it("должен установить null при setUser(null)", () => {
    const stateWithUser = { ...initialState, user: mockUser };
    const actual = userReducer(stateWithUser, setUser(null));
    expect(actual.user).toBeNull();
  });

  it("должен установить isLoading в true при initializeUser.pending", () => {
    const actual = userReducer(initialState, {
      type: initializeUser.pending.type,
    });
    expect(actual.isLoading).toBe(true);
    expect(actual.error).toBeNull();
  });

  it("должен установить пользователя при initializeUser.fulfilled", () => {
    const actual = userReducer(initialState, {
      type: initializeUser.fulfilled.type,
      payload: mockUser,
    });
    expect(actual.isLoading).toBe(false);
    expect(actual.user).toEqual(mockUser);
  });

  it("должен установить ошибку при initializeUser.rejected", () => {
    const actual = userReducer(initialState, {
      type: initializeUser.rejected.type,
      error: { message: "Error" },
    });
    expect(actual.isLoading).toBe(false);
    expect(actual.error).toBe("Error");
    expect(actual.user).toBeNull();
  });
});
