# rules/vector-store.md
Job: the pgvector design. This file owns the vector table. rules/data-model.md does not describe it.
PRD section 9 is not written. Nothing here is decided. Ask before designing.

## Rules
1. Keep the vector table described only in this file. Why (reading): one file, one job.
2. Write no vector design until the human provides it. Why (reading): the PRD gives no source.

## Open (PRD silent, ask the human)
- What gets embedded, and what a chunk is. The PRD uses the word in FR-14 and never defines it.
- Chunk size and overlap.
- Which provider and model makes embeddings, and the vector size.
- The index type and its size on the free tier.
- How passages are assigned to topics (FR-04 points to section 9).
- How the vector column is declared and queried through Prisma.
- How deleted notes are removed from the index.
