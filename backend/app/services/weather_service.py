"""
WeatherService
----------------
Fetches REAL current weather conditions for a location, using Open-Meteo
(free, no API key required, no signup). This is deliberately a separate
concern from image analysis: a satellite image's pixels cannot tell you
today's temperature or wind speed — weather is live atmospheric data, not
something derivable from a photo. Keeping this as its own service (and
its own API response) avoids ever implying the two are the same thing.
"""
from dataclasses import dataclass
from typing import Optional

import requests

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
REQUEST_TIMEOUT = 6

# WMO weather interpretation codes -> human-readable description.
# https://open-meteo.com/en/docs (see "WMO Weather interpretation codes")
_WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
}


@dataclass
class WeatherInfo:
    temperature_c: float
    humidity_percent: Optional[float]
    wind_speed_kmh: Optional[float]
    precipitation_mm: Optional[float]
    condition: str
    is_day: bool


def get_current_weather(lat: float, lon: float) -> Optional[WeatherInfo]:
    """Best-effort live weather fetch. Returns None on any failure — the
    caller treats missing weather as optional, never a hard error."""
    try:
        resp = requests.get(
            OPEN_METEO_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day",
                "timezone": "auto",
            },
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json().get("current", {})
        code = data.get("weather_code")
        return WeatherInfo(
            temperature_c=data["temperature_2m"],
            humidity_percent=data.get("relative_humidity_2m"),
            wind_speed_kmh=data.get("wind_speed_10m"),
            precipitation_mm=data.get("precipitation"),
            condition=_WEATHER_CODES.get(code, "Unknown"),
            is_day=bool(data.get("is_day", 1)),
        )
    except Exception:
        return None
