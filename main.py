from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, File, UploadFile, Form, Query
from utils.database import *
from utils.password_handler import *
from utils.email_handler import *
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional, List
import shutil
import os
from contextlib import asynccontextmanager
import uvicorn
import httpx
from bs4 import BeautifulSoup
from utils.get_jobs import *

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager for FastAPI app lifespan.
    Handles startup and shutdown events.
    """
    print("Application is starting up...")
    # Add your initialization code here
    # Examples:
    # - Database connections
    # - Load ML models
    # - Initialize cache
    # - Load configuration
    
    yield  # yield control back to FastAPI
    
    # Cleanup code goes here
    # Examples:
    # - Close database connections
    # - Release resources
    print("Application is shutting down...")


# Base Models Here
class Student(BaseModel):
    firstName: str
    lastName: str
    email: str
    regNumber: str
    departmentId: str
    password: str

app = FastAPI(lifespan=lifespan, title="Student Portal API", description="API for Student Portal", version="1.0.0")

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")
## Student endpoints

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE"],
    allow_headers=["*"]
)

app.add_middleware(
    SessionMiddleware,
    secret_key="5b9cf554803dde92a4ef38053b63823294d2145dbfd26ce2fd04f88663bd8082",
)

#API routes
@app.post("/department/add")
def create_department(name:str):
    add_department(name.strip().lower())
    return {"status": "success", "message": f"{name} added successfully"}    

@app.post("/register", name="register")
def create_student(
    firstName: str = Form(...),
    lastName: str = Form(...),
    email: str = Form(...),
    regNumber: str = Form(...),
    departmentId: str = Form(...),
    password: str = Form(...)
):
    """
    Register a new student.
    """
    # Check if the email already exists
    existing_student = get_student_by_email(email)
    if existing_student:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = hash_password(password)

    # Add the student to the database
    student_id = add_student(firstName, lastName, email, regNumber, departmentId, hashed_password)

    send_email(
        subject="Welcome to the Student Portal",
        recipient=email,
        body=f"Hello {firstName},\n\nThank you for registering. Your student ID is {student_id}.\n\nBest regards,\nStudent Portal Team"
    )
    return {"status": "success", "message": "Student registered successfully", "student_id": student_id}

@app.post("/login")
def login (
    request: Request,
    email: str = Form(...),
    password: str = Form(...)
):
    """
    Login a student.
    """
    # Check if the student exists
    student = get_student_by_email(email)
    if not student:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Verify the password
    if not verify_password(password, student["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Store the student ID in the session
    request.session["student_id"] = student["id"]
    request.session["student_email"] = student["email"]    
    return RedirectResponse(
        url="/dashboard", 
        status_code=303,
        headers={"Location": "/dashboard"}
    )
    
@app.post("/apply", name="apply")
async def apply(request: Request):
    form_data = await request.form()
    job_data = {
        "title": form_data.get("title"),
        "company": form_data.get("company"),
        "location": form_data.get("location"),
        "description": form_data.get("description"),
        "employment_type": form_data.get("employment_type"),
        "posted_date": form_data.get("posted_date"),
        "applicant_count": form_data.get("applicant_count"),
        "salary": form_data.get("salary"),
        "link": form_data.get("link")
    }
    apply_job(
        studentId=request.session.get("student_id"),
        job=job_data
    )
    add_notification(
        studentId=request.session.get("student_id"),
        message=f"You have successfully applied for {job_data['title']} at {job_data['company']}"
    )
    return {"status": "success", "job": job_data}

@app.post("/save", name="save")
async def apply(request: Request):
    form_data = await request.form()
    job_data = {
        "title": form_data.get("title"),
        "company": form_data.get("company"),
        "location": form_data.get("location"),
        "description": form_data.get("description"),
        "employment_type": form_data.get("employment_type"),
        "posted_date": form_data.get("posted_date"),
        "applicant_count": form_data.get("applicant_count"),
        "salary": form_data.get("salary"),
        "link": form_data.get("link")
    }
    save_job(
        studentId=request.session.get("student_id"),
        job=job_data
    )
    add_notification(
        studentId=request.session.get("student_id"),
        message=f"You Saved {job_data['title']} at {job_data['company']}"
    )
    return {"status": "success", "job": job_data}

@app.get("/jobs", response_model=List[Job])
async def search_jobs(
    discipline: str,
    location: str = "Worldwide",
    start: int = 0,
):
    params = {
        "keywords": discipline,
        "location": location,
        "start": start,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(GUEST_SEARCH_URL, params=params)
        if resp.status_code != 200:
            raise HTTPException(502, detail="LinkedIn guest API error")
        html = resp.text

    soup = BeautifulSoup(html, "html.parser")
    jobs = []
    
    for card in soup.select("div.job-search-card"):
        try:
            # Basic info (existing)
            title = card.select_one("h3.base-search-card__title").get_text(strip=True)
            comp = card.select_one("h4.base-search-card__subtitle").get_text(strip=True)
            loc = card.select_one("span.job-search-card__location").get_text(strip=True)
            link = card.select_one("a.base-card__full-link")["href"]
            
            # Additional info
            description = card.select_one("div.base-search-card__metadata").get_text(strip=True) if card.select_one("div.base-search-card__metadata") else None
            employment_type = card.select_one("div.job-search-card__employment-type").get_text(strip=True) if card.select_one("div.job-search-card__employment-type") else None
            posted_date = card.select_one("time.job-search-card__listdate").get_text(strip=True) if card.select_one("time.job-search-card__listdate") else None
            applicant_count = card.select_one("div.job-search-card__applicant-count").get_text(strip=True) if card.select_one("div.job-search-card__applicant-count") else None
            salary = card.select_one("span.job-search-card__salary-info").get_text(strip=True) if card.select_one("span.job-search-card__salary-info") else None
            
            jobs.append(Job(
                title=title,
                company=comp,
                location=loc,
                link=link,
                description=description,
                employment_type=employment_type,
                posted_date=posted_date,
                applicant_count=applicant_count,
                salary=salary
            ))
        except AttributeError as e:
            print(f"Error parsing job card: {e}")
            continue

    return jobs

# Routes to handle html pages
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login", response_class=HTMLResponse, name="login")
async def login(request: Request):
    return templates.TemplateResponse("auth.html", {"request": request, "departments": get_departments()})

@app.get("/dashboard", response_class=HTMLResponse, name="dashboard")
async def dashboard(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    jobs = await get_jobs(discipline=student["department"]["name"], location="Zimbabwe")
    return templates.TemplateResponse("dashboard.html", {"request": request, "student": student, "jobs": jobs})

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)

@app.get("/applications", response_class=HTMLResponse, name="applications")
async def applications(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    jobs = get_saved_jobs(student_id)
    return templates.TemplateResponse("applications.html", {"request": request, "student": student, "jobs": jobs})

@app.get("/contact", response_class=HTMLResponse, name="contact")
async def contact(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    return templates.TemplateResponse("contactPage.html", {"request": request, "student" : student})

@app.get("/internship/{internship_id}", response_class=HTMLResponse)
async def internship_details(request: Request, internship_id: str):
    return templates.TemplateResponse("internshipDetails.html", {"request": request, "internship_id": internship_id})

@app.get("/notifications", response_class=HTMLResponse, name="notifications")
async def notifications(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    notifications = get_notifications(student_id)
    return templates.TemplateResponse("notifications.html", {"request": request, "notifications": notifications, "student": student})

@app.get("/profile", response_class=HTMLResponse, name="profile")
async def profile(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    return templates.TemplateResponse("profile.html", {"request": request, "student" : student})

@app.get("/saved", response_class=HTMLResponse, name="saved")
async def saved(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    jobs = get_saved_jobs(student_id)
    return templates.TemplateResponse("savedInternships.html", {"request": request, "student": student, "jobs": jobs})

@app.get("/settings", response_class=HTMLResponse, name="settings")
async def settings(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    return templates.TemplateResponse("settings.html", {"request": request, "student": student})    

@app.get("/internships", response_class=HTMLResponse, name="internships")
async def internship_listing(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    jobs = await get_jobs(discipline=student["department"]["name"], location="Zimbabwe")
    return templates.TemplateResponse("internshipListing.html", {"request": request, "student": student, "jobs": jobs})
    
    
@app.get("/recommendations", response_class=HTMLResponse, name="recommendations")
async def recommendations(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)
    student["department"] = get_department_by_id(student["departmentId"])
    jobs = await get_jobs(discipline=student["department"]["name"], location="Zimbabwe")
    return templates.TemplateResponse("recommendations.html", {"request": request, "student": student, "jobs": jobs})


@app.get("/error", response_class=HTMLResponse)
async def error(request: Request):
    return templates.TemplateResponse("errorPage.html", {"request": request})


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
