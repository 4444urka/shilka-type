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

  // Храним предыдущие значения монет для анимации
  const previousCoinsRef = React.useRef<Map<number, number>>(new Map());
  const [coinsChanged, setCoinsChanged] = React.useState<Set<number>>(
    new Set()
  );
  // Храним информацию о направлении изменения монет (true = прибавились, false = убавились)
  const [coinsIncreased, setCoinsIncreased] = React.useState<
    Map<number, boolean>
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

  // Отслеживаем изменения позиций и монет
  React.useEffect(() => {
    const changes = new Map<number, number>();
    const coinsChangedSet = new Set<number>();
    const coinsIncreasedMap = new Map<number, boolean>();

    topUsers.forEach((user, newIndex) => {
      // Проверяем изменение позиции
      const previousPosition = previousPositionsRef.current.get(user.id);
      if (previousPosition !== undefined && previousPosition !== newIndex) {
        // Положительное значение = движение вверх (улучшение позиции)
        changes.set(user.id, previousPosition - newIndex);
      }

      // Проверяем изменение монет
      const previousCoins = previousCoinsRef.current.get(user.id);
      const currentCoins = user.shilka_coins ?? 0;
      if (previousCoins !== undefined && previousCoins !== currentCoins) {
        coinsChangedSet.add(user.id);
        // Определяем направление изменения
        coinsIncreasedMap.set(user.id, currentCoins > previousCoins);
      }

      // Обновляем сохранённые монеты
      previousCoinsRef.current.set(user.id, currentCoins);
    });

    // Также проверяем текущего пользователя, если он не в топе
    if (showCurrentUser) {
      const previousCoins = previousCoinsRef.current.get(showCurrentUser.id);
      const currentCoins = showCurrentUser.shilka_coins ?? 0;
      if (previousCoins !== undefined && previousCoins !== currentCoins) {
        coinsChangedSet.add(showCurrentUser.id);
        coinsIncreasedMap.set(showCurrentUser.id, currentCoins > previousCoins);
      }
      previousCoinsRef.current.set(showCurrentUser.id, currentCoins);
    }

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

    if (coinsChangedSet.size > 0) {
      setCoinsChanged(coinsChangedSet);
      setCoinsIncreased(coinsIncreasedMap);

      // Очищаем индикаторы изменения монет через 1500ms
      const timeout = setTimeout(() => {
        setCoinsChanged(new Set());
        setCoinsIncreased(new Map());
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [topUsers, showCurrentUser]);
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
            coinsChanged={coinsChanged.has(user.id)}
            coinsIncreased={coinsIncreased.get(user.id)}
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
              coinsChanged={coinsChanged.has(showCurrentUser.id)}
              coinsIncreased={coinsIncreased.get(showCurrentUser.id)}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Leaderboard;
