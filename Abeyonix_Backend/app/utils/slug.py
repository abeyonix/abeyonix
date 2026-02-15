import re

def generate_slug(text: str) -> str:
    """
    Converts 'Drone Motors 2205' → 'drone-motors-2205'
    """
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)   # remove special chars
    text = re.sub(r"\s+", "-", text)       # replace spaces with -
    return text
