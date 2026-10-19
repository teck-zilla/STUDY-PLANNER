# rules/limits-and-defaults.md
Job: every fixed number and default for student settings, notes, questions, timing and generation. Plan scoring numbers are in rules/plan-rules.md. Message numbers are in rules/notifications.md.
Values are copied from the PRD. [ASSUMPTION] marks a PRD guess to tune.

## Student settings (FR-01, FR-02)
Value | Rule | Why | Source
--- | --- | --- | ---
Weekday cap | Default 60 minutes. | No PRD reason. | FR-01
Weekend cap | Default 120 minutes. | No PRD reason. | FR-01
Cap range | Reject below 10 or above 480 minutes, with a message. | No PRD reason. | FR-01
Quiet hours | Default 22:00 to 08:00. Editable. | Why (PRD): defaults serve both personas [ASSUMPTION]. | FR-01, section 4
Reminder time | Default 18:00. Editable. Learned later by rule 14 in rules/plan-rules.md. | Same. | FR-01, section 4
Time zone | Default Europe/London. Editable. | No PRD reason. | FR-01
Age box | Confirms the student is 18 or over. | Why (PRD): version one is for adults [ASSUMPTION A1]. | FR-01
Sign-in email resend | Allowed after 60 seconds. | No PRD reason. | FR-01
Upcoming exams | At most 5 per student. | No PRD reason. | FR-02

## Notes and topics (FR-03, FR-04, FR-05)
Value | Rule | Why | Source
--- | --- | --- | ---
Pasted note | Up to 20,000 characters. | Why (PRD): limits protect free tier AI and storage [ASSUMPTION]. | FR-03
PDF | Up to 10 MB and 50 pages. | Same. | FR-03
Student total | Up to 200,000 characters. | Same. | FR-03
Note processing | Text ready within 60 seconds for notes up to 20 pages. | No PRD reason [ASSUMPTION] [VERIFY against host time limits]. | FR-03
Uploaded PDF | Delete when text is extracted. Never later than 1 hour after upload. | No PRD reason. | FR-03
Low text warning | Warn when extracted text averages under 200 characters per page. Let the student continue. | Why (PRD): slides with little text make weak cards. | FR-03
Garbled text | Reject when more than 30% of extracted characters are not letters, digits or normal punctuation. | No PRD reason. | FR-03
Topic proposal | Needs at least 1,000 characters of notes for the exam. | No PRD reason [ASSUMPTION]. | FR-04
Topic count | 3 to 20 topics, about one per 2,000 characters. | No PRD reason [ASSUMPTION]. | FR-04
First cards | After topic confirmation, show the first 10 cards for the topic with the most text within 90 seconds. | No PRD reason [ASSUMPTION] [VERIFY]. | FR-04
Edited note size | If the new version is under 50% of the old length, ask for confirmation first. | No PRD reason. | FR-05
Card passage match | Similarity of 0.90 or more keeps the card and updates its passage. | No PRD reason [ASSUMPTION A15]. | FR-05

## Questions (FR-07)
Value | Rule | Why | Source
--- | --- | --- | ---
Question set | 5 multiple choice questions, 4 options each. | No PRD reason. | FR-07
Question pool | About 1 question per 300 characters of topic text, at most 30 per topic. | No PRD reason [ASSUMPTION]. | FR-07

## Focus timer and sessions (FR-12)
Value | Rule | Why | Source
--- | --- | --- | ---
Timer | 25 minutes of work, 5 minutes of rest. | No PRD reason. | FR-12
Remaining time | Compute from the saved start time, not by counting seconds. | Why (PRD): phones slow background timers. | FR-12
Heartbeat | Send every 30 seconds while the page is open. | Why (reading): a session end is known without relying on tab close. | FR-12
Idle close | If no heartbeat for 10 minutes, close the session at the last heartbeat. | Same. | FR-12

## Generation limits (FR-17, NFR-05)
Value | Rule | Why | Source
--- | --- | --- | ---
Characters processed | Up to 40,000 per student per day [ASSUMPTION]. | Why (PRD): the app must stay up when the free AI limit is reached. | FR-17
Generation requests | No more than 10 per student per hour [ASSUMPTION]. | Same. | NFR-05
Waiting note | A note waiting over 24 hours shows a plain "still waiting" message. | No PRD reason. | FR-17

## Open (PRD silent)
- Other per-student limits. NFR-05 says they are set in PRD section 8, which is not written.
