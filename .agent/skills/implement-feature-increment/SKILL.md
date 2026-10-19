---
name: implement-feature-increment
description: Execute a single, isolated functional requirement, non-functional requirement, or plan rule change following codebase safety boundaries.
---

1. Read the assigned requirement identifier and verify that the request covers exactly one functional requirement, non-functional requirement, plan rule, or setup step[cite: 1]. If it contains more than one, stop and instruct the user to separate them[cite: 1].
2. Open `AGENTS.md` and check the section "How to work in this codebase"[cite: 1].
3. Identify the target files for the change by checking `rules/project-structure.md`.
4. Inspect the planned file changes and ensure no prohibited modifications exist:
   - Do not edit schema or migration files unless explicitly named by the user[cite: 1].
   - Do not add or upgrade dependencies without explicit permission and verified free tiers[cite: 1].
   - Do not use AI for any scheduling, matching, or reason-generation logic[cite: 1, 2].
5. Implement the minimal code edits needed for the single target requirement[cite: 1].
6. Write unit tests that do not connect to a live database, push schemas, run migrations, or seed data[cite: 1].
7. Run the test suite using local commands only. Verify that all tests pass without contacting any database[cite: 1].
8. Check implementation compliance against non-functional requirements NFR-01 through NFR-06[cite: 1, 2].
9. Prepare the completion report:
   - Name the exact files changed[cite: 1].
   - State test verification status[cite: 1].
   - List any assumptions made using the `[ASSUMPTION]` tag with a one-line reason[cite: 1]. If none, output `Assumptions: none`[cite: 1].
   - List any NFRs that could not be verified in code[cite: 1].