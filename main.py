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
from typing import Optional
import shutil
import os
from contextlib import asynccontextmanager
import uvicorn


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

app = FastAPI(lifespan=lifespan)

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
def login(
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

# Routes to handle html pages
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login", response_class=HTMLResponse, name="login")
async def login(request: Request):
    return templates.TemplateResponse("auth.html", {"request": request, "departments": get_departments()})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    student_id = request.session.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    
    student = get_student_by_id(student_id)
    if not student:
        return RedirectResponse(url="/login", status_code=303)

    return templates.TemplateResponse("dashboard.html", {"request": request, "student": student})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)