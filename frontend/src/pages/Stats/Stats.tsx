import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Keyboard from "../../components/Keyboard/Keyboard";
import Leaderboard from "../../components/Leaderboard/Leaderboard";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import ProfileInfoBar from "../../components/ProfileInfoBar/ProfileInfoBar";
import { StatsChart } from "../../components/StatsChart/StatsChart";
import { TypingHistory } from "../../components/TypingHistory/TypingHistory";
import useFetchCurrentUser from "../../hooks/useFetchCurrentUser";
import useFetchLeaderboard from "../../hooks/useFetchLeaderboard";
import useFetchSessions from "../../hooks/useFetchSessions";
import { calculateTotalStats } from "../../lib/calculateTotalStats";

const Stats = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingUser } = useFetchCurrentUser();
  const {
    sessions,
    isLoading: isLoadingSessions,
    loadMore: loadMoreSessions,
    hasMore: hasMoreSessions,
  } = useFetchSessions();
  const { leaderboard, isLoading: isLoadingLeaderboard } =
    useFetchLeaderboard();
  const totalStats = calculateTotalStats(sessions);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      navigate("/signin");
    }
  }, [user, isLoadingUser, navigate]);

  return (
    <Box
      textStyle="body"
      p="20px"
      px={200}
      display="grid"
      gridTemplateColumns="repeat(12, 1fr)"
      gridTemplateRows="auto"
      gap={4}
      minHeight="calc(100vh - 140px)"
    >
      <LoadingScreen isLoading={isLoadingLeaderboard || isLoadingUser} />

      {/* ProfileInfoBar - на всю ширину */}
      <Box gridColumn="1 / -1">
        <ProfileInfoBar user={user} totalStats={totalStats} />
      </Box>

      {/* Leaderboard - левая колонка (3 из 12) */}
      <Box gridColumn={{ base: "1 / -1", lg: "1 / 4" }} gridRow="2 / 4">
        <Leaderboard leaderboard={leaderboard} />
      </Box>

      {/* StatsChart - правая верхняя часть (9 из 12) */}
      <Box gridColumn={{ base: "1 / -1", lg: "4 / -1" }} gridRow={{ lg: "2" }}>
        <StatsChart sessions={[...sessions].reverse()} />
      </Box>

      {/* Keyboard - правая средняя часть (9 из 12) */}
      <Box gridColumn={{ base: "1 / -1", lg: "4 / -1" }} gridRow={{ lg: "3" }}>
        <Keyboard />
      </Box>

      {/* TypingHistory - на всю ширину внизу */}
      <Box gridColumn="1 / -1" gridRow={{ lg: "4" }}>
        <TypingHistory
          sessions={sessions}
          onLoadMore={loadMoreSessions}
          hasMore={hasMoreSessions}
          isLoading={isLoadingSessions}
        />
      </Box>
    </Box>
  );
};

export default Stats;
