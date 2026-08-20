import os
import uuid
from fastapi import UploadFile, HTTPException
from app.core.config import settings

import os
import shutil
import uuid
from fastapi import UploadFile

BASE_UPLOAD_DIR = "uploads"


def save_file(file: UploadFile, folder: str) -> str:
    os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)

    target_folder = os.path.join(BASE_UPLOAD_DIR, folder)
    os.makedirs(target_folder, exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(target_folder, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/{folder}/{unique_name}"


ALLOWED_IMAGES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_FILES = {"application/pdf", "video/mp4", "application/zip"}

def save_file(file: UploadFile, folder: str) -> str:
    upload_path = os.path.join(settings.UPLOAD_DIR, folder)
    os.makedirs(upload_path, exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(upload_path, filename)

    content = file.file.read()

    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB allowed.")

    with open(file_path, "wb") as f:
        f.write(content)

    return f"{folder}/{filename}"

def delete_file(file_path: str):
    full_path = os.path.join(settings.UPLOAD_DIR, file_path)
    if os.path.exists(full_path):
        os.remove(full_path)