# rules/testing-and-done.md
Job: how the agent checks its work and when a change counts as done.

## Commands (the human fills these)
Check | Command | Needs a database
--- | --- | ---
Lint | OPEN | OPEN
Type check | OPEN | OPEN
Build | OPEN | OPEN
Test | OPEN | OPEN

## Rules
1. Do not guess a command. If a row says OPEN, say so in the response. Why (reading): the PRD gives no commands.
2. Derive tests from the acceptance criteria and edge cases of the FR you are changing. Do not copy the criteria into this file or into code comments. Why (reading): the PRD owns them, and a copy drifts.
3. Use fixed sample data in tests. Why (reading): results must repeat.
4. Never delete or weaken a test to make it pass. If a test looks wrong, ask the human. Why (reading): a weakened test hides a real fault.
5. Take each NFR pass mark from PRD section 6.5. This file holds none. Why (reading): one place per value.
6. A change is done when the FR acceptance criteria are met, each with a test or a stated reason there is none, and the commands above ran and passed, or the response says which did not run and why. Why (reading): "done" must be checkable.

## Checks only the human can run (never claim these done)
- NFR-04: the test with two accounts before launch.
- NFR-01 and NFR-02: they need a phone on a 4G connection and real browsers.
- The six pre-build checks (PRD 5.4).
- The weekly G2 audit of random items.
Why (reading): they need a database, real devices, real people or outside services.

## Open (PRD silent)
- The commands and the test framework.
- Whether any automated pipeline exists.
