export class Meme {
    public x: number;
    public y: number;
    public width: number = 30;
    public height: number = 30;
    
    private animationTime: number = 0;
    private rotation: number = 0;
    private bobOffset: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public update(): void {
        this.animationTime += 0.1;
        this.rotation += 0.05;
        this.bobOffset = Math.sin(this.animationTime) * 3;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Перемещаем в центр мема для вращения
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + this.bobOffset);
        ctx.rotate(this.rotation);
        
        // Рисуем мем (стилизованный как смайлик)
        this.drawMeme(ctx);
        
        ctx.restore();
    }

    private drawMeme(ctx: CanvasRenderingContext2D): void {
        const centerX = 0;
        const centerY = 0;
        const size = 15;
        
        // Основной круг
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Глаза
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 5, centerY - 3, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 5, centerY - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Рот
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 2, 4, 0, Math.PI);
        ctx.stroke();
        
        // Блики
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(centerX - 3, centerY - 5, 1, 0, Math.PI * 2);
        ctx.arc(centerX + 3, centerY - 5, 1, 0, Math.PI * 2);
        ctx.fill();
    }
} 