# Skill: Security Review (`security-review`)

## 1. Purpose
The purpose of this skill is to perform comprehensive, production-grade security audits on CareCircle AI. It leverages STRIDE threat modeling and OWASP Top 10 guidelines to defend sensitive healthcare telemetry, prevent data leaks, and ensure robust API security.

## 2. When this skill should be invoked
Invoke this skill when:
* Designing, implementing, or updating authentication and authorization systems.
* Introducing new REST API endpoints, WebSockets, or background services.
* Modifying database access patterns, collections, or model permissions.
* Incorporating third-party OAuth flows or managing system environments.

## 3. Preconditions
* A fully defined API layer schema.
* Configured authentication tokens or session middlewares.
* Environment variables declared in `.env.example`.

## 4. Inputs
* Source files containing server-side routes, middlewares, and client request logic.
* Database collections/tables schema rules (e.g., Firestore rules, schema definitions).
* System environment configurations.

## 5. Expected outputs
* A detailed `security_report.md` specifying vulnerabilities and active mitigations.
* Clean, non-vulnerable, production-secure code files.

## 6. Step-by-step execution workflow

### Phase 1: STRIDE Threat Audit
1. **Spoofing**: Audit login/registration flows, ensuring session cookies are HttpOnly and Secure, and JWT signatures are strictly verified.
2. **Tampering**: Validate that all user inputs are sanitized against SQL Injection, NoSQL Injection, and Cross-Site Scripting (XSS).
3. **Repudiation**: Verify that critical operations (such as medication clearances, alert resolutions, and user creations) write immediate, immutable records to the audit log.
4. **Information Disclosure**: Ensure Role-Based Access Control (RBAC) is enforced so users can only view permitted files and records matching their privileged context.
5. **Denial of Service**: Verify rate limiting is active on expensive endpoints (e.g., AI assistant calls and login handlers).
6. **Elevation of Privilege**: Protect routes by validating roles (e.g., restricting doctor/admin access vectors from regular family accounts).

### Phase 2: OWASP Top 10 & API Security Review
1. **Broken Object Level Authorization (BOLA)**: Check that endpoints verify *ownership* (e.g., `/api/member/:id` ensures the authenticated user actually owns or manages the target member).
2. **Broken Authentication**: Verify JWT lifetimes are short, tokens are invalid on logout, and passwords are hashed using high-entropy algorithms (such as bcrypt).
3. **Sensitive Data Exposure**: Scan payloads to verify that unneeded Protected Health Information (PHI) is stripped before network transit.
4. **Security Misconfiguration**: Confirm that verbose database error stack traces are hidden from the production API response.

### Phase 3: MCP & Secrets Management Audit
1. **MCP Authorization**: Ensure specialist agents invoking Model Context Protocol tools have explicitly matched privilege rights for the targeted action.
2. **Secrets Scrutiny**: Audit all config files to guarantee that zero API keys, database passwords, or secret strings are committed to version control.
3. **Audit Logging**: Confirm critical system actions write comprehensive, immutable entries.

## 7. Validation checklist
- [ ] JWT tokens are verified in an abstract server middleware layer.
- [ ] Endpoints check both authenticated state and role-level privileges.
- [ ] Inputs are validated using strict schemas (e.g., Zod, JOI, or custom checkers).
- [ ] No API keys or secrets are exposed in frontend client files.
- [ ] Audit logs are generated for high-priority health actions.
- [ ] Rate limiters are declared on authentication and AI assistant routes.

## 8. Common failure scenarios
* **Bypassed Route Verification**: Adding a new API route but omitting the auth middleware. *Mitigation*: Configure automatic routing frameworks to require authentication by default unless explicitly white-listed.
* **Exposed API Key**: Committing a development credential to git. *Mitigation*: Enforce static scan rules on commits and load keys via environment files.

## 9. Acceptance criteria
* The generated security report contains zero unmitigated "Critical" or "High" security findings.
* All inputs are strictly checked prior to database mutations.

## 10. Deliverables
* Completed `security_report.md` auditing findings.
* Validated server-side middleware and role checkers.

## 11. Dependencies on other skills
* **Healthcare Compliance (`healthcare-compliance`)**: Sensitive PHI data rules dictate security access boundaries.
* **Architecture Review (`architecture-review`)**: Secure route boundaries depend on clean layer decoupling.

## 12. Example usage
Auditing a new endpoint `/api/medications/update`:
Verify that the middleware extracts the JWT, checks that the user has a "caregiver" or "clinical" role, sanitizes the incoming medication string using an escape library, and logs the update event with timestamps in the audit ledger.

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** store active JWTs or passwords in plain-text client local storage.
* ❌ **DO NOT** write endpoint handlers that trust the user ID supplied in the request body without verifying the JWT token context first.
* ❌ **DO NOT** commit raw API keys to github or let them leak into client-side asset builds.
