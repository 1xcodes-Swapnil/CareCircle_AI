# Skill: Production Review (`production-review`)

## 1. Purpose
The purpose of this skill is to enforce a rigorous post-implementation audit on every feature before merge. This ensures we eliminate placeholders, hardcoding, broken logic, and debug traces, resulting in clean, robust, and user-ready production deployments.

## 2. When this skill should be invoked
Invoke this skill after completing feature coding, prior to submitting the build for testing or release approval.

## 3. Preconditions
* Feature implementation is functionally complete.
* Code compiles cleanly with zero critical syntax errors.

## 4. Inputs
* Active source code branch.
* Compiled application build artifacts.
* User-facing layouts and API endpoints.

## 5. Expected outputs
* A structured `production_review.md` report.
* A resolved, clean codebase free of development leftovers.

## 6. Step-by-step execution workflow
1. **Source Inspection**: Parse the modified files line-by-line.
2. **Leftovers Scrubbing**: Explicitly search for and remove:
   * Commented-out dead blocks.
   * Hardcoded mock data arrays representing users, events, or clinical indicators.
   * `// TODO` or `// FIXME` comments.
   * Leftover `console.log` statements.
3. **Logic Verification**: Test all CRUD routes to ensure they communicate with real persistence databases instead of mock client states.
4. **Error & Loading Verification**: Manually trigger network drops or API failures to verify that skeletons, spinners, and error boundaries render correctly.
5. **Report Generation**: Compile findings into the `production_review.md` template.

## 7. Validation checklist
- [ ] No `TODO` comments or leftover `console.log` statements remain.
- [ ] No hardcoded arrays simulate real user health metrics.
- [ ] Error handlers and loading states are present on all async operations.
- [ ] Component compiles without any TypeScript or lint warnings.

## 8. Common failure scenarios
* **Leftover Debug Code**: Developer commits a console log for debugging. *Mitigation*: Run regex searches for `console\.log` in git hooks.
* **Mock Failures**: Forgotten mock schedules block live data fetching. *Mitigation*: Ensure backend routes strictly fetch from database instances.

## 9. Acceptance criteria
* The review report lists zero "Critical" or "High" severity findings.
* The application builds and lints with absolutely zero warnings.

## 10. Deliverables
* Completed `production_review.md` audit report.
* A scrubbed, high-performance clean codebase.

## 11. Dependencies on other skills
* **Testing Review (`testing-review`)**: Feeds functional test outcomes into this review.
* **UI/UX Review (`ui-ux-review`)**: Dictates standard UX visual states to be audited.

## 12. Example usage
Reviewing the Medication Scheduling component:
Verify that schedule items are pulled from Firestore, that there are no hardcoded placebo drugs in the code, and that failing to fetch schedule renders a retry banner instead of a blank card.

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** commit un-implemented CRUD handlers that silently do nothing.
* ❌ **DO NOT** bypass loading skeleton frames using simple blank screens.
* ❌ **DO NOT** use inline static mock objects to simulate real-time client-agent feedback.
