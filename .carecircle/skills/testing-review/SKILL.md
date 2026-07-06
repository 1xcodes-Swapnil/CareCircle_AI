# Skill: Test Matrix Generation (`testing-review`)

## 1. Purpose
The purpose of this skill is to automatically define and enforce bulletproof test coverage matrices across all features of CareCircle AI. This guarantees both positive pathways, complex negative edge cases, load thresholds, accessibility, and security regression checks are validated before any release.

## 2. When this skill should be invoked
Invoke this skill whenever:
* Creating a new application module or backend API route.
* Creating critical integration components (like the multi-agent orchestration).
* Preparing a release candidate for production.

## 3. Preconditions
* Feature specs are defined.
* Automated testing frameworks (e.g., Jest, Playwright, Vitest) are configured.

## 4. Inputs
* Source code under review.
* Planned system actions and edge-case parameters.

## 5. Expected outputs
* A structured `testing_report.md` detailing test coverages and findings.
* Completed unit, integration, and E2E verification checklists.

## 6. Step-by-step execution workflow

### Phase 1: Test Plan Definition
For every newly implemented feature, define the following testing categories:
1. **Unit Tests**:
   * Validate logic boundaries, validation schemas (such as phone formatters or dosage ranges), and utility functions.
2. **Integration Tests**:
   * Verify that the Event Bus, database queries, and multi-agent pipelines collaborate correctly.
3. **End-to-End (E2E) Tests**:
   * Simulate a full caregiver journey (e.g., logging in, viewing live telemetry, opening AI assistance, and marking medications taken).
4. **Edge Cases**:
   * Handle empty schedules, disconnected wearable sensors, and offline synchronization caches.
5. **Negative Tests**:
   * Attempt logins with bad tokens, feed the API invalid inputs, and simulate network drops during transactions.
6. **Load Tests**:
   * Verify response times remain under 200ms when handling rapid updates from active devices.
7. **Accessibility (a11y) Checks**:
   * Run automated audit tools (such as axe-core) to confirm WCAG AA contrast compliance and keyboard tab-stops.
8. **Security Regression Tests**:
   * Verify that non-caregiver roles are securely blocked from administrative or clinical routes.

### Phase 2: Execution & Logging
1. Run local tests.
2. Verify all tests pass.
3. Compile findings into the report.

## 7. Validation checklist
- [ ] Positive pathways (happy path) are covered.
- [ ] Negative validation inputs are checked.
- [ ] Role-access security boundaries are verified.
- [ ] Keyboard navigation and accessibility contrast audits pass.
- [ ] Edge cases (offline, sensor timeout) are fully mapped.

## 8. Common failure scenarios
* **Skipped Negative Tests**: Developer only tests the "happy path". *Mitigation*: Enforce automated test rules requiring explicit checks for malformed inputs and expired credentials.
* **Flaky UI Tests**: Dynamic mock vitals cause timeline animations to stutter and fail tests. *Mitigation*: Stabilize animation timings in test profiles.

## 9. Acceptance criteria
* The test report is compiled with all critical categories checked.
* Test suite yields 100% pass outcomes with zero active errors.

## 10. Deliverables
* Completed `testing_report.md`.
* Executed test coverage results.

## 11. Dependencies on other skills
* **Security Review (`security-review`)**: Security regression test guidelines are derived from threat models.
* **Healthcare Compliance (`healthcare-compliance`)**: Clinical thresholds dictate bounds for compliance tests.

## 12. Example usage
Reviewing the SOS Alert Component:
Define tests to check:
1. *Positive*: Triggering SOS flashes red indicator on caregiver UI.
2. *Negative*: Expired credentials block SOS dispatch.
3. *Edge Case*: Network drop stores SOS event in offline cache for immediate re-sync when connection returns.

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** mock out the entire database or pipeline to the point where tests are verifying placebo statements.
* ❌ **DO NOT** skip error handling routes or negative path assertions.
* ❌ **DO NOT** bypass automated testing verification by manually asserting "it looks fine in my browser".
