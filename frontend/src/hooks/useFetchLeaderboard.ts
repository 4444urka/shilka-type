import React from "react";
import type { Me } from "../types/User";
import { fetchLeaderboard } from "../api/stats/statsRequests";
import { logger } from "../utils/logger";

const useFetchLeaderboard = () => {
  const [leaderboard, setLeaderboard] = React.useState<Me[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      await fetchLeaderboard()
        .then((data) => {
          setLeaderboard(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(`Не удалось загрузить список лидеров: ${err.message}`);
          setIsLoading(false);
        });
    };

    loadLeaderboard();
  }, []);
  logger.log("Лидерборд загружен", { count: leaderboard.length });

  return { leaderboard, isLoading, error };
};

export default useFetchLeaderboard;
