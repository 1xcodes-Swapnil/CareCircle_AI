# Orchestration Templates

Use these templates to define custom specialist schemas and compile the final Explainable AI (XAI) metadata.

## 1. Specialist Registration Schema
When registering a new specialist agent in `server/agents.ts`, use this standard structure:

```json
{
  "agentId": "clinical-medication-specialist",
  "name": "Clinical Medication Specialist",
  "domain": "medication_adherence_and_safety",
  "allowedMcpTools": ["getMedicationSchedule", "logMedicationTaken", "checkDrugInteractions"],
  "systemInstruction": "You are a specialist clinical pharmacist agent. Your task is to analyze patient schedule compliance, flag potential drug interactions using the provided MCP tool results, and generate structured feedback for the Reflection Agent."
}
```

## 2. Explainable AI Metadata Payload
Every completed multi-agent cycle must generate and store an explainability trace:

```json
{
  "timestamp": "2026-07-02T07:23:28Z",
  "requestId": "req-9821-3928",
  "plannerReasoning": "User asked about morning lisinopril compliance. Memory engine indicates user was late taking lisinopril twice this week.",
  "retrievedMemories": [
    {
      "id": "mem_01",
      "type": "medication_history",
      "summary": "Missed lisinopril on Monday and Wednesday",
      "relevanceScore": 0.95
    }
  ],
  "invokedTools": [
    {
      "toolName": "getMedicationSchedule",
      "args": { "familyMemberId": "eleanor-vance" },
      "output": { "status": "taken", "time": "8:02 AM" }
    }
  ],
  "specialistLogs": [
    {
      "specialistId": "clinical-medication-specialist",
      "response": "Adherence rate is stable today but late trends require subtle reminder."
    }
  ],
  "reflectionLogs": {
    "safetyStatus": "approved",
    "checkedForDosageAdvice": true,
    "checkedForMedicalDiagnosis": true,
    "remarks": "No diagnosis or clinical dosage modifications identified. Output is safe for caregiver view."
  }
}
```
