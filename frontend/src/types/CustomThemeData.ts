export type CustomThemeData = {
  colors?: Record<
    string,
    | string
    | { _light?: string; _dark?: string }
    | { value?: { _light?: string; _dark?: string } }
  >;
  [k: string]: unknown;
} | null;
