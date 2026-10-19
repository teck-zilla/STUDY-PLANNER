# rules/ai-pipeline.md
Job: how the app calls AI and queues AI work. The trust rules, the wrong option rules and the one-sentence weekly note rule are held in AGENTS.md. Numeric limits are in rules/limits-and-defaults.md.
PRD section 7 is not written. Only PRD-backed rules are below. Ask before building generation.

## Rules
1. The AI provider is Gemini free tier. Why (reading): fixed by the project stack.
2. Code fills the weekly note from a fixed template: the 3 weakest topics, minutes studied, one proposed plan change, and what changed since last week. If AI fails, use the plain template (FR-10). Why (PRD): every number must come from the database.
3. Read stored cards and questions from the database. Do not call the AI to re-make them when a screen loads. Why (reading): the PRD stores them (section 1), and the free limit is small (FR-17).
4. Run generation through a queue. When the provider limit is hit, new work waits, existing cards and plans keep working, and the note shows "Cards will be ready by tomorrow" (FR-17). Why (PRD): the app must stay up when the free AI limit is reached.
5. An admin switch pauses all new generation (FR-17). Why (reading): it lets the human stop spend and failures fast.

## Open (PRD silent, ask the human)
- Provider settings and the model name.
- The prompts, and how the prompt version is named.
- How topics are proposed, and whether AI does it (FR-04).
- Which provider makes embeddings.
- How note text is kept from acting as instructions to the model.
