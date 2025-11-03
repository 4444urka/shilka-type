"""
WebSocket Connection Manager для real-time обновлений
"""
import logging
import asyncio
import json
from typing import Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Управление WebSocket соединениями для лидерборда"""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._redis_listener_task = None
        self._is_listening = False

    async def connect(self, websocket: WebSocket):
        """Принять новое WebSocket соединение"""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"New WebSocket connection. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Удалить WebSocket соединение"""
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Отправить сообщение конкретному клиенту"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast_leaderboard(self, leaderboard_data: list):
        """Отправить обновление лидерборда всем подключенным клиентам"""
        if not self.active_connections:
            logger.warning("No active connections to broadcast to")
            return

        message = {
            "type": "leaderboard_update",
            "data": leaderboard_data
        }

        logger.info(f"Broadcasting leaderboard update to {len(self.active_connections)} clients with {len(leaderboard_data)} users")

        disconnected = set()
        sent_count = 0
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
                sent_count += 1
                logger.debug(f"Successfully sent to connection {id(connection)}")
            except Exception as e:
                logger.error(f"Error broadcasting to client {id(connection)}: {e}")
                disconnected.add(connection)

        logger.info(f"Broadcast completed: {sent_count} successful, {len(disconnected)} failed")

        # Удаляем отключенные соединения
        for connection in disconnected:
            self.disconnect(connection)

    async def send_error(self, websocket: WebSocket, error_message: str):
        """Отправить сообщение об ошибке клиенту"""
        try:
            await websocket.send_json({
                "type": "error",
                "message": error_message
            })
        except Exception as e:
            logger.error(f"Error sending error message: {e}")
    
    async def start_redis_listener(self):
        """Запустить слушатель Redis Pub/Sub для межпроцессной коммуникации"""
        if self._is_listening:
            return
        
        self._is_listening = True
        self._redis_listener_task = asyncio.create_task(self._listen_redis())
        logger.info("Started Redis Pub/Sub listener for leaderboard updates")
    
    def stop_redis_listener(self):
        """Остановить слушатель Redis"""
        self._is_listening = False
        if self._redis_listener_task:
            self._redis_listener_task.cancel()
            logger.info("Stopped Redis Pub/Sub listener")
    
    async def _listen_redis(self):
        """Слушать Redis канал для обновлений лидерборда"""
        from .redis_client import redis_client
        
        try:
            pubsub = await redis_client.subscribe("leaderboard_update")
            if not pubsub:
                logger.error("Failed to subscribe to Redis channel")
                return
            
            logger.info("Listening for leaderboard updates on Redis channel...")
            
            while self._is_listening:
                try:
                    message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if message and message["type"] == "message":
                        # Получили обновление лидерборда из Redis
                        leaderboard_data = json.loads(message["data"])
                        logger.info(f"Received leaderboard update from Redis with {len(leaderboard_data)} users")
                        
                        # Отправляем всем подключенным WebSocket клиентам
                        await self.broadcast_leaderboard(leaderboard_data)
                
                except asyncio.TimeoutError:
                    continue
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to decode Redis message: {e}")
                except Exception as e:
                    logger.error(f"Error in Redis listener: {e}")
                    await asyncio.sleep(1)
            
            await pubsub.unsubscribe("leaderboard_update")
            await pubsub.close()
            
        except asyncio.CancelledError:
            logger.info("Redis listener cancelled")
        except Exception as e:
            logger.error(f"Fatal error in Redis listener: {e}")
        finally:
            self._is_listening = False


# Глобальный экземпляр менеджера соединений
leaderboard_manager = ConnectionManager()
