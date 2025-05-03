from uuid import uuid4
from redis_om import NotFoundError
from models import User, Chat


def save_user(phone: str) -> User:
    """
    Create or retrieve a user by phone number.
    """
    try:
        user = User.find(User.phone == phone).first()
    except NotFoundError:
        user = User(phone=phone)
        user.save()
    return user

def update_user_auth(phone: str, auth: int = 1) -> User:
    """
    Mark user as authenticated in Redis.
    """
    try:
        user = User.find(User.phone == phone).first()
    except NotFoundError:
        raise ValueError(f"User with phone {phone} not found.")
    user.authenticated = auth
    user.session_id = uuid4().hex
    user.save()
    return user


def save_chat(phone: str, q: str, a: str) -> Chat:
    """
    Persist a new chat message for a user.
    """
    chat = Chat(user_phone=phone, question=q, answer=a)
    chat.save()
    return chat


def get_chats(phone: str) -> list[Chat]:
    """
    Retrieve all chat messages for a user.
    """
    return Chat.find(Chat.user_phone == phone).all()