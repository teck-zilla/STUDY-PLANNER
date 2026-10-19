# rules/database-safety.md
Job: what the agent may and may not run or write around PostgreSQL and Prisma. The schema itself is in rules/data-model.md.

## Rules
1. Never run a command that connects to a database. Why (reading): the agent must not read or change student data.
2. Forbidden by name [VERIFY against the installed Prisma version]: migrate dev, migrate deploy, migrate reset, db push, db pull, db execute, db seed, studio. Also any database client such as psql, and any raw SQL run. Why (reading): each connects to the database or changes tables.
3. Allowed because they do not connect [VERIFY]: generate, format, validate. Why (reading): they read the schema file only.
4. Edit schema and migration files only when the human names the file. Why (reading): a migration can drop data when the human runs it.
5. Never write a migration that drops or renames a table or column without the human's written approval in this session. Written approval is a message from the human that names the table or column and the word drop or rename. Why (reading): that change loses data.
6. Do not add scripts, install hooks, build steps or startup code that change the database structure or delete data on their own. Why (reading): they run whenever the human installs or starts the app.
7. App code that deletes a student's data when that student asks is allowed. Why (PRD): deletion is a required feature (FR-14).
8. Write tests that need no database. Ask the human before any test that connects to one. Why (reading): a test could touch real data.
9. Do not start the dev server unless the human says the connected database is safe. Safe means the human states in this session that it holds no real student data and may be reset. Why (reading): pages that use the database connect when they load.
10. To have a database command run, ask the human with: the exact command, what it changes, whether data can be lost, and what to paste back. Why (reading): the human decides with full information.

## Open (PRD silent)
- Which database environments exist, for example development and production.
