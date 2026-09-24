import asyncio

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..claude import generate_match_explanation
from ..database import get_db
from ..limiter import limiter
from ..models import Participant, Restaurant, Swipe
from ..schemas import MatchesResponse, MatchResponse, RestaurantResponse

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/{session_id}", response_model=MatchesResponse)
@limiter.limit("30/minute")
async def get_matches(request: Request, session_id: int, db: AsyncSession = Depends(get_db)):
    participants = list(
        await db.scalars(
            select(Participant).where(Participant.session_id == session_id)
        )
    )
    if not participants:
        raise HTTPException(404, "Session not found")

    if len(participants) < 2:
        return MatchesResponse(session_id=session_id, both_finished=False, matches=[])

    both_finished = all(p.finished for p in participants)

    liked_sets = []
    for p in participants:
        liked = set(
            await db.scalars(
                select(Swipe.restaurant_id).where(
                    Swipe.participant_id == p.id,
                    Swipe.liked == True,  # noqa: E712
                )
            )
        )
        liked_sets.append(liked)

    overlap_ids = liked_sets[0] & liked_sets[1]
    if not overlap_ids:
        return MatchesResponse(session_id=session_id, both_finished=both_finished, matches=[])

    restaurants = list(
        await db.scalars(select(Restaurant).where(Restaurant.id.in_(overlap_ids)))
    )

    # Explanations are cached on the Restaurant row, so a repeated poll only
    # pays for the Claude call once per restaurant instead of on every request.
    uncached = [r for r in restaurants if not r.explanation]
    if uncached:
        names = [p.name for p in participants]
        generated = await asyncio.gather(*(generate_match_explanation(r, names) for r in uncached))
        for r, explanation in zip(uncached, generated):
            r.explanation = explanation
        await db.commit()

    matches = [
        MatchResponse(restaurant=RestaurantResponse.model_validate(r), explanation=r.explanation)
        for r in restaurants
    ]

    return MatchesResponse(session_id=session_id, both_finished=both_finished, matches=matches)
