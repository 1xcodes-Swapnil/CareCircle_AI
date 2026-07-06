# Skill: Memory Engine (`memory-engine`)

## 1. Purpose
The purpose of this skill is to manage and structure short-term, long-term, and relational memories for CareCircle AI. It ensures that the AI possesses continuous historical context of each family member's wellness logs, avoiding conversational amnesia while explaining memory retrieval decisions for absolute transparency.

## 2. When this skill should be invoked
Invoke this skill whenever:
* Customizing contextual prompt construction.
* Storing new episodic, clinical, or relationship facts into the database.
* Designing features that fetch, aggregate, or visualize historical caregiver timelines.

## 3. Preconditions
* Functioning data models for members, medications, logs, and events.
* Vector embedding libraries or indexed keyword-based database search algorithms configured.

## 4. Inputs
* **Incoming Prompt / Search Intent**: The primary query string.
* **Context Identifiers**: Family ID, recipient ID, and user role.
* **Recall Depth**: Specified history range (e.g., last 24 hours, last 30 days).

## 5. Expected outputs
* **Weighted Context Payload**: Compiled relevant records to append to prompt system instructions.
* **Memory Rationale metadata**: Diagnostic statistics outlining why specific logs were selected.

## 6. Step-by-step execution workflow
1. **Request Received**: The pipeline registers a call requesting context recall.
2. **Short-Term Chat Scan**: Pull the most recent message transcripts from the active session.
3. **Database Registry Extraction**: Query structured metrics:
   * Current medication taken states.
   * Smartwatch vitals averages (e.g., sleep, steps, pulse baseline).
4. **Long-Term Episodic Match**: Query unstructured semantic notes matching keywords or concepts.
5. **Explainable Retrieval Compilation**: Format each matched memory block with:
   * Why it was selected (e.g., "Matched 'lisinopril' with medical schedules").
   * Influence guidelines (e.g., "Instruct model to note that medication was taken late").
   * Selection confidence score (0.0 to 1.0).
6. **Inject Context**: Combine and pass this consolidated context payload into the active Specialist Agent's instruction stream.

## 7. Validation checklist
- [ ] Active context queries return both structured metrics and unstructured notes.
- [ ] No database amnesia occurs across distinct conversation sessions.
- [ ] Each injected memory features explicit reason and confidence metadata.
- [ ] Storing new memories does not duplicate existing database records.

## 8. Common failure scenarios
* **Context Bloat**: Memory payload is too large, exceeding model token limits. *Mitigation*: Cap retrieved memories to the top 3 highest-scoring items.
* **Irrelevant Recall**: Retrieving irrelevant old logs due to loose keyword matching. *Mitigation*: Adjust semantic similarity thresholds to a minimum score of 0.75.

## 9. Acceptance criteria
* Memory retrieval executes in under 1.5 seconds.
* Prompt assembly successfully resolves historical medication adherence trends.

## 10. Deliverables
* Integrated context matching routines in `/server/agents.ts` or database schemas.
* Diagnostic logging formats for memory scores.

## 11. Dependencies on other skills
* **Agent Orchestrator (`agent-orchestrator`)**: Memory payloads are the fundamental input for the orchestration loop.
* **Performance Review (`performance-review`)**: Queries must be fast and indexed to prevent sluggishness.

## 12. Example usage
An AI agent analyzing steps retrieves:
* *Memory Log*: "Eleanor walked 4500 steps yesterday."
* *Memory Trace*: [Confidence: 0.98] - "Selected because user asked: 'Did Eleanor move around yesterday?'"

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** clear conversation histories on every page reload or session switch.
* ❌ **DO NOT** pass massive raw database dumps into the model without filtering first.
* ❌ **DO NOT** allow cross-tenant memory leaks where one family's memory is recalled in another family's session.
