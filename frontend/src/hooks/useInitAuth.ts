import { useEffect } from "react";
import { useAppDispatch } from "../store";
import { setUser } from "../slices/userSlice";
import { setPoints } from "../slices/shilkaCoinsSlice";
import { fetchCurrentUser } from "../api/auth/authRequests";
import { getAccessTokenFromCookie } from "../utils/cookies";

/**
 * Хук для инициализации аутентификации при загрузке приложения.
 * Проверяет наличие cookie с токеном через запрос /auth/me.
 */
export const useInitAuth = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Получаем токен из cookie
        const accessToken = getAccessTokenFromCookie();

        if (!accessToken) {
          // Если токена нет в cookie, пользователь не авторизован
          return;
        }

        // Если есть валидный cookie, бэкенд вернёт данные пользователя
        const me = await fetchCurrentUser();
        dispatch(
          setUser({
            id: me.id,
            username: me.username,
            access_token: accessToken,
          })
        );
        dispatch(setPoints(me.shilka_coins));
      } catch {
        // Если cookie нет или невалиден, просто ничего не делаем
        // Пользователь останется неавторизованным
        console.log("User is not authenticated");
      }
    };

    initAuth();
  }, [dispatch]);
};
