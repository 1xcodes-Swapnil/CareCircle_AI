# Contributing to CareCircle AI

Thank you for your interest in contributing to CareCircle AI. This document describes the process for submitting contributions, reporting bugs, and proposing new features.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Engineering Playbook](#engineering-playbook)
- [Commit Message Format](#commit-message-format)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Report unacceptable behaviour to the project maintainers.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/carecircle-ai.git
   cd carecircle-ai
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and fill in the required values
   ```
5. **Start Redis** (required for background workers):
   ```bash
   # macOS with Homebrew
   brew services start redis
   # Ubuntu/Debian
   sudo service redis-server start
   # Docker
   docker run -d -p 6379:6379 redis:7-alpine
   ```
6. **Run the development server**:
   ```bash
   npm run dev
   ```

See [INSTALLATION.md](INSTALLATION.md) for full environment setup instructions.

---

## Reporting Bugs

Before filing a bug report, please search existing [GitHub Issues](https://github.com/your-username/carecircle-ai/issues) to avoid duplicates.

When filing a bug report, include:

- **Clear title** summarising the problem.
- **Steps to reproduce** — minimal, numbered steps.
- **Expected behaviour** — what you expected to happen.
- **Actual behaviour** — what actually happened.
- **Environment** — OS, Node.js version, Redis version, browser (if UI).
- **Logs** — relevant console output or server logs (redact any personal data).

> **Security vulnerabilities**: Do **not** file public issues for security bugs. See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## Suggesting Features

Feature suggestions are welcome. Open an issue with the label `enhancement` and include:

- **Problem statement** — what problem does this solve?
- **Proposed solution** — how should it work?
- **Alternatives considered** — other approaches you evaluated.
- **Additional context** — mockups, references, or related issues.

---

## Development Workflow

CareCircle AI follows the **CareCircle Engineering Playbook** SDLC defined in [ENGINEERING_PLAYBOOK.md](ENGINEERING_PLAYBOOK.md). All contributions must pass the relevant review gates for the scope of the change.

### Branch Naming

| Type | Format | Example |
|:---|:---|:---|
| Feature | `feat/short-description` | `feat/sos-alert-sms` |
| Bug Fix | `fix/short-description` | `fix/medication-reminder-timezone` |
| Documentation | `docs/short-description` | `docs/api-documentation` |
| Refactor | `refactor/short-description` | `refactor/extract-vitals-hook` |
| Security Fix | `security/short-description` | `security/jwt-secret-validation` |

### Running Quality Checks

```bash
# TypeScript type-check
npm run lint

# Build (verifies the entire stack compiles cleanly)
npm run build
```

---

## Pull Request Process

1. **Create a branch** from `main` using the naming convention above.
2. **Make focused commits** — each commit should represent a single logical change.
3. **Write a clear PR description** including:
   - What changed and why.
   - Which Engineering Playbook review stages apply.
   - How to test the change.
   - Screenshots (for UI changes).
4. **Ensure all checks pass**:
   - `npm run lint` — zero TypeScript errors.
   - `npm run build` — clean build.
5. **Request review** from a maintainer.
6. **Address feedback** — respond to all review comments.

PRs will not be merged if:
- TypeScript compilation fails.
- Secrets or credentials are detected in the diff.
- The change modifies business logic without corresponding tests or review documentation.
- The PR adds new UI components without accessibility consideration.

---

## Code Style

### TypeScript

- Use **strict TypeScript** — no `any` types unless unavoidable and documented.
- Prefer `interface` over `type` for object shapes.
- Use `const` by default; `let` only when mutation is necessary.
- All exported functions and classes must have JSDoc comments.

### React

- Functional components only — no class components.
- Use `useState` and `useCallback` for local state; avoid deeply nested state.
- Each component should have a single clear responsibility.
- Components exceeding 300 lines should be split into sub-components.

### Server

- All Express route handlers must authenticate via `AuthController.authenticate` middleware before accessing database operations.
- Database mutations must go through the `MCPServer` tool interface — no direct `db.*` calls from route handlers outside of established patterns.
- Error responses must follow the `{ error: string }` JSON format.

### File Organisation

```
src/
  components/     # React view components (one file per view)
server/
  db.ts           # Database schema and DAO layer
  agents.ts       # Agent orchestration
  mcpServer.ts    # MCP tool registry and executor
  bullmq.ts       # Background queue workers
```

---

## Engineering Playbook

All significant contributions must follow the review stages in [ENGINEERING_PLAYBOOK.md](ENGINEERING_PLAYBOOK.md):

| Change Type | Required Reviews |
|:---|:---|
| New API endpoint | Architecture Review, Security Review |
| New UI component | Architecture Review, UI/UX Review |
| AI agent changes | Agent Orchestration Review, Healthcare Compliance |
| Database schema change | Architecture Review, Security Review, Production Review |
| Release | All 12 stages |

---

## Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[Optional body: explain the why, not the what]

[Optional footer: BREAKING CHANGE, Closes #issue]
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `security`, `perf`, `test`, `chore`

**Examples**:
```
feat(agents): add fall-detection specialist agent
fix(auth): remove hardcoded JWT fallback secret
docs(readme): add demo credentials section
security(api): add rate limiting to /api/chat endpoint
```

---

## Healthcare & Safety Considerations

CareCircle AI is a clinical-adjacent platform. All contributions involving health data, medication scheduling, or AI recommendations must:

- **Never** output clinical diagnoses, dosage recommendations, or prescription advice.
- Always include appropriate disclaimers that the platform is a coordination tool, not a medical device.
- Follow the Healthcare Compliance guidelines in `.carecircle/skills/healthcare-compliance/SKILL.md`.

---

*Thank you for helping make CareCircle AI better for family caregivers everywhere.*
