import os

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./dev.db")

# Supabase's pooled connection runs PgBouncer in transaction mode, which doesn't
# support prepared statements - asyncpg uses them by default, so disable caching
# on that driver or every query fails with DuplicatePreparedStatementError.
_connect_args = {"statement_cache_size": 0} if DATABASE_URL.startswith("postgresql+asyncpg") else {}

engine = create_async_engine(DATABASE_URL, echo=False, connect_args=_connect_args)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
