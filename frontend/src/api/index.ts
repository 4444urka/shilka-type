import axios from "axios";
import { store } from "../store";
import { clearUser } from "../slices/userSlice";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

instance.interceptors.request.use((config) => config);

// Перехватчик ответов для обработки 401 ошибок
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если получили 401 (Unauthorized), значит токен невалиден или истёк
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - clearing user from store");
      // Очищаем пользователя из Redux
      store.dispatch(clearUser());
      // Опционально: перенаправляем на страницу входа
      // window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default instance;
