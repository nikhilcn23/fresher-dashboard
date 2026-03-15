import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

PROMPT = """
Extract the following from the resume:

1. Skills (as a list)
2. Projects (name + description + tech stack)

Return ONLY valid JSON:

{
  "skills": [],
  "projects": [
    {
      "title": "",
      "description": "",
      "tech_stack": ""
    }
  ]
}
"""

def parse_resume(text: str):
    response = model.generate_content(PROMPT + text)
    return response.text
# this is my backend/app/services/gemini_service.py file.