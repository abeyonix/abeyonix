import base64
import hashlib
import json

PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"
PAY_ENDPOINT = "/pg/v1/pay"

MERCHANT_ID = "PGTESTPAYUAT86"
SALT_KEY = "96434309-7796-489d-8924-ab56988a6076"
SALT_INDEX = "1"


def generate_x_verify(payload: dict) -> tuple[str, str]:
    json_payload = json.dumps(payload)
    base64_payload = base64.b64encode(json_payload.encode()).decode()

    to_hash = base64_payload + PAY_ENDPOINT + SALT_KEY
    sha256 = hashlib.sha256(to_hash.encode()).hexdigest()

    x_verify = sha256 + "###" + SALT_INDEX

    return base64_payload, x_verify
