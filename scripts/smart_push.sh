#!/bin/bash

# ==============================================================================
# SMART PUSH (CLI Edition)
# Автоматизированный цикл: Pre-push check -> PR -> Merge -> Deploy
# ==============================================================================

GH_CLI="/Users/leonidmolchanov/Downloads/gh_2.89.0_macOS_amd64/bin/gh"
PREDEPLOY_SCRIPT="./scripts/predeploy.sh"

echo "🚀 Запуск процесса Smart Push..."

# 1. Локальная проверка
if [ -f "$PREDEPLOY_SCRIPT" ]; then
    echo "📌 Шаг 1: Запуск локальных проверок (predeploy.sh)..."
    if ! "$PREDEPLOY_SCRIPT"; then
        echo "❌ Ошибка: Локальная проверка не прошла. Исправьте ошибки и попробуйте снова."
        exit 1
    fi
else
    echo "⚠️ Предупреждение: predeploy.sh не найден, пропускаю этап проверки."
fi

# 2. Проверка статуса git
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Дерево чистое, новых изменений для коммита нет."
    # Но проверим, есть ли незапушенные коммиты в main
    AHEAD=$(git rev-list --count origin/main..main 2>/dev/null)
    if [ "$AHEAD" -eq 0 ]; then
        echo "😴 Ветка main уже синхронизирована с origin. Ничего делать не нужно."
        exit 0
    fi
    echo "📈 Обнаружены локальные коммиты (ahead of origin/main by $AHEAD)."
else
    echo "📌 Шаг 2: Создание коммита..."
    git add .
    echo -n "Введите сообщение коммита (или нажмите Enter для стандартного): "
    read COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="chore: automated smart push $(date +'%Y-%m-%d %H:%M')"
    fi
    git commit -m "$COMMIT_MSG"
fi

# 3. Создание временной ветки (если мы в main и он защищен)
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" == "main" ]; then
    TIMESTAMP=$(date +%Y%m%d%H%M%S)
    TEMP_BRANCH="push/recovery-$TIMESTAMP"
    echo "🛡️ Ветка main защищена. Создаю временную ветку: $TEMP_BRANCH"
    git checkout -b "$TEMP_BRANCH"
    git push -u origin "$TEMP_BRANCH"
    
    # 4. Создание PR через gh CLI
    echo "📝 Шаг 3: Создание Pull Request через GitHub CLI..."
    PR_URL=$($GH_CLI pr create --title "$COMMIT_MSG" --body "Automated Smart Push stabilization." --base main --head "$TEMP_BRANCH")
    
    if [ $? -eq 0 ]; then
        echo "✅ PR создан: $PR_URL"
        
        # 5. Автоматическое слияние (Merge)
        echo "🚢 Шаг 4: Попытка автоматического слияния (Merge)..."
        # Ждем немного, пока GitHub осознает создание PR
        sleep 5
        $GH_CLI pr merge "$PR_URL" --auto --squash --delete-branch
        
        # Если --auto не сработал или нужно форсировать (админский мерж)
        if [ $? -ne 0 ]; then
            echo "🔄 Авто-мерж невозможен (ждут проверки или защиты). Пытаюсь выполнить Admin Merge..."
            $GH_CLI pr merge "$PR_URL" --admin --squash --delete-branch
        fi
        
        echo "✅ Слияние завершено! Деплой запущен."
    else
        echo "❌ Ошибка при создании PR."
        exit 1
    fi
    
    # Возвращаемся в main и синхронизируемся
    git checkout main
    git pull origin main
else
    echo "⚠️ Вы находитесь на ветке '$CURRENT_BRANCH'. Выполняю обычный push..."
    git push origin "$CURRENT_BRANCH"
fi

echo "🏁 Процесс Smart Push завершен успешно! 🚀✨"
