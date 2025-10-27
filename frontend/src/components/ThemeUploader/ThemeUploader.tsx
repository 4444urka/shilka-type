import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Textarea,
  VStack,
  Text,
  useDisclosure,
  Dialog,
} from "@chakra-ui/react";
import { createTheme, type ThemeData } from "../../api/themes/themesRequests";

interface ThemeUploaderProps {
  onThemeCreated?: () => void;
}

const ThemeUploader: React.FC<ThemeUploaderProps> = ({ onThemeCreated }) => {
  const { open, onOpen, onClose } = useDisclosure();
  const [themeName, setThemeName] = useState("");
  const [themeJson, setThemeJson] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!themeName.trim() || !themeJson.trim()) {
      setError("Заполните все поля");
      return;
    }

    try {
      const themeData: ThemeData = {
        name: themeName.trim(),
        theme_data: JSON.parse(themeJson),
        is_public: true,
      };

      setIsLoading(true);
      await createTheme(themeData);
      setError("");
      onClose();
      setThemeName("");
      setThemeJson("");
      onThemeCreated?.();
    } catch (err) {
      console.error("Failed to create theme:", err);
      setError("Ошибка при создании темы. Проверьте JSON формат.");
    } finally {
      setIsLoading(false);
    }
  };

  const exampleTheme = {
    colors: {
      primaryColor: { value: "pink.500" },
      bgCardColor: { value: "pink.50" },
      bgCardSecondaryColor: { value: "pink.100" },
      bgPage: { value: "white" },
      textColor: { value: "gray.900" },
      textPrimary: { value: "gray.900" },
      textSecondary: { value: "gray.600" },
      textMuted: { value: "gray.500" },
      borderColor: { value: "gray.200" },
      errorColor: { value: "red.600" },
      successColor: { value: "green.600" },
    },
  };

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      e.stopPropagation();

      const navKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        " ",
        "Space",
        "Enter",
        "Escape",
      ];

      try {
        const key = (e as KeyboardEvent).key;
        if (navKeys.includes(key)) e.preventDefault();
      } catch {
        /* ignore */
      }
    };

    // use capture phase to intercept events before other listeners
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
                  bg="bgCardColor"
                />

                <Textarea
                  placeholder="JSON данные темы"
                  value={themeJson}
                  onChange={(e) => setThemeJson(e.target.value)}
                  rows={10}
                  fontFamily="mono"
                  bg="bgCardColor"
                />

                <Text fontSize="sm" color="gray.600">
                  Пример структуры темы:
                </Text>
                <Textarea
                  value={JSON.stringify(exampleTheme, null, 2)}
                  readOnly
                  rows={8}
                  fontFamily="mono"
                  fontSize="xs"
                  bg="bgCardColor"
                />

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onClose} bgColor="bgPage">
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isLoading}
                disabled={!themeName.trim() || !themeJson.trim()}
                bg={
                  !themeName.trim() || !themeJson.trim()
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
