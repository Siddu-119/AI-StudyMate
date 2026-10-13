# AI StudyMate

An AI-powered student assistant built for the **BharatCode Build League**. It helps students understand difficult topics, generate quizzes, plan study tasks, and keep notes in one place.

This repository already contains the complete frontend and backend. You do not need to create extra source files to run it.

## Problem and users

Students bounce between chatbots, notebooks, calendars, and random quiz sites. AI StudyMate keeps explanation, practice, planning, and notes in one dashboard for school and college students preparing for exams.

## What you get

- Student dashboard with greeting, statistics, progress, activity, and quick actions
- AI Study Assistant for physics, mathematics, electronics, computer science, programming, and other subjects
- Quiz generator (multiple choice, scoring, explanations, retry)
- Study planner (add, edit, delete, complete; subject, due date, priority)
- Notes (create, edit, delete, search)
- Settings with light / dark / system theme
- Local browser storage so tasks, notes, and preferences survive a refresh
- Express backend prepared for the official BharatCode Model API
- **Demo Mode** when no API key is configured (clearly labelled in the app)

Demo Mode includes dedicated study articles for common topics such as Ohm's Law (`V = I × R`), Newton's laws, Kirchhoff's laws, binary search, SQL joins, the quadratic formula, and others. Unmatched topics stay labelled as demo outlines, not as live model answers.

## Official BharatCode API (do not invent these)

From [BharatCode Build docs](https://bharatcode.ai/build):

| Item | Value |
| --- | --- |
| Base URL | `https://bharatcode.ai/api/model/v1` |
| Auth | `Authorization: Bearer <BHARATCODE_API_KEY>` |
| Key | Server environment variable only |
| Default model | `qwen-3.8-27b` |
| Pro model | `deepseek-v4.1-flash` (Pro only; not used by default) |
| List models | `GET /models` |
| Generate | `POST /chat/completions` with `model` and `messages` |

Get a developer key from [https://bharatcode.ai/account](https://bharatcode.ai/account). **Never put the key in frontend code, `BharatCode.txt`, or GitHub.**

Until a real key is in `server/.env`, explanations and quizzes run in **Demo Mode**. Demo Mode is local study content. It is not a live BharatCode model call.

Live generation is only claimed after a real key is added and a request to the official API succeeds. That live path was **not** claimed as tested in this workspace, because no personal API key was used here.

## Folder layout

```
AI-StudyMate/
  BharatCode.txt      hackathon project description (no secrets)
  README.md
  .env.example
  .gitignore
  package.json        runs frontend + backend together
  client/             React + Vite app
  server/             Node.js + Express API
```

## Technology stack

- React 18, React Router, Vite
- Express, CORS, dotenv
- BharatCode Model API when `BHARATCODE_API_KEY` is set
- Browser `localStorage` for notes, planner, settings, and quiz history

## Windows: run it locally

Use **PowerShell** or **Command Prompt**. Install [Node.js LTS](https://nodejs.org/) first (includes `npm`).

1. Open the project folder:

```powershell
cd D:\diploma\Projects\AI-StudyMate
```

2. Install dependencies (root, server, and client):

```powershell
npm run setup
```

If `npm run setup` fails, run these three installs yourself:

```powershell
npm install
cd server
npm install
cd ..\client
npm install
cd ..
```

3. Create the server env file (Demo Mode works with an empty key):

```powershell
copy .env.example server\.env
```

4. Start frontend and backend together:

```powershell
npm run dev
```

5. Open the app:

- Website: http://localhost:5173
- Backend health: http://localhost:5000/api/health
- AI status: http://localhost:5000/api/ai/status

Leave the terminal open while you use the app. Stop it with `Ctrl+C`.

To start the two parts in separate terminals instead:

```powershell
cd D:\diploma\Projects\AI-StudyMate\server
npm run dev
```

```powershell
cd D:\diploma\Projects\AI-StudyMate\client
npm run dev
```

### Port already in use (`EADDRINUSE`)

The backend listens on `PORT` from `server/.env` (default **5000**). If that port is taken, the server prints a diagnostic and exits. It does **not** kill other programs.

1. Set a free port in `server\.env`, for example `PORT=5001`.
2. Create `client\.env` from `client\.env.example` and set `VITE_API_URL=http://localhost:5001`.
3. Restart both the backend and the frontend so the Vite proxy matches.

## How to test (beginner checklist)

1. Dashboard loads with a greeting, stats, and quick-action buttons.
2. Sidebar opens every page: Dashboard, AI Assistant, Quiz, Planner, Notes, Settings.
3. On a phone-width window, the menu button opens navigation. Escape closes it.
4. Theme button in the top bar switches light and dark. Settings can also set System.
5. Assistant: leave topic empty and click **Explain** — you should see a validation message.
6. Assistant: enter `Explain Ohm's Law`. You should see **V = I × R** and a **Demo Mode** badge unless a real key is configured.
7. Use a suggested follow-up chip (for example resistance doubling) or type your own question.
8. Quiz: generate questions on Ohm's Law, pick answers, check score, read explanations, retry, then create a new quiz.
9. Planner: add a task, edit it, mark it complete, delete it. Refresh the page — it should still be there (unless deleted).
10. Notes: create a note, search for a word in it, edit it, delete it.
11. Settings: change your display name, save preferences, restore sample data, or clear local data.
12. Stop the backend and retry Explain — you should see a connection error and a Retry button.

## Turn on the real BharatCode model later

This was **not** claimed as a tested live integration in this build, because no personal API key was added.

When you have a key:

1. Open `server\.env` in a text editor.
2. Set:

```
BHARATCODE_API_KEY=your_real_key_here
BHARATCODE_BASE_URL=https://bharatcode.ai/api/model/v1
BHARATCODE_MODEL=qwen-3.8-27b
```

3. Save the file, restart `npm run dev`, refresh the browser.
4. The sidebar should say **Live BharatCode API** if the server sees the key.
5. Generate an explanation. If the official API accepts your account, you will get a live answer. If the API returns an error (wrong key, no student/Lite/Pro access, busy 503, rate limit 429), the app shows that error instead of pretending Demo Mode is live.

## Demo-mode limitations

- Dedicated articles cover a set of common class topics. Other wording gets a labelled subject outline, not a live model.
- Quizzes for unmatched topics are general checks plus a reminder to use the textbook or a live key.
- Notes and planner never use the model API; they stay in this browser.

## Upload to a public GitHub repository

Do this only after you can run the app locally. **Do not upload `server/.env`.** `.gitignore` already ignores `.env` files.

In PowerShell, from the project folder:

```powershell
cd D:\diploma\Projects\AI-StudyMate
git init
git add .
git status
```

Confirm `.env` is **not** listed. Then:

```powershell
git commit -m "Add AI StudyMate BharatCode Build League project"
git branch -M main
```

Create an empty **public** repository on GitHub named whatever you like (for example `AI-StudyMate`), then:

```powershell
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Check that the public repo root contains `BharatCode.txt`. Submit that GitHub URL on the [BharatCode Build League](https://bharatcode.ai/hackathon) page.

Applications close **25 October 2026, 11:59 PM IST** according to the official hackathon page.

If Git asks you to sign in, use GitHub login or a personal access token. Never paste your BharatCode API key into the repository, issues, or the `BharatCode.txt` file.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run setup` | Installs root, server, and client packages |
| `npm run dev` | Starts API (default port 5000) and Vite on port 5173 |
| `npm run dev:server` | Backend only |
| `npm run dev:client` | Frontend only |
| `npm run build` | Production build of the React client |

## Screenshots

Add screenshots here after you run the app locally (dashboard, assistant with Ohm's Law, quiz results, planner, notes, dark theme).

## Licence

Built as a student hackathon project. Use and modify for learning and the BharatCode Build League.
