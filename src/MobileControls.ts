import { MobileUtils } from './MobileUtils';

export interface TouchButton {
    id: string;
    element: HTMLElement;
    x: number;
    y: number;
    width: number;
    height: number;
    isPressed: boolean;
    action: string;
}

export class MobileControls {
    private container: HTMLElement;
    private buttons: Map<string, TouchButton> = new Map();
    
    // Состояние виртуальных кнопок
    private virtualKeys: { [key: string]: boolean } = {};
    
    constructor() {
        this.container = this.createControlsContainer();
        this.setupButtons();
        this.setupEventListeners();
        
        // Показываем элементы управления только на мобильных устройствах
        if (MobileUtils.isMobileDevice()) {
            this.show();
        }
    }
    
    private createControlsContainer(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'mobileControls';
        container.className = 'mobile-controls';
        document.body.appendChild(container);
        return container;
    }
    
    private setupButtons(): void {
        // Левый джойстик (движение)
        this.createDirectionalPad();
        
        // Правые кнопки (прыжок и взаимодействие)
        this.createActionButtons();
    }
    
    private createDirectionalPad(): void {
        // Контейнер для directional pad
        const dpadContainer = document.createElement('div');
        dpadContainer.className = 'dpad-container';
        
        // Создаем кнопки направлений
        const directions = [
            { id: 'left', class: 'dpad-left', action: 'ArrowLeft', text: '←' },
            { id: 'right', class: 'dpad-right', action: 'ArrowRight', text: '→' },
            { id: 'up', class: 'dpad-up', action: 'ArrowUp', text: '↑' }
        ];
        
        directions.forEach(dir => {
            const button = this.createButton(dir.id, dir.class, dir.text, dir.action);
            dpadContainer.appendChild(button.element);
            this.buttons.set(dir.id, button);
        });
        
        this.container.appendChild(dpadContainer);
    }
    
    private createActionButtons(): void {
        // Контейнер для кнопок действий
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'actions-container';
        
        // Кнопки действий
        const actions = [
            { id: 'jump', class: 'action-jump', action: 'Space', text: '🦘' },
            { id: 'interact', class: 'action-interact', action: 'KeyE', text: 'E' }
        ];
        
        actions.forEach(action => {
            const button = this.createButton(action.id, action.class, action.text, action.action);
            actionsContainer.appendChild(button.element);
            this.buttons.set(action.id, button);
        });
        
        this.container.appendChild(actionsContainer);
    }
    
    private createButton(id: string, className: string, text: string, action: string): TouchButton {
        const element = document.createElement('div');
        element.id = `mobile-${id}`;
        element.className = `mobile-button ${className}`;
        element.textContent = text;
        element.style.userSelect = 'none';
        element.style.webkitUserSelect = 'none';
        
        const button: TouchButton = {
            id,
            element,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            isPressed: false,
            action
        };
        
        return button;
    }
    
    private setupEventListeners(): void {
        this.buttons.forEach((button) => {
            // Touch events
            button.element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleButtonPress(button, true);
            }, { passive: false });
            
            button.element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleButtonPress(button, false);
            }, { passive: false });
            
            button.element.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.handleButtonPress(button, false);
            }, { passive: false });
            
            // Mouse events для тестирования на десктопе
            button.element.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.handleButtonPress(button, true);
            });
            
            button.element.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.handleButtonPress(button, false);
            });
            
            button.element.addEventListener('mouseleave', (e) => {
                e.preventDefault();
                this.handleButtonPress(button, false);
            });
        });
        
        // Предотвращаем контекстное меню на touch элементах
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.updateLayout();
        });
    }
    
    private handleButtonPress(button: TouchButton, isPressed: boolean): void {
        button.isPressed = isPressed;
        this.virtualKeys[button.action] = isPressed;
        
        // Визуальная обратная связь
        if (isPressed) {
            button.element.classList.add('pressed');
        } else {
            button.element.classList.remove('pressed');
        }
        
        console.log(`Mobile button ${button.id} ${isPressed ? 'pressed' : 'released'}: ${button.action}`);
    }
    
    private updateLayout(): void {
        // Обновляем позиции кнопок при изменении размера экрана
        this.updateButtonPositions();
    }
    
    private updateButtonPositions(): void {
        this.buttons.forEach((button) => {
            const rect = button.element.getBoundingClientRect();
            button.x = rect.left;
            button.y = rect.top;
            button.width = rect.width;
            button.height = rect.height;
        });
    }
    
    public show(): void {
        if (!MobileUtils.isMobileDevice()) return;
        
        this.container.style.display = 'block';
        this.updateLayout();
    }
    
    public hide(): void {
        this.container.style.display = 'none';
    }
    
    public isKeyPressed(keyCode: string): boolean {
        return this.virtualKeys[keyCode] || false;
    }
    
    public isKeyJustPressed(keyCode: string): boolean {
        // Для простоты, в мобильной версии считаем нажатие как "just pressed"
        // В будущем можно добавить более сложную логику
        return this.virtualKeys[keyCode] || false;
    }
    
    public getHorizontalInput(): number {
        let input = 0;
        if (this.isKeyPressed('ArrowLeft')) input -= 1;
        if (this.isKeyPressed('ArrowRight')) input += 1;
        return input;
    }
    
    public isJumpPressed(): boolean {
        return this.isKeyPressed('Space');
    }
    
    public isInteractPressed(): boolean {
        return this.isKeyPressed('KeyE');
    }
    
    public update(): void {
        // Очищаем состояние кнопок, если они не нажаты
        // Можно добавить дополнительную логику обновления
    }
    
    public getVirtualKeys(): { [key: string]: boolean } {
        return { ...this.virtualKeys };
    }
    
    public destroy(): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.buttons.clear();
        this.virtualKeys = {};
    }
}
