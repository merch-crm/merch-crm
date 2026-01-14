#!/bin/bash
set -e

echo "Starting stability check..."

# 1. Check format
echo "Checking types..."
npx tsc --noEmit

# 2. Check lint
echo "Checking lint..."
npm run lint

# 3. Check build
echo "Checking build..."
npm run build

echo "✅ Stability check passed! Ready for git push."
