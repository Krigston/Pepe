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
            
            // Пробуем сразу активировать полноэкранный режим и контроль ориентации
            setTimeout(() => {
                this.requestFullscreenLandscape();
                this.setupOrientationControl();
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
            console.log('📱 Платформа:', this.tg.platform);
            
            // Проверяем, что это мобильное устройство
            if (!['ios', 'android'].includes(this.tg.platform)) {
                console.log('ℹ️ Блокировка ориентации работает только на мобильных устройствах');
                return false;
            }

            // Принудительно блокируем горизонтальную ориентацию
            if (this.tg.lockOrientation) {
                try {
                    // Пробуем разные варианты
                    this.tg.lockOrientation('landscape-primary');
                    console.log('🔒 Telegram: Ориентация заблокирована (landscape-primary)');
                    return true;
                } catch (error) {
                    console.log('⚠️ Ошибка lockOrientation landscape-primary:', error);
                    try {
                        this.tg.lockOrientation('landscape');
                        console.log('🔒 Telegram: Ориентация заблокирована (landscape)');
                        return true;
                    } catch (error2) {
                        console.log('⚠️ Ошибка lockOrientation landscape:', error2);
                    }
                }
            } else {
                console.log('❌ lockOrientation недоступен');
            }

            // Расширяем приложение на весь экран для лучшего игрового опыта
            if (this.tg.requestFullscreen) {
                try {
                    await this.tg.requestFullscreen();
                    console.log('📺 Telegram: Полноэкранный режим активирован');
                } catch (error) {
                    console.log('⚠️ Ошибка requestFullscreen:', error);
                }
            }

            // Включаем подтверждение закрытия для предотвращения случайного выхода
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

    static setupOrientationControl(): void {
        if (!this.tg || !['ios', 'android'].includes(this.tg.platform)) {
            return;
        }

        // Проверяем и принудительно устанавливаем горизонтальную ориентацию
        const checkAndLockOrientation = () => {
            if (typeof screen !== 'undefined' && screen.orientation) {
                console.log('📱 Текущая ориентация:', screen.orientation.type);
                
                // Если не в горизонтальном режиме, принудительно блокируем
                if (!screen.orientation.type.startsWith('landscape')) {
                    this.lockLandscapeOrientation();
                }
            } else {
                // Fallback: всегда пытаемся заблокировать горизонтальную ориентацию
                this.lockLandscapeOrientation();
            }
        };

        // Устанавливаем слушатели событий
        if (typeof window !== 'undefined') {
            // Слушаем изменения ориентации экрана
            window.addEventListener('orientationchange', checkAndLockOrientation);
            
            // Слушаем события активации/деактивации приложения
            this.tg.onEvent('activated', checkAndLockOrientation);
            this.tg.onEvent('deactivated', () => {
                console.log('📱 Приложение деактивировано');
            });
        }

        // Изначальная проверка
        checkAndLockOrientation();
    }

    static lockLandscapeOrientation(): void {
        if (!this.tg || !this.tg.lockOrientation) {
            console.log('❌ lockOrientation недоступен в lockLandscapeOrientation');
            return;
        }

        try {
            this.tg.lockOrientation('landscape-primary');
            console.log('🔒 Принудительная блокировка (landscape-primary)');
        } catch (error) {
            console.log('⚠️ Ошибка landscape-primary:', error);
            try {
                this.tg.lockOrientation('landscape');
                console.log('🔒 Принудительная блокировка (landscape)');
            } catch (error2) {
                console.log('⚠️ Ошибка landscape:', error2);
            }
        }
    }

    static unlockOrientation(): void {
        if (!this.tg || !this.tg.unlockOrientation) {
            return;
        }

        try {
            this.tg.unlockOrientation();
            console.log('🔓 Ориентация разблокирована');
        } catch (error) {
            console.log('⚠️ Ошибка разблокировки ориентации:', error);
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
