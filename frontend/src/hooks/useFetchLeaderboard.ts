import React from "react";
import type { Me } from "../types/User";
import { fetchLeaderboard } from "../api/stats/statsRequests";

const useFetchLeaderboard = () => {
  const [leaderboard, setLeaderboard] = React.useState<Me[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      setLeaderboard(
        Array.isArray(data)
          ? data.filter((u) => u && typeof u.id === "number" && !!u.username)
          : []
      );
    } catch {
      setError("Не удалось загрузить список лидеров");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { leaderboard, isLoading, error, reload: load };
};

export default useFetchLeaderboard;
