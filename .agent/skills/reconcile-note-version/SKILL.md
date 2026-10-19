---
name: reconcile-note-version
description: Reconcile existing cards and vector chunks when a student edits, re-pastes, or re-uploads a study note.
---

1. Receive the updated note content and retrieve the prior note version for the target student ID[cite: 2].
2. Compare character lengths. If the new version is under 50% of the old version's length, halt and request student confirmation before processing[cite: 2].
3. If the input is a PDF, extract real text, confirm readable characters, and immediately delete the source PDF file[cite: 1, 2].
4. Iterate through each existing card associated with the prior note version[cite: 2]:
   - Normalize whitespace and letter casing on the stored passage and the new note text[cite: 2].
   - Search for an exact word-for-word match[cite: 2]. If found, keep the card active and preserve its passage reference[cite: 2].
   - If exact match fails, compute text similarity between the stored passage and the closest matching text section in the new note[cite: 2].
   - If similarity is 0.90 or greater, keep the card and update its stored passage to the new text[cite: 2].
   - If similarity is less than 0.90, mark the card as "possibly outdated" and queue it for student keep/archive decision[cite: 2].
5. Update note version records and link existing results and review histories to the new version[cite: 1, 2].
6. Identify text passages that were modified or removed[cite: 1, 2].
7. Delete vector embeddings belonging to removed passages according to `rules/vector-store.md`[cite: 1, 2].
8. Generate and store new vector chunks for newly added sections[cite: 1, 2].