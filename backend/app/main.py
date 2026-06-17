from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import matches, sessions, swipes

app = FastAPI(title="Table for Two")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)
app.include_router(swipes.router)
app.include_router(matches.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
