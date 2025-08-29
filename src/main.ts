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
            this.game.start();
            console.log('✅ Игра запущена напрямую');
        }
    }



    private setupResponsiveGame(): void {
        console.log('🎮 Принудительная настройка горизонтальной игры');
        
        const isMobile = MobileUtils.isMobileDevice();
        
        if (isMobile) {
            // АВТОМАТИЧЕСКИ делаем игру горизонтальной
            this.forceLandscapeMode();
        } else {
            // На десктопе просто настраиваем canvas
            this.setupAdaptiveCanvas();
        }
        
        console.log(`📱 Горизонтальный режим активирован для мобильных`);
    }

    private forceLandscapeMode(): void {
        console.log('🔄 ПРИНУДИТЕЛЬНЫЙ поворот в горизонтальный режим');
        
        // 1. Настраиваем viewport для горизонтального отображения
        this.setupLandscapeViewport();
        
        // 2. Применяем CSS transform для поворота интерфейса
        this.applyLandscapeTransform();
        
        // 3. Настраиваем canvas под горизонтальный режим
        this.setupLandscapeCanvas();
        
        console.log('✅ Игра принудительно переведена в горизонтальный режим');
    }

    private setupLandscapeViewport(): void {
        const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
        if (viewport) {
            // Эмулируем горизонтальный режим через viewport
            const height = window.innerHeight;
            const width = window.innerWidth;
            
            if (height > width) {
                // Если portrait - меняем местами размеры в viewport
                viewport.content = `width=${height}, height=${width}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`;
                console.log(`📐 Viewport настроен: ${height}x${width} (принудительно горизонтально)`);
            }
        }
    }

    private applyLandscapeTransform(): void {
        const height = window.innerHeight;
        const width = window.innerWidth;
        
        if (height > width) {
            console.log(`📐 Поворачиваем из ${width}x${height} в горизонтальный режим`);
            
            // Применяем РАДИКАЛЬНЫЙ CSS transform для полного поворота
            const style = document.createElement('style');
            style.id = 'force-landscape-transform';
            style.textContent = `
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    position: fixed !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                
                #gameContainer {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vh !important;
                    height: 100vw !important;
                    transform: rotate(90deg) translate(-50%, -50%) !important;
                    transform-origin: 50vw 50vh !important;
                    background: #000 !important;
                    z-index: 1000 !important;
                }
                
                #gameCanvas {
                    width: 100% !important;
                    height: 100% !important;
                    display: block !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                #menu {
                    display: none !important;
                }
                
                /* Скрываем все остальное */
                body > *:not(#gameContainer) {
                    display: none !important;
                }
            `;
            
            // Удаляем старые стили и добавляем новые
            const oldStyle = document.getElementById('force-landscape-transform');
            if (oldStyle) oldStyle.remove();
            document.head.appendChild(style);
            
            console.log('🔥 РАДИКАЛЬНЫЙ CSS поворот применен! Игра должна быть горизонтальной');
        } else {
            console.log('✅ Уже в горизонтальном режиме');
        }
    }

    private setupLandscapeCanvas(): void {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        const height = window.innerHeight;
        const width = window.innerWidth;
        
        // Настраиваем canvas под принудительно горизонтальный режим
        if (height > width) {
            // После CSS поворота высота экрана становится шириной canvas
            const landscapeWidth = height;
            const landscapeHeight = width;
            
            canvas.width = landscapeWidth;
            canvas.height = landscapeHeight;
            
            console.log(`🎮 Canvas для горизонтального режима: ${canvas.width}x${canvas.height} (было ${width}x${height})`);
        } else {
            canvas.width = width;
            canvas.height = height;
            console.log(`🎮 Canvas для уже горизонтального: ${canvas.width}x${canvas.height}`);
        }
        
        // Уведомляем игру об изменении размеров
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            console.log('📡 Событие resize отправлено игре');
        }, 200);
    }

    private setupAdaptiveCanvas(): void {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        // Для десктопа - обычные размеры
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.objectFit = 'contain';
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        console.log(`🖥️ Desktop canvas: ${canvas.width}x${canvas.height}`);
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