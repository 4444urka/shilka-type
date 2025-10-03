import { describe, it, expect, beforeEach } from "vitest";
import { getCookie, getAccessTokenFromCookie } from "../utils/cookies";

describe("Cookie Utils", () => {
  beforeEach(() => {
    // Очищаем все cookies перед каждым тестом
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
  });

  describe("getCookie", () => {
    it("должен вернуть значение существующей cookie", () => {
      document.cookie = "test_cookie=test_value";
      expect(getCookie("test_cookie")).toBe("test_value");
    });

    it("должен вернуть null для несуществующей cookie", () => {
      expect(getCookie("nonexistent")).toBeNull();
    });

    it("должен декодировать закодированное значение", () => {
      document.cookie =
        "encoded_cookie=" + encodeURIComponent("value with spaces");
      expect(getCookie("encoded_cookie")).toBe("value with spaces");
    });

    it("должен корректно обрабатывать спецсимволы в имени", () => {
      document.cookie = "cookie.name=value";
      expect(getCookie("cookie.name")).toBe("value");
    });
  });

  describe("getAccessTokenFromCookie", () => {
    it("должен вернуть access_token из cookie", () => {
      document.cookie = "access_token=jwt_token_here";
      expect(getAccessTokenFromCookie()).toBe("jwt_token_here");
    });

    it("должен вернуть пустую строку если токен отсутствует", () => {
      expect(getAccessTokenFromCookie()).toBe("");
    });
  });
});
