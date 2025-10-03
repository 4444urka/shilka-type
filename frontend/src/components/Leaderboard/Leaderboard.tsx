import { Box, type BoxProps, Text, Avatar } from "@chakra-ui/react";
import React from "react";
import { FaCrown } from "react-icons/fa";
import type { Me } from "../../types/User";
import { useAppSelector } from "../../store";

export interface LeaderboardProps extends BoxProps {
  leaderboard: Me[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, ...rest }) => {
  const currentUser = useAppSelector((state) => state.user.user);
  const [currentUserIndex, setCurrentUserIndex] = React.useState(-1);
  React.useEffect(() => {
    console.log(leaderboard, currentUser);
    setCurrentUserIndex(leaderboard.findIndex((u) => u.id === currentUser?.id));
  }, [leaderboard, currentUser]);
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
      <Box
        display="flex"
        gap={currentUserIndex > 9 && currentUser ? 3 : 4}
        flexDirection="column"
        alignItems="flex-start"
        w="100%"
      >
        {/* Топ 9 или топ 10 в зависимости от позиции пользователя */}
        {leaderboard
          .slice(0, currentUserIndex > 9 ? 9 : 10)
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
              transition="all 0.2s"
            >
              <Text color="primaryColor" minW="30px">
                {index + 1}.
              </Text>
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
              <Text color="primaryColor" ml="auto">
                {Number(user.shilka_coins ?? 0)}
              </Text>
            </Box>
          ))}

        {/* Разделитель и позиция пользователя, если он не в топ-10 */}
        {currentUserIndex > 9 && currentUser && (
          <>
            <Box display="flex" justifyContent="center" w="100%">
              <Text color="textSecondary" fontSize="14px" fontWeight="bold">
                ...
              </Text>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap={3}
              w="100%"
              justifyContent="flex-start"
              bg="rgba(var(--primary-color-rgb), 0.15)"
            >
              <Text color="primaryColor" minW="30px">
                {currentUserIndex + 1}.
              </Text>
              <Avatar.Root size="sm">
                <Avatar.Fallback />
                <Avatar.Image />
              </Avatar.Root>
              <Text flexShrink={0} fontWeight="bold">
                {currentUser.username}
              </Text>
              <Text color="primaryColor" ml="auto" fontWeight="bold">
                {Number(currentUser.shilka_coins ?? 0)}
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Leaderboard;
