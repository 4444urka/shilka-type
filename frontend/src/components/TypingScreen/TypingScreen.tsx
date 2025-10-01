import { Box, type BoxProps, Text } from "@chakra-ui/react";
import React, { Fragment } from "react";
import HomepageLoader from "../HomepageLoader/HomepageLoader";
import Timer from "../Timer/Timer";
import RestartButton from "../RestartButton/RestartButton";
import Cursor from "../Cursor/Cursor";

interface TypingScreenProps extends BoxProps {
  words: string[];
  isLoading: boolean;
  time: number;
  isStartedTyping: boolean;
  activeWordIndex: number;
  currentCharIndex: number;
  typedChars: { char: string; correct: boolean }[];
  wordHistory: { char: string; correct: boolean }[][];
}

const TypingScreen: React.FC<TypingScreenProps> = ({
  words,
  isLoading,
  time,
  isStartedTyping,
  activeWordIndex,
  currentCharIndex,
  typedChars,
  wordHistory,
  ...rest
}) => {
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
          <Box as="span" display="inline-flex" flexWrap="wrap">
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
                  key={`${char}-${idx}`}
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
        <Box as="span" opacity={1}>
          {word}
        </Box>
      );
    }

    if (isActive) {
      const chars = word.split("");
      return (
        <Box
          as="span"
          display="inline-flex"
          flexWrap="wrap"
          minWidth={`${word.length}ch`}
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
              <Box
                key={`${word}-${wordIndex}-${idx}`}
                as="span"
                position="relative"
              >
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
      <Box as="span" opacity={0.5}>
        {word}
      </Box>
    );
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" {...rest}>
      <Timer opacity={isStartedTyping ? 1 : 0}>{time}</Timer>
      <Box display="flex" flexDirection="column" alignItems="center" gap={6}>
        <HomepageLoader isLoading={isLoading} />
        {!isLoading && words.length > 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={6}
          >
            <Box
              textStyle="body"
              display="block"
              width="100%"
              textAlign="justify"
              position="relative"
              _after={{
                content: '""',
                display: "inline-block",
                width: "100%",
              }}
              textAlignLast="left"
            >
              {words.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                  {renderWord(
                    word,
                    index,
                    index === activeWordIndex,
                    index < activeWordIndex
                  )}{" "}
                </Fragment>
              ))}
            </Box>
            <RestartButton onClick={() => window.location.reload()} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TypingScreen;
