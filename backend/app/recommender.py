import numpy as np
from sklearn.preprocessing import normalize

CUISINES = [
    "American", "Italian", "Mexican", "Japanese", "Chinese",
    "Thai", "Indian", "Mediterranean", "French", "Korean",
    "Vietnamese", "Greek", "Other",
]
_CUISINE_INDEX = {c: i for i, c in enumerate(CUISINES)}


def _feature_vector(restaurant) -> np.ndarray:
    cuisine_vec = np.zeros(len(CUISINES))
    cuisine_vec[_CUISINE_INDEX.get(restaurant.cuisine, _CUISINE_INDEX["Other"])] = 1.0

    price_norm = (restaurant.price_range - 1) / 3   # 0–1
    rating_norm = restaurant.rating / 5              # 0–1

    return np.concatenate([cuisine_vec, [price_norm, rating_norm]])


def rank_restaurants(candidates: list, liked: list) -> list:
    if not candidates:
        return []

    if not liked:
        return sorted(candidates, key=lambda r: r.rating, reverse=True)

    candidate_vecs = np.array([_feature_vector(r) for r in candidates])
    liked_vecs = np.array([_feature_vector(r) for r in liked])

    centroid = liked_vecs.mean(axis=0, keepdims=True)
    scores = (normalize(candidate_vecs) @ normalize(centroid).T).flatten()

    order = np.argsort(scores)[::-1]
    return [candidates[i] for i in order]
