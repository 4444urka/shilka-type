import React from "react";
import type { Me } from "../../types/User";
import { Avatar, Box, Text, type BoxProps } from "@chakra-ui/react";
import { FaCrown, FaArrowUp, FaArrowDown } from "react-icons/fa";

export interface LeaderboardItemProps extends BoxProps {
  user: Me;
  index: number;
  isCurrentUser?: boolean;
  positionChange?: number; // Положительное = вверх, отрицательное = вниз
  coinsChanged?: boolean; // Флаг что монеты изменились
  coinsIncreased?: boolean; // true = прибавились, false = убавились
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = React.memo(
  ({ user, index, isCurrentUser, positionChange, coinsChanged, coinsIncreased, ...rest }) => {
    const hasPositionChange =
      positionChange !== undefined && positionChange !== 0;
    const isPositionUp = positionChange && positionChange > 0;
    
    // Определяем какую анимацию использовать
    const coinsAnimation = coinsChanged 
      ? (coinsIncreased ? "coinsAdded 1.5s ease-in-out" : "coinsRemoved 1.5s ease-in-out")
      : undefined;

    return (
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={3}
        w="100%"
        justifyContent="flex-start"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        bg={
          isCurrentUser
            ? "rgba(var(--primary-color-rgb), 0.15)"
            : hasPositionChange && isPositionUp
            ? "rgba(34, 197, 94, 0.1)"
            : hasPositionChange
            ? "rgba(239, 68, 68, 0.1)"
            : undefined
        }
        position="relative"
        borderRadius="md"
        p={2}
        ml={-2}
        css={{
          animation: positionChange
            ? "slideIn 0.5s ease-out, highlight 3s ease-out"
            : undefined,
        }}
        {...rest}
      >
        {/* Индикатор изменения позиции */}
        {positionChange && positionChange > 0 && (
          <Box
            position="absolute"
            top="8px"
            left="20px"
            color="green.500"
            fontSize="10px"
            css={{
              animation: "bounceIn 0.5s ease-out",
            }}
          >
            <FaArrowUp />
          </Box>
        )}
        {positionChange && positionChange < 0 && (
          <Box
            position="absolute"
            top="8px"
            left="20px"
            color="red.500"
            fontSize="10px"
            css={{
              animation: "bounceIn 0.5s ease-out",
            }}
          >
            <FaArrowDown />
          </Box>
        )}
        <Text
          color="primaryColor"
          minW="30px"
          fontWeight={isCurrentUser ? "bold" : undefined}
        >
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
          <Avatar.Root
            size={{ base: "sm" }}
            bg="bgCardSecondaryColor"
            color="textColor"
          >
            <Avatar.Fallback />
            <Avatar.Image />
          </Avatar.Root>
        )}
        <Text flexShrink={0} fontWeight={isCurrentUser ? "bold" : undefined}>
          {user.username}
        </Text>
        <Box
          ml="auto"
          display="inline-flex"
          overflow="visible"
          position="relative"
          height="1.2em"
          animation={coinsAnimation}
        >
          {user?.shilka_coins || 0}
        </Box>
      </Box>
    );
  }
);
