from tinydb import TinyDB, Query
from utils.generate_uuid import generate_id
from utils.get_date import get_date

students = TinyDB("./database/students.json")

Item = Query()

