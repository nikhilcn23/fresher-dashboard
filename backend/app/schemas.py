# from pydantic import BaseModel
# from datetime import date

# # AUTH

# class UserCreate(BaseModel):
#     email: str
#     password: str
#     name: str

# class Login(BaseModel):
#     email: str
#     password: str


# # SKILL

# class SkillCreate(BaseModel):
#     name: str
#     level: str


# # PROJECT

# class ProjectCreate(BaseModel):
#     title: str
#     description: str
#     tech_stack: str
#     github_url: str
#     live_url: str


# # JOB

# class JobCreate(BaseModel):
#     company: str
#     role: str
#     status: str
#     applied_date: date


# # LEARNING

# class LearningCreate(BaseModel):
#     course: str
#     platform: str
#     progress: int
#     certificate_url: str
# # this is my backend/app/schemas.py file.
from pydantic import BaseModel

# AUTH

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class Login(BaseModel):
    email: str
    password: str


# SKILL

class SkillCreate(BaseModel):
    name: str
    level: str


# PROJECT

class ProjectCreate(BaseModel):
    title: str
    description: str
    tech_stack: str
    github_url: str
    live_url: str


# JOB

class JobCreate(BaseModel):
    company: str
    role: str
    status: str
    applied_date: str  # ✅ changed from date to str


# LEARNING

class LearningCreate(BaseModel):
    course: str
    platform: str
    progress: int
    certificate_url: str