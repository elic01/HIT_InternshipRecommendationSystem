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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Internship Recommendation System"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)