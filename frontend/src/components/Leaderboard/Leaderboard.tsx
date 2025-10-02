import { Box, type BoxProps, Text, Avatar } from "@chakra-ui/react";
import React from "react";
import { FaCrown } from "react-icons/fa";
import type { Me } from "../../types/User";

export interface LeaderboardProps extends BoxProps {
  leaderboard: Me[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, ...rest }) => {
  return (
    <Box
      display="flex"
      bg="bgCardColor"
      p={4}
      borderRadius="md"
      flexDirection="column"
      alignItems="flex-start"
      fontSize="18px"
      gap={4}
      w="100%"
      {...rest}
    >
      <Text color="primaryColor" textAlign="left" fontSize="20px">
        Список лидеров
      </Text>
      {leaderboard
        .filter((u) => u && typeof u.id === "number" && !!u.username)
        .map((user, index) => (
          <Box
            key={user.id}
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={3}
            w="100%"
            justifyContent="flex-start"
          >
            {index === 0 ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="32px"
                height="32px"
                color="primaryColor"
                animation="primaryColorChange 1.5s ease-in-out"
              >
                <FaCrown size={24} />
              </Box>
            ) : (
              <Avatar.Root size="sm">
                <Avatar.Fallback />
                <Avatar.Image />
              </Avatar.Root>
            )}
            <Text flexShrink={0}>{user.username}</Text>
            <Text color="primaryColor">{Number(user.shilka_coins ?? 0)}</Text>
          </Box>
        ))}
    </Box>
  );
};

export default Leaderboard;
