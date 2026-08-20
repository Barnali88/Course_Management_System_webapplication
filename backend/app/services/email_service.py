import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_enrollment_confirmation(student_email: str, student_name: str, course_title: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Enrollment Confirmed - {course_title}"
        msg["From"] = settings.MAIL_FROM
        msg["To"] = student_email

        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #e74c3c;">Enrollment Confirmed!</h2>
            <p>Dear <strong>{student_name}</strong>,</p>
            <p>You have been successfully enrolled in:</p>
            <h3 style="color: #2c3e50;">{course_title}</h3>
            <p>You can now access your course materials. Good luck!</p>
            <br>
            <p>Best regards,</p>
            <p><strong>Course Management Team</strong></p>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, student_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False