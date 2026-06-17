import random
import string

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Participant, Session, SessionStatus
from ..schemas import JoinRequest, ParticipantResponse, SessionCreate, SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _make_code(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


@router.post("", response_model=SessionResponse)
async def create_session(body: SessionCreate, db: AsyncSession = Depends(get_db)):
    for _ in range(10):
        code = _make_code()
        existing = await db.scalar(select(Session).where(Session.join_code == code))
        if not existing:
            break
    else:
        raise HTTPException(500, "Could not generate a unique join code")

    session = Session(join_code=code, status=SessionStatus.waiting)
    db.add(session)
    await db.flush()

    participant = Participant(session_id=session.id, name=body.creator_name)
    db.add(participant)
    await db.commit()
    await db.refresh(session)
    await db.refresh(participant)

    return SessionResponse(
        id=session.id,
        join_code=session.join_code,
        status=session.status,
        participant_id=participant.id,
    )


@router.post("/join", response_model=ParticipantResponse)
async def join_session(body: JoinRequest, db: AsyncSession = Depends(get_db)):
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
