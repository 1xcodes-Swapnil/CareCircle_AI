# Skill: Hackathon Demo & Evaluation Review (`hackathon-review`)

## 1. Purpose
The purpose of this skill is to optimize the CareCircle AI build against competitive hackathon and evaluation rubrics. It ensures that the application's unique technical innovations (multi-agent pipelines, MCP, and Explainable AI) are visible, interactive, and compelling within a brief five-minute evaluation window.

## 2. When this skill should be invoked
Invoke this skill in the preparation phases before deploying, demoing, or submitting the application for judge evaluation.

## 3. Preconditions
* The application is functionally stable and production-ready.
* The "Demo Simulator Panel" is implemented.

## 4. Inputs
* Active, stable product build.
* Competitor or hackathon evaluation rubrics.

## 5. Expected outputs
* A structured `hackathon_review.md` evaluation report.
* A highly interactive, self-documenting demo configuration.

## 6. Step-by-step execution workflow
1. **Rubric Alignment Check**: Check if judges can clearly identify our core engineering highlights:
   * Multi-Agent Orchestration (Planner, Specialists, Reflection).
   * Model Context Protocol (MCP) tool access boundaries.
   * Immutable health ledger logs and audit trails.
   * Real-time Caregiver synchronization (WebSockets / Event Bus).
2. **Visual Logs Verification**: Verify that the "Explainable AI Logs" panel is highly readable and directly accessible on-screen.
3. **Trigger Implementation**: Implement or confirm simple, single-click buttons to instantly fire clinical emergencies (such as heart rate spikes or falls) in the active simulator dashboard.
4. **Usability Review**: Walk through a mock 5-minute presentation path to guarantee no lag or complex setup steps impede the judge.
5. **Report Generation**: Compile results into the review template.

## 7. Validation checklist
- [ ] Judges can view live agent thoughts and traces instantly.
- [ ] Emergency events (falls, SOS, medication missed) can be simulated in one click.
- [ ] No server-side setup or local keys are required for the judge to play the demo.
- [ ] App is responsive and works flawlessly on a demo screen.

## 8. Common failure scenarios
* **Invisible Innovations**: The multi-agent pipeline works beautifully, but judges have no idea it exists because there's no visual log. *Mitigation*: Ensure the AI assistant has an expander button showing "Explainable AI Trace Logs".
* **Simulation Congestion**: Forcing the user to manually wait 6 hours for a missed medication event to fire. *Mitigation*: Provide simulation fast-forward triggers.

## 9. Acceptance criteria
* The review report confirms that the full multi-agent cycle can be initiated and audited in under 3 minutes.
* Visual presentation is premium, distinct, and high-impact.

## 10. Deliverables
* Completed `hackathon_review.md` report.
* High-impact visualization widgets.

## 11. Dependencies on other skills
* **Demo Mode (`demo-mode`)**: Supplies standard event triggers.
* **UI/UX Review (`ui-ux-review`)**: Guarantees visual polish.

## 12. Example usage
Running the hackathon audit:
Verify that when a "Smartwatch fall" simulation button is pressed, the caregiver page displays a warning overlay within 500ms, and the AI panel loads a clinical trace explaining why it recommended emergency contact dispatch.

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** use unstyled browser alert modals for alerts during a judge presentation.
* ❌ **DO NOT** hide our best architectural assets behind dense, unreadable server-side node logs.
* ❌ **DO NOT** present a simple mock slide deck in place of a fully operational full-stack container application.
