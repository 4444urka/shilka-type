import React from "react";
import { fetchCurrentUser } from "../api/auth/authRequests";
import type { Me } from "../types/User";

const useFetchCurrentUser = () => {
  const [user, setUser] = React.useState<Me | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchCurrentUser();
        setUser(response);
      } catch (err) {
        setError("Failed to fetch current user: " + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { user, isLoading, error };
};
export default useFetchCurrentUser;
