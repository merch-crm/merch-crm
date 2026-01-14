#!/bin/sh

# Running migrations
echo "⏳ Running database sync (drizzle-kit push)..."
# In some environments we need to be careful with paths
npx drizzle-kit push --config=drizzle.config.ts

echo "🚀 Starting Next.js server..."
node server.js
