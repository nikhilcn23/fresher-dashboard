# from fastapi import Depends, HTTPException
# from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy.orm import Session
# from . import models, deps
# from dotenv import load_dotenv
# import os
# import jwt
# from passlib.context import CryptContext
# from datetime import datetime, timedelta
# from typing import Optional

# load_dotenv()  # loads .env
# SECRET_KEY = os.getenv("SECRET_KEY")
# ALGORITHM = os.getenv("ALGORITHM", "HS256")
# # then use: jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")

# def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(deps.get_db)
# ):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id: int = payload.get("user_id")

#         if user_id is None:
#             raise HTTPException(status_code=401, detail="Invalid token")

#     except:
#         raise HTTPException(status_code=401, detail="Invalid token")

#     user = db.query(models.User).filter(models.User.id == user_id).first()

#     if user is None:
#         raise HTTPException(status_code=401, detail="User not found")

#     return user

# def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
#     to_encode = data.copy()
#     expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
#     to_encode.update({"exp": expire})
#     token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     if isinstance(token, bytes):
#         token = token.decode("utf-8")
#     return token
# # this is my backend/app/auth.py file.

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.models import User
from dotenv import load_dotenv
import os
import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token