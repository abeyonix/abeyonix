import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"Abeyonix <{settings.FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg["Reply-To"] = settings.FROM_EMAIL

        text_content = (
            "Verify Your Account\n\n"
            "Use the OTP sent to your email.\n"
            "This OTP is valid for 10 minutes.\n\n"
            "Regards,\nAbeyonix Team"
        )

        msg.attach(MIMEText(text_content, "plain"))  # ✅ IMPORTANT
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())

        return True

    except Exception as e:
        print("Email send failed:", e)
        return False