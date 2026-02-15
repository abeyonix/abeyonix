import time
import random

def generate_time_based_id() -> int:
    timestamp_ms = int(time.time() * 1000)
    random_suffix = random.randint(100, 999)
    return int(f"{timestamp_ms}{random_suffix}")
