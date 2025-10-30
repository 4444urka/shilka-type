import type { Theme } from "../api/themes/themesRequests";

export type UseThemeSelectorResult = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  itemRefs: React.RefObject<Array<HTMLButtonElement | null>>;
  filteredThemes: Theme[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  selected: Theme | null;
  selectingId: number | null;
  focusedIndex: number | null;
  setFocusedIndex: (i: number | null) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSelect: (themeId: number) => Promise<void>;
  load: () => Promise<void>;
  previewTheme: (t?: Theme | null) => void;
};
