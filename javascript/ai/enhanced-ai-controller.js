/**
 * Enhanced AI Controller - Main AI controller that integrates all AI modules
 */
class EnhancedAIController {
    constructor(player) {
        this.player = player;
        
        // Initialize AI modules
        this.strategicManager = new StrategicManager(player);
        this.gameState = new GameStateAnalyzer(player);
        this.cardEvaluator = new EnhancedCardEvaluator(player, this.gameState);
        this.roundStrategy = new RoundStrategy(player);
        this.predictiveAI = new PredictiveAI(player, this.gameState);
        
        // AI state tracking
        this.currentStrategy = null;
        this.predictionData = null;
        this.lastMove = null;
        this.learningData = {};
    }

    /**
     * Main turn execution method
     */
    async startTurn() {
        try {
            // Step 1: Analyze current game state
            const gameState = this.gameState.analyze();
            
            // Step 2: Determine overall strategy
            this.currentStrategy = this.strategicManager.getGameStrategy();
            
            // Step 3: Predict opponent moves
            this.predictionData = this.predictiveAI.predictAndPlan();
            
            // Step 4: Check if we should pass
            if (this.shouldPass(gameState)) {
                await this.player.passRound();
                return;
            }
            
            // Step 5: Evaluate all possible actions
            const actionEvaluations = this.evaluateAllActions(gameState);
            
            // Step 6: Select and execute best action
            const bestAction = this.selectBestAction(actionEvaluations);
            await this.executeAction(bestAction);
            
            // Step 7: Update AI learning data
            this.updateLearningData(bestAction);
            
        } catch (error) {
            console.error('AI Error:', error);
            // Fallback to basic action
            await this.fallbackAction();
        }
    }

    /**
     * Determine if we should pass this turn
     */
    shouldPass(gameState) {
        // Always pass if opponent passed and we're winning
        if (this.player.opponent().passed && this.player.winning) {
            return true;
        }
        
        // Strategic passing based on game state
        if (this.strategicManager.shouldPass()) {
            return true;
        }
        
        // Round-specific passing
        const roundStrategy = this.roundStrategy.getRoundStrategy(game.roundCount);
        if (this.roundStrategy.shouldPassBasedOnStrategy(game.roundCount)) {
            return true;
        }
        
        // Threat-based passing
        if (this.shouldPassDueToThreats(gameState)) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if we should pass due to threats
     */
    shouldPassDueToThreats(gameState) {
        const threats = this.predictiveAI.threatAnalyzer.assessThreats();
        
        // Pass if we're in critical strategic position
        if (gameState.strategicPosition.position === 'CRITICAL') {
            return true;
        }
        
        // Pass if opponent has overwhelming advantage
        if (gameState.powerAdvantage.opponentAdvantage > 40) {
            return true;
        }
        
        return false;
    }

    /**
     * Evaluate all possible actions
     */
    evaluateAllActions(gameState) {
        const actions = [];
        
        // Evaluate playing cards
        const cardActions = this.evaluateCardActions(gameState);
        actions.push(...cardActions);
        
        // Evaluate leader ability
        if (this.player.leaderAvailable) {
            const leaderAction = this.evaluateLeaderAction(gameState);
            actions.push(leaderAction);
        }
        
        // Evaluate faction ability
        if (this.player.factionAbilityUses > 0) {
            const factionAction = this.evaluateFactionAction(gameState);
            actions.push(factionAction);
        }
        
        // Evaluate passing
        const passAction = this.evaluatePassAction(gameState);
        actions.push(passAction);
        
        return actions;
    }

    /**
     * Evaluate all possible card plays
     */
    evaluateCardActions(gameState) {
        const actions = [];
        const strategy = this.currentStrategy;
        
        this.player.hand.cards.forEach(card => {
            const evaluation = this.cardEvaluator.evaluateCard(card, strategy, {
                gameState: gameState,
                prediction: this.predictionData,
                round: game.roundCount
            });
            
            actions.push({
                type: 'PLAY_CARD',
                card: card,
                evaluation: evaluation,
                action: async () => await this.playCard(card, gameState),
                priority: this.calculateActionPriority(evaluation, card, gameState)
            });
        });
        
        return actions;
    }

    /**
     * Evaluate leader ability usage
     */
    evaluateLeaderAction(gameState) {
        const strategy = this.currentStrategy;
        let weight = 10; // Base weight
        
        // Adjust weight based on strategy
        if (strategy.type === 'AGGRESSIVE') {
            weight += 15;
        } else if (strategy.type === 'DEFENSIVE') {
            weight -= 5;
        }
        
        // Adjust based on game state
        if (gameState.strategicPosition.position === 'CRITICAL') {
            weight += 20;
        }
        
        return {
            type: 'LEADER_ABILITY',
            weight: weight,
            action: async () => {
                await ui.notification("op-leader", 1200);
                await this.player.activateLeader();
            },
            priority: this.calculateActionPriority({ score: weight }, null, gameState)
        };
    }

    /**
     * Evaluate faction ability usage
     */
    evaluateFactionAction(gameState) {
        const factionAbility = factions[this.player.deck.faction];
        let weight = factionAbility.weight ? factionAbility.weight(this.player) : 10;
        
        // Adjust based on strategy
        if (this.currentStrategy.type === 'AGGRESSIVE') {
            weight += 10;
        }
        
        return {
            type: 'FACTION_ABILITY',
            weight: weight,
            action: async () => {
                await this.player.useFactionAbility();
            },
            priority: this.calculateActionPriority({ score: weight }, null, gameState)
        };
    }

    /**
     * Evaluate passing action
     */
    evaluatePassAction(gameState) {
        let weight = this.strategicManager.weightPass();
        
        // Adjust based on prediction data
        if (this.predictionData && this.predictionData.predictedMove.bluffing) {
            weight += 20; // More likely to pass if opponent is bluffing
        }
        
        return {
            type: 'PASS',
            weight: weight,
            action: async () => await this.player.passRound(),
            priority: this.calculateActionPriority({ score: weight }, null, gameState)
        };
    }

    /**
     * Calculate action priority based on multiple factors
     */
    calculateActionPriority(evaluation, card, gameState) {
        let priority = evaluation.score;
        
        // Adjust priority based on current strategy
        if (this.currentStrategy) {
            priority += this.getStrategyPriorityBonus(card, this.currentStrategy);
        }
        
        // Adjust priority based on predictions
        if (this.predictionData) {
            priority += this.getPredictionPriorityBonus(card, this.predictionData);
        }
        
        // Adjust priority based on game state
        priority += this.getGameStatePriorityBonus(card, gameState);
        
        // Adjust priority based on round
        priority += this.getRoundPriorityBonus(card, game.roundCount);
        
        return Math.max(0, priority);
    }

    /**
     * Get priority bonus based on strategy
     */
    getStrategyPriorityBonus(card, strategy) {
        if (!card) return 0;
        
        switch (strategy.type) {
            case 'AGGRESSIVE':
                if (card.isUnit() && card.power > 8) return 15;
                if (card.abilities.includes('scorch')) return 20;
                break;
            case 'DEFENSIVE':
                if (card.abilities.includes('shield')) return 25;
                if (card.abilities.includes('clear')) return 20;
                break;
            case 'CONTROL':
                if (card.abilities.includes('weather')) return 20;
                if (card.abilities.includes('spy')) return 30;
                break;
        }
        
        return 0;
    }

    /**
     * Get priority bonus based on predictions
     */
    getPredictionPriorityBonus(card, predictionData) {
        if (!card) return 0;
        
        let bonus = 0;
        
        // Bonus for cards that counter predicted threats
        if (predictionData.predictedMove.cardTypes.units > 3 && card.abilities.includes('scorch')) {
            bonus += 15;
        }
        
        if (predictionData.predictedMove.cardTypes.weather > 0 && card.abilities.includes('clear')) {
            bonus += 20;
        }
        
        // Bonus for cards that align with predicted timing
        if (predictionData.predictedMove.timing === 'EARLY_AGGRESSIVE' && card.isUnit()) {
            bonus += 10;
        }
        
        return bonus;
    }

    /**
     * Get priority bonus based on game state
     */
    getGameStatePriorityBonus(card, gameState) {
        if (!card) return 0;
        
        let bonus = 0;
        
        // Bonus for weather clear when weather is active
        if (card.abilities.includes('clear') && gameState.boardState.weatherEffects.active.length > 0) {
            bonus += 25;
        }
        
        // Bonus for high-power cards when we're behind
        if (gameState.powerAdvantage.opponentAdvantage > 20 && card.isUnit() && card.power > 8) {
            bonus += 15;
        }
        
        return bonus;
    }

    /**
     * Get priority bonus based on round
     */
    getRoundPriorityBonus(card, round) {
        if (!card) return 0;
        
        let bonus = 0;
        
        if (round === 1) {
            // First round: prefer establishing presence
            if (card.abilities.includes('muster')) bonus += 15;
            if (card.isUnit() && card.power > 6) bonus += 10;
        } else if (round === 2) {
            // Second round: prefer flexible cards
            if (card.row === 'agile') bonus += 10;
            if (card.abilities.includes('medic')) bonus += 15;
        } else if (round === 3) {
            // Third round: prefer high-impact cards
            if (card.power > 8) bonus += 15;
            if (card.abilities.includes('scorch')) bonus += 20;
        }
        
        return bonus;
    }

    /**
     * Select the best action from evaluations
     */
    selectBestAction(actionEvaluations) {
        // Sort by priority (highest first)
        actionEvaluations.sort((a, b) => b.priority - a.priority);
        
        // Add some randomness to avoid being too predictable
        const topActions = actionEvaluations.slice(0, 3);
        const randomFactor = Math.random();
        
        if (randomFactor < 0.7) {
            // 70% chance to pick the best action
            return topActions[0];
        } else if (randomFactor < 0.9) {
            // 20% chance to pick the second best action
            return topActions[1] || topActions[0];
        } else {
            // 10% chance to pick the third best action
            return topActions[2] || topActions[0];
        }
    }

    /**
     * Execute the selected action
     */
    async executeAction(action) {
        try {
            await action.action();
            this.lastMove = action;
        } catch (error) {
            console.error('Failed to execute action:', error);
            await this.fallbackAction();
        }
    }

    /**
     * Fallback action when main logic fails
     */
    async fallbackAction() {
        // Simple fallback: play the first playable card or pass
        const playableCards = this.player.hand.cards.filter(c => c.isUnit());
        
        if (playableCards.length > 0) {
            await this.player.playCard(playableCards[0]);
        } else {
            await this.player.passRound();
        }
    }

    /**
     * Play a card with enhanced logic
     */
    async playCard(card, gameState) {
        // Use existing card playing logic but with enhanced targeting
        if (card.key === "spe_horn") {
            await this.enhancedHorn(card);
        } else if (card.abilities.includes("decoy")) {
            await this.enhancedDecoy(card, gameState);
        } else if (card.abilities.includes("scorch")) {
            await this.enhancedScorch(card, gameState);
        } else {
            await this.player.playCard(card);
        }
    }

    /**
     * Enhanced horn placement
     */
    async enhancedHorn(card) {
        const rows = this.player.getAllRows().filter(r => !r.special.containsCardByKey("spe_horn"));
        let bestRow = rows[0];
        let bestScore = -1;
        
        rows.forEach(row => {
            const score = this.calculateHornScore(row);
            if (score > bestScore) {
                bestScore = score;
                bestRow = row;
            }
        });
        
        await this.player.playCardToRow(card, bestRow);
    }

    /**
     * Calculate horn placement score
     */
    calculateHornScore(row) {
        const units = row.cards.filter(c => c.isUnit());
        if (units.length === 0) return 0;
        
        let score = units.reduce((sum, c) => sum + c.power, 0);
        
        // Bonus for rows with many units
        score += units.length * 5;
        
        // Bonus for rows without weather
        if (!row.effects.weather) score += 10;
        
        return score;
    }

    /**
     * Enhanced decoy usage
     */
    async enhancedDecoy(card, gameState) {
        // Use predictive AI to choose the best target
        const possibleTargets = this.getDecoyTargets(card);
        
        if (possibleTargets.length > 0) {
            const targetEvaluations = this.cardEvaluator.evaluateTargets(card, possibleTargets);
            if (targetEvaluations && targetEvaluations.length > 0) {
                const bestTarget = targetEvaluations[0].target;
                await this.executeDecoy(card, bestTarget);
                return;
            }
        }
        
        // Fallback to basic decoy logic
        await this.player.playCard(card);
    }

    /**
     * Get possible decoy targets
     */
    getDecoyTargets(card) {
        const targets = [];
        
        // Get targets from our rows
        this.player.getAllRows().forEach(row => {
            row.cards.forEach(c => {
                if (c.isUnit() && !c.isLocked()) {
                    targets.push(c);
                }
            });
        });
        
        return targets;
    }

    /**
     * Execute decoy action
     */
    async executeDecoy(card, target) {
        // Find the row containing the target
        let targetRow = null;
        this.player.getAllRows().forEach(row => {
            if (row.cards.includes(target)) {
                targetRow = row;
            }
        });
        
        if (targetRow) {
            target.decoyTarget = true;
            setTimeout(() => board.toHand(target, targetRow), 1000);
            await this.player.playCardToRow(card, targetRow);
        } else {
            await this.player.playCard(card);
        }
    }

    /**
     * Enhanced scorch usage
     */
    async enhancedScorch(card, gameState) {
        // Use predictive AI to choose the best target
        const possibleTargets = this.getScorchTargets();
        
        if (possibleTargets.length > 0) {
            const targetEvaluations = this.cardEvaluator.evaluateTargets(card, possibleTargets);
            if (targetEvaluations && targetEvaluations.length > 0) {
                const bestTarget = targetEvaluations[0].target;
                await this.executeScorch(card, bestTarget);
                return;
            }
        }
        
        // Fallback to basic scorch logic
        await this.player.playScorch(card);
    }

    /**
     * Get possible scorch targets
     */
    getScorchTargets() {
        const targets = [];
        
        // Get targets from opponent rows
        this.player.opponent().getAllRows().forEach(row => {
            row.cards.forEach(c => {
                if (c.isUnit() && !c.isLocked() && !c.abilities.includes('shield')) {
                    targets.push(c);
                }
            });
        });
        
        return targets;
    }

    /**
     * Execute scorch action
     */
    async executeScorch(card, target) {
        // This would need to be implemented based on the game's scorch mechanics
        await this.player.playScorch(card);
    }

    /**
     * Update AI learning data
     */
    updateLearningData(action) {
        if (!this.learningData[action.type]) {
            this.learningData[action.type] = [];
        }
        
        this.learningData[action.type].push({
            action: action,
            timestamp: Date.now(),
            gameState: this.gameState.analyze(),
            strategy: this.currentStrategy
        });
        
        // Keep only recent data
        if (this.learningData[action.type].length > 100) {
            this.learningData[action.type] = this.learningData[action.type].slice(-50);
        }
    }

    /**
     * Get AI performance statistics
     */
    getPerformanceStats() {
        return {
            totalActions: Object.values(this.learningData).reduce((sum, actions) => sum + actions.length, 0),
            actionTypes: Object.keys(this.learningData).reduce((acc, type) => {
                acc[type] = this.learningData[type].length;
                return acc;
            }, {}),
            currentStrategy: this.currentStrategy,
            predictionConfidence: this.predictionData ? this.predictionData.confidence : 0
        };
    }
}
