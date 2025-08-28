export class InputManager {
    private keys: { [key: string]: boolean } = {};
    private previousKeys: { [key: string]: boolean } = {};

    constructor() {
        this.setupEventListeners();
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
        return this.keys[keyCode] || false;
    }

    public isKeyJustPressed(keyCode: string): boolean {
        return this.keys[keyCode] && !this.previousKeys[keyCode];
    }

    // Добавляем альтернативный метод для прыжка
    public isJumpPressed(): boolean {
        // Проверяем, была ли клавиша нажата в этом кадре
        const spacePressed = this.keys['Space'] && !this.previousKeys['Space'];
        const upPressed = this.keys['ArrowUp'] && !this.previousKeys['ArrowUp'];
        const wPressed = this.keys['KeyW'] && !this.previousKeys['KeyW'];
        
        const result = spacePressed || upPressed || wPressed;
        if (result) {
            console.log('Прыжок нажат!');
        }
        return result;
    }

    public update(): void {
        this.previousKeys = { ...this.keys };
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
        const interactPressed = this.isKeyJustPressed('KeyE');
        if (interactPressed) {
            console.log('Взаимодействие нажато!');
        }
        return interactPressed;
    }

    // Добавляем метод для отладки
    public getPressedKeys(): string[] {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }
} 