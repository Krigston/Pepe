export class VersionManager {
    // Версия из package.json (будет обновляться автоматически)
    public static readonly CURRENT_VERSION = '1.3.47';
    
    public static getVersion(): string {
        return this.CURRENT_VERSION;
    }
    
    public static getFormattedVersion(): string {
        return `v${this.CURRENT_VERSION}`;
    }
    
    public static getBuildInfo(): { version: string; buildDate: string; commit?: string } {
        const buildDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        return {
            version: this.CURRENT_VERSION,
            buildDate,
            // commit будет добавлен в будущем через CI/CD
        };
    }
    
    // Семантическое версионирование: MAJOR.MINOR.PATCH
    public static parseVersion(version: string): { major: number; minor: number; patch: number } {
        const cleanVersion = version.replace(/^v/, ''); // убираем 'v' если есть
        const [major, minor, patch] = cleanVersion.split('.').map(Number);
        
        return {
            major: major || 0,
            minor: minor || 0,
            patch: patch || 0
        };
    }
    
    public static incrementVersion(version: string, type: 'major' | 'minor' | 'patch' = 'patch'): string {
        const { major, minor, patch } = this.parseVersion(version);
        
        switch (type) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
            default:
                return `${major}.${minor}.${patch + 1}`;
        }
    }
    
    public static isNewerVersion(currentVersion: string, compareVersion: string): boolean {
        const current = this.parseVersion(currentVersion);
        const compare = this.parseVersion(compareVersion);
        
        if (current.major !== compare.major) {
            return current.major > compare.major;
        }
        
        if (current.minor !== compare.minor) {
            return current.minor > compare.minor;
        }
        
        return current.patch > compare.patch;
    }
}
