import os

import httpx

from .models import Restaurant

_FSQ_URL = "https://api.foursquare.com/v3/places/search"


async def fetch_restaurants(location: str, session_id: int, limit: int = 20) -> list[Restaurant]:
    api_key = os.getenv("FOURSQUARE_API_KEY", "")
    if not api_key:
        raise RuntimeError("FOURSQUARE_API_KEY is not set")

    headers = {"Authorization": api_key, "Accept": "application/json"}
    params = {
        "near": location,
        "categories": "13000",  # Food & Dining
        "limit": limit,
        "sort": "RATING",
        "fields": "fsq_id,name,categories,location,rating,price,photos,description",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(_FSQ_URL, headers=headers, params=params)
        if resp.status_code == 401:
            raise RuntimeError("Foursquare API key is invalid. Get a v3 key from developer.foursquare.com")
        resp.raise_for_status()

    results = resp.json().get("results", [])
    restaurants: list[Restaurant] = []

    for place in results:
        cats = place.get("categories", [])
        cuisine = cats[0]["name"] if cats else "Restaurant"

        loc = place.get("location", {})
        neighborhood = loc.get("neighborhood") or loc.get("locality") or loc.get("city") or ""
        if isinstance(neighborhood, list):
            neighborhood = neighborhood[0] if neighborhood else ""

        rating_raw = float(place.get("rating") or 7.0)
        rating = round(min(rating_raw, 10.0) / 2, 1)

        price = int(place.get("price") or 2)

        photos = place.get("photos", [])
        image_url: str | None = None
        if photos:
            p = photos[0]
            image_url = f"{p['prefix']}800x600{p['suffix']}"

        restaurants.append(Restaurant(
            session_id=session_id,
            name=place.get("name", ""),
            cuisine=cuisine,
            price_range=max(1, min(4, price)),
            rating=min(5.0, rating),
            neighborhood=str(neighborhood),
            description=str(place.get("description") or ""),
            image_url=image_url,
            fsq_id=place.get("fsq_id"),
        ))

    return restaurants
