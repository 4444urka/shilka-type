import { describe, it, expect, beforeEach } from "vitest";
import shilkaCoinsReducer, {
  setPoints,
  addPoints,
  reset,
} from "../slices/shilkaCoinsSlice";

describe("ShilkaCoins Slice", () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
  });

  const initialState = {
    value: 0,
  };

  it("должен вернуть начальное состояние", () => {
    const state = shilkaCoinsReducer(undefined, { type: "unknown" });
    expect(state.value).toBe(0);
  });

  it("должен установить баллы при setPoints", () => {
    const actual = shilkaCoinsReducer(initialState, setPoints(100));
    expect(actual.value).toBe(100);
  });

  it("должен добавить баллы при addPoints", () => {
    const state = { value: 50 };
    const actual = shilkaCoinsReducer(state, addPoints(25));
    expect(actual.value).toBe(75);
  });

  it("должен сбросить баллы при reset", () => {
    const state = { value: 100 };
    const actual = shilkaCoinsReducer(state, reset());
    expect(actual.value).toBe(0);
  });

  it("должен корректно работать с несколькими операциями", () => {
    let state = initialState;
    state = shilkaCoinsReducer(state, setPoints(100));
    state = shilkaCoinsReducer(state, addPoints(50));
    state = shilkaCoinsReducer(state, addPoints(30));
    expect(state.value).toBe(180);
  });

  it("должен корректно работать с нулевыми значениями", () => {
    const state = initialState;
    const actual = shilkaCoinsReducer(state, setPoints(0));
    expect(actual.value).toBe(0);
  });
});
