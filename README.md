# MediaPulse AI

MediaPulse AI is an AI-powered social media intelligence assistant for small businesses.

It analyzes customer comments, identifies sentiment, category and urgency, generates replies grounded in the business’s own policies using RAG, and creates actionable dashboard insights.

## Main Features

- Business profile creation
- AI comment analysis using Gemini
- Sentiment, category and urgency classification
- Suggested customer replies
- Business policy document storage
- Gemini embeddings and Supabase pgvector search
- RAG-grounded replies with policy sources
- AI-generated business insights
- Comment, document and insight history

## Technology Stack

### Backend

- Python
- FastAPI
- Gemini API
- Supabase PostgreSQL
- Supabase pgvector

### Mobile App

- React Native
- Expo
- Supabase Authentication

## Project Structure

```text
MediaPulse-AI/
├── backend/    # FastAPI, Gemini, Supabase and RAG
├── mobile/     # React Native and Expo application
├── docs/       # API reference, policies and demo documentation
└── README.md
```

## Backend Setup

### 1. Open the backend folder

```powershell
cd backend
```

### 2. Create a Python virtual environment

```powershell
python -m venv .venv
```

### 3. Activate it on Windows PowerShell

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 4. Install the dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Create the environment file

Inside the `backend` folder, create a file named `.env`.

```env
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_KEY=YOUR-SUPABASE-SECRET-KEY
GEMINI_API_KEY=YOUR-GEMINI-API-KEY
GEMINI_MODEL=gemini-3.1-flash-lite
```

Never upload `.env` or expose these secret keys.

### 6. Start the backend

```powershell
python -m uvicorn app.main:app --reload
```

Local API:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

## Main API Endpoints

```text
GET  /
GET  /health
GET  /health/database

POST /businesses
GET  /businesses/{business_id}

POST /comments/analyze
GET  /businesses/{business_id}/comments
GET  /comments/{comment_id}
POST /comments/{comment_id}/reply

POST /documents
GET  /businesses/{business_id}/documents

POST /insights/generate
GET  /businesses/{business_id}/insights
```

See the complete request and response documentation here:

```text
docs/API_REFERENCE.md
```

## Important Mobile Testing Note

`127.0.0.1` works only on the computer running FastAPI.

For a physical phone connected to the same Wi-Fi network, run:

```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0
```

Then find the computer’s IPv4 address:

```powershell
ipconfig
```

The mobile app should use an API address similar to:

```text
http://192.168.1.10:8000
```

Replace the example address with the computer’s actual IPv4 address.

## AI Workflow

```text
Customer comment
        ↓
Gemini comment classification
        ↓
Analysis saved in Supabase
        ↓
Query embedding generated
        ↓
Relevant business policy retrieved with pgvector
        ↓
Gemini generates a policy-grounded reply
        ↓
Reply and source saved in Supabase
        ↓
Recent comments summarized into dashboard insights
```

## Git Workflow

```text
main
└── phase1-backend
```

The backend was developed and tested on the `phase1-backend` branch before being merged into `main`.

## Hackathon Scope

Included:

- Manual comment entry
- AI comment classification
- Suggested and RAG-grounded replies
- Business knowledge base
- Comment history
- Basic dashboard insights

Not included:

- Live Instagram integration
- Automatic posting
- Payments
- Custom-model training