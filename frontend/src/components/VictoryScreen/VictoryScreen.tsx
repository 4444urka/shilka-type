import { Box, Text, type BoxProps } from "@chakra-ui/react";
import React from "react";
import RestartButton from "../RestartButton/RestartButton";
import { useIsAuthed } from "../../hooks/useIsAuthed";
import type { TypingSessionNew } from "../../types/TypingTypes";

export interface VictoryScreenProps extends BoxProps {
  session: TypingSessionNew;
  shilkaCoins: {
    value: number;
  };
  wpm: number;
  accuracy: number;
  testType?: "time" | "words";
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  session,
  shilkaCoins,
  testType,
  wpm,
  accuracy,
  ...rest
}) => {
  // dispatch not needed here; balance обновляется через useSessionDataSync
  const isAuthed = useIsAuthed();
  React.useEffect(() => {
    if (!isAuthed) return;
    (async () => {
      // Награда теперь вычисляется на сервере при отправке typing-session.
      // Здесь просто триггерим обновление лидерборда (баланс обновится из ответа сервера
      // в useSessionDataSync, который делает fetchCurrentUser после postWordHistory).
      if (shilkaCoins.value !== 0) {
        window.dispatchEvent(new Event("leaderboard:reload"));
      }
    })();
  }, [shilkaCoins.value, isAuthed]);

  return (
    <Box
      animation="fadeIn 0.5s ease-in-out"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={4}
      {...rest}
    >
      <Text
        textStyle="body"
        fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
        display="flex"
        gap={2}
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="center"
      >
        {testType == "time" ? (
          <Text as="span">Время: {session.initialTime}с</Text>
        ) : (
          <Text as="span">Слова: {session.words.length}</Text>
        )}
      </Text>
      <Text
        textStyle="body"
        fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
        display="flex"
        gap={2}
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="center"
      >
        WPM:
        <Text as="span" color="primaryColor">
          {wpm}
        </Text>
      </Text>

      <Text
        textStyle="body"
        fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
        display="flex"
        gap={2}
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="center"
      >
        Accuracy:
        <Text as="span" color="gray.400">
          {accuracy.toFixed(0)}%
        </Text>
      </Text>

      <Text
        textStyle="body"
        fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
        display="flex"
        gap={2}
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="center"
      >
        Символы:
        <Text fontWeight="bold" color="successColor">
          {session.stats.correctChars}
        </Text>
        <Text color="gray.400">/</Text>
        <Text fontWeight="bold" color="errorColor" textDecoration="underline">
          {session.stats.incorrectChars}
        </Text>
      </Text>
      <RestartButton onClick={() => window.location.reload()} />
      {isAuthed ? (
        <Box
          position="fixed"
          top={{ base: "70px", md: "90px" }}
          right={{ base: "20px", md: "100px", xl: "209px" }}
          textStyle="body"
          fontSize={{ base: "16px", md: "18px" }}
          display="flex"
          flexDirection="column"
          alignItems="flex-end"
          gap={1}
        >
          {/* Заработано (зелёные) - плавно появляется и исчезает */}
          <Text
            color="successColor"
            fontWeight="medium"
            opacity="0"
            animation="coinsDetailsAnimation 2s ease-in-out"
          >
            +{session.stats.correctChars}
          </Text>
          {/* Отнято (красные) - плавно появляется и исчезает */}
          <Text
            color="errorColor"
            fontWeight="medium"
            opacity="0"
            animation="coinsDetailsAnimation 2s ease-in-out"
          >
            -{session.stats.incorrectChars}
          </Text>
          {/* Разделитель - плавно появляется и исчезает */}
          <Box
            width="100%"
            height="1px"
            bg="primaryColor"
            my={1}
            opacity="0"
            animation="coinsDetailsAnimation 2s ease-in-out"
          />
          {/* Итоговый результат - появляется и улетает вверх */}
          <Text
            color="primaryColor"
            fontWeight="bold"
            fontSize={{ base: "18px", md: "20px" }}
            opacity="0"
            animation="counterAnimation 2.5s ease-in-out"
          >
            {shilkaCoins.value > 0 ? "+" : ""}
            {shilkaCoins.value}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
};

export default VictoryScreen;
