# Project Structure — CareCircle AI

This document describes every directory and significant file in the repository, with explanations of purpose and responsibility.

---

## Top-Level Directory

```
carecircle-ai/
├── .carecircle/            # Engineering Playbook skills library
├── assets/                 # Static asset directory (minimal; frontend uses inline SVG)
├── docs/                   # Engineering reports and supplementary documentation
├── server/                 # Server-side TypeScript modules
├── src/                    # React frontend source code
├── .env.example            # Environment variable template (safe to commit)
├── .gitignore              # Version control exclusion rules
├── ARCHITECTURE.md         # System architecture documentation
├── CHANGELOG.md            # Version history
├── CODE_OF_CONDUCT.md      # Community conduct standards
├── CONTRIBUTING.md         # Contribution guidelines
├── DEMO_GUIDE.md           # Evaluator demo walkthrough
├── DEPLOYMENT.md           # Deployment instructions
├── ENGINEERING_PLAYBOOK.md # SDLC framework and skills library reference
├── HACKATHON_SUBMISSION.md # Kaggle AI Agents Intensive submission
├── INSTALLATION.md         # Local setup guide
├── LICENSE                 # MIT License
├── PROJECT_STRUCTURE.md    # This file
├── README.md               # Project overview and quick start
├── REPOSITORY_READINESS_REPORT.md # Pre-publication verification report
├── SECURITY.md             # Security policy and vulnerability reporting
├── index.html              # HTML entry point for the React frontend
├── metadata.json           # Google AI Studio application metadata
├── package.json            # npm package configuration and scripts
├── package-lock.json       # Locked dependency tree
├── server.ts               # Express server entry point
├── tsconfig.json           # TypeScript compiler configuration
└── vite.config.ts          # Vite bundler configuration
```

---

## `server/` — Backend Modules

All server-side TypeScript is kept in this directory as isolated, single-responsibility modules.

```
server/
├── adk.ts              # Google Agent Development Kit (ADK) integration helpers
├── agents.ts           # Multi-agent orchestration: Planner, Specialists, Reflection
├── auth.ts             # JWT-style authentication controller and middleware
├── bullmq.ts           # BullMQ background queue definitions and worker processors
├── db.ts               # SQLite database schema, migrations, and DAO (Data Access Object)
├── eventBus.ts         # In-process event bus for decoupled inter-module communication
├── geminiBreaker.ts    # Gemini API circuit breaker and rate-limit manager
├── mcpServer.ts        # MCP-compatible Tool Server: registry, schema validator, executor
└── redisCache.ts       # Redis cache client, helpers, and TTL management
```

### Key Module Responsibilities

| File | Responsibility |
|:-----|:--------------|
| `server.ts` (root) | Express app bootstrap, route definitions, SSE endpoint, Vite middleware |
| `server/db.ts` | Database schema, seed data, all CRUD operations (DAO pattern) |
| `server/agents.ts` | Planner agent, specialist agent fleet, Reflection agent, local fallback parser |
| `server/mcpServer.ts` | MCP Tool Registry, tool schema validation, ABAC enforcement, audit logging |
| `server/bullmq.ts` | 7 BullMQ queue definitions, worker processor logic, retry policies |
| `server/auth.ts` | PBKDF2 password hashing, token generation/validation, Express middleware |
| `server/geminiBreaker.ts` | Circuit breaker state, cooldown window, rate-limit detection |
| `server/redisCache.ts` | Cache read/write/invalidate helpers, Redis Pub/Sub for SSE synchronisation |
| `server/eventBus.ts` | In-process publish/subscribe for internal event routing |
| `server/adk.ts` | ADK-compatible agent structure helpers |

---

## `src/` — React Frontend

```
src/
├── components/
│   ├── AiAssistantView.tsx         # Conversational AI chat with XAI trace display
│   ├── AlertsTimelineView.tsx      # Alert history and notification log
│   ├── CustomizationView.tsx       # Notification preferences and care settings
│   ├── DashboardView.tsx           # Primary caregiver command centre
│   ├── DeveloperModeView.tsx       # Mission Control: queues, Redis, MCP inspector
│   ├── FamilyMembersView.tsx       # Family member management and profiles
│   ├── FamilyWellbeingView.tsx     # Messaging, calendar, document upload
│   ├── HealthOverviewView.tsx      # Wearable biometrics and device connection hub
│   ├── LandingPage.tsx             # Public landing / marketing page
│   ├── LoginPage.tsx               # Authentication page with demo login shortcuts
│   ├── ProfileView.tsx             # User profile settings
│   ├── RecipientDashboardView.tsx  # Companion interface for care recipients
│   ├── RegisterPage.tsx            # New account registration flow
│   └── SettingsView.tsx            # Application settings
├── App.tsx                         # Root component: router, global state, API client
├── index.css                       # Global Tailwind CSS imports and custom styles
├── main.tsx                        # React DOM mount point
└── types.ts                        # Shared TypeScript type definitions
```

### Frontend Component Responsibilities

| Component | Primary Purpose |
|:----------|:----------------|
| `App.tsx` | Route management, authenticated state, API helper functions, global data fetching |
| `DashboardView.tsx` | Family health summary, medication compliance, report generation, alert overview |
| `HealthOverviewView.tsx` | Wearable device management, live biometric cards, health trends |
| `FamilyWellbeingView.tsx` | Care circle messages, appointment calendar, clinical document OCR upload |
| `DeveloperModeView.tsx` | BullMQ queue inspector, Redis metrics, MCP tool history, event simulator |
| `AiAssistantView.tsx` | Gemini-powered chat, XAI reasoning traces, MCP tool invocation history |
| `RecipientDashboardView.tsx` | Daily check-ins, medication reminders, cognitive exercises, SOS trigger |
| `LandingPage.tsx` | Public feature showcase and authentication entry point |

---

## `docs/` — Engineering Documentation

Internal engineering reports and supplementary technical documentation.

```
docs/
├── CLINICAL_OCR_VALIDATION_REPORT.md   # Clinical document processing pipeline validation
├── INFRASTRUCTURE_VALIDATION_REPORT.md  # Redis + BullMQ architecture specification
└── MCP_STANDARDS_ALIGNMENT_REPORT.md   # MCP protocol alignment and terminology audit
```

---

## `.carecircle/skills/` — Engineering Playbook Skills Library

Each skill directory contains a `SKILL.md` with execution instructions and a report template.

```
.carecircle/skills/
├── agent-orchestrator/     # Multi-agent pipeline standards and XAI schemas
├── architecture-review/    # SOLID/DRY structure audit
├── demo-mode/              # Real-time event simulation standards
├── hackathon-review/       # Kaggle evaluation optimisation
├── healthcare-compliance/  # Clinical safety and HIPAA guidelines
├── memory-engine/          # Episodic memory context rules
├── performance-review/     # Render and fetch optimisation standards
├── production-review/      # Post-implementation cleanup audit
├── release-manager/        # Pre-release gate checklist
├── security-review/        # STRIDE + OWASP Top 10 security audit
├── testing-review/         # Test matrix and coverage standards
└── ui-ux-review/           # Accessibility and design standards
```

See [ENGINEERING_PLAYBOOK.md](ENGINEERING_PLAYBOOK.md) for the full skills reference.

---

## Configuration Files

| File | Purpose |
|:-----|:--------|
| `.env.example` | Template for all required environment variables (commit this; never commit `.env`) |
| `.gitignore` | Files and directories excluded from version control |
| `tsconfig.json` | TypeScript compiler options (strict mode, ESM, node types) |
| `vite.config.ts` | Vite bundler config with React plugin, Tailwind, and dev server settings |
| `package.json` | npm scripts, dependencies, and package metadata |
| `metadata.json` | Google AI Studio application descriptor (capabilities, permissions) |
| `index.html` | Root HTML shell for the Vite/React SPA |

---

## Runtime-Generated Files

These files are created at runtime and are excluded from version control via `.gitignore`:

| File/Directory | Generated By | Contents |
|:---------------|:-------------|:---------|
| `carecircle.db` | SQLite on first server start | All application data (users, medications, vitals, etc.) |
| `dist/` | `npm run build` | Compiled frontend and server bundles |
| `node_modules/` | `npm install` | All package dependencies |
| `*.log` | Server/process logs | Application log output |
| `dump.rdb` | Redis (if configured for persistence) | Redis snapshot |
