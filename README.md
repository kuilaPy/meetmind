# MeetMind — AI Meeting Assistant

MeetMind turns meeting transcripts into structured, evidence-backed meeting records:
summary, confirmed decisions, action items, owners, deadlines, open questions and follow-ups.

## Stack
- Backend: Ruby on Rails 7 API, PostgreSQL, OpenAI Ruby SDK
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Tests: RSpec (request/service specs), Vitest (UI tests)
- Local orchestration: Docker Compose

## Key product rule: discussion is not commitment
MeetMind asks the model to classify each extracted item and attach transcript evidence.
- `discussion`: an idea or topic was discussed, but no agreement or assignment is explicit.
- `decision`: participants explicitly agreed, approved, selected or committed to a course of action.
- `action_item`: a person explicitly accepted or was assigned a task.
- Unknown owners/deadlines stay `null`; the model must not infer them.
- Proposed dates are not confirmed deadlines unless accepted in the transcript.
- Every decision/action must include a verbatim evidence quote and source speaker when available.

The backend validates JSON against a strict schema and performs deterministic checks for missing evidence,
invalid statuses and unsupported owner/deadline values. AI output is a draft for human review, not an
authoritative record.

## Quick start (Docker)
1. Copy environment file: `cp .env.example .env`
2. Add your `OPENAI_API_KEY` to `.env`.
3. Run: `docker compose up --build`
4. Frontend: http://localhost:5173
5. Backend health: http://localhost:3000/up

The first boot creates the database and runs migrations.

## Local development
### Backend
```bash
cd backend
bundle install
cp .env.example .env
bin/rails db:prepare
bin/rails server -p 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Set `VITE_API_URL=http://localhost:3000` in `frontend/.env.local` if needed.

## API
`POST /api/v1/meetings/analyze`

Request:
```json
{
  "title": "Q4 Sales Planning",
  "transcript": "Rahul: I will prepare the report by Friday..."
}
```

Response: a persisted meeting containing `analysis` with the schema in `schemas/meeting_output.schema.json`.

`GET /api/v1/meetings` lists recent meetings.
`GET /api/v1/meetings/:id` returns one meeting.

If `OPENAI_API_KEY` is absent, the API returns a clear configuration error. The application does not silently
pretend a mock result is AI-generated.

## Prompt iterations
See [`prompts/`](prompts/):
- v1: baseline extraction prompt; vulnerable to treating ideas as decisions.
- v2: adds explicit classification rules and null handling.
- v3: adds evidence quotes, speaker attribution, date normalization constraints and output-only JSON.
The backend uses v3.

## Sample dataset
Five realistic transcripts are in `datasets/transcripts/`. They intentionally cover:
1. Explicit decisions and assignments.
2. Ideas discussed but not decided.
3. Ambiguous owner and proposed deadline.
4. Multiple owners, dependencies and unresolved questions.
5. A meeting with no action items.

## Testing
Backend:
```bash
cd backend
bundle exec rspec
```
Frontend:
```bash
cd frontend
npm test
```

## Evaluation
Run the deterministic evaluation harness against a saved JSON analysis:
```bash
cd backend
ANALYSIS_FILE=../evaluation/fixtures/sample_analysis.json ruby script/evaluate.rb
```
It reports precision/recall/F1 for decisions and action items against a small gold fixture, plus owner/deadline exact-match rates.
The fixture is illustrative; replace or expand it with human-reviewed annotations before making performance claims.
See [`evaluation/README.md`](evaluation/README.md).

## Security and operational notes
- Keep API keys in environment variables; never expose them to the browser.
- Add authentication, authorization, rate limiting, retention controls and audit logging before production use.
- Treat transcripts as confidential personal/business data. Obtain appropriate consent and configure data retention.
- Model output is untrusted input. Validate it server-side and require human review before distributing minutes.
- The app currently supports pasted transcript text. File upload, diarization, calendar integration and exports are future enhancements.

## Screenshots / demo
No screenshots or hosted demo are included in this source bundle. Run the app locally and capture the dashboard and analysis result for submission; deploy the containers to your preferred host to create a live URL.
