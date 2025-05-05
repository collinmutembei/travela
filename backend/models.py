from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel
from redis_om import HashModel, JsonModel, Field, Migrator, get_redis_connection
from config import settings

# Initialize Redis OM connection and migrate models
redis = get_redis_connection(url=settings.redis_url)


class User(HashModel):
    """
    Redis OM model for storing user authentication state.
    """

    phone: str = Field(index=True)
    authenticated: int = 0
    session_id: str = ""

    class Meta:
        database = redis


class Chat(JsonModel):
    """
    Redis OM model for storing individual chat messages.
    """

    user_phone: str = Field(index=True)
    conversation_id: str = Field(index=True)
    timestamp: str = Field(default=datetime.now(timezone.utc).isoformat())
    question: str
    answer: str

    class Meta:
        database = redis


class Conversation(JsonModel):
    """
    Redis OM model for storing chat conversations.
    """

    user_phone: str = Field(index=True)
    title: str = Field(default="New Chat")
    messages: list[Chat] = []
    updated_at: str = Field(default=datetime.now(timezone.utc).isoformat())

    class Meta:
        database = redis


# Pydantic schemas for request/response
class OTPRequest(BaseModel):
    """Schema for OTP request payload."""

    phone: str


class QueryRequest(BaseModel):
    """Schema for AI query payload."""

    question: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Schema for returning a single chat message."""

    question: str
    answer: str
    timestamp: str
    conversation_id: str


class ConversationResponse(BaseModel):
    """Schema for returning Conversation"""
    id: Optional[str] = ""
    title: str
    updated_at: str
    messages: list[ChatResponse]


class AuthResponse(BaseModel):
    """Schema for returning authentication response."""

    access_token: str
    token_type: str


class AuthUser(BaseModel):
    """Schema for returning authenticated user data."""

    phone: str
    session_id: str


class UpdateConversationRequest(BaseModel):
    """Schema for updating a conversation."""

    title: str
    messages: list[Chat]
