# rules/plan-rules.md
Job: how the app chooses what the student sees each day. Fixed input limits are in rules/limits-and-defaults.md. Message timing is in rules/notifications.md.
These rules are plain code. They use no AI (PRD 6.3). Rule numbers match PRD 6.3.

## Plan rules, in this order
1. Cap. Today's cap is the student's weekday or weekend minutes. The plan never exceeds it. Why (PRD): the total never exceeds the cap (FR-06).
2. Daily target. Median length of the student's last 8 sessions of the same day type (weekday or weekend), rounded to the nearest 5 minutes, at least 10, at most the cap. Before 8 sessions exist: 20 minutes on weekdays, 30 on weekends. When an exam is within 7 days, the target equals the cap. Why (PRD): the plan must fit real habits, not typed ones (section 4). Numbers are [ASSUMPTION].
3. Item cost. A card takes 20 seconds. A question takes 60 seconds. No PRD reason. Replace with measured medians after week 2 [ASSUMPTION].
4. Leave out skipped topics and topics of exams that are done. Why (PRD): the student controls the plan (FR-11) and done exams leave it (FR-02).
5. Pinned topics first, 10 minutes each. The plan may stretch to the cap for pins. If pins still do not fit, show one note and obey the student. Why (reading): the student's choice outranks the plan (FR-11).
6. Score each remaining topic: urgency x (1 + 2 x weakness + 0.5 x staleness). Why (PRD): wrong answers and time since last review move topics up (section 1).
   - Urgency: 3 if the exam is within 7 days, 2 if within 14, otherwise 1.
   - Weakness: 1 minus accuracy over the last 10 results. With fewer than 5 results, use 0.5.
   - Staleness: days since the last result divided by 7, capped at 3. A topic with no results yet gets 3.
   - A topic marked "already know it" has its score multiplied by 0.25 while the mark is active.
7. Due cards. All due cards across all topics are eligible. Order by topic score, then days overdue. They take up to 50% of the target and never more than 40 cards a day. The rest stay due. Why (reading): the ladder breaks if due cards are left out (FR-08).
8. New cards. New cards per day = unseen cards divided by the larger of 1 and (days to exam minus 3), rounded up, at most 20. Take them from the top scoring topics. No PRD reason [ASSUMPTION].
9. Quiz sets fill the rest of the target from the top scoring topics. No PRD reason.
10. Topic cap. New cards and quiz sets together cover at most 3 topics a day. Due reviews are not limited by topic. No PRD reason.
11. Missed days. Held in AGENTS.md. Not repeated here.
12. A locked day stays as the student set it. Why (reading): student control (FR-11).
13. Plan reasons. Held in AGENTS.md. Not repeated here.
14. Reminder time. After 8 sessions, use the median session start time minus 60 minutes, kept outside quiet hours. Before that, use the default in rules/limits-and-defaults.md. Why (PRD): learn real habits (section 4).
15. Build timing. Compute the plan when the student first opens the app each day, and again after a new note, changed exam date, override or finished item. Cache it. An hourly job computes plans for students about to get a reminder. Which free scheduler runs it is decided in section 8 [VERIFY]. Why (reading): the screen must load fast (NFR-01) and message numbers must be true (FR-13).

## Card ladder (FR-08)
- Ladder: 1, 3, 7, 14, 30 days. A new card starts at step 0. Why (PRD): a fixed ladder is simpler to build and explain than SM-2 [ASSUMPTION A7].
- "Got it" moves the card up one step. "Missed it" returns it to step 1 and shows it once more at the end of the same session. Why (reading): missed cards come back sooner.
- Cap each interval at half the days left to the exam, minimum 1 day. No card is due later than the day before the exam. Why (reading): a card due after the exam is useless.
- A card is never shown twice in one day except the repeat after "Missed it". No PRD reason.

## Question reuse (FR-07)
- Order: never seen first, then missed questions after 3 days, then right questions after 14 days. No PRD reason.
- Fewer than 5 eligible: show a smaller set or use cards instead. No PRD reason.

## Readiness (FR-09)
- Accuracy is the share right of the last 10 question answers on the topic. Multiply by max(0.4, 1 minus days since the last result divided by 42). Why (reading): an old good answer is weaker evidence than a new one.
- Fewer than 5 question answers but at least 5 card results: use card results and label "based on self-marked cards". Why (PRD): self-marked cards can inflate readiness.
- Bands: under 50 "at risk", 50 to 79 "building", 80 or more "ready". No PRD reason [ASSUMPTION: starting values to tune].
- The main screen shows the band, the answer count and the last answer date. The exact number appears only in a detail view. Why (reading): 10 answers cannot support a precise number.
- Fewer than 5 results of both kinds: show "not enough data". Readiness never uses ticked tasks. Why (PRD): ticked tasks are the failure the product avoids (section 6, readiness question).

## Sessions (PRD 6.0)
- A session is activity with gaps shorter than 10 minutes. Start is the first activity. End is the last. Why (reading): rules 2 and 14 need a defined session.

## Override timing (FR-11)
- "Already know it" lasts 14 days, or until the exam is within 7 days. Then the topic returns to normal scoring and the app says so in one line. Why (reading): a mark made in week 1 must not hide a topic until the exam.
- Skip pauses reviews for that topic. When un-skipped, due cards spread over the next 3 days. Why (reading): no sudden pile.
- Skipping every topic of an exam within 7 days shows one warning, then obeys. Why (reading): warn once, but the student wins (FR-11).

## Open (PRD silent, ask the human)
- Rule 6 says "results". FR-09 uses question answers. Do card results count in weakness?
- How to break ties in topic score and in days overdue.
- Rule 8: are "unseen cards" counted per topic, per exam or across all exams?
