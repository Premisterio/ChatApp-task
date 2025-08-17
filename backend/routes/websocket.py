import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from websocket_manager import manager, get_websocket_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time messaging."""
    
    # Authenticate user
    user = await get_websocket_user(websocket, token, db)
    if not user:
        return
    
    # Connect user
    await manager.connect(websocket, user)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                await handle_websocket_message(message_data, user.id, db)
                
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Error processing message"
                }, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


async def handle_websocket_message(message_data: dict, sender_id: int, db: Session):
    """Handle different types of WebSocket messages."""
    
    message_type = message_data.get("type")
    
    if message_type == "ping":
        # Handle ping for connection keep-alive
        await manager.send_to_user({
            "type": "pong",
            "timestamp": message_data.get("timestamp")
        }, sender_id)
        
    elif message_type == "typing":
        # Handle typing indicators
        recipient_id = message_data.get("recipient_id")
        if recipient_id:
            await manager.send_to_user({
                "type": "typing",
                "sender_id": sender_id,
                "is_typing": message_data.get("is_typing", False)
            }, recipient_id)
            
    elif message_type == "message_read":
        # Handle message read receipts
        recipient_id = message_data.get("recipient_id")
        message_id = message_data.get("message_id")
        if recipient_id and message_id:
            await manager.send_to_user({
                "type": "message_read",
                "message_id": message_id,
                "reader_id": sender_id
            }, recipient_id)
            
    elif message_type == "get_online_status":
        # Send online status of requested users
        requested_users = message_data.get("user_ids", [])
        online_status = {}
        for user_id in requested_users:
            online_status[user_id] = manager.is_user_online(user_id)
            
        await manager.send_to_user({
            "type": "online_status",
            "users": online_status
        }, sender_id)
        
    else:
        # Unknown message type
        await manager.send_to_user({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, sender_id)