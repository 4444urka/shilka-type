import { Avatar, Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router";
import { logout } from "../../api/auth/authRequests";
import Leaderboard from "../../components/Leaderboard/Leaderboard";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { StatsChart } from "../../components/StatsChart/StatsChart";
import { TypingHistory } from "../../components/TypingHistory/TypingHistory";
import useFetchCurrentUser from "../../hooks/useFetchCurrentUser";
import useFetchLeaderboard from "../../hooks/useFetchLeaderboard";
import useFetchSessions from "../../hooks/useFetchSessions";
import { clearUser } from "../../slices/userSlice";
import { useAppDispatch } from "../../store";
import { formatTime } from "../../lib/formatTime";

const Stats = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { sessions, isLoading: isLoadingSessions } = useFetchSessions();
  const { leaderboard, isLoading: isLoadingLeaderboard } =
    useFetchLeaderboard();
  const { user, isLoading: isLoadingUser } = useFetchCurrentUser();

  // Вычисляем общую статистику
  const totalStats = sessions.reduce(
    (acc, session) => {
      // Приблизительное количество правильных символов: WPM * 5 * минуты
      const minutes = (session.duration || 0) / 60;
      const approximateCorrectChars = Math.round(session.wpm * 5 * minutes);

      return {
        totalCharsTyped: acc.totalCharsTyped + approximateCorrectChars,
        totalTimeTyping: acc.totalTimeTyping + (session.duration || 0),
      };
    },
    { totalCharsTyped: 0, totalTimeTyping: 0 }
  );

  return (
    <Box
      textStyle="body"
      p="20px"
      display="flex"
      flexDirection="column"
      px="200px"
      gap={4}
    >
      <LoadingScreen
        isLoading={isLoadingLeaderboard || isLoadingUser || isLoadingSessions}
      />
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
        <Box flexDirection="row" display="flex" alignItems="center" gap={4}>
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
          <Text color="primaryColor">
            {formatTime(totalStats.totalTimeTyping)}
          </Text>
        </Box>
        <IconButton
          aria-label="Logout"
          variant="ghost"
          size="2xl"
          _hover={{ color: "primaryColor" }}
          onClick={async () => {
            try {
              await logout();
              navigate("/");
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

      {/* Лидерборд и график рядом */}
      <Flex gap={4} w="100%">
        <Box flex="1">
          <Leaderboard leaderboard={leaderboard} />
        </Box>
        <Box flex="4">
          <StatsChart sessions={[...sessions].reverse()} />
        </Box>
      </Flex>

      <TypingHistory sessions={sessions} />
    </Box>
  );
};

export default Stats;
