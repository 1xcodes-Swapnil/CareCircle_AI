# Skill: Instant Demo & Event Simulator (`demo-mode`)

## 1. Purpose
The purpose of this skill is to establish and coordinate realistic, real-time health and safety event simulations. This enables judges, developers, and product testers to instantly trigger complex multi-agent event workflows and observe live reactions on the caregiver dashboard within a brief 5-minute preview path.

## 2. When this skill should be invoked
Invoke this skill when building, testing, or demonstrating real-time alert and sensor ingestion behaviors on the caregiver and recipient platforms.

## 3. Preconditions
* Functioning Event Bus in the server/client layers.
* Real-time UI updates (WebSockets, polling, or state synchronization) initialized.

## 4. Inputs
* Active simulated event payload (e.g., HR spike, Fall, SOS action).
* Active family member ID context.

## 5. Expected outputs
* Dynamically updated records in database tables (alerts, timeline logs, vitals).
* Animated alerts and notifications pushed instantly to active client browsers.

## 6. Step-by-step execution workflow
1. **Trigger Initiated**: Developer triggers a scenario button (e.g., "Simulate Fall Detection") in the developer dashboard.
2. **Payload Emission**: The simulator formats a realistic, time-stamped JSON sensory event payload (see templates).
3. **Event Bus Processing**: The Event Bus routes the sensory payload directly to the multi-agent pipeline.
4. **Planner Evaluation**: The Planner Agent evaluates priority, selects the appropriate Specialist (e.g., Clinical Analyst), retrieves baseline family memory, and initiates the safety reflection checks.
5. **Database Sync**: The action engine writes the alert state and timeline log dynamically to the database.
6. **UI Update Propagation**: The caregiver browser intercepts the state mutation, rendering a smooth visual notification overlay and triggering an AI assistant response.

## 7. Validation checklist
- [ ] Simulated event triggers generate a real database write transaction.
- [ ] Active client screens update without requiring manual page reloads.
- [ ] Multi-agent thought steps are traceable during simulation.
- [ ] Reset trigger is active to return database tables to baseline states.

## 8. Common failure scenarios
* **Dangling Simulated State**: Triggering events fills the DB with junk data, breaking subsequent tests. *Mitigation*: Provide an automatic "Reset Database to Clean Demo Slate" routine.
* **Synchronization Lag**: The event fires but the UI takes over 10 seconds to update due to slow polling. *Mitigation*: Optimize the real-time event listener loop on the client.

## 9. Acceptance criteria
* Simulated emergencies propagate from trigger click to client-side visualization in under 1 second.
* Database updates remain realistic and consistent.

## 10. Deliverables
* Completed `templates.md` payload files.
* Interactive Developer Mode Simulator UI Panel.
* DB seeding and reset endpoints.

## 11. Dependencies on other skills
* **Agent Orchestrator (`agent-orchestrator`)**: Processes the event payloads.
* **Healthcare Compliance (`healthcare-compliance`)**: Restricts simulated messages to safe clinical guidance.

## 12. Example usage
To demonstrate "Fall Detection":
Click the "Fall Detected" button. Observe the heart rate baseline load, the screen flash a soft warning red alert, and the caregiver AI panel output: *"Wearable sensor registered a possible impact at 10:24 AM. Eleanor's vitals appear stable, but we recommend utilizing our call smartwatch shortcut."*

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** trigger simulated notifications using simple client-side mock timers (`setTimeout`), bypass the backend entirely, or use un-synced visual placebo states.
* ❌ **DO NOT** clutter the primary caregiver dashboard with raw simulation buttons. Keep them in a dedicated collapsible developer tray.
* ❌ **DO NOT** leave simulation logs in database tables during production releases.
