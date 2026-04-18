# ⚡ MicroCarbon — Micro Carbon Credit System

> Track household energy consumption. Earn carbon credits for saving electricity. Redeem for real cash.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vercel)                       │
│  React + Vite + TailwindCSS + Three.js + Framer Motion     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Landing  │ │Dashboard │ │ Credits  │ │  Admin   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │  Login   │ │ Register │ │BillUpload│                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│  3D: ParticleField | EarthGlobe | CreditOrb               │
│  UI: GlassCard | NeonButton | Toast | ErrorBoundary       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / REST API
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (Render.com)                      │
│  FastAPI + SQLAlchemy + JWT Auth + BackgroundTasks          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ /auth    │ │ /bills   │ │ /credits │ │ /admin   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  Services: DISCOMService | CarbonCreditEngine | OCR        │
└────────────────────────┬────────────────────────────────────┘
                         │ psycopg2
┌────────────────────────▼────────────────────────────────────┐
│              DATABASE (Neon.tech PostgreSQL)                │
│  users | bills | credits | redemptions                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Neon.tech free tier)
- Tesseract OCR (optional, for bill image parsing)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # Edit with your values
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # Starts on http://localhost:5173
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `SECRET_KEY` | JWT signing secret | `your-secret-key-here` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL | `7` |
| `DISCOM_API_KEY` | DISCOM API key | `your-discom-key` |
| `DISCOM_BASE_URL` | DISCOM API base | `https://api.discom.example` |
| `APP_ENV` | Environment | `development` / `production` |

### Frontend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## API Endpoint Reference

### Auth (`/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate session |

### Bills (`/bills`)
| Method | Path | Description |
|---|---|---|
| POST | `/bills/initialize-from-discom` | Fetch 12-month DISCOM history |
| POST | `/bills/fetch-latest` | Fetch latest bill from DISCOM |
| POST | `/bills/upload-image` | Upload bill image for OCR |
| GET | `/bills/history` | All user bills (newest first) |
| GET | `/bills/{id}` | Single bill details |
| PUT | `/bills/{id}/correct` | Manually correct OCR data |

### Credits (`/credits`)
| Method | Path | Description |
|---|---|---|
| GET | `/credits/summary` | Total credits, available balance |
| GET | `/credits/history` | Monthly credit breakdown |
| POST | `/credits/redeem` | Redeem credits for cash (100 = ₹10) |

### Admin (`/admin`) — requires `is_admin=True`
| Method | Path | Description |
|---|---|---|
| GET | `/admin/stats` | Platform-wide statistics |
| GET | `/admin/users` | Paginated user list (search supported) |
| GET | `/admin/users/{id}/bills` | Bills for specific user |
| POST | `/admin/users/{id}/verify` | Verify/activate a user |
| POST | `/admin/credits/issue` | Manually issue credits |
| GET | `/admin/redemptions?status=` | List redemptions by status |
| POST | `/admin/redemptions/{id}/complete` | Mark payout complete |
| POST | `/admin/redemptions/{id}/fail` | Mark payout failed |

---

## Carbon Credit Formula

```
1. Find same-month bill from last year
2. raw_saving = last_year_units - current_units
3. per_capita_saving = raw_saving / household_size
4. saving_pct = (raw_saving / last_year_units) * 100
5. Consistency streak multiplier:
   - 1-2 months: 1.0x
   - 3-5 months: 1.2x
   - 6-11 months: 1.4x
   - 12 months:  1.75x
6. credits = per_capita_saving * saving_pct * multiplier / 10
7. Conversion: 100 credits = ₹10
```

---

## Deployment

### Backend → Render.com
1. Push to GitHub
2. Connect repo on Render
3. `render.yaml` auto-configures the service
4. Set env vars in Render dashboard

### Frontend → Vercel
1. Push to GitHub
2. Import on Vercel
3. Set `VITE_API_URL` env var to Render backend URL
4. `vercel.json` handles SPA routing

### Database → Neon.tech
1. Create free project at neon.tech
2. Copy connection string to `DATABASE_URL`
3. Run `backend/scripts/setup_neon_db.sql` or let app auto-create tables

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| 3D Graphics | Three.js, @react-three/fiber, @react-three/drei |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | FastAPI, Python 3.11 |
| ORM | SQLAlchemy |
| Auth | JWT (python-jose), bcrypt (passlib) |
| OCR | pytesseract, pdf2image |
| Database | PostgreSQL (Neon.tech) |
| Deployment | Render.com (API), Vercel (Frontend) |

---

## License
MIT
