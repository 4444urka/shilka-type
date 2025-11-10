import { myapiInstance } from "..";

export interface Word {
  id: number;
  text: string;
  language: string;
}

export interface Sentence {
  id: number;
  text: string;
  language: string;
  word_count: number;
}

export interface TextUploadRequest {
  raw_text: string;
  language: "ru" | "en";
}

export interface TextUploadResponse {
  message: string;
  words_created: number;
  sentences_created: number;
  language: string;
}

/**
 * Получить случайные слова с сервера
 */
export const getRandomWords = async (
  language: "ru" | "en" = "en",
  count: number = 25
): Promise<Word[]> => {
  const response = await myapiInstance.get<Word[]>("/content/words", {
    params: { language, count },
  });
  return response.data;
};

/**
 * Получить случайные предложения с сервера
 */
export const getRandomSentences = async (
  language: "ru" | "en" = "en",
  count: number = 10
): Promise<Sentence[]> => {
  const response = await myapiInstance.get<Sentence[]>("/content/sentences", {
    params: { language, count },
  });
  return response.data;
};

/**
 * Загрузить текст на сервер (только для админов)
 */
export const uploadText = async (
  payload: TextUploadRequest
): Promise<TextUploadResponse> => {
  const response = await myapiInstance.post<TextUploadResponse>(
    "/content/upload",
    payload
  );
  return response.data;
};
