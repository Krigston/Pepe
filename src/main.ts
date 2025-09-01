import { Game } from './Game';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { MobileUtils } from './MobileUtils';
import { VersionManager } from './VersionManager';
import { TelegramWebApp } from './TelegramWebApp';

class Main {
    private game: Game;
    private inputManager: InputManager;
    private audioManager: AudioManager;

    constructor() {
        console.log('🎮 Pepe Game запускается...');
        console.log(`📝 Версия: ${VersionManager.getVersion()}`);
        
        // Инициализация Telegram WebApp
        TelegramWebApp.init();
        
        this.audioManager = new AudioManager();
        this.inputManager = new InputManager();
        this.game = new Game(this.inputManager, this.audioManager);
        
        this.initializeMobileSupport();
        this.initializeVersionDisplay();
        this.initializeUI();
        
        // Сразу инициализируем игру
        this.initializeGame();
        this.setupOrientationCheck();
        
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
            
            // Показываем заглушку загрузки
            this.showLoadingSplash();
            
            // Отключаем зум
            this.disableMobileZoom();
            
            // Просто адаптируем игру под любую ориентацию
            await this.setupOrientationAdaptation();
            
            // Показываем мобильные элементы управления
            this.inputManager.showMobileControls();
            
            console.log('💪 Мобильная версия инициализирована');
        } else {
            console.log('🖥️ Десктопное устройство - мобильные функции отключены');
        }
    }
    
    private showLoadingSplash(): void {
        const splash = document.createElement('div');
        splash.id = 'loadingSplash';
        splash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        splash.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">🐸</div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Пепе: Легендарное Приключение</div>
            <div style="font-size: 16px; opacity: 0.8;">Загрузка игры...</div>
            <div style="margin-top: 20px; width: 200px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: white; animation: loadingBar 1s ease-in-out;"></div>
            </div>
        `;
        
        // Добавляем CSS анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes loadingBar {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(splash);
        
        // Убираем заглушку через 1 секунду
        setTimeout(() => {
            splash.remove();
        }, 1000);
    }
    
    private async setupOrientationAdaptation(): Promise<void> {
        const isPortrait = window.innerHeight > window.innerWidth;
        
        // Сначала пробуем Telegram WebApp API
        if (TelegramWebApp.isTelegramWebApp()) {
            console.log('📱 Запуск в Telegram - используем WebApp API');
            
            // Простая инициализация для мобильной игры
            await TelegramWebApp.requestFullscreenLandscape();
            TelegramWebApp.ensureLandscapeMode();
            
                document.body.classList.add('landscape-ready');
                
                // Уведомляем Telegram что приложение готово
                TelegramWebApp.ready();
                return;
        }
        
        // Fallback для обычного браузера
        if (isPortrait) {
            console.log('📱 Портретный режим - показываем сообщение о повороте');
            this.showRotateMessage();
        } else {
            console.log('🖥️ Горизонтальный режим - игра готова');
            document.body.classList.add('landscape-ready');
        }
        
        // Отслеживаем изменения ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                location.reload();
            }, 100);
        });
        
        console.log('🎯 Адаптация ориентации настроена');
    }
    
    private async initializeGame(): Promise<void> {
        console.log('🎮 Прямая инициализация игры без модального окна');
        
        // Настраиваем адаптивный режим для всех устройств
        this.setupResponsiveGame();
        
        // Скрываем меню и показываем игру
        const menu = document.getElementById('menu');
        if (menu) {
            menu.style.display = 'none';
        }
        
        // Запускаем игру
        if (this.game) {
            document.body.classList.add('game-started');
            this.game.start();
            console.log('✅ Игра запущена напрямую');
        }
    }



    private setupResponsiveGame(): void {
        console.log('🎮 Профессиональная настройка адаптивной игры');
        
        // Добавляем CSS классы для ориентации
        this.setupOrientationClasses();
        
        // Настраиваем адаптивный canvas
        this.setupResponsiveCanvas();
        
        // Слушаем изменения ориентации
        this.setupOrientationListener();
        
        console.log(`✅ Адаптивная игра настроена`);
    }

    private setupOrientationClasses(): void {
        const updateOrientation = () => {
            const isLandscape = window.innerWidth > window.innerHeight;
            document.body.classList.toggle('landscape', isLandscape);
            document.body.classList.toggle('portrait', !isLandscape);
            console.log(`📱 Ориентация: ${isLandscape ? 'landscape' : 'portrait'}`);
        };
        
        updateOrientation();
        window.addEventListener('orientationchange', updateOrientation);
        window.addEventListener('resize', updateOrientation);
    }

    private setupResponsiveCanvas(): void {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        const updateCanvas = () => {
            const container = document.getElementById('gameContainer');
            if (!container) return;
            
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Адаптируем canvas под контейнер
            canvas.width = containerWidth;
            canvas.height = containerHeight;
            
            console.log(`🎮 Canvas обновлен: ${canvas.width}x${canvas.height}`);
            
            // Уведомляем игру
            window.dispatchEvent(new Event('resize'));
        };
        
        updateCanvas();
        window.addEventListener('resize', updateCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateCanvas, 100);
        });
    }

    private setupOrientationListener(): void {
        // Добавляем CSS стили для адаптивного дизайна
        const style = document.createElement('style');
        style.id = 'responsive-game-styles';
        style.textContent = `
            /* Базовые стили */
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: Arial, sans-serif;
            }
            
            #gameContainer {
                position: relative;
                width: 100vw;
                height: 100vh;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #gameCanvas {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                display: block;
            }
            
            /* Стили для портретной ориентации */
            body.portrait #gameContainer {
                flex-direction: column;
            }
            
            body.portrait #gameCanvas {
                width: 100vw;
                height: 60vh; /* Оставляем место для UI */
            }
            
            /* Стили для горизонтальной ориентации */
            body.landscape #gameCanvas {
                width: 100vw;
                height: 100vh;
            }
            
            /* Скрываем меню при запуске игры */
            .game-started #menu {
                display: none;
            }
            
            @media screen and (orientation: landscape) {
                /* Оптимизация для горизонтальной ориентации */
                #gameCanvas {
                    width: 100vw !important;
                    height: 100vh !important;
                }
            }
            
            @media screen and (orientation: portrait) {
                /* Оптимизация для портретной ориентации */
                #gameCanvas {
                    width: 100vw !important;
                    height: 60vh !important;
                }
            }
        `;
        
        const oldStyle = document.getElementById('responsive-game-styles');
        if (oldStyle) oldStyle.remove();
        document.head.appendChild(style);
        
        console.log('🎨 Адаптивные CSS стили применены');
    }




    

    
    private showRotateMessage(): void {
        const message = document.createElement('div');
        message.className = 'rotate-message';
        message.innerHTML = `
            <div class="rotate-content">
                <div class="rotate-icon">📱➡️📱</div>
                <h2>Поверните устройство</h2>
                <p>Для лучшего игрового опыта<br>используйте горизонтальную ориентацию</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Скрываем игровой контент
        const gameContainer = document.querySelector('#gameContainer') as HTMLElement;
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
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

        if (startBtn) {
            startBtn.addEventListener('click', async () => {
                // Напрямую запускаем игру (модалка уже показана при загрузке)
                this.game.start();
                const menu = document.getElementById('menu');
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

    private setupOrientationCheck(): void {
        if (!MobileUtils.isMobileDevice()) return;
        
        const createOrientationHint = () => {
            const hint = document.createElement('div');
            hint.id = 'orientationHint';
            hint.className = 'rotate-message';
            hint.innerHTML = `
                <div class="rotate-content">
                    <div class="rotate-icon">📱➡️</div>
                    <h2>Поверните устройство</h2>
                    <p>Для комфортной игры рекомендуется горизонтальная ориентация</p>
                </div>
            `;
            document.body.appendChild(hint);
        };
        
        const checkOrientation = () => {
            const hint = document.getElementById('orientationHint');
            
            if (MobileUtils.isLandscape()) {
                // Горизонтальная - скрываем hint и автозапускаем игру
                if (hint) hint.remove();
                this.autoStartGame();
            } else {
                // Вертикальная - показываем hint
                if (!hint) createOrientationHint();
            }
        };
        
        // Проверяем сразу
        checkOrientation();
        
        // Слушаем изменения ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(checkOrientation, 300);
        });
        
        window.addEventListener('resize', checkOrientation);
    }
    
    private autoStartGame(): void {
        // Автоматически запускаем игру без модалки
        setTimeout(() => {
            this.game.start();
        }, 100);
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