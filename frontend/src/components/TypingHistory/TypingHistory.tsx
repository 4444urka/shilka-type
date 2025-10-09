import { Box, Text, Flex, Badge, type BoxProps } from "@chakra-ui/react";
import type { TypingSession } from "../../types/TypingSession";
import {
  getModeDisplay,
  getLanguageDisplay,
  getTestTypeDisplay,
} from "../../utils/sessionDisplayUtils";

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
        {sessions.map((session) => {
          const modeDisplay = getModeDisplay(session.typing_mode);
          const languageDisplay = getLanguageDisplay(session.language);
          const testTypeDisplay = getTestTypeDisplay(session.test_type);

          return (
            <Box
              key={session.id}
              p={3}
              px={4}
              borderBottom="1px solid"
              borderColor="gray.300"
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Box
                  display="flex"
                  flexDirection="row"
                  gap={4}
                  alignItems="center"
                  mt={4}
                >
                  <Text fontSize="md">
                    {new Date(
                      session.created_at +
                        (session.created_at.endsWith("Z") ? "" : "Z")
                    )
                      .toLocaleString("ru-RU")
                      .slice(0, -3)}
                  </Text>

                  {/* Бейджи для режима, языка и типа теста */}
                  <Flex gap={2}>
                    {session.test_type && (
                      <Badge
                        colorScheme="purple"
                        variant="subtle"
                        fontSize="sm"
                        px={2}
                        py={1}
                      >
                        {testTypeDisplay.icon} {testTypeDisplay.label}
                      </Badge>
                    )}
                    {session.typing_mode && (
                      <Badge
                        colorScheme="blue"
                        variant="subtle"
                        fontSize="sm"
                        px={2}
                        py={1}
                      >
                        {modeDisplay.icon} {modeDisplay.label}
                      </Badge>
                    )}
                    {session.language && (
                      <Badge
                        colorScheme="green"
                        variant="subtle"
                        fontSize="sm"
                        px={2}
                        py={1}
                      >
                        {languageDisplay.flag} {languageDisplay.label}
                      </Badge>
                    )}
                  </Flex>
                </Box>

                <Flex gap={6}>
                  <Box textAlign="center">
                    <Text fontSize="xs" color="gray.500">
                      WPM
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="primaryColor">
                      {Number(session.wpm).toFixed(1)}
                    </Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="xs" color="gray.500">
                      Точность
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="primaryColor">
                      {Number(session.accuracy).toFixed(1)}%
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
          );
        })}
      </Flex>
    </Box>
  );
};
