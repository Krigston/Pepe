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
        
        try {
            // Современный API для блокировки ориентации
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
                console.log('✅ Ориентация успешно заблокирована в landscape!');
                return true;
            }
            
            // Fallback для старых браузеров
            if ((screen as any).lockOrientation) {
                const result = (screen as any).lockOrientation(['landscape-primary', 'landscape-secondary']);
                console.log('📱 Старый API lockOrientation:', result);
                return result;
            }
            
            if ((screen as any).mozLockOrientation) {
                const result = (screen as any).mozLockOrientation(['landscape-primary', 'landscape-secondary']);
                console.log('🦎 Mozilla lockOrientation:', result);
                return result;
            }
            
            if ((screen as any).msLockOrientation) {
                const result = (screen as any).msLockOrientation(['landscape-primary', 'landscape-secondary']);
                console.log('🔷 MS lockOrientation:', result);
                return result;
            }
            
            console.log('❌ Блокировка ориентации не поддерживается этим браузером');
            return false;
            
        } catch (error) {
            console.log('⚠️ Ошибка при блокировке ориентации:', error);
            return false;
        }
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
