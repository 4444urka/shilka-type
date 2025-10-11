import axios from "axios";
import { store } from "../store";
import { clearUser } from "../slices/userSlice";
import { logger } from "../utils/logger";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

if (!import.meta.env.VITE_API_URL) {
  logger.warn("VITE_API_URL is not set. Using fallback URL:", apiUrl);
}

const myapiInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

myapiInstance.interceptors.request.use((config) => config);

// Перехватчик ответов для обработки 401 ошибок
myapiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если получили 401 (Unauthorized), значит токен невалиден или истёк
    if (error.response?.status === 401) {
      logger.log("401 Unauthorized - clearing user from store");
      // Очищаем пользователя из Redux
      store.dispatch(clearUser());
      // Опционально: перенаправляем на страницу входа
      // window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

const githubInstance = axios.create({
  baseURL: "https://api.github.com",
});

export { myapiInstance, githubInstance };
