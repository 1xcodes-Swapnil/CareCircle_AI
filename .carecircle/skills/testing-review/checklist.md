# Testing Checklist Template

Use this comprehensive checklist to define explicit test criteria before final feature validation.

```markdown
# CareCircle AI — Feature Testing Report

**Target Component**: [e.g., SOS Wearable Handler]
**Tester / Test Automation**: [Quality Assurance Agent]

### 1. Functional Success Paths (Positive Tests)
- [ ] Active SOS button dispatch triggers Event Bus with family member ID.
- [ ] Planner selects critical escalation specialist.
- [ ] Caregiver dashboard panel flashes active red alert status.
- [ ] Notification engine sends outbound trigger request successfully.

### 2. Negative & Defensive Security Scenarios
- [ ] Unauthenticated or spoofed request raises JWT validation error.
- [ ] Bad telemetry payload (e.g., negative heart rates) fails input schema validation.
- [ ] Database timeouts are caught and display local retry controls.

### 3. Agent and Clinical Safety Gaps
- [ ] Reflection Agent blocks diagnosis attempts (e.g., "AI detects stroke").
- [ ] MCP tool blocks attempt to write directly into system ledger collections.
- [ ] Clinical disclaimer is always visible on relevant AI outputs.

### 4. Synchronization & Device Integration
- [ ] Device emulator correctly transmits live telemetry.
- [ ] Browser speech synthesizer initializes without blocking the user interface thread.
- [ ] UI reflects alert updates within 500ms of simulated incident.
```
