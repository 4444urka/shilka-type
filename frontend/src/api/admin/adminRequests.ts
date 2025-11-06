import { myapiInstance } from "..";

export interface User {
  id: number;
  username: string;
  role: string;
  shilka_coins: number;
}

export interface AddCoinsRequest {
  amount: number;
}

export interface UserUpdateRequest {
  username?: string;
  role?: string;
  coins?: number;
}

export interface TypingSession {
  id: number;
  user_id: number;
  wpm: number;
  accuracy: number;
  time_seconds: number;
  created_at: string;
}

export const adminApi = {
  // Пользователи
  getAllUsers: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<User[]> => {
    const response = await myapiInstance.get(`/admin/users`, {
      params: { skip, limit },
    });
    return response.data;
  },

  getUserById: async (userId: number): Promise<User> => {
    const response = await myapiInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (
    userId: number,
    data: UserUpdateRequest
  ): Promise<User> => {
    const response = await myapiInstance.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await myapiInstance.delete(`/admin/users/${userId}`);
  },

  updateUserCoins: async (userId: number, amount: number): Promise<User> => {
    const response = await myapiInstance.post<User>(
      `/admin/users/${userId}/coins`,
      { amount }
    );
    return response.data;
  },

  // Сессии
  getAllSessions: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<TypingSession[]> => {
    const response = await myapiInstance.get(`/admin/sessions`, {
      params: { skip, limit },
    });
    return response.data;
  },

  deleteSession: async (sessionId: number): Promise<void> => {
    await myapiInstance.delete(`/admin/sessions/${sessionId}`);
  },
};
