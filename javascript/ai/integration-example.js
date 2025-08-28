/**
 * Integration Example - Shows how to use the enhanced AI system
 */

// Example 1: Basic Integration
function integrateEnhancedAI() {
    console.log('Integrating Enhanced AI System...');
    
    // Check if enhanced AI is available
    if (AIFactory.isEnhancedAIAvailable()) {
        console.log('✅ Enhanced AI is available');
        
        // Create enhanced AI for opponent player
        const opponentPlayer = player_op; // Assuming this is the opponent player
        const enhancedAI = AIFactory.createEnhancedAI(opponentPlayer);
        
        console.log('Enhanced AI controller created:', enhancedAI);
        
        // The AI will now use enhanced logic automatically
        return enhancedAI;
    } else {
        console.log('❌ Enhanced AI not available, using basic AI');
        return AIFactory.createBasicAI(player_op);
    }
}

// Example 2: Configuration Management
function configureAI() {
    console.log('Configuring AI System...');
    
    // Set AI to be more aggressive
    AIConfigurationManager.updateConfig('strategy.aggressiveness', 0.8);
    
    // Enable all enhanced features
    AIConfigurationManager.updateConfig('ai.enablePrediction', true);
    AIConfigurationManager.updateConfig('ai.enableThreatAnalysis', true);
    AIConfigurationManager.updateConfig('ai.enableLearning', true);
    
    // Set performance monitoring
    AIConfigurationManager.updateConfig('performance.enableMonitoring', true);
    AIConfigurationManager.updateConfig('performance.logLevel', 'INFO');
    
    console.log('AI Configuration updated');
    
    // Display current configuration
    const config = AIConfigurationManager.config;
    console.log('Current AI Configuration:', config);
}

// Example 3: Performance Monitoring
function monitorPerformance() {
    console.log('Setting up Performance Monitoring...');
    
    // Get initial performance report
    const initialReport = AIPerformanceMonitor.getPerformanceReport();
    console.log('Initial Performance Report:', initialReport);
    
    // Set up periodic monitoring
    setInterval(() => {
        const report = AIPerformanceMonitor.getPerformanceReport();
        
        if (report.metrics.enhanced.totalGames > 0) {
            console.log(`Enhanced AI Performance: ${(report.metrics.enhanced.winRate * 100).toFixed(1)}% win rate`);
        }
        
        if (report.metrics.basic.totalGames > 0) {
            console.log(`Basic AI Performance: ${(report.metrics.basic.winRate * 100).toFixed(1)}% win rate`);
        }
    }, 30000); // Check every 30 seconds
    
    console.log('Performance monitoring enabled');
}

// Example 4: Dynamic AI Switching
function enableDynamicAISwitching() {
    console.log('Enabling Dynamic AI Switching...');
    
    // Store original AI creation logic
    const originalPlayerConstructor = Player.prototype.constructor;
    
    // Override player creation to use enhanced AI
    Player.prototype.constructor = function(id, name, deck, isAI = true) {
        // Call original constructor
        originalPlayerConstructor.call(this, id, name, deck, isAI);
        
        // If this is an AI player, upgrade to enhanced AI
        if (isAI && AIFactory.isEnhancedAIAvailable()) {
            console.log(`Upgrading player ${name} to Enhanced AI`);
            
            // Create enhanced AI controller
            const enhancedController = AIFactory.createEnhancedAI(this);
            
            // Replace the controller
            this.controller = enhancedController;
            
            console.log(`Player ${name} now using Enhanced AI`);
        }
    };
    
    console.log('Dynamic AI switching enabled');
}

// Example 5: Custom Strategy Implementation
function implementCustomStrategy() {
    console.log('Implementing Custom Strategy...');
    
    // Extend StrategicManager with custom strategy
    if (typeof StrategicManager !== 'undefined') {
        StrategicManager.prototype.getCustomStrategy = function() {
            return {
                type: 'CUSTOM_AGGRESSIVE',
                priority: 'MAXIMIZE_DAMAGE',
                riskTolerance: 'HIGH',
                cardUsage: 'AGGRESSIVE',
                customRules: [
                    'Always play high-power cards first',
                    'Prioritize removal cards',
                    'Use weather effects aggressively'
                ]
            };
        };
        
        console.log('Custom strategy implemented');
    } else {
        console.log('StrategicManager not available for custom strategy');
    }
}

// Example 6: AI Learning Integration
function setupAILearning() {
    console.log('Setting up AI Learning...');
    
    // Hook into game end events to record results
    if (typeof game !== 'undefined') {
        const originalEndGame = game.endGame;
        
        game.endGame = function(winner) {
            // Call original end game logic
            originalEndGame.call(this, winner);
            
            // Record game results for AI learning
            const gameStats = {
                rounds: game.roundCount,
                winner: winner,
                timestamp: Date.now()
            };
            
            // Record results for both players
            if (player_me && player_me.controller) {
                AIPerformanceMonitor.recordGameResult(player_me, winner === player_me, gameStats);
            }
            
            if (player_op && player_op.controller) {
                AIPerformanceMonitor.recordGameResult(player_op, winner === player_op, gameStats);
            }
            
            console.log('Game results recorded for AI learning');
        };
        
        console.log('AI learning integration enabled');
    } else {
        console.log('Game object not available for learning integration');
    }
}

// Example 7: Debug and Testing Tools
function setupDebugTools() {
    console.log('Setting up Debug Tools...');
    
    // Add debug commands to global scope
    window.debugAI = {
        // Show AI system info
        info: () => {
            console.log('AI System Info:', AIFactory.getAISystemInfo());
        },
        
        // Show performance report
        performance: () => {
            const report = AIPerformanceMonitor.getPerformanceReport();
            console.log('Performance Report:', report);
        },
        
        // Show current configuration
        config: () => {
            console.log('AI Configuration:', AIConfigurationManager.config);
        },
        
        // Test enhanced AI creation
        test: () => {
            if (player_op) {
                const enhancedAI = AIFactory.createEnhancedAI(player_op);
                console.log('Test Enhanced AI:', enhancedAI);
            } else {
                console.log('No opponent player available for testing');
            }
        },
        
        // Export performance data
        export: () => {
            const data = AIPerformanceMonitor.exportPerformanceData();
            console.log('Performance Data:', data);
            
            // Create downloadable file
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ai-performance-data.json';
            a.click();
            URL.revokeObjectURL(url);
        },
        
        // Reset configuration
        reset: () => {
            AIConfigurationManager.resetConfig();
            console.log('AI configuration reset to defaults');
        }
    };
    
    console.log('Debug tools available at window.debugAI');
    console.log('Use debugAI.info() to see system status');
}

// Example 8: Main Integration Function
function integrateEnhancedAISystem() {
    console.log('🚀 Starting Enhanced AI Integration...');
    
    try {
        // Step 1: Basic integration
        const aiController = integrateEnhancedAI();
        
        // Step 2: Configure AI
        configureAI();
        
        // Step 3: Set up performance monitoring
        monitorPerformance();
        
        // Step 4: Enable dynamic AI switching
        enableDynamicAISwitching();
        
        // Step 5: Implement custom strategies
        implementCustomStrategy();
        
        // Step 6: Set up AI learning
        setupAILearning();
        
        // Step 7: Set up debug tools
        setupDebugTools();
        
        console.log('✅ Enhanced AI System Integration Complete!');
        console.log('🎮 The AI will now use enhanced decision-making logic');
        console.log('📊 Performance monitoring is active');
        console.log('🔧 Debug tools available at window.debugAI');
        
        return true;
        
    } catch (error) {
        console.error('❌ Enhanced AI Integration Failed:', error);
        console.log('🔄 Falling back to basic AI system');
        return false;
    }
}

// Example 9: Conditional Integration
function conditionalIntegration() {
    // Check if we should use enhanced AI
    const shouldUseEnhanced = AIConfigurationManager.getConfig('ai.type') === 'ENHANCED';
    
    if (shouldUseEnhanced && AIFactory.isEnhancedAIAvailable()) {
        console.log('🎯 Using Enhanced AI System');
        return integrateEnhancedAISystem();
    } else {
        console.log('🎯 Using Basic AI System');
        return false;
    }
}

// Example 10: Progressive Enhancement
function progressiveEnhancement() {
    console.log('🔄 Setting up Progressive Enhancement...');
    
    // Start with basic AI
    let currentAI = 'BASIC';
    
    // Try to upgrade to enhanced AI
    if (AIFactory.isEnhancedAIAvailable()) {
        try {
            integrateEnhancedAISystem();
            currentAI = 'ENHANCED';
            console.log('✅ Successfully upgraded to Enhanced AI');
        } catch (error) {
            console.log('⚠️ Enhanced AI upgrade failed, keeping Basic AI');
        }
    }
    
    // Set up monitoring to track performance
    AIPerformanceMonitor.updatePerformanceMetrics();
    
    console.log(`🎮 AI System Status: ${currentAI}`);
    return currentAI;
}

// Auto-integration when script loads
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(progressiveEnhancement, 1000); // Wait 1 second for other scripts
        });
    } else {
        setTimeout(progressiveEnhancement, 1000); // Wait 1 second for other scripts
    }
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        integrateEnhancedAI,
        configureAI,
        monitorPerformance,
        enableDynamicAISwitching,
        implementCustomStrategy,
        setupAILearning,
        setupDebugTools,
        integrateEnhancedAISystem,
        conditionalIntegration,
        progressiveEnhancement
    };
}
