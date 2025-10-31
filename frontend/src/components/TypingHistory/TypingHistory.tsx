import {
  Box,
  Text,
  Flex,
  Badge,
  Button,
  type BoxProps,
} from "@chakra-ui/react";
import type { TypingSession } from "../../types/TypingSession";
import {
  getModeDisplay,
  getLanguageDisplay,
  getTestTypeDisplay,
} from "../../utils/sessionDisplayUtils";

export interface TypingHistoryProps extends BoxProps {
  sessions: TypingSession[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export const TypingHistory: React.FC<TypingHistoryProps> = ({
  sessions,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  ...rest
}) => {
  return (
    <Box
      w="100%"
      fontSize="20px"
      textStyle="body"
      bg="bgCardColor"
      borderRadius="md"
      pt={4}
      {...rest}
    >
      <Text mb={4} px={4} color="primaryColor" fontSize={{ base: "md" }}>
        История сессий
      </Text>
      <Flex direction="column">
        {sessions.map((session, index) => {
          const modeDisplay = getModeDisplay(session.typing_mode);
          const languageDisplay = getLanguageDisplay(session.language);
          const testTypeDisplay = getTestTypeDisplay(session.test_type);

          return (
            <Box
              key={session.id}
              bg={index % 2 === 0 ? "bgCardSecondaryColor" : "bgCardColor"}
              p={1}
              px={4}
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Box
                  display="flex"
                  flexDirection={{ base: "column", md: "row" }}
                  gap={4}
                  alignItems="center"
                >
                  <Text hideBelow={"md"} fontSize={{ base: "sm" }}>
                    {new Date(
                      session.created_at +
                        (session.created_at.endsWith("Z") ? "" : "Z")
                    )
                      .toLocaleString("ru-RU")
                      .slice(0, -3)}
                  </Text>

                  {/* Бейджи для режима, языка и типа теста */}
                  <Flex gap={{ base: 0, md: 2 }} flexWrap="wrap">
                    {session.test_type && (
                      <Badge
                        bg="transparent"
                        variant="subtle"
                        color="textColor"
                        fontSize="sm"
                        px={{ base: 0, md: 2 }}
                        py={1}
                      >
                        {testTypeDisplay.icon} {testTypeDisplay.label}
                      </Badge>
                    )}
                    {session.typing_mode && (
                      <Badge
                        bg="transparent"
                        variant="subtle"
                        fontSize="sm"
                        color="textColor"
                        px={2}
                        py={1}
                      >
                        {modeDisplay.icon} {modeDisplay.label}
                      </Badge>
                    )}
                    {session.language && (
                      <Badge
                        bg="transparent"
                        variant="subtle"
                        fontSize="sm"
                        color="textColor"
                        px={2}
                        py={1}
                      >
                        {languageDisplay.flag} {languageDisplay.label}
                      </Badge>
                    )}
                  </Flex>
                </Box>

                <Flex
                  w={{ base: "full", md: "auto" }}
                  align="center"
                  justifyContent="space-between"
                >
                  <Flex gap={{ base: 2, md: 6 }} align="center" mb={2}>
                    <Box textAlign="center">
                      <Text fontSize="xs" color="gray.500">
                        WPM
                      </Text>
                      <Text
                        fontSize={{ base: "sm" }}
                        fontWeight="bold"
                        color="primaryColor"
                      >
                        {Number(session.wpm).toFixed(1)}
                      </Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="xs" color="gray.500">
                        Точность
                      </Text>
                      <Text
                        fontSize={{ base: "sm" }}
                        fontWeight="bold"
                        color="primaryColor"
                      >
                        {Number(session.accuracy).toFixed(1)}%
                      </Text>
                    </Box>
                    {session.duration && (
                      <Box textAlign="center">
                        <Text fontSize="xs" color="gray.500">
                          Время
                        </Text>
                        <Text fontSize={{ base: "sm" }} fontWeight="bold">
                          {session.duration}с
                        </Text>
                      </Box>
                    )}
                  </Flex>
                  <Text hideFrom={"md"} mt={2} fontSize={{ base: "sm" }}>
                    {new Date(
                      session.created_at +
                        (session.created_at.endsWith("Z") ? "" : "Z")
                    )
                      .toLocaleString("ru-RU")
                      .slice(0, -3)}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          );
        })}
        {hasMore && (
          <Box w="full" textAlign="center">
            <Button
              w="full"
              color="textSecondary"
              bg="bgCardSecondaryColor"
              onClick={onLoadMore}
              disabled={isLoading}
              _hover={{ bg: "primaryColor" }}
            >
              Загрузить ещё
            </Button>
          </Box>
        )}
      </Flex>
    </Box>
  );
};
