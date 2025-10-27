import { myapiInstance } from "..";

export interface ThemeData {
  name: string;
  theme_data: {
    colors?: Record<string, { value: { _light: string; _dark: string } }>;
    [key: string]: unknown;
  };
  is_public: boolean;
}

export interface Theme {
  id: number;
  name: string;
  theme_data: {
    colors?: Record<string, { value: { _light: string; _dark: string } }>;
    [key: string]: unknown;
  };
  is_public: boolean;
  author_id: number;
  author_username: string;
  created_at: string;
}

export const createTheme = async (themeData: ThemeData): Promise<Theme> => {
  const response = await myapiInstance.post(`/themes/`, themeData);
  return response.data;
};

export const getPublicThemes = async (): Promise<Theme[]> => {
  const response = await myapiInstance.get(`/themes/`);
  return response.data;
};

export const getMyThemes = async (): Promise<Theme[]> => {
  const response = await myapiInstance.get(`/themes/my`);
  return response.data;
};

export const selectTheme = async (
  themeId: number
): Promise<{ detail: string }> => {
  const response = await myapiInstance.put(`/themes/select/${themeId}`);
  return response.data;
};

export const getSelectedTheme = async (): Promise<Theme | null> => {
  const response = await myapiInstance.get(`/themes/selected`);
  return response.data;
};
