export class MobileUtils {
    static isMobileDevice(): boolean {
        // Простая и надежная проверка мобильных устройств
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasTouchPoints = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 2;
        const result = isMobileUA || hasTouchPoints;
        
        console.log('📱 Проверка мобильного устройства:', {
            userAgent: navigator.userAgent,
            isMobileUA: isMobileUA,
            maxTouchPoints: navigator.maxTouchPoints,
            hasTouchPoints: hasTouchPoints,
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
        console.log('🔒 Принудительная блокировка горизонтальной ориентации...');
        
        // Попытка заблокировать ориентацию на landscape - все возможные варианты
        if (screen.orientation && (screen.orientation as any).lock) {
            // Пробуем все варианты landscape
            const landscapeVariants = ['landscape', 'landscape-primary', 'landscape-secondary'];
            landscapeVariants.forEach(variant => {
                (screen.orientation as any).lock(variant).then(() => {
                    console.log(`✅ Ориентация заблокирована на: ${variant}`);
                }).catch((err: any) => {
                    console.log(`❌ Не удалось заблокировать на ${variant}:`, err);
                });
            });
        }
        
        // Альтернативные методы для старых браузеров
        const orientationLock = (screen as any).lockOrientation || 
                              (screen as any).mozLockOrientation || 
                              (screen as any).msLockOrientation ||
                              (screen as any).webkitLockOrientation;
        
        if (orientationLock) {
            const landscapeVariants = ['landscape', 'landscape-primary', 'landscape-secondary'];
            landscapeVariants.forEach(variant => {
                try {
                    orientationLock(variant);
                    console.log(`✅ Fallback ориентация установлена: ${variant}`);
                } catch (err) {
                    console.log(`❌ Fallback метод неудачен для ${variant}:`, err);
                }
            });
        }
        
        // Дополнительная проверка через CSS
        this.forceLandscapeCSS();
    }
    
    static forceLandscapeCSS(): void {
        // Добавляем CSS правила для принуждения к горизонтальной ориентации
        const style = document.createElement('style');
        style.textContent = `
            @media screen and (orientation: portrait) {
                html {
                    transform: rotate(90deg);
                    transform-origin: center center;
                    width: 100vh;
                    height: 100vw;
                    position: fixed;
                    top: 0;
                    left: 0;
                    overflow: hidden;
                }
                body {
                    width: 100vh;
                    height: 100vw;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('📱 CSS принуждение к горизонтальной ориентации добавлено');
    }
    
    static continuousLandscapeLock(): void {
        // Непрерывная проверка и блокировка ориентации
        const checkAndLock = () => {
            if (this.isMobileDevice() && !this.isLandscape()) {
                console.log('⚠️ Обнаружена вертикальная ориентация, принуждаем к горизонтальной...');
                this.lockToLandscape();
            }
        };
        
        // Проверяем каждые 500ms
        setInterval(checkAndLock, 500);
        
        // Также реагируем на события
        window.addEventListener('orientationchange', () => {
            setTimeout(checkAndLock, 100);
        });
        
        window.addEventListener('resize', () => {
            setTimeout(checkAndLock, 100);
        });
        
        console.log('🔄 Запущен непрерывный мониторинг ориентации');
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
