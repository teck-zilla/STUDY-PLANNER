# STUDY-PLANNER

> A mobile-friendly web app that turns a student's own notes and exam dates into a focused, deterministic daily study plan with grounded flashcards and practice quizzes.

---

## 📌 Product Summary

**StudyPlanner** is designed for university students (aged 18+) preparing for written exams in English. Students enter upcoming exam dates and upload study notes (as pasted text or text-based PDFs). The app proposes editable topics, extracts grounded flashcards and multiple-choice questions (MCQs), and schedules study tasks using deterministic plan rules without relying on AI for scheduling.

### What Makes It Different

- **Grounded in Student Notes**: Every flashcard and quiz question strictly traces back to a verified passage of the student's own notes, marked with: *"Based on your notes. Check your course materials if unsure."*
- **Reorders by Evidence**: Topics move up based on wrong answers, staleness, and exam proximity—not subjective checkmarks.
- **Shrinks Instead of Piling Up**: Missed days drop low-value work and explain why, preventing overwhelming backlogs while keeping due cards active.
- **Unified Daily Plan**: Flashcards, quizzes, daily targets, and focus timers are integrated into a single cohesive plan screen, not separate siloed tools.

---

## 🚀 Key Features

### The Five Core Features
| Feature | PRD ID | Description |
|---|---|---|
| **Today's Plan** | **FR-06** | Displays today's planned items (card reviews, new cards, quiz sets) tailored to weekday/weekend minute caps and dynamic daily targets, plus reasons for any dropped items. |
| **Topic Quiz** | **FR-07** | 5-question multiple-choice quizzes with 4 options each. Distractors follow strict variation rules. Students rate confidence (1–3) before seeing results and source passages. |
| **Due Cards** | **FR-08** | Spaced repetition card reviews using a fixed ladder (1, 3, 7, 14, 30 days) capped by the exam date. Self-rated as *"Got it"* or *"Missed it"*. |
| **Topic Readiness** | **FR-09** | Computes readiness bands (*"At risk"*, *"Building"*, *"Ready"*) based on recent quiz accuracy and a recency decay factor. |
| **Weekly Note** | **FR-10** | In-app weekly digest highlighting the 3 weakest topics, total minutes studied, and a single rule-based proposed plan adjustment. |

### Supporting Capabilities
- **Notes & Topic Proposal (FR-01 – FR-05)**: Upload pasted text (up to 20,000 characters) or text-based PDFs (up to 10 MB / 50 pages). Topic lists (3–20 topics) are editable before card generation.
- **Note Versioning & Reconciliation (FR-05)**: Edit notes without losing card history; passage reconciliation automatically matches retained text (0.90 similarity threshold) or flags cards as *"possibly outdated"*.
- **Student Overrides & Focus Timer (FR-11, FR-12)**: Pin topics, mark topics as *"already know it"* or *"skip"*, lock days, or run 25/5 min Pomodoro sessions tracked via a 30-second activity heartbeat.
- **Quiet Ladder Notifications (FR-13)**: Non-nagging reminder cadence (quiet on day 1, gentle prompt on day 2, shrink offer on day 4, automatic pause on day 7) respecting quiet hours (22:00–08:00) with a 3 email/week ceiling.
- **Flagging & Privacy (FR-14, FR-15, NFR-04, NFR-06)**: One-tap flagging hides questionable items immediately. Email is the only personal data stored. Notes are strictly private and never shared. Accounts and notes can be deleted with full data purge in a single transaction.
- **Exam Results & R1–R9 Telemetry (FR-16, R1–R9)**: Post-exam study summary reporting; structured collection of 9 telemetry datasets (answers, reviews, sessions, plan items, overrides, flags, messages, results, generation metadata).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (TypeScript)
- **Database & ORM**: PostgreSQL with [Prisma](https://www.prisma.io/) & `pgvector`
- **AI Engine**: Gemini Free Tier (strictly bounded to flashcard and MCQ extraction from student notes)
- **Design & UI**: Mobile-first, responsive web application adhering to WCAG 2.2 AA accessibility standards

---

## 📁 Repository Structure

```
├── AGENTS.md                      # Codebase rules, agent safety boundaries & constraints
├── STUDY-PLANNER_PRD_revised.md   # Product Requirements Document (PRD v1.0, sections 1–6)
├── README.md                      # Project overview and app summary
├── .agent/
│   ├── rules/                     # Detailed architectural, scheduling, and safety specifications
│   │   ├── ai-pipeline.md         # AI prompt boundaries, distractor rules, and grounding checks
│   │   ├── data-model.md          # Prisma schema conventions and R1–R9 telemetry definitions
│   │   ├── database-safety.md     # Safe DB practices (no unreviewed drops/migrations)
│   │   ├── decisions.md           # Core architectural choices and tech stack locking
│   │   ├── env.md                 # Environment variable specifications
│   │   ├── limits-and-defaults.md # Caps, quiet hours, age verification, and file limits
│   │   ├── notifications.md       # Quiet notification ladder and messaging windows
│   │   ├── plan-rules.md          # 15 deterministic scheduling rules and scoring equations
│   │   ├── project-structure.md   # Code layout conventions
│   │   ├── testing-and-done.md    # Definition of Done and testing protocols
│   │   └── vector-store.md        # Chunking rules and vector embedding specifications
│   └── skills/                    # Operational workflow skills for coding agents
│       ├── execute-daily-plan-scheduler/
│       ├── implement-feature-increment/
│       ├── reconcile-note-version/
│       └── run-ai-generation-pipeline/
└── ... legacy prototype files (app.js, index.html, styles.css)
```

---

## 📖 Key PRD Metrics & Targets

| Metric | Target | Description |
|---|---|---|
| **Retention (G1)** | ≥ 40% | Students active on days 15–21 post-onboarding |
| **Content Trust (G2)** | ≥ 95% audit pass, < 3% flag rate | Groundedness in student notes and factual correctness |
| **Topic Coverage (G3)** | ≥ 90% | Non-skipped topics reviewed in the 14 days before exam |
| **Knowledge Retention (G4)** | ≥ 70% | Correct responses on questions repeated ≥ 7 days apart |
| **Data Completeness (G5)** | 100% | R1–R9 telemetry completeness for version two modeling |
