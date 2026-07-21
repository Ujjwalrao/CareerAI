# CareerAI Backend — Phase 1

FastAPI backend for the CareerAI frontend. Endpoints are named to match
`src/services/api.ts` in the frontend 1:1, so swapping mock functions for
real `fetch()` calls is mechanical.

## All 9 modules — complete

- Module 1 — Auth (register / login / JWT)
- Module 2 — Resume Intelligence (PDF/DOCX parse → structured JSON → ATS score)
- Module 3 — JD Matching (keyword overlap + pgvector cosine similarity)
- Module 4 — Gap Analysis (static skill-graph seed + one LLM call for the roadmap)
- Module 5 — Mock Interview Coach (personalized Q&A generation + per-answer feedback)
- Module 6 — Content Generator (cover letter / LinkedIn about / cold outreach)
- Module 7 — Application Tracker (Kanban CRUD + Telegram follow-up reminders)
- Module 8 — Salary Negotiation Simulator (LLM roleplay, backend-controlled offer bounds)
- Module 9 — Analytics (client-side derived in the UI already; `/api/analytics/summary` added for future weekly email reports)

## Local setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, GROQ_API_KEY, GEMINI_API_KEY
uvicorn app.main:app --reload
```
Visit `http://localhost:8000/docs` to test endpoints directly.

## Neon Postgres setup
1. Create a free project at neon.tech
2. In the Neon SQL editor, run: `CREATE EXTENSION IF NOT EXISTS vector;`
3. Copy the connection string into `DATABASE_URL` in `.env`

## Deploying to Render (free tier) — two ways

**Option A — Blueprint (recommended, one click):**
1. Push this repo to GitHub
2. Render Dashboard → New → Blueprint → select the repo → Render reads `render.yaml`
   and creates the service automatically
3. Fill in the secrets marked `sync: false` in the dashboard (`DATABASE_URL`,
   `GROQ_API_KEY`, `GEMINI_API_KEY`, `FRONTEND_ORIGIN`, `TELEGRAM_BOT_TOKEN`,
   `TELEGRAM_BOT_USERNAME`) — `JWT_SECRET` and `CRON_SECRET` are auto-generated

**Option B — Manual:**
1. New Web Service → connect this repo
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add the env vars from `.env.example` in Render's dashboard

**Either way**, after deploy: edit `.github/workflows/keep-alive.yml` and
`.github/workflows/daily-reminders.yml` — replace `your-backend.onrender.com`
with your actual Render URL, then push.

## Python version
`.python-version` pins `3.14` — this matches Render's current default for new
services (Render updates this default periodically; check
[render.com/docs/python-version](https://render.com/docs/python-version) if
you're reading this much later). All C-extension dependencies here
(psycopg2-binary, pydantic-core, bcrypt) already ship prebuilt wheels for 3.14,
confirmed before pinning it — so there's no slow from-source build.

## A few version choices worth knowing about
- **`google-genai` instead of `google-generativeai`** — Google deprecated the
  old SDK; `embeddings.py` uses the new unified client (`gemini-embedding-001`
  model, which replaced `text-embedding-004`).
- **Plain `bcrypt` instead of `passlib`** — `passlib` hasn't been updated since
  2020 and breaks with `bcrypt` 4.1+ (a well-known `AttributeError` on hashing).
  `app/auth.py` calls `bcrypt` directly instead — same security, no dead
  dependency in the middle.

## Connecting the frontend
In `src/services/api.ts`, replace the mock functions with `fetch()` calls to
these endpoints (base URL from an env var, e.g. `VITE_API_URL`):

| Frontend function | Endpoint |
|---|---|
| `parseResume` | `POST /api/resumes/parse` (multipart file upload) |
| `getResumeVersions` | `GET /api/resumes` |
| `saveResume` | `PUT /api/resumes/{id}` |
| `analyzeJobMatch` | `POST /api/match` |
| `getGapAnalysis` | `POST /api/gap-analysis` (body: `{resumeId, targetRole?}`) |
| `generateContent` | `POST /api/content` (body: `{type, role, tone, resumeId?, jdText?}`) |
| `getInterviewQA` | `GET /api/interview/questions?role=...&resumeId=...` |
| `sendInterviewAnswer` | `POST /api/interview/answer` (body: `{questionId, answer}`) |
| `getApplications` | `GET /api/applications` |
| `addApplication` | `POST /api/applications` |
| (full edit) | `PUT /api/applications/{id}` |
| `updateApplicationStatus` | `PATCH /api/applications/{id}/status` (body: `{status}`) — backs the Kanban drag-and-drop |
| `deleteApplication` | `DELETE /api/applications/{id}` |
| `simulateNegotiation` | `POST /api/negotiate` (body: `{message, currentOffer, startingOffer?}`) |
| (optional, for reports) | `GET /api/analytics/summary` |

**Voice mode needs zero backend changes** — the frontend's `SpeechRecognition`
already converts mic audio to text client-side before it ever reaches
`userAnswer`, so `sendInterviewAnswer` receives plain text either way.

## Telegram bot setup (free, no paid tier)
1. Message **@BotFather** on Telegram → `/newbot` → get your token instantly
2. Put the token in `TELEGRAM_BOT_TOKEN`, the bot's username in `TELEGRAM_BOT_USERNAME`
3. After deploying, register the webhook once:
   ```
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-backend.onrender.com/api/telegram/webhook"
   ```
4. In the frontend, add a "Connect Telegram" button that calls `GET /api/telegram/link`
   and opens the returned `botDeepLink` — user taps Start in Telegram, done.
5. Generate a random `CRON_SECRET`, set it in Render's env vars AND as a GitHub repo
   secret (Settings → Secrets → Actions → `CRON_SECRET`) so `.github/workflows/daily-reminders.yml`
   can trigger the sweep. Also update `your-backend.onrender.com` in that file to your real URL.

All routes except `/api/auth/*` and `/health` require `Authorization: Bearer <token>`.

## Why these choices (free-tier reasoning)
- **No Celery/Redis** — resume parsing is a 2-5 second job, handled synchronously
  within the request. Add Celery only once volume actually requires it.
- **No ChromaDB** — pgvector lives inside the same Neon Postgres you're already
  using, so there's no second database service to host or pay for.
- **Groq for text generation, Gemini only for embeddings** — splits load across
  two separate free-tier quotas instead of hammering one.
- **Rule-based ATS scoring** — `score_resume()` doesn't call the LLM at all,
  saving Groq's daily request quota for the parsing/matching calls that need it.

## Everything is built — what's left is wiring, not building
There's no Module 10 pending. What remains is mechanical:
1. Replace the mock functions in `src/services/api.ts` with real `fetch()` calls to
   the endpoints in the table above (base URL from `VITE_API_URL`)
2. Set up Neon, Groq, Gemini, and Telegram accounts (all free — see setup sections above)
3. Deploy backend to Render, frontend to Vercel
4. Update the two GitHub Actions workflow files with your real Render URL and `CRON_SECRET`

Ship Phase 1 (Auth + Resume + JD Matching) first and confirm it works end-to-end in
production before wiring the rest — catching a deploy issue with 3 modules live is a
lot easier to debug than with all 9.
