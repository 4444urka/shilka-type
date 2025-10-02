import { Box, Flex } from "@chakra-ui/react";
import Leaderboard from "../../components/Leaderboard/Leaderboard";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { StatsChart } from "../../components/StatsChart/StatsChart";
import { TypingHistory } from "../../components/TypingHistory/TypingHistory";
import useFetchCurrentUser from "../../hooks/useFetchCurrentUser";
import useFetchLeaderboard from "../../hooks/useFetchLeaderboard";
import useFetchSessions from "../../hooks/useFetchSessions";
import { calculateTotalStats } from "../../lib/calculateTotalStats";
import ProfileInfoBar from "../../components/ProfileInfoBar/ProfileInfoBar";

const Stats = () => {
  const { sessions, isLoading: isLoadingSessions } = useFetchSessions();
  const { leaderboard, isLoading: isLoadingLeaderboard } =
    useFetchLeaderboard();
  const { user, isLoading: isLoadingUser } = useFetchCurrentUser();
  const totalStats = calculateTotalStats(sessions);

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
      <ProfileInfoBar user={user} totalStats={totalStats} />

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
