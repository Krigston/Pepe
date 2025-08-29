// Класс для работы с Telegram WebApp API
export class TelegramWebApp {
    private static tg: any = null;

    static init(): void {
        // Проверяем наличие Telegram WebApp API
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            this.tg = (window as any).Telegram.WebApp;
            console.log('📱 Telegram WebApp API инициализирован');
            console.log('🔍 Telegram версия:', this.tg.version);
            console.log('🔍 Telegram платформа:', this.tg.platform);
            
            // Немедленно расширяем приложение на весь экран
            if (this.tg.expand) {
                this.tg.expand();
                console.log('📺 Telegram: expand() вызван');
            }
            
            // Устанавливаем цвет заголовка
            if (this.tg.setHeaderColor) {
                this.tg.setHeaderColor('#667eea');
            }
            
            // Немедленно пробуем полноэкранный режим
            this.requestFullscreenLandscape();
            
            // И дополнительно через небольшую задержку
            setTimeout(() => {
                this.requestFullscreenLandscape();
            }, 100);
            
            // И еще раз с большей задержкой для надежности
            setTimeout(() => {
                this.requestFullscreenLandscape();
            }, 1000);
            
            console.log('🎯 Telegram WebApp настроен');
        } else {
            console.log('ℹ️ Telegram WebApp API недоступен (запуск вне Telegram)');
            
            // Пробуем подождать загрузки
            setTimeout(() => {
                if ((window as any).Telegram?.WebApp) {
                    console.log('🔄 Telegram WebApp API загружен с задержкой');
                    this.init();
                }
            }, 1000);
        }
    }

    static isTelegramWebApp(): boolean {
        return this.tg !== null;
    }

    static async requestFullscreenLandscape(): Promise<boolean> {
        if (!this.tg) {
            console.log('❌ Telegram WebApp недоступен');
            return false;
        }

        try {
            console.log('🔍 Доступные методы Telegram:', Object.keys(this.tg));
            console.log('📱 Платформа:', this.tg.platform);
            console.log('📱 Версия Telegram:', this.tg.version);
            
            // Простая блокировка ориентации через Screen Orientation API
            this.lockScreenOrientation();

            // Базовые настройки Telegram
            if (this.tg.expand) {
                this.tg.expand();
                console.log('📺 Telegram: expand() выполнен');
            }

            if (this.tg.enableClosingConfirmation) {
                this.tg.enableClosingConfirmation();
                console.log('✅ Telegram: Включено подтверждение закрытия');
            }

            return true;
        } catch (error) {
            console.log('❌ Общая ошибка Telegram WebApp:', error);
            return false;
        }
    }

    // Полноэкранный режим с принудительной горизонтальной ориентацией
    static async lockScreenOrientation(): Promise<void> {
        try {
            // 1. Пробуем Screen Orientation API
            if ((screen as any).orientation && (screen as any).orientation.lock) {
                try {
                    await (screen as any).orientation.lock('landscape');
                    console.log('✅ Screen Orientation API: landscape заблокирован');
                    return;
                } catch (error) {
                    console.log('⚠️ Screen Orientation API не сработал:', error);
                }
            }

            // 2. Пробуем полноэкранный режим HTML5
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer && gameContainer.requestFullscreen) {
                try {
                    await gameContainer.requestFullscreen();
                    console.log('✅ HTML5 Fullscreen активирован');
                    
                    // После входа в полноэкранный режим пробуем заблокировать ориентацию
                    setTimeout(async () => {
                        try {
                            if ((screen as any).orientation && (screen as any).orientation.lock) {
                                await (screen as any).orientation.lock('landscape');
                                console.log('✅ Ориентация заблокирована в полноэкранном режиме');
                            }
                        } catch (e) {
                            console.log('⚠️ Не удалось заблокировать ориентацию в полноэкранном режиме');
                        }
                    }, 100);
                    return;
                } catch (error) {
                    console.log('⚠️ HTML5 Fullscreen не сработал:', error);
                }
            }

            // 3. Fallback - CSS принудительный поворот
            console.log('🔄 Применяем CSS fallback для горизонтальной ориентации');
            this.applyCSSLandscapeForce();

        } catch (error) {
            console.error('❌ Все методы блокировки ориентации не сработали:', error);
        }
    }

    // CSS принудительный поворот в горизонтальный режим
    static applyCSSLandscapeForce(): void {
        const isPortrait = window.innerHeight > window.innerWidth;
        if (!isPortrait) {
            console.log('✅ Уже в горизонтальном режиме');
            return;
        }

        console.log('🔄 Применяем CSS поворот для горизонтального режима');
        
        const style = document.createElement('style');
        style.id = 'force-landscape-style';
        style.textContent = `
            body.force-landscape {
                overflow: hidden;
            }
            body.force-landscape #gameContainer {
                transform: rotate(90deg) translate(0, -100%);
                transform-origin: top left;
                width: 100vh;
                height: 100vw;
                position: fixed;
                top: 0;
                left: 0;
            }
        `;
        
        if (!document.getElementById('force-landscape-style')) {
            document.head.appendChild(style);
        }
        
        document.body.classList.add('force-landscape');
        console.log('✅ CSS принудительный горизонтальный режим применен');
    }

    static isFullscreen(): boolean {
        return this.tg?.isFullscreen || false;
    }

    static exitFullscreen(): void {
        if (this.tg?.exitFullscreen) {
            this.tg.exitFullscreen();
            console.log('🚪 Telegram: Выход из полноэкранного режима');
        }
    }

    static onFullscreenChanged(callback: (isFullscreen: boolean) => void): void {
        if (this.tg) {
            this.tg.onEvent('fullscreenChanged', callback);
        }
    }

    static onOrientationChanged(callback: () => void): void {
        if (this.tg) {
            this.tg.onEvent('orientationChanged', callback);
        }
    }



    static close(): void {
        if (this.tg) {
            this.tg.close();
        }
    }

    static ready(): void {
        if (this.tg) {
            this.tg.ready();
        }
    }
}
