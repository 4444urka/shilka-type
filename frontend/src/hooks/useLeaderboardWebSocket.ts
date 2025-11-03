import { useEffect, useRef, useState, useCallback } from "react";
import type { Me } from "../types/User";
import { logger } from "../utils/logger";

interface WebSocketMessage {
  type: "leaderboard_update" | "ping" | "pong" | "error";
  data?: Me[];
  message?: string;
}

interface UseLeaderboardWebSocketOptions {
  onLeaderboardUpdate?: (leaderboard: Me[]) => void;
  enabled?: boolean;
}

export const useLeaderboardWebSocket = (
  options: UseLeaderboardWebSocketOptions = {}
) => {
  const { onLeaderboardUpdate, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;
  const PING_INTERVAL = 30000; // 30 секунд

  const getWebSocketUrl = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    // Преобразуем HTTP URL в WebSocket URL
    const wsUrl = apiUrl
      .replace(/^http/, "ws")
      .replace(/\/api\/?$/, "")
      .concat("/ws/leaderboard");
    return wsUrl;
  }, []);

  const disconnect = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const wsUrl = getWebSocketUrl();
      logger.info(`Connecting to WebSocket: ${wsUrl}`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.info("WebSocket connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Запускаем ping для поддержания соединения
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          logger.debug("WebSocket message received:", message.type);

          switch (message.type) {
            case "leaderboard_update":
              if (message.data && onLeaderboardUpdate) {
                logger.info(
                  "Received leaderboard update with",
                  message.data.length,
                  "users"
                );
                onLeaderboardUpdate(message.data);
              } else {
                logger.warn(
                  "Received leaderboard update but no data or callback"
                );
              }
              break;

            case "ping":
              // Отвечаем на ping от сервера
              ws.send(JSON.stringify({ type: "pong" }));
              logger.debug("Responded to server ping");
              break;

            case "pong":
              // Сервер ответил на наш ping
              logger.debug("Received pong from server");
              break;

            case "error":
              logger.error("WebSocket error message:", message.message);
              setError(message.message || "Unknown error");
              break;

            default:
              logger.warn("Unknown message type:", message.type);
          }
        } catch (err) {
          logger.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (event) => {
        logger.error("WebSocket error:", event);
        setError("WebSocket connection error");
      };

      ws.onclose = (event) => {
        logger.info("WebSocket closed:", event.code, event.reason);
        setIsConnected(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Автоматическое переподключение
        if (enabled && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = RECONNECT_DELAY * reconnectAttemptsRef.current;

          logger.info(
            `Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError("Failed to connect after multiple attempts");
        }
      };
    } catch (err) {
      logger.error("Error creating WebSocket:", err);
      setError("Failed to create WebSocket connection");
    }
  }, [enabled, getWebSocketUrl, onLeaderboardUpdate]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    error,
    reconnect,
    disconnect,
  };
};
