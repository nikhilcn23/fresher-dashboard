# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from .. import models, schemas, auth, deps

# router = APIRouter()

# @router.post("/register")
# def register(data: schemas.UserCreate, db: Session = Depends(deps.get_db)):
#     user = models.User(
#         email=data.email,
#         password=auth.hash_password(data.password),
#         name=data.name
#     )
#     db.add(user)
#     db.commit()
#     return {"msg": "User created"}


# @router.post("/login")
# def login(data: schemas.Login, db: Session = Depends(deps.get_db)):
#     user = db.query(models.User).filter(models.User.email == data.email).first()

#     if not user or not auth.verify_password(data.password, user.password):
#         return {"error": "Invalid credentials"}

#     token = auth.create_token({"user_id": user.id})
#     return {"access_token": token}
# # this is my backend/app/routers/user.py file.
from fastapi import APIRouter, HTTPException
from app import schemas, auth
from app.models import User

router = APIRouter()

@router.post("/register")
async def register(data: schemas.UserCreate):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        password=auth.hash_password(data.password),
        name=data.name
    )
    await user.insert()
    return {"msg": "User created"}

@router.post("/login")
async def login(data: schemas.Login):
    user = await User.find_one(User.email == data.email)
    if not user or not auth.verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_token({"user_id": str(user.id)})
    return {"access_token": token}