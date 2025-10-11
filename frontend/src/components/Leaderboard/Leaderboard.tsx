import { Box, type BoxProps, Text } from "@chakra-ui/react";
import React from "react";
import { LEADERBOARD_CONFIG } from "../../config/constants";
import { useAppSelector } from "../../store";
import type { Me } from "../../types/User";
import { LeaderboardItem } from "../LeaderboardItem/LeaderboardItem";

export interface LeaderboardProps extends BoxProps {
  leaderboard: Me[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, ...rest }) => {
  const currentUser = useAppSelector((state) => state.user.user);

  // Используем useMemo для оптимизации вычислений
  const { topUsers, currentUserIndex, showCurrentUser } = React.useMemo(() => {
    const userIndex = leaderboard.findIndex((u) => u.id === currentUser?.id);
    const isUserBelowTop = userIndex > LEADERBOARD_CONFIG.TOP_USERS_COUNT;

    return {
      topUsers: leaderboard
        .slice(
          0,
          isUserBelowTop
            ? LEADERBOARD_CONFIG.TOP_USERS_COUNT
            : LEADERBOARD_CONFIG.CURRENT_USER_POSITION
        )
        .filter((u) => u && typeof u.id === "number" && !!u.username),
      currentUserIndex: userIndex,
      showCurrentUser: isUserBelowTop && currentUser,
    };
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
        gap={showCurrentUser ? 6 : 7}
        flexDirection="column"
        alignItems="flex-start"
        w="100%"
      >
        {/* Топ пользователей */}
        {topUsers.map((user, index) => (
          <LeaderboardItem key={user.id} user={user} index={index} />
        ))}

        {/* Разделитель и позиция текущего пользователя, если он не в топе */}
        {showCurrentUser && (
          <>
            <Box display="flex" justifyContent="center" w="100%">
              <Text color="textSecondary" fontSize="14px" fontWeight="bold">
                ...
              </Text>
            </Box>
            <LeaderboardItem
              user={showCurrentUser}
              index={currentUserIndex}
              isCurrentUser
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Leaderboard;
