from fastapi import FastAPI
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

@app.on_event("startup")
async def startup_event():
    """
    This function runs when the application starts.
    Add initialization code here.
    """
    print("Application is starting up...")
    # Add your initialization code here
    # Examples:
    # - Database connections
    # - Load ML models
    # - Initialize cache
    # - Load configuration

@app.get("/")
def read_root():
    return {"message": "Welcome to the Internship Recommendation System"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)