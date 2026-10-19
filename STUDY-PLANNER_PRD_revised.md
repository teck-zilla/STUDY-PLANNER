# STUDY-PLANNER PRD (Revised: sections 1 to 6)

This revision fixes the 33 lapses found in the live review of PRD part 1. Sections 7 to 14 are not written yet. The rules they must follow are listed under "Carry forward" at the end.

Two tags are used. [ASSUMPTION] marks a default chosen with a reason. [VERIFY] marks a fact about an outside service that must be checked before building, because free limits and terms change.

## Summary in five lines

1. STUDY-PLANNER is a mobile friendly web app that turns a student's notes and exam dates into a short daily list of cards and questions.
2. The plan follows plain rules. AI only writes cards and questions. Every item shows the passage of the student's notes it came from.
3. Version one is built for one group: university students aged 18 or over sitting written exams in English. [ASSUMPTION: the brief left the group blank, and written exams fit a notes based design.]
4. The stack is locked: Next.js, TypeScript, Prisma, PostgreSQL. Everything else is free tier.
5. Version one records nine kinds of data (R1 to R9) so version two can learn from real outcomes. No code starts until the pre-build checks in section 5.4 pass.

## 1. Product Summary

STUDY-PLANNER is a web app for students preparing for written exams. The student enters exam dates and adds notes as pasted text or text based PDFs. The app proposes a topic list, which the student edits. It then writes flashcards and multiple choice questions from the notes, stores them, and builds a daily plan from plain scheduling rules. Each card and question shows the passage of the notes it came from, with the line: "Based on your notes. Check your course materials if unsure." The plan changes each day based on what the student got wrong, what they missed and how many days remain.

The app checks that each item matches the student's notes. It cannot check that the notes are true. The app never states a fact as correct unless that fact is in the student's notes. Wrong answer options are wrong by design and follow the rules in FR-07.

What makes it different from a normal planner:

- **It reorders by evidence.** Wrong answers and time since last review move topics up. A ticked box does not.
- **It shrinks instead of piling up.** After missed days it drops low value planned work and says what it dropped and why.
- **It shows its sources.** Every generated item points to the student's own words, with a flag button.

**Challenge:** The brief lists "flashcards", "AI assisted quiz", "daily target" and "daily schedule" as four separate creations. They are one thing: a plan made of card reviews and question sets. Build one plan, not four screens.

## 2. Problem

**Hypothesis (not yet tested):** A study plan fails when it stops matching what the student has actually done and learned, and nothing tells the student.

**Illustrative scene (invented, not a case study):** Daniel colour codes a notebook plan on Sunday. By Thursday he has missed two days. The plan still looks fine, so he ignores it. Two weeks on, he finds he never touched pharmacology. Nothing told him he was behind, and nothing told him he kept missing those questions. He crams the night before and fails that section. He felt on track the whole time, so he stops trusting any plan.

Three failures this hypothesis predicts. Student interviews must confirm each one:

- Plans do not react to missed days.
- Plans do not measure what the student actually knows.
- Students cannot see which topic is the risk until it is too late.

**What students use today:** flashcard apps with spaced repetition (a method where a card you know comes back after a longer gap), flashcard apps that write cards with AI, general calendars and to-do apps, and paper plans. [VERIFY: name two real products in each group and check their free features before launch.]

**The claimed difference:** answers change the next day's plan, and every item shows the passage behind it.

**What would prove this wrong:** students say they already know where they are weak, or they do not study from typed notes.

No market statistics are included. None were provided, and none will be guessed.

## 3. Goals

Targets apply to the first test group of 20 to 50 students. [ASSUMPTION: a free tier build supports only a small pilot. All targets are guesses until a baseline exists.]

| ID | Goal | Measure | Target | Decision rule |
|---|---|---|---|---|
| G1 | Students come back | Among students whose first exam is at least 21 days after sign-up: share who finished onboarding and have at least one session on days 15 to 21 after their first session. Report as "x of N". | 40% or more | Below 25% with at least 20 qualifying students: stop adding students and fix the plan screen and reminders first |
| G2 | Generated content is trusted | Weekly audit of 50 random items shown that week (all if fewer than 50). An item passes if its passage is in the notes and the marked answer is right according to that passage. Also report flags divided by unique items shown. | Audit pass rate 95% or more. Flag rate under 3% counts only when the audit passes. | Audit below 90%: pause new generation and fix the prompts before anything else |
| G3 | Every topic gets covered before the exam | Share of non skipped topics with at least 3 results in the 14 days before their exam | 90% or more | Below 70%: review the new card rule and the topic cap |
| G4 | Answers show retention | Of questions answered at least twice, at least 7 days apart, the share answered right the second time | 70% or more | Below 55%: review the ladder and the question reuse rules |
| G5 | Version two data is complete | Weekly query over R1 to R9: no empty required fields, every session has a start and end, every generated item has a model name and prompt version | 100% | Any gap must be fixed within 7 days |

**Non goals**

- Proving that the app raises exam marks. Ten weeks of data from 50 students cannot show it.
- Predicting exam results.
- Supporting every exam board and country.
- A chat tutor, groups, leaderboards or teacher views.
- A native phone app or offline use.
- Handwriting or photo notes.

## 4. Users and Personas

All numbers below are hypotheses to confirm in the interviews in section 5.4.

**Primary: Amara, 19, second year nursing student at a UK university.** [ASSUMPTION: UK university, because written exams fit the notes based design.]

- **Frequency (hypothesis):** 4 to 5 evenings a week, about 10 minutes each, plus one longer weekend session.
- **What brings her back with no question in mind:** one message: "14 cards due, about 8 minutes." The exam countdown on the home screen helps too.
- **What makes her leave (hypothesis):** a long backlog, any wrong flashcard she cannot trace to her notes, more than 3 emails a week, or guilt wording.

**Secondary: Tom, 22, final year, works part time.**

- **Frequency (hypothesis):** short bursts after 10pm on weekdays, long sessions on Sundays.
- **What brings him back:** a plan that already fits a 10 minute slot, so he does not have to decide anything.
- **What makes him leave:** a plan that assumes a free hour on Tuesday evening.

Tom exists to test one rule: the plan must learn when and how long he really studies, not what he typed on day one.

**Defaults that serve both:** quiet hours 22:00 to 08:00, reminder time 18:00 until the app learns a better time from real sessions. [ASSUMPTION]

## 5. Scope

### 5.1 Version one: in

- Email or Google sign-in, profile, up to 5 upcoming exams
- A consent screen, an "I am 18 or over" box, email as the only personal detail collected
- Notes as pasted text or text based PDFs, with versions
- Topic proposal from notes, editable by the student
- Cards and multiple choice questions, each with source passage and a flag button
- Spaced repetition card reviews
- Daily plan from plain rules, with overrides
- Readiness per topic
- Focus timer inside the plan screen
- In-app weekly note
- Email and in-app messages, with the quiet ladder
- Account and data deletion
- Data access requests answered by hand over email
- The nine record types below

### 5.2 Version one: out

Handwriting or photo notes, memory games, chat tutor, groups, sharing, leaderboards, native app, payments, past paper uploads, teacher dashboards, other languages, offline use, short answer questions, data export screens. [ASSUMPTION: short answer needs automatic marking, which is unreliable. Version one uses multiple choice only.]

### 5.3 Records version one must capture, and what version two needs

| ID | Record | Fields |
|---|---|---|
| R1 | Answers | question, topic, right or wrong, seconds taken, time of day, confidence 1 to 3, set |
| R2 | Card reviews | card, topic, Got it or Missed it, time, ladder step before and after |
| R3 | Sessions | start, end, timer used or not, weekday or weekend |
| R4 | Plan items | day, topic, type, planned count, done count, minutes, reason |
| R5 | Overrides and plan changes | type, topic, day, reason chip (may be empty), app note |
| R6 | Flags | item, reason, note version |
| R7 | Messages | channel, type, sent time, response within 48 hours (yes or no), open signal (yes, no, unknown) |
| R8 | Exams and results | exam date, result type, result value, date entered |
| R9 | Generation records | for every card and question: model name, prompt version, note version, time made |

The numbers in the next table are rough guesses. [ASSUMPTION]

| Version two capability | Records | Rough data needed | Can the pilot supply it |
|---|---|---|---|
| Learn the best study times per student | R3, R1 | 10 or more sessions per student | Yes, for active students |
| Tune card intervals per student | R2 | 200 or more reviews per student | Only a few students |
| Know which plan rules help | R4, R5 | Several weeks of plan items per student | Partly |
| Judge question quality across prompts | R6, R9, R1 | 500 or more items per prompt version | Yes, if prompt versions stay few |
| Spot students who are guessing | R1 | 30 or more answers per student | Yes |
| Tune message timing | R7 | 10 or more messages per student | Partly |
| Predict a pass | R8 with R1 to R4 | About 200 results | No. The pilot gives fewer than 25. Version one can only start collecting. |

### 5.4 Pre-build checks (before any code)

1. Hold five 20 minute interviews with students: how they prepare today, which tools they use, what format their notes are in.
2. Ask 10 students to show their notes. At least 6 must hand over typed text or PDFs that contain real text. If fewer than 6, stop and rethink the scope. [ASSUMPTION: threshold]
3. Run the free AI provider on 3 real sets of notes. Check 50 generated items by hand. At least 90% must pass the G2 test. [ASSUMPTION: threshold]
4. Verify the free limits and terms of every outside service [VERIFY]: whether the AI provider uses free tier inputs for training, request and daily limits, function time limits on the host, how often the free scheduler can run, and what the email sender requires.
5. Send test emails to 5 university addresses. Check inbox versus spam.
6. Check the basics of UK data protection law: privacy notice, lawful basis, handling data access requests. This document is not legal advice. [VERIFY]

## 6. Functional Requirements

### 6.0 Definitions

| Term | Meaning |
|---|---|
| Exam | One exam is one subject, with a name and a date. Status: upcoming, done (date has passed), or removed. |
| Note | Belongs to exactly one exam, chosen at upload. |
| Topic | Belongs to exactly one exam. |
| Plan item | A block of work for one topic: a card review block, a new cards block, or a question set. It stores a count, minutes and a one line reason. |
| Done | A plan item is done at 100% of its planned count. Partial progress is stored as a fraction. |
| Session | A period of activity (answers, reviews, or a running timer) where the gaps between activity are under 10 minutes. Start is the first activity. End is the last activity. |
| Missed day | A day when the plan had at least one item and the student recorded no answers or reviews. Days while paused, and days before the first exam was added, do not count. |
| Response | The student opens the app within 48 hours after a message is sent. Ignored means no response. |
| Card result | "Got it" or "Missed it", chosen by the student. |
| Question result | Right or wrong, from the option the student picked. |

### 6.1 Onboarding, notes and topics

| ID | Requirement | Acceptance criteria | Edge cases and error states |
|---|---|---|---|
| FR-01 | As a new student, I sign up and set my profile so the plan fits me. | Sign in by a one time email link or by Google sign-in. [ASSUMPTION: a second path stops a lockout if the email does not arrive.] The screen asks for email only, a tick box "I am 18 or over", and a tick box agreeing that note text is sent to the AI provider named on screen to write cards. The provider is chosen in section 7. Its free terms must say inputs are not used to train its models [VERIFY]. If no free provider says that, the screen must state it plainly and the student must still agree. Profile defaults: weekday cap 60 minutes, weekend cap 120 minutes, quiet hours 22:00 to 08:00, reminder time 18:00, time zone Europe/London. All can be edited. A student with no exam sees an "add an exam" screen. | Expired link shows "send a new link". Email not arrived: show "check spam", allow resend after 60 seconds, show the Google option. Caps below 10 or above 480 minutes are rejected with a message. Under 18 box not ticked: stop with a plain message. |
| FR-02 | As a student, I add up to 5 upcoming exams, each with a name and a date. | The name is the subject. The date is today or later. A sixth upcoming exam is blocked with a clear message. Editing a date triggers a plan rebuild. After the date passes the exam becomes "done": its topics leave the plan and its cards are no longer scheduled. | Two exams on one day are allowed. Removing an exam asks the student to move its notes to another exam or delete them. |
| FR-03 | As a student, I add notes to an exam by pasting text or uploading a PDF. | Pasted text up to 20,000 characters per note. PDF up to 10 MB and 50 pages. Total 200,000 characters per student. [ASSUMPTION: limits protect free tier AI and storage.] Processing runs as a job (work that runs in the background after the request ends). Visible states: queued, reading, ready, failed. Text is ready within 60 seconds for notes up to 20 pages. [ASSUMPTION; VERIFY against host time limits.] The PDF is deleted as soon as its text is extracted, and no later than 1 hour after upload. The upload screen says that images, diagrams and equations are ignored. | A PDF with no text layer (a scan) is rejected: "This PDF has no readable text. Paste the text instead." Password protected PDFs are rejected. If extracted text averages under 200 characters per page, warn that slides with little text make weak cards, and allow the student to continue. If more than 30% of extracted characters are not letters, digits or normal punctuation, reject as garbled. Over limit shows the exact number of characters to remove. A parsing error never creates cards. |
| FR-04 | As a student, I see a proposed topic list for each exam and edit it. | A proposal needs at least 1,000 characters of notes for that exam. The app proposes 3 to 20 topics, about one per 2,000 characters. [ASSUMPTION] The student can rename, merge, delete and add topics. Cards generate only after the student confirms the list. After confirmation the app generates the first 10 cards for the topic with the most text and shows them within 90 seconds. [ASSUMPTION; VERIFY] The rest generate in the background. | Under 1,000 characters: no proposal, show "add more notes". The student may skip the proposal and type topics by hand. How passages are assigned to topics is defined in section 9. |
| FR-05 | As a student, I update a note and keep my good cards. | Editing or re-uploading creates a new note version. For each card, the stored passage is checked against the new text, with no AI. Step 1: ignore spaces and letter case, then search for the passage word for word. Found: keep. Step 2: if not found, find the best matching stretch of text. If similarity is 0.90 or more, keep the card and update its passage. Step 3: otherwise mark the card "possibly outdated" and ask the student to keep or archive it. Archive hides the card from reviews and keeps its history. Nothing is deleted without a tap. | If the new version is under 50% of the old length, ask for confirmation before processing. |
| FR-17 | As a student, I see clearly when my cards are still being made, and the app stays up when the free AI limit is reached. | Generation runs through a queue (a waiting line of jobs). Each student can have up to 40,000 characters processed per day. [ASSUMPTION] Each note shows its status. If the provider limit is hit, new work waits in the queue, existing cards and plans keep working, and the note shows "Cards will be ready by tomorrow". An admin switch pauses all new generation. | A note waiting over 24 hours shows a plain "still waiting" message. |

### 6.2 The five features

| ID | Requirement | Acceptance criteria | Edge cases and error states |
|---|---|---|---|
| FR-06 | **"What do I study today?"** As a student, I open the app and see today's plan. | Shows today's plan items, each with topic, type, count, minutes and a one line reason. Shows total minutes against today's target. Shows a collapsed "Dropped today" list with a reason for each drop. An "Add more" button extends the plan up to the cap. The total never exceeds the cap. The screen loads in under 2 seconds (NFR-01). | No exams: empty state. Exam today: the plan shows that exam's due cards and weakest topics. Day complete: "Done. Next card due on [date]." Plan paused: shows a resume button. Cards still being made: shows the processing status. |
| FR-07 | **"Quiz me on this topic."** As a student, I pick a topic and get questions from my notes. | A set has 5 multiple choice questions with 4 options each. The correct option is a statement found in the passage. Each wrong option (a distractor, meaning a deliberately wrong answer) is either a statement taken from another passage of the same topic, or the correct statement with one change: a number, a term, or a negation. Flow: the student picks an option, rates confidence 1 to 3, then sees the result. The result shows the correct option, the source passage, and the line "Based on your notes. Check your course materials if unsure." Each answer saves time taken. The pool holds about 1 question per 300 characters of topic text, up to 30 per topic. [ASSUMPTION] Reuse order: never seen first, then missed questions after 3 days, then right questions after 14 days. | Fewer than 5 eligible questions: show a smaller set, or use cards instead. The student can quit mid set and keep answers already given. Generation failed: show saved questions, or "no questions yet, try later". |
| FR-08 | **"Which cards are due?"** As a student, I review cards that are about to be forgotten. | A card shows the front, then the back and source passage after the student reveals it. The student taps "Got it" or "Missed it". A new card starts at step 0. The ladder is 1, 3, 7, 14, 30 days. Got it moves up one step. Missed it returns the card to step 1 and shows it once more at the end of the same session. Each interval is capped at half the days left to the exam, minimum 1 day, and no card is due later than the day before the exam. Overdue cards stay due and are never deleted. | More than 40 due: show 40, the rest stay due. A card is never shown twice in one day except the one repeat after Missed it. [ASSUMPTION: a fixed ladder is simpler to build and explain than SM-2, a common scheduling formula. Revisit in version two.] |
| FR-09 | **"How ready am I?"** As a student, I see readiness per topic. | Readiness uses question results. Accuracy is the share right of the last 10 question answers on the topic, multiplied by a recency factor of max(0.4, 1 minus days since the last result divided by 42). With fewer than 5 question answers but at least 5 card results, use card results and label it "based on self-marked cards". The main screen shows a band and the answer count, for example "At risk, based on 8 answers", plus the last answer date. Bands: under 50 "at risk", 50 to 79 "building", 80 or more "ready". The exact number appears only in a detail view. [ASSUMPTION: numbers are starting values to tune in testing.] | Fewer than 5 results of both kinds: show "not enough data". Readiness never uses ticked tasks. |
| FR-10 | **"What should I change?"** As a student, I read a weekly note. | An in-app note, made once a week on the student's chosen day. Code fills a fixed template with: the 3 weakest topics, minutes studied, one proposed plan change, and what changed since last week. AI may phrase at most one sentence and may not change any number. The student can accept or ignore the proposed change. The note does not use email. | Fewer than 3 sessions that week: numbers only, plus one "5 minute restart" button, no advice. If AI fails, the plain template is used. No note while the plan is paused. |

### 6.3 Plan rules (ordered)

These run in this order every time the plan is built. They are plain code. They use no AI.

1. **Cap.** Today's cap is the student's weekday or weekend minutes. The plan never exceeds it.
2. **Daily target.** The target is the median length of the student's last 8 sessions of the same day type (weekday or weekend), rounded to the nearest 5 minutes, at least 10, at most the cap. Before 8 sessions exist: 20 minutes on weekdays and 30 on weekends. [ASSUMPTION] When an exam is within 7 days, the target equals the cap.
3. **Item cost.** A card takes 20 seconds. A question takes 60 seconds. [ASSUMPTION: replace with measured medians from the answers after week 2.]
4. **Leave out** skipped topics and topics of exams that are done.
5. **Pinned topics first.** Each pinned topic gets 10 minutes. The plan may stretch to the cap for pins. If pins still do not fit, show one note and obey the student.
6. **Score each remaining topic.** Score = urgency × (1 + 2 × weakness + 0.5 × staleness).
    - Urgency: 3 if the exam is within 7 days, 2 if within 14, otherwise 1.
    - Weakness: 1 minus accuracy over the last 10 results. With fewer than 5 results, use 0.5.
    - Staleness: days since the last result divided by 7, capped at 3. A topic with no results yet gets 3.
    - A topic marked "already know it" has its score multiplied by 0.25 while that mark is active.
7. **Due cards.** All due cards across all topics are eligible, ordered by topic score, then by days overdue. They take up to 50% of the target and never more than 40 cards a day. The rest stay due.
8. **New cards.** New cards per day = the unseen cards divided by the larger of 1 and (days to exam minus 3), rounded up, at most 20. They come from the top scoring topics. [ASSUMPTION]
9. **Quiz sets** fill the rest of the target from the top scoring topics.
10. **Topic cap.** New cards and quiz sets together cover at most 3 topics a day. Due reviews are not limited by topic.
11. **Missed days.** Overdue cards stay due and follow rule 7. Planned new card blocks and quiz sets from missed days are not carried forward. They appear under "Dropped today" with a reason, and topics are chosen again by rule 6.
12. **Locked days.** A locked day stays as the student set it.
13. **Reasons.** Every item and every drop has a one line reason from fixed templates, with no AI.
14. **Reminder time.** The default is 18:00. After 8 sessions it becomes the median session start time minus 60 minutes, kept outside quiet hours.
15. **Build timing.** The plan is computed when the student first opens the app each day, and again after any event (new note, changed exam date, override, finished item), then cached. An hourly job computes plans for students about to get a reminder, so the numbers in the message are true. Which free scheduler runs the hourly job is decided in section 8. [VERIFY]

### 6.4 Overrides, timer, notifications, deletion, flags, results

| ID | Requirement | Acceptance criteria | Edge cases and error states |
|---|---|---|---|
| FR-11 | As a student, I override the plan and the app respects it. | I can pin a topic to a day, mark a topic "already know it" or "skip", lock a day, and change my caps. Rule 13 states the reason when the app moves something. After an override, an optional row of reason chips appears ("too hard", "already know it", "no time", "other"). It can be dismissed with one tap, and the app never asks me to justify the override. Each override saves the chip (which may be empty) and a separate app note. "Already know it" lasts 14 days, or until the exam is within 7 days, then the topic returns to normal scoring and the app says so in one line. Skip pauses reviews for that topic. When the student un-skips it, the due cards spread over the next 3 days. [ASSUMPTION] | Skipping every topic of an exam within 7 days of it shows one warning, then obeys. |
| FR-12 | As a student, I run a focus timer from the plan. | 25 minutes of work, 5 minutes of rest. The remaining time is computed from the saved start time, not by counting seconds, because phones slow background timers. While the page is open it sends a heartbeat (a tiny signal) every 30 seconds that saves the last activity time. A session ends at the timer end or the last heartbeat. | If no heartbeat arrives for 10 minutes, the session closes at the last heartbeat. A session that runs past midnight stays on its start date. |
| FR-13 | As a student, I get quiet reminders that never nag. | Ladder: day 1 missed, nothing. Day 2: one email and one in-app message ("5 minutes, 6 cards", with true numbers). Day 4: the plan shrinks and a 10 minute catch-up is offered. Day 7: a message says the plan is paused and one tap restarts it. After that: exam countdown emails at 14, 7 and 2 days before each exam. Limits: 3 emails in any rolling 7 days, 1 in-app message per day, none in quiet hours. Priority when the limit bites: exam countdown, pause notice, catch-up, reminder. Two ignored messages in a row stop all emails except exam countdowns. Countdown emails are limited to 3 per exam and can be turned off in one tap. Every email has a one tap unsubscribe link. One tap pauses everything. On resume the plan restarts at the daily target. The open signal (a tiny hidden image that records an open) is stored but is never used to make decisions. Each message is saved with sent time, response and open signal. | Email bounces: stop emailing and use in-app messages only. A student who returns resets the ladder. |
| FR-14 | As a student, I delete my notes or my whole account in one action. | "Delete note" removes the note text, versions, passages, chunks, vectors, and the wording of its cards and questions. It keeps the numbers: results, time taken, confidence, topic and timestamps, with no note text. The delete screen says this in plain words. "Delete account" removes every row tied to the student, including numbers and vectors, in one database transaction, and sends a confirmation email. No PDF is stored, so there is no file deletion step. Data access requests are answered by hand over email in version one. [ASSUMPTION] | Backups held by the database host may keep data for a time. [VERIFY: check the host's backup retention.] |
| FR-15 | As a student, I flag a card or question that looks wrong. | A flag button on every card and question. The student picks a reason: "wrong fact", "not in my notes", "badly worded" or "other". It saves the item, the note version and the reason. The item is hidden from that student immediately. Every generated item stores its model name and prompt version (R9), so version two can compare prompts across students. Flags are per student. Notes are private, so no item is shared between students. | Flagging an item already flagged changes nothing. |
| FR-16 | As a student, I enter my exam result after the exam. | Two days after the exam date, the app asks once in the app for the result. If there is no reply after 7 days, it sends one email (counted in the 3 email limit) and then stops. The student chooses pass or fail, a percentage, or another grade as text. After entry the app shows a study summary: total minutes, cards reviewed, questions answered, weakest topic. This is the reward for entering a result. Entry is optional and skippable. | Results will come mostly from motivated students. Any analysis of results must say so. |

### 6.5 Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | The plan screen loads in under 2 seconds on a mid range phone on a 4G connection. [ASSUMPTION] |
| NFR-02 | Works on the latest two versions of Safari on iPhone, Chrome on Android, and Chrome, Edge, Firefox and Safari on desktop. |
| NFR-03 | Buttons are at least 44 pixels tall. Text meets WCAG 2.2 level AA contrast (a public accessibility standard). Every button has a label a screen reader can read. |
| NFR-04 | A student can only read their own rows. Every database query filters by student id. Test with two accounts before launch. |
| NFR-05 | Per student limits: 40,000 characters processed per day (FR-17) and no more than 10 generation requests per hour. [ASSUMPTION] Other limits are set in section 8. |
| NFR-06 | The app collects email only. No real name, no date of birth. A plain English privacy notice appears before sign-up. |

## Carry forward: rules for sections 7 to 14

- **Section 7:** The AI task list must follow FR-07 distractor rules. Code checks that the correct option appears in the passage. Every item stores model name and prompt version. The weekly note uses a template. Plan rules use no AI. Name the provider only after its free terms are verified.
- **Section 8:** The Prisma schema must hold R1 to R9, archive status for cards, job states, and heartbeat based sessions. Deleting a note must keep numeric records. No PDF storage. Every query filters by student id. Decide which free scheduler runs the hourly job.
- **Section 9:** Define how passages are assigned to topics. FR-05 matching uses text comparison, not vectors. Deleted notes must remove their vectors.
- **Section 11:** State who pays, if anyone. Price AI calls at the free limits and just above them. Answer the "why is it free" question.
- **Section 12:** Use G1 to G5 exactly as defined here.
- **Section 13:** Add risks for email delivery, a free provider changing its terms, and the pilot being too small to learn from.
- **Section 14:** List the five open answers from the brief, plus every [VERIFY] and every pre-build check.

## Assumptions

| # | Assumption | Section |
|---|---|---|
| A1 | Learner group is university students aged 18 or over | Summary, 4 |
| A2 | Exam family is UK university written exams, nursing and health first | 4 |
| A3 | Language is English | Summary |
| A4 | First test group is 20 to 50 students, and all targets are guesses | 3 |
| A5 | Notes limits: 20,000 characters per note, 10 MB and 50 pages per PDF, 200,000 characters per student | FR-03 |
| A6 | Multiple choice only, 5 questions per set | 5.2, FR-07 |
| A7 | Fixed ladder of 1, 3, 7, 14, 30 days, capped by the exam date | FR-08 |
| A8 | Readiness formula and bands are starting values | FR-09 |
| A9 | Item cost of 20 and 60 seconds, 50% due card share, 3 topic cap | 6.3 |
| A10 | Google sign-in added as a second path | FR-01 |
| A11 | 18+ box and email only | FR-01, NFR-06 |
| A12 | Defaults: quiet hours 22:00 to 08:00, reminder 18:00, time zone Europe/London | FR-01, 4 |
| A13 | Processing within 60 seconds and first 10 cards within 90 seconds | FR-03, FR-04 |
| A14 | Topic count of about one per 2,000 characters, 3 to 20 | FR-04 |
| A15 | Similarity threshold of 0.90 for card matching | FR-05 |
| A16 | Daily generation cap of 40,000 characters per student | FR-17 |
| A17 | Daily target: median of last 8 sessions, defaults 20 and 30 minutes | 6.3 |
| A18 | New cards formula with a daily maximum of 20 | 6.3 |
| A19 | Question pool of about 1 per 300 characters, maximum 30 per topic | FR-07 |
| A20 | Response window of 48 hours | 6.0, FR-13 |
| A21 | "Already know it" lasts 14 days, and un-skipped cards spread over 3 days | FR-11 |
| A22 | Data access requests handled by hand over email | FR-14 |
| A23 | Pre-build thresholds: 6 of 10 students with text notes, 90% of items passing | 5.4 |
| A24 | Rough data needs in the version two table | 5.3 |
| A25 | Load time target of 2 seconds on a mid range phone on 4G | NFR-01 |
