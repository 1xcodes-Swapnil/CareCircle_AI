# Installation Guide — CareCircle AI

This guide walks through setting up CareCircle AI for local development from scratch.

---

## Prerequisites

| Requirement | Version | Notes |
|:-----------|:--------|:------|
| **Node.js** | 18.0.0 or later | [nodejs.org](https://nodejs.org/) |
| **npm** | 8.0.0 or later | Bundled with Node.js |
| **Redis** | 6.0 or later | Required for background queues and caching |
| **Git** | Any recent version | For cloning the repository |

### Verifying Prerequisites

```bash
node --version   # Should print v18.x.x or later
npm --version    # Should print 8.x.x or later
redis-cli ping   # Should print PONG
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/carecircle-ai.git
cd carecircle-ai
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs both production and development dependencies including React, Express, BullMQ, better-sqlite3, and all TypeScript tooling.

---

## Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in the required values:

### Required Variables

| Variable | Description | Example |
|:---------|:------------|:--------|
| `JWT_SECRET` | Secret key for signing session tokens. **Must be set or auth will not function.** | A 64-character random hex string |
| `GEMINI_API_KEY` | Google Gemini API key for AI features. If omitted, the local fallback engine is used. | `AIza...` |

### Generating a Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output into your `.env` as the value of `JWT_SECRET`.

### Optional Variables

| Variable | Default | Description |
|:---------|:--------|:------------|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | `development` | `development` or `production` |
| `REDIS_HOST` | `localhost` | Redis server hostname |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | *(empty)* | Redis authentication password |
| `REDIS_USE_TLS` | `false` | Enable TLS for Redis connection |
| `APP_URL` | `http://localhost:3000` | Public URL of the application |
| `ALLOW_DEMO_LOGIN` | `true` | Show demo persona login buttons in UI |

---

## Step 4: Start Redis

CareCircle AI requires a running Redis instance for BullMQ background workers and caching.

### macOS (Homebrew)
```bash
brew install redis
brew services start redis
```

### Ubuntu / Debian
```bash
sudo apt-get install redis-server
sudo service redis-server start
```

### Windows
Redis is not natively supported on Windows. Use one of the following:

- **Docker** (recommended):
  ```powershell
  docker run -d -p 6379:6379 --name carecircle-redis redis:7-alpine
  ```
- **WSL2**: Install Redis inside a WSL2 Ubuntu instance.
- **Memurai**: A Redis-compatible Windows server ([memurai.com](https://www.memurai.com/)).

### Docker Compose (All Platforms)
If you have Docker installed, you can start Redis with:
```bash
docker run -d -p 6379:6379 --name carecircle-redis redis:7-alpine
```

Verify Redis is running:
```bash
redis-cli ping
# Expected output: PONG
```

---

## Step 5: Obtain a Gemini API Key (Optional)

For full AI functionality, you need a Google Gemini API key:

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with a Google account.
3. Click **Create API Key**.
4. Copy the key and add it to your `.env` as `GEMINI_API_KEY`.

> **Without a Gemini API key**: The application works in "Local Fallback Mode." The local clinical rules engine handles OCR parsing and scheduling. A warning banner is displayed in the UI. All non-AI features (authentication, family management, vitals logging, calendar) work normally.

---

## Step 6: Start the Development Server

```bash
npm run dev
```

This command starts:
1. **Express REST server** on `http://localhost:3000`
2. **Vite dev middleware** serving the React frontend (embedded in Express in dev mode)
3. **BullMQ background workers** for all 7 task queues

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## Step 7: Log In with Demo Credentials

The database is automatically seeded with two demo accounts on first startup:

| Role | Email | Password |
|:-----|:------|:---------|
| **Primary Caregiver** | `sarah.vance@example.com` | `password123` |
| **Care Recipient** | `eleanor.vance@example.com` | `password123` |

> These credentials are for local development and demo purposes only. The seeded data represents a fictional family and does not contain real health information.

---

## Verifying the Installation

After starting the server, verify the installation:

1. **Frontend**: Visit [http://localhost:3000](http://localhost:3000) — the landing page should load.
2. **Auth**: Log in with the demo caregiver credentials — dashboard should load.
3. **Background Workers**: Navigate to **Developer Mode → Mission Control**. The Redis status should show "CONNECTED" and queue workers should be running.
4. **AI Chat** (if Gemini key set): Open **AI Assistant** and type a message — you should receive an AI response.
5. **Fallback Mode** (if no Gemini key): A yellow warning banner should appear indicating "Local Fallback Mode."

---

## Troubleshooting

### "Redis connection refused"
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_HOST` and `REDIS_PORT` in your `.env`
- For Docker: ensure the container is running: `docker ps`

### "[Auth] FATAL: JWT_SECRET environment variable is not set"
- Ensure `JWT_SECRET` is set in your `.env` file
- Generate a secure value: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### TypeScript compilation errors
```bash
npm run lint
```
This runs `tsc --noEmit` to surface type errors without building.

### Port already in use
Change the `PORT` variable in your `.env` to an available port (e.g., `3001`).

### Database issues
The SQLite database file is auto-created at `carecircle.db` in the project root on first run. If you encounter database errors, delete this file and restart — it will be recreated with fresh seed data.

---

## Next Steps

- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.
- See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the full REST API reference.
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute to the project.
- See [DEMO_GUIDE.md](DEMO_GUIDE.md) for a walkthrough of all features.
