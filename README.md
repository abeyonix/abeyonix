# Abeyonix Full-Stack Application

Full-stack application with:

- **Backend**: FastAPI (Python)  
- **Frontend**: React + TypeScript + TailwindCSS + Vite (or similar)

## Project Structure

.
├── Abeyonix_Backend/           # FastAPI backend
│   ├── app/                    # main application code
│   ├── alembic/                # database migrations
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .gitignore
│
├── Abeyonix_Frontend/          # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts (or similar)
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── .gitignore
│
├── .gitignore                  # root ignore rules
└── README.md                   # ← this file




## Quick Start (Local Development)

### Backend

```bash
cd Abeyonix_Backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy example env and fill it
cp .env.example .env        # then edit DATABASE_URL, etc.

# Run development server
uvicorn app.main:app --reload
# or: python -m uvicorn app.main:app --reload


Frontend

cd Abeyonix_Frontend

# Install dependencies
npm install
# or: bun install   (if you're using Bun)

# Copy example env if needed
# cp .env.example .env.local

# Start development server
npm run dev
# or: bun dev


Open http://localhost:5173 (or whatever port Vite shows)
Development Tips

Backend usually runs on http://127.0.0.1:8000
Frontend usually runs on http://localhost:5173 or :3000
Make sure CORS is configured in FastAPI to allow the frontend origin during development

Deployment

Frontend: Vercel, Netlify, Cloudflare Pages, Render Static, etc.
Backend: Render, Railway, Fly.io, Render Web Service, VPS (Hostinger KVM), etc.
Database & files: AWS RDS (PostgreSQL) + S3 (as already configured)

Tech Stack

Backend: FastAPI, SQLAlchemy, PostgreSQL, AWS S3
Frontend: React, TypeScript, Tailwind CSS, Vite
Others: Alembic (migrations), ...

Contributing

Create a feature branch: git checkout -b feature/add-something
Commit changes
Push: git push origin feature/add-something
Open Pull Request

Happy coding! 🚀