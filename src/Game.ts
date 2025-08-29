import { Player } from './entities/Player';
import { Platform } from './entities/Platform';
import { Meme } from './entities/Meme';
import { Troll } from './entities/Troll';
import { Finish } from './entities/Finish';
import { FlyingMonster } from './entities/FlyingMonster';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { ParticleSystem } from './ParticleSystem';
import { LevelGenerator } from './LevelGenerator';
import { MobileUtils } from './MobileUtils';

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
    private flyingMonsters: FlyingMonster[] = [];
    private finish!: Finish;
    
    private score: number = 0;
    private lives: number = 3;
    private level: number = 1;
    private gameState: 'menu' | 'playing' | 'gameOver' | 'victory' = 'menu';
    private levelCompleted: boolean = false; // Флаг для предотвращения повторного завершения уровня
    private invulnerabilityTime: number = 0; // Время неуязвимости после получения урона
    
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
        
        // Настройка адаптивного canvas
        this.setupResponsiveCanvas();
        
        this.generateRandomLevel(); // Включили обратно рандомную генерацию с улучшенными параметрами
    }
    
    private setupResponsiveCanvas(): void {
        const resizeCanvas = () => {
            if (MobileUtils.isMobileDevice()) {
                // На мобильных устройствах используем полный экран
                const screenSize = MobileUtils.getScreenSize();
                this.canvas.width = screenSize.width;
                this.canvas.height = screenSize.height;
                
                // Убираем стандартные размеры
                this.canvas.style.width = '100vw';
                this.canvas.style.height = '100vh';
                
                console.log(`Mobile canvas resized to: ${screenSize.width}x${screenSize.height}`);
            } else {
                // На десктопе используем стандартные размеры
                this.canvas.width = 800;
                this.canvas.height = 600;
                this.canvas.style.width = '800px';
                this.canvas.style.height = '600px';
                
                console.log('Desktop canvas size: 800x600');
            }
            
            // Обновляем контекст после изменения размера
            this.ctx = this.canvas.getContext('2d')!;
        };
        
        // Первоначальная настройка
        resizeCanvas();
        
        // Слушаем изменения размера окна и ориентации
        window.addEventListener('resize', () => {
            setTimeout(resizeCanvas, 100); // Небольшая задержка для корректной работы
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 200); // Больше времени для смены ориентации
        });
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
        try {
            const generatedLevel = this.levelGenerator.generateLevel(5); // 5 сегментов для стабильности
            
            this.platforms = generatedLevel.platforms;
            this.memes = generatedLevel.memes;
            this.trolls = generatedLevel.trolls;
            this.flyingMonsters = generatedLevel.flyingMonsters;
            this.finish = generatedLevel.finish;
            this.levelWidth = generatedLevel.width;
            
            // Сбрасываем позицию игрока
            this.player.x = 100;
            this.player.y = 500;
            this.cameraX = 0;
            
            // Сбрасываем игровые параметры (но НЕ level - он увеличивается при победе)
            // this.score = 0; // Сохраняем счет между уровнями
            this.lives = 3;
            this.gameState = 'playing';
            this.levelCompleted = false; // Сбрасываем флаг завершения уровня
            this.invulnerabilityTime = 0; // Сбрасываем неуязвимость
            
            this.updateUI();
            this.audioManager.playBackgroundMusic(); // Возобновляем музыку
            
            console.log('Уровень успешно сгенерирован:', {
                platforms: this.platforms.length,
                memes: this.memes.length,
                trolls: this.trolls.length,
                flyingMonsters: this.flyingMonsters.length,
                width: this.levelWidth,
                level: this.level
            });
            
            // Дополнительная информация о летающих монстрах
            if (this.flyingMonsters.length > 0) {
                console.log('Летающие монстры размещены в позициях:', 
                    this.flyingMonsters.map((fm, i) => ({ 
                        index: i, 
                        x: Math.round(fm.x), 
                        y: Math.round(fm.y),
                        width: fm.width,
                        height: fm.height 
                    }))
                );
                
                // Проверяем на дублированные позиции
                const positions = this.flyingMonsters.map(fm => `${Math.round(fm.x)},${Math.round(fm.y)}`);
                const uniquePositions = [...new Set(positions)];
                if (positions.length !== uniquePositions.length) {
                    console.warn('⚠️ НАЙДЕНЫ ДУБЛИРОВАННЫЕ ЛЕТАЮЩИЕ МОНСТРЫ!', positions);
                }
            } else {
                console.warn('⚠️ На уровне', this.level, 'не создано ни одного летающего монстра!');
            }
            
            // Информация о всех врагах
            console.log('Всего врагов на уровне:', {
                trolls: this.trolls.length,
                flyingMonsters: this.flyingMonsters.length,
                total: this.trolls.length + this.flyingMonsters.length
            });
        } catch (error) {
            console.error('Ошибка при генерации уровня:', error);
            // Fallback на простой уровень
            this.generateFallbackLevel();
        }
    }

    private generateFallbackLevel(): void {
        console.log('Используем резервный простой уровень');
        this.platforms = [
            new Platform(0, 580, 800, 20),
            new Platform(200, 480, 150, 20),
            new Platform(450, 380, 150, 20),
            new Platform(700, 380, 150, 20),
            new Platform(950, 380, 150, 20),
        ];
        this.memes = [new Meme(275, 450), new Meme(525, 350)];
        this.trolls = [new Troll(600, 345)];
        this.flyingMonsters = [
            new FlyingMonster(500, 250)  // Летающий монстр в середине уровня
        ];
        this.finish = new Finish(1000, 320);
        this.levelWidth = 1200;
        
        this.player.x = 100;
        this.player.y = 500;
        this.cameraX = 0;
        this.score = 0;
        this.lives = 3;
        this.gameState = 'playing';
        this.levelCompleted = false; // Сбрасываем флаг
        this.updateUI();
    }

    private canTakeDamage(): boolean {
        return this.invulnerabilityTime <= 0;
    }

    private takeDamage(source: string): void {
        this.lives--;
        this.invulnerabilityTime = 120; // 2 секунды неуязвимости при 60 FPS
        this.audioManager.playSound('hit');
        
        // Разные цвета частиц для разных врагов
        const particleColor = source === 'летающий монстр' ? '#9C27B0' : '#FF0000';
        this.particleSystem.createParticles(this.player.x, this.player.y, particleColor);
        
        this.updateUI();
        console.log(`Игрок получил урон от: ${source}, неуязвимость: ${this.invulnerabilityTime} кадров`);
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Отбрасываем игрока назад НЕМЕДЛЕННО
            this.player.x = 100;
            this.player.y = 500;
            this.cameraX = 0; // Сбрасываем камеру тоже
        }
    }

    public resetToNewLevel(): void {
        // Полный сброс для кнопки "Новый уровень"
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.levelCompleted = false; // Сбрасываем флаг
        this.generateRandomLevel();
    }





    public update(): void {
        if (this.gameState !== 'playing') return;

        // Обновляем таймер неуязвимости
        if (this.invulnerabilityTime > 0) {
            this.invulnerabilityTime--;
        }

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
        this.trolls.forEach((troll, index) => {
            troll.update(this.platforms);
            const trollCollision = this.checkCollision(this.player, troll);
            if (trollCollision) {
                console.log(`🔴 Коллизия с троллем #${index}:`, {
                    playerPos: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
                    trollPos: { x: Math.round(troll.x), y: Math.round(troll.y) },
                    canTakeDamage: this.canTakeDamage(),
                    invulnerabilityTime: this.invulnerabilityTime
                });
                if (this.canTakeDamage()) {
                    this.takeDamage('тролль');
                }
            }
        });

        // Обновление летающих монстров
        this.flyingMonsters.forEach((flyingMonster, index) => {
            flyingMonster.update();
            const flyingCollision = this.checkCollision(this.player, flyingMonster);
            if (flyingCollision) {
                console.log(`🦇 Коллизия с летающим монстром #${index}:`, {
                    playerPos: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
                    monsterPos: { x: Math.round(flyingMonster.x), y: Math.round(flyingMonster.y) },
                    canTakeDamage: this.canTakeDamage(),
                    invulnerabilityTime: this.invulnerabilityTime
                });
                if (this.canTakeDamage()) {
                    this.takeDamage('летающий монстр');
                }
            }
        });

        // Проверка финиша (только если уровень еще не завершен)
        if (this.checkCollision(this.player, this.finish) && !this.levelCompleted) {
            console.log('Пепе достиг финиша! Победа!');
            this.levelCompleted = true; // Помечаем уровень как завершенный
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
        this.flyingMonsters.forEach(flyingMonster => flyingMonster.render(this.ctx));
        this.finish.update();
        this.finish.render(this.ctx);
        this.player.render(this.ctx, this.invulnerabilityTime > 0);
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
        
        // Детальная отладка для летающих монстров
        if (collision && this.flyingMonsters.includes(obj2)) {
            console.log('🔍 ДЕТАЛИ КОЛЛИЗИИ с летающим монстром:', {
                player: { 
                    x: Math.round(obj1.x), 
                    y: Math.round(obj1.y), 
                    w: obj1.width, 
                    h: obj1.height,
                    right: Math.round(obj1.x + obj1.width),
                    bottom: Math.round(obj1.y + obj1.height)
                },
                monster: { 
                    x: Math.round(obj2.x), 
                    y: Math.round(obj2.y), 
                    w: obj2.width, 
                    h: obj2.height,
                    right: Math.round(obj2.x + obj2.width),
                    bottom: Math.round(obj2.y + obj2.height)
                },
                overlap: {
                    horizontal: Math.min(obj1.x + obj1.width, obj2.x + obj2.width) - Math.max(obj1.x, obj2.x),
                    vertical: Math.min(obj1.y + obj1.height, obj2.y + obj2.height) - Math.max(obj1.y, obj2.y)
                }
            });
        }
        
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
        this.level++; // Увеличиваем номер уровня
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playSound('victory');
        
        // Показываем сообщение о переходе на следующий уровень
        this.showLevelComplete();
        
        // Автоматически генерируем следующий уровень через 2 секунды
        setTimeout(() => {
            this.generateRandomLevel();
        }, 2000);
        
        console.log('Переход на уровень:', this.level);
    }

    private showLevelComplete(): void {
        // Временно показываем сообщение в UI
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = `🎉 Уровень ${this.level - 1} пройден!`;
            levelElement.style.color = '#FFD700';
            levelElement.style.fontWeight = 'bold';
            
            setTimeout(() => {
                levelElement.textContent = `Уровень: ${this.level}`;
                levelElement.style.color = '';
                levelElement.style.fontWeight = '';
            }, 2000);
        }
    }
} 