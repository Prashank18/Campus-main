# Backend setup (Phase B1)

This folder contains the FastAPI backend. It is separate from the React/Vite
frontend in the repository root.

## What this phase sets up

- A FastAPI application with interactive API documentation.
- Environment-based application settings.
- A versioned `/api/v1/health` endpoint.
- A test for the health endpoint.

This phase does not connect PostgreSQL or import scheduling data. The starter
pack (`cit_public.json`, its CSV files, `validator.py`, and the official README)
was not present in the repository when this scaffold was created. Add the
official files before implementing dataset import, scheduling, or export.

## Prerequisites

- Python 3.11 or newer.
- PostgreSQL will be required for the database phase. It was not detected on
  this machine during B1, so install PostgreSQL or obtain a database connection
  before starting that phase. B1 does not need a running database.
- The existing Node.js setup is used separately for the frontend.

## Windows PowerShell setup

Run these commands from the repository root:

```powershell
cd backend
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

If PowerShell blocks virtual-environment activation, use this for the current
terminal only, then activate the environment again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Start the API:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs` for Swagger UI or
`http://127.0.0.1:8000/api/v1/health` for the health check.

Run the B1 test from another terminal:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m pytest
```

Keep the frontend and API in separate terminals. Start the frontend from the
repository root with `npm run dev`; the configured CORS origins include Vite's
usual local ports 5173 and 5175.

## Configuration

`backend/.env.example` documents local settings. Copy it to `backend/.env` and
change values there when needed. Do not commit `.env` or put real credentials
in source control. Database credentials and JWT secrets will be configured in
the phases that implement those features.
