import { useCallback, useRef } from "react";
import type { TypingSessionNew } from "../types/TypingTypes";
import { postWordHistory } from "../api/stats/statsRequests";
import { convertSessionToPayload } from "../utils/sessionDataConverter";
import { logger } from "../utils/logger";
import { fetchCurrentUser } from "../api/auth/authRequests";
import { useDispatch } from "react-redux";
import { setPoints } from "../slices/shilkaCoinsSlice";

interface UseSessionDataSyncProps {
  enabled?: boolean;
  mode?: string;
  language?: string;
  testType?: string;
}

/**
 * Хук для отправки данных сессии печати на сервер
 */
export const useSessionDataSync = ({
  enabled = true,
  mode,
  language,
  testType,
}: UseSessionDataSyncProps = {}) => {
  const dataSentRef = useRef<boolean>(false);
  const dispatch = useDispatch();

  const sendSessionData = useCallback(
    async (session: TypingSessionNew) => {
      if (!enabled) {
        logger.log("Отправка данных на сервер отключена");
        return;
      }

      if (dataSentRef.current) {
        logger.log("Данные уже были отправлены на сервер");
        return;
      }

      try {
        dataSentRef.current = true;

        const duration = session.startTime
          ? Math.floor((Date.now() - session.startTime) / 1000)
          : session.initialTime;

        const payload = convertSessionToPayload(
          session,
          duration,
          mode,
          language,
          testType
        );

        logger.log("Отправляем данные сессии на сервер:", {
          duration,
          wordsCount: payload.words.length,
          mode: payload.mode,
          language: payload.language,
          testType: payload.testType,
        });

        logger.log("Полный payload:", JSON.stringify(payload, null, 2));

        const response = await postWordHistory(payload);
        logger.log("Данные сессии успешно отправлены на сервер", response);

        // Обновляем баланс на фронте: забираем актуального пользователя и ставим значение shilka_coins
        try {
          const me = await fetchCurrentUser();
          if (me && typeof me.shilka_coins === "number") {
            dispatch(setPoints(me.shilka_coins));
            logger.log("Баланс обновлён из ответа сервера", {
              shilka_coins: me.shilka_coins,
            });
          }
        } catch (err) {
          logger.warn("Не удалось обновить баланс после отправки сессии", err);
        }

        // Возвращаем WPM и accuracy с сервера
        return {
          wpm: response.wpm,
          accuracy: response.accuracy,
        };
      } catch (error) {
        logger.error("Ошибка при отправке данных сессии:", error);
        dataSentRef.current = false; // Сбрасываем флаг при ошибке
      }
    },
    [enabled, mode, language, testType, dispatch]
  );

  const resetSyncState = useCallback(() => {
    dataSentRef.current = false;
  }, []);

  return {
    sendSessionData,
    resetSyncState,
  };
};
