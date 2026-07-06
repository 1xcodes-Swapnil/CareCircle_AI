# Skill: Architecture Review (`architecture-review`)

## 1. Purpose
This skill maintains a highly scalable, modular, and cleanly decoupled full-stack codebase. It enforces SOLID design principles, Separation of Concerns (SoC), and DRY implementation standards to prevent technical debt and monolithic file bloat.

## 2. When this skill should be invoked
Invoke this skill during the initial planning phase of a feature, and immediately after coding to ensure modular structural boundaries are respected.

## 3. Preconditions
* System requirements are defined.
* Directory structure matches standard React/TypeScript full-stack conventions.

## 4. Inputs
* Planned codebase file layout.
* Core component structures and shared services.
* React context providers or global state managers.

## 5. Expected outputs
* A structured `architecture_review.md` report.
* Refactored, modular components under distinct feature-based directories.

## 6. Step-by-step execution workflow
1. **Module Evaluation**: Assess if any single file (e.g., `App.tsx`) exceeds 300 lines of complex markup or multi-concern rendering.
2. **SOLID Audit**:
   * *Single Responsibility*: Ensure presentation layers do not contain database mutation logic.
   * *Interface Segregation*: Verify component props are lean and highly targeted.
3. **Utility Extraction**: Identify repetitive functions (vitals formatting, relative times, compliance ratios) and extract them into `/src/utils/` or `/src/hooks/`.
4. **API Decoupling**: Verify that client components interact with the server solely via defined API routes and never attempt direct database queries.
5. **Report Generation**: Document architectural findings and recommendations.

## 7. Validation checklist
- [ ] Large components (over 300 lines) are split into discrete sub-components.
- [ ] No duplicated mathematical helpers or formatters exist in the codebase.
- [ ] Frontend uses a single, centralized state or prop-passing model.
- [ ] No database adapter code or backend API keys are loaded in client-side files.

## 8. Common failure scenarios
* **Monolithic File Creep**: Everything is added to `App.tsx` because it's fast. *Mitigation*: Automatically reject pull requests modifying `App.tsx` with un-extracted sub-views.
* **Tight Coupling**: UI components depend directly on SQL query structures. *Mitigation*: Route all queries through abstract API layers.

## 9. Acceptance criteria
* Zero "Critical" or "High" structural violations are present.
* The feature is cleanly divided into presentation views, reusable components, and API controllers.

## 10. Deliverables
* Completed `architecture_review.md` report.
* Reusable components registered under `/src/components/`.
* Extracted hooks and utilities.

## 11. Dependencies on other skills
* **Performance Review (`performance-review`)**: Architectural layouts directly affect component re-renders.
* **Security Review (`security-review`)**: Architecture must respect role and route boundaries.

## 12. Example usage
When adding a "Vitals Telemetry" module:
We avoid putting telemetry SVG charting code directly inside the caregiver dashboard file. We create `src/components/VitalsTelemetryChart.tsx` and feed it data using a clean, well-defined prop contract.

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** place database connections or raw environment variable reads in React client files.
* ❌ **DO NOT** duplicate calculation formulas in multiple unrelated component directories.
* ❌ **DO NOT** bundle layout styling, API calls, and local storage state into a single component.
