import React from "react";
import type { TypingSession } from "../types/TypingSession";
import { fetchTypingSessions } from "../api/stats/statsRequests";

const useFetchSessions = () => {
  const [sessions, setSessions] = React.useState<TypingSession[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await fetchTypingSessions();
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  return { sessions, isLoading };
};

export default useFetchSessions;
