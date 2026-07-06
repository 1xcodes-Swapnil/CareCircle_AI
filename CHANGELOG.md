# Changelog

All notable changes to CareCircle AI are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- PostgreSQL migration for multi-tenant row-level security
- Dockerfile and docker-compose for containerised deployment
- GitHub Actions CI/CD pipeline
- Unit and integration test suite
- Real SMS/push notification delivery (currently simulated)
- OAuth integration for Google/Apple Health wearable data

---

## [1.0.0] — 2026-07-06

### Added

#### Core Platform
- Full-stack React 19 + Express application with Vite build tooling
- SQLite (`better-sqlite3`) persistence layer with WAL mode and foreign key constraints
- Server-Sent Events (SSE) endpoint for real-time client synchronisation
- JWT-style HMAC-SHA256 session token authentication
- PBKDF2-SHA512 password hashing (10,000 iterations, random salt)
- Role-based access control: `caregiver` and `carerecipient` roles

#### Multi-Agent Orchestration
- **Planner/Supervisor Agent**: Decomposes user requests into structured multi-step plans
- **Reflection Agent**: Audits all agent plans against safety and hallucination boundaries
- **AI Safety Layer**: Deterministic policy firewall blocking clinical diagnosis outputs
- **Dynamic Agent Registry**: Capability discovery for specialist agent routing
- **Specialist Agents**: OCR/Document, Wellness, Medication, Calendar, Report, and Chat agents
- Explainable AI (XAI) trace logging — full agent reasoning chain visible in Mission Control

#### Model Context Protocol (MCP) Server
- Custom MCP-compatible Tool Server with JSON Schema parameter validation
- 25+ registered MCP tools covering family data, medications, vitals, appointments, documents
- Attribute-Based Access Control (ABAC) enforcement per tool
- Cryptographic audit logging (`[MCP SERVER INVOCATION]` headers) for every mutation
- Real-time MCP Tool Inspector in Developer Mode UI

#### Background Processing (BullMQ)
- 7 isolated BullMQ background queues powered by Redis
- `prescription-ocr-queue`: Clinical document OCR and medication extraction
- `report-generation-queue`: Automated weekly health report synthesis
- `notifications-queue`: Asynchronous alert dispatch
- `wearable-sync-queue`: High-frequency biometric telemetry ingestion
- `background-ai-queue`: Deep multi-agent planning runs
- `scheduled-reminders-queue`: Medication and check-in reminders
- `cache-maintenance-queue`: Proactive cache warm-up
- Exponential backoff retry with Dead Letter Queue (DLQ) support
- Live job progress broadcasting via Redis Pub/Sub

#### Gemini API Circuit Breaker
- Automatic detection of `429 RESOURCE_EXHAUSTED` rate-limit responses
- Configurable cooldown window to prevent cascading quota exhaustion
- Graceful degradation to local clinical rules/regex engine when API is unavailable
- Warning banner displayed to users during fallback mode

#### Clinical Document Processing
- Real-time file upload interface (PDF and image formats via FileReader API)
- Gemini Vision model extraction with structured JSON output schema
- Local fallback parser for offline/quota-limited environments
- Interactive Clinical Verification Portal — edit extracted fields before committing
- Multi-agent execution on document approval (Medication, Calendar, Report, Planner agents)

#### Frontend — Caregiver Dashboard
- Primary command centre with family health summary cards
- One-click clinical report generation
- Real-time alert feed and timeline
- Medication compliance tracking

#### Frontend — Health Overview
- Dynamic wearable device integration hub (Apple Health, Fitbit, Google Fit, Garmin, Samsung Health)
- Computed health status badges from live biometrics
- Sleep depth analysis and step progress visualisation
- Device-state-gated rendering (empty state when no device linked)

#### Frontend — Family Wellbeing
- Secure caregiver-to-recipient messaging
- Care circle calendar with appointment management
- Clinical document upload and review portal
- OCR prescription upload flow

#### Frontend — Recipient Companion
- Simplified companion interface for care recipients
- Daily wellness check-ins (mood, pain, energy, appetite)
- Cognitive exercise scheduling
- Emergency SOS trigger

#### Frontend — AI Assistant
- Conversational AI chat with caregiver context awareness
- Explainable AI reasoning trace display
- MCP tool invocation history

#### Frontend — Developer Mode / Mission Control
- Live queue depth and job metrics across all 7 BullMQ queues
- Redis cluster health monitoring (latency, pub/sub channels, active keys)
- Cache performance metrics (hit/miss ratio)
- MCP Tool Inspector with full parameter and response history
- Event simulation panel (emergency triggers, medication alerts, vital spikes)
- Agent orchestration log stream

#### Documentation
- `README.md`: Production-quality project overview and setup guide
- `ARCHITECTURE.md`: Detailed system architecture (current implementation + production roadmap)
- `ENGINEERING_PLAYBOOK.md`: Full SDLC and review framework with 12 skill modules
- `INSTALLATION.md`: Detailed environment setup guide
- `DEPLOYMENT.md`: Local and production deployment instructions
- `CONTRIBUTING.md`: Contribution guidelines and code standards
- `CODE_OF_CONDUCT.md`: Contributor Covenant v2.1
- `SECURITY.md`: Security policy and responsible disclosure
- `API_DOCUMENTATION.md`: Complete REST API reference
- `PROJECT_STRUCTURE.md`: Repository layout and file-purpose guide
- `HACKATHON_SUBMISSION.md`: Kaggle AI Agents Intensive submission document
- `DEMO_GUIDE.md`: Step-by-step demo walkthrough for evaluators

### Security
- Removed hardcoded JWT fallback secret from `server/auth.ts`
- Added fatal error logging when `JWT_SECRET` is missing from environment
- Expanded `.env.example` to document all required environment variables
- Expanded `.gitignore` to cover databases, Redis dumps, uploads, OS/IDE files

### Changed
- Package name corrected from `react-example` to `carecircle-ai`
- HTML page title corrected from `My Google AI Studio App` to `CareCircle AI`
- `CLINICAL_OCR_VALIDATION_REPORT.md` moved from root to `docs/` directory
- Example Redis password in `docs/INFRASTRUCTURE_VALIDATION_REPORT.md` replaced with safe placeholder

---

[Unreleased]: https://github.com/your-username/carecircle-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/carecircle-ai/releases/tag/v1.0.0
