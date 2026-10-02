# Mtsclouds — MTS Cloud IaaS prototype

A user interface prototype for a simplified multi-tenant IaaS cloud platform, built for the MTS IaaS Hackathon on 4 to 6 March 2026. The interface covers tenant registration and login, tariff plans, a capacity forecast and a cost calculator, backed by an Express service that manages users, sessions and provider calls.

## Features

- Multi-tenant model, each tenant isolated with its own resources
- Registration and login with hashed passwords and server-side sessions
- Tenant administration interface
- Tariff plans with quota and price presentation
- Cost calculator that estimates spend from resource usage
- Capacity forecast for planning resource headroom
- Access-denied page for unauthenticated and unauthorised requests
- Prisma schema with migrations, plus a seed script
- Docker setup for local development

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend build | Vite |
| Frontend | React with TypeScript |
| Component library | Material UI and Radix UI primitives |
| Backend | Express with TypeScript |
| ORM | Prisma |
| Authentication | bcrypt for hashing, express-session for sessions |
| Provider control | dockerode |
| Local infrastructure | Docker Compose |
| Hosting | Vercel |

## Getting started

### Requirements

- Node.js 20 or newer
- Docker, for the local database

### Environment variables

The backend reads its configuration from the environment:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | Prisma connection string |
| `SESSION_SECRET` | yes | Secret used to sign session cookies |
| `PORT` | no | Backend port, defaults to `3001` |
| `FRONTEND_URL` | yes | Frontend origin, used for CORS and redirects |

Example:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mtscloud?schema=public
SESSION_SECRET=change-me
FRONTEND_URL=http://localhost:5173
```

### Installation

```bash
git clone https://github.com/glcskl/Mtsclouds.git
cd Mtsclouds
npm install
```

Prepare the database:

```bash
docker compose up -d
npm run setup
```

The `setup` script generates the Prisma client and applies the schema. To populate demo data, run `npm run seed`.

### Running

Frontend only:

```bash
npm run dev
```

Backend only:

```bash
npm run dev:server
```

Both together:

```bash
npm run dev:all
```

Production build:

```bash
npm run build
```

## Project structure

```
src/app/
  pages/            route-level screens
  components/       reusable UI, split by role
  context/          shared state
  api/              API client
  data/             static and mock data
server/
  src/index.ts      Express entry point
  src/routes/       HTTP routes
  src/db.ts         Prisma client
  src/providers.ts  infrastructure provider calls
  src/seed.ts       demo data
docker-compose.yml
Dockerfile.frontend
```

## Deployment

The frontend is deployed to Vercel. The backend needs a PostgreSQL database and a Docker host for provider calls, so it is meant to run on a machine rather than on a serverless platform.

## Notes

This is a prototype built under hackathon time constraints. It simulates the provisioning model rather than managing real infrastructure. Any resemblance to a production cloud provider is presentational only.