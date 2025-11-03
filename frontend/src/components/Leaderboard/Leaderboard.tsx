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

  // Храним предыдущие позиции пользователей для анимации
  const previousPositionsRef = React.useRef<Map<number, number>>(new Map());
  const [positionChanges, setPositionChanges] = React.useState<
    Map<number, number>
  >(new Map());

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

  // Отслеживаем изменения позиций
  React.useEffect(() => {
    const changes = new Map<number, number>();

    topUsers.forEach((user, newIndex) => {
      const previousPosition = previousPositionsRef.current.get(user.id);
      if (previousPosition !== undefined && previousPosition !== newIndex) {
        // Положительное значение = движение вверх (улучшение позиции)
        changes.set(user.id, previousPosition - newIndex);
      }
    });

    // Обновляем текущие позиции
    const newPositions = new Map<number, number>();
    topUsers.forEach((user, index) => {
      newPositions.set(user.id, index);
    });
    previousPositionsRef.current = newPositions;

    if (changes.size > 0) {
      setPositionChanges(changes);

      // Очищаем индикаторы через 3 секунды
      const timeout = setTimeout(() => {
        setPositionChanges(new Map());
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [topUsers]);
  return (
    <Box
      display="flex"
      bg="bgCardColor"
      p={4}
      borderRadius="md"
      flexDirection="column"
      alignItems="flex-start"
      fontSize={{ base: "sm", md: "md", lg: "lg" }}
      gap={4}
      w="100%"
      {...rest}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
      >
        <Text color="primaryColor" textAlign="left" fontSize="lg">
          Список лидеров
        </Text>
      </Box>
      <Box
        display="flex"
        gap={showCurrentUser ? 6 : 7}
        flexDirection="column"
        alignItems="flex-start"
        w="100%"
      >
        {/* Топ пользователей */}
        {topUsers.map((user, index) => (
          <LeaderboardItem
            key={user.id}
            user={user}
            index={index}
            positionChange={positionChanges.get(user.id)}
          />
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
