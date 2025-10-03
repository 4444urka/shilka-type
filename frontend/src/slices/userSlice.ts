import { fetchCurrentUser } from "../api/auth/authRequests";
import type { Me } from "../types/User";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface UserState {
  user: Me | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: true,
  error: null,
};

// Асинхронный thunk для загрузки текущего пользователя
export const initializeUser = createAsyncThunk("user/initialize", async () => {
  try {
    const user = await fetchCurrentUser();
    return user;
  } catch {
    // Если пользователь не авторизован - это нормально, возвращаем null
    return null;
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state: UserState, action: PayloadAction<Me | null>) {
      state.user = action.payload;
      state.error = null;
    },
    clearUser(state: UserState) {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(initializeUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to initialize user";
        state.user = null;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
