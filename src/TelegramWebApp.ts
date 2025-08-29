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
                this.setupOrientationControl();
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
            
            // 1. Используем стандартный Web API для блокировки ориентации
            await this.lockScreenOrientation();

            // 2. Telegram Web App API 2.0 - полноэкранный режим
            if (this.tg.requestFullscreen) {
                try {
                    await this.tg.requestFullscreen();
                    console.log('📺 Telegram: Полноэкранный режим активирован (API 2.0)');
                } catch (error) {
                    console.log('⚠️ Ошибка requestFullscreen:', error);
                }
            }

            // 3. Расширяем приложение на весь экран
            if (this.tg.expand) {
                this.tg.expand();
                console.log('📺 Telegram: expand() выполнен');
            }

            // 4. Telegram lockOrientation (fallback)
            if (this.tg.lockOrientation && ['ios', 'android'].includes(this.tg.platform)) {
                try {
                    this.tg.lockOrientation('landscape');
                    console.log('🔒 Telegram: lockOrientation(landscape)');
                } catch (error) {
                    console.log('⚠️ Ошибка Telegram lockOrientation:', error);
                }
            }

            // 5. Настройки для игрового режима
            if (this.tg.setViewportHeight) {
                this.tg.setViewportHeight(false);
                console.log('📱 Telegram: setViewportHeight(false)');
            }

            if (this.tg.enableClosingConfirmation) {
                this.tg.enableClosingConfirmation();
                console.log('✅ Telegram: Включено подтверждение закрытия');
            }

            if (this.tg.setBackgroundColor) {
                this.tg.setBackgroundColor('#667eea');
                console.log('🎨 Telegram: Установлен цвет фона');
            }

            return true;
        } catch (error) {
            console.log('❌ Общая ошибка Telegram WebApp:', error);
            return false;
        }
    }

    // Стандартный Web API для блокировки ориентации
    static async lockScreenOrientation(): Promise<boolean> {
        try {
            // Современный стандартный API
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
                console.log('🔒 Стандартный API: screen.orientation.lock(landscape)');
                return true;
            }

            // Fallback для старых браузеров
            const screen_any = screen as any;
            if (screen_any.lockOrientation) {
                const result = screen_any.lockOrientation('landscape');
                console.log('🔒 Legacy API: screen.lockOrientation(landscape)');
                return result;
            }

            if (screen_any.mozLockOrientation) {
                const result = screen_any.mozLockOrientation('landscape');
                console.log('🔒 Mozilla API: screen.mozLockOrientation(landscape)');
                return result;
            }

            if (screen_any.msLockOrientation) {
                const result = screen_any.msLockOrientation('landscape');
                console.log('🔒 Microsoft API: screen.msLockOrientation(landscape)');
                return result;
            }

            console.log('❌ Screen Orientation API недоступен');
            return false;
        } catch (error) {
            console.log('⚠️ Ошибка блокировки ориентации через Web API:', error);
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
