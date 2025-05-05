from tinydb import TinyDB, Query
from utils.generate_uuid import generate_id
from utils.get_date import get_date
import os
from utils.get_jobs import Job

os.makedirs("./database", exist_ok=True)
students = TinyDB("./database/students.json")
departments = TinyDB("./database/departments.json")
applied = TinyDB("/database/applied.json")
saved = TinyDB("/database/saved.json")

Item = Query()

def add_department(name: str):
    """
    Add a new department to the database.
    """
    department_id = generate_id()
    departments.insert({
        "id": department_id,
        "name": name,
        "created_at": get_date()
    })
    return department_id

def get_department_by_id(department_id: str):
    """
    Get a department by its ID.
    """
    department = departments.get(Item.id == department_id)
    if not department:
        return None
    return department

def get_departments():
    """
    Get all departments.
    """
    return departments.all()

def add_student(firstName: str, lastName: str, email: str, regNumber: str, departmentId: str, password: str):
    """
    Add a new student to the database.
    """
    student_id = generate_id()
    students.insert({
        "id": student_id,
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "regNumber": regNumber,
        "departmentId": departmentId,
        "password": password,
        "created_at": get_date()
    })
    return student_id

def get_student_by_id(student_id: str):
    """
    Get a student by their ID.
    """
    student = students.get(Item.id == student_id)
    if not student:
        return None
    return student

def get_student_by_email(email: str):
    """
    Get a student by their email.
    """
    student = students.get(Item.email == email)
    if not student:
        return None
    return student

def get_students():
    """
    Get all students.
    """
    return students.all()

def apply_job(studentId:str, job:Job):
    applied.insert({
        "id":generate_id(),
        "studentId": studentId,
        "created_at": get_date(),
        "job": job
    })

def get_applied_jobs(studentId:str):
    """
    Get all jobs applied by a student.
    """
    return applied.search(Item.studentId == studentId)
    
def save_job(studentId:str, job:Job):
    saved.insert({
        "id":generate_id(),
        "studentId": studentId,
        "created_at": get_date(),
        "job": job        
    })

def get_saved_jobs(studentId:str):
    """
    Get all jobs saved by a student.
    """
    return saved.search(Item.studentId == studentId)


