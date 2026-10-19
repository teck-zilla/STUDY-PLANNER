---
name: execute-daily-plan-scheduler
description: Calculate and schedule a student's daily study plan items using deterministic ordering rules without invoking AI.
---

1. Filter all database reads strictly by the target student ID[cite: 1, 2].
2. Read scheduling constraints and default values from `rules/plan-rules.md` and `rules/limits-and-defaults.md`[cite: 1].
3. Determine today's cap based on day type (weekday cap or weekend cap)[cite: 1, 2].
4. Calculate the daily target:
   - Check if an exam is within 7 days. If true, set target equal to cap[cite: 2].
   - Otherwise, calculate the median session length of the last 8 sessions of the same day type, rounded to the nearest 5 minutes (minimum 10 minutes, maximum cap)[cite: 2].
   - If fewer than 8 sessions exist, set target to 20 minutes on weekdays and 30 minutes on weekends[cite: 2].
5. Exclude all skipped topics and topics belonging to completed exams[cite: 2].
6. Allocate 10 minutes per pinned topic first, stretching up to the cap if necessary[cite: 2].
7. Calculate the topic score for each remaining topic using the formula: urgency * (1 + 2 * weakness + 0.5 * staleness)[cite: 2]. Multiply by 0.25 if the topic is marked "already know it"[cite: 2].
8. Select due review cards across topics ordered by topic score, then days overdue[cite: 2]. Cap review time at 50% of the target, and do not exceed 40 cards[cite: 2]. Leave remaining due cards as due[cite: 2].
9. Compute new cards per day: divide unseen cards by max(1, days to exam - 3), rounded up, capped at 20[cite: 2]. Pull cards from the highest-scoring topics[cite: 2].
10. Fill remaining target time with 5-question quiz sets from the highest-scoring topics[cite: 2].
11. Apply the 3-topic limit across new card blocks and quiz sets combined[cite: 2].
12. Check for missed days:
    - Retain overdue cards from previous days[cite: 1, 2].
    - Drop unfinished new card blocks and quiz sets from missed days[cite: 1, 2].
    - Append dropped items to the "Dropped today" list[cite: 1, 2].
13. Attach a fixed-template one-line reason to every plan item and dropped item without calling AI[cite: 1, 2].
14. Save the generated plan items (R4 records) and cache the result[cite: 1, 2].