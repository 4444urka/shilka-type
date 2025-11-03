"""
WebSocket роутер для real-time обновлений лидерборда
"""
import logging
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..websocket_manager import leaderboard_manager
from ..stats.service import get_leaderboard
from ..auth.schemas import UserPublic

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/leaderboard")
async def websocket_leaderboard(
    websocket: WebSocket,
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint для real-time обновлений лидерборда
    
    Протокол сообщений:
    
    От сервера к клиенту:
    - {"type": "leaderboard_update", "data": [...]}
    - {"type": "ping"}
    - {"type": "error", "message": "..."}
    
    От клиента к серверу:
    - {"type": "ping"}
    - {"type": "pong"}
    """
    await leaderboard_manager.connect(websocket)
    ping_task = None

    try:
        # Отправляем начальные данные лидерборда
        try:
            leaderboard_data = await get_leaderboard(db)
            # Преобразуем в схему UserPublic для сериализации
            leaderboard_json = [
                {
                    "id": user.id,
                    "username": user.username,
                    "shilka_coins": user.shilka_coins or 0,
                    "default_time": user.default_time,
                    "default_words": user.default_words,
                    "default_language": user.default_language,
                    "default_mode": user.default_mode,
                    "default_test_type": user.default_test_type,
                }
                for user in leaderboard_data
            ]

            await websocket.send_json({
                "type": "leaderboard_update",
                "data": leaderboard_json
            })
            logger.info("Sent initial leaderboard data to new client")

        except Exception as e:
            logger.error(f"Error sending initial leaderboard: {e}")
            await leaderboard_manager.send_error(
                websocket,
                "Failed to load leaderboard data"
            )

        # Создаём задачу для периодической отправки ping
        async def send_ping():
            try:
                while True:
                    await asyncio.sleep(30)  # Каждые 30 секунд
                    if websocket.client_state.value == 1:  # CONNECTED
                        await websocket.send_json({"type": "ping"})
                        logger.debug("Sent ping to client")
            except Exception as e:
                logger.debug(f"Ping task stopped: {e}")

        ping_task = asyncio.create_task(send_ping())

        # Обработка входящих сообщений
        while True:
            try:
                data = await websocket.receive_json()
                message_type = data.get("type")

                if message_type == "ping":
                    # Отвечаем на ping от клиента
                    await websocket.send_json({"type": "pong"})
                    logger.debug("Responded to ping with pong")

                elif message_type == "pong":
                    # Клиент ответил на наш ping
                    logger.debug("Received pong from client")

                else:
                    logger.warning(f"Unknown message type: {message_type}")

            except WebSocketDisconnect:
                # Клиент отключился - выходим из цикла
                logger.debug("Client disconnected during message loop")
                break
            except Exception as e:
                logger.error(f"Error processing message: {e}", exc_info=True)
                break

    except WebSocketDisconnect:
        logger.info("Client disconnected normally")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        # Останавливаем задачу ping
        if ping_task:
            ping_task.cancel()
            try:
                await ping_task
            except asyncio.CancelledError:
                pass

        # Гарантируем отключение в любом случае
        leaderboard_manager.disconnect(websocket)
        logger.debug("WebSocket connection cleaned up")
