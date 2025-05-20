import random
import datetime
import redis
from jose import JWTError, jwt
import africastalking
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from config import settings
from store import save_user, update_user_auth
from models import AuthUser

# Initialize Africa's Talking SDK
africastalking.initialize(
    username=settings.africastalking_username, api_key=settings.africastalking_api_key
)
sms = africastalking.SMS

# Redis for OTP
redis_client = redis.from_url(settings.redis_url, decode_responses=True)

# JWT Configuration
SECRET_KEY = settings.jwt_secret_key  # Use a secure key from settings
ALGORITHM = settings.jwt_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.jwt_access_token_expire_minutes

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/verify-otp")

class OTPDeliveryException(Exception):
    """
    Custom exception for OTP delivery failures.
    """
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

def _otp_redis_key(phone: str) -> str:
    return f"otp:{phone}"

def request_otp(phone: str) -> dict[str, str]:
    """
    Generate and send an OTP to the given phone number via SMS.
    Uses Redis for OTP storage (expiry and brute-force protection).
    """
    save_user(phone)
    otp = str(random.randint(100000, 999999))
    otp_key = _otp_redis_key(phone)
    # Limit attempts
    attempts_key = f"{otp_key}:attempts"
    attempts = int(redis_client.get(attempts_key) or 0)
    if attempts >= settings.otp_max_attempts:
        raise OTPDeliveryException("Maximum OTP requests exceeded. Try again later.")
    redis_client.setex(otp_key, settings.otp_expiry_seconds, otp)
    redis_client.incr(attempts_key)
    redis_client.expire(attempts_key, settings.otp_expiry_seconds)
    if settings.app_env == "development":
        return {"message": f"OTP sent in development mode {otp}"}
    else:
        try:
            response = sms.send(f"Your Travela OTP: {otp}", [phone])
            status = response["SMSMessageData"]["Recipients"][0]["status"]
            if status != "Success":
                raise OTPDeliveryException(f"Failed to send OTP: {status}")
        except africastalking.Service.AfricasTalkingException as e:
            raise OTPDeliveryException(f"Failed to send OTP: {str(e)}")
    return {"message": "OTP sent"}

def verify_otp(phone: str, otp: str) -> tuple[str, str]:
    """
    Verify the provided OTP for the phone number.
    Returns the phone and session_id if successful, else raises HTTPException.
    """
    otp_key = _otp_redis_key(phone)
    cached_otp = redis_client.get(otp_key)
    if cached_otp and cached_otp == otp:
        try:
            user = update_user_auth(phone)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        redis_client.delete(otp_key)  # Always remove OTP after use
        redis_client.delete(f"{otp_key}:attempts")
        return user.phone, user.session_id
    raise HTTPException(status_code=401, detail="Invalid OTP")

def create_access_token(data: dict) -> str:
    """
    Create a JWT token with the given data.
    """
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> AuthUser:
    """
    Decode and verify the JWT token to get the current user.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone: str = payload.get("sub")
        session_id: str = payload.get("session_id")
        if phone is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return AuthUser(phone=phone, session_id=session_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")