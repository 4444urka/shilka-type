import { Box, Text } from "@chakra-ui/react";
import React from "react";
import type { CharErrorResponse } from "../../types/CharErrorResponse";
import { fetchCharErrors } from "../../api/stats/statsRequests";

const Keyboard = () => {
  const keyboardLayout = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ];
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
  const getBackgroundForChar = (char: string): string => {
    const charStat = charsErrorStats.find((stat) => stat.char === char);
    if (!charStat) return ""; // Если нет данных - прозрачный фон

    const errorRate = charStat.error_rate;
    // Преобразуем процент ошибок (0-100) в альфа-канал (0.3-1)
    // 0% ошибок = альфа 0.3 (почти прозрачный фон)
    // Чем больше ошибок, тем больше альфа (тем ярче/непрозрачнее фон)
    const alpha = 0 + (errorRate / 100) * 0.7;
    const finalAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(34, 211, 238, ${finalAlpha})`; // cyan цвет с изменяющейся прозрачностью
  };

  return (
    <Box p={4} bg="bgCardColor" borderRadius="md" w="100%">
      <Text mb={4} color="primaryColor" fontSize="20px">
        Самые ошибочные символы
      </Text>
      {keyboardLayout.map((row, rowIndex) => (
        <Box key={rowIndex} display="flex" justifyContent="center" mb={2}>
          {row.map((key) => (
            <Box
              key={key}
              boxSize={"60px"}
              display="flex"
              bg={getBackgroundForChar(key)}
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
              _hover={{
                borderColor: "primaryColor",
                color: "primaryColor",
                boxShadow: "sm",
              }}
            >
              {key}
              {/* Насечки на клавишах F и J */}
              {(key === "f" || key === "j") && (
                <Box
                  position="absolute"
                  bottom="8px"
                  width="8px"
                  height="2px"
                  bg="currentColor"
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
