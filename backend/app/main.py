# from fastapi import FastAPI
# from .db import Base, engine
# from .routers import user, skills, projects, jobs, learning, resume
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import os

# load_dotenv()

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Base.metadata.create_all(bind=engine)

# app = FastAPI()

# app.include_router(user.router, prefix="/auth", tags=["Auth"])
# app.include_router(skills.router, prefix="/skills", tags=["Skills"])
# app.include_router(projects.router, prefix="/projects", tags=["Projects"])
# app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
# app.include_router(learning.router, prefix="/learning", tags=["Learning"])
# app.include_router(resume.router, prefix="/resume", tags=["Resume"])

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# # this is my backend/app/main.py file.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from app.db import init_db
from app.models import User, Skill, Project, Job, Learning
from app.routers import user, skills, projects, jobs, learning, resume
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup — initializes MongoDB connection
    await init_db([User, Skill, Project, Job, Learning])
    yield
    # Runs on shutdown (cleanup if needed)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/auth", tags=["Auth"])
app.include_router(skills.router, prefix="/skills", tags=["Skills"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(learning.router, prefix="/learning", tags=["Learning"])
app.include_router(resume.router, prefix="/resume", tags=["Resume"])