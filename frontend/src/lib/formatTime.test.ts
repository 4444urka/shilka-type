import { describe, it, expect } from "vitest";
import { formatTime } from "../lib/formatTime";

describe("formatTime", () => {
  it("должен форматировать 0 секунд", () => {
    expect(formatTime(0)).toBe("00:00:00");
  });

  it("должен форматировать секунды", () => {
    expect(formatTime(45)).toBe("00:00:45");
  });

  it("должен форматировать минуты", () => {
    expect(formatTime(90)).toBe("00:01:30");
  });

  it("должен форматировать часы", () => {
    expect(formatTime(3661)).toBe("01:01:01");
  });

  it("должен форматировать большие значения", () => {
    expect(formatTime(7325)).toBe("02:02:05");
  });

  it("должен добавлять ведущие нули", () => {
    expect(formatTime(5)).toBe("00:00:05");
    expect(formatTime(65)).toBe("00:01:05");
  });
});
