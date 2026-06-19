import enum
import random
import string
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class SessionStatus(str, enum.Enum):
    waiting = "waiting"
    active = "active"
    completed = "completed"


def _generate_code(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    join_code: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    status: Mapped[SessionStatus] = mapped_column(default=SessionStatus.waiting)
    location: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    participants: Mapped[list["Participant"]] = relationship(back_populates="session")
    restaurants: Mapped[list["Restaurant"]] = relationship(back_populates="session")


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"))
    name: Mapped[str] = mapped_column(String(100))
    finished: Mapped[bool] = mapped_column(Boolean, default=False)

    session: Mapped["Session"] = relationship(back_populates="participants")
    swipes: Mapped[list["Swipe"]] = relationship(back_populates="participant")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"))
    name: Mapped[str] = mapped_column(String(200))
    cuisine: Mapped[str] = mapped_column(String(100))
    price_range: Mapped[int] = mapped_column(Integer)   # 1–4 ($–$$$$)
    rating: Mapped[float] = mapped_column(Float)         # 0–5
    neighborhood: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(1000), default="")
    image_url: Mapped[str | None] = mapped_column(String(500))
    fsq_id: Mapped[str | None] = mapped_column(String(100))

    session: Mapped["Session"] = relationship(back_populates="restaurants")
    swipes: Mapped[list["Swipe"]] = relationship(back_populates="restaurant")


class Swipe(Base):
    __tablename__ = "swipes"
    __table_args__ = (UniqueConstraint("participant_id", "restaurant_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    participant_id: Mapped[int] = mapped_column(ForeignKey("participants.id"))
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id"))
    liked: Mapped[bool] = mapped_column(Boolean)

    participant: Mapped["Participant"] = relationship(back_populates="swipes")
    restaurant: Mapped["Restaurant"] = relationship(back_populates="swipes")
