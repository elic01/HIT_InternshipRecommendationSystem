import datetime

def get_date():
    current_datetime = datetime.datetime.now()
    return current_datetime.isoformat()