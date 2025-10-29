/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Dialog,
  Input,
  Text,
  useDisclosure,
  useToken,
  VStack,
} from "@chakra-ui/react";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import React, { useEffect, useState } from "react";
import {
  createTheme as createThemeRequest,
  type ThemeData,
} from "../../api/themes/themesRequests";
import {
  addCustomThemeChangedListener,
  createCmThemeFromTokens,
  readTokenValuesFromDOM,
  type TokenValues,
} from "../../theme/codemirrorTheme";
import exampleTheme from "../../theme/exampleTheme";

interface ThemeUploaderProps {
  onThemeCreated?: () => void;
}

const ThemeUploader: React.FC<ThemeUploaderProps> = ({ onThemeCreated }) => {
  const { open, onOpen, onClose } = useDisclosure();
  const [themeName, setThemeName] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [
    primaryColorVal,
    textColorVal,
    bgCardColorVal,
    bgCardSecondaryColorVal,
    borderColorVal,
  ] = useToken("colors", [
    "primaryColor",
    "textColor",
    "bgCardColor",
    "bgCardSecondaryColor",
    "borderColor",
  ]);

  // themeVersion увеличивается, когда применяется пользовательская тема (слушаем события изменения темы)
  const [themeVersion, setThemeVersion] = React.useState(0);
  const [previewTokens, setPreviewTokens] = useState<TokenValues | null>(null);

  useEffect(() => {
    const handler = () => setThemeVersion((v) => v + 1);
    const cleanup = addCustomThemeChangedListener(handler as EventListener);
    return cleanup;
  }, []);

  // Слушаем события превью темы и применяем их сразу к теме CodeMirror.
  useEffect(() => {
    const handler = (e: Event) => {
      const anyE = e as any;
      const detail = anyE?.detail;
      if (!detail) {
        setPreviewTokens(null);
        return;
      }

      // Преобразуем возможные форматы detail в TokenValues. Поддерживаем объекты вида
      // { colors: { primaryColor: { value } }} и { colors: { primaryColor: "#fff" } },
      // а также прямую карту токенов.
      const colors = detail.colors || detail;
      const mapVal = (k: string) => {
        const v = colors?.[k];
        if (!v) return undefined;
        if (typeof v === "string") return v;
        if (v && typeof v === "object") return v.value || v.hex || v;
        return undefined;
      };

      const tokens: TokenValues = {
        primary: mapVal("primaryColor") || mapVal("primary") || undefined,
        text: mapVal("textColor") || mapVal("text") || undefined,
        bgCard: mapVal("bgCardColor") || mapVal("bgCard") || undefined,
        bgCardSecondary:
          mapVal("bgCardSecondaryColor") ||
          mapVal("bgCardSecondary") ||
          undefined,
        border: mapVal("borderColor") || mapVal("border") || undefined,
      };

      setPreviewTokens(tokens);
    };

    if (typeof document !== "undefined") {
      document.addEventListener(
        "shilka:previewTheme",
        handler as EventListener
      );
    }
    if (typeof window !== "undefined") {
      window.addEventListener("shilka:previewTheme", handler as EventListener);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener(
          "shilka:previewTheme",
          handler as EventListener
        );
      }
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "shilka:previewTheme",
          handler as EventListener
        );
      }
    };
  }, []);

  // Когда открывается загрузчик: если ранее (до монтирования этого компонента)
  // было применено превью темы, попробуем считать текущие значения токенов из DOM,
  // чтобы редактор сразу показывал активное превью.
  useEffect(() => {
    if (!open) return;
    const fromDom = readTokenValuesFromDOM();
    // If any meaningful value found, use it as preview tokens.
    const hasAny = Object.values(fromDom).some((v) => !!v);
    if (hasAny) setPreviewTokens(fromDom);
  }, [open]);

  // Пересчитываем тему CodeMirror при изменении themeVersion (применена пользоват. тема).
  const cmTheme = React.useMemo(() => {
    void themeVersion;
    // If a preview theme is active, prefer it.
    if (previewTokens) {
      return createCmThemeFromTokens(previewTokens);
    }
    return createCmThemeFromTokens({
      primary: primaryColorVal,
      text: textColorVal,
      bgCard: bgCardColorVal,
      bgCardSecondary: bgCardSecondaryColorVal,
      border: borderColorVal,
    });
  }, [
    themeVersion,
    primaryColorVal,
    textColorVal,
    bgCardColorVal,
    previewTokens,
    bgCardSecondaryColorVal,
    borderColorVal,
  ]);

  const handleSubmit = async () => {
    if (!themeName.trim() || !editorValue.trim()) {
      setError("Заполните все поля");
      return;
    }

    try {
      const themeData: ThemeData = {
        name: themeName.trim(),
        theme_data: JSON.parse(editorValue),
        is_public: true,
      };

      setIsLoading(true);
      await createThemeRequest(themeData);
      setError("");
      onClose();
      setThemeName("");
      setEditorValue("");
      onThemeCreated?.();
    } catch (err) {
      console.error("Failed to create theme:", err);
      setError("Ошибка при создании темы. Проверьте JSON формат.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      e.stopPropagation();
    };

    // используем фазу capture, чтобы перехватить события раньше других слушателей
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open]);

  return (
    <>
      <Button
        onClick={onOpen}
        size="sm"
        textStyle="input"
        fontSize="14px"
        bg="primaryColor"
      >
        Создать тему
      </Button>

      <Dialog.Root
        size="lg"
        open={open}
        onOpenChange={(details) => (details.open ? onOpen() : onClose())}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="bgPage">
            <Dialog.CloseTrigger />
            <Dialog.Header>
              <Dialog.Title>Создать пользовательскую тему</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Input
                  placeholder="Название темы"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  borderColor="textColor"
                  _placeholder={{ color: "textMuted" }}
                />

                <Box borderRadius="md" p={2}>
                  <CodeMirror
                    value={editorValue}
                    height="300px"
                    theme={cmTheme}
                    extensions={[json(), EditorView.lineWrapping]}
                    onChange={(value) => {
                      setEditorValue(value);
                      try {
                        JSON.parse(value);
                        setEditorError(null);
                      } catch (e: any) {
                        setEditorError(e.message);
                      }
                    }}
                  />

                  {editorError && (
                    <Text color="red.500" fontSize="sm" mt={2}>
                      {editorError}
                    </Text>
                  )}
                </Box>
                <Text fontSize="sm">Пример:</Text>
                <Box borderRadius="md" p={2}>
                  <CodeMirror
                    value={JSON.stringify(exampleTheme, null, 2)}
                    theme={cmTheme}
                    height="300px"
                    extensions={[json(), EditorView.lineWrapping]}
                    style={{ borderColor: "var(--chakra-styles-text-color)" }}
                  />
                </Box>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={onClose}
                bgColor="bgPage"
                color="textColor"
                borderColor="textColor"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isLoading}
                disabled={
                  !themeName.trim() || !editorValue.trim() || !!editorError
                }
                bg={
                  !themeName.trim() || !editorValue.trim()
                    ? "gray.300"
                    : "primaryColor"
                }
              >
                Создать
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};

export default ThemeUploader;
