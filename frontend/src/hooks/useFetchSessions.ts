import React from "react";
import type { TypingSession } from "../types/TypingSession";
import { fetchTypingSessions } from "../api/stats/statsRequests";
import { logger } from "../utils/logger";

const useFetchSessions = () => {
  const [sessions, setSessions] = React.useState<TypingSession[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [limit, setLimit] = React.useState<number>(10);

  const loadSessions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTypingSessions(limit);
      setSessions(data);
    } catch (error) {
      logger.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  React.useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const loadMore = () => {
    setLimit((prev) => prev + 10);
  };

  const hasMore = sessions.length >= limit;

  return { sessions, isLoading, loadMore, hasMore };
};

export default useFetchSessions;
