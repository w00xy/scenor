#!/bin/bash

# Ждем, пока база данных будет доступна
echo "Waiting for database..."
while ! npx prisma db push 2>/dev/null; do
  echo "Waiting for database connection..."
  sleep 2
done

echo "Database is up, starting app"
npm run start:prod