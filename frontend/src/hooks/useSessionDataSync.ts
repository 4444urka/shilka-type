import { useCallback, useRef } from "react";
import type { TypingSessionNew } from "../types/TypingTypes";
import { postWordHistory } from "../api/stats/statsRequests";
import { convertSessionToPayload } from "../utils/sessionDataConverter";

interface UseSessionDataSyncProps {
  enabled?: boolean;
}

/**
 * Хук для отправки данных сессии печати на сервер
 */
export const useSessionDataSync = ({
  enabled = true,
}: UseSessionDataSyncProps = {}) => {
  const dataSentRef = useRef<boolean>(false);

  const sendSessionData = useCallback(
    async (session: TypingSessionNew) => {
      if (!enabled) {
        console.log("Отправка данных на сервер отключена");
        return;
      }

      if (dataSentRef.current) {
        console.log("Данные уже были отправлены на сервер");
        return;
      }

      try {
        dataSentRef.current = true;

        const duration = session.startTime
          ? Math.floor((Date.now() - session.startTime) / 1000)
          : session.initialTime;

        const payload = convertSessionToPayload(session, duration);

        console.log("Отправляем данные сессии на сервер:", {
          duration,
          wordsCount: payload.words.length,
          wpm: session.stats.wpm,
          accuracy: session.stats.accuracy,
        });

        await postWordHistory(payload);
        console.log("Данные сессии успешно отправлены на сервер");
      } catch (error) {
        console.error("Ошибка при отправке данных сессии:", error);
        dataSentRef.current = false; // Сбрасываем флаг при ошибке
      }
    },
    [enabled]
  );

  const resetSyncState = useCallback(() => {
    dataSentRef.current = false;
  }, []);

  return {
    sendSessionData,
    resetSyncState,
  };
};
