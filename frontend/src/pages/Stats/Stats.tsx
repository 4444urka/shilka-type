import { Grid, GridItem } from "@chakra-ui/react";
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
    <Grid
      textStyle="body"
      p={{ base: "10px", sm: "15px", md: "20px" }}
      px={{ base: 2, sm: 4, md: 10, xl: 200 }}
      display="grid"
      templateColumns="repeat(12, 1fr)"
      templateRows="auto"
      gap={{ base: 2, sm: 3, md: 4 }}
      minHeight="calc(100vh - 140px)"
    >
      <LoadingScreen isLoading={isLoadingLeaderboard || isLoadingUser} />

      {/* ProfileInfoBar - на всю ширину */}
      <GridItem colSpan={12} rowSpan={1}>
        <ProfileInfoBar user={user} totalStats={totalStats} />
      </GridItem>

      {/* Leaderboard - левая колонка (3 из 12) на десктопе, полная ширина на мобильных */}
      <GridItem colSpan={{ base: 12, lg: 4 }} rowSpan={{ base: "auto", lg: 2 }}>
        <Leaderboard leaderboard={leaderboard} />
      </GridItem>

      {/* StatsChart - правая верхняя часть (9 из 12) */}
      <GridItem colSpan={{ base: 12, lg: 8 }} rowSpan={{ lg: 1 }}>
        <StatsChart hideBelow="md" sessions={[...sessions].reverse()} />
      </GridItem>

      {/* Keyboard - правая средняя часть (9 из 12), скрываем на маленьких экранах */}
      <GridItem
        colSpan={{ base: 12, lg: 8 }}
        rowSpan={{ lg: 1 }}
        hideBelow="md"
      >
        <Keyboard />
      </GridItem>

      {/* TypingHistory - на всю ширину внизу */}
      <GridItem colSpan={12} rowSpan={{ lg: 4 }}>
        <TypingHistory
          sessions={sessions}
          onLoadMore={loadMoreSessions}
          hasMore={hasMoreSessions}
          isLoading={isLoadingSessions}
        />
      </GridItem>
    </Grid>
  );
};

export default Stats;
