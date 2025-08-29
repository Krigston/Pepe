#!/bin/bash

# Скрипт для настройки Git hooks для автоматического версионирования

echo "🔧 Настройка Git hooks для автоматического версионирования..."

# Создаем директорию для hooks, если её нет
mkdir -p .git/hooks

# Создаем pre-commit hook для автоматического увеличения версии
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook для автоматического увеличения версии
# Увеличивает patch версию при каждом коммите в main ветке

# Получаем текущую ветку
current_branch=$(git symbolic-ref --short HEAD)

# Проверяем, находимся ли мы в main ветке
if [ "$current_branch" = "main" ]; then
    echo "🔄 Автоматическое увеличение версии для main ветки..."
    
    # Проверяем, есть ли специальные маркеры в коммите
    commit_message=$(git log --format=%B -n 1 HEAD || echo "")
    
    # Определяем тип версионирования по ключевым словам
    if [[ $commit_message == *"[major]"* ]] || [[ $commit_message == *"BREAKING CHANGE"* ]]; then
        version_type="major"
        echo "🔥 Обнаружены критические изменения - увеличиваем MAJOR версию"
    elif [[ $commit_message == *"[minor]"* ]] || [[ $commit_message == *"feat:"* ]] || [[ $commit_message == *"✨"* ]]; then
        version_type="minor"
        echo "✨ Обнаружены новые функции - увеличиваем MINOR версию"
    else
        version_type="patch"
        echo "🐛 Стандартный коммит - увеличиваем PATCH версию"
    fi
    
    # Запускаем скрипт увеличения версии
    if node scripts/version-bump.js $version_type; then
        # Добавляем обновленные файлы в коммит
        git add package.json src/VersionManager.ts
        echo "✅ Версия автоматически обновлена и добавлена в коммит"
    else
        echo "❌ Ошибка при обновлении версии"
        exit 1
    fi
else
    echo "ℹ️  Автоматическое версионирование работает только для main ветки"
fi

exit 0
EOF

# Делаем hook исполняемым
chmod +x .git/hooks/pre-commit

# Создаем post-commit hook для вывода информации о версии
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

# Post-commit hook для отображения информации о версии

# Получаем текущую ветку
current_branch=$(git symbolic-ref --short HEAD)

if [ "$current_branch" = "main" ]; then
    # Читаем текущую версию из package.json
    if command -v node >/dev/null 2>&1; then
        version=$(node -p "require('./package.json').version")
        echo ""
        echo "🎮 Версия игры обновлена до: v$version"
        echo "📝 Коммит в main ветке зафиксирован"
        echo ""
    fi
fi
EOF

# Делаем hook исполняемым
chmod +x .git/hooks/post-commit

echo "✅ Git hooks успешно настроены!"
echo ""
echo "📋 Настроенные hooks:"
echo "   - pre-commit: автоматическое увеличение версии"
echo "   - post-commit: отображение информации о версии"
echo ""
echo "🏷️  Управление типом версии:"
echo "   - Обычный коммит → PATCH (1.0.0 → 1.0.1)"
echo "   - [minor] или feat: → MINOR (1.0.0 → 1.1.0)"
echo "   - [major] или BREAKING CHANGE → MAJOR (1.0.0 → 2.0.0)"
echo ""
echo "🎯 Автоматическое версионирование работает только в main ветке"
