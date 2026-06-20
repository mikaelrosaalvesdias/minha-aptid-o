#!/bin/sh
set -eu

attempts=0
until npx prisma migrate deploy; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 30 ]; then
    echo "Prisma migrations failed after ${attempts} attempts."
    exit 1
  fi
  echo "Database is not ready yet. Retrying migrations in 3 seconds..."
  sleep 3
done

if [ "${RUN_SEED:-true}" = "true" ]; then
  npx prisma db seed
fi

exec node .next/standalone/server.js
