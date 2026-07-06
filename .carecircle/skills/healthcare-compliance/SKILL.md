# Skill: Healthcare Compliance & Safety (`healthcare-compliance`)

## 1. Purpose
This skill ensures that all automated operations, data storage structures, and AI-generated outputs of CareCircle AI maintain clinical safety, regulatory alignment (HIPAA), and ethical integrity. It guarantees the system operates strictly as an administrative and informative care aid, never as an independent diagnostic or prescribing medical authority.

## 2. When this skill should be invoked
Invoke this skill whenever:
* Creating or updating AI assistant features or specialist agent system instructions.
* Designing views that display clinical metrics (blood pressure, oxygen, blood glucose, drug alerts).
* Modifying user interfaces representing medication schedules or dosage instructions.
* Handling Patient Health Information (PHI) storage and database structures.

## 3. Preconditions
* The agent orchestration and reflection layers are configured.
* Secure and permissioned database collections are in place.

## 4. Inputs
* AI Assistant candidate outputs or clinical advice suggestions.
* Wearable physiological telemetry data logs.
* User roles and PHI privilege claims.

## 5. Expected outputs
* A compiled `healthcare_compliance_report.md` auditing compliance status.
* Screen outputs verified free of clinical diagnoses or dosage edits, appended with proper medical disclaimers.

## 6. Step-by-step execution workflow

### Phase 1: Core Clinical Guardrails
1. **Diagnosis Restriction Check**: Analyze any advice text. It must strictly describe observations and telemetry trends, never assert medical diagnoses (e.g., replace *"You are experiencing cardiovascular failure"* with *"Your heart rate is currently elevated above your baseline. We suggest sitting down and scheduling a physician evaluation"*).
2. **Prescription & Dosage Lock**: The system is completely blocked from recommending or modifying medication doses. Any dosage instructions must strictly mirror verified physician prescriptions retrieved via secure database channels.
3. **Medical Substitute Check**: The output must explicitly disclaim that it does not replace a licensed medical professional.

### Phase 2: Escalation & Emergency Rules
1. **Critical Telemetry Boundaries**: Define hard safety limits for physiological telemetry (e.g., Heart Rate < 40 or > 140 BPM, oxygen saturation < 90%).
2. **Escalation Path Trigger**: When data exceeds these boundaries, bypass conversational AI checking. Instantly display prominent "Contact Emergency Services / Dispatch SOS" controls on all active caregiver views.

### Phase 3: PHI & Explainable AI Requirements
1. **PHI Protection**: All Protected Health Information must be stored in encrypted database fields. PHI must never be transmitted in raw text to un-audited external analytics APIs or public model endpoints.
2. **Explainable Health Recommendations**: Any health trend insight (e.g., "suggest checking hydration") must produce an XAI trace showing the underlying source of evidence (e.g., "based on 4% decrease in daily water intake logs and elevated baseline pulse").

## 7. Validation checklist
- [ ] AI outputs have zero statements declaring a disease diagnosis.
- [ ] The system does not suggest changing medication dosage.
- [ ] Emergency escalation buttons display immediately when baseline telemetry thresholds are breached.
- [ ] All AI health insights are appended with standard medical disclaimers.
- [ ] XAI traceability logs are stored alongside all clinical observations.

## 8. Common failure scenarios
* **Specialist Hallucinating Diagnoses**: A specialist agent asserts a clinical condition. *Mitigation*: The Reflection Agent scans output for medical terms (e.g., "diagnose", "symptom of", "disease") and automatically rewrites the message if flagged.
* **Leaking PHI**: Patient names are passed in raw prompt payloads to public API logs. *Mitigation*: Mask or sanitize patient identifiers in prompt contexts (e.g., use "Recipient" or anonymized IDs).

## 9. Acceptance criteria
* The generated compliance report rates the feature as fully compliant (PASS).
* Disclaimers are clearly visible on every screen displaying AI-derived suggestions.

## 10. Deliverables
* Completed `healthcare_compliance_report.md`.
* Configured Reflection Agent safety filters.
* High-priority emergency escalation UI overlays.

## 11. Dependencies on other skills
* **Agent Orchestrator (`agent-orchestrator`)**: Provides the routing pipeline where Reflection validation occurs.
* **Security Review (`security-review`)**: Validates database encryption and PHI authorization parameters.

## 12. Example usage
Reviewing an AI summary about missed medications:
Verify the response states: *"Eleanor Vance has not logged her morning medications. Smartwatch heart rate is stable at 72 bpm. Please check on her. Disclaimer: CareCircle is an informational coordinator..."*

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** let an AI assistant suggest modifying a prescription (e.g., "Take half a pill instead").
* ❌ **DO NOT** claim the system is a certified medical diagnostic device.
* ❌ **DO NOT** store patient records or telemetry logs in open, public, or un-authenticated database tables.
