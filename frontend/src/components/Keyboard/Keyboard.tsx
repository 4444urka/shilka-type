import { Box, Text, Button } from "@chakra-ui/react";
import React from "react";
import type { CharErrorResponse } from "../../types/CharErrorResponse";
import { fetchCharErrors } from "../../api/stats/statsRequests";

type KeyboardLanguage = "en" | "ru";

const Keyboard = () => {
  const [selectedLanguage, setSelectedLanguage] =
    React.useState<KeyboardLanguage>("en");

  const keyboardLayouts = {
    en: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
      ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    ],
    ru: [
      ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х"],
      ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
      ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ",", "."],
    ],
  };

  const keyboardLayout = keyboardLayouts[selectedLanguage];

  const [charsErrorStats, setCharsErrorStats] = React.useState<
    CharErrorResponse[]
  >([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCharErrors();
      setCharsErrorStats(data);
    };
    fetchData();
  }, []);

  // Функция для получения цвета фона с альфа-каналом на основе процента ошибок
  const getOpacityForChar = (char: string): number => {
    const charStat = charsErrorStats.find((stat) => stat.char === char);
    if (!charStat) return 0; // Если нет данных - прозрачный фон

    const errorRate = charStat.error_rate;
    // Преобразуем процент ошибок (0-100) в альфа-канал (0.3-1)
    // 0% ошибок = альфа 0.3 (почти прозрачный фон)
    // Чем больше ошибок, тем больше альфа (тем ярче/непрозрачнее фон)
    const alpha = 0 + errorRate / 100;
    const finalAlpha = Math.max(0, Math.min(1, alpha));
    return finalAlpha;
  };

  return (
    <Box hideBelow="md" p={4} bg="bgCardColor" borderRadius="md" w="100%">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Text color="primaryColor" fontSize={{ base: "sm", xl: "lg" }}>
          Самые ошибочные символы
        </Text>
        <Box display="flex" gap={2}>
          <Button
            size="sm"
            variant="ghost"
            color={selectedLanguage === "en" ? "primaryColor" : "textColor"}
            onClick={() => setSelectedLanguage("en")}
            fontWeight="medium"
            _hover={{
              transform: "scale(1.02)",
              transition: "all 0.2s",
              bg: "bgCardSecondaryColor",
            }}
            _active={{
              transform: "scale(0.95)",
            }}
          >
            English
          </Button>
          <Button
            size="sm"
            variant="ghost"
            color={selectedLanguage === "ru" ? "primaryColor" : "textColor"}
            onClick={() => setSelectedLanguage("ru")}
            fontWeight="medium"
            _hover={{
              bg: "bgCardSecondaryColor",
              transform: "scale(1.02)",
              transition: "all 0.2s",
            }}
            _active={{
              transform: "scale(0.95)",
            }}
          >
            Русский
          </Button>
        </Box>
      </Box>
      {keyboardLayout.map((row, rowIndex) => (
        <Box key={rowIndex} display="flex" justifyContent="center" mb={2}>
          {row.map((key, keyIndex) => (
            <Box
              key={`${selectedLanguage}-${rowIndex}-${keyIndex}-${key}`}
              boxSize={"60px"}
              animation="fadeIn 1s ease-in-out"
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              marginX="2px"
              fontSize="1.5rem"
              textTransform="uppercase"
              userSelect="none"
              transition="all 0.3s ease"
              position="relative"
              overflow="hidden"
              _hover={{
                borderColor: "primaryColor",
                color: "primaryColor",
                boxShadow: "sm",
              }}
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bg: "primaryColor",
                opacity: getOpacityForChar(key),
                borderRadius: "inherit",
                zIndex: 0,
              }}
            >
              <Box position="relative" zIndex={1}>
                {key}
              </Box>
              {/* Насечки на клавишах F и J (English) или А и О (Russian) */}
              {(key === "f" || key === "j" || key === "а" || key === "о") && (
                <Box
                  data-testid="key-notch"
                  position="absolute"
                  bottom="8px"
                  width="8px"
                  height="2px"
                  bg="currentColor"
                  zIndex={1}
                />
              )}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default Keyboard;
