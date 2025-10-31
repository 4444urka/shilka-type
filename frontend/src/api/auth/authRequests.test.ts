import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  register,
  login,
  logout,
  fetchCurrentUser,
  updateUserSettings,
} from "./authRequests";
import { myapiInstance } from "../index";

// Мокируем axios instance
vi.mock("../index");

describe("authRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("должен отправлять POST запрос на /auth/register", async () => {
      const userData = {
        username: "newuser",
        password: "password123",
      };
      const mockResponse = {
        data: {
          id: 1,
          username: "newuser",
          shilka_coins: 0,
        },
      };
      vi.mocked(myapiInstance.post).mockResolvedValue(mockResponse);

      const result = await register(userData);

      expect(myapiInstance.post).toHaveBeenCalledWith(
        "/auth/register",
        userData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("login", () => {
    it("должен отправлять POST запрос с URLSearchParams", async () => {
      const userData = {
        username: "testuser",
        password: "testpass",
      };
      const mockResponse = {
        data: {
          access_token: "token123",
          token_type: "bearer",
        },
      };
      vi.mocked(myapiInstance.post).mockResolvedValue(mockResponse);

      const result = await login(userData);

      expect(myapiInstance.post).toHaveBeenCalledWith(
        "/auth/login",
        expect.any(URLSearchParams),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("должен правильно формировать URLSearchParams", async () => {
      const userData = {
        username: "user",
        password: "pass",
      };
      const mockResponse = {
        data: { access_token: "token", token_type: "bearer" },
      };
      vi.mocked(myapiInstance.post).mockResolvedValue(mockResponse);

      await login(userData);

      const callArgs = vi.mocked(myapiInstance.post).mock.calls[0];
      const params = callArgs[1] as URLSearchParams;

      expect(params.get("username")).toBe("user");
      expect(params.get("password")).toBe("pass");
    });
  });

  describe("logout", () => {
    it("должен отправлять POST запрос на /auth/logout", async () => {
      const mockResponse = { data: { message: "Logged out" } };
      vi.mocked(myapiInstance.post).mockResolvedValue(mockResponse);

      const result = await logout();

      expect(myapiInstance.post).toHaveBeenCalledWith("/auth/logout");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("fetchCurrentUser", () => {
    it("должен отправлять GET запрос на /auth/me", async () => {
      const mockResponse = {
        data: {
          id: 1,
          username: "testuser",
          shilka_coins: 100,
        },
      };
      vi.mocked(myapiInstance.get).mockResolvedValue(mockResponse);

      const result = await fetchCurrentUser();

      expect(myapiInstance.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("updateUserSettings", () => {
    it("должен отправлять PATCH запрос на /auth/settings с переданными полями", async () => {
      const mockResponse = {
        data: {
          id: 1,
          username: "testuser",
          default_time: 60,
        },
      };
      vi.mocked(myapiInstance.patch).mockResolvedValue(mockResponse);

      const payload = { default_time: 60 };
      const result = await updateUserSettings(payload);

      expect(myapiInstance.patch).toHaveBeenCalledWith(
        "/auth/settings",
        payload
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
