import { Game } from './Game';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { MobileUtils } from './MobileUtils';

class Main {
    private game: Game;
    private inputManager: InputManager;
    private audioManager: AudioManager;

    constructor() {
        this.audioManager = new AudioManager();
        this.inputManager = new InputManager();
        this.game = new Game(this.inputManager, this.audioManager);
        
        this.initializeMobileSupport();
        this.initializeUI();
        this.startGameLoop();
    }
    
    private initializeMobileSupport(): void {
        if (MobileUtils.isMobileDevice()) {
            console.log('Мобильное устройство обнаружено');
            
            // Принудительно переходим в горизонтальную ориентацию
            this.encourageLandscapeMode();
            
            // Отключаем зум
            this.disableMobileZoom();
            
            // Настраиваем полноэкранный режим
            this.setupFullscreen();
        }
    }
    
    private encourageLandscapeMode(): void {
        // Показываем сообщение о повороте экрана
        const orientationMessage = document.createElement('div');
        orientationMessage.id = 'orientationMessage';
        orientationMessage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
        `;
        
        orientationMessage.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 20px;">📱➡️📱</div>
            <div style="font-size: 18px; margin-bottom: 10px;">Поверните устройство</div>
            <div style="font-size: 14px;">для лучшего игрового опыта</div>
        `;
        
        const checkOrientation = () => {
            if (MobileUtils.isLandscape() || window.innerWidth > 768) {
                if (orientationMessage.parentNode) {
                    orientationMessage.parentNode.removeChild(orientationMessage);
                }
            } else {
                if (!orientationMessage.parentNode) {
                    document.body.appendChild(orientationMessage);
                }
            }
        };
        
        // Проверяем при загрузке
        setTimeout(checkOrientation, 100);
        
        // Слушаем изменения ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(checkOrientation, 500);
        });
        
        window.addEventListener('resize', checkOrientation);
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
    
    private setupFullscreen(): void {
        // Попытка войти в полноэкранный режим при первом touch
        const enterFullscreen = () => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(console.log);
            } else if ((document.documentElement as any).webkitRequestFullscreen) {
                (document.documentElement as any).webkitRequestFullscreen();
            }
            
            // Удаляем обработчик после первого использования
            document.removeEventListener('touchstart', enterFullscreen);
        };
        
        document.addEventListener('touchstart', enterFullscreen, { once: true });
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