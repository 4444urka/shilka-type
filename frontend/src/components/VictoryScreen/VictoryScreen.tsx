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
  testType?: "time" | "words";
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  session,
  shilkaCoins,
  testType,
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
          {session.stats.wpm}
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
          {session.stats.accuracy.toFixed(0)}%
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
          textStyle="body"
          fontSize={{ base: "16px", md: "18px" }}
          color="primaryColor"
          opacity="0"
          right={{ base: "20px", md: "100px", xl: "209px" }}
          animation="counterAnimation 2s ease-in-out"
        >
          {shilkaCoins.value > 0 ? "+" : ""}
          {shilkaCoins.value}
        </Box>
      ) : null}
    </Box>
  );
};

export default VictoryScreen;
