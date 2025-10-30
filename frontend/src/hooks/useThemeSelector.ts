import { useDisclosure } from "@chakra-ui/react";
import { useTheme as useNextTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getMyThemes,
  getPublicThemes,
  getSelectedTheme,
  selectTheme,
  type Theme,
} from "../api/themes/themesRequests";
import { logger } from "../utils/logger";
import type { CustomThemeData } from "../types/CustomThemeData";
import type { UseThemeSelectorResult } from "../types/UseThemeSelectorResult";

export default function useThemeSelector(): UseThemeSelectorResult {
  const { open, onOpen, onClose } = useDisclosure();
  const [publicThemes, setPublicThemes] = useState<Theme[]>([]);
  const [myThemes, setMyThemes] = useState<Theme[]>([]);
  const [selected, setSelected] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const { setTheme } = useNextTheme();
  const isClient =
    typeof window !== "undefined" && typeof document !== "undefined";

  const load = useCallback(async () => {
    if (!isClient) return;
    setLoading(true);
    try {
      const [pub, mine, sel] = await Promise.all([
        getPublicThemes(),
        getMyThemes(),
        getSelectedTheme(),
      ]);
      setPublicThemes(pub || []);
      setMyThemes(mine || []);
      setSelected(sel || null);
    } catch (err) {
      console.error("Failed to load themes", err);
    } finally {
      setLoading(false);
    }
  }, [isClient]);

  useEffect(() => {
    let cancelled = false;
    if (!isClient) return;

    (async () => {
      setLoading(true);
      try {
        const [pub, mine, sel] = await Promise.all([
          getPublicThemes(),
          getMyThemes(),
          getSelectedTheme(),
        ]);
        if (cancelled) return;
        setPublicThemes(pub || []);
        setMyThemes(mine || []);
        setSelected(sel || null);
      } catch (err) {
        if (!cancelled) console.error("Failed to load themes", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const allThemes = useMemo(() => {
    const combined = [...myThemes, ...publicThemes];
    const unique = new Map<number, Theme>();
    combined.forEach((t) => unique.set(t.id, t));
    return Array.from(unique.values());
  }, [myThemes, publicThemes]);

  const filteredThemes = useMemo(
    () =>
      allThemes.filter(
        (t) =>
          t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          t.author_username
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())
      ),
    [allThemes, debouncedSearch]
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const focusIndex = useCallback((idx: number | null) => {
    if (idx === null) return;
    const el = itemRefs.current[idx];
    if (el) el.focus();
    setFocusedIndex(idx);
  }, []);

  const previewTheme = useCallback((t?: Theme | null) => {
    logger.debug(
      "ThemeSelectorMenu: previewTheme called with",
      t?.name,
      t?.theme_data
    );
    try {
      if (typeof document !== "undefined") {
        document.dispatchEvent(
          new CustomEvent("shilka:previewTheme", {
            detail: t?.theme_data as CustomThemeData,
          })
        );
      }
    } catch (err) {
      console.error("Failed to dispatch preview event", err);
    }
  }, []);

  useEffect(() => {
    if (open) {
      if (filteredThemes.length > 0) {
        previewTheme(filteredThemes[0]);
      } else {
        previewTheme(null);
      }
    }
  }, [filteredThemes, previewTheme, open]);

  useEffect(() => {
    if (!open) return;
    if (!filteredThemes.length) return;

    const t = setTimeout(() => {
      try {
        focusIndex(0);
      } catch (e) {
        logger.debug("ThemeSelectorMenu: focusIndex failed", e);
      }
    }, 0);

    return () => clearTimeout(t);
  }, [open, filteredThemes, focusIndex]);

  // Global shortcut: Cmd/Ctrl+K opens the themes menu and focuses the search input.
  useEffect(() => {
    if (!isClient) return;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        try {
          if (!open) onOpen();
          setTimeout(() => {
            inputRef.current?.focus();
            try {
              inputRef.current?.select();
            } catch (err) {
              logger.debug("select on input failed", err);
            }
          }, 0);
        } catch (err) {
          logger.debug("Cmd/Ctrl+K handler failed", err);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isClient, onOpen, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!filteredThemes.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next =
        focusedIndex === null
          ? 0
          : Math.min(focusedIndex + 1, filteredThemes.length - 1);
      focusIndex(next);
      setTimeout(() => previewTheme(filteredThemes[next]), 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev =
        focusedIndex === null
          ? filteredThemes.length - 1
          : Math.max(focusedIndex - 1, 0);
      focusIndex(prev);
      setTimeout(() => previewTheme(filteredThemes[prev]), 0);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex !== null) {
        const t = filteredThemes[focusedIndex];
        handleSelect(t.id);
      }
    } else if (e.key === "Escape") {
      previewTheme(null);
      onClose();
    }
  };

  const handleSelect = useCallback(
    async (themeId: number) => {
      setSelectingId(themeId);
      try {
        await selectTheme(themeId);
        const sel = await getSelectedTheme();
        logger.debug("handleSelect: selected theme", sel);
        setSelected(sel || null);
        if (sel?.theme_data) {
          logger.debug("handleSelect: setting localStorage", sel.theme_data);
          if (isClient) {
            try {
              localStorage.setItem(
                "shilka:customTheme",
                JSON.stringify(sel.theme_data)
              );
            } catch (e) {
              logger.debug("localStorage set failed", e);
            }

            try {
              setTheme("custom");
            } catch (e) {
              logger.debug("setTheme failed in test/SSR environment", e);
            }

            try {
              document.dispatchEvent(
                new CustomEvent("shilka:customThemeChanged", {
                  detail: sel.theme_data,
                })
              );
            } catch (e) {
              logger.debug("shilka:customThemeChanged dispatch failed", e);
            }
          }
        }
        previewTheme(null);
        onClose();
      } catch (err) {
        console.error("Failed to select theme", err);
      } finally {
        setSelectingId(null);
      }
    },
    [isClient, previewTheme, setTheme, onClose]
  );

  return {
    open,
    onOpen,
    onClose,
    inputRef,
    itemRefs,
    filteredThemes,
    loading,
    search,
    setSearch,
    selected,
    selectingId,
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    handleSelect,
    load,
    previewTheme,
  };
}
