# AI StudyMate

AI StudyMate is a student study companion prepared for the **BharatCode Build League**. It brings topic explanations, quiz practice, study planning, and notes into one React application.

## Problem and intended users

Students often switch among chatbots, notebooks, calendars, and quiz sites. AI StudyMate gives school and college students one place to review a topic, practise it, plan their next session, and organise their notes.

## Features

- Dashboard with greeting, study statistics, progress, activity, and quick actions
- Topic explanations, formulas, examples, common mistakes, study tips, and follow-up questions
- Multiple-choice quiz generation, answer checking, scoring, explanations, and retry
- Planner tasks with due dates, priorities, edit, completion, and delete actions
- Notes with create, edit, delete, and text search
- Profile settings, daily study goal, light/dark/system theme, and local-data reset
- Responsive navigation and browser-local storage for study data
- Explicit, labelled offline Demo Mode using bundled sample learning content

## Technology and architecture

- React 18, React Router 6, and Vite
- Node.js 20+ and Express 4
- Google Gemini through the server-side `@google/genai` SDK
- Browser `localStorage` for notes, planner, settings, activity, and quiz history

The browser sends requests to `/api/...`. In development, Vite proxies them to Express. In production, either route `/api` to the Express service on the same origin or set the frontend build variable `VITE_API_URL` to the backend origin and allow the frontend origin in the backend's `CLIENT_ORIGIN` setting. The Gemini key is read only by the server and is never included in API status or browser responses.

## AI configuration and Demo Mode

The default configured model is `gemini-2.5-flash`, which appears in Google's [Gemini API model list](https://ai.google.dev/gemini-api/docs/models). Create a key through [Google AI Studio](https://aistudio.google.com/) and set it in `server/.env`:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AI_DEMO_MODE=false
```

Keep the key on the server. Do not put secrets in frontend `VITE_*` variables or commit `.env` files.

Demo Mode is opt-in and is **not** a live model response:

```dotenv
AI_DEMO_MODE=true
```

When enabled, the API serves clearly labelled bundled explanations, quizzes, and follow-up examples without contacting Gemini, even when a key exists. When Demo Mode is off and there is no key, AI status is `unconfigured` and generation returns an explicit configuration error; it does not fabricate success. The app does not automatically switch to demo content when live generation fails. A 429 response is not automatically retried; inspect the provider quota and retry only when appropriate. Transient failures may receive one bounded retry using provider retry guidance.

The key's validity, account access, and current quota must be checked with the account owner. A key being present does not prove live generation works.

## Windows setup and local run

Install [Node.js LTS](https://nodejs.org/) (Node.js 20 or newer), then use PowerShell:

```powershell
cd D:\diploma\Projects\AI-StudyMate
npm run setup
if (-not (Test-Path server\.env)) { Copy-Item .env.example server\.env } else { Write-Host "Keeping existing server\.env unchanged." }
```

The example explicitly enables Demo Mode, so a fresh setup works without a key. For live Gemini requests, add your own key to `server\.env` and set `AI_DEMO_MODE=false`. The setup command above does not overwrite an existing local environment file. Start both services:

```powershell
npm run dev
```

By default, the website is at `http://localhost:5173`, backend health at `http://localhost:5000/api/health`, and AI status at `http://localhost:5000/api/ai/status`.

To use two terminals instead:

```powershell
# Terminal 1
cd D:\diploma\Projects\AI-StudyMate\server
npm run dev
```

```powershell
# Terminal 2
cd D:\diploma\Projects\AI-StudyMate\client
npm run dev
```

`npm run start --prefix server` runs the backend without watch mode; `npm run dev --prefix client` runs Vite.

### Port conflicts

The backend uses `PORT` from `server/.env` (default `5000`). On `EADDRINUSE`, it reports the conflict and exits without stopping another process. Find and close the process you own, or choose a free port and set the same origin for the Vite proxy:

```dotenv
# server/.env
PORT=5001
```

```dotenv
# client/.env
VITE_API_URL=http://localhost:5001
```

Restart both services after changing either setting. The Vite configuration loads `client/.env`; do not add server credentials there.

## Checks and manual feature test

Run the available automated checks from the repository root:

```powershell
npm run build
npm run check --prefix server
npm test --prefix server
```

The backend tests start on an ephemeral port with explicitly enabled Demo Mode. They exercise health/status, empty-input validation, explanation, quiz response shape, follow-up, malformed JSON, unknown routes, and quota/retry classification. They do not call the live Gemini API.

Manual browser checks:

1. Visit `/`, `/assistant`, `/quiz`, `/planner`, `/notes`, and `/settings` directly and navigate using the sidebar.
2. On Assistant, submit an empty topic, an Ohm's Law explanation, a suggested follow-up, and an empty follow-up.
3. On Quiz, submit an empty topic, generate a demo quiz, answer all questions, check the score, retry, and start another quiz.
4. Create, edit, search, and delete a note; create, edit, complete, filter, and delete planner tasks.
5. Change theme and profile settings, refresh to check persistence, then try the local-data controls.
6. Stop the backend and verify an actionable connection error; confirm no automatic fake answer appears.
7. Test both desktop width and a phone-width viewport. At mobile width, open the menu and close it with Escape.

## Deployment readiness

The client is a static Vite build (`npm run build`, output `client/dist`); the server is a separate Node.js process and needs a Node 20+ host. Do not deploy `server/.env` as a public artifact.

- **Same-origin option:** host the static client and reverse-proxy `/api` requests to the Express service. Set backend `CLIENT_ORIGIN` to the public website origin.
- **Separate-origin option:** build the client with `VITE_API_URL=https://your-api-host.example`, and set backend `CLIENT_ORIGIN` to the exact frontend origin. The API client uses that configured origin; its production default is relative `/api`, not localhost.
- Configure `PORT`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_DEMO_MODE`, `AI_REQUEST_TIMEOUT_MS`, and `CLIENT_ORIGIN` through the backend host's environment settings. A host-provided `PORT` is honored.

This repository has not been deployed publicly. Hosting-provider free tiers, quotas, and availability change; compare current terms before choosing a host. Notes, settings, tasks, and activity remain local to each browser and are not backed up to a server.

## Known limitations

- Demo Mode uses bundled sample material; unmatched topics receive labelled general study outlines rather than live, topic-specific answers.
- Live AI depends on a valid Gemini key, provider model access, network availability, and provider quota.
- Student data is stored in browser `localStorage`; there is no account, cross-device sync, or server-side persistence.
- This project is not a BharatCode model integration; its hackathon association and submission notes are in `BharatCode.txt`.

## Screenshots

Add screenshots here before submission (for example, dashboard, explanation/demo badge, quiz results, planner, notes, and mobile navigation).

## Repository and hackathon submission

Keep `BharatCode.txt` in the repository root. Review `git status` before committing and confirm that `.env` files and credentials are not staged. Do not submit or publish until you have reviewed the repository contents and the current official [BharatCode Build League](https://bharatcode.ai/hackathon) instructions.
