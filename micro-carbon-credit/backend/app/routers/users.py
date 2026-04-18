from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_users():
    # TODO: Return list of users
    return []
