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
     * Main AI turn logic - enhanced with complex ability handling
     */
    async takeTurn() {
        const gameState = this.analyzer.analyzeGameState();
        const strategy = this.strategyManager.getRoundStrategy(gameState.roundNumber);
        
        // Check for faction abilities first
        if (await this.handleFactionAbilities(gameState)) {
            return;
        }

        // Check for complex abilities that require special handling
        const complexAbilityCard = this.findComplexAbilityCard();
        if (complexAbilityCard) {
            const abilityName = this.getComplexAbilityName(complexAbilityCard);
            if (await this.handleComplexAbility(complexAbilityCard, abilityName)) {
                return;
            }
        }

        // Check if we should pass
        if (this.shouldPass(gameState, strategy)) {
            await this.pass();
            return;
        }

        // Find the best card to play
        const bestCard = this.findBestCardToPlay(gameState, strategy);
        if (bestCard) {
            await this.playCard(bestCard, gameState);
        } else {
            // If no good card, pass
            await this.pass();
        }
    }

    /**
     * Find cards with complex abilities that require special handling
     */
    findComplexAbilityCard() {
        const complexAbilities = [
            'alzur_maker', 'anna_henrietta_duchess', 'meve_princess', 
            'carlo_varese', 'cyrus_hemmelfart', 'anna_henrietta_ladyship',
            'baal_zebuth', 'lyria_rivia_morale'
        ];
        
        return this.player.hand.cards.find(card => 
            complexAbilities.some(ability => 
                card.abilities.includes(ability) || 
                (card.card && card.card.ability && complexAbilities.includes(card.card.ability))
            )
        );
    }

    /**
     * Get the complex ability name from a card
     */
    getComplexAbilityName(card) {
        const complexAbilities = [
            'alzur_maker', 'anna_henrietta_duchess', 'meve_princess', 
            'carlo_varese', 'cyrus_hemmelfart', 'anna_henrietta_ladyship',
            'baal_zebuth', 'lyria_rivia_morale'
        ];
        
        // Check card abilities first
        for (const ability of complexAbilities) {
            if (card.abilities.includes(ability)) {
                return ability;
            }
        }
        
        // Check card's main ability
        if (card.card && card.card.ability && complexAbilities.includes(card.card.ability)) {
            return card.card.ability;
        }
        
        return null;
    }

    /**
     * Enhanced card evaluation that considers complex abilities
     */
    evaluateCard(card, gameState, strategy) {
        let score = this.cardEvaluator.evaluateCard(card, gameState);
        
        // Bonus for complex abilities that can be handled
        if (this.canHandleComplexAbility(card)) {
            score += 25; // Significant bonus for strategic abilities
        }
        
        // Bonus for weather cards (now with strategic placement)
        if (this.isWeatherCard(card)) {
            score += this.evaluateWeatherPlacement(card, gameState);
        }
        
        // Bonus for medic cards (now with strategic targeting)
        if (card.abilities.includes("medic")) {
            score += this.evaluateMedicTargeting(card, gameState);
        }
        
        return score;
    }

    /**
     * Check if AI can handle a complex ability
     */
    canHandleComplexAbility(card) {
        const complexAbilities = [
            'alzur_maker', 'anna_henrietta_duchess', 'meve_princess', 
            'carlo_varese', 'cyrus_hemmelfart', 'anna_henrietta_ladyship',
            'baal_zebuth', 'lyria_rivia_morale'
        ];
        
        return complexAbilities.some(ability => 
            card.abilities.includes(ability) || 
            (card.card && card.card.ability && complexAbilities.includes(card.card.ability))
        );
    }

    /**
     * Check if card is a weather card
     */
    isWeatherCard(card) {
        return card.abilities.includes("frost") || 
               card.abilities.includes("fog") || 
               card.abilities.includes("rain") ||
               card.abilities.includes("clear");
    }

    /**
     * Evaluate weather placement strategy
     */
    evaluateWeatherPlacement(card, gameState) {
        const weatherType = this.getWeatherType(card);
        const opponentRows = this.player.opponent().getAllRows();
        
        if (opponentRows.length === 0) return 0;
        
        // Find the most impactful row
        const maxImpact = Math.max(...opponentRows.map(row => 
            this.calculateWeatherImpact(row, weatherType)
        ));
        
        return Math.min(maxImpact * 2, 50); // Cap at 50 bonus points
    }

    /**
     * Evaluate medic targeting strategy
     */
    evaluateMedicTargeting(card, gameState) {
        const grave = this.player.grave;
        const units = grave.findCards(c => c.isUnit());
        
        if (units.length === 0) return 0;
        
        // Find the best target
        const bestTarget = units.sort((a, b) => {
            const aValue = this.calculateMedicTargetValue(a, gameState);
            const bValue = this.calculateMedicTargetValue(b, gameState);
            return bValue - aValue;
        })[0];
        
        return bestTarget ? this.calculateMedicTargetValue(bestTarget, gameState) : 0;
    }

    /**
     * Enhanced card playing with complex ability handling
     */
    async playCard(card, gameState) {
        // Handle complex abilities first
        if (this.canHandleComplexAbility(card)) {
            const abilityName = this.getComplexAbilityName(card);
            if (await this.handleComplexAbility(card, abilityName)) {
                // Remove card from hand after successful ability use
                await board.toGrave(card, this.player.hand);
                return;
            }
        }
        
        // Handle weather cards strategically
        if (this.isWeatherCard(card)) {
            if (await this.handleWeatherPlacement(card, gameState)) {
                return;
            }
        }
        
        // Handle medic cards strategically
        if (card.abilities.includes("medic")) {
            if (await this.handleMedicAbility(card, gameState)) {
                // Remove card from hand after successful medic use
                await board.toGrave(card, this.player.hand);
                return;
            }
        }
        
        // Default card playing logic
        await this.playCardNormally(card, gameState);
    }

    /**
     * Default card playing logic for non-complex cards
     */
    async playCardNormally(card, gameState) {
        // Determine best row placement
        const targetRow = this.findBestRowForCard(card, gameState);
        
        if (targetRow) {
            await board.addCardToRow(card, targetRow, this.player);
        } else {
            // Fallback: play in default row
            await board.addCardToRow(card, board.getRow(card, card.row, this.player), this.player);
        }
    }

    /**
     * Find the best row for a card
     */
    findBestRowForCard(card, gameState) {
        if (!card.isUnit()) return null;
        
        const rows = this.player.getAllRows();
        const targetRow = rows.find(row => row.type === card.row);
        
        if (targetRow) {
            // Check if this row has synergy with the card
            const synergy = this.calculateRowSynergy(card, targetRow);
            if (synergy > 0) {
                return targetRow;
            }
        }
        
        return targetRow;
    }

    /**
     * Calculate synergy between a card and a row
     */
    calculateRowSynergy(card, row) {
        let synergy = 0;
        
        // Bonus for tight bond
        if (card.abilities.includes("tight_bond")) {
            const bondCards = row.cards.filter(c => c.abilities.includes("tight_bond"));
            synergy += bondCards.length * 10;
        }
        
        // Bonus for muster
        if (card.abilities.includes("muster")) {
            const musterCards = row.cards.filter(c => c.abilities.includes("muster"));
            synergy += musterCards.length * 8;
        }
        
        // Bonus for same faction
        const factionCards = row.cards.filter(c => c.faction === card.faction);
        synergy += factionCards.length * 3;
        
        return synergy;
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

    /**
     * Update adaptation data for future decisions
     */
    updateAdaptationData(gameState, strategy, playedCard) {
        const adaptation = {
            timestamp: Date.now(),
            strategy: strategy,
            gameState: gameState,
            playedCard: playedCard,
            outcome: 'pending'
        };
        
        this.adaptationData[Date.now()] = adaptation;
        
        // Keep only recent adaptation data (last 10 turns)
        const keys = Object.keys(this.adaptationData).sort((a, b) => b - a);
        if (keys.length > 10) {
            keys.slice(10).forEach(key => delete this.adaptationData[key]);
        }
    }

    /**
     * Calculate weather impact on the board
     */
    calculateWeatherImpact(weatherEffects, boardState) {
        let impact = 0;
        
        weatherEffects.forEach(weather => {
            const row = weather.row;
            const rowData = boardState.myRows[row] || boardState.theirRows[row];
            
            if (rowData && rowData.units) {
                const affectedUnits = rowData.units.filter(unit => 
                    !unit.abilities.includes('hero') && !unit.abilities.includes('gold')
                );
                
                // Calculate power reduction from weather
                const powerReduction = affectedUnits.reduce((total, unit) => {
                    if (weather.type === 'frost' && row === 'melee') {
                        return total + Math.min(unit.power, 1);
                    } else if (weather.type === 'fog' && row === 'ranged') {
                        return total + Math.min(unit.power, 1);
                    } else if (weather.type === 'rain' && row === 'siege') {
                        return total + Math.min(unit.power, 1);
                    }
                    return total;
                }, 0);
                
                impact -= powerReduction;
            }
        });
        
        return impact;
    }

    /**
     * Calculate special card value on the board
     */
    calculateSpecialCardValue(specialCards, boardState) {
        let value = 0;
        
        // Count special cards by type
        const specialCounts = {
            weather: 0,
            clear: 0,
            horn: 0,
            scorch: 0,
            decoy: 0,
            medic: 0
        };
        
        specialCards.forEach(card => {
            if (card.abilities.includes('fog') || card.abilities.includes('rain') || card.abilities.includes('frost')) {
                specialCounts.weather++;
            } else if (card.abilities.includes('clear_weather')) {
                specialCounts.clear++;
            } else if (card.abilities.includes('horn')) {
                specialCounts.horn++;
            } else if (card.abilities.includes('scorch')) {
                specialCounts.scorch++;
            } else if (card.abilities.includes('decoy')) {
                specialCounts.decoy++;
            } else if (card.abilities.includes('medic')) {
                specialCounts.medic++;
            }
        });
        
        // Calculate strategic value
        value += specialCounts.weather * 0.3; // Weather control
        value += specialCounts.clear * 0.4;   // Weather removal
        value += specialCounts.horn * 0.6;    // Power boost
        value += specialCounts.scorch * 0.5;  // Removal
        value += specialCounts.decoy * 0.3;   // Utility
        value += specialCounts.medic * 0.4;   // Revival
        
        return value;
    }

    /**
     * Enhanced complex ability handling with game state and strategy
     */
    async handleComplexAbility(card, abilityName, gameState, strategy) {
        // Enhanced ability handling with context awareness
        switch (abilityName) {
            case 'alzur_maker':
                return await this.handleAlzurMakerEnhanced(card, gameState, strategy);
            case 'anna_henrietta_duchess':
                return await this.handleAnnaHenriettaDuchessEnhanced(card, gameState, strategy);
            case 'meve_princess':
                return await this.handleMevePrincessEnhanced(card, gameState, strategy);
            case 'carlo_varese':
                return await this.handleCarloVareseEnhanced(card, gameState, strategy);
            case 'cyrus_hemmelfart':
                return await this.handleCyrusHemmelfartEnhanced(card, gameState, strategy);
            case 'anna_henrietta_ladyship':
                return await this.handleAnnaHenriettaLadyshipEnhanced(card, gameState, strategy);
            case 'baal_zebuth':
                return await this.handleBaalZebuthEnhanced(card, gameState, strategy);
            case 'lyria_rivia_morale':
                return await this.handleLyriaRiviaMoraleEnhanced(card, gameState, strategy);
            default:
                return false;
        }
    }

    /**
     * Enhanced Alzur's Maker with strategic targeting
     */
    async handleAlzurMakerEnhanced(card, gameState, strategy) {
        // Find the best target for destruction based on strategy
        let targetRow = 'melee';
        let targetCard = null;
        
        if (strategy.focus === 'control') {
            // Control strategy: target opponent's strongest row
            const rowStrengths = Object.entries(gameState.boardState.theirRows).map(([row, data]) => ({
                row,
                strength: data.totalPower || 0
            }));
            rowStrengths.sort((a, b) => b.strength - a.strength);
            targetRow = rowStrengths[0].row;
        } else if (strategy.focus === 'tempo') {
            // Tempo strategy: target row with most units for maximum impact
            const rowUnitCounts = Object.entries(gameState.boardState.theirRows).map(([row, data]) => ({
                row,
                unitCount: data.units?.length || 0
            }));
            rowUnitCounts.sort((a, b) => b.unitCount - a.unitCount);
            targetRow = rowUnitCounts[0].row;
        }
        
        // Find lowest power unit in target row
        const targetRowData = gameState.boardState.theirRows[targetRow];
        if (targetRowData && targetRowData.units) {
            targetCard = targetRowData.units.reduce((lowest, unit) => 
                unit.power < lowest.power ? unit : lowest
            );
        }
        
        if (targetCard) {
            // Execute the ability with strategic targeting
            await this.executeStrategicAbility(card, 'alzur_maker', {
                targetRow: targetRow,
                targetCard: targetCard,
                strategy: strategy.focus
            });
            return true;
        }
        
        return false;
    }

    /**
     * Execute strategic ability with enhanced targeting
     */
    async executeStrategicAbility(card, abilityName, context) {
        try {
            // Log strategic decision
            console.log(`🎯 Enhanced AI executing ${abilityName} with strategy: ${context.strategy}`);
            
            // Execute the ability
            if (card.autoplay) {
                await card.autoplay();
            } else if (card.play) {
                await card.play();
            }
            
            // Update learning data
            this.recordAbilityExecution(abilityName, context, true);
            
        } catch (error) {
            console.error(`❌ Error executing ${abilityName}:`, error);
            this.recordAbilityExecution(abilityName, context, false);
        }
    }

    /**
     * Record ability execution for learning
     */
    recordAbilityExecution(abilityName, context, success) {
        if (!this.learningData.abilities) {
            this.learningData.abilities = {};
        }
        
        if (!this.learningData.abilities[abilityName]) {
            this.learningData.abilities[abilityName] = {
                executions: 0,
                successes: 0,
                contexts: [],
                successRate: 0
            };
        }
        
        const abilityData = this.learningData.abilities[abilityName];
        abilityData.executions++;
        if (success) abilityData.successes++;
        abilityData.successRate = abilityData.successes / abilityData.executions;
        abilityData.contexts.push({
            ...context,
            timestamp: Date.now(),
            success: success
        });
        
        // Keep only recent context data
        if (abilityData.contexts.length > 20) {
            abilityData.contexts = abilityData.contexts.slice(-20);
        }
    }
}
