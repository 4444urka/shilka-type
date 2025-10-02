import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ShilkaCoinsState {
  value: number;
}

const initialState: ShilkaCoinsState = {
  value: JSON.parse(localStorage.getItem("shilkaCoins") || "0"),
};

const shilkaCoinsSlice = createSlice({
  name: "shilkaCoins",
  initialState,
  reducers: {
    addPoints(state: ShilkaCoinsState, action: PayloadAction<number>) {
      state.value += action.payload;
      if (action.payload) {
        localStorage.setItem(
          "shilkaCoins",
          JSON.stringify(state.value + action.payload)
        );
      }
    },
    setPoints(state: ShilkaCoinsState, action: PayloadAction<number>) {
      state.value = action.payload;
      if (action.payload) {
        localStorage.setItem("shilkaCoins", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("shilkaCoins");
      }
    },
    removePoints(state: ShilkaCoinsState, action: PayloadAction<number>) {
      state.value -= action.payload;
    },
    reset(state: ShilkaCoinsState) {
      state.value = 0;
    },
  },
});

export const { addPoints, reset, setPoints } = shilkaCoinsSlice.actions;
export default shilkaCoinsSlice.reducer;
