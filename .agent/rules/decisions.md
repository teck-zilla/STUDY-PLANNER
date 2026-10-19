# rules/decisions.md
Job: the human's dated statements. Answers, approvals, verified outside facts and gate status. Nothing else.

## Rules
1. Record only what the human said in this project. Quote it and date it. The agent writes an entry only after the human states it in a session. Why (reading): sessions do not remember each other.
2. Read this file before asking a question. If the answer is here, use it. Why (reading): AGENTS.md asks the human many things, and repeats waste the human's time.
3. If an answer belongs to another rules file, write the value there and log only a pointer here. Why (reading): one place per value.
4. Approved means the human's message in the session names the item and says approved. Why (reading): vague approval is not approval.

## A. Pre-build checks (PRD 5.4). No code starts until all six pass.
Check | Status | Result and date
--- | --- | ---
1. Five 20 minute student interviews | not started |
2. Ten students show their notes, at least 6 typed or text PDFs | not started |
3. Provider run on 3 real sets of notes, 50 items checked by hand, at least 90% pass | not started |
4. Free limits and terms of every outside service verified | not started |
5. Test emails to 5 university addresses, inbox versus spam | not started |
6. UK data protection basics checked | not started |

## B. Verified outside facts (the [VERIFY] items in the PRD)
Fact | Value | Source page | Date
--- | --- | --- | ---
Does the AI provider use free tier inputs for training (FR-01) | OPEN | |
AI provider request and daily limits | OPEN | |
Host function time limit versus the 60 second note processing target (FR-03) | OPEN | |
How often the free scheduler can run (PRD 6.3, rule 15) | OPEN | |
What the email sender requires | OPEN | |
Database host backup retention (FR-14) | OPEN | |

## C. Decisions this file owns
Decision | Answer
--- | ---
Hosting | OPEN
Login library | OPEN
Email sender | OPEN
Scheduler | OPEN
Where the admin pause switch is held (FR-17) | OPEN
How an uploaded PDF reaches the job (FR-03 versus FR-14) | OPEN
PDF text extraction method | OPEN
Whether scripts for pre-build checks 3 and 5 are allowed | OPEN
Whether the weekly G2 audit is built into the app | OPEN
PRD file path | OPEN

## D. Approvals
Item | What was approved | Date
--- | --- | ---
(approved packages and migrations are logged here) | |
