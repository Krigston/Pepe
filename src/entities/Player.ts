import { InputManager } from '../InputManager';
import { Platform } from './Platform';

export class Player {
    public x: number;
    public y: number;
    public width: number = 40;
    public height: number = 40;
    
    private vx: number = 0;
    private vy: number = 0;
    private speed: number = 5;
    private jumpPower: number = 15;
    private gravity: number = 0.8;
    private friction: number = 0.8;
    
    private isOnGround: boolean = false;
    private facingRight: boolean = true;
    private animationFrame: number = 0;
    private animationSpeed: number = 0.2;
    private groundTimer: number = 0; // Таймер для стабилизации isOnGround

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public update(inputManager: InputManager, platforms: Platform[]): void {
        // Горизонтальное движение
        const horizontalInput = inputManager.getHorizontalInput();
        this.vx += horizontalInput * this.speed * 0.5;
        this.vx *= this.friction;
        
        // Ограничение скорости
        this.vx = Math.max(-this.speed, Math.min(this.speed, this.vx));
        
        // Обновление направления
        if (horizontalInput > 0) this.facingRight = true;
        if (horizontalInput < 0) this.facingRight = false;

        // Прыжок
        if (inputManager.isJumpPressed()) {
            console.log('Попытка прыжка, на земле:', this.isOnGround);
            if (this.isOnGround) {
                this.vy = -this.jumpPower;
                this.isOnGround = false;
                console.log('Пепе прыгнул!');
            } else {
                console.log('Пепе не может прыгнуть - не на земле');
            }
        }

        // Гравитация
        this.vy += this.gravity;

        // Обновление позиции
        this.x += this.vx;
        this.y += this.vy;

        // Коллизии с платформами
        this.handlePlatformCollisions(platforms);

        // Стабилизация isOnGround
        if (this.isOnGround) {
            this.groundTimer++;
            if (this.groundTimer > 5) { // Стабилизируем на 5 кадров
                this.groundTimer = 5;
            }
        } else {
            this.groundTimer = 0;
        }

        // Анимация
        if (Math.abs(this.vx) > 0.1) {
            this.animationFrame += this.animationSpeed;
        }
    }

    private handlePlatformCollisions(platforms: Platform[]): void {
        let wasOnGround = this.isOnGround;
        this.isOnGround = false;
        
        for (const platform of platforms) {
            if (this.checkCollision(platform)) {
                // Коллизия снизу (падение на платформу)
                if (this.vy >= 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    if (!wasOnGround) {
                        console.log('Пепе приземлился!');
                        this.groundTimer = 0;
                    }
                    this.isOnGround = true;
                }
                // Коллизия сверху (удар головой)
                else if (this.vy < 0 && this.y > platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Коллизия слева
                else if (this.vx > 0 && this.x < platform.x) {
                    this.x = platform.x - this.width;
                    this.vx = 0;
                }
                // Коллизия справа
                else if (this.vx < 0 && this.x > platform.x + platform.width) {
                    this.x = platform.x + platform.width;
                    this.vx = 0;
                }
            }
        }
    }

    private checkCollision(platform: Platform): boolean {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    public render(ctx: CanvasRenderingContext2D, isInvulnerable: boolean = false): void {
        ctx.save();
        
        // Эффект мигания при неуязвимости
        if (isInvulnerable) {
            const alpha = Math.sin(Date.now() * 0.02) * 0.3 + 0.7; // Мигание от 0.4 до 1.0
            ctx.globalAlpha = alpha;
        }
        
        // Рендер Пепе
        this.drawPepe(ctx);
        
        // Отладочная информация - рисуем хитбокс игрока
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }

    private drawPepe(ctx: CanvasRenderingContext2D): void {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Тело (зеленый)
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Глаза
        ctx.fillStyle = '#000';
        const eyeY = centerY - 5;
        const eyeOffset = this.facingRight ? 8 : -8;
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(centerX + eyeOffset, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Зрачки
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, eyeY, 1, 0, Math.PI * 2);
        ctx.arc(centerX + eyeOffset, eyeY, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Рот
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 5, 8, 0, Math.PI);
        ctx.stroke();
        
        // Ноги (анимация ходьбы)
        if (Math.abs(this.vx) > 0.1) {
            const legOffset = Math.sin(this.animationFrame) * 3;
            ctx.fillStyle = '#388E3C';
            ctx.fillRect(this.x + 5, this.y + this.height, 8, 10 + legOffset);
            ctx.fillRect(this.x + this.width - 13, this.y + this.height, 8, 10 - legOffset);
        } else {
            ctx.fillStyle = '#388E3C';
            ctx.fillRect(this.x + 5, this.y + this.height, 8, 10);
            ctx.fillRect(this.x + this.width - 13, this.y + this.height, 8, 10);
        }
        
        // Руки
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(this.x - 3, this.y + 10, 6, 15);
        ctx.fillRect(this.x + this.width - 3, this.y + 10, 6, 15);
    }
} 