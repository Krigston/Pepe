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
            
            const success = await TelegramWebApp.requestFullscreenLandscape();
            console.log('📱 Telegram API результат:', success);
            
            // Настраиваем постоянный контроль ориентации
            TelegramWebApp.setupOrientationControl();
            
            // ВСЕГДА применяем CSS fix для Telegram, независимо от API
            this.applyTelegramCSSFix();
            
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
    
    private applyTelegramCSSFix(): void {
        console.log('🔧 Применяем принудительный горизонтальный CSS fix для Telegram');
        
        // Добавляем CSS для принудительного горизонтального режима
        const style = document.createElement('style');
        style.id = 'telegram-landscape-fix';
        style.textContent = `
            /* Принудительная горизонтальная ориентация для Telegram */
            body.telegram-forced-landscape {
                transform-origin: top left;
                overflow: hidden;
            }
            
            /* Поворачиваем весь контент на 90 градусов */
            body.telegram-forced-landscape #app {
                transform: rotate(90deg) translateY(-100%);
                transform-origin: top left;
                width: 100vh;
                height: 100vw;
                position: fixed;
                top: 0;
                left: 0;
            }
            
            /* Скрываем полосы прокрутки */
            body.telegram-forced-landscape {
                overflow: hidden;
                -webkit-overflow-scrolling: touch;
            }
        `;
        
        if (!document.getElementById('telegram-landscape-fix')) {
            document.head.appendChild(style);
        }
        
        // Применяем принудительный поворот для вертикальной ориентации
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
            console.log('📱 Портретный режим в Telegram - принудительно поворачиваем');
            document.body.classList.add('telegram-forced-landscape');
        } else {
            console.log('📱 Уже горизонтальный режим в Telegram');
            document.body.classList.add('telegram-landscape-ready');
        }
        
        // Принудительно скрываем адресную строку
        if (window.scrollTo) {
            window.scrollTo(0, 1);
        }
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