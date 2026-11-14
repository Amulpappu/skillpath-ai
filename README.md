# SkillPath AI

An AI-powered learning platform that understands a learner's skills, finds the gaps for a target career, and builds a personalised roadmap that adapts as they progress. Built for **PromptWars × Rathinam Technical Campus** (Google for Developers and Hack2skill).

## The problem

Universities and organisations struggle to see which skills a learner lacks for their career goal, and most learning platforms give everyone the same courses.

## The solution

Five specialised AI agents work as a pipeline. Each one receives the previous agent's output, and the hand-offs are shown live in the **Agent activity** panel.

| Agent | Job | Hands off to |
|---|---|---|
| Skill Analyst | Finds strengths and weaknesses from skills, certifications and projects | Career Matcher |
| Career Matcher | Lists what the target role needs and compares it with the learner | Learning Planner |
| Learning Planner | Orders the gaps into a weekly roadmap with courses, tutorials and exercises | AI Mentor |
| Assessment Agent | Writes a five-question quiz per step and evaluates the result | AI Mentor |
| AI Mentor | Reads every agent's output, guides the learner and triggers re-planning | Learner |

### It adapts

- **Weak assessment** (below 60%): the Assessment Agent flags the skill, the Learning Planner inserts a revision step before it, and the Mentor explains the change.
- **Career goal change**: the whole pipeline runs again for the new role. Skills already completed still count.

## Features mapped to the problem statement

| Expected feature | Where it is |
|---|---|
| User profile | Profile form: name, skills with levels, certifications, projects, career goal |
| Skill analysis | Strengths and weaknesses card (Skill Analyst) |
| Career matching | Match percentage and required-skill status (Career Matcher) |
| Learning recommendations | Roadmap with course, tutorial and practice exercise per skill |
| Progress tracking | Steps completed, match at start vs now, assessment history |
| AI mentor | Mentor card, updated after every analysis, quiz and goal change |
| Agentic AI | `src/lib/agents`, orchestrated in `mentor.ts`, streamed to the UI |

Try it with **Load sample learner**: Python, SQL and basic HTML, aiming for Full Stack Developer.

## Google services

- **Gemini API** (`@google/genai`) powers all five agents with JSON output. Calls are made only on the server.

## Design decisions

- **Reliable by design.** Each agent has a deterministic rule engine. If Gemini is unavailable or returns invalid JSON, the agent falls back and the log labels the answer "rule engine" instead of "Gemini".
- **No invented links.** Resource URLs come from a curated catalog in `src/lib/catalog.ts`. The model chooses order, goals and exercises, never URLs.
- **Reproducible scores.** The match percentage and quiz grades are computed in code (`src/lib/scoring.ts`), not by the model.

## Security

- The API key lives in an environment variable and is never sent to the browser (`server-only`).
- Every request is validated with Zod, size-limited and rate-limited (`src/lib/request.ts`).
- Learner text is sanitised and passed to the model as delimited data, with instructions to ignore any commands inside it.
- Model output is schema-validated before use. Security headers are set in `next.config.ts`.

## Accessibility

Semantic landmarks and headings, a skip link, labelled form controls, keyboard-operable quizzes built from fieldsets and radio inputs, a live region for agent activity, visible focus rings, status shown in text as well as colour, and reduced-motion support.

## Tech stack

Next.js (App Router), React, TypeScript, Tailwind CSS, Gemini API, Zod, Vitest. Deployed on Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # then add your GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000.

## Tests

```bash
npm test
```

37 tests cover scoring, the skill catalog, each agent's rule engine, the full agent pipelines (analysis, goal change, weak assessment), request validation and rate limiting.

## Project structure

```
src/app            page, layout and API routes (analyze, quiz, adapt)
src/components     profile form, agent log, match card, roadmap, quiz, progress
src/lib/agents     the five agents and the orchestration pipelines
src/lib            catalog, scoring, validation, Gemini client, streaming, rate limit
tests              unit and pipeline tests
```

## Live demo

Add your deployed link here.
