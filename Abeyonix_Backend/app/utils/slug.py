import re
import random
import string
from datetime import datetime

def generate_slug(text: str) -> str:
    """
    Converts 'Drone Motors 2205' → 'drone-motors-2205'
    """
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)   # remove special chars
    text = re.sub(r"\s+", "-", text)       # replace spaces with -
    return text





def generate_sku(prefix: str = "PRD"):
    # Time part
    date_part = datetime.utcnow().strftime("%Y%m%d")

    # Random part
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

    return f"{prefix}-{date_part}-{random_part}"