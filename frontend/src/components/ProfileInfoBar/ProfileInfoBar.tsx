import {
  Avatar,
  Text,
  Box,
  Flex,
  type BoxProps,
  IconButton,
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import type { Me } from "../../types/User";
import { formatTime } from "../../lib/formatTime";
import { logout } from "../../api/auth/authRequests";
import { clearUser } from "../../slices/userSlice";
import { MdLogout } from "react-icons/md";
import AdminPanel from "../AdminPanel/AdminPanel";
import ContentUploadModal from "../ContentUploadModal/ContentUploadModal";

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
  const selectedLanguage = useAppSelector((s) => s.settings.selectedLanguage);

  return (
    <Box
      bg="bgCardColor"
      p={{ base: 3, md: 4, xl: 6 }}
      overflow="auto"
      fontSize={{ base: "sm", md: "lg", lg: "xl", xl: "2xl" }}
      borderRadius="md"
      w="100%"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap={{ base: 3, md: 6 }}
        w="100%"
      >
        {/* Left: avatar + username */}
        <Flex
          align="center"
          gap={{ base: 3, xl: 6 }}
          minW={0}
          justify="space-between"
        >
          <Avatar.Root
            size={{ base: "xl", sm: "2xl", md: "2xl", lg: "xl" }}
            bg="bgCardSecondaryColor"
            color="textColor"
          >
            <Avatar.Fallback />
            <Avatar.Image />
          </Avatar.Root>

          <Box minW={0}>
            <Text
              fontWeight="semibold"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              maxW={{ base: "160px", md: "240px" }}
            >
              {user?.username}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={1} direction="row">
          <Text>shilkacoins:</Text>
          <Text color="primaryColor" fontWeight="bold">
            {user?.shilka_coins}
          </Text>
        </Flex>

        <Flex align="center" gap={1}>
          <Text>charsTyped:</Text>
          <Text color="primaryColor" fontWeight="bold">
            {totalStats.totalCharsTyped}
          </Text>
        </Flex>

        <Flex align="center" gap={1}>
          <Text>timeTyping:</Text>
          <Text color="primaryColor" fontWeight="bold">
            {formatTime(totalStats.totalTimeTyping)}
          </Text>
        </Flex>

        {/* Right: Admin panel (if admin) + Content upload (if moder/admin) + logout */}
        {user?.role?.toLowerCase() === "admin" && <AdminPanel />}
        {(user?.role?.toLowerCase() === "admin" ||
          user?.role?.toLowerCase() === "moder") && (
          <ContentUploadModal
            defaultLanguage={selectedLanguage as "ru" | "en"}
          />
        )}

        <IconButton
          position={{ base: "absolute", md: "static" }}
          aria-label="Logout"
          variant="ghost"
          size={{ base: "sm", md: "lg" }}
          color="textColor"
          _hover={{ color: "primaryColor", bg: "bgCardSecondaryColor" }}
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
          order={{ base: -1, md: 0 }}
          alignSelf={{ base: "flex-end", md: "center" }}
          mb={{ base: 2, md: 0 }}
        >
          <MdLogout />
        </IconButton>
      </Flex>
    </Box>
  );
};

export default ProfileInfoBar;
