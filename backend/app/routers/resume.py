# from fastapi import APIRouter, UploadFile, File, Depends
# from sqlalchemy.orm import Session
# from ..deps import get_db, get_current_user
# from ..models import Skill, Project
# from ..services.gemini_service import parse_resume
# import json
# from pypdf import PdfReader

# router = APIRouter()

# @router.post("/upload")
# async def upload_resume(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     user=Depends(get_current_user)
# ):
#     pdf = PdfReader(file.file)
#     text = ""

#     for page in pdf.pages:
#         text += page.extract_text()

#     gemini_output = parse_resume(text)
#     print("Gemini Output:", gemini_output)  # Debug print

#     cleaned = gemini_output.strip()

# # remove markdown ```json ```
#     if cleaned.startswith("```"):
#         cleaned = cleaned.split("```")[1]

#     cleaned = cleaned.replace("json", "").strip()

#     data = json.loads(cleaned)

#     # store skills
#     for skill in data["skills"]:
#         db.add(Skill(name=skill, level="Beginner", user_id=1))

#     # store projects
#     for proj in data["projects"]:
#         db.add(Project(
#             title=proj["title"],
#             description=proj["description"],
#             tech_stack=proj["tech_stack"],
#             user_id=user.id
#         ))

#     db.commit()

#     return {"msg": "Resume processed successfully"}
# # this is my backend/app/routers/resume.py file.
from fastapi import APIRouter, UploadFile, File, Depends
from ..deps import get_current_user
from ..models import Skill, Project
from ..services.gemini_service import parse_resume
import json
from pypdf import PdfReader

router = APIRouter()

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    # Extract text from PDF
    pdf = PdfReader(file.file)
    text = ""
    for page in pdf.pages:
        text += page.extract_text()

    # Send to Gemini
    gemini_output = parse_resume(text)
    print("Gemini Output:", gemini_output)

    # Clean markdown formatting from response
    cleaned = gemini_output.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
    cleaned = cleaned.replace("json", "").strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error": "Gemini returned invalid JSON, please try again"}

    # Save skills to MongoDB
    for skill_name in data.get("skills", []):
        existing = await Skill.find_one(
            Skill.name == skill_name,
            Skill.user_id == str(user.id)
        )
        if not existing:  # avoid duplicates
            await Skill(name=skill_name, level="Beginner", user_id=str(user.id)).insert()

    # Save projects to MongoDB
    for proj in data.get("projects", []):
        await Project(
            title=proj.get("title", ""),
            description=proj.get("description", ""),
            tech_stack=proj.get("tech_stack", ""),
            user_id=str(user.id)
        ).insert()

    return {"msg": "Resume processed successfully"}