# Skill: Performance Review (`performance-review`)

## 1. Purpose
The purpose of this skill is to audit and optimize CareCircle AI's runtime efficiency, client-side re-renders, and database query latency. It guarantees a lightweight experience that runs smoothly even on lower-power devices (smartwatches, family tablets).

## 2. When this skill should be invoked
Invoke this skill when:
* Writing or refactoring React components containing state updates, lists, or complex logic.
* Writing or modifying React `useEffect` hooks.
* Implementing API fetches or database queries.

## 3. Preconditions
* Target features are functionally complete.
* Build systems compile cleanly.

## 4. Inputs
* Source files for components, hooks, and database access logic.
* Bundle compilation metrics.

## 5. Expected outputs
* A structured `performance_report.md` detailing optimization audits.
* Stable, highly memoized components with optimized hooks.

## 6. Step-by-step execution workflow
1. **Dependency Array Audit**: Review every single `useEffect` hook in the codebase. Verify that no raw arrays, objects, or inline functions are listed as dependencies.
2. **State Location Check**: Verify state is colocated. Do not lift state unnecessarily to parent components, which causes widespread re-renders.
3. **List Memoization Check**: Ensure all mapped arrays render using stable, unique `key` attributes (never use array index keys).
4. **API Call Optimization**: Batch parallel fetches (e.g., loading baseline metrics and active medication logs) using `Promise.all` to prevent network serial blocking.
5. **Report Generation**: Compile performance findings and decision matrix.

## 7. Validation checklist
- [ ] No objects or arrays reside directly in `useEffect` dependency arrays.
- [ ] All lists render using stable, unique ID keys.
- [ ] Heavy visualization components utilize `React.memo` or memoized hooks.
- [ ] Network API requests batch parallel actions efficiently.

## 8. Common failure scenarios
* **Infinite Re-Render Loop**: A hook dependency includes an un-stabilized object, causing continuous re-rendering and freezing the screen. *Mitigation*: Memoize objects using `useMemo` or pass primitive property keys.
* **Serialized Fetch Blocking**: The page takes 4 seconds to load because three API calls are executed sequentially. *Mitigation*: Combine using `Promise.all`.

## 9. Acceptance criteria
* The generated performance report lists zero "Critical" rendering bugs.
* Client-side UI transitions operate smoothly at stable frame rates.

## 10. Deliverables
* Completed `performance_report.md` report.
* Optimized state handlers and memoized components.

## 11. Dependencies on other skills
* **Architecture Review (`architecture-review`)**: Clean modular separation supports efficient state colocation.
* **UI/UX Review (`ui-ux-review`)**: Skeletons and transitions must run without stutter or rendering lags.

## 12. Example usage
Auditing a list of family members:
Ensure that instead of passing a raw list object directly into `useEffect`, we match against a primitive length indicator or use stable item IDs, ensuring list re-renders only occur when actual members change.

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** update a component's local state directly inside its main rendering body, as this triggers infinite loops.
* ❌ **DO NOT** use array indices (`key={index}`) as keys when rendering lists.
* ❌ **DO NOT** trigger nested, redundant database reads inside a loop (e.g., N+1 query patterns).
