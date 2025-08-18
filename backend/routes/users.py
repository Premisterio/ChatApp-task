from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User
from schemas import UserResponse
from auth import get_current_active_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/search", response_model=List[UserResponse])
def search_users(
    query: str = Query(..., min_length=1, description="Search query for usernames"),
    limit: int = Query(default=10, le=50, description="Maximum number of results"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Search for users by username (excluding current user)."""
    
    # Search users by username (case-insensitive partial match)
    users = db.query(User).filter(
        User.username.ilike(f"%{query}%"),
        User.id != current_user.id,  # Exclude current user
        User.is_active == True  # Only active users
    ).limit(limit).all()
    
    return users

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all users (excluding current user) - useful for user discovery."""
    
    users = db.query(User).filter(
        User.id != current_user.id,
        User.is_active == True
    ).offset(skip).limit(limit).all()
    
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user by ID."""
    
    user = db.query(User).filter(
        User.id == user_id,
        User.is_active == True
    ).first()
    
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user