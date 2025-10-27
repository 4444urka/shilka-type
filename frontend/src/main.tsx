import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import ChakraWithNextTheme from "./theme/ChakraWithNextTheme";
import { Provider } from "react-redux";
import { store } from "./store";
// system import removed — Chakra system is built dynamically inside ChakraWithNextTheme
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ChakraWithNextTheme>
            <App />
          </ChakraWithNextTheme>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
