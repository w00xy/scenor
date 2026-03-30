#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo ".env not found, created from .env.example"
  else
    echo "Error: .env and .env.example are missing"
    exit 1
  fi
fi

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npm run prisma:generate

echo "Applying Prisma migrations..."
npm run prisma:migrate:dev

echo "Building backend..."
npm run build

echo "Bootstrap complete."
echo "Run API: npm run start:dev"
echo "Swagger: http://localhost:3000/api"
echo "Prisma Studio: npm run studio:wsl"
