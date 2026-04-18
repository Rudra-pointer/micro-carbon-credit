import os

base_dir = "micro-carbon-credit"

directories = [
    f"{base_dir}/backend/app/models",
    f"{base_dir}/backend/app/schemas",
    f"{base_dir}/backend/app/routers",
    f"{base_dir}/backend/app/services",
    f"{base_dir}/backend/app/utils",
    f"{base_dir}/frontend/src/components/3d",
    f"{base_dir}/frontend/src/components/layout",
    f"{base_dir}/frontend/src/components/ui",
    f"{base_dir}/frontend/src/pages",
    f"{base_dir}/frontend/src/hooks",
    f"{base_dir}/frontend/src/store",
    f"{base_dir}/frontend/src/api",
]

files = {
    f"{base_dir}/docker-compose.yml": """version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: carbon_db
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://user:password@db/carbon_db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    depends_on:
      - backend
""",
    f"{base_dir}/.gitignore": """node_modules/
__pycache__/
*.pyc
.env
venv/
dist/
.DS_Store
""",
    f"{base_dir}/README.md": """# Micro Carbon Credit

A full-stack application for tracking and exchanging micro carbon credits.
""",
    # BACKEND FILES
    f"{base_dir}/backend/app/main.py": """from fastapi import FastAPI
from app.routers import auth, users, bills, credits, admin

app = FastAPI(title="Micro Carbon Credit API")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(bills.router, prefix="/api/bills", tags=["bills"])
app.include_router(credits.router, prefix="/api/credits", tags=["credits"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Micro Carbon Credit API"}
""",
    f"{base_dir}/backend/app/config.py": """import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/carbon_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
""",
    f"{base_dir}/backend/app/database.py": """from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
""",
    f"{base_dir}/backend/app/models/__init__.py": """# Models module
""",
    f"{base_dir}/backend/app/models/user.py": """from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    # TODO: Add relationships
""",
    f"{base_dir}/backend/app/models/bill.py": """from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    energy_consumed = Column(Float)
    image_url = Column(String, nullable=True)
    # TODO: Add relationships and additional fields
""",
    f"{base_dir}/backend/app/models/credit.py": """from sqlalchemy import Column, Integer, Float, ForeignKey
from app.database import Base

class Credit(Base):
    __tablename__ = "credits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    # TODO: Add transaction details
""",
    f"{base_dir}/backend/app/schemas/__init__.py": """# Schemas module
""",
    f"{base_dir}/backend/app/schemas/user.py": """from pydantic import BaseModel

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True
""",
    f"{base_dir}/backend/app/schemas/bill.py": """from pydantic import BaseModel
from typing import Optional

class BillBase(BaseModel):
    amount: float
    energy_consumed: float
    image_url: Optional[str] = None

class BillCreate(BillBase):
    pass

class BillResponse(BillBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
""",
    f"{base_dir}/backend/app/schemas/credit.py": """from pydantic import BaseModel

class CreditBase(BaseModel):
    amount: float

class CreditCreate(CreditBase):
    pass

class CreditResponse(CreditBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
""",
    f"{base_dir}/backend/app/routers/__init__.py": """# Routers module
""",
    f"{base_dir}/backend/app/routers/auth.py": """from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
def login():
    # TODO: Implement login logic
    return {"token": "example_token"}
""",
    f"{base_dir}/backend/app/routers/users.py": """from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_users():
    # TODO: Return list of users
    return []
""",
    f"{base_dir}/backend/app/routers/bills.py": """from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def upload_bill():
    # TODO: Implement bill upload and OCR
    return {"status": "uploaded"}
""",
    f"{base_dir}/backend/app/routers/credits.py": """from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_credits():
    # TODO: Return user credits
    return []
""",
    f"{base_dir}/backend/app/routers/admin.py": """from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
def admin_dashboard():
    # TODO: Admin dashboard stats
    return {"users_count": 0, "total_credits": 0}
""",
    f"{base_dir}/backend/app/services/__init__.py": """# Services module
""",
    f"{base_dir}/backend/app/services/discom_service.py": """# DISCOM integration service

def fetch_discom_data(user_id: int):
    # TODO: Integrate with DISCOM APIs
    pass
""",
    f"{base_dir}/backend/app/services/calculation_engine.py": """# Credit calculation engine

def calculate_credits(energy_saved: float) -> float:
    # TODO: Implement complex carbon credit logic
    return energy_saved * 0.5
""",
    f"{base_dir}/backend/app/services/ocr_service.py": """# OCR service for bills

def extract_text_from_image(image_path: str) -> str:
    # TODO: Implement OCR (e.g. using Tesseract or cloud APIs)
    return "Extracted data"
""",
    f"{base_dir}/backend/app/utils/__init__.py": """# Utils module
""",
    f"{base_dir}/backend/app/utils/auth.py": """# Authentication utilities
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
""",
    f"{base_dir}/backend/app/utils/helpers.py": """# General helper functions

def format_currency(amount: float) -> str:
    return f"${amount:.2f}"
""",
    f"{base_dir}/backend/requirements.txt": """fastapi
uvicorn
sqlalchemy
psycopg2-binary
python-jose[cryptography]
passlib[bcrypt]
python-multipart
alembic
pydantic-settings
httpx
pillow
python-dotenv
""",
    f"{base_dir}/backend/.env.example": """DATABASE_URL=postgresql://user:password@localhost/carbon_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
""",
    f"{base_dir}/backend/Dockerfile": """FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
""",

    # FRONTEND FILES
    f"{base_dir}/frontend/package.json": """{
  "name": "micro-carbon-credit-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-three/drei": "^9.105.6",
    "@react-three/fiber": "^8.16.2",
    "axios": "^1.6.8",
    "framer-motion": "^11.1.7",
    "gsap": "^3.12.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.23.0",
    "recharts": "^2.12.7",
    "three": "^0.164.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.0"
  }
}
""",
    f"{base_dir}/frontend/vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
""",
    f"{base_dir}/frontend/tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
""",
    f"{base_dir}/frontend/postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""",
    f"{base_dir}/frontend/index.html": """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Micro Carbon Credit</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",
    f"{base_dir}/frontend/src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
""",
    f"{base_dir}/frontend/src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
""",
    f"{base_dir}/frontend/src/App.jsx": """import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BillUpload from './pages/BillUpload';
import Credits from './pages/Credits';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<BillUpload />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
""",
    f"{base_dir}/frontend/src/components/3d/ParticleField.jsx": """import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function ParticleField() {
  const pointsRef = useRef();

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1;
    }
  });

  // TODO: Add actual particle geometries and materials
  return (
    <points ref={pointsRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <pointsMaterial color="#00ff00" size={0.05} />
    </points>
  );
}
""",
    f"{base_dir}/frontend/src/components/3d/EarthGlobe.jsx": """import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function EarthGlobe() {
  const globeRef = useRef();

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  );
}
""",
    f"{base_dir}/frontend/src/components/3d/CreditOrb.jsx": """import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function CreditOrb() {
  const orbRef = useRef();

  useFrame((state, delta) => {
    if (orbRef.current) {
      orbRef.current.rotation.x += delta;
      orbRef.current.rotation.y += delta;
    }
  });

  return (
    <mesh ref={orbRef}>
      <octahedronGeometry args={[1]} />
      <meshStandardMaterial color="#10b981" />
    </mesh>
  );
}
""",
    f"{base_dir}/frontend/src/components/layout/Navbar.jsx": """import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-400">MicroCarbon</Link>
        <div className="space-x-4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
          {/* TODO: Add auth state dependent links */}
        </div>
      </div>
    </nav>
  );
}
""",
    f"{base_dir}/frontend/src/components/layout/Footer.jsx": """import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 p-4 text-center text-gray-400">
      <p>&copy; {new Date().getFullYear()} Micro Carbon Credit. All rights reserved.</p>
    </footer>
  );
}
""",
    f"{base_dir}/frontend/src/components/ui/GlassCard.jsx": """import React from 'react';

export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 shadow-lg ${className}`}>
      {children}
    </div>
  );
}
""",
    f"{base_dir}/frontend/src/components/ui/NeonButton.jsx": """import React from 'react';

export default function NeonButton({ children, onClick, className = '' }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 bg-transparent text-green-400 font-semibold rounded border border-green-400 hover:bg-green-400 hover:text-white transition-all shadow-[0_0_10px_rgba(74,222,128,0.5)] hover:shadow-[0_0_20px_rgba(74,222,128,0.8)] ${className}`}
    >
      {children}
    </button>
  );
}
""",
    f"{base_dir}/frontend/src/components/ui/CreditBadge.jsx": """import React from 'react';

export default function CreditBadge({ amount }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      {amount} MCC
    </span>
  );
}
""",
    f"{base_dir}/frontend/src/pages/Landing.jsx": """import React from 'react';
import { Canvas } from '@react-three/fiber';
import EarthGlobe from '../components/3d/EarthGlobe';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-5xl font-bold mb-4">Welcome to Micro Carbon</h1>
      <p className="text-xl mb-8">Offset your footprint, earn credits.</p>
      
      <div className="h-64 w-64 mb-8">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <EarthGlobe />
        </Canvas>
      </div>
      
      {/* TODO: Add call to actions */}
    </div>
  );
}
""",
    f"{base_dir}/frontend/src/pages/Register.jsx": """import React from 'react';

export default function Register() {
  return (
    <div className="container mx-auto p-4 max-w-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {/* TODO: Add registration form */}
      <p>Form goes here...</p>
    </div>
  );
}
""",
    f"{base_dir}/frontend/src/pages/Login.jsx": """import React from 'react';

export default function Login() {
  return (
    <div className="container mx-auto p-4 max-w-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {/* TODO: Add login form */}
      <p>Form goes here...</p>
    </div>
  );
}
""",
    f"{base_dir}/frontend/src/pages/Dashboard.jsx": """import React from 'react';
import GlassCard from '../components/ui/GlassCard';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 mt-10">
      <h2 className="text-3xl font-bold mb-6">User Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <h3 className="text-xl mb-2">Total Credits</h3>
          <p className="text-4xl font-bold text-green-500">120.5</p>
        </GlassCard>
        {/* TODO: Add more widgets like charts */}
      </div>
    </div>
  );
}
""",
    f"{base_dir}/frontend/src/pages/BillUpload.jsx": """import React from 'react';

export default function BillUpload() {
  return (
    <div className="container mx-auto p-4 mt-10">
      <h2 className="text-2xl font-bold mb-4">Upload Utility Bill</h2>
      {/* TODO: Add file upload component and drag/drop functionality */}
      <div className="border-4 border-dashed border-gray-300 p-10 text-center rounded-lg">
        <p>Drag and drop your bill here</p>
      </div>
    </div>
  );
}
""",
    f"{base_dir}/frontend/src/pages/Credits.jsx": """import React from 'react';

export default function Credits() {
  return (
    <div className="container mx-auto p-4 mt-10">
      <h2 className="text-2xl font-bold mb-4">Your Carbon Credits</h2>
      {/* TODO: List transactions and trade options */}
      <p>Transaction history...</p>
    </div>
  );
}
""",
    f"{base_dir}/frontend/src/pages/Admin.jsx": """import React from 'react';

export default function Admin() {
  return (
    <div className="container mx-auto p-4 mt-10">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {/* TODO: Admin controls, overview of all users and platform metrics */}
      <p>Admin panel...</p>
    </div>
  );
}
""",
    f"{base_dir}/frontend/src/hooks/useAuth.js": """import { useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);

  // TODO: Implement login, logout, register API calls

  return { user, setUser };
}
""",
    f"{base_dir}/frontend/src/hooks/useBills.js": """import { useState } from 'react';

export function useBills() {
  const [bills, setBills] = useState([]);

  // TODO: Implement fetching and uploading bills

  return { bills, setBills };
}
""",
    f"{base_dir}/frontend/src/store/authStore.js": """import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
""",
    f"{base_dir}/frontend/src/api/axios.js": """import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// TODO: Add request interceptor for JWT token injection

export default api;
"""
}

# Create directories
for d in directories:
    os.makedirs(d, exist_ok=True)

# Create files
for filepath, content in files.items():
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Successfully scaffolded {len(files)} files in {base_dir}")
