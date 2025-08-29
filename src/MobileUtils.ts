export class MobileUtils {
    static isMobileDevice(): boolean {
        // Простая и надежная проверка мобильных устройств
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasTouchPoints = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0;
        const hasTouch = 'ontouchstart' in window;
        const smallScreen = window.innerWidth <= 1024 || window.innerHeight <= 768;
        const result = isMobileUA || hasTouchPoints || hasTouch || smallScreen;
        
        console.log('📱 Проверка мобильного устройства:', {
            userAgent: navigator.userAgent,
            isMobileUA: isMobileUA,
            maxTouchPoints: navigator.maxTouchPoints,
            hasTouchPoints: hasTouchPoints,
            hasTouch: hasTouch,
            smallScreen: smallScreen,
            screenSize: { width: window.innerWidth, height: window.innerHeight },
            result: result
        });
        
        return result;
    }
    
    static isLandscape(): boolean {
        return window.innerWidth > window.innerHeight;
    }
    
    static getScreenSize(): { width: number; height: number } {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    
    static isTablet(): boolean {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
    }
    
    static canUseTouch(): boolean {
        return 'ontouchstart' in window || (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0);
    }
    
    static async lockToLandscape(): Promise<boolean> {
        console.log('🔒 Попытка заблокировать ориентацию в landscape...');
        
        // Проверка поддержки API
        if ((screen as any).orientation && (screen as any).orientation.lock) {
            try {
                await (screen as any).orientation.lock('landscape');
                console.log('✅ Ориентация успешно заблокирована в landscape!');
                return true;
            } catch (error) {
                console.log('⚠️ Не удалось заблокировать ориентацию:', error);
                return false;
            }
        }
        
        console.log('❌ Screen Orientation API не поддерживается');
        return false;
    }
    
    static setupOrientationLock(): void {
        // Блокировка поворота экрана в горизонтальном режиме
        window.addEventListener('orientationchange', () => {
            // Проверяем, если устройство в портретном режиме (0 или 180 градусов)
            if ((window as any).orientation === 0 || (window as any).orientation === 180) {
                console.log('📱 Обнаружен портретный режим, попытка блокировки landscape...');
                
                // Попытка автоматически повернуть в landscape
                if ((screen as any).orientation && (screen as any).orientation.lock) {
                    (screen as any).orientation.lock('landscape').catch((error: any) => {
                        console.log('⚠️ Не удалось заблокировать в landscape:', error);
                    });
                }
            } else {
                console.log('✅ Устройство в горизонтальном режиме');
            }
        }, false);
        
        // Попытка заблокировать сразу при инициализации
        setTimeout(() => {
            if ((screen as any).orientation && (screen as any).orientation.lock) {
                (screen as any).orientation.lock('landscape').catch((error: any) => {
                    console.log('ℹ️ Начальная блокировка landscape неуспешна:', error);
                });
            }
        }, 1000);
        
        console.log('🔄 Настроена автоматическая блокировка горизонтальной ориентации');
    }
    

    
    static enterFullscreen(): Promise<void> {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            return element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
            return (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
            return (element as any).msRequestFullscreen();
        }
        
        return Promise.resolve();
    }
}
