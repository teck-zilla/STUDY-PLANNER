# rules/project-structure.md
Job: where code lives and what it is called. Only the human fills this file.

## Rules
1. The agent never fills the tables below and never creates top-level folders. Why (reading): AGENTS.md says the PRD and the project context do not decide the layout.
2. Each kind of code has one place and one naming style. Fix mixed placements, do not copy them. Why (reading): one place per kind keeps code checkable against the rules files.
3. When the tables are filled, the human points the AGENTS.md Folder map here. Why (reading): AGENTS.md keeps the map minimal.

## Decisions
Item | Decision
--- | ---
Next.js router type | OPEN
Source root folder | OPEN
Package manager | OPEN
File naming style | OPEN

## Where each kind of code lives (kinds taken from the PRD)
Kind of code | Location
--- | ---
Screens: sign-up and consent, exams, notes upload, topic edit, today's plan, quiz, due cards, readiness, weekly note, settings, exam result entry | OPEN
Plan rules (PRD 6.3) | OPEN
Card ladder and readiness (FR-08, FR-09) | OPEN
AI calls | OPEN
Background jobs: note processing, generation queue, hourly job | OPEN
Email and in-app messages (FR-13) | OPEN
Database access | OPEN
Tests | OPEN
