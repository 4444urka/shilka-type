import React from "react";
import type { Me } from "../../types/User";
import { Avatar, Box, Text, type BoxProps } from "@chakra-ui/react";
import { FaCrown } from "react-icons/fa";

export interface LeaderboardItemProps extends BoxProps {
  user: Me;
  index: number;
  isCurrentUser?: boolean;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = React.memo(
  ({ user, index, isCurrentUser, ...rest }) => (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap={3}
      w="100%"
      justifyContent="flex-start"
      transition="all 0.2s"
      bg={isCurrentUser ? "rgba(var(--primary-color-rgb), 0.15)" : undefined}
      {...rest}
    >
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
        <Avatar.Root size="sm">
          <Avatar.Fallback />
          <Avatar.Image />
        </Avatar.Root>
      )}
      <Text flexShrink={0} fontWeight={isCurrentUser ? "bold" : undefined}>
        {user.username}
      </Text>
      <Text
        color="primaryColor"
        ml="auto"
        fontWeight={isCurrentUser ? "bold" : undefined}
      >
        {Number(user.shilka_coins ?? 0)}
      </Text>
    </Box>
  )
);
