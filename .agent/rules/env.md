# rules/env.md
Job: how configuration and secrets reach the app. This file holds names and handling rules. It never holds values.

## Rules
1. List every environment variable the app reads in the table below. Why (reading): AGENTS.md may not hold names, so an unlisted name would be a guess.
2. Only the human adds a row. If code needs a variable that is not listed, stop and ask. Why (reading): a guessed name fails silently at setup.
3. Mark each variable secret or public. A variable is public only when the human marks it public. Why (reading): a public value can be read by anyone who uses the app.
4. Never put a value in code, logs, test output, chat replies or commits. Why (reading): the free tier keys and the data behind them must stay private.
5. Keep an example file with names and empty values. Why (reading): the human and the agent can see which names are needed without seeing a secret.
6. Never print a real value. To learn whether one is set, ask the human. Why (reading): printing is a common way a key leaks.

## Variables
Name | Used for | Secret or public | Set where
--- | --- | --- | ---
OPEN | OPEN | OPEN | OPEN

## Known needs, no names yet
- AI provider access for Gemini free tier (FR-01, FR-17).
- Database connection (stack).
- Email sending (FR-01, FR-13).
- Google sign-in (FR-01).
- Protection for the hourly job (PRD 6.3, rule 15).

## Open (PRD silent)
- The variable names. The human provides them.
