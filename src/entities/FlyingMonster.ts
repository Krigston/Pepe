export class FlyingMonster {
    public x: number;
    public y: number;
    public width: number = 30;
    public height: number = 25;
    
    private baseY: number; // Базовая высота полета
    private amplitude: number = 40; // Амплитуда колебаний по вертикали
    private speed: number = 0.8; // Скорость горизонтального движения
    private direction: number = 1; // 1 = вправо, -1 = влево
    private animationTime: number = 0;
    private patrolDistance: number = 200; // Дистанция патрулирования
    private startX: number; // Начальная позиция для патрулирования

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.startX = x;
    }

    public update(): void {
        this.animationTime += 0.05;
        
        // Горизонтальное движение (патрулирование)
        this.x += this.speed * this.direction;
        
        // Проверяем границы патрулирования
        if (this.x > this.startX + this.patrolDistance) {
            this.direction = -1;
            this.x = this.startX + this.patrolDistance;
        } else if (this.x < this.startX - this.patrolDistance) {
            this.direction = 1;
            this.x = this.startX - this.patrolDistance;
        }
        
        // Вертикальное движение (плавное колебание)
        this.y = this.baseY + Math.sin(this.animationTime * 2) * this.amplitude;
    }

    public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
        const screenX = this.x - cameraX;
        
        // Не рисуем если за пределами экрана
        if (screenX < -50 || screenX > 850) return;
        
        ctx.save();
        
        // Основное тело монстра (летучая мышь/птица)
        ctx.fillStyle = '#4A0E4E'; // Темно-фиолетовый
        ctx.fillRect(screenX, this.y, this.width, this.height);
        
        // Крылья (анимированные)
        const wingFlap = Math.sin(this.animationTime * 8) * 0.3 + 0.7; // Частота взмахов
        ctx.fillStyle = '#6A1B9A'; // Светло-фиолетовый для крыльев
        
        // Левое крыло
        ctx.fillRect(screenX - 8, this.y + 5, 8, 15 * wingFlap);
        // Правое крыло
        ctx.fillRect(screenX + this.width, this.y + 5, 8, 15 * wingFlap);
        
        // Глаза
        ctx.fillStyle = '#FF4444'; // Красные глаза
        ctx.fillRect(screenX + 8, this.y + 5, 4, 4);
        ctx.fillRect(screenX + 18, this.y + 5, 4, 4);
        
        // Направление полета (маленькая стрелка)
        ctx.fillStyle = '#FFFFFF';
        if (this.direction > 0) {
            // Стрелка вправо
            ctx.fillRect(screenX + this.width - 3, this.y + this.height/2, 3, 2);
        } else {
            // Стрелка влево
            ctx.fillRect(screenX, this.y + this.height/2, 3, 2);
        }
        
        ctx.restore();
    }

    // Проверка коллизии с игроком
    public checkCollision(player: any): boolean {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
}
