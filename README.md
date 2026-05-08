# CI-Pipeline

[![CI](https://github.com/DanielSc3/CI-Pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielSc3/CI-Pipeline/actions/workflows/ci.yml)

A web application for publishing short service updates to users.

## Local Setup

```bash
npm ci
npm run dev
npm test
npm run test:coverage
npm run build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — returns `{ status: "ok" }` |
| `GET` | `/updates` | List all published updates |
| `POST` | `/updates` | Publish a new update (body: `{ title, message }`) |

---

## Docker

Build and run the container locally:

```bash
docker build -t releaseready .
docker run -p 3000:3000 releaseready
```

The Dockerfile uses a multi-stage build — a `builder` stage compiles TypeScript, and a lean `runner` stage copies only the compiled output and production dependencies. The container runs as a non-root user.

---

## CI/CD Pipeline

### Continuous Integration (`ci.yml`)

Triggered on every **push** and **pull request**.

| Step | What it does |
|------|-------------|
| Install | `npm ci` — reproducible install from lockfile |
| Build | `tsc` — compiles TypeScript, catches type errors |
| Test | `vitest --coverage` — runs all unit tests with v8 coverage |
| Artifact | Uploads `coverage/` as `test-coverage` artifact for 14 days |

### Continuous Deployment (`cd.yml`)

| Trigger | Target |
|---------|--------|
| Push to `main` | Staging (automatic) |
| `workflow_dispatch` | Staging or Production (manual choice) |

The workflow builds a Docker image tagged with the Git SHA, pushes it to GitHub Container Registry (`ghcr.io`), then deploys to Azure Container Apps using environment-specific secrets.

Production deployments require a **manual approval** via GitHub environment protection rules before the deploy job runs.

---

## Environments

| Environment | Deployment | Protection |
|-------------|-----------|------------|
| `staging` | Automatic on push to `main` | None |
| `production` | Manual via `workflow_dispatch` | Required reviewer |

Each environment holds its own GitHub Actions secrets (`AZURE_CREDENTIALS`, `AZURE_RESOURCE_GROUP`, `AZURE_CONTAINERAPP_NAME`) so staging and production are fully isolated.

---

## Config and Secrets

- Environment variables are documented in `.env.example` — copy this file, never commit `.env`
- Secrets are stored in GitHub Actions environments, never hardcoded in workflow files
- Secrets are referenced as `${{ secrets.X }}` and are masked in all logs

---

## Rollback

Two rollback options are available:

### Option 1 — Redeploy previous image (fastest)

Every deployment uses a Docker image tagged with the Git SHA. To roll back, update the Container App to point at the previous image tag:

```bash
az containerapp update \
  --name <app-name> \
  --resource-group <resource-group> \
  --image ghcr.io/YOUR_USERNAME/releaseready:<previous-sha>
```

This skips the CI pipeline entirely and takes effect in seconds. **This is the fastest rollback.**

### Option 2 — Git revert

Revert the bad commit and push to `main`:

```bash
git revert <bad-commit-sha>
git push origin main
```

This triggers the full CI/CD pipeline, rebuilds the image, and redeploys automatically. It is slower (full CI run required) but creates a clear audit trail in the commit history.

---

## Repository Workflow

- All changes go through a pull request — no direct pushes to `main`
- `main` is protected: CI must pass before merging
- Commits are small and scoped to a single concern