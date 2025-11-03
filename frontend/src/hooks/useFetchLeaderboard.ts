import React from "react";
import type { Me } from "../types/User";
import { fetchLeaderboard } from "../api/stats/statsRequests";
import { useLeaderboardWebSocket } from "./useLeaderboardWebSocket";

interface UseFetchLeaderboardOptions {
  enableWebSocket?: boolean;
}

const useFetchLeaderboard = (options: UseFetchLeaderboardOptions = {}) => {
  const { enableWebSocket = true } = options;
  const [leaderboard, setLeaderboard] = React.useState<Me[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Начальная загрузка через HTTP
  React.useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeaderboard();
        setLeaderboard(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(`Не удалось загрузить список лидеров: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  // WebSocket для real-time обновлений
  const handleLeaderboardUpdate = React.useCallback((data: Me[]) => {
    console.log(
      "[useFetchLeaderboard] Updating leaderboard with",
      data.length,
      "users"
    );
    setLeaderboard(data);
  }, []);

  const { isConnected: wsConnected } = useLeaderboardWebSocket({
    onLeaderboardUpdate: handleLeaderboardUpdate,
    enabled: enableWebSocket,
  });

  return { leaderboard, isLoading, error, wsConnected };
};

export default useFetchLeaderboard;
