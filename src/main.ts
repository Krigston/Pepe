import { Game } from './Game';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { MobileUtils } from './MobileUtils';
import { VersionManager } from './VersionManager';

class Main {
    private game: Game;
    private inputManager: InputManager;
    private audioManager: AudioManager;

    constructor() {
        this.audioManager = new AudioManager();
        this.inputManager = new InputManager();
        this.game = new Game(this.inputManager, this.audioManager);
        
        this.initializeMobileSupport();
        this.initializeVersionDisplay();
        this.initializeUI();
        this.startGameLoop();
    }
    
    private async initializeMobileSupport(): Promise<void> {
        const isMobile = MobileUtils.isMobileDevice();
        console.log(`🔍 Проверка устройства - isMobile: ${isMobile}`);
        console.log(`📱 Размер экрана: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`👆 Поддержка тач: ${'ontouchstart' in window}`);
        console.log(`🖱️ maxTouchPoints: ${navigator.maxTouchPoints}`);
        console.log(`🌐 User Agent: ${navigator.userAgent}`);
        console.log(`📐 Ориентация: ${MobileUtils.isLandscape() ? 'landscape' : 'portrait'}`);
        
        if (isMobile) {
            console.log('🔥 Мобильное устройство обнаружено!');
            
            // Отключаем зум
            this.disableMobileZoom();
            
            // Пытаемся заблокировать ориентацию при первом взаимодействии пользователя
            this.setupOrientationLock();
            
            // Показываем мобильные элементы управления
            this.inputManager.showMobileControls();
            
            console.log('💪 Мобильная версия инициализирована');
        } else {
            console.log('🖥️ Десктопное устройство - мобильные функции отключены');
        }
    }
    
    private setupOrientationLock(): void {
        // Блокируем ориентацию при первом взаимодействии пользователя
        const lockOrientation = async () => {
            const success = await MobileUtils.lockToLandscape();
            if (success) {
                console.log('🎯 Автоповорот активирован - игра заблокирована в горизонтальном режиме!');
                // Убираем обработчики после успешной блокировки
                document.removeEventListener('touchstart', lockOrientation);
                document.removeEventListener('click', lockOrientation);
            } else {
                console.log('⚠️ Не удалось заблокировать ориентацию - используйте поворот устройства вручную');
            }
        };
        
        // Ждем первого взаимодействия пользователя для блокировки ориентации
        document.addEventListener('touchstart', lockOrientation, { once: true });
        document.addEventListener('click', lockOrientation, { once: true });
        
        // Также пытаемся заблокировать сразу (может не сработать без пользовательского жеста)
        setTimeout(async () => {
            const success = await MobileUtils.lockToLandscape();
            if (success) {
                console.log('🚀 Ориентация заблокирована автоматически!');
            }
        }, 1000);
    }
    

    
    private disableMobileZoom(): void {
        // Обновляем viewport meta tag
        let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
        
        // Предотвращаем зум жестами
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    

    
    private initializeVersionDisplay(): void {
        const versionIndicator = document.getElementById('versionIndicator');
        if (versionIndicator) {
            const buildInfo = VersionManager.getBuildInfo();
            versionIndicator.textContent = VersionManager.getFormattedVersion();
            
            // Добавляем tooltip с дополнительной информацией
            versionIndicator.title = `Версия: ${buildInfo.version}\nСборка: ${buildInfo.buildDate}`;
            
            console.log(`🎮 Игра запущена - ${VersionManager.getFormattedVersion()}`);
            console.log('Build Info:', buildInfo);
        }
    }

    private initializeUI(): void {
        const startBtn = document.getElementById('startBtn');
        const instructionsBtn = document.getElementById('instructionsBtn');
        const menu = document.getElementById('menu');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.game.start();
                if (menu) menu.classList.add('hidden');
            });
        }

        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', () => {
                this.showInstructions();
            });
        }

        // Обработчик кнопки "Новый уровень"
        const newLevelBtn = document.getElementById('newLevelBtn');
        if (newLevelBtn) {
            newLevelBtn.addEventListener('click', () => {
                this.game.resetToNewLevel(); // Полный сброс на уровень 1
            });
        }
    }

    private showInstructions(): void {
        const menu = document.getElementById('menu');
        if (menu) {
            const isMobile = MobileUtils.isMobileDevice();
            
            menu.innerHTML = `
                <h2>🎮 Управление</h2>
                ${isMobile ? 
                    `<p><strong>Левые кнопки</strong> - Движение влево/вправо и прыжок</p>
                     <p><strong>Правые кнопки</strong> - Прыжок (🦘) и взаимодействие (E)</p>` :
                    `<p><strong>WASD</strong> или <strong>Стрелки</strong> - Движение</p>
                     <p><strong>Пробел</strong> - Прыжок</p>
                     <p><strong>E</strong> - Взаимодействие</p>`
                }
                <br>
                <h3>🎯 Цель игры</h3>
                <p>• Собирай мемы для очков</p>
                <p>• Избегай троллей</p>
                <p>• Достигай финиша</p>
                <p>• Найди все секреты!</p>
                ${isMobile ? '<p><strong>Играйте в горизонтальном режиме!</strong></p>' : ''}
                <br>
                <button id="backBtn">Назад</button>
            `;

            const backBtn = document.getElementById('backBtn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    location.reload();
                });
            }
        }
    }

    private startGameLoop(): void {
        const gameLoop = () => {
            this.game.update();
            this.game.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Запуск игры когда страница загружена
window.addEventListener('load', () => {
    new Main();
}); 