# Skill: Agent Orchestration (`agent-orchestrator`)

## 1. Purpose
This skill acts as the authoritative specification for all AI capabilities in CareCircle AI. It ensures that every AI execution follows a standardized, multi-agent orchestration pattern rather than ad-hoc, unmonitored direct LLM invocations. This guarantees cognitive safety, auditability, consistent state tracking, and high-quality clinical and family-care recommendations.

## 2. When this skill should be invoked
This skill must be invoked whenever:
* Creating, modifying, or auditing any feature that utilizes generative AI or LLMs.
* Introducing new AI endpoints in the backend (e.g., `/api/ai/*`).
* Refactoring conversational interfaces, voice assistants, or automated clinical advice engines.
* Setting up new specialist agents or adding tools to the Model Context Protocol (MCP) layer.

## 3. Preconditions
* A functioning Node.js backend with Express and TypeScript.
* The Google GenAI SDK (`@google/genai`) installed and configured.
* Valid `GEMINI_API_KEY` loaded in the environment (never exposed to the client).
* Database connections and the MCP engine initialized.

## 4. Inputs
* **User Query / System Event**: Raw text prompt, structured JSON event, or vocal transcription.
* **Family Context**: Active recipient identifier, relevant health profile, current date/time.
* **Active Memory Context**: Historical logs, recent chat history, and episodic family updates.
* **Available MCP Tools**: Directory of accessible database-querying/mutating functions.

## 5. Expected outputs
* **Orchestrated Safe Response**: Reflected and validated text/audio output for the user.
* **Explainable AI (XAI) Log**: A structured trace details file containing execution steps, confidence scores, and reasoning.
* **Triggered Side Effects**: Up-to-date conversation memory store, database writes, and dispatched push notifications.

## 6. Step-by-step execution workflow

### Phase 1: Planner Orchestration & Memory Retrieval
1. **Request Interception**: The Event Bus routes the incoming event or user query exclusively to the **Planner Agent**.
2. **Context Resolution & Memory Retrieval Order**:
   * **Step A (Short-Term)**: Retrieve the last 5 messages from the active chat session.
   * **Step B (Historical Registers)**: Query structured database states (Active medication schedules, wearable vitals baseline, recent unresolved alerts).
   * **Step C (Long-Term Episodic)**: Query long-term semantic notes (preferences, relationship profiles, family dynamics).
3. **Task Decomposition**: The Planner reviews retrieved memory, identifies gaps, and compiles a structured execution plan.

### Phase 2: Specialist Selection & MCP Tool Invocation
1. **Specialist Selection Strategy**: The Planner dynamically selects from registered specialist agents (e.g., `ClinicalAnalyst`, `SensorInterpreter`, `MedicationAdvisor`) based on matching keywords or intent tags.
2. **MCP Tool Invocation Rules**:
   * Specialist agents are strictly forbidden from executing raw database queries or direct SQL calls.
   * Specialists must execute actions *only* via Model Context Protocol (MCP) tool bindings.
   * Every MCP tool execution must validate the executing agent's permissions (e.g., a non-clinical specialist cannot alter medication state).

### Phase 3: Reflection Validation
1. **Safety Compliance Filtering**: Before any content is prepared for the client, the output must pass through the **Reflection Agent**.
2. **Validation Requirements**:
   * Check for the complete absence of clinical diagnoses.
   * Validate that no drug dosages have been modified.
   * Inject mandatory clinical safety disclaimers.
   * Verify that no raw Protected Health Information (PHI) is disclosed to unprivileged user roles.

### Phase 4: Action Execution & State Updates
1. **Action Execution Rules**: The Notification Agent convertsapproved AI plans into actions (e.g., writing new medication logs, dispatching WebPush alerts, flashing warning cards in Mission Control).
2. **Conversation Memory Update**: Append the validated interaction (input, tool outcomes, and output) to the short-term conversation thread database.
3. **XAI Logs Generation**: Save a structured JSON metadata block representing the execution trace for auditability.

## 7. Validation checklist
- [ ] Direct model calls (outside the `/api/chat` or orchestrated endpoints) are removed.
- [ ] Short-term, historical, and long-term memory retrieval orders are strictly respected.
- [ ] Specialists only query data through registered MCP tools.
- [ ] Output has successfully passed through the Reflection Agent.
- [ ] An Explainable AI (XAI) metadata object has been persisted to the database.

## 8. Common failure scenarios
* **Memory Stale/Missing**: The model hallucinates a baseline profile. *Mitigation*: Fall back to a hardcoded standard clinical profile safety baseline and flag an orchestration warning.
* **MCP Tool Error / Timeout**: The database is unresponsive. *Mitigation*: Try 2 immediate retries with exponential backoff; if still failing, use a read-only local cached state.
* **Reflection Validation Rejection**: Specialist outputs medical advice or alters a dose. *Mitigation*: Reject the response, log an audit alert, and display an alternative prompt: *"I cannot recommend clinical changes. Please consult a physician."*

## 9. Error Recovery, Retries & Fallbacks
* **Retry Policy**: Any transient model or MCP tool error triggers up to 3 automatic retries with a base delay of 500ms and exponential backoff (`delay = base * 2^attempt`).
* **Fallback Handling**: If all retries fail, return a structured fallback response containing:
  ```json
  {
    "status": "partial_success_fallback",
    "message": "I noticed an interruption in retrieving live smartwatch data, but based on your recent logs...",
    "fallbackApplied": true
  }
  ```

## 10. Acceptance criteria
* The multi-agent pipeline completes successfully in development in under 3.5 seconds.
- No direct client-side model invitations are used.
- Every chat response displays a visual "Explainable AI Log" toggle in developer or caregiver views.

## 11. Deliverables
* Integrated orchestration routes in `/server/agents.ts`.
* MCP tool definitions in `/server/db.ts` or `/server/mcp/`.
* Explanatory visualization widgets on the active interface.

## 12. Dependencies on other skills
* **Healthcare Compliance (`healthcare-compliance`)**: Enforces clinical safety parameters during the Reflection phase.
* **Memory Engine (`memory-engine`)**: Feeds context during Phase 1.
* **Security Review (`security-review`)**: Validates MCP access permissions.

## 13. Example usage
```typescript
import { PlannerAgent } from './agents/planner';
import { MemoryEngine } from './services/memory';

async function handleUserMessage(userId: string, query: string) {
  // 1. Memory retrieval first
  const memories = await MemoryEngine.retrieve(userId, query);
  
  // 2. Planner agent orchestrates
  const plan = await PlannerAgent.orchestrate(query, memories);
  
  // 3. Delegate to Specialist and run Reflection...
}
```

## 14. Anti-patterns (What must never be done)
* ❌ **DO NOT** make ad-hoc, inline direct `ai.models.generateContent` calls in UI components.
* ❌ **DO NOT** let a specialist agent generate drug recommendations or alter doses without Reflection checking.
* ❌ **DO NOT** bypass the database rules and run raw SQLite/SQL write queries inside the AI response loop.
