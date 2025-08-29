#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Автоматическое увеличение версии по семантическому версионированию
 * Использование: node scripts/version-bump.js [patch|minor|major]
 */

// Получаем тип увеличения версии из аргументов командной строки
const versionType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('❌ Неверный тип версии. Используйте: patch, minor или major');
    process.exit(1);
}

// Пути к файлам
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionManagerPath = path.join(__dirname, '..', 'src', 'VersionManager.ts');

try {
    // Читаем package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Парсим текущую версию
    const currentVersion = packageJson.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Увеличиваем версию
    let newVersion;
    switch (versionType) {
        case 'major':
            newVersion = `${major + 1}.0.0`;
            break;
        case 'minor':
            newVersion = `${major}.${minor + 1}.0`;
            break;
        case 'patch':
        default:
            newVersion = `${major}.${minor}.${patch + 1}`;
            break;
    }
    
    // Обновляем package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    // Обновляем VersionManager.ts
    let versionManagerContent = fs.readFileSync(versionManagerPath, 'utf8');
    const versionRegex = /public static readonly CURRENT_VERSION = '[^']+';/;
    const newVersionLine = `public static readonly CURRENT_VERSION = '${newVersion}';`;
    
    if (versionRegex.test(versionManagerContent)) {
        versionManagerContent = versionManagerContent.replace(versionRegex, newVersionLine);
    } else {
        console.error('❌ Не удалось найти CURRENT_VERSION в VersionManager.ts');
        process.exit(1);
    }
    
    fs.writeFileSync(versionManagerPath, versionManagerContent);
    
    // Выводим результат
    console.log(`✅ Версия обновлена: ${currentVersion} → ${newVersion}`);
    console.log(`📝 Тип обновления: ${versionType}`);
    console.log(`📦 Обновлены файлы:`);
    console.log(`   - package.json`);
    console.log(`   - src/VersionManager.ts`);
    
    // Информация о типах версий
    if (versionType === 'major') {
        console.log('🔥 MAJOR: Критические изменения, несовместимые с предыдущими версиями');
    } else if (versionType === 'minor') {
        console.log('✨ MINOR: Новые функции, обратно совместимые');
    } else {
        console.log('🐛 PATCH: Исправления багов, обратно совместимые');
    }
    
} catch (error) {
    console.error('❌ Ошибка при обновлении версии:', error.message);
    process.exit(1);
}
