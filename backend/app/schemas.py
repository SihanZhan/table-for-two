from __future__ import annotations

import re

from pydantic import BaseModel, field_validator

from .models import SessionStatus

_NAME_MAX = 100
_LOC_MAX = 200
_CODE_RE = re.compile(r"^[A-Z0-9]{6}$")


class SessionCreate(BaseModel):
    creator_name: str
    location: str

    @field_validator("creator_name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = v.strip()[:_NAME_MAX]
        if not v:
            raise ValueError("name cannot be empty")
        return v

    @field_validator("location")
    @classmethod
    def clean_location(cls, v: str) -> str:
        v = v.strip()[:_LOC_MAX]
        if not v:
            raise ValueError("location cannot be empty")
        return v


class SessionResponse(BaseModel):
    id: int
    join_code: str
    status: SessionStatus
    participant_id: int
    location: str


class JoinRequest(BaseModel):
    join_code: str
    name: str

    @field_validator("join_code")
    @classmethod
    def clean_code(cls, v: str) -> str:
        v = re.sub(r"[^A-Z0-9]", "", v.upper())
        if not _CODE_RE.match(v):
            raise ValueError("join code must be exactly 6 alphanumeric characters")
        return v

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = v.strip()[:_NAME_MAX]
        if not v:
            raise ValueError("name cannot be empty")
        return v


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

    @field_validator("participant_id", "restaurant_id")
    @classmethod
    def positive_id(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("id must be a positive integer")
        return v


class MatchResponse(BaseModel):
    restaurant: RestaurantResponse
    explanation: str


class MatchesResponse(BaseModel):
    session_id: int
    both_finished: bool
    matches: list[MatchResponse]
