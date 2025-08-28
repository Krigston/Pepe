import { Player } from './entities/Player';
import { Platform } from './entities/Platform';
import { Meme } from './entities/Meme';
import { Troll } from './entities/Troll';
import { Finish } from './entities/Finish';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { ParticleSystem } from './ParticleSystem';
import { LevelGenerator } from './LevelGenerator';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private inputManager: InputManager;
    private audioManager: AudioManager;
    private particleSystem: ParticleSystem;
    private levelGenerator: LevelGenerator;
    
    private player: Player;
    private platforms: Platform[] = [];
    private memes: Meme[] = [];
    private trolls: Troll[] = [];
    private finish!: Finish;
    
    private score: number = 0;
    private lives: number = 3;
    private level: number = 1;
    private gameState: 'menu' | 'playing' | 'gameOver' | 'victory' = 'menu';
    
    private cameraX: number = 0;
    private cameraY: number = 0;
    
    private levelWidth: number = 2400;
    private levelHeight: number = 800;

    constructor(inputManager: InputManager, audioManager: AudioManager) {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.inputManager = inputManager;
        this.audioManager = audioManager;
        this.particleSystem = new ParticleSystem();
        this.levelGenerator = new LevelGenerator();
        
        this.player = new Player(100, 500);
        
        this.generateRandomLevel(); // Включили обратно рандомную генерацию с улучшенными параметрами
    }

    public start(): void {
        this.gameState = 'playing';
        this.audioManager.playBackgroundMusic();
        
        // Фокусируемся на canvas для получения ввода
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.focus();
            console.log('Canvas получил фокус!');
        }
    }

    public generateRandomLevel(): void {
        const generatedLevel = this.levelGenerator.generateLevel(8); // 8 сегментов
        
        this.platforms = generatedLevel.platforms;
        this.memes = generatedLevel.memes;
        this.trolls = generatedLevel.trolls;
        this.finish = generatedLevel.finish;
        this.levelWidth = generatedLevel.width;
        
        // Сбрасываем позицию игрока
        this.player.x = 100;
        this.player.y = 500;
        this.cameraX = 0;
        
        // Сбрасываем игровые параметры
        this.score = 0;
        this.lives = 3;
        this.gameState = 'playing';
        
        this.updateUI();
    }





    public update(): void {
        if (this.gameState !== 'playing') return;

        this.player.update(this.inputManager, this.platforms);
        this.updateCamera();
        
        // Обновляем InputManager в конце кадра, чтобы previousKeys отражал состояние до текущих нажатий
        this.inputManager.update();
        
        // Обновление мемов
        this.memes.forEach((meme) => {
            meme.update();
        });
        
        // Проверка коллизий с мемами
        this.memes = this.memes.filter((meme) => {
            if (this.checkCollision(this.player, meme)) {
                this.score += 100;
                this.audioManager.playSound('collect');
                this.particleSystem.createParticles(meme.x, meme.y, '#FFD700');
                this.updateUI();
                return false; // удаляем мем
            }
            return true; // оставляем мем
        });

        // Обновление троллей
        this.trolls.forEach((troll) => {
            troll.update(this.platforms);
            if (this.checkCollision(this.player, troll)) {
                this.lives--;
                this.audioManager.playSound('hit');
                this.particleSystem.createParticles(this.player.x, this.player.y, '#FF0000');
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.player.x = 100;
                    this.player.y = 500;
                }
            }
        });

        // Проверка финиша
        if (this.checkCollision(this.player, this.finish)) {
            console.log('Пепе достиг финиша! Победа!');
            this.victory();
        }

        // Проверка падения
        if (this.player.y > this.levelHeight) {
            this.lives--;
            this.updateUI();
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.x = 100;
                this.player.y = 500;
            }
        }

        this.particleSystem.update();
    }

    private updateCamera(): void {
        this.cameraX = this.player.x - this.canvas.width / 2;
        this.cameraY = this.player.y - this.canvas.height / 2;
        
        // Ограничения камеры
        this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelWidth - this.canvas.width));
        this.cameraY = Math.max(0, Math.min(this.cameraY, this.levelHeight - this.canvas.height));
    }

    public render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Сохраняем контекст
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);

        // Рендер фона
        this.renderBackground();

        // Рендер игровых объектов
        this.platforms.forEach(platform => platform.render(this.ctx));
        this.memes.forEach(meme => meme.render(this.ctx));
        this.trolls.forEach(troll => troll.render(this.ctx));
        this.finish.update();
        this.finish.render(this.ctx);
        this.player.render(this.ctx);
        this.particleSystem.render(this.ctx);

        // Восстанавливаем контекст
        this.ctx.restore();

        // Рендер UI поверх всего
        this.renderUI();
    }

    private renderBackground(): void {
        // Градиентный фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.levelHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.levelWidth, this.levelHeight);

        // Облака
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 10; i++) {
            const x = (i * 300 + this.cameraX * 0.5) % this.levelWidth;
            const y = 50 + Math.sin(i) * 20;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 40, y, 25, 0, Math.PI * 2);
            this.ctx.arc(x + 80, y, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    private renderUI(): void {
        if (this.gameState === 'gameOver') {
            this.renderGameOver();
        } else if (this.gameState === 'victory') {
            console.log('Отрисовка экрана победы');
            this.renderVictory();
        }
    }

    private renderGameOver(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ИГРА ОКОНЧЕНА', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Финальный счет: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Нажмите F5 для перезапуска', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    private renderVictory(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ПОБЕДА!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Счет: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Пепе стал легендой!', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    private checkCollision(obj1: any, obj2: any): boolean {
        const collision = obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
        
        // Отладка для финиша (временно отключена)
        // if (obj2 === this.finish) {
        //     console.log('Проверка коллизии с финишем:', {
        //         player: { x: obj1.x, y: obj1.y, width: obj1.width, height: obj1.height },
        //         finish: { x: obj2.x, y: obj2.y, width: obj2.width, height: obj2.height },
        //         collision: collision
        //     });
        // }
        
        return collision;
    }

    private updateUI(): void {
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) scoreElement.textContent = this.score.toString();
        if (livesElement) livesElement.textContent = this.lives.toString();
        if (levelElement) levelElement.textContent = this.level.toString();
    }

    private gameOver(): void {
        this.gameState = 'gameOver';
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playSound('gameOver');
    }

    private victory(): void {
        console.log('Вызывается метод victory()');
        this.gameState = 'victory';
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playSound('victory');
        console.log('Состояние игры изменено на:', this.gameState);
    }
} 