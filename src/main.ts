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
        
        // Сразу показываем модальное окно при загрузке
        this.showGamePrepModal();
        
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

    private showGamePrepModal(): void {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.id = 'game-prep-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            backdrop-filter: blur(10px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
            border: 3px solid #4CAF50;
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            color: white;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            max-width: 400px;
            margin: 20px;
        `;

        modalContent.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 20px;">🎮</div>
            <h2 style="margin: 0 0 15px 0; color: #4CAF50;">Готовы к приключению?</h2>
            <p style="margin: 0 0 25px 0; opacity: 0.9; line-height: 1.4;">
                Для лучшего игрового опыта игра будет настроена под ваше устройство
            </p>
            <button id="start-game-btn" style="
                background: linear-gradient(145deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                transition: all 0.3s ease;
                width: 100%;
            ">🚀 Начать Игру</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Обработчик кнопки "Начать Игру"
        const startGameBtn = modal.querySelector('#start-game-btn') as HTMLButtonElement;
        if (startGameBtn) {
            startGameBtn.addEventListener('click', async () => {
                await this.startGameSequence(modal);
            });
        }

        console.log('🎯 Модальное окно подготовки к игре показано');
    }

    private async startGameSequence(modal: HTMLElement): Promise<void> {
        const modalContent = modal.querySelector('div') as HTMLElement;
        
        // Показываем экран загрузки
        modalContent.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 20px;">⚡</div>
            <h2 style="margin: 0 0 15px 0; color: #4CAF50;">Подготовка игры...</h2>
            <div style="margin: 20px 0;">
                <div style="width: 100%; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                    <div id="progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); border-radius: 2px; transition: width 0.3s ease;"></div>
                </div>
            </div>
            <p id="loading-text" style="margin: 15px 0 0 0; opacity: 0.8; font-size: 14px;">Настройка ориентации экрана...</p>
        `;

        const progressBar = modal.querySelector('#progress-bar') as HTMLElement;
        const loadingText = modal.querySelector('#loading-text') as HTMLElement;

        // Этап 1: Принудительная горизонтальная ориентация (25%)
        progressBar.style.width = '25%';
        loadingText.textContent = 'Принудительная горизонтальная ориентация...';
        await this.delay(800);

        // ПРИНУДИТЕЛЬНО делаем игру горизонтальной через CSS transform
        this.forceGameLandscape();
        console.log('✅ Игра принудительно переведена в горизонтальный режим');

        // Этап 2: Полноэкранный режим (50%)
        progressBar.style.width = '50%';
        loadingText.textContent = 'Активация полноэкранного режима...';
        await this.delay(800);

        // Пробуем полноэкранный режим
        try {
            // Попробуем полноэкранный режим для всего документа
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
                console.log('✅ Полноэкранный режим активирован для документа');
            } else if ((document.documentElement as any).webkitRequestFullscreen) {
                await (document.documentElement as any).webkitRequestFullscreen();
                console.log('✅ WebKit полноэкранный режим активирован');
            } else if ((document.documentElement as any).mozRequestFullScreen) {
                await (document.documentElement as any).mozRequestFullScreen();
                console.log('✅ Mozilla полноэкранный режим активирован');
            } else if ((document.documentElement as any).msRequestFullscreen) {
                await (document.documentElement as any).msRequestFullscreen();
                console.log('✅ MS полноэкранный режим активирован');
            } else {
                console.log('⚠️ Полноэкранный режим не поддерживается');
            }
        } catch (error) {
            console.log('⚠️ Ошибка активации полноэкранного режима:', error);
        }

        // Этап 3: Адаптация интерфейса (75%)
        progressBar.style.width = '75%';
        loadingText.textContent = 'Адаптация интерфейса...';
        await this.delay(800);

        TelegramWebApp.ensureLandscapeMode();

        // Этап 4: Запуск игры (100%)
        progressBar.style.width = '100%';
        loadingText.textContent = 'Запуск игры...';
        await this.delay(800);

        // Скрываем меню и запускаем игру
        const menu = document.getElementById('menu');
        if (menu) menu.classList.add('hidden');
        
        this.game.start();

        // Убираем модальное окно
        modal.remove();

        console.log('🎮 Игра успешно запущена');
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private forceGameLandscape(): void {
        console.log('🔄 Эмулируем автоповорот устройства');
        
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
            // Эмулируем автоповорот через изменение метатега viewport
            const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
            if (viewport) {
                // Меняем viewport на горизонтальный режим
                viewport.setAttribute('content', 
                    'width=' + window.innerHeight + ', height=' + window.innerWidth + 
                    ', initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                );
                console.log('📱 Viewport изменен на горизонтальный режим');
            }
            
            // Простая и правильная эмуляция автоповорота
            const style = document.createElement('style');
            style.id = 'emulate-autorotate';
            style.textContent = `
                /* Убираем все отступы */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                /* Поворачиваем весь body */
                body {
                    transform: rotate(90deg);
                    transform-origin: center center;
                    width: 100vh;
                    height: 100vw;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    margin-left: -50vh;
                    margin-top: -50vw;
                    overflow: hidden;
                }
                
                /* Контейнер игры на весь экран */
                #gameContainer {
                    width: 100vh !important;
                    height: 100vw !important;
                    position: relative !important;
                }
                
                /* Canvas на весь контейнер */
                #gameCanvas {
                    width: 100% !important;
                    height: 100% !important;
                    display: block !important;
                }
                
                /* Скрываем меню */
                #menu {
                    display: none !important;
                }
            `;
            
            // Удаляем старый стиль
            const oldStyle = document.getElementById('emulate-autorotate');
            if (oldStyle) oldStyle.remove();
            
            // Добавляем новый стиль
            document.head.appendChild(style);
            
            // Обновляем логические размеры canvas под новую ориентацию
            const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
            if (canvas) {
                // Меняем внутренние размеры canvas местами для горизонтального режима
                canvas.width = window.innerHeight;
                canvas.height = window.innerWidth;
                
                console.log(`📱 Canvas логические размеры: ${canvas.width}x${canvas.height}`);
            }
            
            // Имитируем событие изменения размера окна
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                console.log('🔄 Событие resize отправлено');
            }, 100);
            
            console.log('✅ Автоповорот эмулирован успешно');
        } else {
            console.log('✅ Устройство уже в горизонтальном режиме');
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