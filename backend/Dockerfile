# syntax=docker/dockerfile:1.7
FROM node:20 AS build

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Установка зависимостей
COPY package*.json ./
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Применяем миграции и билдим приложение
COPY . .
RUN npx prisma generate
RUN npm run build

# Открываем порт 3000
EXPOSE 3000

# Копируем скрипт ожидания и даем ему права на выполнение
COPY ./scripts/wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

# Запуск скрипта ожидания базы данных перед стартом приложения
CMD ["/bin/bash", "/app/wait-for-db.sh"]
