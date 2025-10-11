import { Box, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { TypingChar } from "../../types/TypingTypes";
import Cursor from "../Cursor/Cursor";

const MotionBox = motion.create(Box);

interface TypingCharacterProps {
  char: TypingChar;
  isActive: boolean;
  showCursor: boolean;
  charIndex: number;
  wordIndex: number;
}

export const TypingCharacter = ({
  char,
  isActive,
  showCursor,
  charIndex,
  wordIndex,
}: TypingCharacterProps) => {
  const getCharColor = () => {
    if (!char.typed) {
      return undefined;
    }
    return char.correct ? undefined : "errorColor";
  };

  const getCharOpacity = () => {
    if (!isActive) return 0.3;
    if (char.typed) return 1;
    return 0.6;
  };

  return (
    <MotionBox
      key={`${wordIndex}-${charIndex}`}
      as="span"
      position="relative"
      display="inline-block"
      layout
      layoutId={`char-${wordIndex}-${charIndex}`}
      transition={{
        layout: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.2,
        },
      }}
    >
      <Text
        as="span"
        textStyle="body"
        color={getCharColor()}
        opacity={getCharOpacity()}
        fontWeight={char.typed && !char.correct ? "bold" : "normal"}
        textDecoration={char.typed && !char.correct ? "underline" : "none"}
        textDecorationColor="errorColor"
        transition="all 0.5s ease"
      >
        {char.char}
      </Text>

      {showCursor && (
        <Box
          position="absolute"
          left={char.typed ? "100%" : "0"}
          top="0"
          height="100%"
          display="flex"
          alignItems="center"
          zIndex={10}
        >
          <Cursor />
        </Box>
      )}
    </MotionBox>
  );
};
