# CareCircle AI
##  Event-Driven Multi-Agent Family Care & Wellbeing Platform
<p align="center"> <strong>An intelligent multi-agent platform connecting caregivers, recipients, and specialized AI agents through contextual memory, reasoning, and voice interaction.</strong> </p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/JavaScript%20%2F%20TypeScript-Frontend-F7DF1E?style=for-the-badge&logo=typescript&logoColor=white" alt="JavaScript / TypeScript">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Python-AI%20%26%20Backend-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/pgvector-Vector%20Search-336791?style=for-the-badge" alt="pgvector">
  <img src="https://img.shields.io/badge/Redis-Memory%20%26%20Streams-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Kong-API%20Gateway-003459?style=for-the-badge&logo=kong&logoColor=white" alt="Kong">
  <img src="https://img.shields.io/badge/Google%20Cloud-Infrastructure-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Google Cloud">
</p>

##  🌟 Overview

CareCircle AI is a modern, secure, and reliable health-care support platform built for family caregivers. It brings health information, daily care tasks, and wellness data together in one place.

Built as a full-stack, event-driven multi-agent system, CareCircle AI uses different AI agents to handle specific care tasks and work together to support caregivers.

The platform can:

* 📄 Read clinical files and turn unstructured information into useful health data.
* ⌚ Analyze wearable data to track health and wellness signals.
* 💊 Schedule medications and help caregivers manage medication routines.
* 👥 Connect caregiving circles so family members can coordinate care.
* 🧠 Check cognitive and behavioral wellness in real time.
* 🤖 Use specialized AI agents for different care tasks.
* 🧠 Remember important context to provide more relevant responses.
* ⚡ Process events in real time across the platform.
* 🎙️ Support real-time voice-based interaction through the AI assistant.

---

## 1. Core Architecture & Technological Pillars

The platform is engineered around five robust, production-ready architectural layers:

```text
  +---------------------------------------------------------------------------------+
  |                       PRESENTATION LAYER (Vite + React 18)                      |
  |                                                                                 |
  |   +-----------------------+  +------------------------+  +-------------------+  |
  |   |  Caregiver Dashboard  |  | Recipient Companion Scn|  |  Mission Control  |  |
  |   +-----------+-----------+  +-----------+------------+  +---------+---------+  |
  +---------------|--------------------------|-------------------------|------------+
                  v (HTTPS / REST)           v (HTTPS / REST)          v (SSE / Channels)
  +---------------------------------------------------------------------------------+
  |                            API & SECURITY GATEWAY                               |
  |                                                                                 |
  |   +---------------------------------------------------------------------------+  |
  |   |                Express REST Server (JWT / ABAC Routing / CORS)            |  |
  |   +---------------------------------------+-----------------------------------+  |
  +-------------------------------------------|-------------------------------------+
                                              | Dispatch Task
                                              v
  +---------------------------------------------------------------------------------+
  |                     EVENT-DRIVEN BACKGROUND PROCESSING ENGINE                     |
  |                                                                                 |
  |  +---------------------------+  +------------------------+  +----------------+  |
  |  | BullMQ Background Queues  |  | Redis Event-Bus Sync   |  | Redis Cache    |  |
  |  +-------------+-------------+  +------------------------+  +----------------+  |
  +----------------|----------------------------------------------------------------+
                   | Consumes Vitals / Jobs
                   v
  +---------------------------------------------------------------------------------+
  |                         MULTI-AGENT ORCHESTRATION CORE                          |
  |                                                                                 |
  |   +--------------------------------+       +---------------------------------+  |
  |   |   Planner / Supervisor Agent   |------>|  Capability Discovery Service   |  |
  |   +---------------+----------------+       +----------------+----------------+  |
  |                   | Submit Plan                             | Resolve Address   |
  |                   v                        +---------------------------------+  |
  |   +--------------------------------+       |         Specialist Agents       |  |
  |   |        Reflection Agent        |       | - OCR, Wellness, Meds, Calendar |  |
  |   +---------------+----------------+       +----------------+----------------+  |
  |                   | (Validation Receipt)                    |                   |
  |                   v                                         v Executes via      |
  |   +--------------------------------+       +----------------+----------------+  |
  |   |        AI Safety Layer         |------>|   Model Context Protocol (MCP)  |  |
  |   +--------------------------------+       +----------------+----------------+  |
  +-------------------------------------------------------------|-------------------+
                                                                v Safe Queries
  +-------------------------------------------------------------|-------------------+
  |                                 PERSISTENCE LAYER                               |
  |                                                                                 |
  |   +-------------------------------------------------------------------------+   |
  |   |   SQLite Database (better-sqlite3) with WAL Mode & FK Constraints       |   |
  |   +-------------------------------------------------------------------------+   |
  +---------------------------------------------------------------------------------+
```

1. **Multi-Agent Orchestration Core**: Spawns specialized diagnostic agents (OCR, Wellness, Medication, Calendar Agents) orchestrated by a **Planner Supervisor** that decomposes user requests. A separate **Reflection Agent** audits all actions against safety boundaries to prevent hallucinations.
2. **Model Context Protocol (MCP) Server**: Implements standard separation of concerns. AI agents are denied raw database access; they interact only via the **MCP Server**, which enforces strict JSON Schema parameter checks, Attribute-Based Access Control (ABAC), and writes cryptographic logging headers (`[MCP SERVER INVOCATION]`) for every mutation.
3. **High-Fidelity Offline Fallback Engine**: If the Gemini API key is missing or rate limits occur, the system automatically degrades to a **local pattern regex & clinical rules engine**. It parses clinical documents and manages patient schedules gracefully under a marked "Local Fallback Mode."
4. **Asynchronous Background Workers (BullMQ + Redis)**: Offloads high-frequency vitals processing, schedule tracking, and document analyses to isolated queues to maintain `< 5ms` API gateway latencies.
5. **Hardened Persistence Layer**: Fully migrated to **SQLite (`better-sqlite3`)** configured with high-performance Write-Ahead Logging (`WAL` mode) and strict foreign key integrity (`foreign_keys = ON`), guaranteeing transactional correctness under concurrent operations.

---

## 2. Dynamic Wearable Integration

The platform features an interactive **Wearable Integration Core** displaying vital biometrics, sleep depth, and step progress.
* **Smart Device State Filtering**: Biometric cards and visual trends are rendered *only* when an active device (Apple Health, Fitbit, Google Fit, Garmin, or Samsung Health) is securely linked. If unlinked, a beautifully polished empty state is displayed with clear pairing instructions.
* **Computed Health Badges**: Status badges (e.g., **Stable** / **Elevated** for heart rate; **Good Depth** / **Restless** for sleep; **Goal Met** / **Active** for steps) are computed dynamically from live biometrics and target goals instead of being hardcoded.
* **Instant Verification Logs**: Shows real-time synchronization tables containing payloads and status receipts directly linked to background BullMQ telemetry.

---

## 3. Directory Layout

```text
├── server/
│   ├── db.ts                # SQLite database Schema, indexes, and DAO CRUD interfaces
│   ├── agents.ts            # Specialist Agents, Planner Supervisor, and local fallback parser
│   ├── mcpServer.ts         # Model Context Protocol registry, schema validator, and core logic
│   ├── bullmq.ts            # Background worker pipelines & isolated task queues
│   └── geminiBreaker.ts     # Gemini API circuit breaker & rate-limit manager
├── src/                     # React 18 Frontend
│   ├── components/
│   │   ├── DashboardView.tsx       # Primary caregiver command center with report generation
│   │   ├── HealthOverviewView.tsx  # Dynamic wearable biometrics & Connection Hub
│   │   ├── FamilyWellbeingView.tsx # Care circle communications, calendar, and OCR uploads
│   │   └── DeveloperModeView.tsx   # Live Mission Control telemetry and queue logs
│   ├── App.tsx              # Client router and state synchronizer
│   └── index.css            # Tailwind CSS styling global sheet
├── data/
│   └── carecircle.db        # SQLite database file (automatically created)
├── server.ts                # Express REST Server routing, static handlers, and server-sent events
├── metadata.json            # Application name, permissions, and major capabilities config
├── package.json             # Package scripts and dependency allocations
└── .env.example             # Environment template for credentials
```

---

## 4. The 7 Isolated Background Queues (BullMQ)

To keep user interfaces highly responsive, the backend utilizes a dedicated queue processing thread mesh:
1. **`prescription-ocr-queue`**: Ingests unstructured doctor prescriptions, performs OCR, and schedules reminders.
2. **`report-generation-queue`**: Synthesizes clinical reports, computes compliance, and outputs summaries.
3. **`notifications-queue`**: Asynchronously dispatches outbound text alerts and caregiver alert rings.
4. **`wearable-sync-queue`**: Ingests high-frequency raw smartwatch vital streams.
5. **`background-ai-queue`**: Offloads multi-agent planning runs and safety checks.
6. **`scheduled-reminders-queue`**: Triggers immediate reminder notifications for scheduled medication doses.
7. **`cache-maintenance-queue`**: Periodically updates and warms up active family profiles to reduce caching overheads.

---

## 5. Resiliency & Quota Circuit Breakers

CareCircle AI incorporates an intelligent **Circuit Breaker** optimized for Gemini API endpoints:
* **Rate-Limit Auditing**: Automatically intercepts `429 RESOURCE_EXHAUSTED` responses and puts the system into a cooldown period.
* **Graceful Degradation**: Bypasses active network calls to Gemini during rate-limited windows to conserve resources.
* **Clinical Matcher Fallback**: Powers OCR extraction and clinical schedule generation using robust local regexes, warning caregivers of the status via a warning banner in the UI.

---

## 6. Installation, Configuration & Run Guide

### Requirements
* **Node.js**: Version 18.0.0 or higher
* **Redis**: Version 6.x or higher (For background processing queues and real-time streams)

### Environment Configuration
Create a `.env` file in the root directory. Copy the template from `.env.example`:
```env
# Server Ingress Settings
PORT=3000
NODE_ENV=production

# Google GenAI Credentials
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Setup & Running Steps

1. **Install Project Dependencies**:
   ```bash
   npm install
   ```

2. **Run Application in Development**:
   Starts the React dev server and the Express backend (and background workers) concurrently:
   ```bash
   npm run dev
   ```

3. **Build the Production Assets**:
   Vite builds the React client and compiles the backend into a highly optimized bundle inside `dist/`:
   ```bash
   npm run build
   ```

4. **Start the Production App**:
   Runs the compiled, unified server:
   ```bash
   npm start
   ```
---
🌐 Live Demo

  https://carecircle-backend-xuw3.onrender.com/
---

## 7. Mock Demo Credentials

Use the following seed credentials to log in and test all caregiver workflows:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Primary Caregiver** | `sarah.vance@example.com` | `password123` |
| **Care Recipient** | `eleanor.vance@example.com` | `password123` |

---
## 8. Hackathon Context

Developed as part of the Google × Kaggle 5-Day AI Agents Intensive, CareCircle AI applies multi-agent AI concepts to real-world family healthcare and caregiver support.
The project explores how specialized AI agents, shared memory, and event-driven communication can work together to simplify and coordinate everyday caregiving tasks.

---
### Author
  Swapnil Mukherjee
