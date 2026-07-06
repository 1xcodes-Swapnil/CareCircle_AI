# API Documentation — CareCircle AI

**Base URL (Development)**: `http://localhost:3000`  
**Authentication**: All protected endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <session_token>
```

Tokens are issued by the authentication endpoints and expire after **24 hours**.

---

## Table of Contents

- [Authentication](#authentication)
- [Profile & Family Data](#profile--family-data)
- [Check-Ins](#check-ins)
- [Alerts](#alerts)
- [Medications](#medications)
- [Appointments](#appointments)
- [Documents (OCR)](#documents-ocr)
- [Wellness & Memory](#wellness--memory)
- [Messages](#messages)
- [AI & Agent Endpoints](#ai--agent-endpoints)
- [Infrastructure & Developer](#infrastructure--developer)
- [Real-Time Streaming](#real-time-streaming)
- [Error Responses](#error-responses)

---

## Authentication

### POST `/api/auth/login`

Authenticate a user and receive a session token.

**Auth required**: No

**Request body**:
```json
{
  "email": "sarah.vance@example.com",
  "password": "password123"
}
```

Or for demo quick-login (when `ALLOW_DEMO_LOGIN=true`):
```json
{
  "userId": "usr_sarah"
}
```

**Response `200 OK`**:
```json
{
  "token": "<session_token>",
  "user": {
    "id": "usr_sarah",
    "name": "Sarah Vance",
    "email": "sarah.vance@example.com",
    "role": "caregiver"
  }
}
```

**Error responses**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

---

### POST `/api/auth/register`

Register a new user account.

**Auth required**: No

**Request body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1 555 000 0000",
  "role": "caregiver",
  "password": "securepassword"
}
```

**Response `200 OK`**:
```json
{
  "token": "<session_token>",
  "user": { ... }
}
```

---

### GET `/api/auth/me`

Get the currently authenticated user.

**Auth required**: Yes

**Response `200 OK`**:
```json
{
  "user": {
    "id": "usr_sarah",
    "name": "Sarah Vance",
    "email": "sarah.vance@example.com",
    "role": "caregiver",
    ...
  }
}
```

---

## Profile & Family Data

### GET `/api/profile`

Fetch the family profile and member data for the authenticated user.

**Auth required**: Yes

**Response `200 OK`**:
```json
{
  "familyMembers": [ ... ],
  "geminiRateLimited": false,
  "cooldownSeconds": 0
}
```

---

### POST `/api/profile/vitals`

Update wearable vitals for a care recipient.

**Auth required**: Yes

**Request body**:
```json
{
  "steps": 3200,
  "heartRate": 72,
  "sleepHours": 6.5,
  "familyMemberId": "fm_eleanor"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "profile": { ... }
}
```

---

### PUT `/api/user`

Update the authenticated user's profile.

**Auth required**: Yes

**Request body**: Partial user object with fields to update.

---

## Check-Ins

### POST `/api/checkin`

Submit a daily wellness check-in.

**Auth required**: Yes

**Request body**:
```json
{
  "status": "completed",
  "notes": "Feeling well today.",
  "familyMemberId": "fm_eleanor"
}
```

Valid `status` values: `"completed"`, `"missed"`, `"partial"`

**Response `200 OK`**:
```json
{
  "success": true,
  "checkin": {
    "id": "ci_...",
    "familyMemberId": "fm_eleanor",
    "timestamp": "2026-07-06T10:00:00.000Z",
    "status": "completed",
    "notes": "Feeling well today."
  }
}
```

---

## Alerts

### GET `/api/alerts`

Retrieve all escalation alerts.

**Auth required**: Yes

**Response `200 OK`**:
```json
{
  "alerts": [
    {
      "id": "alert_...",
      "familyMemberId": "fm_eleanor",
      "type": "MissedCheckIn",
      "status": "pending",
      "severity": "medium",
      "message": "Eleanor has not completed her morning check-in.",
      "timestamp": "2026-07-06T09:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/alerts/:id/resolve`

Mark an alert as resolved.

**Auth required**: Yes  
**URL params**: `id` — Alert ID

**Response `200 OK`**:
```json
{
  "success": true,
  "alert": { ... }
}
```

---

## Medications

### POST `/api/medications`

Add a new medication to a care recipient's schedule.

**Auth required**: Yes

**Request body**:
```json
{
  "name": "Lisinopril",
  "time": "08:00",
  "instructions": "Take with a full glass of water.",
  "sideEffects": ["Dizziness", "Dry cough"],
  "drugWarnings": ["Avoid potassium supplements"],
  "doctorInfo": "Dr. Robert Chen",
  "remainingTablets": 30,
  "refillReminder": true,
  "familyMemberId": "fm_eleanor"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "medication": { ... }
}
```

---

### PUT `/api/medications/:id`

Update a medication record.

**Auth required**: Yes  
**URL params**: `id` — Medication ID

**Request body**: Partial medication object.

---

### DELETE `/api/medications/:id`

Remove a medication from the schedule.

**Auth required**: Yes  
**URL params**: `id` — Medication ID

---

### POST `/api/medications/:id/status`

Update medication administration status.

**Auth required**: Yes  
**URL params**: `id` — Medication ID

**Request body**:
```json
{
  "status": "taken"
}
```

Valid `status` values: `"taken"`, `"missed"`, `"pending"`, `"paused"`

Marking as `"missed"` automatically publishes a `MedicineMissed` event to trigger the Planner Agent.

---

## Appointments

### GET `/api/appointments`

Retrieve all scheduled appointments.

**Auth required**: Yes

---

### POST `/api/appointments`

Schedule a new appointment.

**Auth required**: Yes

**Request body**:
```json
{
  "doctor": "Dr. Robert Chen",
  "hospital": "Silver Springs Memorial Hospital",
  "purpose": "Quarterly cognitive assessment",
  "time": "2026-08-15T10:00:00.000Z",
  "location": "123 Medical Drive, Suite 4",
  "recurring": "quarterly",
  "familyMemberId": "fm_eleanor"
}
```

---

### PUT `/api/appointments/:id`

Update an appointment.

**Auth required**: Yes  
**URL params**: `id` — Appointment ID

---

### DELETE `/api/appointments/:id`

Cancel an appointment.

**Auth required**: Yes  
**URL params**: `id` — Appointment ID

---

### POST `/api/appointments/:id/follow-up`

Record appointment outcome and trigger care plan updates.

**Auth required**: Yes  
**URL params**: `id` — Appointment ID

**Request body**:
```json
{
  "happened": true,
  "notes": "Cognitive assessment score stable. Follow-up in 3 months.",
  "followUpDate": "2026-11-15T10:00:00.000Z"
}
```

Setting `happened: false` marks the appointment as missed and triggers a reschedule notification.

---

## Documents (OCR)

### POST `/api/documents/analyze`

Analyze a clinical document (prescription or lab report) using Gemini Vision OCR.

**Auth required**: Yes  
**Content-Type**: `application/json` (base64-encoded file)  
**Max payload**: 20 MB

**Request body**:
```json
{
  "fileData": "data:application/pdf;base64,...",
  "mimeType": "application/pdf",
  "fileName": "prescription.pdf",
  "documentType": "prescription"
}
```

Valid `documentType` values: `"prescription"`, `"lab_report"`

**Response `200 OK`** (Gemini extraction):
```json
{
  "success": true,
  "source": "gemini",
  "data": {
    "doctorName": "Dr. Robert Chen",
    "hospitalName": "Silver Springs Memorial",
    "diagnosis": "Hypertension management",
    "medications": [
      { "name": "Lisinopril", "dosage": "10mg", "frequency": "Once daily", "duration": "Ongoing" }
    ],
    "labValues": [],
    "followUpDate": "2026-10-01",
    "notes": "Monitor blood pressure weekly."
  }
}
```

When `GEMINI_API_KEY` is unavailable, `"source"` will be `"local_fallback"` with reduced accuracy.

---

### POST `/api/documents/approve`

Approve extracted document data and execute the multi-agent intake pipeline.

**Auth required**: Yes

**Request body**:
```json
{
  "documentData": { ... },
  "familyMemberId": "fm_eleanor"
}
```

Triggers sequential execution of: Medication Agent → Calendar Agent → Report Agent → Planner Agent.

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Document approved. Agent pipeline initiated.",
  "agentResults": { ... }
}
```

---

## Wellness & Memory

### POST `/api/wellness`

Submit a recipient wellness self-report.

**Auth required**: Yes

**Request body**:
```json
{
  "mood": 4,
  "painLevel": 2,
  "energyLevel": 3,
  "appetiteLevel": 4,
  "notes": "Had a good night's sleep.",
  "familyMemberId": "fm_eleanor"
}
```

Values are 1–5 scales.

---

### GET `/api/memories`

Retrieve the episodic memory log for a care recipient.

**Auth required**: Yes

**Query params**: `?familyMemberId=fm_eleanor`

---

### GET `/api/audit-logs`

Retrieve the complete XAI reasoning and agent audit trail.

**Auth required**: Yes

---

## Messages

### GET `/api/messages`

Fetch care circle messages.

**Auth required**: Yes

---

### POST `/api/messages`

Send a message in the care circle.

**Auth required**: Yes

**Request body**:
```json
{
  "text": "Eleanor had her medication this morning.",
  "familyMemberId": "fm_eleanor"
}
```

---

## AI & Agent Endpoints

### POST `/api/ai/chat`

Send a message to the AI care assistant and receive a multi-agent orchestrated response.

**Auth required**: Yes

**Request body**:
```json
{
  "text": "How is Eleanor's medication compliance this week?",
  "familyMemberId": "fm_eleanor"
}
```

**Response `200 OK`**:
```json
{
  "response": "Based on Eleanor's records, her medication compliance this week is...",
  "xaiTrace": {
    "intent": "medication_compliance_query",
    "agentsInvoked": ["planner", "health_agent"],
    "mcpToolsUsed": ["get_family_member", "get_medications"],
    "safetyChecks": ["no_diagnosis_issued", "disclaimer_appended"],
    "reasoning": "..."
  },
  "source": "gemini"
}
```

---

### POST `/api/simulate`

Trigger a clinical simulation event (developer/demo use).

**Auth required**: Yes

**Request body**:
```json
{
  "type": "EmergencyTriggered",
  "familyMemberId": "fm_eleanor",
  "payload": {}
}
```

Valid `type` values:
- `"EmergencyTriggered"` — Simulates an SOS fall or cardiac event
- `"MedicineMissed"` — Simulates a missed medication dose
- `"DailyCheckInMissed"` — Simulates a missed check-in
- `"MoodUpdated"` — Simulates a mood change
- `"WearableAlert"` — Simulates a wearable biometric alert

---

## Infrastructure & Developer

### GET `/api/health`

Server health check. No authentication required.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "engine": "CareCircle AI Orchestrator"
}
```

---

### GET `/api/mcp/tools`

List all registered MCP tools and their JSON schemas.

**Auth required**: Yes

---

### GET `/api/mcp/history`

Retrieve the MCP tool invocation audit history.

**Auth required**: Yes

---

### GET `/api/infrastructure/cache`

Get Redis cache statistics (active keys, hit/miss ratio).

**Auth required**: Yes

---

### POST `/api/infrastructure/cache/flush`

Flush all Redis cache keys (admin operation, demo/dev use only).

**Auth required**: Yes

---

### GET `/api/infrastructure/queues`

Get BullMQ queue depth and job metrics for all 7 queues.

**Auth required**: Yes

---

### POST `/api/reset`

Reset the database to default seed data. **Use for demo restarts only.**

**Auth required**: Yes

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Database reset to default seed data."
}
```

---

## Real-Time Streaming

### GET `/api/stream?token=<jwt>`

Establish a Server-Sent Events (SSE) connection for real-time synchronisation.

**Auth required**: Token passed as query parameter (not header)

**Events received**:
```
data: {"type":"connected"}

data: {"type":"sync"}
```

The `sync` event is broadcast whenever the database is mutated. Clients should re-fetch relevant data on receiving a `sync` event.

**Connection lifecycle**: The connection remains open until the client disconnects. Reconnection is handled automatically by the browser's EventSource API.

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Human-readable error message"
}
```

| HTTP Status | Meaning |
|:------------|:--------|
| `400 Bad Request` | Missing or invalid request parameters |
| `401 Unauthorized` | Missing, expired, or invalid session token |
| `403 Forbidden` | Authenticated but insufficient role privileges |
| `404 Not Found` | Requested resource does not exist |
| `500 Internal Server Error` | Unexpected server-side error |
