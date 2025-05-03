from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from auth import request_otp, verify_otp, OTPDeliveryException, create_access_token, get_current_user
from ai.agent import get_agent_response
from store import save_chat, get_chats
from models import (
    OTPRequest, QueryRequest,
    ChatResponse, HistoryResponse, AuthResponse
)
from redis_om import Migrator

# Define the lifespan context manager
def app_lifespan(app: FastAPI):
    """
    Lifespan context manager for application startup and shutdown.
    """
    # Run Redis OM migrations on startup
    Migrator().run()
    yield


# Initialize FastAPI application
app = FastAPI(
    title="Travela API",
    description="API for AI-driven travel assistance",
    version="1.0.0",
    lifespan=app_lifespan,
)


# Allow cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/request-otp", summary="Request OTP", response_model=dict)
def send_otp(body: OTPRequest):
    """
    Endpoint to request a one-time password (OTP) sent via SMS.
    """
    try:
        return request_otp(body.phone)
    except OTPDeliveryException as e:
        raise HTTPException(status_code=500, detail=e.message)


@app.post("/auth/verify-otp", summary="Verify OTP", response_model=AuthResponse)
def auth_verify(body: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    Endpoint to verify a one-time password (OTP).
    Returns a JWT token if successful.
    """
    phone_number, session_id = verify_otp(phone=body.username, otp=body.password)
    access_token = create_access_token(data={"sub": phone_number, "session_id": session_id})
    return AuthResponse(
        access_token=access_token,
        token_type="bearer"
    )


@app.post(
    "/ask",
    summary="Ask AI",
    response_model=ChatResponse,
    description="Submit a question to the AI agent and receive a response."
)
def ask_question(
    body: QueryRequest,
    user: str = Depends(get_current_user)
):
    """
    Protected endpoint to ask the AI travel assistant a question.
    Saves the Q&A to Redis.
    """
    answer = get_agent_response(user_id=user.phone, user_query=body.question, session_id=user.session_id)
    save_chat(user.phone, body.question, answer)
    return ChatResponse(question=body.question, answer=answer)


@app.get(
    "/history",
    summary="Get History",
    response_model=HistoryResponse,
    description="Retrieve authenticated user's chat history."
)
def history(user: str = Depends(get_current_user)):
    """
    Protected endpoint to fetch the user's chat history.
    """
    chats = get_chats(user.phone)
    return HistoryResponse(history=[ChatResponse(question=c.question, answer=c.answer) for c in chats])
