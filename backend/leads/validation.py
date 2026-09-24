import math
import re

CONTACT_LIMITS = {"name": 120, "email": 254, "company": 200, "message": 5000}


def _clean_value(value):
    if isinstance(value, str):
        return value.encode("utf-8", errors="replace").decode("utf-8").strip()
    return ""


def _clean_int(value):
    # ASCII decimal only; no isdigit()/int() disagreement or lossy float coercion.
    if isinstance(value, bool):
        return None
    if isinstance(value, str):
        value = value.strip()
        if not re.fullmatch(r"[0-9]{1,3}", value):
            return None
        value = int(value)
    if isinstance(value, float):
        if not math.isfinite(value) or not value.is_integer():
            return None
        value = int(value)
    return value if isinstance(value, int) and 0 <= value <= 100 else None


def _clean_qualification(payload):
    if not isinstance(payload, dict):
        return None
    cleaned = {}
    for key in ("projectType", "complexity", "budget", "timeline"):
        item = payload.get(key)
        if not isinstance(item, dict):
            continue
        value = _clean_value(item.get("value"))[:64]
        label = _clean_value(item.get("label"))[:160]
        if key == "projectType" and value.lower() in {"unsure", "unknown", "not sure", "not sure yet"}:
            value, label = "unsure", "Not sure"
        rating = _clean_int(item.get("rating"))
        total = _clean_int(item.get("total"))
        if not any([value, label, rating, total]):
            continue
        cleaned[key] = {
            "value": value,
            "label": label,
            "rating": rating,
            "total": total,
        }
    return cleaned or None
