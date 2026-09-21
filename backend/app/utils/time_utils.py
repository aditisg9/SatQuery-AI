from datetime import datetime


def utc_iso(dt: datetime) -> str:
    """
    Serialize a UTC-stored datetime with an explicit 'Z' suffix.

    Every timestamp in this app is stored as naive UTC (datetime.utcnow()).
    Serializing with plain `.isoformat()` produces a string with NO
    timezone marker — and browsers then wrongly interpret that as
    already-local time instead of converting UTC to the viewer's local
    time, making every displayed timestamp wrong by exactly the viewer's
    UTC offset. Appending 'Z' (ISO 8601 for UTC) fixes this: `new Date(...)`
    in JavaScript then correctly converts to local time automatically.
    """
    return dt.isoformat() + "Z"
