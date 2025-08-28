/**
 * AI Module Index - Loads and initializes all AI modules
 */

// Load all AI modules
// Note: These need to be loaded in dependency order

// Core analysis modules
if (typeof GameStateAnalyzer === 'undefined') {
    console.warn('GameStateAnalyzer not found, loading from file...');
    // In a real implementation, you'd load these modules dynamically
}

// Strategy modules
if (typeof StrategicManager === 'undefined') {
    console.warn('StrategicManager not found, loading from file...');
}

if (typeof RoundStrategy === 'undefined') {
    console.warn('RoundStrategy not found, loading from file...');
}

// Evaluation modules
if (typeof EnhancedCardEvaluator === 'undefined') {
    console.warn('EnhancedCardEvaluator not found, loading from file...');
}

if (typeof BaseCardEvaluator === 'undefined') {
    console.warn('BaseCardEvaluator not found, loading from file...');
}

// Predictive modules
if (typeof PredictiveAI === 'undefined') {
    console.warn('PredictiveAI not found, loading from file...');
}

if (typeof OpponentModel === 'undefined') {
    console.warn('OpponentModel not found, loading from file...');
}

if (typeof ThreatAnalyzer === 'undefined') {
    console.warn('ThreatAnalyzer not found, loading from file...');
}

// Main controller
if (typeof EnhancedAIController === 'undefined') {
    console.warn('EnhancedAIController not found, loading from file...');
}

/**
 * AI Factory - Creates and configures AI controllers
 */
class AIFactory {
    /**
     * Create an enhanced AI controller for a player
     */
    static createEnhancedAI(player) {
        try {
            // Check if all required modules are available
            if (typeof EnhancedAIController === 'undefined') {
                console.error('EnhancedAIController not available, falling back to basic AI');
                return new ControllerAI(player);
            }
            
            // Create enhanced AI controller
            const enhancedAI = new EnhancedAIController(player);
            console.log('Enhanced AI controller created successfully');
            return enhancedAI;
            
        } catch (error) {
            console.error('Failed to create enhanced AI:', error);
            console.log('Falling back to basic AI controller');
            return new ControllerAI(player);
        }
    }

    /**
     * Create a basic AI controller (fallback)
     */
    static createBasicAI(player) {
        return new ControllerAI(player);
    }

    /**
     * Check if enhanced AI is available
     */
    static isEnhancedAIAvailable() {
        return typeof EnhancedAIController !== 'undefined';
    }

    /**
     * Get AI system information
     */
    static getAISystemInfo() {
        return {
            enhancedAIAvailable: this.isEnhancedAIAvailable(),
            modules: {
                strategicManager: typeof StrategicManager !== 'undefined',
                gameStateAnalyzer: typeof GameStateAnalyzer !== 'undefined',
                enhancedCardEvaluator: typeof EnhancedCardEvaluator !== 'undefined',
                roundStrategy: typeof RoundStrategy !== 'undefined',
                predictiveAI: typeof PredictiveAI !== 'undefined',
                enhancedAIController: typeof EnhancedAIController !== 'undefined'
            },
            version: '3.1.0',
            description: 'Enhanced AI system with modular architecture'
        };
    }
}

/**
 * AI Performance Monitor - Tracks AI performance and provides insights
 */
class AIPerformanceMonitor {
    constructor() {
        this.performanceData = {};
        this.gameResults = [];
        this.learningMetrics = {};
    }

    /**
     * Record game result
     */
    recordGameResult(player, won, gameStats) {
        const result = {
            timestamp: Date.now(),
            player: player.id,
            won: won,
            stats: gameStats,
            aiType: this.getAIType(player)
        };
        
        this.gameResults.push(result);
        
        // Keep only last 100 games
        if (this.gameResults.length > 100) {
            this.gameResults = this.gameResults.slice(-100);
        }
        
        this.updatePerformanceMetrics();
    }

    /**
     * Get AI type for a player
     */
    getAIType(player) {
        if (player.controller instanceof EnhancedAIController) {
            return 'ENHANCED';
        } else if (player.controller instanceof ControllerAI) {
            return 'BASIC';
        } else {
            return 'UNKNOWN';
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        const enhancedResults = this.gameResults.filter(r => r.aiType === 'ENHANCED');
        const basicResults = this.gameResults.filter(r => r.aiType === 'BASIC');
        
        this.performanceMetrics = {
            enhanced: {
                totalGames: enhancedResults.length,
                winRate: enhancedResults.length > 0 ? 
                    enhancedResults.filter(r => r.won).length / enhancedResults.length : 0,
                averageGameLength: enhancedResults.length > 0 ?
                    enhancedResults.reduce((sum, r) => sum + (r.stats?.rounds || 0), 0) / enhancedResults.length : 0
            },
            basic: {
                totalGames: basicResults.length,
                winRate: basicResults.length > 0 ?
                    basicResults.filter(r => r.won).length / basicResults.length : 0,
                averageGameLength: basicResults.length > 0 ?
                    basicResults.reduce((sum, r) => sum + (r.stats?.rounds || 0), 0) / basicResults.length : 0
            }
        };
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        this.updatePerformanceMetrics();
        return {
            metrics: this.performanceMetrics,
            recentGames: this.gameResults.slice(-10),
            totalGames: this.gameResults.length,
            enhancedAIAvailability: AIFactory.isEnhancedAIAvailable()
        };
    }

    /**
     * Export performance data
     */
    exportPerformanceData() {
        return JSON.stringify({
            performanceMetrics: this.performanceMetrics,
            gameResults: this.gameResults,
            learningMetrics: this.learningMetrics
        }, null, 2);
    }
}

/**
 * AI Configuration Manager - Manages AI settings and preferences
 */
class AIConfigurationManager {
    constructor() {
        this.config = this.loadDefaultConfig();
        this.loadUserConfig();
    }

    /**
     * Load default configuration
     */
    loadDefaultConfig() {
        return {
            ai: {
                type: 'ENHANCED', // ENHANCED, BASIC, or HYBRID
                fallbackToBasic: true,
                enableLearning: true,
                enablePrediction: true,
                enableThreatAnalysis: true
            },
            strategy: {
                aggressiveness: 0.5, // 0.0 to 1.0
                riskTolerance: 0.5, // 0.0 to 1.0
                adaptability: 0.7, // 0.0 to 1.0
                bluffing: 0.3 // 0.0 to 1.0
            },
            performance: {
                enableMonitoring: true,
                logLevel: 'INFO', // DEBUG, INFO, WARN, ERROR
                saveGameResults: true
            }
        };
    }

    /**
     * Load user configuration from localStorage
     */
    loadUserConfig() {
        try {
            const savedConfig = localStorage.getItem('gwentAIConfig');
            if (savedConfig) {
                const userConfig = JSON.parse(savedConfig);
                this.config = this.mergeConfig(this.config, userConfig);
            }
        } catch (error) {
            console.warn('Failed to load user AI configuration:', error);
        }
    }

    /**
     * Save user configuration to localStorage
     */
    saveUserConfig() {
        try {
            localStorage.setItem('gwentAIConfig', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save user AI configuration:', error);
        }
    }

    /**
     * Merge configurations
     */
    mergeConfig(defaultConfig, userConfig) {
        const merged = { ...defaultConfig };
        
        for (const [key, value] of Object.entries(userConfig)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                merged[key] = this.mergeConfig(merged[key] || {}, value);
            } else {
                merged[key] = value;
            }
        }
        
        return merged;
    }

    /**
     * Update configuration
     */
    updateConfig(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.saveUserConfig();
    }

    /**
     * Get configuration value
     */
    getConfig(path) {
        const keys = path.split('.');
        let current = this.config;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    /**
     * Reset configuration to defaults
     */
    resetConfig() {
        this.config = this.loadDefaultConfig();
        this.saveUserConfig();
    }
}

// Initialize global AI components
window.AIFactory = AIFactory;
window.AIPerformanceMonitor = new AIPerformanceMonitor();
window.AIConfigurationManager = new AIConfigurationManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AIFactory,
        AIPerformanceMonitor,
        AIConfigurationManager
    };
}

console.log('AI Module Index loaded successfully');
console.log('AI System Info:', AIFactory.getAISystemInfo());
