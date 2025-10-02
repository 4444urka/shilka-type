import { Box, Text, Flex, type BoxProps } from "@chakra-ui/react";
import type { TypingSession } from "../../types/TypingSession";

export interface TypingHistoryProps extends BoxProps {
  sessions: TypingSession[];
}

export const TypingHistory: React.FC<TypingHistoryProps> = ({
  sessions,
  ...rest
}) => {
  return (
    <Box
      w="100%"
      fontSize="20px"
      textStyle="body"
      p={4}
      bg="bgCardColor"
      borderRadius="md"
      {...rest}
    >
      <Text mb={4} color="primaryColor" fontSize="20px">
        История сессий
      </Text>
      <Flex direction="column" gap={3}>
        {sessions.map((session) => (
          <Box
            key={session.id}
            p={2}
            px={4}
            borderBottom="1px solid"
            borderColor="gray.300"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <Box>
                <Text fontSize="md">
                  {new Date(
                    session.created_at +
                      (session.created_at.endsWith("Z") ? "" : "Z")
                  )
                    .toLocaleString("ru-RU")
                    .slice(0, -3)}
                </Text>
              </Box>
              <Flex gap={6}>
                <Box textAlign="center">
                  <Text fontSize="xs" color="gray.500">
                    WPM
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="primaryColor">
                    {session.wpm}
                  </Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="xs" color="gray.500">
                    Точность
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="primaryColor">
                    {session.accuracy}%
                  </Text>
                </Box>
                {session.duration && (
                  <Box textAlign="center">
                    <Text fontSize="xs" color="gray.500">
                      Время
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {session.duration}с
                    </Text>
                  </Box>
                )}
              </Flex>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
