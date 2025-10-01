import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ShilkaCoinsState {
  value: number;
}

const initialState: ShilkaCoinsState = {
  value: 0,
};

const shilkaCoinsSlice = createSlice({
  name: "shilkaCoins",
  initialState,
  reducers: {
    addPoints(state: ShilkaCoinsState, action: PayloadAction<number>) {
      state.value += action.payload;
    },
    removePoints(state: ShilkaCoinsState, action: PayloadAction<number>) {
      state.value -= action.payload;
    },
    reset(state: ShilkaCoinsState) {
      state.value = 0;
    },
  },
});

export const { addPoints, reset } = shilkaCoinsSlice.actions;
export default shilkaCoinsSlice.reducer;
