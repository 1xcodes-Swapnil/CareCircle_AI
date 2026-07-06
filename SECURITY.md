# Security Policy

## Supported Versions

| Version | Supported |
|:--------|:----------|
| 1.x     | ✅ Active |

---

## Reporting a Vulnerability

**Do not file a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is available may put users at risk.

### How to Report

Send a detailed report to the project maintainer via one of these channels:

- **GitHub Private Vulnerability Reporting**: Use the [Security Advisories](https://github.com/your-username/carecircle-ai/security/advisories/new) feature (preferred).
- **Email**: Contact the maintainer directly. Email address is available on the GitHub profile.

### What to Include

A useful vulnerability report includes:

1. **Description** — Clear description of the vulnerability type (e.g., SQL injection, IDOR, hardcoded secret).
2. **Impact** — What could an attacker do if they exploited this?
3. **Affected components** — Which file(s), endpoint(s), or function(s) are involved?
4. **Reproduction steps** — Numbered, minimal steps to reproduce the issue.
5. **Proof of concept** — Code snippets, curl commands, or screenshots (if safe to include).
6. **Suggested fix** — If you have one.

### What to Expect

| Timeline | Action |
|:---------|:-------|
| **Within 48 hours** | Acknowledgement of receipt |
| **Within 7 days** | Initial assessment and severity classification |
| **Within 30 days** | Fix developed and tested (for critical/high severity) |
| **Coordinated** | Public disclosure after fix is released |

We will credit you in the changelog and security advisory unless you prefer to remain anonymous.

---

## Security Architecture Overview

CareCircle AI implements the following security controls:

### Authentication & Session Management
- Sessions use HMAC-SHA256 signed tokens (JWT-compatible format) with 24-hour expiration.
- `JWT_SECRET` must be a strong, random, environment-injected secret. The server logs a fatal error if this variable is missing.
- Passwords are hashed using PBKDF2 with SHA-512, 10,000 iterations, and a random 16-byte salt per user.

### Authorisation
- All protected API endpoints require a valid `Authorization: Bearer <token>` header.
- Role-based access control (RBAC) enforces caregiver vs. care-recipient data boundaries.
- Agent operations pass through the MCP Server which validates schemas before any database mutation.

### Data Protection
- SQLite database is stored server-side only and never transmitted to clients.
- The frontend only receives the data it explicitly requests via authenticated API endpoints.
- Base64-encoded medical document uploads are processed server-side; raw data is not persisted on disk (processed in-memory).

### Input Validation
- All API endpoints validate incoming request bodies before processing.
- Express JSON body parser is limited to 20 MB to prevent memory exhaustion from malformed payloads.
- Agent inputs are schema-validated by the MCP Server before tool execution.

### Dependencies
- Dependencies are managed via npm. Run `npm audit` to check for known vulnerabilities.
- Keep Node.js, Redis, and npm packages updated.

---

## Known Limitations (Demo Mode)

The following limitations apply in the current demo/hackathon version and should be addressed before any production deployment with real user data:

| Limitation | Risk | Mitigation for Production |
|:-----------|:-----|:--------------------------|
| SQLite single-file database | No row-level multi-tenant isolation | Migrate to PostgreSQL with RLS |
| In-process BullMQ (no separate worker process) | Shared memory space | Deploy separate worker containers |
| No HTTPS enforcement in dev mode | Traffic interception on local network | Enforce HTTPS via reverse proxy in production |
| Demo credentials enabled by default | Unauthorised access to demo data | Set `ALLOW_DEMO_LOGIN=false` in production |
| No rate limiting on all endpoints | Brute-force risk on some routes | Add Redis-based rate limiting to all auth routes |
| JWT revocation not implemented | Stolen tokens remain valid until expiry | Implement token blocklist in Redis |

---

## Responsible Disclosure Policy

We follow a coordinated disclosure model:

1. Reporter submits vulnerability privately.
2. Maintainer confirms receipt within 48 hours.
3. Fix is developed in a private branch.
4. Fix is released and a GitHub Security Advisory is published.
5. Reporter is credited (unless anonymity is requested).

We request a minimum **14-day embargo** from the time a fix is available before public technical details are shared, to allow users time to update.

---

*This security policy is effective as of July 2026.*
