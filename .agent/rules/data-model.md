# rules/data-model.md
Job: what the database must hold. The vector table is in rules/vector-store.md. Deletion behavior is defined in AGENTS.md.
PRD section 8 is not written. The schema is OPEN.

## Records version one must capture (PRD 5.3)
ID | Record | Fields
--- | --- | ---
R1 | Answers | question, topic, right or wrong, seconds taken, time of day, confidence 1 to 3, set
R2 | Card reviews | card, topic, Got it or Missed it, time, ladder step before and after
R3 | Sessions | start, end, timer used or not, weekday or weekend
R4 | Plan items | day, topic, type, planned count, done count, minutes, reason
R5 | Overrides and plan changes | type, topic, day, reason chip (may be empty), app note
R6 | Flags | item, reason, note version
R7 | Messages | channel, type, sent time, response within 48 hours, open signal (yes, no or unknown)
R8 | Exams and results | exam date, result type, result value, date entered
R9 | Generation records | for every card and question: model name, prompt version, note version, time made

## The schema must support (each from the PRD)
- Exam status: upcoming, done or removed. One exam is one subject. A note belongs to one exam. A topic belongs to one exam (PRD 6.0).
- Note versions, and a stored passage on every card and question (FR-05, FR-07).
- A card ladder step, an archive status, and a "possibly outdated" mark (FR-05, FR-08).
- Note job states: queued, reading, ready, failed (FR-03).
- Plan item types: card review block, new cards block, question set. Each stores count, minutes and reason (PRD 6.0).
- Profile settings: weekday cap, weekend cap, quiet hours, reminder time, time zone (FR-01).

## Rules
1. Write no schema until the human provides it or names the file. Why (reading): PRD section 8 is not written.
2. The schema must allow both deletions defined in AGENTS.md. A note deletion removes wording but keeps the numeric rows. An account deletion removes every row in one transaction. Why (PRD): FR-14.
3. Choose delete behavior in the schema only after the human approves it. Why (reading): a wrong cascade can wipe numbers that must stay.

## Open (PRD silent, ask the human)
- The schema and its indexes.
- Does a topic name stay after its note is deleted? It may come from the notes.
- How a card's wording is removed while its id stays for R1 and R2.
- Is a consent record stored, with a time?
- Is the weekly note stored or built when read?
- Where the app note on an override is stored.
