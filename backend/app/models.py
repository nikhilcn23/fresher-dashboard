# from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
# from .db import Base

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, index=True)
#     password = Column(String)
#     name = Column(String)
#     bio = Column(Text)
#     resume_url = Column(String)


# class Skill(Base):
#     __tablename__ = "skills"

#     id = Column(Integer, primary_key=True)
#     name = Column(String)
#     level = Column(String)
#     user_id = Column(Integer, ForeignKey("users.id"))


# class Project(Base):
#     __tablename__ = "projects"

#     id = Column(Integer, primary_key=True)
#     title = Column(String)
#     description = Column(Text)
#     tech_stack = Column(String)
#     github_url = Column(String)
#     live_url = Column(String)
#     user_id = Column(Integer, ForeignKey("users.id"))


# class Job(Base):
#     __tablename__ = "jobs"

#     id = Column(Integer, primary_key=True)
#     company = Column(String)
#     role = Column(String)
#     status = Column(String)
#     applied_date = Column(Date)
#     user_id = Column(Integer, ForeignKey("users.id"))


# class Learning(Base):
#     __tablename__ = "learning"

#     id = Column(Integer, primary_key=True)
#     course = Column(String)
#     progress = Column(Integer)
#     platform = Column(String)
#     certificate_url = Column(String)
#     user_id = Column(Integer, ForeignKey("users.id"))
# # this is my backend/app/models.py file.
from beanie import Document
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from bson import ObjectId

class User(Document):
    email: str
    password: str
    name: str
    bio: Optional[str] = None
    resume_url: Optional[str] = None

    class Settings:
        name = "users"


class Skill(Document):
    name: str
    level: str
    user_id: str

    class Settings:
        name = "skills"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "level": self.level,
            "user_id": self.user_id
        }


class Project(Document):
    title: str
    description: str
    tech_stack: str
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    user_id: str

    class Settings:
        name = "projects"

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "tech_stack": self.tech_stack,
            "github_url": self.github_url,
            "live_url": self.live_url,
            "user_id": self.user_id
        }


class Job(Document):
    company: str
    role: str
    status: str
    applied_date: str
    user_id: str

    class Settings:
        name = "jobs"

    def to_dict(self):
        return {
            "id": str(self.id),
            "company": self.company,
            "role": self.role,
            "status": self.status,
            "applied_date": self.applied_date,
            "user_id": self.user_id
        }


class Learning(Document):
    course: str
    progress: int
    platform: str
    certificate_url: Optional[str] = None
    user_id: str

    class Settings:
        name = "learning"

    def to_dict(self):
        return {
            "id": str(self.id),
            "course": self.course,
            "progress": self.progress,
            "platform": self.platform,
            "certificate_url": self.certificate_url,
            "user_id": self.user_id
        }