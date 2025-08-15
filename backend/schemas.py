from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Message attachment schemas
class MessageAttachmentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    content_type: Optional[str]
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Message schemas
class MessageBase(BaseModel):
    content: str
    recipient_id: int

class MessageCreate(MessageBase):
    pass

class MessageUpdate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    content: str
    sender_id: int
    recipient_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    is_edited: bool
    is_deleted: bool
    sender: UserResponse
    recipient: UserResponse
    attachments: List[MessageAttachmentResponse] = []
    
    class Config:
        from_attributes = True

# Chat schemas
class ChatResponse(BaseModel):
    user: UserResponse
    last_message: Optional[MessageResponse]
    unread_count: int