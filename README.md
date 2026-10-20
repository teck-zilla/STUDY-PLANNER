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

## 🔐 Authentication Protocol & Implementation Roadmap (FR-01)

The authentication system is designed around minimal PII collection, passwordless security, and strict data isolation per [STUDY-PLANNER_PRD_revised.md](STUDY-PLANNER_PRD_revised.md) (FR-01, NFR-04, NFR-06) and [AGENTS.md](AGENTS.md).

### Core Protocol Requirements
- **Primary Method**: One-time email magic link (passwordless, secure, ephemeral token).
- **Secondary Method**: Google OAuth sign-in (PRD Assumption A10: provides an immediate fallback to prevent lockout if email delivery fails or is delayed).
- **Privacy Minimization (NFR-06)**: Email is the **only personal detail collected**. No names, passwords, phone numbers, or dates of birth.
- **Mandatory Gates (FR-01)**:
  - Age confirmation: *"I am 18 or over"* checkbox (submitting without this stops with a plain message).
  - AI data consent: Consent checkbox agreeing that note text is sent to the named AI provider (Gemini free tier) to generate cards and questions.
- **Rate-Limiting & UX**: 60-second cooldown on magic link resends; explicit spam checking guidance; 15-minute token expiry with a *"send a new link"* action.
- **Data Scoping (NFR-04)**: Every student session and database query strictly filters by `studentId`.

### Step-by-Step Implementation Procedure

1. **Prerequisites & Tooling Decisions (Human Gate)**
   - Record approved **Login Library** in `.agent/rules/decisions.md` (e.g., Auth.js / NextAuth with Prisma adapter [VERIFY]).
   - Record approved **Email Provider** in `.agent/rules/decisions.md` (e.g., Resend free tier [VERIFY]).
   - Register environment variables in `.agent/rules/env.md` (`AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, email credentials).

2. **Database Schema & Student Model (Prisma)**
   - Model the `Student` entity holding only `id`, `email`, default study caps (weekday 60m, weekend 120m), quiet hours (`22:00`–`08:00`), reminder time (`18:00`), time zone (`Europe/London`), and consent timestamps (`ageConfirmedAt`, `aiConsentGivenAt`).
   - Define auth adapter tables (`VerificationToken`, `Session`, `Account`).

3. **Passwordless Magic Link Engine**
   - Create the email dispatch endpoint with single-use cryptographically secure tokens.
   - Implement client and server 60-second resend rate-limiting.
   - Build token verification logic issuing HTTP-only session cookies on success.

4. **Google OAuth Secondary Path**
   - Configure Google OAuth provider.
   - Map profile callback to extract **only** the verified email, discarding names, avatars, and extraneous profile claims to preserve NFR-06 compliance.

5. **Sign-up & Consent UI Gates**
   - Build sign-in/sign-up page featuring the plain-English privacy notice.
   - Embed mandatory `"I am 18 or over"` and AI provider consent checkboxes with neutral, blocking validation messages.
   - Provide email magic link form with 60-second resend timer, spam tips, and Google sign-in fallback button.

6. **Session Middleware & Tenant Isolation (NFR-04)**
   - Add Next.js server middleware to validate active sessions and extract `studentId`.
   - Ensure all data access layer operations filter strictly by `studentId`.

7. **Onboarding Flow & Default Settings**
   - Check exam count upon initial authentication: redirect students with 0 exams to `"Add an Exam"` (FR-01, FR-02); redirect existing students to `"Today's Plan"` (FR-06).

8. **Account Deletion Integration (FR-14)**
   - Integrate single-action account deletion: purge all student data in one database transaction, invalidate active sessions, and send a final confirmation email.

9. **Verification & Multi-Account Testing**
   - Test data isolation with two accounts to confirm zero cross-tenant data leakage (NFR-04).
   - Test token expiry, 60s resend timer, spam guidance, and under-18 / consent rejection gates.

---

## 🎨 UI Revamp Process (Step by Step)

A six-phase process for revamping StudyPlanner's interface. It targets the Next.js/TypeScript application and upholds the mobile-first, WCAG 2.2 AA standard stated in the Technology Stack. Each phase is ordered so that nothing later invalidates work already done; do not skip the audit or the foundation.

### Phase 1 — Audit (no code changes)

1. Screenshot every screen: sign-up and consent, exams, notes upload, topic edit, today's plan, quiz, due cards, readiness, weekly note, settings, and exam result entry — each at 375 px, 768 px, and 1440 px. This is the before-baseline and the later regression check.
2. Catalog inconsistencies: inline style attributes, duplicated component styles, missing hover/focus/empty/loading/error states, and absent breakpoints.
3. Choose two or three reference apps for the target look, and write a one-paragraph statement: *"same content, but ___."*

### Phase 2 — Design Foundation

4. Decide and record whether the prototype's *"no CSS variables"* rule carries into the Next.js app. Log the answer in `.agent/rules/decisions.md`. Tokens are the single largest lever for consistency; lifting the rule is the recommended path.
5. Define the token set before any component code: colour palette (background, surface, border, accent, success, danger), type scale, 4/8 px spacing scale, three radii, and two or three elevation shadows.
6. Freeze the token set. Later phases consume tokens; they do not redefine them.

### Phase 3 — Component Inventory

7. List one canonical style for each shared component: navigation item, card, button, badge, input, modal, timer, countdown, and status chip.
8. Define the states every component must ship with: default, hover, focus-visible, disabled, empty, loading, and error.
9. Remove all inline style declarations; replace them with component classes or token references so nothing bypasses the system.

### Phase 4 — Responsive & Accessibility

10. Add breakpoints (suggest 640 px, 1024 px, 1280 px): collapse the sidebar into a drawer, reflow the dashboard grid, and let the header wrap without truncating the countdown.
11. Add keyboard focus rings to every interactive element, verify colour contrast meets WCAG 2.2 AA on the dark background, and confirm full keyboard navigation of each screen.

### Phase 5 — Screen-by-Screen Migration

12. Migrate one screen per commit in PRD screen order, starting with today's plan — the screen every other feature feeds.
13. Keep class names and component prop names stable. Where a rename is needed, rename and update every reference in the same commit; never split across commits.
14. Commit each migrated screen separately so any screen can be reverted without undoing the others.

### Phase 6 — Verification

15. Re-screenshot every screen at the three baseline widths and diff against the Phase 1 baselines.
16. Manually exercise the focus timer, streak badge, and exam countdown — the pieces most coupled to JavaScript state.
17. Run the lint, build, and test commands recorded in `.agent/rules/testing-and-done.md`. Those rows are currently OPEN; fill them in before Phase 1 so *"done"* is checkable.

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
