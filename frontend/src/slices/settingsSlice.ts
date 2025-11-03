import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type ModeType = "words" | "sentences";
export type TestType = "time" | "words";

export interface SettingsState {
  selectedTime: number;
  selectedWords: number;
  selectedLanguage: "en" | "ru";
  selectedMode: ModeType;
  selectedTestType: TestType;
}

const STORAGE_KEY = "shilka_settings";

const defaultState: SettingsState = {
  selectedTime: 30,
  selectedWords: 25,
  selectedLanguage: "en",
  selectedMode: "words",
  selectedTestType: "time",
};

function loadFromStorage(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const initialState: SettingsState = loadFromStorage();

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTime(state, action: PayloadAction<number>) {
      state.selectedTime = action.payload;
      saveToStorage(state);
    },
    setWords(state, action: PayloadAction<number>) {
      state.selectedWords = action.payload;
      saveToStorage(state);
    },
    setLanguage(state, action: PayloadAction<"en" | "ru">) {
      state.selectedLanguage = action.payload;
      saveToStorage(state);
    },
    setMode(state, action: PayloadAction<ModeType>) {
      state.selectedMode = action.payload;
      saveToStorage(state);
    },
    setTestType(state, action: PayloadAction<TestType>) {
      state.selectedTestType = action.payload;
      saveToStorage(state);
    },
    replaceAll(state, action: PayloadAction<Partial<SettingsState>>) {
      const payload = action.payload;
      const next = { ...state, ...payload };
      state.selectedTime = next.selectedTime;
      state.selectedWords = next.selectedWords;
      state.selectedLanguage = next.selectedLanguage;
      state.selectedMode = next.selectedMode;
      state.selectedTestType = next.selectedTestType;
      saveToStorage(state);
    },
  },
});

export const {
  setTime,
  setWords,
  setLanguage,
  setMode,
  setTestType,
  replaceAll,
} = settingsSlice.actions;

export default settingsSlice.reducer;
