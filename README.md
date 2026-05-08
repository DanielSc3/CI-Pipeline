# CI-Pipeline

[![CI](https://github.com/DanielSc3/CI-Pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielSc3/CI-Pipeline/actions/workflows/ci.yml)

A web application for publishing short service updates to users.

## Local Setup

```bash
npm ci
npm run dev       
npm test         
npm run build 
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — returns `{ status: "ok" }` |
| `GET` | `/updates` | List all published updates |
| `POST` | `/updates` | Publish a new update (body: `{ title, message }`) |
