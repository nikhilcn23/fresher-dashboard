# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from .. import models, schemas, deps
# from ..auth import get_current_user

# router = APIRouter()

# @router.post("/")
# def add_project(data: schemas.ProjectCreate, db: Session = Depends(deps.get_db), current_user = Depends(get_current_user)):
#     project = models.Project(**data.dict(), user_id=current_user.id)
#     db.add(project)
#     db.commit()
#     db.refresh(project)
#     return project

# @router.get("/")
# def get_projects(db: Session = Depends(deps.get_db), current_user = Depends(get_current_user)):
#     return db.query(models.Project).filter(models.Project.user_id == current_user.id).all()

# # ✅ ADD THIS
# @router.delete("/{project_id}")
# def delete_project(project_id: int, db: Session = Depends(deps.get_db)):
#     project = db.query(models.Project).filter(models.Project.id == project_id).first()
#     if not project:
#         raise HTTPException(status_code=404, detail="Project not found")
#     db.delete(project)
#     db.commit()
#     return {"msg": "Deleted"}
# # this is my backend/app/routers/projects.py file.
from fastapi import APIRouter, Depends, HTTPException
from app import schemas, deps
from app.models import Project

router = APIRouter()

@router.post("/")
async def add_project(data: schemas.ProjectCreate, current_user=Depends(deps.get_current_user)):
    project = Project(**data.dict(), user_id=str(current_user.id))
    await project.insert()
    return project.to_dict()

@router.get("/")
async def get_projects(current_user=Depends(deps.get_current_user)):
    projects = await Project.find(Project.user_id == str(current_user.id)).to_list()
    return [p.to_dict() for p in projects]

@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user=Depends(deps.get_current_user)):
    project = await Project.get(project_id)
    if not project or project.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Project not found")
    await project.delete()
    return {"msg": "Deleted"}