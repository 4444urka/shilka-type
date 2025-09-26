import { Box, Text } from "@chakra-ui/react";
import Cursor from "../../components/Cursor/Cursor";
import HomepageLoader from "../../components/HomepageLoader/HomepageLoader";
import Timer from "../../components/Timer/Timer";
import useTypingSession from "../../hooks/useTypingSession";

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
          <Text key={`${word}-${"done"}`} mr={3} display="flex">
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
          </Text>
        );
      }
      return (
        <Text key={`${word}-${"done"}`} opacity={1} mr={3}>
          {word}
        </Text>
      );
    }

    if (isActive) {
      const chars = word.split("");
      return (
        <Text key={`${word}-${"active"}`} mr={3} display="flex">
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
              <Box key={idx} position="relative">
                <Text as="span" color={color} opacity={isTyped ? 1 : 0.5}>
                  {char}
                </Text>
                {showCursor && currentCharIndex < chars.length && (
                  <Box
                    as="span"
                    position="absolute"
                    left={0}
                    top={0}
                    transform="translateX(-2px)"
                  >
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
        </Text>
      );
    }

    return (
      <Text key={`${word}-${"idle"}`} opacity={0.5} mr={3}>
        {word}
      </Text>
    );
  };

  return (
    <Box
      display="flex"
      px={20}
      alignItems="center"
      justifyContent="center"
      gap={5}
      flexDirection="column"
      minHeight={"70vh"}
    >
      <Timer opacity={isStartedTyping ? 1 : 0}>{time}</Timer>
      <Box
        textStyle="body"
        display={"flex"}
        flexWrap={"wrap"}
        alignItems="center"
        position="relative"
      >
        <HomepageLoader isLoading={isLoading} />
        {!isLoading && words.length > 0 && (
          <>
            {words.map((word, index) =>
              renderWord(
                word,
                index,
                index === activeWordIndex,
                index < activeWordIndex
              )
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Homepage;
