import { Platform } from './Platform';

export class Troll {
    public x: number;
    public y: number;
    public width: number = 35;
    public height: number = 35;
    
    private vx: number = 1;
    private vy: number = 0;
    private speed: number = 1;
    private gravity: number = 0.5;
    private direction: number = 1; // 1 = вправо, -1 = влево
    private animationTime: number = 0;
    private isOnGround: boolean = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public update(platforms: Platform[]): void {
        this.animationTime += 0.1;
        
        // Горизонтальное движение
        this.x += this.vx * this.direction;
        
        // Гравитация
        this.vy += this.gravity;
        this.y += this.vy;
        
        // Проверка коллизий с платформами
        this.handlePlatformCollisions(platforms);
        
        // Изменение направления при достижении края платформы
        this.checkPlatformEdges(platforms);
    }

    private handlePlatformCollisions(platforms: Platform[]): void {
        this.isOnGround = false;
        
        for (const platform of platforms) {
            if (this.checkCollision(platform)) {
                // Коллизия снизу (падение на платформу)
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
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
                    this.direction = -1;
                }
                // Коллизия справа
                else if (this.vx < 0 && this.x > platform.x + platform.width) {
                    this.x = platform.x + platform.width;
                    this.direction = 1;
                }
            }
        }
    }

    private checkPlatformEdges(platforms: Platform[]): void {
        const checkX = this.direction > 0 ? this.x + this.width + 10 : this.x - 10;
        const checkY = this.y + this.height + 5;
        
        let hasGround = false;
        for (const platform of platforms) {
            if (checkX >= platform.x && checkX <= platform.x + platform.width &&
                checkY >= platform.y && checkY <= platform.y + platform.height) {
                hasGround = true;
                break;
            }
        }
        
        if (!hasGround) {
            this.direction *= -1;
        }
    }

    private checkCollision(platform: Platform): boolean {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Рендер тролля
        this.drawTroll(ctx);
        
        ctx.restore();
    }

    private drawTroll(ctx: CanvasRenderingContext2D): void {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Тело (красный)
        ctx.fillStyle = '#F44336';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Глаза (злые)
        ctx.fillStyle = '#000';
        const eyeY = centerY - 5;
        const eyeOffset = this.direction > 0 ? 8 : -8;
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(centerX + eyeOffset, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Зрачки (красные)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, eyeY, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + eyeOffset, eyeY, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Рот (злой)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 6, centerY + 5);
        ctx.lineTo(centerX + 6, centerY + 5);
        ctx.stroke();
        
        // Зубы
        ctx.fillStyle = '#FFF';
        ctx.fillRect(centerX - 4, centerY + 3, 2, 4);
        ctx.fillRect(centerX + 2, centerY + 3, 2, 4);
        
        // Рога
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(centerX - 8, this.y);
        ctx.lineTo(centerX - 12, this.y - 8);
        ctx.lineTo(centerX - 4, this.y);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 8, this.y);
        ctx.lineTo(centerX + 12, this.y - 8);
        ctx.lineTo(centerX + 4, this.y);
        ctx.fill();
        
        // Ноги (анимация ходьбы)
        const legOffset = Math.sin(this.animationTime * 2) * 2;
        ctx.fillStyle = '#D32F2F';
        ctx.fillRect(this.x + 5, this.y + this.height, 8, 10 + legOffset);
        ctx.fillRect(this.x + this.width - 13, this.y + this.height, 8, 10 - legOffset);
        
        // Руки
        ctx.fillStyle = '#D32F2F';
        ctx.fillRect(this.x - 3, this.y + 10, 6, 15);
        ctx.fillRect(this.x + this.width - 3, this.y + 10, 6, 15);
    }
} 