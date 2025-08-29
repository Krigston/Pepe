import { MobileControls } from './MobileControls';
import { MobileUtils } from './MobileUtils';

export class InputManager {
    private keys: { [key: string]: boolean } = {};
    private previousKeys: { [key: string]: boolean } = {};
    private mobileControls: MobileControls | null = null;

    constructor() {
        this.setupEventListeners();
        
        // Инициализируем мобильные элементы управления только на мобильных устройствах
        if (MobileUtils.isMobileDevice()) {
            this.mobileControls = new MobileControls();
        }
    }

    private setupEventListeners(): void {
        // Добавляем обработчики на window для гарантии
        window.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });

        // Предотвращаем стандартное поведение браузера для игровых клавиш
        window.addEventListener('keydown', (event) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE'].includes(event.code)) {
                event.preventDefault();
            }
        });

        // Добавляем обработчики на canvas
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.addEventListener('keydown', (event) => {
                this.keys[event.code] = true;
            });

            canvas.addEventListener('keyup', (event) => {
                this.keys[event.code] = false;
            });

            // Делаем canvas фокусируемым
            canvas.tabIndex = 0;
            canvas.focus();
            
            // Фокусируемся при клике
            canvas.addEventListener('click', () => {
                canvas.focus();
            });
        }
    }

    public isKeyPressed(keyCode: string): boolean {
        const keyboardPressed = this.keys[keyCode] || false;
        const mobilePressed = this.mobileControls ? this.mobileControls.isKeyPressed(keyCode) : false;
        return keyboardPressed || mobilePressed;
    }

    public isKeyJustPressed(keyCode: string): boolean {
        const keyboardJustPressed = this.keys[keyCode] && !this.previousKeys[keyCode];
        const mobileJustPressed = this.mobileControls ? this.mobileControls.isKeyJustPressed(keyCode) : false;
        return keyboardJustPressed || mobileJustPressed;
    }

    // Добавляем альтернативный метод для прыжка
    public isJumpPressed(): boolean {
        // Проверяем, была ли клавиша нажата в этом кадре
        const spacePressed = this.keys['Space'] && !this.previousKeys['Space'];
        const upPressed = this.keys['ArrowUp'] && !this.previousKeys['ArrowUp'];
        const wPressed = this.keys['KeyW'] && !this.previousKeys['KeyW'];
        
        // Проверяем мобильные элементы управления
        const mobileJumpPressed = this.mobileControls ? this.mobileControls.isJumpPressed() : false;
        
        const result = spacePressed || upPressed || wPressed || mobileJumpPressed;
        if (result) {
            console.log('Прыжок нажат!');
        }
        return result;
    }

    public update(): void {
        this.previousKeys = { ...this.keys };
        
        // Обновляем мобильные элементы управления
        if (this.mobileControls) {
            this.mobileControls.update();
        }
    }

    // Удобные методы для игрового ввода
    public getHorizontalInput(): number {
        let input = 0;
        if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA')) input -= 1;
        if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD')) input += 1;
        return input;
    }

    public getVerticalInput(): number {
        let input = 0;
        if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW')) input -= 1;
        if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS')) input += 1;
        return input;
    }



    public isInteractPressed(): boolean {
        const keyboardInteract = this.isKeyJustPressed('KeyE');
        const mobileInteract = this.mobileControls ? this.mobileControls.isInteractPressed() : false;
        const interactPressed = keyboardInteract || mobileInteract;
        
        if (interactPressed) {
            console.log('Взаимодействие нажато!');
        }
        return interactPressed;
    }

    // Добавляем метод для отладки
    public getPressedKeys(): string[] {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }
    
    // Методы для работы с мобильными элементами управления
    public showMobileControls(): void {
        if (this.mobileControls) {
            this.mobileControls.show();
        }
    }
    
    public hideMobileControls(): void {
        if (this.mobileControls) {
            this.mobileControls.hide();
        }
    }
    
    public isMobile(): boolean {
        return this.mobileControls !== null;
    }
    
    public destroy(): void {
        if (this.mobileControls) {
            this.mobileControls.destroy();
            this.mobileControls = null;
        }
    }
} 