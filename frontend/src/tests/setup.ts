import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import shilkaCoinsReducer from "../slices/shilkaCoinsSlice";

// Очистка после каждого теста
afterEach(() => {
  cleanup();
});

// Mock для window.matchMedia (используется в Chakra UI)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Устанавливаем переменные окружения для тестов
process.env.VITE_API_URL = "http://localhost:8000";

// Создаем тестовый Redux store
export const createTestStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      shilkaCoins: shilkaCoinsReducer,
    },
  });
};

// Mock для console методов в тестах (опционально, если нужно подавить warnings)
global.console = {
  ...console,
  // Можно отключить warnings в тестах
  // warn: vi.fn(),
  // error: vi.fn(),
};
