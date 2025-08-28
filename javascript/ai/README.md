# Enhanced AI System for Gwent Classic

## Overview

This enhanced AI system provides a sophisticated, modular approach to AI decision-making in Gwent Classic. It replaces the basic, hardcoded AI with a comprehensive system that includes strategic planning, predictive analysis, and adaptive learning.

## Architecture

The AI system is built with a modular architecture consisting of several specialized components:

### Core Modules

1. **Strategic Manager** (`strategic-manager.js`)
   - Handles high-level game strategy and round management
   - Determines overall approach (aggressive, defensive, control, efficient)
   - Manages round-specific decision making

2. **Game State Analyzer** (`game-state-analyzer.js`)
   - Provides comprehensive analysis of current game state
   - Analyzes board position, card advantage, power advantage
   - Calculates strategic position and threat assessment

3. **Enhanced Card Evaluator** (`enhanced-card-evaluator.js`)
   - Sophisticated card evaluation based on multiple factors
   - Strategic value, situational value, and synergy analysis
   - Target evaluation for cards with targeting abilities

4. **Round Strategy** (`round-strategy.js`)
   - Round-specific tactics and objectives
   - Timing optimization and commitment level management
   - Special ability usage decisions

5. **Predictive AI** (`predictive-ai.js`)
   - Anticipates opponent moves and plans accordingly
   - Opponent behavior modeling and threat analysis
   - Counter-strategy generation

6. **Enhanced AI Controller** (`enhanced-ai-controller.js`)
   - Main controller that integrates all AI modules
   - Action evaluation and selection
   - Fallback mechanisms and error handling

### Support Modules

- **AI Factory** - Creates and configures AI controllers
- **Performance Monitor** - Tracks AI performance and provides insights
- **Configuration Manager** - Manages AI settings and preferences

## Key Improvements

### 1. Strategic Decision Making
- **Multi-level strategy**: Game-level, round-level, and turn-level strategies
- **Adaptive behavior**: Changes approach based on game state and opponent behavior
- **Resource management**: Intelligent card and ability usage

### 2. Enhanced Card Evaluation
- **Multi-factor scoring**: Base value, strategic value, situational value, and synergy
- **Context awareness**: Considers current board state, weather, and opponent threats
- **Target optimization**: Better targeting for cards with targeting abilities

### 3. Predictive Capabilities
- **Opponent modeling**: Learns from opponent behavior patterns
- **Threat assessment**: Identifies and responds to immediate and potential threats
- **Counter-strategy**: Generates responses to predicted opponent moves

### 4. Round Management
- **Round-specific tactics**: Different strategies for each round
- **Timing optimization**: Optimal timing for playing cards
- **Commitment level**: Intelligent decisions about round commitment

### 5. Learning and Adaptation
- **Performance tracking**: Monitors AI performance over time
- **Behavior analysis**: Learns from game outcomes
- **Strategy refinement**: Improves decision-making based on results

## Usage

### Basic Integration

```javascript
// Create an enhanced AI controller
const enhancedAI = AIFactory.createEnhancedAI(player);

// The AI will automatically use enhanced logic for all decisions
```

### Configuration

```javascript
// Configure AI behavior
AIConfigurationManager.updateConfig('strategy.aggressiveness', 0.8);
AIConfigurationManager.updateConfig('ai.enablePrediction', true);

// Get current configuration
const aggressiveness = AIConfigurationManager.getConfig('strategy.aggressiveness');
```

### Performance Monitoring

```javascript
// Get performance report
const report = AIPerformanceMonitor.getPerformanceReport();
console.log('Enhanced AI Win Rate:', report.metrics.enhanced.winRate);

// Export performance data
const data = AIPerformanceMonitor.exportPerformanceData();
```

## Configuration Options

### AI Type
- `ENHANCED`: Full enhanced AI system
- `BASIC`: Original basic AI
- `HYBRID`: Combination of both systems

### Strategy Parameters
- `aggressiveness` (0.0-1.0): How aggressive the AI should be
- `riskTolerance` (0.0-1.0): How much risk the AI should take
- `adaptability` (0.0-1.0): How quickly the AI adapts to changes
- `bluffing` (0.0-1.0): How likely the AI is to bluff

### Features
- `enableLearning`: Enable AI learning and adaptation
- `enablePrediction`: Enable opponent move prediction
- `enableThreatAnalysis`: Enable threat assessment
- `fallbackToBasic`: Automatically fall back to basic AI if enhanced fails

## Performance

The enhanced AI system provides significant improvements over the basic AI:

- **Better strategic planning**: More sophisticated round management
- **Improved card evaluation**: Context-aware decision making
- **Predictive capabilities**: Anticipates and counters opponent moves
- **Adaptive behavior**: Learns and improves over time
- **Robust fallbacks**: Graceful degradation when enhanced features fail

## Compatibility

- **Backward compatible**: Automatically falls back to basic AI if needed
- **Progressive enhancement**: Can be enabled/disabled per game
- **Performance monitoring**: Tracks improvements and identifies issues

## Development

### Adding New Strategies

```javascript
// Add new strategy type to StrategicManager
getNewStrategy() {
    return {
        type: 'NEW_STRATEGY',
        priority: 'NEW_PRIORITY',
        riskTolerance: 'MEDIUM',
        cardUsage: 'MODERATE'
    };
}
```

### Extending Card Evaluation

```javascript
// Add new evaluation criteria to EnhancedCardEvaluator
evaluateNewCriteria(card, context) {
    // New evaluation logic
    return score;
}
```

### Custom Predictions

```javascript
// Add new prediction logic to PredictiveAI
predictNewBehavior(opponent, context) {
    // New prediction logic
    return prediction;
}
```

## Troubleshooting

### Common Issues

1. **Enhanced AI not loading**: Check browser console for module loading errors
2. **Performance degradation**: Monitor performance metrics and adjust configuration
3. **Unexpected behavior**: Review AI configuration and adjust parameters

### Debug Mode

```javascript
// Enable debug logging
AIConfigurationManager.updateConfig('performance.logLevel', 'DEBUG');

// Check AI system status
console.log(AIFactory.getAISystemInfo());
```

## Future Enhancements

- **Machine learning integration**: Neural network-based decision making
- **Advanced opponent modeling**: More sophisticated behavior prediction
- **Deck-specific strategies**: Optimized strategies for different deck types
- **Multi-player support**: Enhanced AI for multiple opponents
- **Cloud-based learning**: Shared learning across multiple games

## License

This enhanced AI system is part of the Gwent Classic project and follows the same licensing terms.

## Contributing

Contributions to improve the AI system are welcome. Please ensure all new features include:
- Comprehensive documentation
- Performance testing
- Fallback mechanisms
- Configuration options
