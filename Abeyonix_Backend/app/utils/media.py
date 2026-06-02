import os
import uuid
from fastapi import UploadFile
import boto3
from app.core.config import settings

BASE_MEDIA_DIR = "media"
IS_PRODUCTION = settings.APP_ENV.lower() == "production"
_s3 = None



# ─────────────────────────────────────────────────────────────
# S3 Client
# ─────────────────────────────────────────────────────────────

def get_s3():
    global _s3

    if _s3 is None:
        _s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )

    return _s3


# ─────────────────────────────────────────────────────────────
# Save Image
# ─────────────────────────────────────────────────────────────

def save_image(file: UploadFile, folder: str) -> str:
    """
    DEV:
        media/products/uuid.jpg

    PROD:
        S3 Key = products/uuid.jpg

    Returns:
        products/uuid.jpg
    """

    ext = file.filename.split(".")[-1].lower()
    file_key = f"{folder}/{uuid.uuid4()}.{ext}"

    if IS_PRODUCTION:

        get_s3().upload_fileobj(
            file.file,
            settings.AWS_S3_BUCKET,
            file_key,
            ExtraArgs={
                "ContentType": file.content_type
            }
        )

    else:

        full_path = os.path.join(BASE_MEDIA_DIR, file_key)

        os.makedirs(
            os.path.dirname(full_path),
            exist_ok=True
        )

        with open(full_path, "wb") as buffer:
            buffer.write(file.file.read())

    return file_key


# ─────────────────────────────────────────────────────────────
# Delete Image
# ─────────────────────────────────────────────────────────────

def delete_image(file_key: str):
    """
    DEV:
        Delete media/products/abc.jpg

    PROD:
        Delete S3 object
    """

    if not file_key:
        return

    if IS_PRODUCTION:

        try:
            get_s3().delete_object(
                Bucket=settings.AWS_S3_BUCKET,
                Key=file_key
            )

        except Exception as e:
            print(f"S3 delete failed: {e}")

    else:

        full_path = os.path.join(
            BASE_MEDIA_DIR,
            file_key
        )

        if os.path.exists(full_path):
            os.remove(full_path)


# ─────────────────────────────────────────────────────────────
# Get Image URL
# ─────────────────────────────────────────────────────────────

def get_image_url(file_key: str, expires_in: int = 2592000):
    """
    DEV:
        http://localhost:8000/media/products/image.jpg

    PROD:
        Presigned S3 URL
    """

    if not file_key:
        return None

    if IS_PRODUCTION:

        return get_s3().generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.AWS_S3_BUCKET,
                "Key": file_key,
            },
            ExpiresIn=expires_in,
        )

    base_url = os.getenv(
        "BACKEND_URL",
        "http://localhost:8000"
    )

    return f"{base_url}/media/{file_key}"







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




# s3 = boto3.client(
#     "s3",
#     aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
#     aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
#     region_name=settings.AWS_REGION,
# )

# # upload_image_to_s3
# def save_image(file: UploadFile, folder: str) -> str:
#     ext = file.filename.split(".")[-1]
#     filename = f"{folder}/{uuid.uuid4()}.{ext}"

#     s3.upload_fileobj(
#         file.file,
#         settings.AWS_S3_BUCKET,
#         filename,
#         ExtraArgs={"ContentType": file.content_type}
#     )

#     # return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{filename}"
#     return filename

# # delete_image_from_s3
# def delete_image(key: str):
#     if not key:
#         return

#     try:
#         s3.delete_object(
#             Bucket=settings.AWS_S3_BUCKET,
#             Key=key
#         )
#     except Exception as e:
#         print("S3 delete failed:", e)