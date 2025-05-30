from uuid import uuid4
from redis_om import NotFoundError
from models import User, Chat, Conversation

def save_user(phone: str) -> User:
    """
    Create or retrieve a user by phone number.
    """
    user = User.find(User.phone == phone).first()
    if not user:
        user = User(phone=phone)
        user.save()
    return user

def update_user_auth(phone: str, auth: int = 1) -> User:
    """
    Mark user as authenticated in Redis.
    """
    user = User.find(User.phone == phone).first()
    if not user:
        raise ValueError(f"User with phone {phone} not found.")
    user.authenticated = auth
    user.session_id = uuid4().hex
    user.save()
    return user

def save_chat(phone: str, q: str, a: str, conversation_id: str) -> Chat:
    """
    Persist a new chat message for a user.
    """
    if conversation_id:
        conversation = Conversation.find(Conversation.pk == conversation_id).first()
        if not conversation:
            raise ValueError(f"Conversation with ID {conversation_id} not found.")
    else:
        conversation = Conversation(user_phone=phone)
        conversation.save()
        conversation_id = conversation.pk
        conversation.title = f"Chat {conversation_id}"
    chat = Chat(user_phone=phone, conversation_id=conversation_id, question=q, answer=a)
    chat.save()
    conversation.messages.append(chat)
    conversation.save()
    return chat

def get_conversations(phone: str) -> list[Conversation]:
    """
    Retrieve all chat conversations for a user.
    """
    conversations = Conversation.find(Conversation.user_phone == phone).all()
    if not conversations:
        raise ValueError(f"No conversations found for user {phone}.")
    return conversations

def get_conversation(conversation_id: str) -> Conversation:
    """
    Retrieve chat messages by conversation ID.
    """
    conversation = Conversation.find(Conversation.pk == conversation_id).first()
    if not conversation:
        raise ValueError(f"Conversation with ID {conversation_id} not found.")
    return conversation

def update_conversation(conversation_id: str, title: str) -> Conversation:
    """
    Update the title of a chat conversation.
    """
    conversation = Conversation.find(Conversation.pk == conversation_id).first()
    if not conversation:
        raise ValueError(f"Conversation with ID {conversation_id} not found.")
    conversation.title = title
    conversation.save()
    return conversation