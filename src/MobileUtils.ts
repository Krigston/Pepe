export class MobileUtils {
    static isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 2);
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
    
    static lockToLandscape(): void {
        // Попытка заблокировать ориентацию на landscape
        if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock('landscape').catch((err: any) => {
                console.log('Не удалось заблокировать ориентацию:', err);
            });
        }
        
        // Альтернативные методы для старых браузеров
        const orientationLock = (screen as any).lockOrientation || 
                              (screen as any).mozLockOrientation || 
                              (screen as any).msLockOrientation;
        
        if (orientationLock) {
            orientationLock('landscape');
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
