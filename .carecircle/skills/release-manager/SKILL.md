# Skill: Production Release Manager (`release-manager`)

## 1. Purpose
The purpose of this skill is to act as the final, un-bypassable quality and safety gate before code is deployed to our live Cloud Run container environments. It collects, reviews, and validates audit reports from all other specialized engineering skills, completely refusing release approval unless every single gate has marked a verified PASS.

## 2. When this skill should be invoked
Invoke this skill immediately prior to merging code to production branches, tagging release candidates, or deploying final containers to Cloud Run.

## 3. Preconditions
* All feature implementations are finished.
* All prior audit reports are generated in their respective skill folders.

## 4. Inputs
* A set of completed audit reports:
  * `architecture_review.md`
  * `production_review.md`
  * `security_report.md`
  * `performance_report.md`
  * `testing_report.md`
  * `healthcare_compliance_report.md`
  * `hackathon_review.md`

## 5. Expected outputs
* A compiled `release_checklist.md` report.
* A definitive `RELEASE APPROVED` or `RELEASE BLOCKED` verdict.

## 6. Step-by-step execution workflow
1. **Pre-Release Audit Intake**: Gather the individual review report markdown files from the skills library directories.
2. **Review Verification Checks**: Walk through each report:
   * Reject release if any report is missing or marked `FAIL`.
   * Reject release if any active `Critical` or `High` findings remain unresolved in any audit report.
3. **Build & Lint Verification**: Trigger standard compiler validations:
   * Ensure `npm run build` succeeds cleanly.
   * Ensure `npm run lint` yields zero warnings or errors.
4. **Final Gate Assessment**: Review the application interface manually to confirm no broken buttons, dead router paths, placeholder elements, or un-synced visual states exist.
5. **Verdict Generation**:
   * If all audits PASS: Generate `RELEASE APPROVED` status and proceed with deployment.
   * If any audit FAILs: Generate `RELEASE BLOCKED` status, list blocking defects, and return code to the development stage.

## 7. Validation checklist
- [ ] Every dependent audit report is complete and uploaded.
- [ ] All reports return an explicit PASS decision.
- [ ] Production build compiles cleanly with zero warnings.
- [ ] No placeholder copy ("Lorem Ipsum") or broken links are visible.
- [ ] Final verdict is signed and logged.

## 8. Common failure scenarios
* **Bypassed Compliance Gate**: Releasing a visual component that is missing its `healthcare_compliance_report.md`. *Mitigation*: Automated CI pipelines must check for the presence of compliance report assets before permitting deployment commands to run.
* **Stale Reports**: Releasing code using a 3-week-old security report. *Mitigation*: Release audit reports must be dated and signed within the active release window.

## 9. Acceptance criteria
* Releases must achieve a 100% PASS rate across all 9 verification grids.
* Zero compiler, linter, or console errors exist in the target build.

## 10. Deliverables
* Signed and approved `release_checklist.md` document.
* Final production release candidate artifact.

## 11. Dependencies on other skills
* Depends strictly on **all other skills** (`architecture-review`, `security-review`, `production-review`, `healthcare-compliance`, `ui-ux-review`, `performance-review`, `testing-review`, `hackathon-review`).

## 12. Example usage
Running the Release Manager gate:
1. Verify `security_report.md` shows zero open critical STRIDE items.
2. Verify `healthcare_compliance_report.md` shows zero diagnostic text.
3. Execute build and linter to check for typescript errors.
4. If perfect, generate `release_checklist.md` with status `RELEASE APPROVED`.

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** approve a release with an active "TODO" or unresolved security issue.
* ❌ **DO NOT** skip or bypass an audit report simply to hit a delivery timeline.
* ❌ **DO NOT** allow manual overrides of the PASS/FAIL gate decision criteria.
