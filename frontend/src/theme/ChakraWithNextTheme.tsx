import React, { useMemo, useState, useEffect } from "react";
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { useTheme as useNextTheme } from "next-themes";
import { system as baseSystem } from "./index";
import { textStyles } from "./textStyles";
import { keyframes } from "./keyframes";
import { semanticTokens as baseSemantic } from "./semanticTokens";
import { tokens } from "./tokens";
import { globalCss } from "./globalCss";
import { logger } from "../utils/logger";

const STORAGE_KEY = "shilka:customTheme";

type CustomData = {
  colors?: Record<
    string,
    | string
    | { _light?: string; _dark?: string }
    | { value?: { _light?: string; _dark?: string } }
  >;
  [k: string]: unknown;
} | null;

const buildSystem = (customData: CustomData) => {
  try {
    const base = baseSemantic as unknown as {
      colors?: Record<string, unknown>;
    };
    const colors: Record<string, unknown> = { ...(base.colors || {}) };

    if (customData && typeof customData === "object" && customData.colors) {
      for (const [key, val] of Object.entries(customData.colors)) {
        let light: string | undefined;
        let dark: string | undefined;

        if (typeof val === "string") {
          light = val;
          dark = val;
        } else if (val && typeof val === "object") {
          const v1 =
            (val as { value?: unknown }).value ??
            (val as { _light?: string; _dark?: string });
          if (typeof v1 === "string") {
            light = v1;
            dark = v1;
          } else if (v1 && typeof v1 === "object") {
            const vObj = v1 as { _light?: string; _dark?: string };
            light = vObj._light ?? vObj._dark;
            dark = vObj._dark ?? vObj._light;
          }
        }

        const normalize = (s?: string) => {
          if (!s) return undefined;
          if (
            s.startsWith("#") ||
            s.startsWith("rgb") ||
            s.startsWith("hsl") ||
            s.startsWith("var(") ||
            s.startsWith("{")
          ) {
            return s;
          }
          // match color tokens like "pink.50", "gray.900" (1-3 digit shade)
          if (/^[a-zA-Z0-9_-]+\.[0-9]{1,3}$/.test(s)) {
            return `{colors.${s}}`;
          }
          return s;
        };

        const nl = normalize(light);
        const nd = normalize(dark);

        if (nl || nd) {
          // remove light/dark split: use single value (prefer light)
          const single = nl ?? nd ?? "inherit";
          colors[key] = { value: single };
        }
      }
    }

    // debug: print generated semantic colors for troubleshooting (dev only)
    logger.debug("ChakraWithNextTheme: generated semantic colors:", colors);

    const config = defineConfig({
      globalCss,
      theme: {
        textStyles,
        semanticTokens: { colors } as unknown as typeof baseSemantic,
        tokens,
        keyframes,
      },
    });

    return createSystem(defaultConfig, config);
  } catch {
    // fallback to base system
    return baseSystem;
  }
};

const ChakraWithNextTheme: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme: current } = useNextTheme();

  const [customRaw, setCustomRaw] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    if (current !== "custom") return null;
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [previewData, setPreviewData] = useState<CustomData | null>(null);

  useEffect(() => {
    const handler = () => {
      try {
        setCustomRaw(localStorage.getItem(STORAGE_KEY));
      } catch {
        setCustomRaw(null);
      }
    };
    document.addEventListener(
      "shilka:customThemeChanged",
      handler as EventListener
    );
    return () =>
      document.removeEventListener(
        "shilka:customThemeChanged",
        handler as EventListener
      );
  }, []);

  useEffect(() => {
    const previewHandler = (e: CustomEvent<CustomData>) => {
      logger.debug("ChakraWithNextTheme: preview event received", e.detail);
      setPreviewData(e.detail);
    };
    document.addEventListener(
      "shilka:previewTheme",
      previewHandler as EventListener
    );
    return () =>
      document.removeEventListener(
        "shilka:previewTheme",
        previewHandler as EventListener
      );
  }, []);

  // rebuild system when next-themes current changes OR when custom theme json changes
  // (customRaw is updated via a custom window event)
  const rawStored = current === "custom" ? customRaw : null;

  const system = useMemo(() => {
    const dataToUse =
      previewData ||
      (current === "custom" && rawStored ? JSON.parse(rawStored) : null);
    logger.debug(
      "ChakraWithNextTheme: building system with dataToUse:",
      dataToUse,
      "previewData:",
      previewData,
      "current:",
      current,
      "rawStored:",
      rawStored
    );
    return buildSystem(dataToUse);
  }, [current, rawStored, previewData]);

  // force remount of ChakraProvider when either the next-themes current value
  // or the stored custom theme JSON changes — this ensures CSS variables are
  // regenerated and applied immediately
  let providerKey = current ?? "default";
  if (current === "custom") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      providerKey = raw
        ? `custom:${raw}:${previewData ? "preview" : "selected"}`
        : "custom";
    } catch {
      providerKey = "custom";
    }
  }

  // debug current/providerKey
  logger.debug(
    "ChakraWithNextTheme: current, providerKey:",
    current,
    providerKey
  );

  return <ChakraProvider value={system}>{children}</ChakraProvider>;
};

export default ChakraWithNextTheme;
