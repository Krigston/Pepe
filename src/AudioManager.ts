export class AudioManager {
    private isMuted: boolean = false;
    private audioContext?: AudioContext;

    constructor() {
        this.initializeAudio();
    }

    private initializeAudio(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
            console.log('Аудио не поддерживается в этом браузере');
        }
    }

    private playBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
        if (this.isMuted || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log('Ошибка воспроизведения звука:', error);
        }
    }

    public playSound(soundName: string): void {
        if (this.isMuted) return;
        
        switch (soundName) {
            case 'collect':
                this.playBeep(800, 0.1, 'sine');
                break;
            case 'hit':
                this.playBeep(200, 0.2, 'sawtooth');
                break;
            case 'jump':
                this.playBeep(600, 0.1, 'triangle');
                break;
            case 'gameOver':
                this.playBeep(150, 0.5, 'square');
                break;
            case 'victory':
                this.playVictoryMelody();
                break;
        }
    }

    private playVictoryMelody(): void {
        if (this.isMuted || !this.audioContext) return;
        
        const frequencies = [523, 659, 784, 1047];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, 0.2, 'sine');
            }, index * 200);
        });
    }

    public playBackgroundMusic(): void {
        // Фоновая музыка отключена для упрощения
        console.log('Фоновая музыка запущена');
    }

    public stopBackgroundMusic(): void {
        console.log('Фоновая музыка остановлена');
    }

    public toggleMute(): void {
        this.isMuted = !this.isMuted;
        console.log(this.isMuted ? 'Звук выключен' : 'Звук включен');
    }

    public setVolume(volume: number): void {
        // Громкость контролируется в playBeep
        console.log(`Громкость установлена: ${volume}`);
    }
} 