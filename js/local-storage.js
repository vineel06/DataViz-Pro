// Local Storage Manager for data persistence
class LocalStorageManager {
    constructor() {
        this.prefix = 'dataviz_';
        this.maxSize = 5 * 1024 * 1024; // 5MB limit
    }

    save(key, value) {
        try {
            const serialized = JSON.stringify(value);
            if (serialized.length > this.maxSize) {
                console.warn('Data size exceeds limit, compressing...');
                const compressed = LZString.compress(serialized);
                localStorage.setItem(this.prefix + key, compressed);
                return { success: true, compressed: true };
            } else {
                localStorage.setItem(this.prefix + key, serialized);
                return { success: true, compressed: false };
            }
        } catch (error) {
            console.error('Save error:', error);
            return { success: false, error: error.message };
        }
    }

    load(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            if (!data) return null;

            // Try to decompress if compressed
            try {
                const decompressed = LZString.decompress(data);
                if (decompressed) {
                    return JSON.parse(decompressed);
                }
            } catch (e) {
                // Not compressed
            }

            return JSON.parse(data);
        } catch (error) {
            console.error('Load error:', error);
            return null;
        }
    }

    delete(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    getSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                total += localStorage.getItem(key).length * 2; // Approximate bytes
            }
        }
        return total;
    }

    getRemainingSpace() {
        return this.maxSize - this.getSize();
    }

    exportAll() {
        const exportData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                exportData[key] = localStorage.getItem(key);
            }
        }
        return exportData;
    }

    importAll(data) {
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });
    }
}