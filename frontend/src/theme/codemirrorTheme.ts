import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";

export type TokenValues = {
  primary?: string;
  text?: string;
  textMuted?: string;
  bgCard?: string;
  bgCardSecondary?: string;
  bgPage?: string;
  border?: string;
};

function getCssColor(name: string, fallback?: string) {
  try {
    if (typeof document !== "undefined") {
      // Try several likely CSS variable name variants to be robust against
      // different naming conventions (camelCase, kebab-case, with/without
      // the `--chakra-colors-` prefix).
      const tryNames = new Set<string>();
      const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      tryNames.add(`--chakra-colors-${name}`);
      tryNames.add(`--chakra-colors-${kebab}`);
      tryNames.add(`--${name}`);
      tryNames.add(`--${kebab}`);
      // also try lowercased/no-case variants
      tryNames.add(`--chakra-colors-${name.toLowerCase()}`);
      tryNames.add(`--${name.toLowerCase()}`);

      for (const varName of tryNames) {
        const v = getComputedStyle(document.documentElement).getPropertyValue(
          varName
        );
        if (v) return v.trim();
      }
    }
  } catch {
    // ignore
  }
  return fallback || "";
}

export function createCmThemeFromTokens(tokens: TokenValues) {
  const primary =
    getCssColor("primaryColor", tokens.primary) || tokens.primary || "#000000";
  const text =
    getCssColor("textColor", tokens.text) || tokens.text || "#222222";
  // const bgCard =
  //   getCssColor("bgCardColor", tokens.bgCard) || tokens.bgCard || "#ffffff";
  const bgPage = getCssColor("bgPage", tokens.bgPage) || tokens.bgPage;
  const bgCardSecondary =
    getCssColor("bgCardSecondaryColor", tokens.bgCardSecondary) ||
    tokens.bgCardSecondary ||
    "#f7f7f7";
  const textMuted =
    getCssColor("textMuted", tokens.textMuted) || tokens.textMuted || "#6a737d";
  const border =
    getCssColor("borderColor", tokens.border) || tokens.border || "#dddddd";
  const base = createTheme({
    theme: "light",
    settings: {
      background: bgPage,
      foreground: text,
      caret: primary,
      selection: bgCardSecondary,
      selectionMatch: bgCardSecondary,
      gutterBackground: bgPage,
      gutterForeground: text,
      gutterBorder: border,
      lineHighlight: bgCardSecondary,
    },
    styles: [
      { tag: t.comment, color: textMuted },
      { tag: t.definition(t.typeName), color: primary },
      { tag: t.propertyName, color: primary },
    ],
  });

  return [base];
}

export function readTokenValuesFromDOM(): TokenValues {
  return {
    primary: getCssColor("primaryColor") || undefined,
    text: getCssColor("textColor") || undefined,
    bgCard: getCssColor("bgCardColor") || undefined,
    bgPage: getCssColor("bgPage") || undefined,
    bgCardSecondary: getCssColor("bgCardSecondaryColor") || undefined,
    border: getCssColor("borderColor") || undefined,
  };
}

export function addCustomThemeChangedListener(handler: EventListener) {
  const cleanups: Array<() => void> = [];
  if (typeof document !== "undefined") {
    document.addEventListener("shilka:customThemeChanged", handler);
    cleanups.push(() =>
      document.removeEventListener("shilka:customThemeChanged", handler)
    );
  }
  if (typeof window !== "undefined") {
    // Some places may dispatch on window instead of document.
    window.addEventListener(
      "shilka:customThemeChanged",
      handler as EventListener
    );
    cleanups.push(() =>
      window.removeEventListener(
        "shilka:customThemeChanged",
        handler as EventListener
      )
    );
  }
  // As a fallback, observe :root attribute changes (style/class) which may indicate
  // CSS variable updates when themes are applied programmatically.
  if (
    typeof MutationObserver !== "undefined" &&
    typeof document !== "undefined"
  ) {
    try {
      const target = document.documentElement;
      const obs = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (
            m.type === "attributes" &&
            (m.attributeName === "style" || m.attributeName === "class")
          ) {
            try {
              handler(
                new CustomEvent("shilka:customThemeChanged") as unknown as Event
              );
            } catch {
              // ignore
            }
            break;
          }
        }
      });
      obs.observe(target, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
      cleanups.push(() => obs.disconnect());
    } catch {
      // ignore
    }
  }
  return () => {
    for (const c of cleanups) c();
  };
}
