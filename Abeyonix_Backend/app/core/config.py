from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()



# class Settings(BaseSettings):
#     PROJECT_NAME: str = "Abeyonix"
#     DATABASE_URL: str = os.getenv("DATABASE_URL")
#     # print(DATABASE_URL)
#     SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24

#     SMTP_HOST:str = os.getenv("SMTP_HOST")
#     SMTP_PORT :int = os.getenv("SMTP_PORT")
#     SMTP_USER:str = os.getenv("SMTP_USER")
#     SMTP_PASSWORD:str = os.getenv("SMTP_PASSWORD")
#     FROM_EMAIL:str = os.getenv("FROM_EMAIL")

#     RESEND_API_KEY: str = os.getenv("RESEND_API_KEY")

#     PHONEPE_ENV :str = os.getenv("PHONEPE_ENV")
#     PHONEPE_MERCHANT_ID : str = os.getenv("PHONEPE_MERCHANT_ID")
#     PHONEPE_MERCHANT_SECRET : str = os.getenv("PHONEPE_MERCHANT_SECRET")
#     PHONEPE_CALLBACK_URL : str = os.getenv("PHONEPE_CALLBACK_URL")

#     # s3 bucket 
#     AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID")
#     AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")
#     AWS_REGION: str = os.getenv("AWS_REGION")
#     AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET")

#     class Config:
#         env_file = ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    PROJECT_NAME: str = "Abeyonix"
    DATABASE_URL: str
    SECRET_KEY: str = "supersecretkey"

    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    FROM_EMAIL: str

    RESEND_API_KEY: str

    PHONEPE_ENV: str
    PHONEPE_MERCHANT_ID: str
    PHONEPE_MERCHANT_SECRET: str
    PHONEPE_CALLBACK_URL: str

    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    AWS_S3_BUCKET: str

settings = Settings()
