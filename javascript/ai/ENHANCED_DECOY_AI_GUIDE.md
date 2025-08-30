# Enhanced Decoy AI Guide

## 🎭 **Overview**

The AI has been significantly enhanced to use **Decoy cards strategically and intelligently**, making it much more challenging and realistic. The AI now considers multiple factors when deciding whether and how to use Decoy, including timing, target selection, and strategic value.

## 🎯 **Key Improvements**

### **1. Strategic Priority**
- **Decoy is now a high-priority card** - AI checks for Decoy opportunities before other cards
- **Only uses Decoy when opportunity score ≥ 0.6** - Prevents wasteful usage
- **Comprehensive opportunity analysis** - Evaluates all possible targets and scenarios

### **2. Intelligent Target Selection**
- **Our units**: High-value units, ability reuse, synergy potential
- **Opponent units**: Disruption, stealing value, breaking combos
- **Combo potential**: Medic chains, spy value extraction, replay value
- **Round management**: Saving valuable units for later rounds
- **Weather protection**: Saving units from weather damage

### **3. Advanced Timing Logic**
- **Immediate threats**: High priority when units are at risk
- **Strategic timing**: Optimal moments based on game state
- **Round-based decisions**: Different strategies for each round
- **Strategy adaptation**: Adjusts based on current focus (tempo/control/survival)

## 🧠 **How It Works**

### **Decision Flow**
```
1. Check if Decoy is in hand
2. Analyze all possible targets (our units, opponent units, combos)
3. Score each opportunity (0.0 to 1.0)
4. Only use if best opportunity ≥ 0.6
5. Log strategic reasoning for transparency
```

### **Opportunity Scoring System**
- **Base Score**: Power value, ability value, strategic value
- **Bonus Factors**: Round timing, weather protection, combo potential
- **Strategy Bonuses**: Control strategy, tempo strategy, survival focus
- **Threat Assessment**: Immediate danger, opponent aggression

## 🎲 **Decoy Usage Scenarios**

### **Scenario 1: Protecting Our Units**
```javascript
// High-value unit in danger
if (unit.power >= 8 && hasWeather) {
    score += 0.5; // Weather protection
    score += 0.3; // High power value
    reason = 'Protect high-value unit from weather';
}
```

### **Scenario 2: Disrupting Opponent**
```javascript
// Stealing opponent spy value
if (opponentUnit.abilities.includes('spy')) {
    score += 0.6; // High value for stealing spy
    reason = 'Steal spy value from opponent';
}

// Breaking tight bond combos
if (opponentUnit.abilities.includes('tight_bond')) {
    score += 0.5; // Disrupt synergy
    reason = 'Disrupt tight bond combo';
}
```

### **Scenario 3: Combo Potential**
```javascript
// Medic chain potential
if (hasMedicInHand && unit.power >= 6) {
    score += 0.4; // Medic combo value
    reason = 'Medic combo potential';
}

// Spy value extraction
if (hasSpyInHand && unit.abilities.includes('spy')) {
    score += 0.5; // Spy combo value
    reason = 'Spy combo potential';
}
```

### **Scenario 4: Round Management**
```javascript
// Round 1: Save valuable units
if (round === 1 && unit.power >= 8) {
    score += 0.4; // Save for later
    reason = 'Save high-value unit for final round';
}

// Round 2: Catch up when behind
if (round === 2 && powerAdvantage < -15) {
    score += 0.3; // Need to catch up
    reason = 'Need power to catch up';
}
```

### **Scenario 5: Weather Protection**
```javascript
// Immediate weather threat
if (hasWeather && unit.power > 1) {
    score += 0.5; // Protect from damage
    reason = 'Protect unit from weather damage';
}

// High-value weather protection
if (hasWeather && unit.power >= 6) {
    score += 0.3; // Additional value for high-power
    reason = 'High-value weather protection';
}
```

## 📊 **Scoring Breakdown**

### **Our Units Scoring**
```javascript
// Base power value
if (unit.power >= 8) score += 0.3;

// Ability reuse value
if (unit.abilities.includes('medic')) score += 0.4;
if (unit.abilities.includes('spy')) score += 0.5;
if (unit.abilities.includes('muster')) score += 0.3;
if (unit.abilities.includes('tight_bond')) score += 0.2;

// Strategy bonuses
if (strategy.focus === 'tempo' && unit.power > 6) score += 0.2;
if (strategy.focus === 'control' && hasValuableAbility) score += 0.3;

// Round considerations
if (round === 1) score += 0.1; // More valuable early
```

### **Opponent Units Scoring**
```javascript
// Power value
if (unit.power >= 8) score += 0.4;

// Disruption value
if (unit.abilities.includes('tight_bond')) score += 0.5;
if (unit.abilities.includes('muster')) score += 0.4;
if (unit.abilities.includes('spy')) score += 0.6;

// Strategy bonus
if (strategy.focus === 'control') score += 0.2;
```

### **Combo Potential Scoring**
```javascript
// Medic combo
if (hasMedicInHand && unit.power >= 6) score += 0.4;

// Spy combo
if (hasSpyInHand && unit.abilities.includes('spy')) score += 0.5;

// Replay value
if (unit.power >= 10) score += 0.3;
```

## 🎮 **Console Logs**

When the AI uses Decoy strategically, you'll see detailed reasoning:

```
🎭 AI using Decoy strategically: Protect high-value unit from weather
🎭 AI using Decoy strategically: Steal spy value from opponent
🎭 AI using Decoy strategically: Medic combo potential
🎭 AI using Decoy strategically: Save high-value unit for final round
🎭 AI using Decoy strategically: Disrupt tight bond combo
```

## 🚀 **Performance Benefits**

### **Before Enhancement**
- **Random Usage**: AI used Decoy without strategic consideration
- **Wasted Opportunities**: Missed valuable Decoy targets
- **Poor Timing**: Used Decoy at suboptimal moments
- **No Reasoning**: Couldn't explain why it used Decoy

### **After Enhancement**
- **Strategic Usage**: AI only uses Decoy when it makes sense
- **Value Maximization**: Always targets the best opportunity
- **Optimal Timing**: Uses Decoy at the right moment
- **Clear Reasoning**: Logs why each Decoy usage was strategic

## 🔧 **Configuration Options**

### **Adjust Decoy Sensitivity**
```javascript
// Make AI more aggressive with Decoy
enhancedAI.decoyThreshold = 0.4; // Lower threshold = more Decoy usage

// Make AI more conservative with Decoy
enhancedAI.decoyThreshold = 0.8; // Higher threshold = less Decoy usage

// Default threshold
enhancedAI.decoyThreshold = 0.6; // Balanced approach
```

### **Enable/Disable Decoy Features**
```javascript
// Disable opponent unit Decoying
enhancedAI.decoyOpponentUnits = false;

// Disable weather protection Decoying
enhancedAI.decoyWeatherProtection = false;

// Focus only on our unit value
enhancedAI.decoyFocus = 'self_only';
```

## 📈 **Advanced Features**

### **Timing Optimization**
```javascript
// Check for immediate threats
const hasThreats = enhancedAI.hasImmediateThreats(gameState);

// Determine optimal timing
const timing = enhancedAI.optimizeDecoyTiming(gameState, strategy);

// Calculate target value
const value = enhancedAI.calculateDecoyValue(target, gameState, strategy);
```

### **Statistics Tracking**
```javascript
// Get Decoy usage statistics
const stats = enhancedAI.getDecoyStatistics();

// Track opportunities vs usage
console.log(`Decoy opportunities: ${stats.totalOpportunities}`);
console.log(`Decoy used: ${stats.opportunitiesUsed}`);
console.log(`Average value: ${stats.averageValue}`);
```

## 🎯 **Strategic Examples**

### **Example 1: Weather Protection**
```
Situation: Frost weather on melee row, we have 8-power unit
AI Decision: Use Decoy to save unit
Reasoning: "Protect high-value unit from weather"
Score: 0.8 (high priority)
```

### **Example 2: Opponent Disruption**
```
Situation: Opponent has tight bond combo on board
AI Decision: Use Decoy to steal one unit
Reasoning: "Disrupt tight bond combo"
Score: 0.7 (medium-high priority)
```

### **Example 3: Combo Setup**
```
Situation: We have medic in hand, valuable unit on board
AI Decision: Use Decoy to set up medic chain
Reasoning: "Medic combo potential"
Score: 0.6 (threshold met)
```

### **Example 4: Round Management**
```
Situation: Round 1, we have 10-power unit
AI Decision: Use Decoy to save for later
Reasoning: "Save high-value unit for final round"
Score: 0.7 (medium-high priority)
```

## 🎭 **Human-Like Behavior**

The enhanced Decoy AI also includes **randomization and unpredictability**:

- **Sometimes holds Decoy** even when opportunity exists (15% chance)
- **Makes suboptimal Decoy choices** occasionally (like humans do)
- **Timing variations** based on AI mood and personality
- **Strategic inconsistency** for more realistic opponent behavior

## 🚀 **Expected Results**

### **For Players**
- **More Challenging**: AI uses Decoy much more intelligently
- **Strategic Depth**: Can't predict when AI will use Decoy
- **Realistic Opponent**: AI behaves like a skilled human player
- **Learning Opportunity**: See how Decoy should be used strategically

### **For AI Performance**
- **Better Win Rate**: More strategic card usage
- **Resource Efficiency**: Gets maximum value from Decoy
- **Adaptive Strategy**: Adjusts Decoy usage based on game state
- **Combo Execution**: Successfully sets up and executes Decoy combos

## 🎯 **Conclusion**

The enhanced Decoy AI transforms the game by:

✅ **Strategic Usage** - Only uses Decoy when it makes sense  
✅ **Value Maximization** - Always targets the best opportunity  
✅ **Intelligent Timing** - Uses Decoy at optimal moments  
✅ **Combo Recognition** - Identifies and sets up Decoy combos  
✅ **Opponent Disruption** - Strategically steals and disrupts  
✅ **Weather Protection** - Saves units from environmental damage  
✅ **Round Management** - Saves valuable units for later rounds  

This makes the AI a **much more challenging and realistic opponent** that truly understands the strategic value of Decoy cards! 🎭✨

The AI will now use Decoy like a **skilled human player** - protecting valuable units, disrupting opponent strategies, setting up combos, and maximizing value in every situation! 🎮
