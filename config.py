import os
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig

load_dotenv()

class Settings(BaseModel):
    MAIL_USERNAME: EmailStr
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool
    USE_CREDENTIALS: bool
    VALIDATE_CERTS: bool
    
email_settings = Settings(
    MAIL_USERNAME=os.getenv('EMAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('EMAIL_PASSWORD'),
    MAIL_FROM=os.getenv('EMAIL_FROM'),
    MAIL_PORT=int(os.getenv('EMAIL_PORT')),
    MAIL_SERVER=os.getenv('EMAIL_SERVER'),
    MAIL_STARTTLS=os.getenv('EMAIL_STARTTLS'),
    MAIL_SSL_TLS=os.getenv('EMAIL_SSL_TLS'),
    USE_CREDENTIALS=os.getenv('USE_CREDENTIALS'),
    VALIDATE_CERTS=os.getenv('VALIDATE_CERTS'),
)

email_config = ConnectionConfig(
    MAIL_USERNAME =email_settings.MAIL_USERNAME,
    MAIL_PASSWORD = email_settings.MAIL_PASSWORD,
    MAIL_FROM = email_settings.MAIL_FROM,
    MAIL_PORT = email_settings.MAIL_PORT,
    MAIL_SERVER = email_settings.MAIL_SERVER,
    MAIL_STARTTLS = email_settings.MAIL_STARTTLS,
    MAIL_SSL_TLS = email_settings.MAIL_SSL_TLS,
    USE_CREDENTIALS = email_settings.USE_CREDENTIALS,
    VALIDATE_CERTS = email_settings.VALIDATE_CERTS
)

