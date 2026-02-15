import os
import uuid
from fastapi import UploadFile
import boto3
from app.core.config import settings

# BASE_MEDIA_DIR = "media"


# def save_image(file: UploadFile, folder: str) -> str:
#     """
#     Saves an uploaded image inside media/<folder>/
#     Returns relative path stored in DB
#     """
#     ext = file.filename.split(".")[-1]
#     filename = f"{uuid.uuid4()}.{ext}"

#     upload_dir = os.path.join(BASE_MEDIA_DIR, folder)
#     os.makedirs(upload_dir, exist_ok=True)

#     full_path = os.path.join(upload_dir, filename)

#     with open(full_path, "wb") as buffer:
#         buffer.write(file.file.read())

#     # ✅ return relative path (URL-safe)
#     return f"{folder}/{filename}"


# def delete_image(image_path: str):
#     """
#     Deletes image using relative DB path
#     """
#     if not image_path:
#         return

#     full_path = os.path.join(BASE_MEDIA_DIR, image_path)

#     if os.path.exists(full_path):
#         os.remove(full_path)




s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)

# upload_image_to_s3
def save_image(file: UploadFile, folder: str) -> str:
    ext = file.filename.split(".")[-1]
    filename = f"{folder}/{uuid.uuid4()}.{ext}"

    s3.upload_fileobj(
        file.file,
        settings.AWS_S3_BUCKET,
        filename,
        ExtraArgs={"ContentType": file.content_type}
    )

    # return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{filename}"
    return filename

# delete_image_from_s3
def delete_image(key: str):
    if not key:
        return

    try:
        s3.delete_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key
        )
    except Exception as e:
        print("S3 delete failed:", e)