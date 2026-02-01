from typing import Any
from fastapi import APIRouter, Depends

from app.models.user import User
from app.core.security import get_current_user
from app.schemas.user import UserResponse

router = APIRouter()


@router.post("/test-token", response_model=UserResponse)
def test_token(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Test access token by getting current user.
    """
    return current_user
