# Security Audit Checklist

Use this checklist template to evaluate any security improvements or review existing modules.

```markdown
# CareCircle AI — Security Audit Report

**Audit Date**: [Date]
**Assessed Component**: [e.g., API Auth Handler]
**Assessor**: [Lead Security Architect]

### 1. STRIDE Assessment Matrix
- [ ] **Spoofing**: Verified session tokens cannot be forged or hijacked.
- [ ] **Tampering**: All input strings are sanitized; API uses parameterized database queries.
- [ ] **Repudiation**: Medication actions, alert clearances, and role elevations write a durable audit trail.
- [ ] **Information Disclosure**: Personal Health Information (PHI) is hidden from unauthorized roles.
- [ ] **Denial of Service**: Rate limits are active on high-intensity AI routes.
- [ ] **Elevation of Privilege**: Endpoint enforces user role check before executing administrative/clinical routines.

### 2. Infrastructure & Hygiene
- [ ] No API keys are prefixed with `VITE_` unless intended for safe public client-side consumption.
- [ ] HTTP-only, Secure cookies are utilized for storing critical authentication states.
- [ ] Input schemas are strictly validated against runtime definitions (e.g., zod or validator checks).

---
**Identified Security Deficiencies**:
* [List items that need resolution prior to deployment approval]
```
