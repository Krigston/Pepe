export class Finish {
    public x: number;
    public y: number;
    public width: number = 50;
    public height: number = 80;
    
    private animationTime: number = 0;
    private glowIntensity: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public update(): void {
        this.animationTime += 0.05;
        this.glowIntensity = Math.sin(this.animationTime) * 0.5 + 0.5;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Рендер финишной точки
        this.drawFinish(ctx);
        
        ctx.restore();
    }

    private drawFinish(ctx: CanvasRenderingContext2D): void {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Внешнее свечение
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${this.glowIntensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 20, this.y - 20, this.width + 40, this.height + 40);
        
        // Основной столб
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Обводка
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Полоски
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const y = this.y + i * 15 + 5;
            ctx.beginPath();
            ctx.moveTo(this.x, y);
            ctx.lineTo(this.x + this.width, y);
            ctx.stroke();
        }
        
        // Флаг
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x + this.width, this.y + 10, 30, 20);
        
        // Древко флага
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + 10);
        ctx.lineTo(this.x + this.width, this.y + 40);
        ctx.stroke();
        
        // Звезда на флаге
        ctx.fillStyle = '#FFD700';
        this.drawStar(ctx, this.x + this.width + 15, this.y + 20, 5);
        
        // Текст "FINISH"
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FINISH', centerX, this.y + this.height + 15);
    }

    private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
} 