---
name: run-ai-generation-pipeline
description: Generate topic proposals, flashcards, or multiple-choice questions from student notes while verifying passage attribution and distractor rules.
---

1. Check the student ID and ensure the daily character limit does not exceed 40,000 characters[cite: 2].
2. Check the note status in the database. Ensure the note state is queued or reading before proceeding[cite: 1, 2]. Reject failed or garbled notes[cite: 1, 2].
3. Read generation constraints, prompts, and provider configurations from `rules/ai-pipeline.md` and `rules/limits-and-defaults.md`[cite: 1].
4. Dispatch the generation prompt to the approved AI provider using only the target passage text and allowed parameters[cite: 1, 2].
5. Validate flashcard outputs:
   - Ensure every flashcard contains the source passage text directly extracted from the note[cite: 1, 2].
   - Ensure every flashcard includes the exact disclaimer: "Based on your notes. Check your course materials if unsure."[cite: 1, 2]
6. Validate multiple-choice question outputs:
   - Verify that the correct option matches a statement found verbatim in the source passage[cite: 1, 2].
   - Check that each wrong option (distractor) is either a statement taken from another passage in the same topic, or the correct statement with exactly one number change, term change, or negation[cite: 1, 2].
   - Verify that each question set contains exactly 5 multiple-choice questions with 4 options each[cite: 2].
   - Ensure every question includes the exact disclaimer: "Based on your notes. Check your course materials if unsure."[cite: 1, 2]
7. Discard any item that fails validation. Do not write failing items to the database[cite: 1, 2].
8. Attach required R9 generation metadata to each passing item: model name, prompt version, note version, and timestamp[cite: 1, 2].
9. Write valid items and their R9 records to the database scoped strictly by the student ID[cite: 1, 2].
10. Update the note processing status to ready[cite: 1, 2].