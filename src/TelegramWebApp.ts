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
            
            // Расширяем приложение на весь экран
            if (this.tg.expand) {
                this.tg.expand();
                console.log('📺 Telegram: expand() вызван');
            }
            
            // Устанавливаем цвет заголовка
            if (this.tg.setHeaderColor) {
                this.tg.setHeaderColor('#667eea');
            }
            
            // Пробуем сразу активировать полноэкранный режим
            setTimeout(() => {
                this.requestFullscreenLandscape();
            }, 500);
            
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
            
            // Метод 1: Новый API (Telegram 7.0+)
            if (this.tg.requestFullscreen) {
                try {
                    await this.tg.requestFullscreen();
                    console.log('📺 Telegram: Полноэкранный режим активирован (новый API)');
                } catch (error) {
                    console.log('⚠️ Ошибка requestFullscreen:', error);
                }
            }

            // Метод 2: Альтернативный метод для ориентации
            if (this.tg.lockOrientation) {
                try {
                    await this.tg.lockOrientation('landscape-primary');
                    console.log('🔒 Telegram: Ориентация заблокирована (landscape-primary)');
                    return true;
                } catch (error) {
                    console.log('⚠️ Ошибка lockOrientation:', error);
                }
            }

            // Метод 3: Попробуем через setViewportData
            if (this.tg.setViewportData) {
                try {
                    this.tg.setViewportData({ orientation: 'landscape' });
                    console.log('📱 Telegram: Установлены viewport данные');
                } catch (error) {
                    console.log('⚠️ Ошибка setViewportData:', error);
                }
            }

            // Метод 4: Через enableClosingConfirmation для полноэкранного режима
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
