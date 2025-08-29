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

    // Простая и эффективная блокировка ориентации
    static lockScreenOrientation(): void {
        // Проверяем поддержку Screen Orientation API
        if ((screen as any).orientation && (screen as any).orientation.lock) {
            try {
                // Блокируем горизонтальную ориентацию
                (screen as any).orientation.lock('landscape');
                console.log('Ориентация успешно заблокирована в горизонтальном режиме.');
            } catch (error) {
                console.error('Не удалось заблокировать ориентацию:', error);
            }
        } else {
            console.error('Screen Orientation API не поддерживается.');
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
