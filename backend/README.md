# Scenor Backend (NestJS + Prisma)

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL (local or remote)

## Environment

You can use:

- `.env` for local/dev
- `.env.prod` for production-like config

Default behavior:

- if `NODE_ENV=prod` or `NODE_ENV=production`, app reads `.env.prod` (with fallback to `.env`)
- otherwise app reads `.env`
- you can force a specific file via `ENV_FILE=<file>`

1. Create `.env` from template:

```bash
cp .env.example .env
```

2. Set real values in `.env`:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `PORT`

Optional run examples:

```bash
# Uses .env (default)
npm run start:dev

# Uses .env.prod
NODE_ENV=prod npm run start:dev

# Explicit file override (works for Prisma too)
ENV_FILE=.env.prod npm run start:dev
```

## Install and Run (Development)

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

Backend will run on:

`http://localhost:3000`

For Docker Compose, switch env file like this:

```bash
# default: ./backend/.env
docker compose up --build

# use ./backend/.env.prod
BACKEND_ENV_FILE=.env.prod docker compose up --build
```

## Swagger

Swagger UI:

`http://localhost:3000/api`

In Swagger:

1. Login via `POST /users/login`
2. Copy `accessToken`
3. Click `Authorize`
4. Paste `Bearer <accessToken>`
5. Call protected routes

## Prisma Studio

Default:

```bash
npm run studio
```

For WSL (without auto-open browser):

```bash
npm run studio:wsl
```

WSL URL:

`http://localhost:5555`

## One Command Bootstrap (From Scratch)

Yes, this is implemented.

Command:

```bash
bash scripts/bootstrap.sh
```

What it does:

1. Creates `.env` from `.env.example` if missing
2. Installs dependencies
3. Generates Prisma client
4. Applies Prisma migrations
5. Builds backend

After bootstrap:

```bash
npm run start:dev
```

## Useful Scripts

- `npm run setup` - generate Prisma + migrate dev + build
- `npm run setup:deploy` - generate Prisma + migrate deploy + build
- `npm run prisma:generate`
- `npm run prisma:migrate:dev`
- `npm run prisma:migrate:deploy`
- `npm run build`
- `npm run start:dev`
- `npm run studio`
- `npm run studio:wsl`
