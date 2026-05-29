# app/services/storage/storage_service.py

import os
import boto3
from app.core.config import settings   # your existing settings

# ── Constants ─────────────────────────────────────────────────────────────────
BASE_MEDIA_DIR = "media"
IS_PRODUCTION  = settings.APP_ENV == "production"

# ── S3 client (only initialized in production) ────────────────────────────────
_s3 = None

def get_s3():
    global _s3
    if _s3 is None:
        _s3 = boto3.client(
            "s3",
            aws_access_key_id     = settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY,
            region_name           = settings.AWS_REGION,
        )
    return _s3


# ─────────────────────────────────────────────────────────────────────────────
# ✅ SAVE FILE
# Accepts raw bytes + relative path key (e.g. "invoices/INV-202501-AB12.pdf")
# Returns the same key (relative path) — stored in DB either way
# ─────────────────────────────────────────────────────────────────────────────
def save_file(file_bytes: bytes, file_key: str, content_type: str = "application/pdf") -> str:
    """
    DEV  → saves to  media/<file_key>
    PROD → uploads to S3 bucket at key <file_key>
    Returns file_key (stored in DB)
    """
    if IS_PRODUCTION:
        get_s3().put_object(
            Bucket      = settings.AWS_S3_BUCKET,
            Key         = file_key,
            Body        = file_bytes,
            ContentType = content_type,
        )
    else:
        full_path = os.path.join(BASE_MEDIA_DIR, file_key)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "wb") as f:
            f.write(file_bytes)

    return file_key


# ─────────────────────────────────────────────────────────────────────────────
# ✅ DELETE FILE
# ─────────────────────────────────────────────────────────────────────────────
def delete_file(file_key: str):
    """
    DEV  → deletes from media/<file_key>
    PROD → deletes from S3
    """
    if not file_key:
        return

    if IS_PRODUCTION:
        try:
            get_s3().delete_object(
                Bucket = settings.AWS_S3_BUCKET,
                Key    = file_key
            )
        except Exception as e:
            print(f"S3 delete failed: {e}")
    else:
        full_path = os.path.join(BASE_MEDIA_DIR, file_key)
        if os.path.exists(full_path):
            os.remove(full_path)


# ─────────────────────────────────────────────────────────────────────────────
# ✅ GET DOWNLOAD URL
# DEV  → returns local static URL  (/media/invoices/xxx.pdf)
# PROD → returns S3 pre-signed URL (expires in 30 days)
# ─────────────────────────────────────────────────────────────────────────────
def get_file_url(file_key: str, expires_in: int = 2592000) -> str:
    """
    DEV  → http://localhost:8000/media/<file_key>
    PROD → https://s3.../presigned-url (valid for expires_in seconds, default 30 days)
    """
    if IS_PRODUCTION:
        url = get_s3().generate_presigned_url(
            "get_object",
            Params  = {
                "Bucket"                     : settings.AWS_S3_BUCKET,
                "Key"                        : file_key,
                "ResponseContentDisposition" : f'attachment; filename="{os.path.basename(file_key)}"',
            },
            ExpiresIn = expires_in,
        )
        return url
    else:
        base_url = os.getenv("API_URL", "http://localhost:8000")
        return f"{base_url}/media/{file_key}"


# ─────────────────────────────────────────────────────────────────────────────
# ✅ GET FILE BYTES  (used by download endpoint)
# DEV  → reads from disk
# PROD → downloads from S3 into memory
# ─────────────────────────────────────────────────────────────────────────────
def get_file_bytes(file_key: str) -> bytes:
    if IS_PRODUCTION:
        obj = get_s3().get_object(
            Bucket = settings.AWS_S3_BUCKET,
            Key    = file_key
        )
        return obj["Body"].read()
    else:
        full_path = os.path.join(BASE_MEDIA_DIR, file_key)
        if not os.path.exists(full_path):
            return None
        with open(full_path, "rb") as f:
            return f.read()