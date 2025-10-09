import { Box, Text, type BoxProps } from "@chakra-ui/react";
import React from "react";
import RestartButton from "../RestartButton/RestartButton";
import { useIsAuthed } from "../../hooks/useIsAuthed";
import { addCoins } from "../../api/stats/statsRequests";
import type { TypingSessionNew } from "../../types/TypingTypes";
import { useAppDispatch } from "../../store";
import { addPoints } from "../../slices/shilkaCoinsSlice";

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
  const dispatch = useAppDispatch();
  const isAuthed = useIsAuthed();
  React.useEffect(() => {
    if (!isAuthed) return;
    (async () => {
      if (shilkaCoins.value !== 0) {
        await addCoins(shilkaCoins.value);
        dispatch(addPoints(shilkaCoins.value));
      }
    })();
  }, [shilkaCoins.value, isAuthed, dispatch]);

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
        fontSize={"3xl"}
        display="flex"
        gap={2}
        flexDirection="row"
      >
        {testType == "time" ? (
          <Text as="span">Время: {session.initialTime}с</Text>
        ) : (
          <Text as="span">Слова: {session.words.length}</Text>
        )}
      </Text>
      <Text
        textStyle="body"
        fontSize={"3xl"}
        display="flex"
        gap={2}
        flexDirection="row"
      >
        WPM:
        <Text as="span" color="primaryColor">
          {session.stats.wpm}
        </Text>
      </Text>

      <Text
        textStyle="body"
        fontSize={"3xl"}
        display="flex"
        gap={2}
        flexDirection="row"
      >
        Accuracy:
        <Text as="span" color="gray.400">
          {session.stats.accuracy.toFixed(0)}%
        </Text>
      </Text>

      <Text
        textStyle="body"
        fontSize={"3xl"}
        display="flex"
        gap={2}
        flexDirection="row"
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
          top="90px "
          textStyle="body"
          fontSize="18px"
          color="primaryColor"
          opacity="0"
          right="209px"
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
