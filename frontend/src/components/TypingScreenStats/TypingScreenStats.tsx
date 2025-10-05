import { Box, Text, HStack, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { TypingStats } from "../../types/TypingTypes";

const MotionBox = motion(Box);

interface TypingStatsProps {
  stats: TypingStats;
  displayTime: number;
  isVisible: boolean;
}

export const TypingScreenStats = ({
  stats,
  displayTime,
  isVisible,
}: TypingStatsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <MotionBox
      textStyle="input"
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -20,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <HStack gap={8} justify="center">
        <VStack gap={1}>
          <Text fontSize="2xl" fontWeight="bold">
            {formatTime(displayTime)}
          </Text>
          <Text fontSize="sm" color="gray.400">
            Время
          </Text>
        </VStack>

        <VStack gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="primaryColor">
            {stats.wpm}
          </Text>
          <Text fontSize="sm" color="gray.400">
            WPM
          </Text>
        </VStack>

        <VStack gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.400">
            {stats.accuracy}%
          </Text>
          <Text fontSize="sm" color="gray.400">
            Точность
          </Text>
        </VStack>

        <VStack gap={1}>
          <HStack gap={2}>
            <Text fontSize="lg" fontWeight="bold" color="successColor">
              {stats.correctChars}
            </Text>
            <Text fontSize="lg" color="gray.400">
              /
            </Text>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="errorColor"
              textDecoration="underline"
            >
              {stats.incorrectChars}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Символы
          </Text>
        </VStack>
      </HStack>
    </MotionBox>
  );
};
