"""
Micro Carbon Credit API — application entry-point.

• CORSMiddleware (localhost:5173 dev + production domain)
• All routers mounted under /api
• Startup event to auto-create DB tables
• /health endpoint
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, users, bills, credits, admin

# Import models so Base.metadata knows about every table
from app.models import user as _user_model    # noqa: F401
from app.models import bill as _bill_model    # noqa: F401
from app.models import credit as _credit_model  # noqa: F401

settings = get_settings()


# ── Lifespan (startup / shutdown) ─────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all database tables on startup if they don't already exist."""
    Base.metadata.create_all(bind=engine)
    yield


# ── App instance ──────────────────────────────────────────────
app = FastAPI(
    title="Micro Carbon Credit API",
    description="Backend for household micro carbon-credit tracking and trading.",
    version="1.0.0",
    lifespan=lifespan,
)


# ── CORS ──────────────────────────────────────────────────────
origins = [
    "http://localhost:5173",          # Vite dev server
    "http://127.0.0.1:5173",
    "https://micro-carbon-credit.com",  # production domain placeholder
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────
app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(users.router,   prefix="/api/users",   tags=["Users"])
app.include_router(bills.router,   prefix="/api/bills",   tags=["Bills"])
app.include_router(credits.router, prefix="/api/credits", tags=["Credits"])
app.include_router(admin.router,   prefix="/api/admin",   tags=["Admin"])


# ── Health check ──────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "version": "1.0"}


@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to Micro Carbon Credit API"}
