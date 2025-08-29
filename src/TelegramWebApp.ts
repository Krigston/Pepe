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
            
            // Адаптируем игру под мобильный режим
            this.ensureLandscapeMode();

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

    // Простая адаптация игры под горизонтальный режим
    static ensureLandscapeMode(): void {
        console.log('🎮 Настройка горизонтального режима для мобильной игры');
        
        // Убираем все CSS поворота которые ломают игру
        document.body.classList.remove('force-landscape');
        const oldStyle = document.getElementById('force-landscape-style');
        if (oldStyle) oldStyle.remove();
        
        // Адаптируем размеры canvas под мобильный горизонтальный режим
        this.adaptCanvasForMobile();
        
        // Показываем предупреждение для портретного режима
        this.showOrientationHint();
    }

    static adaptCanvasForMobile(): void {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!canvas) return;

        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
            // В портретном режиме делаем canvas шире но короче
            canvas.style.width = '100vw';
            canvas.style.height = '60vh';
            console.log('📱 Canvas адаптирован под портретный режим');
        } else {
            // В горизонтальном режиме используем полный экран
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            console.log('📱 Canvas адаптирован под горизонтальный режим');
        }
    }

    static showOrientationHint(): void {
        const isPortrait = window.innerHeight > window.innerWidth;
        
        // Удаляем старое уведомление
        const oldHint = document.getElementById('orientation-hint');
        if (oldHint) oldHint.remove();
        
        if (isPortrait) {
            const hint = document.createElement('div');
            hint.id = 'orientation-hint';
            hint.style.cssText = `
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000;
                text-align: center;
            `;
            hint.innerHTML = '📱 Поверните устройство для лучшего игрового опыта';
            document.body.appendChild(hint);
            
            // Убираем уведомление через 5 секунд
            setTimeout(() => {
                if (hint.parentNode) hint.remove();
            }, 5000);
        }
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
