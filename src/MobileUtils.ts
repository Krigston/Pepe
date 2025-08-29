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
    
    static lockToLandscape(): void {
        console.log('🔒 Попытка блокировки горизонтальной ориентации...');
        
        // Показываем оверлей с просьбой повернуть экран в портретном режиме
        this.showRotationOverlay();
        
        // Попытка заблокировать ориентацию (может не работать без пользовательского жеста)
        if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock('landscape').catch(() => {
                console.log('ℹ️ Блокировка ориентации недоступна без пользовательского жеста');
            });
        }
    }
    
    static showRotationOverlay(): void {
        // Показываем оверлей только в портретном режиме на мобильных
        const updateOverlay = () => {
            const existingOverlay = document.getElementById('rotation-overlay');
            
            if (!this.isLandscape() && this.isMobileDevice()) {
                if (!existingOverlay) {
                    const overlay = document.createElement('div');
                    overlay.id = 'rotation-overlay';
                    overlay.className = 'rotation-overlay';
                    overlay.innerHTML = `
                        <div class="rotation-icon">📱</div>
                        <h2>Поверните устройство</h2>
                        <p>Для лучшего игрового опыта поверните устройство в горизонтальное положение</p>
                    `;
                    document.body.appendChild(overlay);
                }
            } else {
                if (existingOverlay) {
                    existingOverlay.remove();
                }
            }
        };
        
        // Проверяем сразу
        updateOverlay();
        
        // Добавляем слушателей событий
        window.addEventListener('orientationchange', () => {
            setTimeout(updateOverlay, 100);
        });
        
        window.addEventListener('resize', updateOverlay);
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
