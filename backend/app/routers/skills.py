# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from .. import models, schemas, deps

# router = APIRouter()

# @router.post("/")
# def add_skill(data: schemas.SkillCreate, db: Session = Depends(deps.get_db), current_user = Depends(deps.get_current_user)):
#     skill = models.Skill(**data.dict(), user_id=current_user.id)
#     db.add(skill)
#     db.commit()
#     db.refresh(skill)
#     return skill

# @router.get("/")
# def get_skills(db: Session = Depends(deps.get_db), current_user = Depends(deps.get_current_user)):
#     return db.query(models.Skill).filter(models.Skill.user_id == current_user.id).all()

# # ✅ ADD THESE TWO
# @router.patch("/{skill_id}/level")
# def update_skill_level(skill_id: int, level: str, db: Session = Depends(deps.get_db)):
#     skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
#     if not skill:
#         raise HTTPException(status_code=404, detail="Skill not found")
#     skill.level = level
#     db.commit()
#     db.refresh(skill)
#     return skill

# @router.delete("/{skill_id}")
# def delete_skill(skill_id: int, db: Session = Depends(deps.get_db)):
#     skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
#     if not skill:
#         raise HTTPException(status_code=404, detail="Skill not found")
#     db.delete(skill)
#     db.commit()
#     return {"msg": "Deleted"}
# # this is my backend/app/routers/skills.py file.
from fastapi import APIRouter, Depends, HTTPException, Query
from app import schemas, deps
from app.models import Skill

router = APIRouter()

@router.post("/")
async def add_skill(data: schemas.SkillCreate, current_user=Depends(deps.get_current_user)):
    skill = Skill(**data.dict(), user_id=str(current_user.id))
    await skill.insert()
    return skill.to_dict()

@router.get("/")
async def get_skills(current_user=Depends(deps.get_current_user)):
    skills = await Skill.find(Skill.user_id == str(current_user.id)).to_list()
    return [s.to_dict() for s in skills]

@router.patch("/{skill_id}/level")
async def update_skill_level(skill_id: str, level: str = Query(...), current_user=Depends(deps.get_current_user)):
    skill = await Skill.get(skill_id)
    if not skill or skill.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Skill not found")
    skill.level = level
    await skill.save()
    return skill.to_dict()

@router.delete("/{skill_id}")
async def delete_skill(skill_id: str, current_user=Depends(deps.get_current_user)):
    skill = await Skill.get(skill_id)
    if not skill or skill.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Skill not found")
    await skill.delete()
    return {"msg": "Deleted"}