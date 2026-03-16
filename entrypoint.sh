#!/bin/sh

# Migrations are now handled by the dedicated 'migrate' init-container.
# This entrypoint only starts the Next.js application server.

echo "🚀 Starting Next.js server..."
node --expose-gc server.js
