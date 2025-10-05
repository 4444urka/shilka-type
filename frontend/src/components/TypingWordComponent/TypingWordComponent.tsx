import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { TypingWord } from "../../types/TypingTypes";
import { TypingCharacter } from "../TypingCharacter/TypingCharacter";
import Cursor from "../Cursor/Cursor";

const MotionBox = motion(Box);

interface TypingWordProps {
  word: TypingWord;
  wordIndex: number;
  currentCharIndex: number;
  isCurrentWord: boolean;
}

export const TypingWordComponent = ({
  word,
  wordIndex,
  currentCharIndex,
  isCurrentWord,
}: TypingWordProps) => {
  const getWordOpacity = () => {
    if (word.completed) return 1;
    if (isCurrentWord) return 1;
    return 0.4;
  };

  const getWordScale = () => {
    if (isCurrentWord) return 1.01;
    return 1;
  };

  return (
    <MotionBox
      as="span"
      display="inline-flex"
      flexWrap="nowrap"
      alignItems="center"
      marginRight="0.5rem"
      marginBottom="0.25rem"
      animate={{
        opacity: getWordOpacity(),
        scale: getWordScale(),
      }}
      transition={{
        opacity: { duration: 0.3, ease: "easeOut" },
        scale: { duration: 0.2, ease: "easeOut" },
      }}
      transformOrigin="left center"
      position="relative"
    >
      {word.chars.map((char, charIndex) => (
        <TypingCharacter
          key={`${wordIndex}-${charIndex}`}
          char={char}
          isActive={isCurrentWord}
          showCursor={isCurrentWord && charIndex === currentCharIndex}
          charIndex={charIndex}
          wordIndex={wordIndex}
        />
      ))}

      {/* Курсор в конце слова */}
      {isCurrentWord && currentCharIndex === word.chars.length && (
        <Box
          position="absolute"
          right="-4px"
          top="50%"
          transform="translateY(-50%)"
          height="2rem"
          display="flex"
          alignItems="center"
          pointerEvents="none"
        >
          <Cursor />
        </Box>
      )}
    </MotionBox>
  );
};
