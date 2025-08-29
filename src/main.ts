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
            
            // Показываем заглушку загрузки
            this.showLoadingSplash();
            
            // Отключаем зум
            this.disableMobileZoom();
            
            // Принудительный полноэкранный режим и автоповорот
            this.forceFullscreenAndRotation();
            
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
    
    private forceFullscreenAndRotation(): void {
        // Создаем невидимую кнопку для активации полноэкранного режима
        const createHiddenButton = () => {
            const btn = document.createElement('button');
            btn.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100vw;
                height: 100vh;
                background: transparent;
                border: none;
                z-index: 10000;
                cursor: pointer;
                font-size: 0;
                opacity: 0;
            `;
            
            btn.addEventListener('click', async () => {
                try {
                    // 1. Входим в полноэкранный режим
                    await MobileUtils.enterFullscreen();
                    console.log('📺 Полноэкранный режим активирован');
                    
                    // 2. Блокируем ориентацию в landscape
                    const success = await MobileUtils.lockToLandscape();
                    if (success) {
                        console.log('🎯 АВТОПОВОРОТ АКТИВИРОВАН!');
                        btn.remove(); // Удаляем кнопку после успеха
                    }
                    
                } catch (error) {
                    console.log('⚠️ Ошибка активации:', error);
                }
            });
            
            document.body.appendChild(btn);
            return btn;
        };
        
        // Показываем инструкцию пользователю
        const showInstruction = () => {
            const instruction = document.createElement('div');
            instruction.style.cssText = `
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                z-index: 10001;
                text-align: center;
                animation: pulse 2s infinite;
            `;
            instruction.textContent = '👆 Коснитесь экрана для активации горизонтального режима';
            document.body.appendChild(instruction);
            
            // Удаляем через 5 секунд
            setTimeout(() => instruction.remove(), 5000);
        };
        
        // Создаем кнопку и показываем инструкцию
        setTimeout(() => {
            createHiddenButton();
            showInstruction();
        }, 1200); // После заглушки загрузки
        
        console.log('🎯 Настроена принудительная активация полноэкранного режима и автоповорота');
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