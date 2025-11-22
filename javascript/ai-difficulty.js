"use strict"

/**
 * AI Difficulty Manager
 * Manages AI difficulty levels: Easy (80%), Medium (90%), Hard (100%)
 */
class AIDifficultyManager {
    constructor() {
        this.difficulty = this.loadDifficulty(); // 'easy', 'medium', or 'hard'
        this.optimalityRate = this.getOptimalityRate(this.difficulty);
    }

    /**
     * Load difficulty from localStorage or default to 'medium'
     */
    loadDifficulty() {
        try {
            const saved = localStorage.getItem('aiDifficulty');
            return saved || 'medium';
        } catch (e) {
            return 'medium';
        }
    }

    /**
     * Save difficulty to localStorage
     */
    saveDifficulty(difficulty) {
        try {
            localStorage.setItem('aiDifficulty', difficulty);
            this.difficulty = difficulty;
            this.optimalityRate = this.getOptimalityRate(difficulty);
            
            // Update UI dropdown if it exists
            if (typeof document !== 'undefined') {
                const dropdown = document.getElementById('ai-difficulty-dropdown');
                if (dropdown) {
                    dropdown.value = difficulty;
                }
            }
        } catch (e) {
            console.warn('Could not save AI difficulty:', e);
        }
    }
    
    /**
     * Initialize UI dropdown when DOM is ready
     */
    initializeUI() {
        if (typeof document === 'undefined') return;
        
        const dropdown = document.getElementById('ai-difficulty-dropdown');
        if (!dropdown) {
            // Try again after a short delay if dropdown isn't ready yet
            setTimeout(() => this.initializeUI(), 100);
            return;
        }
        
        // Set initial value
        dropdown.value = this.difficulty;
        
        // Listen for changes
        dropdown.addEventListener('change', () => {
            this.setDifficulty(dropdown.value);
        });
    }

    /**
     * Get optimality rate for difficulty level
     */
    getOptimalityRate(difficulty) {
        switch (difficulty) {
            case 'easy': return 0.80;   // 80% optimal
            case 'medium': return 0.90; // 90% optimal
            case 'hard': return 1.00;   // 100% optimal
            default: return 0.90;
        }
    }

    /**
     * Get current difficulty
     */
    getDifficulty() {
        return this.difficulty;
    }

    /**
     * Set difficulty
     */
    setDifficulty(difficulty) {
        if (['easy', 'medium', 'hard'].includes(difficulty)) {
            this.saveDifficulty(difficulty);
        }
    }

    /**
     * Check if AI should make optimal decision (based on difficulty)
     * Returns true if should be optimal, false if should make suboptimal choice
     */
    shouldMakeOptimalDecision() {
        return Math.random() < this.optimalityRate;
    }

    /**
     * Get weather avoidance rate (higher difficulty = better avoidance)
     */
    getWeatherAvoidanceRate() {
        switch (this.difficulty) {
            case 'easy': return 0.60;   // 60% chance to avoid weather
            case 'medium': return 0.85; // 85% chance to avoid weather
            case 'hard': return 1.00;   // 100% chance to avoid weather
            default: return 0.85;
        }
    }

    /**
     * Check if AI should avoid weather
     */
    shouldAvoidWeather() {
        return Math.random() < this.getWeatherAvoidanceRate();
    }
}

// Create global instance
const aiDifficultyManager = new AIDifficultyManager();
window.aiDifficultyManager = aiDifficultyManager; // Make globally accessible

// Initialize UI when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            aiDifficultyManager.initializeUI();
        });
    } else {
        // DOM already loaded
        setTimeout(() => aiDifficultyManager.initializeUI(), 100);
    }
}

// Listen for difficulty changes from Electron menu
if (window.electronAPI && window.electronAPI.onSetAIDifficulty) {
    window.electronAPI.onSetAIDifficulty((_, difficulty) => {
        aiDifficultyManager.setDifficulty(difficulty);
        console.log('AI difficulty set to:', difficulty, `(${aiDifficultyManager.optimalityRate * 100}% optimal)`);
    });
}

