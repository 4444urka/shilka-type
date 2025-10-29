import React from "react";
import type { Me } from "../types/User";
import { fetchLeaderboard } from "../api/stats/statsRequests";

const useFetchLeaderboard = () => {
  const [leaderboard, setLeaderboard] = React.useState<Me[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mountedRef = React.useRef(true);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      const filtered = Array.isArray(data)
        ? data.filter((u) => u && typeof u.id === "number" && !!u.username)
        : [];
      if (mountedRef.current) setLeaderboard(filtered);
    } catch (err) {
      if (mountedRef.current)
        setError(
          `Не удалось загрузить список лидеров: ${(err as Error).message}`
        );
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  // Подписываемся на глобальное событие, чтобы другие части приложения
  // могли триггерить обновление лидерборда (напр. после addCoins)
  React.useEffect(() => {
    const handler = () => {
      void load();
    };
    window.addEventListener("leaderboard:reload", handler);
    return () => {
      window.removeEventListener("leaderboard:reload", handler);
    };
  }, [load]);

  return { leaderboard, isLoading, error, reload: load };
};

export default useFetchLeaderboard;
