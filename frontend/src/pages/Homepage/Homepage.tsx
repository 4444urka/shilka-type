import { Box } from "@chakra-ui/react";
import React, { useMemo } from "react";
import TypingScreen from "../../components/TypingScreen/TypingScreen";
import VictoryScreen from "../../components/VictoryScreen/VictoryScreen";
import { useIsAuthed } from "../../hooks/useIsAuthed";
import useTypingSession from "../../hooks/useTypingSession";
import { useAppSelector } from "../../store";

const Homepage = () => {
  const isAuthed = useIsAuthed();
  const shilkaCoins = useAppSelector((state) => state.shilkaCoins);
  const {
    words,
    isLoading,
    time,
    isStartedTyping,
    activeWordIndex,
    currentCharIndex,
    typedChars,
    wordHistory,
    restart,
  } = useTypingSession({
    charsCount: 250,
    initialTime: 30,
    minLength: 3,
    maxLength: 5,
  });

  // TODO: удалить лог
  React.useEffect(() => {
    if (isAuthed) console.log("User is authenticated");
  }, [isAuthed]);

  const correctlyTypedWordsCount = useMemo(() => {
    if (!words.length) return 0;

    const completed = wordHistory.reduce((count, history, index) => {
      const word = words[index];
      if (!word || history.length !== word.length) return count;
      const allCorrect = history.every((char) => char.correct);
      return count + (allCorrect ? 1 : 0);
    }, 0);

    const activeWord = words[activeWordIndex];
    const activeCompletedCorrectly =
      time <= 0 &&
      !!activeWord &&
      typedChars.length === activeWord.length &&
      typedChars.every((char) => char.correct);

    return completed + (activeCompletedCorrectly ? 1 : 0);
  }, [words, wordHistory, time, activeWordIndex, typedChars]);

  const accuracy = useMemo(() => {
    const historyChars = wordHistory.flat();
    const allChars = [...historyChars, ...typedChars];
    if (allChars.length === 0) return 0;

    const correctChars = allChars.filter((char) => char.correct).length;
    return (correctChars / allChars.length) * 100;
  }, [wordHistory, typedChars]);

  return (
    <Box
      display="flex"
      px="200px"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      minHeight={"70vh"}
      animation="fadeIn 0.5s ease-in-out"
    >
      {time > 0 ? (
        <TypingScreen
          words={words}
          isLoading={isLoading}
          time={time}
          isStartedTyping={isStartedTyping}
          activeWordIndex={activeWordIndex}
          currentCharIndex={currentCharIndex}
          typedChars={typedChars}
          wordHistory={wordHistory}
          onRestart={restart}
        />
      ) : (
        <VictoryScreen
          correctlyTypedWordsCount={correctlyTypedWordsCount}
          accuracy={accuracy}
          shilkaCoins={shilkaCoins}
        />
      )}
    </Box>
  );
};

export default Homepage;
