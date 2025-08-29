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
}
