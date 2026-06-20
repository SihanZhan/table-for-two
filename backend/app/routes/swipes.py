from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..limiter import limiter
from ..models import Participant, Restaurant, Swipe
from ..recommender import rank_restaurants
from ..schemas import RestaurantResponse, SwipeRequest

router = APIRouter(prefix="/swipes", tags=["swipes"])


@router.get("/restaurants/{participant_id}", response_model=list[RestaurantResponse])
@limiter.limit("30/minute")
async def get_restaurants(request: Request, participant_id: int, db: AsyncSession = Depends(get_db)):
    participant = await db.get(Participant, participant_id)
    if not participant:
        raise HTTPException(404, "Participant not found")

    all_restaurants = list(await db.scalars(
        select(Restaurant).where(Restaurant.session_id == participant.session_id)
    ))

    swiped_ids = set(
        await db.scalars(
            select(Swipe.restaurant_id).where(Swipe.participant_id == participant_id)
        )
    )
    liked_ids = set(
        await db.scalars(
            select(Swipe.restaurant_id).where(
                Swipe.participant_id == participant_id,
                Swipe.liked == True,  # noqa: E712
            )
        )
    )

    unswiped = [r for r in all_restaurants if r.id not in swiped_ids]
    liked = [r for r in all_restaurants if r.id in liked_ids]

    return rank_restaurants(unswiped, liked)


@router.post("")
@limiter.limit("120/minute")
async def record_swipe(request: Request, body: SwipeRequest, db: AsyncSession = Depends(get_db)):
    participant = await db.get(Participant, body.participant_id)
    if not participant:
        raise HTTPException(404, "Participant not found")

    restaurant = await db.get(Restaurant, body.restaurant_id)
    if not restaurant:
        raise HTTPException(404, "Restaurant not found")

    # Ensure the restaurant belongs to the participant's session
    if restaurant.session_id != participant.session_id:
        raise HTTPException(403, "Restaurant does not belong to this session")

    existing = await db.scalar(
        select(Swipe).where(
            Swipe.participant_id == body.participant_id,
            Swipe.restaurant_id == body.restaurant_id,
        )
    )
    if existing:
        existing.liked = body.liked
    else:
        db.add(Swipe(
            participant_id=body.participant_id,
            restaurant_id=body.restaurant_id,
            liked=body.liked,
        ))

    await db.commit()
    return {"ok": True}


@router.post("/finish/{participant_id}")
@limiter.limit("10/minute")
async def finish_swiping(request: Request, participant_id: int, db: AsyncSession = Depends(get_db)):
    participant = await db.get(Participant, participant_id)
    if not participant:
        raise HTTPException(404, "Participant not found")

    participant.finished = True
    await db.commit()
    return {"ok": True}
