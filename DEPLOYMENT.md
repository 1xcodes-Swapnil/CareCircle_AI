# Deployment Guide — CareCircle AI

This document covers local development, production build, and cloud deployment for CareCircle AI.

---

## Table of Contents
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Environment Configuration](#environment-configuration)
- [Production Deployment (Google Cloud Run)](#production-deployment-google-cloud-run)
- [Redis in Production](#redis-in-production)
- [Health Checks](#health-checks)
- [Operational Notes](#operational-notes)

---

## Local Development

For a full local development setup, see [INSTALLATION.md](INSTALLATION.md).

```bash
# Start development server (Express + Vite HMR + BullMQ workers)
npm run dev
```

The development server runs everything in a single process:
- Express REST API on the configured `PORT` (default: 3000)
- Vite development middleware embedded in Express (serves the React frontend with HMR)
- BullMQ workers initialised in-process

---

## Production Build

### 1. Build the Application

```bash
npm run build
```

This command:
1. Runs `vite build` to compile and bundle the React frontend into `dist/public/`
2. Runs `esbuild` to bundle `server.ts` into a single CommonJS file at `dist/server.cjs`

### 2. Start the Production Server

```bash
npm start
```

This runs `node dist/server.cjs`, which:
- Serves the compiled React frontend as static files
- Runs the Express REST API
- Starts all BullMQ background workers

### 3. Environment for Production Build

Before building, ensure your production `.env` is configured:

```env
NODE_ENV=production
PORT=8080
JWT_SECRET=your_strong_random_secret
GEMINI_API_KEY=your_gemini_api_key
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_USE_TLS=true
APP_URL=https://your-production-domain.com
ALLOW_DEMO_LOGIN=false
```

---

## Environment Configuration

All configuration is done through environment variables. See [.env.example](.env.example) for the full list.

> **Security note**: Never commit `.env` files. The `.gitignore` excludes all `.env*` files (except `.env.example`).

| Variable | Required | Production Value |
|:---------|:---------|:----------------|
| `JWT_SECRET` | Yes | Strong random 64+ character string |
| `GEMINI_API_KEY` | For AI features | Your Google Gemini API key |
| `REDIS_HOST` | For queues/cache | Managed Redis hostname |
| `REDIS_PORT` | For queues/cache | Redis port (usually 6379 or 16379 for TLS) |
| `REDIS_PASSWORD` | For queues/cache | Redis auth password |
| `REDIS_USE_TLS` | For managed Redis | `true` |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `8080` (Cloud Run default) |
| `ALLOW_DEMO_LOGIN` | No | `false` |

---

## Production Deployment (Google Cloud Run)

> **Status**: The following is the planned production deployment architecture. The current implementation (SQLite, in-process workers) is designed to run locally or as a single-container deployment. Full Cloud Run production deployment requires the database migration steps noted below.

### Current Limitation for Cloud Run

Cloud Run containers are stateless and ephemeral. The current SQLite database (`carecircle.db`) is stored on the container filesystem and will be **reset on every new container instance or deployment**. For a stateful production deployment:

1. Migrate from SQLite to **Cloud SQL (PostgreSQL)** with connection pooling.
2. Mount a persistent volume or use Cloud SQL Auth Proxy.
3. Externalize file storage to **Google Cloud Storage** for document uploads.

### Single-Container Deployment (Demo/Hackathon)

For hackathon and evaluation purposes, deploy as a single container:

#### Build Docker Image

```dockerfile
# Example Dockerfile (not included in repo — add for production)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/server.cjs"]
```

```bash
# Build image
docker build -t carecircle-ai .

# Test locally
docker run -p 8080:8080 \
  -e JWT_SECRET=your_secret \
  -e GEMINI_API_KEY=your_key \
  -e REDIS_HOST=host.docker.internal \
  carecircle-ai
```

#### Deploy to Cloud Run

```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/carecircle-ai

# Deploy to Cloud Run
gcloud run deploy carecircle-ai \
  --image gcr.io/YOUR_PROJECT_ID/carecircle-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production \
  --set-secrets JWT_SECRET=jwt-secret:latest,GEMINI_API_KEY=gemini-key:latest
```

#### Secret Management (Recommended)

Use **Google Cloud Secret Manager** for all sensitive values:

```bash
# Create secrets
echo -n "your_jwt_secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your_gemini_key" | gcloud secrets create gemini-key --data-file=-

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:YOUR_SA@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Redis in Production

CareCircle AI requires Redis for BullMQ background job processing and caching. In production, use a managed Redis service.

### Options

| Provider | Notes |
|:---------|:------|
| **Google Memorystore** | Native GCP integration, recommended for Cloud Run |
| **Redis Cloud** | Multi-cloud, generous free tier |
| **AWS ElastiCache** | For AWS deployments |
| **Upstash** | Serverless Redis, good for low-traffic deployments |

### Recommended Production Configuration

```env
REDIS_HOST=your-managed-redis.provider.com
REDIS_PORT=6380      # TLS port varies by provider
REDIS_PASSWORD=your_redis_auth_password
REDIS_USE_TLS=true
```

---

## Health Checks

The application exposes the following health-check-compatible endpoints:

| Endpoint | Description | Auth Required |
|:---------|:------------|:--------------|
| `GET /` | Serves the frontend (200 if running) | No |
| `GET /api/stream?token=<jwt>` | SSE stream (tests full auth + SSE) | Yes |

For Cloud Run health checks, use `GET /` with a 200 response as the health probe.

---

## Operational Notes

### Process Architecture

In the current implementation, all components run in a **single Node.js process**:
- Express HTTP server
- Vite development middleware (dev mode only)
- BullMQ workers (all 7 queues)
- Redis connection(s)

This is appropriate for single-server and evaluation deployments. For production scale, separate the worker processes.

### Database Location

The SQLite database file is created at `./carecircle.db` (relative to the working directory where the server starts). Ensure this path is writable. The file is created automatically on first start if it does not exist.

> Add `carecircle.db` to your `.gitignore` — it is already excluded by the repository's default `.gitignore`.

### Log Output

The server outputs structured log lines to stdout. In production, configure your container runtime or logging platform (e.g., Google Cloud Logging, Datadog) to capture stdout.

Key log prefixes:
- `[Server]` — Express server lifecycle events
- `[Auth]` — Authentication events (including security errors)
- `[DB]` — Database operations
- `[Agent]` — Multi-agent orchestration events
- `[MCP SERVER INVOCATION]` — MCP tool execution audit log
- `[BullMQ]` — Background queue events
- `[Redis]` — Cache and pub/sub events
- `[GeminiBreaker]` — Circuit breaker state changes

---

## Production Readiness Checklist

Before going live with real user data:

- [ ] `JWT_SECRET` is a strong (64+ char) random value stored in a secrets manager
- [ ] `ALLOW_DEMO_LOGIN=false` is set
- [ ] `NODE_ENV=production` is set
- [ ] HTTPS is enforced via reverse proxy or Cloud Run's built-in TLS
- [ ] Redis is a managed service with authentication and TLS enabled
- [ ] Database is migrated from SQLite to PostgreSQL (for multi-user production scale)
- [ ] Backups are configured for the database
- [ ] Monitoring and alerting are configured
- [ ] Rate limiting is enabled on all authentication and AI endpoints
- [ ] `npm audit` shows no critical vulnerabilities
