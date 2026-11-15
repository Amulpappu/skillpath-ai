# SkillPath AI

A global, AI-powered learning, placement and job platform. Twelve specialist agents read a learner's skills, match them to roles worldwide, build a paced roadmap, test them from a verified question bank, prepare them for their dream company's hiring rounds and find open jobs.

> **v2 is on the `v2` branch.** `main` still holds the PromptWars version (below), which finished in the top 10 of 572 with an AI evaluation score of 95.99/100.

## What v2 adds

| Area | What it does |
|---|---|
| 12 agents | Profile Analyst, Career Matcher, Learning Planner, Course Curator, Question Smith, Assessment Agent, Practice Coach, Company Prep, Placement Readiness, Job Scout, Progress Tracker, AI Mentor (`src/lib/agents/registry.ts`) |
| Accounts | Sign in with Google or GitHub through Supabase Auth; Microsoft optional. Guests can use everything with progress saved in the browser |
| Database | Supabase Postgres with row-level security on every user table; question answers are readable only by the server (`supabase/migrations`) |
| Global | 12 interface languages incl. Hindi, Tamil, Telugu, Kannada, Malayalam and right-to-left Arabic; 48 roles; 100 skills incl. 28 programming languages |
| AI-era catalogue | AI Engineer, AI Agent Engineer, AI Consultant and AI Security Engineer roles; 9 AI skills (RAG, agents & MCP, evaluation, AI security…); one AI skill added to every role. Reviewed November 2026 |
| Question bank | Question Smith writes questions per syllabus topic with Gemini, a quality gate rejects weak or duplicate ones, and a blind second answer keeps only confirmed keys. Target 465+ per skill; grading happens on the server |
| Coding practice | 74 LeetCode interview problems in 12 topics, unlocked a few at a time and sized to weekly hours; reorderable topics; HackerRank warm-ups; GeeksforGeeks and CodeChef practice |
| Company prep | 14 companies with typical rounds, aptitude / English / problem-understanding tests and official careers links |
| Placement readiness | Score out of 100: core-skill quizzes 40%, practice 30%, aptitude and English 20%, profile 10% |
| Courses and labs | Learn → Try it in a lab → Practise → Quiz for every skill, with free official courses and hands-on tools (VisuAlgo, Python Tutor, Packet Tracer, Wireshark, OverTheWire, TensorFlow Playground, Wokwi…) |
| Jobs | Job Scout: live openings from Arbeitnow and Remotive (no keys) plus ready searches on LinkedIn, Indeed, Naukri, foundit and Internshala |

## Set up v2

1. Create a Supabase project and run the files in `supabase/migrations` in order.
2. Copy `.env.example` to `.env.local` and fill in `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (server only).
3. `npm install`, then `npm run dev`.
4. Grow the question bank: `npm run bank:grow` locally, or add `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as GitHub Actions secrets to run `.github/workflows/grow-question-bank.yml` every hour.

Tests: `npm test` (59 unit and pipeline tests). Every page and API was also checked end-to-end with Playwright.

---

# PromptWars version (v1)

## Chosen vertical and problem statement (PromptWars × RTC)

Organizations and universities find it difficult to identify what skills their employees or students lack and what they need to learn to achieve their career goals. Traditional learning platforms provide the same courses to everyone without considering their existing skills, learning progress or career interests.

### Challenge
Build an AI-powered learning platform that understands an individual's skills, identifies missing skills and recommends a personalised learning path to help them achieve their target career.

### Expected features and how SkillPath AI delivers them
| # | Expected feature | SkillPath AI |
|---|---|---|
| 1 | User profile: learner details, existing skills, certifications, projects, career goals | Profile form with skill picker, per-skill level, certifications, projects and 13 career roles; saved in the browser |
| 2 | Skill analysis: strengths and weaknesses from skills and assessments | Skill Analyst agent, plus quiz results that feed back into the plan |
| 3 | Career matching: compare current skills with the selected job role | Career Matcher agent: required skills marked Have / Partial / Missing and a weighted match % |
| 4 | Learning recommendations: courses, tutorials and practical exercises | Learning Planner agent: week-by-week roadmap with curated free courses, tutorials and an exercise per skill |
| 5 | Progress tracking: learning progress and assessment performance | Steps completed, match at start vs now, quiz history with scores |
| 6 | AI mentor: guidance that updates with performance | AI Mentor agent, updated after every analysis, quiz and goal change |

### Agentic AI requirement
Five specialised agents (Skill Analyst, Career Matcher, Learning Planner, Assessment Agent, AI Mentor) run as a pipeline, each using the previous agent's output; hand-offs are shown live in the Agent activity panel. Agentic AI is implemented in `src/lib/agents`, orchestrated in `mentor.ts`, and streamed to the UI. The plan adapts:
- **Poor assessment** (below 60%): the Assessment Agent flags the skill, the Learning Planner inserts a revision step and the Mentor explains the change.
- **Career goal change:** the whole pipeline re-runs for the new role, keeping skills already completed.

### Target scenario
A student wants to become a **Full Stack Developer**. Current skills: Python, SQL and basic HTML. Missing skills: JavaScript, React, Node.js. SkillPath AI identifies the gaps, builds the roadmap, recommends resources and tracks progress. Try it with **Load sample learner**.

### Expected deliverable
A working AI-powered application demonstrating personalised learning recommendations, AI agent collaboration and adaptive progress tracking. Live: https://skillpath-ai-green.vercel.app/

## Approach and how it works

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

## Assumptions

- Learners self-report their skills and levels; quiz results then validate their real level and adjust the plan.
- Role requirements come from a curated catalog of 13 entry-level career roles; roles outside the catalog use general software fundamentals, or Gemini when it is available.
- Only free, well-known learning resources are recommended. Links are curated in code, never generated by the AI model.
- A quiz score of 60% or more counts as a pass; a lower score makes the agents insert a revision step before that skill.
- Quiz level follows the learner's own level: a new skill gets a beginner quiz, a beginner skill gets an intermediate quiz, and an intermediate or advanced skill gets an advanced quiz.
- Progress is stored in the learner's browser (localStorage); no login or server database is needed for the prototype.
- If Gemini is unavailable or slow, each agent falls back to its rule engine, so the app always works and the activity log shows which engine answered.
- The app is a prototype; skill verification is based on short quizzes, not formal certification.

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

https://skillpath-ai-green.vercel.app/
