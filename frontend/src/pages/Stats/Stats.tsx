import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Leaderboard from "../../components/Leaderboard/Leaderboard";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { StatsChart } from "../../components/StatsChart/StatsChart";
import { TypingHistory } from "../../components/TypingHistory/TypingHistory";
import useFetchLeaderboard from "../../hooks/useFetchLeaderboard";
import useFetchSessions from "../../hooks/useFetchSessions";
import { calculateTotalStats } from "../../lib/calculateTotalStats";
import ProfileInfoBar from "../../components/ProfileInfoBar/ProfileInfoBar";
import { useAppSelector } from "../../store";
import Keyboard from "../../components/Keyboard/Keyboard";

const Stats = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingUser } = useAppSelector(
    (state) => state.user
  );
  const { sessions, isLoading: isLoadingSessions } = useFetchSessions();
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
      px="200px"
      display="grid"
      gridTemplateColumns="repeat(8, 1fr)"
      gridTemplateRows="auto auto auto"
      gap={4}
    >
      <LoadingScreen
        isLoading={isLoadingLeaderboard || isLoadingUser || isLoadingSessions}
      />

      {/* ProfileInfoBar - на всю ширину */}
      <Box gridColumn="1 / -1">
        <ProfileInfoBar user={user} totalStats={totalStats} />
      </Box>

      {/* Leaderboard - 2 колонки из 8 */}
      <Box gridColumn="1 / 3">
        <Leaderboard leaderboard={leaderboard} />
      </Box>

      {/* StatsChart - 6 колонок из 8 */}
      <Box gridColumn="3 / -1">
        <StatsChart sessions={[...sessions].reverse()} />
      </Box>

      {/* TypingHistory - 6 колонок из 8 */}
      <Box gridColumn="1 / 5">
        <TypingHistory sessions={sessions} />
      </Box>

      {/* Keyboard - 2 колонки из 8 */}
      <Box gridColumn="5 / -1">
        <Keyboard />
      </Box>
    </Box>
  );
};

export default Stats;
