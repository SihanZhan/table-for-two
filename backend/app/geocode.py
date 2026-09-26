import httpx

_PHOTON_URL = "https://photon.komoot.io/api/"
# Photon's public instance 403s requests with a generic/empty User-Agent.
_HEADERS = {"User-Agent": "table-for-two-app/1.0 (restaurant matching demo)"}


async def geocode_location(location: str) -> tuple[float, float] | None:
    """Resolve free-text location to (lat, lon) via Photon. Best-effort: returns
    None on any failure so callers can fall back to Foursquare's free-text `near`."""
    try:
        async with httpx.AsyncClient(timeout=4.0, headers=_HEADERS) as client:
            resp = await client.get(_PHOTON_URL, params={"q": location, "limit": 1})
            resp.raise_for_status()
            features = resp.json().get("features", [])
    except (httpx.HTTPError, ValueError):
        return None

    if not features:
        return None

    lon, lat = features[0]["geometry"]["coordinates"]
    return lat, lon
