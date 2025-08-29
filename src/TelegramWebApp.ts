// Класс для работы с Telegram WebApp API
export class TelegramWebApp {
    private static tg: any = null;

    static init(): void {
        // Проверяем наличие Telegram WebApp API
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            this.tg = (window as any).Telegram.WebApp;
            console.log('📱 Telegram WebApp API инициализирован');
            
            // Расширяем приложение на весь экран
            this.tg.expand();
            
            // Устанавливаем цвет заголовка
            this.tg.setHeaderColor('#667eea');
            
            console.log('🎯 Telegram WebApp настроен');
        } else {
            console.log('ℹ️ Telegram WebApp API недоступен (запуск вне Telegram)');
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
            // Запрашиваем полноэкранный режим
            if (this.tg.requestFullscreen) {
                await this.tg.requestFullscreen();
                console.log('📺 Telegram: Полноэкранный режим активирован');
            }

            // Блокируем ориентацию в landscape
            if (this.tg.lockOrientation) {
                await this.tg.lockOrientation('landscape');
                console.log('🔒 Telegram: Ориентация заблокирована в landscape');
                return true;
            }

            console.log('⚠️ Telegram: lockOrientation недоступен');
            return false;
        } catch (error) {
            console.log('❌ Ошибка Telegram WebApp:', error);
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
