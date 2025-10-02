import instance from "..";
import type { TypingSession } from "../../types/TypingSession";
import type { WordHistoryPayload } from "../../types/WordHistoryPayload";

export const addCoins = async (amount: number) => {
  const response = await instance.post(`/stats/add-coins`, { amount });
  return response.data;
};

export const fetchLeaderboard = async () => {
  const response = await instance.get(`/stats/leaderboard`);
  return response.data;
};

export const postWordHistory = async (payload: WordHistoryPayload) => {
  const response = await instance.post(`/stats/typing-session`, payload);
  return response.data;
};

export const fetchTypingSessions = async (
  limit: number = 100
): Promise<TypingSession[]> => {
  const response = await instance.get(`/stats/typing-sessions`, {
    params: { limit },
  });
  return response.data;
};
