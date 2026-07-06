# CareCircle AI — Engineering Playbook & Skills Library

Welcome to the **CareCircle AI Engineering Playbook**. This document establishes the formal, production-grade engineering framework and development lifecycle used to build, audit, and release CareCircle AI applications.

---

## The CareCircle AI Philosophy

CareCircle AI is a safety-critical, clinical-adjacent family care coordination assistant. Every feature we implement must adhere to strict guidelines of medical safety, high privacy, architectural purity, and operational speed. To automate and enforce these standards across our developers and AI agents, we maintain a hidden, authoritative suite of **AI Engineering Skills** located in `.carecircle/skills/`.

---

## Directory Structure of the Library

The skills library is organized as follows:

```text
.carecircle/
└── skills/
    ├── agent-orchestrator/
    │   ├── SKILL.md                 # Multi-Agent Specification
    │   └── templates.md             # Specialist schemas and XAI JSON templates
    ├── production-review/
    │   ├── SKILL.md                 # Complete cleanup standards
    │   └── production_review.md     # Production audit checklist & report
    ├── architecture-review/
    │   ├── SKILL.md                 # SOLID/DRY rules
    │   └── architecture_review.md   # Architectural structural report
    ├── security-review/
    │   ├── SKILL.md                 # STRIDE + OWASP Top 10 rules
    │   └── security_report.md       # Core Threat Model security audit report
    ├── healthcare-compliance/
    │   ├── SKILL.md                 # Clinical safety & HIPAA guidelines
    │   └── healthcare_compliance_report.md # Clinical validation checklist
    ├── memory-engine/
    │   └── SKILL.md                 # Episodic long/short-term context rules
    ├── ui-ux-review/
    │   ├── SKILL.md                 # Elderly accessibility and motion standards
    │   └── ui_ux_review.md          # Design, contrast, & touch audit report
    ├── performance-review/
    │   ├── SKILL.md                 # Render, fetch, & dependency optimization
    │   └── performance_report.md    # Latency and render audit report
    ├── testing-review/
    │   ├── SKILL.md                 # Positive, negative, & edge-case metrics
    │   └── testing_report.md        # Test suite matrix report
    ├── hackathon-review/
    │   ├── SKILL.md                 # Kaggle evaluation and presentation rules
    │   └── hackathon_review.md      # Demo ready checklist
    ├── demo-mode/
    │   ├── SKILL.md                 # Real-time event simulator
    │   └── templates.md             # Sensory payload JSON templates
    └── release-manager/
        ├── SKILL.md                 # Release Gatekeeper standards
        └── release_checklist.md     # Unified pre-release gate clearance matrix
```

---

## Reusable Skills & Report Artifacts Matrix

| # | Skill Name | Primary Purpose | Required Report Artifact |
|---|------------|-----------------|--------------------------|
| 1 | **agent-orchestrator** | Enforce multi-agent execution pipeline standards | Inline Explainable AI (XAI) traces |
| 2 | **production-review** | Post-implementation complete quality audit | `.carecircle/skills/production-review/production_review.md` |
| 3 | **architecture-review** | Maintain SOLID, cleanly decoupled structure | `.carecircle/skills/architecture-review/architecture_review.md` |
| 4 | **security-review** | Analyze STRIDE, OWASP Top 10, and API keys | `.carecircle/skills/security-review/security_report.md` |
| 5 | **healthcare-compliance** | Eliminate clinical diagnoses & dosage advice | `.carecircle/skills/healthcare-compliance/healthcare_compliance_report.md` |
| 6 | **memory-engine** | Keep episodic & historical recall transparent | Explanatory selection metadata |
| 7 | **ui-ux-review** | Validate contrast ratios and touch points | `.carecircle/skills/ui-ux-review/ui_ux_review.md` |
| 8 | **performance-review** | Optimize re-renders and parallel fetches | `.carecircle/skills/performance-review/performance_report.md` |
| 9 | **testing-review** | Verify functional limits, E2E, and edge cases | `.carecircle/skills/testing-review/testing_report.md` |
| 10 | **hackathon-review** | Expose complex AI thoughts to evaluators | `.carecircle/skills/hackathon-review/hackathon_review.md` |
| 11 | **demo-mode** | Instantly trigger realistic health scenarios | Active interactive developer panel views |
| 12 | **release-manager** | Collect gate clearances; issue deployment verdict | `.carecircle/skills/release-manager/release_checklist.md` |

---

## Standardized Software Development Lifecycle (SDLC)

Every pull request, feature, or platform iteration must progress through the following development lifecycle:

```text
  [1. Requirements]
          │
          ▼
  [2. Architecture Review]
          │
          ▼
  [3. Security Review]
          │
          ▼
  [4. Implementation]
          │
          ▼
  [5. Agent Orchestration Review]
          │
          ▼
  [6. Healthcare Compliance]
          │
          ▼
  [7. UI/UX Review]
          │
          ▼
  [8. Performance Review]
          │
          ▼
  [9. Testing Review]
          │
          ▼
  [10. Production Review]
          │
          ▼
  [11. Hackathon Review]
          │
          ▼
  [12. Release Manager Approval]
```

### Stage 1: Requirements
* **Entry Criteria**: User request received or system design ticket defined.
* **Exit Criteria**: High-level specification and list of required data boundaries finalized.
* **Artifacts Produced**: Requirements brief or user-story definition.
* **Responsibilities**: Product Owner (PO), Business Analyst.

### Stage 2: Architecture Review
* **Entry Criteria**: Requirements approved.
* **Exit Criteria**: Component boundaries, database models, and API definitions validated. No monolithic file layout plans.
* **Artifacts Produced**: `architecture_review.md` report.
* **Responsibilities**: Lead Software Architect.

### Stage 3: Security Review
* **Entry Criteria**: Structural design plan established.
* **Exit Criteria**: STRIDE threat mitigation plan defined. Inputs sanitized, authentication and authorization endpoints secured.
* **Artifacts Produced**: `security_report.md` report.
* **Responsibilities**: SecOps Lead, Security Architect.

### Stage 4: Implementation
* **Entry Criteria**: Security and architectural plans approved.
* **Exit Criteria**: Features coded using strict type-safe TypeScript and native CSS modules.
* **Artifacts Produced**: Verified component code and server-side route integrations.
* **Responsibilities**: Full-Stack Developers, AI Engineers.

### Stage 5: Agent Orchestration Review
* **Entry Criteria**: AI feature code ready for analysis.
* **Exit Criteria**: Verification that all AI features route through the Planner-Specialist-Reflection pipeline, generating Explainable AI logs. Direct, unmonitored model calls are removed.
* **Artifacts Produced**: Live orchestrated prompts and JSON schemas.
* **Responsibilities**: AI Integration Engineer.

### Stage 6: Healthcare Compliance
* **Entry Criteria**: AI pipelines and layouts compiled.
* **Exit Criteria**: Zero diagnostics claims or dosage edits. Presence of disclaimers and emergency escalation indicators verified.
* **Artifacts Produced**: `healthcare_compliance_report.md` report.
* **Responsibilities**: Clinical Safety Lead, Regulatory Analyst.

### Stage 7: UI/UX Review
* **Entry Criteria**: Views render and pass basic functional tests.
* **Exit Criteria**: All text meets WCAG AA contrast (4.5:1), interactive components are at least 48px, layouts resize down to 320px portrait, and entrance motion is smooth.
* **Artifacts Produced**: `ui_ux_review.md` (or combined checklist) report.
* **Responsibilities**: Design Principal, Frontend Engineer.

### Stage 8: Performance Review
* **Entry Criteria**: Interface layouts finalized.
* **Exit Criteria**: CPU execution is smooth, lists utilize stable keys, and `useEffect` dependency arrays are stabilized with no raw objects/arrays.
* **Artifacts Produced**: `performance_report.md` report.
* **Responsibilities**: Performance Lead, Core Engineer.

### Stage 9: Testing Review
* **Entry Criteria**: App components ready for complete evaluation.
* **Exit Criteria**: Verification matrix passes across positive, negative, edge-case, and role security boundaries.
* **Artifacts Produced**: `testing_report.md` report.
* **Responsibilities**: QA Automation Lead.

### Stage 10: Production Review
* **Entry Criteria**: Automated tests pass successfully.
* **Exit Criteria**: Codebase completely scrubbed of `TODO` statements, dead code, mock data arrays, and debug logs.
* **Artifacts Produced**: `production_review.md` report.
* **Responsibilities**: Release Engineer, Lead Auditor.

### Stage 11: Hackathon Review
* **Entry Criteria**: High-quality production candidate compiled.
* **Exit Criteria**: Verify simulator panel works and highlights multi-agent actions, providing instant visual traces for judges.
* **Artifacts Produced**: `hackathon_review.md` report.
* **Responsibilities**: Product Owner.

### Stage 12: Release Manager Approval
* **Entry Criteria**: All preceding stages completed and reports generated.
* **Exit Criteria**: Complete checklist signed off. Definitive `RELEASE APPROVED` verdict issued.
* **Artifacts Produced**: Signed `release_checklist.md` document.
* **Responsibilities**: Release Manager, Operations Director.

---

## How to Invoke Skills

To invoke any skill during development, add its explicit directive block to your work guidelines:
> *"Applying **Security Review Skill** guidelines, review our JWT authentication middleware and document findings inside the `security_report.md` template."*

Detailed execution workflows and rules for each stage reside inside `.carecircle/skills/<skill-folder>/SKILL.md`. Refer to them to maintain un-compromised, professional healthcare engineering standards.
