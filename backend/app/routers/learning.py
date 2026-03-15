# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# from .. import models, schemas, deps

# router = APIRouter()

# @router.post("/")
# def add_course(
#     data: schemas.LearningCreate,
#     db: Session = Depends(deps.get_db),
#     current_user=Depends(deps.get_current_user)   # ✅ was missing
# ):
#     course = models.Learning(**data.dict(), user_id=current_user.id)  # ✅ was hardcoded 1
#     db.add(course)
#     db.commit()
#     db.refresh(course)
#     return course

# @router.get("/")
# def get_courses(
#     db: Session = Depends(deps.get_db),
#     current_user=Depends(deps.get_current_user)   # ✅ was missing
# ):
#     return db.query(models.Learning).filter(
#         models.Learning.user_id == current_user.id  # ✅ was returning all users
#     ).all()

# @router.patch("/{course_id}/progress")
# def update_progress(
#     course_id: int,
#     progress: int = Query(...),
#     db: Session = Depends(deps.get_db),
#     current_user=Depends(deps.get_current_user)
# ):
#     course = db.query(models.Learning).filter(
#         models.Learning.id == course_id,
#         models.Learning.user_id == current_user.id  # ✅ own courses only
#     ).first()
#     if not course:
#         raise HTTPException(status_code=404, detail="Course not found")
#     course.progress = progress
#     db.commit()
#     db.refresh(course)
#     return course

# @router.delete("/{course_id}")
# def delete_course(
#     course_id: int,
#     db: Session = Depends(deps.get_db),
#     current_user=Depends(deps.get_current_user)
# ):
#     course = db.query(models.Learning).filter(
#         models.Learning.id == course_id,
#         models.Learning.user_id == current_user.id  # ✅ own courses only
#     ).first()
#     if not course:
#         raise HTTPException(status_code=404, detail="Course not found")
#     db.delete(course)
#     db.commit()
#     return {"msg": "Deleted"}
from fastapi import APIRouter, Depends, HTTPException, Query
from app import schemas, deps
from app.models import Learning

router = APIRouter()

@router.post("/")
async def add_course(data: schemas.LearningCreate, current_user=Depends(deps.get_current_user)):
    course = Learning(**data.dict(), user_id=str(current_user.id))
    await course.insert()
    return course.to_dict()

@router.get("/")
async def get_courses(current_user=Depends(deps.get_current_user)):
    courses = await Learning.find(Learning.user_id == str(current_user.id)).to_list()
    return [c.to_dict() for c in courses]

@router.patch("/{course_id}/progress")
async def update_progress(course_id: str, progress: int = Query(...), current_user=Depends(deps.get_current_user)):
    course = await Learning.get(course_id)
    if not course or course.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Course not found")
    course.progress = progress
    await course.save()
    return course.to_dict()

@router.delete("/{course_id}")
async def delete_course(course_id: str, current_user=Depends(deps.get_current_user)):
    course = await Learning.get(course_id)
    if not course or course.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Course not found")
    await course.delete()
    return {"msg": "Deleted"}