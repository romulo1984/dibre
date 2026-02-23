# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**dib.re** — A web app for generating balanced teams in casual soccer games (peladas). The core feature is an algorithm that distributes players into balanced teams based on their skill attributes.

## Commands

### Development
```bash
npm install                  # Install all workspace dependencies
docker compose up -d mysql   # Start local MySQL instance
npm run db:generate          # Generate Prisma client
npm run db:push              # Sync schema to DB (dev only)
npm run dev                  # Start both backend (port 4000) and frontend (port 5173)
npm run dev:backend          # Backend only
npm run dev:frontend         # Frontend only
```

### Build & Lint
```bash
npm run build                # Build all workspaces
npm run lint                 # Lint all workspaces
npm run format               # Prettier format all files
```

### Database
```bash
npm run db:migrate           # Run Prisma migrations (production)
npm run db:studio            # Open Prisma Studio
```

There are no tests configured in this project.

## Environment Variables

**`apps/backend/.env`**: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `FRONTEND_URL`, `PORT`

**`apps/frontend/.env`**: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_APP_URL` (public domain for share links, defaults to `https://dib.re`)

## Architecture

This is an npm workspaces monorepo with two apps: `apps/backend` and `apps/frontend`.

### Backend (`apps/backend`)
Express + TypeScript + Prisma ORM + MySQL. Follows a strict layered pattern:

```
Request → Middleware (Clerk auth) → Controller → Service → Repository → Prisma → MySQL
```

- **controllers/**: Parse requests, call services, return responses
- **services/**: Business logic — notably `balance.service.ts` (team balancing algorithm)
- **repositories/**: All Prisma/DB access lives here
- **domain/**: Core entity types (Player, Game, Team)
- **middleware/**: `requireAuth` enforces Clerk JWT on protected routes

### Frontend (`apps/frontend`)
Vite + React 19 + React Router 7 + Tailwind CSS 4 + Clerk. Component layering:

- **pages/**: Route-level components
- **features/**: Feature-specific UI components
- **components/**: Reusable UI primitives (composition pattern)
- **hooks/**: Custom hooks for data fetching
- **services/**: API client (fetch calls to `/api` proxy)
- **domain/**: Frontend domain types

The Vite dev server proxies `/api` to `http://localhost:4000`, so the frontend always calls `/api/...`.

### Team Balancing Algorithm
Located in `apps/backend/src/services/balance.service.ts`. Three-phase distribution:
1. **5-star players** distributed round-robin across teams
2. **1-star players** distributed round-robin across teams
3. **Remaining players** distributed greedily (to the team with lowest current attribute sum)

### Authentication & Roles
- **Clerk** handles auth (JWT). Roles stored in Clerk `publicMetadata`.
- **admin**: Platform super-user. Has all `member` permissions plus access to the admin panel (`/admin/users`) where they can manage all platform users (view, search, delete). Admin role is set manually in Clerk Dashboard → Users → select user → Public metadata → set `{ "role": "admin" }`.
- **member**: Can create, edit, draw teams, manage groups
- **viewer**: Read-only, no login required
- Backend enforces auth via `requireAuth` middleware on protected routes, and `requireAdmin` middleware on admin-only routes (`/api/admin/*`).
- Frontend enforces admin access via `RequireAdmin` route wrapper (checks `user.publicMetadata.role === 'admin'`). The admin nav link only appears for admin users.

## Code Style

- **No semicolons**, single quotes, 100-character line width (enforced by Prettier)
- All code, variable names, comments, and folder names must be in **English**
- Player attributes are English in code (`pass`, `shot`, `defense`, `energy`, `speed`) but display in Portuguese in the UI
- TypeScript strict mode enabled on both backend and frontend
