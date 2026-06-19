from __future__ import annotations

from pydantic import BaseModel

from .models import SessionStatus


class SessionCreate(BaseModel):
    creator_name: str
    location: str


class SessionResponse(BaseModel):
    id: int
    join_code: str
    status: SessionStatus
    participant_id: int


class JoinRequest(BaseModel):
    join_code: str
    name: str


class ParticipantResponse(BaseModel):
    id: int
    session_id: int
    name: str
    finished: bool

    model_config = {"from_attributes": True}


class RestaurantResponse(BaseModel):
    id: int
    name: str
    cuisine: str
    price_range: int
    rating: float
    neighborhood: str
    description: str
    image_url: str | None = None

    model_config = {"from_attributes": True}


class SwipeRequest(BaseModel):
    participant_id: int
    restaurant_id: int
    liked: bool


class MatchResponse(BaseModel):
    restaurant: RestaurantResponse
    explanation: str


class MatchesResponse(BaseModel):
    session_id: int
    both_finished: bool
    matches: list[MatchResponse]
