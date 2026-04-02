FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm ci

COPY backend ./

RUN --mount=type=secret,id=backend_env,target=/app/.env npm run prisma:generate
RUN npm run build
RUN npm prune --omit=dev


FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node backend/docker-entrypoint.sh ./docker-entrypoint.sh

USER node

EXPOSE 3000

CMD ["sh", "-c", "npm run "]