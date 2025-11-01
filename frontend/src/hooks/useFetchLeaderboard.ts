import React from "react";
import type { Me } from "../types/User";
import { fetchLeaderboard } from "../api/stats/statsRequests";

const useFetchLeaderboard = () => {
  const [leaderboard, setLeaderboard] = React.useState<Me[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  return { leaderboard, isLoading, error };
};

export default useFetchLeaderboard;
