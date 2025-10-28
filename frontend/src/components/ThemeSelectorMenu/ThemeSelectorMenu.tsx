import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Button,
  HStack,
  VStack,
  Text,
  Box,
  Spinner,
  useDisclosure,
  Dialog,
  Input,
  InputGroup,
  Kbd,
} from "@chakra-ui/react";
import { logger } from "../../utils/logger";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import { useTheme as useNextTheme } from "next-themes";
import {
  getMyThemes,
  getPublicThemes,
  selectTheme,
  getSelectedTheme,
  type Theme,
} from "../../api/themes/themesRequests";
import ThemeUploader from "../ThemeUploader/ThemeUploader";
import ThemeSelectorSwatch from "../ThemeSelectorSwatch/ThemeSelectorSwatch";
import { LuSearch } from "react-icons/lu";

type CustomThemeData = {
  colors?: Record<
    string,
    | string
    | { _light?: string; _dark?: string }
    | { value?: { _light?: string; _dark?: string } }
  >;
  [k: string]: unknown;
} | null;

const ThemeSelectorMenu: React.FC = () => {
  const [publicThemes, setPublicThemes] = useState<Theme[]>([]);
  const [myThemes, setMyThemes] = useState<Theme[]>([]);
  const [selected, setSelected] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  // notifications are logged to console in this component to avoid coupling
  // with a specific toast implementation
  const { setTheme } = useNextTheme();
  const { open, onOpen, onClose } = useDisclosure();
  const isClient =
    typeof window !== "undefined" && typeof document !== "undefined";
  const load = async () => {
    // protect against calling browser-only APIs in SSR / test node env
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
  };

  useEffect(() => {
    // only run on client; also avoid setting state after unmount
    if (!isClient) return;
    let cancelled = false;

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
    // we intentionally don't depend on load() to avoid re-creating the effect
  }, [isClient]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // keyboard navigation / focus preview
  const allThemes = useMemo(() => {
    const combined = [...myThemes, ...publicThemes];
    const unique = new Map();
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
    // dispatch event to rebuild system with preview data
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

  // preview first theme when search changes (only if menu is open)
  useEffect(() => {
    if (open) {
      if (filteredThemes.length > 0) {
        previewTheme(filteredThemes[0]);
      } else {
        previewTheme(null);
      }
    }
  }, [filteredThemes, previewTheme, open]);

  // when the menu opens, ensure focus is set to the first theme item
  useEffect(() => {
    if (!open) return;
    if (!filteredThemes.length) return;

    // set focus to first item after render so refs are populated
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
      // ignore when typing in inputs or contenteditable areas
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
          // focus the search input after the dialog opens / render
          setTimeout(() => {
            inputRef.current?.focus();
            // select existing text for quick replace
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

  const handleSelect = async (themeId: number) => {
    setSelectingId(themeId);
    try {
      await selectTheme(themeId);
      const sel = await getSelectedTheme();
      logger.debug("handleSelect: selected theme", sel);
      setSelected(sel || null);
      // persist custom theme data and switch next-themes to 'custom'
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

          // notify chakra bridge in same tab that custom theme changed
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
  };

  const renderItem = (t: Theme, idx: number) => {
    const bg = t.theme_data?.colors?.bgCardColor?.value as string | undefined;
    const primary = t.theme_data?.colors?.primaryColor?.value as
      | string
      | undefined;
    const text =
      (t.theme_data?.colors?.textPrimary?.value as string | undefined) ||
      (t.theme_data?.colors?.textColor?.value as string | undefined);

    const isFocused = focusedIndex === idx;

    return (
      <Box
        key={t.id}
        ref={(el: HTMLButtonElement | null) => (itemRefs.current[idx] = el)}
        as="button"
        onClick={() => handleSelect(t.id)}
        border="none"
        textAlign="left"
        px={3}
        py={2}
        onFocus={() => {
          setFocusedIndex(idx);
        }}
        _hover={{ bg: "bgCardColor" }}
        _focus={{ outline: "none" }}
        _before={
          isFocused
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.5,
                bg: "primaryColor",
                borderRadius: "inherit",
                zIndex: 0,
              }
            : undefined
        }
        position="relative"
      >
        <HStack justify="space-between" width="full">
          <HStack gap={3} align="center" w="full">
            <VStack
              align="start"
              gap={0}
              justifyContent="space-between"
              w="full"
            >
              <Text fontSize="sm" zIndex={1}>
                {t.name}
              </Text>
              <Text fontSize="xs" opacity="0.6" zIndex={1}>
                @{t.author_username}
              </Text>
            </VStack>
            <ThemeSelectorSwatch
              bgColor={bg}
              primaryColor={primary}
              textColor={text}
              bgOpacity={isFocused ? 0 : 0.3}
            />
          </HStack>

          {selectingId === t.id ? <Spinner size="xs" /> : null}
        </HStack>
      </Box>
    );
  };

  return (
    <Box position="relative" textStyle="input">
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpen}
        color="textColor"
        opacity={0.6}
        _hover={{
          opacity: 1,
          color: "primaryColor",
          bg: "bgCardColor",
        }}
      >
        <HStack gap={2} align="center">
          <Box as="span">
            <MdOutlineKeyboardArrowUp />
          </Box>
          <Text>{selected ? selected.name : "Темы"}</Text>
        </HStack>
      </Button>

      <Dialog.Root
        size="lg"
        open={open}
        onOpenChange={(d) => {
          if (d.open) {
            onOpen();
          } else {
            previewTheme(null);
            onClose();
          }
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="bgPage" onKeyDown={handleKeyDown} tabIndex={-1}>
            <Dialog.CloseTrigger />
            <Dialog.Header>
              <HStack gap={2} align="center" w="full">
                <InputGroup
                  startElement={
                    <LuSearch color="var(--chakra-colors-text-color)" />
                  }
                  endElement={
                    <Kbd
                      variant="outline"
                      color="textColor"
                      borderColor="textColor"
                    >
                      ⌘K
                    </Kbd>
                  }
                >
                  <Input
                    ref={inputRef}
                    borderColor="textColor"
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        handleKeyDown(e);
                      } else {
                        e.stopPropagation();
                      }
                    }}
                    size="sm"
                    w="full"
                    color="textColor"
                    _placeholder={{ color: "textColor" }}
                  />
                </InputGroup>
              </HStack>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={0}>
                {loading ? (
                  <Box px={3} py={2}>
                    <Spinner size="sm" />
                  </Box>
                ) : filteredThemes.length ? (
                  filteredThemes.map((t, idx) => renderItem(t, idx))
                ) : (
                  <Box px={3} py={2}>
                    {search ? "Нет тем по запросу" : "Нет доступных тем"}
                  </Box>
                )}

                <Box height="1px" bg="borderColor" />

                <Box px={3} py={2}>
                  <HStack justify="space-between">
                    <Box>
                      <Text fontSize="sm">Создать тему</Text>
                      <Text fontSize="xs">
                        Загрузите свою тему в формате JSON
                      </Text>
                    </Box>
                    <ThemeUploader
                      onThemeCreated={async () => {
                        await load();
                        onClose();
                      }}
                    />
                  </HStack>
                </Box>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};

export default ThemeSelectorMenu;
