#!/bin/bash

# MerchCRM Maintenance Script
# This script performs backup and handles database sync.

set -e

PROJECT_DIR="/root/merch-crm"
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🚀 Starting MerchCRM Maintenance..."

# 1. Create backup directory
mkdir -p $BACKUP_DIR

# 2. Backup Database
echo "📦 Backing up database..."
docker exec merch-crm-db pg_dump -U postgres merch_crm > $BACKUP_DIR/db_backup_$TIMESTAMP.sql
echo "✅ Backup saved to $BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# 3. Pull latest code (if using git)
# cd $PROJECT_DIR && git pull

# 4. Sync Database Schema
echo "🔄 Syncing database schema..."
# We use the tunnel approach or run inside container
# Running inside container is better if we have the assets.
# For now, we'll use npx drizzle-kit push against 127.0.0.1
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/merch_crm"
npx drizzle-kit push --config=drizzle.config.ts

# 5. Restart Application
echo "Restarting containers..."
docker compose up -d --build

echo "🎉 Maintenance completed successfully!"
