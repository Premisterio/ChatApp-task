import json
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from models import User

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections: user_id -> list of websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Store websocket -> user_id mapping for quick lookup
        self.websocket_users: Dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, user: User):
        """Accept websocket connection and associate with user."""
        await websocket.accept()
        
        # Add connection to user's connections
        if user.id not in self.active_connections:
            self.active_connections[user.id] = []
        self.active_connections[user.id].append(websocket)
        
        # Store user mapping
        self.websocket_users[websocket] = user.id
        
        logger.info(f"User {user.username} (ID: {user.id}) connected via WebSocket")
        
        # Send connection success message
        await self.send_personal_message({
            "type": "connection_status",
            "status": "connected",
            "message": "Successfully connected to WebSocket"
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove websocket connection."""
        if websocket in self.websocket_users:
            user_id = self.websocket_users[websocket]
            
            # Remove from user's connections
            if user_id in self.active_connections:
                if websocket in self.active_connections[user_id]:
                    self.active_connections[user_id].remove(websocket)
                
                # Clean up empty connection list
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            # Remove user mapping
            del self.websocket_users[websocket]
            
            logger.info(f"User ID {user_id} disconnected from WebSocket")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific websocket."""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending message to websocket: {e}")
            self.disconnect(websocket)

    async def send_to_user(self, message: dict, user_id: int):
        """Send message to all connections of a specific user."""
        if user_id in self.active_connections:
            disconnected = []
            for websocket in self.active_connections[user_id][:]:  # Create copy to iterate
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending to user {user_id}: {e}")
                    disconnected.append(websocket)
            
            # Clean up disconnected websockets
            for ws in disconnected:
                self.disconnect(ws)

    async def broadcast_to_users(self, message: dict, user_ids: List[int]):
        """Send message to multiple users."""
        for user_id in user_ids:
            await self.send_to_user(message, user_id)

    def get_active_users(self) -> List[int]:
        """Get list of currently connected user IDs."""
        return list(self.active_connections.keys())

    def is_user_online(self, user_id: int) -> bool:
        """Check if user has any active connections."""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

# Global connection manager instance
manager = ConnectionManager()


async def get_websocket_user(websocket: WebSocket, token: str, db: Session) -> Optional[User]:
    """Get user from websocket token."""
    try:
        # Import here to avoid circular imports
        from auth import get_current_user_from_token
        user = await get_current_user_from_token(token, db)
        return user
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return None