# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# from .. import models, schemas, deps

# router = APIRouter()

# @router.post("/")
# def add_job(
#     data: schemas.JobCreate,
#     db: Session = Depends(deps.get_db),
#     current_user=Depends(deps.get_current_user)   # ✅ was missing
# ):
#     job = models.Job(**data.dict(), user_id=current_user.id)  # ✅ was hardcoded 1
#     db.add(job)
#     db.commit()
#     db.refresh(job)
#     return job

# @router.get("/")
# def get_jobs(
#     db: Session = Depends(deps.get_db),
#     current_user=Depends(deps.get_current_user)   # ✅ was missing
# ):
#     return db.query(models.Job).filter(
#         models.Job.user_id == current_user.id      # ✅ was returning all users
#     ).all()

# @router.patch("/{job_id}/status")
# def update_job_status(
#     job_id: int,
#     status: str = Query(...),
#     db: Session = Depends(deps.get_db),
#     current_user=Depends(deps.get_current_user)
# ):
#     job = db.query(models.Job).filter(
#         models.Job.id == job_id,
#         models.Job.user_id == current_user.id      # ✅ own jobs only
#     ).first()
#     if not job:
#         raise HTTPException(status_code=404, detail="Job not found")
#     job.status = status
#     db.commit()
#     db.refresh(job)
#     return job

# @router.delete("/{job_id}")
# def delete_job(
#     job_id: int,
#     db: Session = Depends(deps.get_db),
#     current_user=Depends(deps.get_current_user)
# ):
#     job = db.query(models.Job).filter(
#         models.Job.id == job_id,
#         models.Job.user_id == current_user.id      # ✅ own jobs only
#     ).first()
#     if not job:
#         raise HTTPException(status_code=404, detail="Job not found")
#     db.delete(job)
#     db.commit()
#     return {"msg": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException, Query
from app import schemas, deps
from app.models import Job

router = APIRouter()

@router.post("/")
async def add_job(data: schemas.JobCreate, current_user=Depends(deps.get_current_user)):
    job_data = data.dict()
    job_data["applied_date"] = str(job_data["applied_date"])
    job = Job(**job_data, user_id=str(current_user.id))
    await job.insert()
    return job.to_dict()

@router.get("/")
async def get_jobs(current_user=Depends(deps.get_current_user)):
    jobs = await Job.find(Job.user_id == str(current_user.id)).to_list()
    return [j.to_dict() for j in jobs]

@router.patch("/{job_id}/status")
async def update_job_status(job_id: str, status: str = Query(...), current_user=Depends(deps.get_current_user)):
    job = await Job.get(job_id)
    if not job or job.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = status
    await job.save()
    return job.to_dict()

@router.delete("/{job_id}")
async def delete_job(job_id: str, current_user=Depends(deps.get_current_user)):
    job = await Job.get(job_id)
    if not job or job.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Job not found")
    await job.delete()
    return {"msg": "Deleted"}