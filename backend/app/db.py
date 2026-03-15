# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from dotenv import load_dotenv

# load_dotenv()  # loads .env from project root

# DATABASE_URL = os.getenv("DATABASE_URL")

# if not DATABASE_URL:
#     raise ValueError("DATABASE_URL is not set in .env")

# engine = create_engine(DATABASE_URL, echo=True)

# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# Base = declarative_base()
# 

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "fresher_dashboard")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DB_NAME]

async def init_db(app_models: list):
    await init_beanie(database=db, document_models=app_models)



# this is my backend/app/db.py file.