from fastapi_mail import FastMail, MessageSchema
from config import email_config


async def send_email(recipient: str, subject: str, body: str):
    message = MessageSchema(
        recipients=[recipient],  
        subject=subject,
        body=body,
        subtype="html"
    )
    fm = FastMail(email_config)
    await fm.send_message(message)
    
async def batch_send_email(recipients: list, subject: str, body: str):
    message = MessageSchema(
        recipients=recipients,
        subject=subject,
        body=body,
        subtype="html"
    )
    fm = FastMail(email_config)
    await fm.send_message(message)
