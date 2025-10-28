import { Avatar, Text, Box, type BoxProps, IconButton } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store";
import type { Me } from "../../types/User";
import { formatTime } from "../../lib/formatTime";
import { logout } from "../../api/auth/authRequests";
import { clearUser } from "../../slices/userSlice";
import { MdLogout } from "react-icons/md";

export interface ProfileInfoBarProps extends BoxProps {
  user: Me | null;
  totalStats: {
    totalCharsTyped: number;
    totalTimeTyping: number;
  };
}

const ProfileInfoBar: React.FC<ProfileInfoBarProps> = ({
  user,
  totalStats,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  return (
    <Box
      flexDirection="row"
      display="flex"
      alignItems="center"
      bg="bgCardColor"
      p={4}
      borderRadius="md"
      justifyContent="space-between"
      w="100%"
    >
      <Avatar.Root size="2xl">
        <Avatar.Fallback />
        <Avatar.Image />
      </Avatar.Root>
      <Text>{user?.username}</Text>
      <Text>|</Text>
      <Text>shilkacoins:</Text>
      <Text color="primaryColor">{user?.shilka_coins}</Text>
      <Text>|</Text>
      <Text>charsTyped:</Text>
      <Text color="primaryColor">{totalStats.totalCharsTyped}</Text>
      <Text>|</Text>
      <Text>timeTyping:</Text>
      <Text color="primaryColor">{formatTime(totalStats.totalTimeTyping)}</Text>
      <IconButton
        aria-label="Logout"
        variant="ghost"
        size="2xl"
        _hover={{ color: "primaryColor" }}
        onClick={async () => {
          try {
            navigate("/");
            await logout();
          } catch {
            // ignore
          }
          dispatch(clearUser());
          window.location.reload();
        }}
      >
        <MdLogout />
      </IconButton>
    </Box>
  );
};

export default ProfileInfoBar;
