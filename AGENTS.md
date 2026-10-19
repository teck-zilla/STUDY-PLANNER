# StudyPlanner

Source of truth: STUDY-PLANNER_PRD_revised.md. If this file and the PRD disagree, the PRD wins. Tell the human.
Before any task, find STUDY-PLANNER_PRD_revised.md. If you cannot find it, stop and ask for its path.
The PRD covers sections 1 to 6 only. Sections 7 to 14 are not written.

## Description
StudyPlanner is a mobile friendly web app for students preparing for written exams. The student enters exam dates and adds notes as pasted text or text based PDFs, and AI writes flashcards and multiple choice questions from those notes. Plain code builds the daily plan from scheduling rules, and the plan uses no AI.

## Who uses it
- Primary user: a student preparing for written exams. PRD persona: Amara, 19, second year nursing student.
- Secondary user: Tom, 22, final year, works part time. He tests whether the plan learns his real study times and session lengths.
- The PRD assumes university students writing exams in English. It tags this as an assumption. The age rule is in FR-01.
- Persona habits (days per week, session length, time of day) are hypotheses. Do not write them into code. Quiet hours and reminder time are PRD defaults (FR-01).
- The PRD defines no teacher, group or admin users, and no paid tiers.
- FR-17 names an admin switch that pauses all new generation. Do not build an admin user or admin screen. Ask the human where the switch is held.

## One thing that the agent must do well
Every card and question must trace to a passage of the student's own notes, and must show that passage.
- Never state a fact as correct unless it is in the student's notes (PRD section 1).
- The app checks that an item matches the notes. It cannot check that the notes are true.
- Code checks that the correct option appears in the passage (PRD Carry forward). No other automatic check is defined. Ask before adding one. Hand audits and flags are separate (G2, FR-15). Flashcards have no answer options, so the PRD defines no automatic check for them. Ask before adding one.
- Every card and question shows this line: "Based on your notes. Check your course materials if unsure."
- Each wrong option is a statement from another passage of the same topic, or the correct statement with one change: a number, a term or a negation (FR-07).
- AI writes cards and questions. It may phrase one sentence of the weekly note and may not change any number (FR-10).
- The PRD names no other AI task. Embeddings and topic proposals are not defined. Ask before using AI for them or for anything else.

## Defined Scope for the MVP
The PRD calls the MVP "version one". It contains:
- Sign in by one time email link or Google sign-in (Google is PRD assumption A10) (FR-01).
- The profile holds weekday cap, weekend cap, quiet hours, reminder time and time zone (FR-01). Add no other profile field.
- A limit on upcoming exams per student. The limit is in FR-02. Do not choose a number.
- A consent screen, an age confirmation box, and email as the only personal detail (FR-01, NFR-06). The consent is that note text goes to the AI provider named on screen. Sign-up stops with a plain message if the age box is not ticked (FR-01). The consent tick is required (FR-01).
- Notes as pasted text or text based PDFs. Editing or re-uploading creates a new version (FR-03, FR-05).
- A proposed topic list per exam that the student edits. Cards generate only after the student confirms it (FR-04). The PRD does not say how topics are proposed. Ask before building it.
- Flashcards and multiple choice questions, each with a source passage and a flag button.
- Card reviews use the fixed ladder in FR-08. Do not use SM-2 or any other card scheduling formula.
- A daily plan from plain rules, with overrides (FR-06, FR-11, PRD section 6.3).
- Readiness per topic (FR-09).
- A focus timer inside the plan screen (FR-12). Record sessions with the heartbeat. Do not rely on tab close (FR-12).
- An in-app weekly note (FR-10). No weekly note is made while the plan is paused (FR-10).
- Email and in-app messages with a quiet ladder, and a one tap pause and resume (FR-13).
- A generation queue with visible status (FR-17).
- Exam result entry after the exam, with a study summary (FR-16).
- Note deletion and account deletion (FR-14).
- Data access requests: a person answers them over email in version one. Build no feature for them.
- From session history, version one adapts only the daily target (rule 2) and the reminder time (rule 14). Topic scoring from results is in scope (rule 6).
- Capture of records R1 to R9 (see Definitions).
- One plan, not four screens. Cards, quizzes, daily target and daily schedule are one plan (PRD section 1).

The five features: FR-06 today's plan, FR-07 quiz on a topic, FR-08 due cards, FR-09 readiness per topic, FR-10 weekly note.
Goals (PRD section 3): G1 students come back, G2 generated content is trusted, G3 every topic is covered before the exam, G4 answers show retention, G5 version two data is complete. Goal definitions and targets are in PRD section 3. Use them exactly. Do not copy targets into code.

## Not in scope items for the MVP
Do not build these. Do not add placeholder code, empty tables, routes or feature toggles for them. Student flags (FR-15) are in scope. Do capture R1 to R9 in version one.
- Handwriting or photo notes.
- Memory games.
- A chat tutor.
- Groups, sharing, leaderboards, teacher dashboards or teacher views.
- A native phone app.
- Offline use.
- Payments.
- Past paper uploads.
- Languages other than English.
- Short answer questions.
- Data export screens.
- An admin user or admin screen.
- Exam board or country settings. Version one targets UK university written exams (PRD assumption A2).
- Audit screens or exports for G2 are not decided. Do not build them. Ask the human if you think one is needed.
- Non goals, not features: predicting exam results, proving that the app raises exam marks.
- Version two capabilities (PRD section 5.3): learn best study times, tune card intervals, learn which plan rules help, judge question quality across prompts, spot guessing, tune message timing, predict a pass.

## Stack
Fixed. Do not suggest alternatives.
- Next.js
- TypeScript
- Prisma
- PostgreSQL
- pgvector for vector data. The PRD does not describe its setup or what vector data holds. Run no setup command. Ask the human.
- Gemini free tier for AI calls. The PRD does not say which provider makes embeddings. Ask before building.
- Everything else must be free or free tier. No paid tools. No expiring trials.
- For every outside service you propose, state its free limits and tag them [VERIFY].
- Web app only. No native app. English only (PRD assumption A3).
- FR-01: the AI provider's free terms must say inputs are not used to train its models [VERIFY]. If they do not, the consent screen must say so plainly. Ask the human whether this is verified before writing code that sends note text.
- The PRD says no code starts until the six pre-build checks in PRD section 5.4 pass. Checks 3 and 5 need a provider call and test emails. Ask the human whether check scripts are allowed. Write no other code until all six pass. Ask once per session.

## Folder map
Only AGENTS.md is confirmed at the project root.
```
project root
  AGENTS.md                      this file
  STUDY-PLANNER_PRD_revised.md   the PRD (path not confirmed, ask the human)
  rules/                         proposed, not created yet
```
Do not create files in rules/. The human creates them. Do not fill them with values that are not in the PRD.
The PRD and the project context do not decide these. Do not decide them yourself. Ask: Next.js router type, source layout, package manager, build and test commands, hosting, login library, email sender, scheduler, embedding provider, pause switch location, PRD path, temporary storage for uploaded PDFs, PDF text extraction method, Gemini model name.
FR-03 allows a PDF to exist up to its time limit. FR-14 and Carry forward say no PDF is stored. Ask the human how the PDF reaches the job.

## How to work in this codebase
1. One change at a time. One change means one FR, one NFR, one plan rule, or one setup step the human names. Edit only the files that change needs. Report it before starting the next.
2. Stack tools means the packages needed to run Next.js, TypeScript and Prisma. Ask before adding, upgrading or removing any other package, including a Gemini client or a pgvector client. State its price from its official page and tag it [VERIFY].
3. Never touch the database. Edit schema and migration files only when the human names the file. Never write a migration that drops or renames a table or column without the human's written approval in that session. Do not add scripts, install hooks, build steps or startup code that change the database structure or delete data on their own. App code that deletes a student's data when that student asks (FR-14) is allowed. Do not run any command that connects to a database: migrate, push, seed, studio, raw SQL. Write tests that need no database. Ask the human before any test that connects to one. Do not start the dev server unless the human says the connected database is safe to use. Ask the human to run database commands.
4. List assumptions at the end of every response, tagged [ASSUMPTION], each with a one line reason. If there are none, write "Assumptions: none". Assume only names inside files you were asked to write.
5. Stop and ask when the PRD is silent about anything. Do not guess.
6. Take detailed values from the matching rules file. If a rules file and the PRD hold different values, stop and ask the human which one wins. Until a rules file exists, take each value from the PRD section that states it: an FR, an NFR, section 3, 5.3, 6.0 or 6.3. Tell the human which values you used.

Data and behavior rules from the PRD:
- Every query made for a student filters by that student's id (NFR-04). Name any job or check that reads many students to the human and get approval first.
- The only personal detail collected is email. No real name and no date of birth (NFR-06). Profile settings and the records R1 to R9 are stored.
- Notes are never shown to other students (FR-15). Note text is stored in the database and, after consent, sent to the AI provider (FR-01). Do not send it to logs, analytics or any other service.
- Delete an uploaded PDF as soon as its text is extracted, and within the FR-03 time limit even if extraction fails.
- Note job states are queued, reading, ready and failed (FR-03). Create no cards from a failed or rejected note. A low text warning is not a failure.
- Every card and question stores its model name, prompt version and note version (FR-15, R9).
- In a quiz the student picks an option, rates confidence, then sees the result. Never show the result before the rating (FR-07).
- Every plan item and every drop shows a one line reason from fixed templates. No AI writes reasons (PRD section 6.3, rule 13).
- After a missed day, overdue cards stay due and are never deleted. Only planned new card blocks and quiz sets are dropped, listed with a reason (FR-08, rule 11).
- Note update matching uses text comparison, not AI and not vectors (FR-05).
- When an exam date passes, the exam becomes done. Its topics leave the plan and its cards are no longer scheduled (FR-02).
- Deleting a note removes its text, versions, passages, chunks, vectors, and the wording of its cards and questions. It keeps results, time taken, confidence, topic and timestamps, with no note text (FR-14). Ask the human before choosing schema delete behavior.
- Deleting an account removes every row tied to the student, including vectors, in one database transaction, and sends a confirmation email (FR-14). The app runs it for the student. You never run deletes.
- The app obeys overrides. After an override it may show optional reason chips. One tap dismisses them. It never requires a reason (FR-11).
- A card whose passage is gone is marked possibly outdated. The student chooses keep or archive. Nothing is deleted without a tap (FR-05).
- A flagged item is hidden from that student at once (FR-15). A flag carries a reason the student picks (FR-15).
- Messages respect quiet hours and carry a one tap unsubscribe link in every email. Never base a decision on the open signal (FR-13).
- NFR-01 to NFR-06 apply. Check each one you can check in code. List the ones you could not check at the end of the response.
- Follow the Carry forward rules for sections 7, 8 and 9. Sections 11 to 14 are PRD writing tasks, not code.

## Where the detailed rules live
These names are proposed. None of these files exist yet. Each holds values this file must not contain. Ask the human to confirm the names before the first rules file is created.
- rules/plan-rules.md: scheduling rules, scoring, daily target, card ladder, new card rule, session gap, readiness bands, question set size, question pool and reuse, timer lengths, heartbeat interval, note match threshold, topic count rule.
- rules/limits-and-defaults.md: the student's weekday and weekend caps, defaults, the minimum age for the age confirmation box (FR-01), quiet hours, reminder time, file and text limits, time zone default.
- rules/notifications.md: message ladder, message limits, priority order, response window.
- rules/ai-pipeline.md: provider settings, model name, prompts, question checks, generation limits, caching. PRD section 7 is not written. Ask first.
- rules/data-model.md: Prisma schema, indexes, delete behavior. R1 to R9 fields are in PRD section 5.3. The schema is not defined. Ask first.
- rules/vector-store.md: vector table, dimensions, index, chunking, passage to topic assignment, vector deletion. No PRD source. Ask first.
- rules/env.md: environment variable names.

## Definitions
- Tier: the PRD defines no paid tier or plan. "Free tier" means an outside service's free plan. Verify its limits (PRD section 5.4).
- Record: a kind of data version one must capture. R1 answers, R2 card reviews, R3 sessions, R4 plan items, R5 overrides and plan changes, R6 flags, R7 messages, R8 exams and results, R9 generation records.
- Chunk: the PRD uses the word in FR-14 and does not define it. Section 9 is not written. Ask before using it.
- Exam: one subject with a name and a date. Status: upcoming, done (date has passed), or removed.
- Note: belongs to exactly one exam.
- Topic: belongs to exactly one exam.
- Plan item: a block of work for one topic: card review block, new cards block or question set. It stores a count, minutes and a one line reason.
- Done: a plan item is done when its whole planned count is finished. Partial progress is stored as a fraction.
- Session: a period of activity (answers, reviews or a running timer) with gaps shorter than the session gap in PRD section 6.0. Start is the first activity. End is the last.
- Missed day: a day when the plan had at least one item and the student recorded no answers or reviews. Paused days and days before the first exam was added do not count.
- Response: the student opens the app within the response window in PRD section 6.0 after a message is sent. Ignored means no response.
- Card result: "Got it" or "Missed it", chosen by the student.
- Question result: right or wrong, from the option the student picked.
- Passage: the PRD uses the term without defining it. FR-07 and FR-08 use it for the part of the notes an item came from. Ask if you need more.
- Archive: hide a card from reviews and keep its history. A card whose passage is gone is marked possibly outdated (FR-05).
- Text based PDF: a PDF that contains real text. A scan with no text layer is rejected (FR-03).
- Spaced repetition: a method where a card you know comes back after a longer gap.
- Card ladder: the fixed day gaps between card reviews (FR-08).
- Distractor: a deliberately wrong answer option.
- Job: work that runs in the background after the request ends.
- Queue: a waiting line of jobs.
- Heartbeat: a tiny signal sent while the page is open that saves the last activity time.
- Open signal: a tiny hidden image that records an email open. It is stored and never used to make decisions.
- Quiet ladder: the message steps in FR-13 after missed days, ending with exam countdown emails.
- Cap: the student's weekday or weekend minutes. The plan never exceeds it. Generation limits are separate (FR-17, NFR-05).
- Daily target: the planned length of a day, defined in PRD section 6.3, rule 2.
- Readiness: a band per topic, defined in FR-09.
- Overrides: pin a topic to a day, mark a topic "already know it" or "skip", lock a day, change caps (FR-11).
- Reason chip: an optional button after an override with a short reason such as too hard or no time. One tap dismisses it (FR-11).
- Pause: defined in FR-13.
- Dropped: a planned new card block or quiz set not carried forward after a missed day, listed with a reason (rule 11).
- Question set: the questions shown together in one quiz (FR-07).
- Confidence rating: the student's rating given after picking an option and before the result (FR-07).
- Study summary: the totals shown after an exam result is entered (FR-16).
- [ASSUMPTION]: a default chosen with a reason.
- [VERIFY]: an outside fact that must be checked before building.
