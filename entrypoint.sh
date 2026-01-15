#!/bin/sh

# Running migrations
echo "⏳ Running database sync (drizzle-kit push)..."
# In some environments we need to be careful with paths
npm run db:push

echo "🚀 Starting Next.js server..."
node server.js
