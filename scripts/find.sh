#!/bin/bash

# Проверяем, передан ли аргумент для поиска
if [ -z "$1" ]; then
  echo "Usage: npm run find -- \"search_term\""
  exit 1
fi

# Если установлен ripgrep, используем его (он намного быстрее и сам читает .gitignore)
if command -v rg >/dev/null 2>&1; then
  rg "$1"
  exit $?
fi

# Иначе используем обычный grep с ручными исключениями
echo "⚠️  ripgrep (rg) не найден, использую grep с исключениями..."
grep -rnE "$1" . \
  --exclude-dir={node_modules,.next,.git,dist,out,build,public/storage,tmp,tests-results,playwright-report} \
  --exclude={package-lock.json,pnpm-lock.yaml,*.log,*.sql,*.map,tsconfig.tsbuildinfo}
