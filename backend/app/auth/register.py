from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserResponse
from app.users.services import UserService
from app.db.session import get_db

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    注册新用户
    """
    try:
        db_user = UserService.create_user(db=db, user_in=user_in)
        return db_user
    except HTTPException as e:
        # 如果用户名或邮箱已存在，直接抛出
        raise e
    except Exception as e:
        # 其他异常统一返回 500
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
