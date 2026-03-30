# Scenor Backend (NestJS + Prisma)

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL (local or remote)

## Environment

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

## Install and Run (Development)

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

Backend will run on:

`http://localhost:3000`

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
