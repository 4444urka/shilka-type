import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import shilkaCoinsReducer from "../slices/shilkaCoinsSlice";
import { system } from "../theme";

/**
 * Создаёт тестовый store с начальным состоянием
 */
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      user: userReducer,
      shilkaCoins: shilkaCoinsReducer,
    },
    preloadedState,
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
}

/**
 * Создаёт wrapper компонент с провайдерами для renderHook
 */
export function createTestWrapper(preloadedState = {}) {
  const store = createTestStore(preloadedState);

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ChakraProvider value={system}>{children}</ChakraProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  };
}

/**
 * Кастомный render для тестов с провайдерами
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ChakraProvider value={system}>{children}</ChakraProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
