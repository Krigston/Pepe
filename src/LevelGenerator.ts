import { Platform } from './entities/Platform';
import { Meme } from './entities/Meme';
import { Troll } from './entities/Troll';
import { Finish } from './entities/Finish';
import { FlyingMonster } from './entities/FlyingMonster';

interface LevelSegment {
    platforms: Platform[];
    memes: Meme[];
    trolls: Troll[];
    flyingMonsters: FlyingMonster[];
    startX: number;
    endX: number;
    difficulty: number;
}

interface GeneratedLevel {
    platforms: Platform[];
    memes: Meme[];
    trolls: Troll[];
    flyingMonsters: FlyingMonster[];
    finish: Finish;
    width: number;
}

export class LevelGenerator {
    private readonly SEGMENT_WIDTH = 400;
    private readonly JUMP_HEIGHT = 120; // Максимальная высота прыжка Пепе
    private readonly JUMP_DISTANCE = 120; // Максимальная дистанция прыжка (уменьшено на 20%)
    private readonly MIN_PLATFORM_WIDTH = 80;
    private readonly MAX_PLATFORM_WIDTH = 200;
    private readonly GROUND_Y = 550;

    public generateLevel(numSegments: number = 6, seed?: number): GeneratedLevel {
        if (seed) {
            this.setSeed(seed);
        }

        const segments: LevelSegment[] = [];
        let currentX = 0;

        // Стартовая платформа
        const startSegment = this.createStartSegment(currentX);
        segments.push(startSegment);
        currentX += this.SEGMENT_WIDTH;

        // Генерируем основные сегменты
        for (let i = 1; i < numSegments - 1; i++) {
            const difficulty = i / (numSegments - 1); // Прогрессивная сложность
            const segment = this.createSegment(currentX, difficulty, segments[segments.length - 1]);
            segments.push(segment);
            currentX += this.SEGMENT_WIDTH;
        }

        // Финальный сегмент
        const finalSegment = this.createFinalSegment(currentX, segments[segments.length - 1]);
        segments.push(finalSegment);

        // Объединяем все сегменты
        return this.combineSegments(segments, currentX + this.SEGMENT_WIDTH);
    }

    private createStartSegment(startX: number): LevelSegment {
        const platforms: Platform[] = [
            new Platform(startX, this.GROUND_Y, 300, 20), // Стартовая платформа
        ];

        // Стартовый сегмент без врагов - безопасная зона
        return {
            platforms,
            memes: [],
            trolls: [],
            flyingMonsters: [],
            startX,
            endX: startX + this.SEGMENT_WIDTH,
            difficulty: 0
        };
    }

    private createSegment(startX: number, difficulty: number, previousSegment: LevelSegment): LevelSegment {
        const platforms: Platform[] = [];
        const memes: Meme[] = [];
        const trolls: Troll[] = [];
        const flyingMonsters: FlyingMonster[] = [];

        // Получаем конечную платформу предыдущего сегмента
        const lastPlatform = this.getLastPlatform(previousSegment);
        let currentY = lastPlatform.y;
        let currentPlatformX = startX + 50;

        // Генерируем 2-3 платформы в сегменте (уменьшили для стабильности)
        const numPlatforms = 2 + Math.floor(this.random() * 2);

        for (let i = 0; i < numPlatforms; i++) {
            const segmentType = this.selectSegmentType(difficulty);
            const platform = this.createPlatformSegment(
                currentPlatformX, 
                currentY, 
                segmentType, 
                i === numPlatforms - 1
            );

            platforms.push(platform);

            // Добавляем мемы и троллей на основе сложности
            if (this.random() < 0.6 + difficulty * 0.3) {
                memes.push(new Meme(
                    platform.x + platform.width / 2, 
                    platform.y - 30
                ));
            }

            if (this.random() < difficulty * 0.4 && platform.width > 120) {
                trolls.push(new Troll(
                    platform.x + 20, 
                    platform.y - 35
                ));
            }

            // Добавляем летающих монстров (только если это не первые платформы)
            if (platform.x > startX + 200) { // Не размещаем слишком близко к старту
                const flyingChance = Math.max(0.1, difficulty * 0.25); // Уменьшаем вероятность
                if (this.random() < flyingChance) {
                    const flyingY = currentY - 60 - this.random() * 80; // Летают выше платформ
                    flyingMonsters.push(new FlyingMonster(
                        platform.x + platform.width / 2,
                        flyingY
                    ));
                }
            }

            // Обновляем позицию для следующей платформы (уменьшили вариацию с 50 до 30)
            currentPlatformX += this.JUMP_DISTANCE + this.random() * 30;
            let newY = this.calculateNextY(currentY, segmentType, difficulty);
            
            // Ограничиваем высоту платформ для играбельности
            const MIN_Y = 100; // Минимальная высота
            const MAX_Y = 500; // Максимальная высота
            currentY = Math.max(MIN_Y, Math.min(MAX_Y, newY));
        }

        return {
            platforms,
            memes,
            trolls,
            flyingMonsters,
            startX,
            endX: startX + this.SEGMENT_WIDTH,
            difficulty
        };
    }

    private createFinalSegment(startX: number, previousSegment: LevelSegment): LevelSegment {
        const lastPlatform = this.getLastPlatform(previousSegment);
        
        const platforms: Platform[] = [
            new Platform(startX + 50, lastPlatform.y, 150, 20),
            new Platform(startX + 250, lastPlatform.y - 40, 120, 20), // Платформа для финиша
        ];

        return {
            platforms,
            memes: [new Meme(startX + 100, lastPlatform.y - 30)], // Последний мем
            trolls: [],
            flyingMonsters: [], // Финальный сегмент без летающих монстров
            startX,
            endX: startX + this.SEGMENT_WIDTH,
            difficulty: 0
        };
    }

    private selectSegmentType(difficulty: number): 'easy' | 'jump' | 'climb' | 'drop' {
        const rand = this.random();
        
        if (difficulty < 0.3) {
            return rand < 0.7 ? 'easy' : 'jump';
        } else if (difficulty < 0.7) {
            if (rand < 0.4) return 'easy';
            if (rand < 0.7) return 'jump';
            return 'climb';
        } else {
            if (rand < 0.2) return 'easy';
            if (rand < 0.5) return 'jump';
            if (rand < 0.8) return 'climb';
            return 'drop';
        }
    }

    private createPlatformSegment(x: number, currentY: number, _type: string, _isLast: boolean): Platform {
        const width = this.MIN_PLATFORM_WIDTH + this.random() * (this.MAX_PLATFORM_WIDTH - this.MIN_PLATFORM_WIDTH);
        return new Platform(x, currentY, width, 20);
    }

    private calculateNextY(currentY: number, segmentType: string, _difficulty: number): number {
        switch (segmentType) {
            case 'easy':
                return currentY + (-30 + this.random() * 60); // Больше вариации высоты
            case 'jump':
                return currentY - (40 + this.random() * 80); // Более высокие прыжки
            case 'climb':
                return currentY - (80 + this.random() * 60); // Еще более высокие подъемы
            case 'drop':
                return currentY + (60 + this.random() * 100); // Более глубокие спуски
            default:
                return currentY;
        }
    }

    private getLastPlatform(segment: LevelSegment): Platform {
        return segment.platforms[segment.platforms.length - 1];
    }

    private combineSegments(segments: LevelSegment[], totalWidth: number): GeneratedLevel {
        const allPlatforms: Platform[] = [];
        const allMemes: Meme[] = [];
        const allTrolls: Troll[] = [];
        const allFlyingMonsters: FlyingMonster[] = [];

        // Объединяем все сегменты
        for (const segment of segments) {
            allPlatforms.push(...segment.platforms);
            allMemes.push(...segment.memes);
            allTrolls.push(...segment.trolls);
            allFlyingMonsters.push(...segment.flyingMonsters);
        }

        // Основание уровня убрано для более интересного геймплея

        // Создаем финиш на последней платформе
        const lastPlatform = this.getLastPlatform(segments[segments.length - 1]);
        const finish = new Finish(lastPlatform.x + lastPlatform.width - 50, lastPlatform.y - 60);

        // Проверяем и исправляем проходимость
        this.ensurePlayability(allPlatforms, allMemes, allTrolls);

        return {
            platforms: allPlatforms,
            memes: allMemes,
            trolls: allTrolls,
            flyingMonsters: allFlyingMonsters,
            finish,
            width: totalWidth
        };
    }

    private ensurePlayability(platforms: Platform[], _memes: Meme[], _trolls: Troll[]): void {
        // Проверяем, что между каждой парой соседних платформ можно прыгнуть
        // Добавляем защиту от бесконечного цикла
        let iterations = 0;
        const maxIterations = platforms.length * 2; // Максимум итераций
        
        for (let i = 0; i < platforms.length - 1 && iterations < maxIterations; i++) {
            iterations++;
            const current = platforms[i];
            const next = platforms[i + 1];

            // Пропускаем основание уровня
            if (current.height > 30 || next.height > 30) continue;

            const horizontalDistance = Math.abs(next.x - (current.x + current.width));
            const verticalDistance = Math.abs(next.y - current.y);

            // Если прыжок слишком далеко, корректируем только один раз
            if (horizontalDistance > this.JUMP_DISTANCE * 0.9) { 
                // Добавляем промежуточную платформу
                const midX = current.x + current.width + this.JUMP_DISTANCE * 0.7;
                const midY = current.y + Math.min((next.y - current.y) / 2, 40); // Ограничиваем изменение высоты
                platforms.splice(i + 1, 0, new Platform(midX, midY, 100, 20));
                // После добавления платформы увеличиваем i, чтобы не проверять ее снова
                i++;
            }

            if (verticalDistance > this.JUMP_HEIGHT && next.y < current.y) {
                // Понижаем слишком высокую платформу
                next.y = current.y - this.JUMP_HEIGHT + 30;
            }
        }
    }

    // Простая реализация seeded random
    private seed: number = Math.random() * 1000000;

    private setSeed(seed: number): void {
        this.seed = seed;
    }

    private random(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        // Защита от нулевого seed
        if (this.seed === 0) {
            this.seed = 1;
        }
        return this.seed / 233280;
    }
}
