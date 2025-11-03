import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import shilkaCoinsReducer from "../slices/shilkaCoinsSlice";
import userReducer from "../slices/userSlice";
import settingsReducer from "../slices/settingsSlice";

export const store = configureStore({
  reducer: {
    shilkaCoins: shilkaCoinsReducer,
    user: userReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
