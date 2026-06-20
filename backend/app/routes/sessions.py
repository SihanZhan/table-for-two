import secrets
import string

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..fallback import get_fallback_restaurants
from ..foursquare import fetch_restaurants
from ..limiter import limiter
from ..models import Participant, Session, SessionStatus
from ..schemas import JoinRequest, ParticipantResponse, SessionCreate, SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])

_ALPHABET = string.ascii_uppercase + string.digits


def _make_code(length: int = 6) -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(length))


@router.post("", response_model=SessionResponse)
@limiter.limit("10/minute")
async def create_session(request: Request, body: SessionCreate, db: AsyncSession = Depends(get_db)):
    for _ in range(10):
        code = _make_code()
        existing = await db.scalar(select(Session).where(Session.join_code == code))
        if not existing:
            break
    else:
        raise HTTPException(500, "Could not generate a unique join code")

    session = Session(join_code=code, status=SessionStatus.waiting, location=body.location)
    db.add(session)
    await db.flush()

    participant = Participant(session_id=session.id, name=body.creator_name)
    db.add(participant)
    await db.flush()

    try:
        restaurants = await fetch_restaurants(body.location, session.id)
        if not restaurants:
            restaurants = get_fallback_restaurants(session.id)
    except Exception:
        restaurants = get_fallback_restaurants(session.id)

    db.add_all(restaurants)
    await db.commit()
    await db.refresh(session)
    await db.refresh(participant)

    return SessionResponse(
        id=session.id,
        join_code=session.join_code,
        status=session.status,
        participant_id=participant.id,
        location=session.location,
    )


@router.get("/info/{join_code}")
@limiter.limit("30/minute")
async def session_info(request: Request, join_code: str, db: AsyncSession = Depends(get_db)):
    session = await db.scalar(
        select(Session).where(Session.join_code == join_code.upper())
    )
    if not session:
        raise HTTPException(404, "Session not found")
    return {"location": session.location, "status": session.status}


@router.post("/join", response_model=ParticipantResponse)
@limiter.limit("15/minute")
async def join_session(request: Request, body: JoinRequest, db: AsyncSession = Depends(get_db)):
    session = await db.scalar(
        select(Session).where(Session.join_code == body.join_code.upper())
    )
    if not session:
        raise HTTPException(404, "Session not found")
    if session.status != SessionStatus.waiting:
        raise HTTPException(400, "Session is already full or completed")

    participant = Participant(session_id=session.id, name=body.name)
    db.add(participant)
    session.status = SessionStatus.active
    await db.commit()
    await db.refresh(participant)

    return participant
