import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

settings = get_settings()

def send_email(to_email: str, subject: str, body: str):
    if not settings.SMTP_HOST:
        print(f"DEBUG EMAIL to {to_email}: [{subject}] {body}")
        return

    msg = MIMEMultipart()
    msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_verification_email(to_email: str, token: str):
    link = f"{settings.FRONTEND_ORIGIN}/api/auth/verify-email?token={token}"
    body = f"""
    <h2>Verify your email</h2>
    <p>Please click the link below to verify your email address:</p>
    <a href="{link}">{link}</a>
    """
    send_email(to_email, "SatQuery AI - Email Verification", body)

def send_password_reset_email(to_email: str, token: str):
    link = f"{settings.FRONTEND_ORIGIN}/reset-password?token={token}"
    body = f"""
    <h2>Password Reset</h2>
    <p>Please click the link below to reset your password:</p>
    <a href="{link}">{link}</a>
    """
    send_email(to_email, "SatQuery AI - Password Reset", body)
