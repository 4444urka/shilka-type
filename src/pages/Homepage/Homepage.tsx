import { Box, Text } from "@chakra-ui/react";
import { LayoutGroup } from "framer-motion";
import { useMemo } from "react";
import Cursor from "../../components/Cursor/Cursor";
import HomepageLoader from "../../components/HomepageLoader/HomepageLoader";
import Timer from "../../components/Timer/Timer";
import useTypingSession from "../../hooks/useTypingSession";
import RestartButton from "../../components/RestartButton/RestartButton";

const Homepage = () => {
  const {
    words,
    isLoading,
    time,
    isStartedTyping,
    activeWordIndex,
    currentCharIndex,
    typedChars,
    wordHistory,
  } = useTypingSession({ wordsCount: 40, initialTime: 30 });

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

  const renderWord = (
    word: string,
    wordIndex: number,
    isActive: boolean,
    isCompleted: boolean
  ) => {
    if (isCompleted) {
      const history = wordHistory[wordIndex] || [];
      if (history.length > 0) {
        return (
          <Box
            as="span"
            key={`${word}-${"done"}`}
            mr={3}
            display="inline-flex"
            flexWrap="wrap"
          >
            {word.split("").map((char, idx) => {
              const typed = history[idx];
              const color = typed
                ? typed.correct
                  ? undefined
                  : "red.600"
                : undefined;
              return (
                <Text
                  as="span"
                  key={idx}
                  color={color}
                  opacity={typed ? 1 : 0.5}
                >
                  {char}
                </Text>
              );
            })}
          </Box>
        );
      }
      return (
        <Box as="span" key={`${word}-${"done"}`} opacity={1} mr={3}>
          {word}
        </Box>
      );
    }

    if (isActive) {
      const chars = word.split("");
      return (
        <Box
          as="span"
          key={`${word}-${"active"}`}
          mr={3}
          display="inline-flex"
          flexWrap="wrap"
        >
          {chars.map((char, idx) => {
            const typed = typedChars[idx];
            const isTyped = idx < currentCharIndex;
            let color: string | undefined;
            if (isTyped && typed) {
              color = typed.correct ? undefined : "red.600";
            } else {
              color = undefined;
            }
            const showCursor = idx === currentCharIndex;
            return (
              <Box key={idx} as="span" position="relative">
                <Text as="span" color={color} opacity={isTyped ? 1 : 0.5}>
                  {char}
                </Text>
                {showCursor && currentCharIndex < chars.length && (
                  <Box as="span" position="absolute" left={0} top={0}>
                    <Cursor />
                  </Box>
                )}
              </Box>
            );
          })}
          {currentCharIndex === chars.length && (
            <Box
              as="span"
              position="relative"
              display="inline-block"
              width="0"
              aria-hidden
            >
              <Cursor />
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box as="span" key={`${word}-${"idle"}`} opacity={0.5} mr={3}>
        {word}
      </Box>
    );
  };

  return (
    <Box
      display="flex"
      px="200px"
      alignItems="center"
      justifyContent="center"
      gap={5}
      flexDirection="column"
      minHeight={"70vh"}
    >
      {time > 0 ? (
        <>
          <Timer opacity={isStartedTyping ? 1 : 0}>{time}</Timer>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={6}
          >
            <HomepageLoader isLoading={isLoading} />
            {!isLoading && words.length > 0 && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={6}
              >
                <LayoutGroup id="typing-session">
                  <Box
                    textStyle="body"
                    display={"flex"}
                    flexWrap={"wrap"}
                    alignItems="center"
                    position="relative"
                  >
                    {words.map((word, index) =>
                      renderWord(
                        word,
                        index,
                        index === activeWordIndex,
                        index < activeWordIndex
                      )
                    )}
                  </Box>
                </LayoutGroup>
                <RestartButton onClick={() => window.location.reload()} />
              </Box>
            )}
          </Box>
        </>
      ) : (
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
            WPM:
            <Text as="span" color="primaryColor">
              {correctlyTypedWordsCount * 2}
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
            <Text as="span" color="primaryColor">
              {accuracy.toFixed(0)}%
            </Text>
          </Text>
          <RestartButton onClick={() => window.location.reload()} />
        </Box>
      )}
    </Box>
  );
};

export default Homepage;
