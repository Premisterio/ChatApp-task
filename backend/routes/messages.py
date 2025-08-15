import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from database import get_db
from models import User, Message, MessageAttachment
from schemas import MessageResponse, MessageCreate, MessageUpdate, ChatResponse
from auth import get_current_active_user

router = APIRouter(prefix="/messages", tags=["messages"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=MessageResponse)
async def send_message(
    content: str = Form(...),
    recipient_id: int = Form(...),
    files: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a new message with optional file attachments."""
    
    # Check if recipient exists
    recipient = db.query(User).filter(User.id == recipient_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    # Create message
    db_message = Message(
        content=content,
        sender_id=current_user.id,
        recipient_id=recipient_id
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Handle file attachments
    for file in files:
        if file.filename:
            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Create attachment record
            attachment = MessageAttachment(
                message_id=db_message.id,
                filename=unique_filename,
                original_filename=file.filename,
                file_path=file_path,
                file_size=len(content),
                content_type=file.content_type
            )
            
            db.add(attachment)
    
    db.commit()
    db.refresh(db_message)
    
    return db_message

@router.get("/chats", response_model=List[ChatResponse])
def get_user_chats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of all chats for current user."""
    
    # Get all users that have exchanged messages with current user
    chat_users = db.query(User).filter(
        or_(
            User.id.in_(
                db.query(Message.sender_id).filter(Message.recipient_id == current_user.id)
            ),
            User.id.in_(
                db.query(Message.recipient_id).filter(Message.sender_id == current_user.id)
            )
        ),
        User.id != current_user.id
    ).all()
    
    chats = []
    for user in chat_users:
        # Get last message
        last_message = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == user.id),
                and_(Message.sender_id == user.id, Message.recipient_id == current_user.id)
            ),
            Message.is_deleted == False
        ).order_by(Message.created_at.desc()).first()
        
        # Count unread messages
        unread_count = db.query(Message).filter(
            Message.sender_id == user.id,
            Message.recipient_id == current_user.id
        ).count()
        
        chats.append(ChatResponse(
            user=user,
            last_message=last_message,
            unread_count=unread_count
        ))
    
    return chats

@router.get("/{user_id}", response_model=List[MessageResponse])
def get_messages_with_user(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get messages between current user and specified user."""
    
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.recipient_id == user_id),
            and_(Message.sender_id == user_id, Message.recipient_id == current_user.id)
        ),
        Message.is_deleted == False
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    
    return messages

@router.put("/{message_id}", response_model=MessageResponse)
def update_message(
    message_id: int,
    message_update: MessageUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update/edit a message."""
    
    db_message = db.query(Message).filter(Message.id == message_id).first()
    if not db_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    if db_message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this message"
        )
    
    db_message.content = message_update.content
    db_message.is_edited = True
    
    db.commit()
    db.refresh(db_message)
    
    return db_message

@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a message."""
    
    db_message = db.query(Message).filter(Message.id == message_id).first()
    if not db_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    if db_message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this message"
        )
    
    db_message.is_deleted = True
    db.commit()
    
    return {"detail": "Message deleted successfully"}

@router.get("/attachments/{filename}")
def get_attachment(filename: str):
    """Download message attachment."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(file_path)