/**
 * Enhanced AI Controller V2 - Integrated Dynamic Strategy, Synergy Recognition, and Game State Analysis
 */
class EnhancedAIControllerV2 {
    constructor(player) {
        this.player = player;
        
        // Store reference to the basic ControllerAI for fallback methods
        this.basicController = null;
        
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
        
        // Enhanced integration state
        this.strategyHistory = [];
        this.synergyCache = new Map();
        this.gameStateHistory = [];
        this.adaptationData = {};
    }
    
    /**
     * Set the basic controller for fallback methods
     */
    setBasicController(controller) {
        this.basicController = controller;
    }

    /**
     * Main AI turn logic - enhanced with integrated systems
     */
    async takeTurn() {
		if (this.player.passed) {
			console.log("⏭️ AI turn skipped (already passed)");
			return;
		}
		// Check if opponent has passed - if we're winning, the round should end
		const opponent = this.player.opponent();
		if (opponent.passed && this.player.winning) {
			// Opponent passed and we're winning - round is over, pass immediately
			console.log("🏁 Opponent passed and AI is winning - ending round");
			await this.pass();
			return;
		}
        // Get comprehensive game state analysis
        const gameState = this.gameState.analyzeGameState();
        this.gameStateHistory.push({...gameState, timestamp: Date.now()});
        
        // Dynamic strategy adaptation based on current game state
        const strategy = this.adaptStrategyDynamically(gameState);
        this.currentStrategy = strategy;
        this.strategyHistory.push({...strategy, timestamp: Date.now()});
        
        // Enhanced synergy analysis with current strategy
        const synergyAnalysis = this.analyzeCardSynergies(gameState, strategy);
        
        // Check for faction abilities first
        if (await this.handleFactionAbilities(gameState)) {
            return;
        }

        // Check for complex abilities that require special handling
        const complexAbilityCard = this.findComplexAbilityCard();
        if (complexAbilityCard) {
            const abilityName = this.getComplexAbilityName(complexAbilityCard);
            if (await this.handleComplexAbility(complexAbilityCard, abilityName, gameState, strategy)) {
                return;
            }
        }

        // Enhanced pass decision with game state analysis
		if (this.shouldPassEnhanced(gameState, strategy, synergyAnalysis)) {
            await this.pass();
            return;
        }

        // Find the best card to play with synergy consideration
        const bestCard = this.findBestCardToPlayEnhanced(gameState, strategy, synergyAnalysis);
        if (bestCard) {
            await this.playCard(bestCard, gameState, strategy);
        } else {
            // If no good card, pass
            await this.pass();
        }
        
        // Update adaptation data for future decisions
        this.updateAdaptationData(gameState, strategy, bestCard);
    }

    /**
     * Dynamic strategy adaptation based on real-time game state
     */
    adaptStrategyDynamically(gameState) {
        const baseStrategy = this.strategicManager.getRoundStrategy(gameState.roundNumber);
        
        // Analyze current board position
        const boardAnalysis = this.analyzeBoardPosition(gameState);
        
        // Analyze opponent behavior patterns
        const opponentAnalysis = this.analyzeOpponentBehavior(gameState);
        
        // Calculate win probability
        const winProbability = this.calculateWinProbability(gameState);
        
        // Add randomization factor for unpredictability (like human players)
        const randomizationFactor = this.calculateRandomizationFactor(gameState);
        
        // Adapt strategy based on analysis with randomization
        let adaptedStrategy = {...baseStrategy};
        
        // Aggressive adaptation with randomization
        if (winProbability > 0.7 && gameState.cardAdvantage > 0) {
            const aggressionBoost = 0.3 + (randomizationFactor * 0.2); // 0.3 to 0.5
            adaptedStrategy.aggressiveness = Math.min(1.0, baseStrategy.aggressiveness + aggressionBoost);
            
            // Sometimes be more aggressive, sometimes less (human-like inconsistency)
            if (randomizationFactor > 0.7) {
                adaptedStrategy.commitmentLevel = 'high';
            } else if (randomizationFactor > 0.4) {
                adaptedStrategy.commitmentLevel = 'medium';
            } else {
                adaptedStrategy.commitmentLevel = 'low'; // Sometimes bluff when winning
            }
        }
        
        // Defensive adaptation with randomization
        if (winProbability < 0.3 || gameState.powerAdvantage < -20) {
            const aggressionReduction = 0.4 + (randomizationFactor * 0.2); // 0.4 to 0.6
            adaptedStrategy.aggressiveness = Math.max(0.0, baseStrategy.aggressiveness - aggressionReduction);
            
            // Sometimes fight back even when losing (human stubbornness)
            if (randomizationFactor > 0.8) {
                adaptedStrategy.focus = 'aggressive'; // Fight back!
            } else {
                adaptedStrategy.focus = 'survival';
            }
            adaptedStrategy.commitmentLevel = 'low';
        }
        
        // Control adaptation with randomization
        if (gameState.weatherEffects && gameState.weatherEffects.length > 0 || 
            gameState.specialCards > 3) {
            // Sometimes ignore weather, sometimes focus on it (human inconsistency)
            if (randomizationFactor > 0.3) {
                adaptedStrategy.focus = 'control';
                adaptedStrategy.weatherPriority = 'high';
            } else {
                adaptedStrategy.focus = 'tempo'; // Ignore weather, go for power
            }
        }
        
        // Tempo adaptation with randomization
        if (boardAnalysis.tempo < -2) {
            // Sometimes try to catch up, sometimes accept the loss
            if (randomizationFactor > 0.4) {
                adaptedStrategy.focus = 'tempo';
                adaptedStrategy.cardValuePriority = 'immediate';
            } else {
                adaptedStrategy.focus = 'survival'; // Accept tempo loss, save resources
            }
        }
        
        // Resource management adaptation with randomization
        if (gameState.cardAdvantage < -1 && gameState.roundNumber < 3) {
            // Sometimes conserve, sometimes spend recklessly (human behavior)
            if (randomizationFactor > 0.6) {
                adaptedStrategy.resourceConservation = 'high';
                adaptedStrategy.commitmentLevel = 'low';
            } else {
                adaptedStrategy.resourceConservation = 'medium';
                adaptedStrategy.commitmentLevel = 'medium'; // Spend some cards
            }
        }
        
        // Add personality-based randomization
        adaptedStrategy = this.applyPersonalityRandomization(adaptedStrategy, randomizationFactor);
        
        return adaptedStrategy;
    }

    /**
     * Calculate randomization factor to make AI less predictable
     */
    calculateRandomizationFactor(gameState) {
        // Base randomization (0.0 to 1.0)
        let factor = Math.random();
        
        // Increase randomization in certain situations
        if (gameState.roundNumber === 1) {
            factor += 0.2; // More random in first round (experimenting)
        }
        
        if (gameState.cardAdvantage > 2) {
            factor += 0.15; // More random when ahead (can afford mistakes)
        }
        
        if (gameState.powerAdvantage > 20) {
            factor += 0.1; // More random when winning big
        }
        
        // Add some "mood" variation (like human players)
        if (!this.playerMood) {
            this.playerMood = Math.random(); // Random mood for this game
        }
        factor += (this.playerMood - 0.5) * 0.2;
        
        return Math.max(0.0, Math.min(1.0, factor));
    }

    /**
     * Apply personality-based randomization to strategy
     */
    applyPersonalityRandomization(strategy, randomizationFactor) {
        // Sometimes make suboptimal choices (like humans do)
        if (randomizationFactor > 0.8) {
            // "Aggressive personality" - sometimes overcommit
            if (strategy.focus === 'survival') {
                strategy.focus = 'tempo';
                strategy.aggressiveness = Math.min(1.0, strategy.aggressiveness + 0.2);
            }
        } else if (randomizationFactor < 0.2) {
            // "Cautious personality" - sometimes undercommit
            if (strategy.focus === 'tempo') {
                strategy.focus = 'survival';
                strategy.aggressiveness = Math.max(0.0, strategy.aggressiveness - 0.2);
            }
        }
        
        // Add some "stubbornness" - sometimes stick to strategy even when it's wrong
        if (randomizationFactor > 0.9) {
            strategy.stubbornness = 'high';
        } else if (randomizationFactor < 0.1) {
            strategy.stubbornness = 'low';
        } else {
            strategy.stubbornness = 'medium';
        }
        
        return strategy;
    }

    /**
     * Enhanced board position analysis
     */
    analyzeBoardPosition(gameState) {
        const analysis = {
            powerAdvantage: gameState.powerAdvantage || 0,
            cardAdvantage: gameState.cardAdvantage || 0,
            rowControl: {},
            weatherImpact: 0,
            specialCardValue: 0,
            tempo: 0
        };
        
        // Analyze row control
        ['melee', 'ranged', 'siege'].forEach(row => {
            const myPower = gameState.boardState?.myRows?.[row]?.totalPower || 0;
            const theirPower = gameState.boardState?.theirRows?.[row]?.totalPower || 0;
            analysis.rowControl[row] = {
                myPower,
                theirPower,
                advantage: myPower - theirPower,
                control: myPower > theirPower ? 'mine' : theirPower > myPower ? 'theirs' : 'neutral'
            };
        });
        
        // Calculate weather impact
        analysis.weatherImpact = this.calculateWeatherImpact(gameState.weatherEffects || [], gameState.boardState || {});
        
        // Calculate special card value
        analysis.specialCardValue = this.calculateSpecialCardValue(gameState.specialCards || [], gameState.boardState || {});
        
        // Calculate tempo (rate of power gain)
        if (this.gameStateHistory.length >= 2) {
            const recent = this.gameStateHistory.slice(-2);
            analysis.tempo = (recent[1].powerAdvantage - recent[0].powerAdvantage) / 2;
        }
        
        return analysis;
    }

    /**
     * Analyze opponent behavior patterns
     */
    analyzeOpponentBehavior(gameState) {
        const analysis = {
            playStyle: 'unknown',
            aggressionLevel: 0,
            weatherUsage: 0,
            specialCardUsage: 0,
            passPattern: 'unknown'
        };
        
        if (this.gameStateHistory.length < 3) return analysis;
        
        const recentHistory = this.gameStateHistory.slice(-3);
        
        // Analyze play style
        const powerChanges = recentHistory.map((state, i) => 
            i > 0 ? (state.powerAdvantage || 0) - (recentHistory[i-1].powerAdvantage || 0) : 0
        );
        
        const avgPowerChange = powerChanges.reduce((sum, change) => sum + change, 0) / powerChanges.length;
        analysis.aggressionLevel = Math.max(0, Math.min(1, (avgPowerChange + 10) / 20));
        
        if (analysis.aggressionLevel > 0.7) analysis.playStyle = 'aggressive';
        else if (analysis.aggressionLevel < 0.3) analysis.playStyle = 'defensive';
        else analysis.playStyle = 'balanced';
        
        // Analyze weather usage
        const weatherChanges = recentHistory.map((state, i) => 
            i > 0 ? (state.weatherEffects?.length || 0) - (recentHistory[i-1].weatherEffects?.length || 0) : 0
        );
        analysis.weatherUsage = weatherChanges.reduce((sum, change) => sum + change, 0);
        
        // Analyze special card usage
        const specialChanges = recentHistory.map((state, i) => 
            i > 0 ? (state.specialCards || 0) - (recentHistory[i-1].specialCards || 0) : 0
        );
        analysis.specialCardUsage = specialChanges.reduce((sum, change) => sum + change, 0);
        
        return analysis;
    }

    /**
     * Calculate win probability based on current game state
     */
    calculateWinProbability(gameState) {
        let probability = 0.5; // Base 50% chance
        
        // Power advantage factor
        if (gameState.powerAdvantage > 30) probability += 0.3;
        else if (gameState.powerAdvantage > 15) probability += 0.2;
        else if (gameState.powerAdvantage < -30) probability -= 0.3;
        else if (gameState.powerAdvantage < -15) probability -= 0.2;
        
        // Card advantage factor
        if (gameState.cardAdvantage > 2) probability += 0.2;
        else if (gameState.cardAdvantage > 1) probability += 0.1;
        else if (gameState.cardAdvantage < -2) probability -= 0.2;
        else if (gameState.cardAdvantage < -1) probability -= 0.1;
        
        // Round factor
        if (gameState.roundNumber === 3) {
            // Final round - power advantage matters more
            if (gameState.powerAdvantage > 0) probability += 0.1;
            else probability -= 0.1;
        } else if (gameState.roundNumber === 2) {
            // Second round - card advantage matters more
            if (gameState.cardAdvantage > 0) probability += 0.1;
            else probability -= 0.1;
        }
        
        // Weather factor
        if (gameState.weatherEffects && gameState.weatherEffects.length > 0) {
            const weatherImpact = this.calculateWeatherImpact(gameState.weatherEffects, gameState.boardState || {});
            if (weatherImpact > 0) probability += 0.1;
            else if (weatherImpact < 0) probability -= 0.1;
        }
        
        return Math.max(0.05, Math.min(0.95, probability));
    }

    /**
     * Enhanced card synergy analysis with strategy consideration
     */
    analyzeCardSynergies(gameState, strategy) {
        const analysis = {
            immediateCombos: [],
            potentialCombos: [],
            synergyGroups: [],
            optimalPlayOrder: [],
            synergyScore: 0
        };
        
        const hand = this.player.hand?.cards || [];
        const board = gameState.boardState?.myRows || {};
        
        // Find immediate combos (cards that can be played together)
        for (let i = 0; i < hand.length; i++) {
            for (let j = i + 1; j < hand.length; j++) {
                const synergy = this.calculateCardSynergy(hand[i], hand[j], board, strategy);
                if (synergy.score > 0.3) {
                    analysis.immediateCombos.push({
                        cards: [hand[i], hand[j]],
                        synergy: synergy,
                        playOrder: synergy.playOrder
                    });
                }
            }
        }
        
        // Find potential combos (cards that work well with what's on board)
        hand.forEach(card => {
            const boardSynergy = this.calculateBoardSynergy(card, board, strategy);
            if (boardSynergy.score > 0.2) {
                analysis.potentialCombos.push({
                    card: card,
                    synergy: boardSynergy,
                    targetRow: boardSynergy.targetRow
                });
            }
        });
        
        // Group cards by synergy type
        analysis.synergyGroups = this.groupCardsBySynergy(hand, strategy);
        
        // Calculate optimal play order
        analysis.optimalPlayOrder = this.calculateOptimalPlayOrder(hand, board, strategy);
        
        // Calculate overall synergy score
        analysis.synergyScore = this.calculateOverallSynergyScore(analysis);
        
        return analysis;
    }

    /**
     * Calculate synergy between two cards
     */
    calculateCardSynergy(card1, card2, board, strategy) {
        let score = 0;
        let playOrder = [card1, card2];
        let reason = '';
        
        // Check for tight bond
        if (card1.abilities && card1.abilities.includes('tight_bond') && 
            card2.abilities && card2.abilities.includes('tight_bond')) {
            if (card1.name === card2.name) {
                score += 0.8;
                reason = 'Tight bond combo';
            }
        }
        
        // Check for muster
        if (card1.abilities && card1.abilities.includes('muster') && 
            card2.abilities && card2.abilities.includes('muster')) {
            if (card1.name === card2.name) {
                score += 0.7;
                reason = 'Muster combo';
            }
        }
        
        // Check for medic synergy
        if (card1.abilities && card1.abilities.includes('medic') && 
            card2.abilities && card2.abilities.includes('medic')) {
            score += 0.4;
            reason = 'Medic chain potential';
        }
        
        // Check for weather synergy
        if (card1.abilities && card1.abilities.includes('clear_weather') && 
            card2.abilities && card2.abilities.includes('clear_weather')) {
            score += 0.3;
            reason = 'Weather control';
        }
        
        // Check for row synergy
        if (card1.row === card2.row) {
            score += 0.2;
            reason = 'Same row placement';
        }
        
        // Strategy-based adjustments
        if (strategy.focus === 'control' && 
            ((card1.abilities && card1.abilities.includes('clear_weather')) || 
             (card2.abilities && card2.abilities.includes('clear_weather')))) {
            score += 0.2;
        }
        
        if (strategy.focus === 'tempo' && (card1.power > 8 || card2.power > 8)) {
            score += 0.2;
        }
        
        return {
            score: Math.min(1.0, score),
            reason: reason,
            playOrder: playOrder
        };
    }

    /**
     * Calculate synergy between a card and the board
     */
    calculateBoardSynergy(card, board, strategy) {
        let score = 0;
        let targetRow = null;
        let reason = '';
        
        // Check for row-specific synergies
        Object.entries(board).forEach(([row, rowData]) => {
            const rowScore = this.calculateRowSynergy(card, rowData, row, strategy);
            if (rowScore.score > score) {
                score = rowScore.score;
                targetRow = row;
                reason = rowScore.reason;
            }
        });
        
        return {
            score: score,
            targetRow: targetRow,
            reason: reason
        };
    }

    /**
     * Calculate synergy with a specific row
     */
    calculateRowSynergy(card, rowData, row, strategy) {
        let score = 0;
        let reason = '';
        
        // Check for row-specific abilities
        if (card.row === row) {
            score += 0.3;
            reason = 'Row match';
        }
        
        // Check for weather synergy
        if (rowData.weather && card.abilities && card.abilities.includes('clear_weather')) {
            score += 0.5;
            reason = 'Weather clear';
        }
        
        // Check for unit synergies
        if (rowData.units) {
            rowData.units.forEach(unit => {
                if (unit.abilities && unit.abilities.includes('tight_bond') && card.name === unit.name) {
                    score += 0.6;
                    reason = 'Tight bond activation';
                }
                
                if (unit.abilities && unit.abilities.includes('muster') && card.name === unit.name) {
                    score += 0.5;
                    reason = 'Muster activation';
                }
            });
        }
        
        // Strategy-based adjustments
        if (strategy.focus === 'control' && card.abilities && card.abilities.includes('clear_weather')) {
            score += 0.2;
        }
        
        if (strategy.focus === 'tempo' && card.power > 8) {
            score += 0.2;
        }
        
        return {
            score: Math.min(1.0, score),
            reason: reason
        };
    }

    /**
     * Group cards by synergy type
     */
    groupCardsBySynergy(hand, strategy) {
        const groups = {
            tightBond: [],
            muster: [],
            medic: [],
            weather: [],
            highPower: [],
            special: []
        };
        
        hand.forEach(card => {
            if (card.abilities && card.abilities.includes('tight_bond')) groups.tightBond.push(card);
            if (card.abilities && card.abilities.includes('muster')) groups.muster.push(card);
            if (card.abilities && card.abilities.includes('medic')) groups.medic.push(card);
            if (card.abilities && (card.abilities.includes('clear_weather') || card.abilities.includes('fog') || 
                card.abilities.includes('rain') || card.abilities.includes('frost'))) {
                groups.weather.push(card);
            }
            if (card.power > 8) groups.highPower.push(card);
            if (card.abilities && card.abilities.includes('special')) groups.special.push(card);
        });
        
        return groups;
    }

    /**
     * Calculate optimal play order for cards
     */
    calculateOptimalPlayOrder(hand, board, strategy) {
        const playOrder = [];
        const remainingCards = [...hand];
        
        // Strategy-based prioritization
        if (strategy.focus === 'tempo') {
            // Play high-power cards first
            remainingCards.sort((a, b) => b.power - a.power);
        } else if (strategy.focus === 'control') {
            // Play weather and control cards first
            remainingCards.sort((a, b) => {
                const aControl = a.abilities && (a.abilities.includes('clear_weather') || a.abilities.includes('fog') || 
                               a.abilities.includes('rain') || a.abilities.includes('frost')) ? 1 : 0;
                const bControl = b.abilities && (b.abilities.includes('clear_weather') || b.abilities.includes('fog') || 
                               b.abilities.includes('rain') || b.abilities.includes('frost')) ? 1 : 0;
                return bControl - aControl;
            });
        } else if (strategy.focus === 'survival') {
            // Play defensive cards first
            remainingCards.sort((a, b) => {
                const aDefensive = a.abilities && (a.abilities.includes('medic') || a.abilities.includes('shield')) ? 1 : 0;
                const bDefensive = b.abilities && (b.abilities.includes('medic') || b.abilities.includes('shield')) ? 1 : 0;
                return bDefensive - aDefensive;
            });
        }
        
        // Add synergy considerations
        const synergyGroups = this.groupCardsBySynergy(remainingCards, strategy);
        
        // Play tight bond pairs together
        if (synergyGroups.tightBond.length >= 2) {
            const pairs = this.findTightBondPairs(synergyGroups.tightBond);
            pairs.forEach(pair => {
                playOrder.push(...pair);
                pair.forEach(card => {
                    const index = remainingCards.findIndex(c => c === card);
                    if (index > -1) remainingCards.splice(index, 1);
                });
            });
        }
        
        // Play muster groups together
        if (synergyGroups.muster.length >= 2) {
            const groups = this.findMusterGroups(synergyGroups.muster);
            groups.forEach(group => {
                playOrder.push(...group);
                group.forEach(card => {
                    const index = remainingCards.findIndex(c => c === card);
                    if (index > -1) remainingCards.splice(index, 1);
                });
            });
        }
        
        // Add remaining cards
        playOrder.push(...remainingCards);
        
        return playOrder;
    }

    /**
     * Find tight bond pairs
     */
    findTightBondPairs(cards) {
        const pairs = [];
        const used = new Set();
        
        cards.forEach(card => {
            if (used.has(card)) return;
            
            const pair = cards.filter(c => c.name === card.name);
            if (pair.length >= 2) {
                pairs.push(pair.slice(0, 2));
                pair.forEach(c => used.add(c));
            }
        });
        
        return pairs;
    }

    /**
     * Find muster groups
     */
    findMusterGroups(cards) {
        const groups = [];
        const used = new Set();
        
        cards.forEach(card => {
            if (used.has(card)) return;
            
            const group = cards.filter(c => c.name === card.name);
            if (group.length >= 2) {
                groups.push(group);
                group.forEach(c => used.add(c));
            }
        });
        
        return groups;
    }

    /**
     * Calculate overall synergy score
     */
    calculateOverallSynergyScore(analysis) {
        let score = 0;
        
        // Immediate combos
        score += analysis.immediateCombos.reduce((sum, combo) => sum + combo.synergy.score, 0) * 0.4;
        
        // Potential combos
        score += analysis.potentialCombos.reduce((sum, combo) => sum + combo.synergy.score, 0) * 0.3;
        
        // Synergy groups
        const groupScores = Object.values(analysis.synergyGroups).map(group => group.length);
        score += groupScores.reduce((sum, count) => sum + Math.min(count * 0.1, 0.3), 0) * 0.2;
        
        // Play order optimization
        score += analysis.optimalPlayOrder.length > 0 ? 0.1 : 0;
        
        return Math.min(1.0, score);
    }

    /**
     * Enhanced pass decision with game state analysis
     */
    shouldPassEnhanced(gameState, strategy, synergyAnalysis) {
        if (this.player.passed) return false;
        
        // Always pass if opponent passed and we're winning (round is over)
        const opponent = this.player.opponent();
        if (opponent.passed && this.player.winning) {
            return true;
        }
        
        const roundNumber = gameState.roundNumber || game.roundCount || 1;
        const cardsInHand = this.player.hand.cards.length;
        const isLosing = !this.player.winning;
        const pointDifferential = opponent.total - this.player.total;
        const lostPreviousRound = this.player.health < 2; // Lost at least one round
        
        // CRITICAL: NEVER pass if we're losing and need to win this round
        // If we lost the previous round, we MUST win this round or we lose the game
        if (lostPreviousRound && isLosing) {
            console.log(`⚔️ AI refusing to pass - lost previous round and currently losing (must fight!)`);
            return false;
        }
        
        // NEVER pass if we're significantly behind (more than 15 points) - we need to try to catch up
        if (isLosing && pointDifferential > 15) {
            console.log(`⚔️ AI refusing to pass - losing by ${pointDifferential} points (must fight!)`);
            return false;
        }
        
        // NEVER pass in round 2 if we lost round 1 - we MUST win round 2
        if (roundNumber === 2 && lostPreviousRound) {
            console.log(`⚔️ AI refusing to pass round 2 - lost round 1 (must win this round!)`);
            return false;
        }
        
        // GENERAL: If we have 2 or fewer cards left, only pass if we're winning or tied
        // If we're losing, we must try to win even with few cards
        if (cardsInHand <= 2 && roundNumber < 3) {
            if (isLosing) {
                console.log(`⚔️ AI refusing to pass - only ${cardsInHand} cards but losing (must fight!)`);
                return false;
            }
            console.log(`🛡️ AI passing to conserve critical cards (only ${cardsInHand} cards left, winning)`);
            return true;
        }
        
        // CRITICAL: Card conservation for round 1 - don't play all cards
        // In round 1, we need to save cards for rounds 2 and 3
        // BUT: Only if we're winning or close
        if (roundNumber === 1) {
            // If we have 3 or fewer cards left in round 1, only pass if we're winning
            if (cardsInHand <= 3) {
                if (isLosing) {
                    console.log(`⚔️ AI refusing to pass round 1 - only ${cardsInHand} cards but losing (must fight!)`);
                    return false;
                }
                if (Math.random() > 0.2) {
                    console.log(`🛡️ AI passing round 1 to conserve cards (only ${cardsInHand} cards remaining, winning)`);
                    return true;
                }
            }
            // If we have 4-5 cards left and are winning by 10+, pass to save cards (70% chance)
            if (cardsInHand <= 5 && gameState.powerAdvantage > 10) {
                if (Math.random() > 0.3) {
                    console.log(`🛡️ AI passing round 1 while winning (${cardsInHand} cards remaining, ${gameState.powerAdvantage} point lead)`);
                    return true;
                }
            }
            // If we have 4-5 cards left and opponent passed, pass to save cards
            if (cardsInHand <= 5 && opponent.passed && this.player.winning) {
                console.log(`🛡️ AI passing round 1 after opponent passed (${cardsInHand} cards remaining)`);
                return true;
            }
        }
        
        // Add randomization to pass decisions (like human players)
        const randomizationFactor = this.calculateRandomizationFactor(gameState);
        
        // Reduce randomization impact if we're low on cards (strategic necessity)
        const strategicOverride = (cardsInHand <= 3 && roundNumber < 3) || (cardsInHand <= 2);
        
        // Sometimes make unexpected pass decisions (human unpredictability)
        // But NEVER if we're losing, lost previous round, or low on cards (strategic necessity)
        if (!strategicOverride && !isLosing && !lostPreviousRound && randomizationFactor < 0.1) {
            console.log("🎭 AI making unexpected pass (human-like unpredictability)");
            return true; // Pass when you wouldn't expect it (only when winning)
        }
        
        // Sometimes refuse to pass even when you should (human stubbornness)
        // But not if we're low on cards or in round 1 with few cards remaining
        if (!strategicOverride && !(roundNumber === 1 && cardsInHand <= 4) && randomizationFactor > 0.9) {
            console.log("💪 AI refusing to pass (human-like stubbornness)");
            return false; // Don't pass even when you should
        }
        
        // Base pass logic (fallback to original if available)
        if (this.shouldPass && this.shouldPass(gameState, strategy)) {
            return true;
        }
        
        // Enhanced pass conditions with randomization
        
        // If we have strong synergies and opponent is weak, don't pass (but sometimes do)
        // BUT: Never pass if we're losing or lost previous round
        if (synergyAnalysis.synergyScore > 0.6 && gameState.powerAdvantage > 10 && !isLosing && !lostPreviousRound) {
            // 80% chance to continue, 20% chance to pass anyway (only when winning)
            if (randomizationFactor > 0.8) {
                console.log("🎲 AI passing despite strong position (human-like inconsistency)");
                return true;
            }
            return false;
        }
        
        // If opponent has strong synergies and we're weak, consider passing (but sometimes fight)
        // BUT: Never pass if we lost previous round - we MUST fight
        if (gameState.powerAdvantage < -20 && gameState.cardAdvantage < 0 && !lostPreviousRound) {
            // 70% chance to pass, 30% chance to fight back
            if (randomizationFactor > 0.7) {
                console.log("💪 AI fighting back despite weak position (human-like stubbornness)");
                return false;
            }
            return true;
        }
        
        // Concede unwinnable rounds: If opponent passed and we're behind by 30+ points,
        // evaluate if continuing would put us in a card-hole for future rounds
        if (opponent.passed && !this.player.winning) {
            const pointDifferential = opponent.total - this.player.total;
            
            if (pointDifferential >= 30) {
                // We're losing by 30+ and opponent passed - evaluate card conservation
                const cardsInHand = this.player.hand.cards.length;
                const cardsNeededToWin = Math.ceil(pointDifferential / 10); // Rough estimate: need ~10 points per card
                const cardsRemainingAfterFight = cardsInHand - cardsNeededToWin;
                
                // Calculate future round impact
                const roundsRemaining = 3 - game.roundCount;
                const cardsPerRoundNeeded = Math.ceil(cardsRemainingAfterFight / Math.max(roundsRemaining, 1));
                
                // If fighting would leave us with < 4 cards per remaining round, concede
                // This prevents getting into a "card-hole" where we can't compete in future rounds
                if (cardsRemainingAfterFight < 4 * roundsRemaining || cardsPerRoundNeeded < 3) {
                    console.log(`🏳️ AI conceding unwinnable round (${pointDifferential} point deficit, would leave ${cardsRemainingAfterFight} cards for ${roundsRemaining} rounds)`);
                    return true; // Concede to save cards for future rounds
                }
                
                // Also concede if we have very few cards left (can't afford to waste them)
                if (cardsInHand <= 5 && pointDifferential >= 40) {
                    console.log(`🏳️ AI conceding unwinnable round (${pointDifferential} point deficit, only ${cardsInHand} cards left)`);
                    return true;
                }
            }
        }
        
        // If we're in a strong position and have card advantage, consider passing (but sometimes overcommit)
        // But be more conservative in round 1
        if (gameState.powerAdvantage > 15 && gameState.cardAdvantage > 1) {
            // In round 1, be more likely to pass (80% vs 60%)
            const passThreshold = (roundNumber === 1) ? 0.8 : 0.6;
            if (randomizationFactor > passThreshold) {
                console.log("🎯 AI overcommitting despite strong position (human-like greed)");
                return false;
            }
            return true;
        }
        
        // If we have no good synergies and opponent is strong, pass (but sometimes bluff)
        if (synergyAnalysis.synergyScore < 0.2 && gameState.powerAdvantage < -10) {
            // 75% chance to pass, 25% chance to bluff
            if (randomizationFactor > 0.75) {
                console.log("🎭 AI bluffing despite weak position (human-like deception)");
                return false;
            }
            return true;
        }
        
        // Add some "mood-based" pass decisions
        if (this.playerMood) {
            if (this.playerMood > 0.8) {
                // "Confident mood" - less likely to pass
                if (Math.random() > 0.7) {
                    console.log("😤 AI in confident mood, refusing to pass");
                    return false;
                }
            } else if (this.playerMood < 0.2) {
                // "Cautious mood" - more likely to pass
                if (Math.random() > 0.6) {
                    console.log("😰 AI in cautious mood, passing early");
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Find best card to play with enhanced synergy consideration
     */
    findBestCardToPlayEnhanced(gameState, strategy, synergyAnalysis) {
        const hand = this.player.hand?.cards || [];
        
        // Add randomization to card selection (like human players)
        const randomizationFactor = this.calculateRandomizationFactor(gameState);
        
        // Check for Decoy opportunities first (high priority strategic card)
        const decoyOpportunity = this.findDecoyOpportunity(gameState, strategy);
        if (decoyOpportunity && decoyOpportunity.shouldUseDecoy) {
            console.log(`🎭 AI using Decoy strategically: ${decoyOpportunity.reason}`);
            return decoyOpportunity.decoyCard;
        }
        
        // Sometimes ignore synergies and play randomly (human inconsistency)
        if (randomizationFactor < 0.15) {
            console.log("🎲 AI playing randomly (human-like inconsistency)");
            return this.selectRandomCard(hand, strategy);
        }
        
        // Sometimes make suboptimal choices (human mistakes)
        if (randomizationFactor > 0.85) {
            console.log("🤔 AI making suboptimal choice (human-like mistake)");
            return this.selectSuboptimalCard(hand, synergyAnalysis, strategy);
        }
        
        // If we have immediate combos, prioritize them (but with some randomization)
        if (synergyAnalysis.immediateCombos.length > 0) {
            // Sometimes choose second-best combo for variety
            if (randomizationFactor > 0.7 && synergyAnalysis.immediateCombos.length > 1) {
                const sortedCombos = synergyAnalysis.immediateCombos.sort((a, b) => 
                    b.synergy.score - a.synergy.score
                );
                return sortedCombos[1].cards[0]; // Second best combo
            }
            
            const bestCombo = synergyAnalysis.immediateCombos.reduce((best, combo) => 
                combo.synergy.score > best.synergy.score ? combo : best
            );
            
            // Return the first card of the best combo
            return bestCombo.cards[0];
        }
        
        // If we have potential combos, prioritize them (with randomization)
        if (synergyAnalysis.potentialCombos.length > 0) {
            // Sometimes choose lower synergy combo for variety
            if (randomizationFactor > 0.6 && synergyAnalysis.potentialCombos.length > 1) {
                const sortedCombos = synergyAnalysis.potentialCombos.sort((a, b) => 
                    b.synergy.score - a.synergy.score
                );
                // 70% chance to pick best, 30% chance to pick second best
                return Math.random() > 0.3 ? sortedCombos[0].card : sortedCombos[1].card;
            }
            
            const bestCombo = synergyAnalysis.potentialCombos.reduce((best, combo) => 
                combo.synergy.score > best.synergy.score ? combo : best
            );
            
            return bestCombo.card;
        }
        
        // Fall back to original card evaluation if available
        if (this.findBestCardToPlay) {
            return this.findBestCardToPlay(gameState, strategy);
        }
        
        // Fallback: return highest power card (but sometimes choose differently)
        if (randomizationFactor > 0.5) {
            // Sometimes choose second-highest power card
            const sortedByPower = hand.sort((a, b) => b.power - a.power);
            if (sortedByPower.length > 1) {
                return Math.random() > 0.7 ? sortedByPower[1] : sortedByPower[0];
            }
        }
        
        return hand.reduce((best, card) => card.power > best.power ? card : best, hand[0]);
    }

    /**
     * Select a random card (for unpredictability)
     */
    selectRandomCard(hand, strategy) {
        // Weight randomization by strategy focus
        let eligibleCards = [...hand];
        
        if (strategy.focus === 'tempo') {
            // Prefer high-power cards even when random
            eligibleCards.sort((a, b) => b.power - a.power);
            // Pick from top 3 cards randomly
            const topCards = eligibleCards.slice(0, Math.min(3, eligibleCards.length));
            return topCards[Math.floor(Math.random() * topCards.length)];
        } else if (strategy.focus === 'control') {
            // Prefer control cards even when random
            const controlCards = eligibleCards.filter(card => 
                card.abilities && (card.abilities.includes('clear_weather') || 
                card.abilities.includes('fog') || card.abilities.includes('rain') || 
                card.abilities.includes('frost'))
            );
            if (controlCards.length > 0) {
                return controlCards[Math.floor(Math.random() * controlCards.length)];
            }
        }
        
        // Completely random selection
        return eligibleCards[Math.floor(Math.random() * eligibleCards.length)];
    }

    /**
     * Select a suboptimal card (for human-like mistakes)
     */
    selectSuboptimalCard(hand, synergyAnalysis, strategy) {
        // Sometimes pick a card that's clearly not the best
        const sortedByPower = hand.sort((a, b) => b.power - a.power);
        
        // 40% chance to pick lowest power card
        if (Math.random() < 0.4) {
            return sortedByPower[sortedByPower.length - 1];
        }
        
        // 30% chance to pick middle power card
        if (Math.random() < 0.3) {
            const middleIndex = Math.floor(sortedByPower.length / 2);
            return sortedByPower[middleIndex];
        }
        
        // 30% chance to pick second-lowest power card
        return sortedByPower[sortedByPower.length - 2] || sortedByPower[0];
    }

    /**
     * Calculate weather impact on the board
     */
    calculateWeatherImpact(weatherEffects, boardState) {
        let impact = 0;
        
        weatherEffects.forEach(weather => {
            const row = weather.row;
            const rowData = boardState.myRows?.[row] || boardState.theirRows?.[row];
            
            if (rowData && rowData.units) {
                const affectedUnits = rowData.units.filter(unit => 
                    unit.abilities && !unit.abilities.includes('hero') && !unit.abilities.includes('gold')
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
        
        // Handle case where specialCards is a number (count) instead of array
        if (typeof specialCards === 'number') {
            // If it's just a count, return a simple value based on count
            return specialCards * 2;
        }
        
        // Ensure specialCards is an array
        if (!Array.isArray(specialCards)) {
            return 0;
        }
        
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
            if (card.abilities && (card.abilities.includes('fog') || card.abilities.includes('rain') || card.abilities.includes('frost'))) {
                specialCounts.weather++;
            } else if (card.abilities && card.abilities.includes('clear_weather')) {
                specialCounts.clear++;
            } else if (card.abilities && card.abilities.includes('horn')) {
                specialCounts.horn++;
            } else if (card.abilities && card.abilities.includes('scorch')) {
                specialCounts.scorch++;
            } else if (card.abilities && card.abilities.includes('decoy')) {
                specialCounts.decoy++;
            } else if (card.abilities && card.abilities.includes('medic')) {
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
     * Get performance metrics for the enhanced AI
     */
    getPerformanceMetrics() {
        return {
            strategyAdaptations: this.strategyHistory.length,
            gameStatesAnalyzed: this.gameStateHistory.length,
            adaptationDataPoints: Object.keys(this.adaptationData).length,
            averageSynergyScore: this.calculateAverageSynergyScore(),
            strategyEffectiveness: this.calculateStrategyEffectiveness(),
            unpredictabilityScore: this.calculateUnpredictabilityScore(),
            humanLikeBehavior: this.calculateHumanLikeBehavior()
        };
    }

    /**
     * Calculate unpredictability score (how random the AI is)
     */
    calculateUnpredictabilityScore() {
        if (this.gameStateHistory.length < 3) return 0;
        
        let unpredictability = 0;
        const recentHistory = this.gameStateHistory.slice(-5);
        
        // Check for strategy changes
        recentHistory.forEach((state, index) => {
            if (index > 0) {
                const prevState = recentHistory[index - 1];
                // If strategy changed unexpectedly, that's unpredictable
                if (state.strategy && prevState.strategy) {
                    if (state.strategy.focus !== prevState.strategy.focus) {
                        unpredictability += 0.2;
                    }
                    if (Math.abs(state.strategy.aggressiveness - prevState.strategy.aggressiveness) > 0.3) {
                        unpredictability += 0.15;
                    }
                }
            }
        });
        
        // Check for unexpected pass decisions
        if (this.adaptationData) {
            const passDecisions = Object.values(this.adaptationData).filter(adaptation => 
                adaptation.outcome === 'passed'
            );
            if (passDecisions.length > 0) {
                unpredictability += Math.min(0.3, passDecisions.length * 0.1);
            }
        }
        
        return Math.min(1.0, unpredictability);
    }

    /**
     * Calculate how human-like the AI behavior is
     */
    calculateHumanLikeBehavior() {
        if (this.gameStateHistory.length < 3) return 0;
        
        let humanLikeScore = 0;
        
        // Check for mood variations
        if (this.playerMood !== undefined) {
            humanLikeScore += 0.2;
        }
        
        // Check for personality traits
        if (this.currentStrategy && this.currentStrategy.stubbornness) {
            humanLikeScore += 0.15;
        }
        
        // Check for inconsistent decisions
        const recentDecisions = this.gameStateHistory.slice(-3);
        let inconsistencyCount = 0;
        
        recentDecisions.forEach((state, index) => {
            if (index > 0) {
                const prevState = recentDecisions[index - 1];
                // Inconsistent strategy changes are human-like
                if (state.strategy && prevState.strategy) {
                    if (state.strategy.focus !== prevState.strategy.focus) {
                        inconsistencyCount++;
                    }
                }
            }
        });
        
        humanLikeScore += Math.min(0.3, inconsistencyCount * 0.1);
        
        // Check for suboptimal choices (humans make mistakes)
        if (this.adaptationData) {
            const suboptimalChoices = Object.values(this.adaptationData).filter(adaptation => 
                adaptation.outcome === 'suboptimal'
            );
            humanLikeScore += Math.min(0.2, suboptimalChoices.length * 0.05);
        }
        
        // Check for bluffing behavior
        if (this.adaptationData) {
            const bluffDecisions = Object.values(this.adaptationData).filter(adaptation => 
                adaptation.outcome === 'bluffed'
            );
            humanLikeScore += Math.min(0.15, bluffDecisions.length * 0.05);
        }
        
        return Math.min(1.0, humanLikeScore);
    }

    /**
     * Get AI personality summary for this game
     */
    getAIPersonalitySummary() {
        if (!this.currentStrategy) return "Unknown";
        
        const personality = {
            mood: this.playerMood > 0.7 ? "Confident" : this.playerMood < 0.3 ? "Cautious" : "Balanced",
            stubbornness: this.currentStrategy.stubbornness || "medium",
            focus: this.currentStrategy.focus || "unknown",
            aggressiveness: this.currentStrategy.aggressiveness > 0.7 ? "High" : 
                           this.currentStrategy.aggressiveness < 0.3 ? "Low" : "Medium"
        };
        
        return {
            summary: `${personality.mood} ${personality.focus} player with ${personality.aggressiveness} aggression`,
            details: personality,
            unpredictability: this.calculateUnpredictabilityScore(),
            humanLike: this.calculateHumanLikeBehavior()
        };
    }

    /**
     * Calculate average synergy score across recent games
     */
    calculateAverageSynergyScore() {
        if (this.gameStateHistory.length === 0) return 0;
        
        const recentStates = this.gameStateHistory.slice(-10);
        const totalSynergy = recentStates.reduce((sum, state) => {
            const synergyAnalysis = this.analyzeCardSynergies(state, this.currentStrategy || {});
            return sum + synergyAnalysis.synergyScore;
        }, 0);
        
        return totalSynergy / recentStates.length;
    }

    /**
     * Calculate strategy effectiveness
     */
    calculateStrategyEffectiveness() {
        if (this.strategyHistory.length < 2) return 0;
        
        const recentStrategies = this.strategyHistory.slice(-5);
        let effectiveness = 0;
        
        recentStrategies.forEach((strategy, index) => {
            if (index > 0) {
                const prevStrategy = recentStrategies[index - 1];
                // Compare strategy changes with game state improvements
                const stateImprovement = this.calculateStateImprovement(index);
                if (stateImprovement > 0) effectiveness += 0.2;
                else if (stateImprovement < 0) effectiveness -= 0.1;
            }
        });
        
        return Math.max(0, Math.min(1, effectiveness));
    }

    /**
     * Calculate state improvement between two game states
     */
    calculateStateImprovement(index) {
        if (index >= this.gameStateHistory.length - 1) return 0;
        
        const currentState = this.gameStateHistory[index];
        const nextState = this.gameStateHistory[index + 1];
        
        const powerImprovement = (nextState.powerAdvantage || 0) - (currentState.powerAdvantage || 0);
        const cardImprovement = (nextState.cardAdvantage || 0) - (currentState.cardAdvantage || 0);
        
        return powerImprovement + (cardImprovement * 2); // Card advantage weighted more
    }

    // Placeholder methods for compatibility
    handleFactionAbilities(gameState) { return false; }
    findComplexAbilityCard() { return null; }
    getComplexAbilityName(card) { return null; }
    handleComplexAbility(card, abilityName, gameState, strategy) { return false; }
    
    async pass() { 
        if (this.player.passed) {
            console.log("⏭️ AI already passed, skipping pass action");
            return;
        }
        console.log("🔄 AI passing turn");
        await this.player.passRound();
    }
    
    async playCard(card, gameState, strategy) { 
        console.log(`🎯 AI playing card: ${card.name}`);
        // Handle Peace Treaty specially (no row selection needed)
        if (card.faction === "special" && card.abilities.includes("peace_treaty")) {
            card.holder.hand.removeCard(card);
            await ability_dict["peace_treaty"].placed(card);
            this.player.endTurn();
            return;
        }
        // Use the basic AI's playCard method to actually play the card
        if (this.basicController && this.basicController.playCard) {
            const max = this.basicController.getMaximums ? this.basicController.getMaximums() : null;
            const data = this.basicController.getBoardData ? this.basicController.getBoardData() : null;
            await this.basicController.playCard(card, max, data);
        } else {
            // Fallback: use player's playCard method
            await this.player.playCard(card);
        }
    }

    /**
     * Advanced Decoy timing optimization
     */
    optimizeDecoyTiming(gameState, strategy) {
        const timing = {
            shouldUseNow: false,
            reason: '',
            priority: 'low'
        };
        
        // High priority: Save from immediate threats
        if (this.hasImmediateThreats(gameState)) {
            timing.shouldUseNow = true;
            timing.priority = 'high';
            timing.reason = 'Immediate threat protection';
        }
        
        // Medium priority: Strategic timing
        else if (this.isOptimalDecoyTiming(gameState, strategy)) {
            timing.shouldUseNow = true;
            timing.priority = 'medium';
            timing.reason = 'Optimal strategic timing';
        }
        
        // Low priority: Hold for better opportunities
        else {
            timing.shouldUseNow = false;
            timing.priority = 'low';
            timing.reason = 'Hold for better opportunity';
        }
        
        return timing;
    }

    /**
     * Check for immediate threats that require Decoy
     */
    hasImmediateThreats(gameState) {
        // Check for weather effects that will damage units
        if (gameState.weatherEffects && gameState.weatherEffects.length > 0) {
            const board = gameState.boardState?.myRows || {};
            
            for (const [row, rowData] of Object.entries(board)) {
                if (rowData.units && rowData.units.length > 0) {
                    const hasWeather = gameState.weatherEffects.some(weather => weather.row === row);
                    if (hasWeather) {
                        // Check if we have valuable units in this row
                        const valuableUnits = rowData.units.filter(unit => unit.power > 3);
                        if (valuableUnits.length > 0) {
                            return true;
                        }
                    }
                }
            }
        }
        
        // Check for opponent's next move that might destroy our units
        if (gameState.opponentAnalysis?.aggressionLevel > 0.7) {
            return true; // Aggressive opponent might destroy units
        }
        
        return false;
    }

    /**
     * Determine if this is optimal timing for Decoy
     */
    isOptimalDecoyTiming(gameState, strategy) {
        const round = gameState.roundNumber || 1;
        const cardAdvantage = gameState.cardAdvantage || 0;
        const powerAdvantage = gameState.powerAdvantage || 0;
        
        // Round 1: Use Decoy to save valuable units for later
        if (round === 1 && cardAdvantage > 0) {
            return true;
        }
        
        // Round 2: Use Decoy if we're behind and need to catch up
        if (round === 2 && powerAdvantage < -15) {
            return true;
        }
        
        // Round 3: Use Decoy for final power push
        if (round === 3 && Math.abs(powerAdvantage) < 10) {
            return true;
        }
        
        // Strategy-based timing
        if (strategy.focus === 'control' && gameState.weatherEffects?.length > 0) {
            return true; // Control strategy needs weather protection
        }
        
        if (strategy.focus === 'tempo' && powerAdvantage > 20) {
            return true; // Tempo strategy can afford to save units
        }
        
        return false;
    }

    /**
     * Calculate Decoy value for specific targets
     */
    calculateDecoyValue(target, gameState, strategy) {
        let value = 0;
        let reason = '';
        
        // Base value from power
        value += target.power * 0.1;
        
        // Ability value
        if (target.abilities) {
            if (target.abilities.includes('medic')) {
                value += 0.4;
                reason += 'Medic ability value';
            }
            if (target.abilities.includes('spy')) {
                value += 0.6;
                reason += 'Spy value extraction';
            }
            if (target.abilities.includes('muster')) {
                value += 0.3;
                reason += 'Muster combo potential';
            }
            if (target.abilities.includes('tight_bond')) {
                value += 0.3;
                reason += 'Tight bond activation';
            }
        }
        
        // Strategic value
        if (strategy.focus === 'control' && target.abilities && 
            (target.abilities.includes('medic') || target.abilities.includes('spy'))) {
            value += 0.2;
            reason += 'Control strategy bonus';
        }
        
        if (strategy.focus === 'tempo' && target.power > 8) {
            value += 0.2;
            reason += 'Tempo strategy bonus';
        }
        
        // Round-based value
        const round = gameState.roundNumber || 1;
        if (round === 1 && target.power >= 8) {
            value += 0.3; // Save high-value units for later rounds
            reason += 'Round 1 high-value save';
        }
        
        if (round === 3 && target.power >= 6) {
            value += 0.2; // Final round value
            reason += 'Final round value';
        }
        
        return {
            value: Math.min(1.0, value),
            reason: reason,
            priority: value > 0.7 ? 'high' : value > 0.4 ? 'medium' : 'low'
        };
    }

    /**
     * Get Decoy usage statistics
     */
    getDecoyStatistics() {
        const stats = {
            totalOpportunities: 0,
            opportunitiesUsed: 0,
            averageValue: 0,
            bestTargets: [],
            usageByType: {}
        };
        
        // This would be populated during gameplay
        // For now, return empty stats
        return stats;
    }

    /**
     * Find strategic Decoy opportunities
     */
    findDecoyOpportunity(gameState, strategy) {
        const hand = this.player.hand?.cards || [];
        const decoyCard = hand.find(card => 
            card.abilities && card.abilities.includes('decoy')
        );
        
        if (!decoyCard) return null;
        
        const board = gameState.boardState?.myRows || {};
        const opponentBoard = gameState.boardState?.theirRows || {};
        
        // Analyze Decoy opportunities
        const opportunities = this.analyzeDecoyOpportunities(board, opponentBoard, strategy, gameState);
        
        if (opportunities.length === 0) return null;
        
        // Find the best opportunity
        const bestOpportunity = opportunities.reduce((best, opp) => 
            opp.score > best.score ? opp : best
        );
        
        // Only use Decoy if the opportunity is good enough
        if (bestOpportunity.score >= 0.6) {
            return {
                shouldUseDecoy: true,
                decoyCard: decoyCard,
                target: bestOpportunity.target,
                reason: bestOpportunity.reason,
                score: bestOpportunity.score
            };
        }
        
        return null;
    }

    /**
     * Analyze all possible Decoy opportunities
     */
    analyzeDecoyOpportunities(board, opponentBoard, strategy, gameState) {
        const opportunities = [];
        
        // 1. Decoy our own units for value
        const myDecoyOpportunities = this.findMyUnitDecoyOpportunities(board, strategy);
        opportunities.push(...myDecoyOpportunities);
        
        // 2. Decoy opponent units for disruption
        const opponentDecoyOpportunities = this.findOpponentDecoyOpportunities(opponentBoard, strategy);
        opportunities.push(...opponentDecoyOpportunities);
        
        // 3. Decoy for combo potential
        const comboDecoyOpportunities = this.findComboDecoyOpportunities(board, strategy, gameState);
        opportunities.push(...comboDecoyOpportunities);
        
        // 4. Decoy for round management
        const roundDecoyOpportunities = this.findRoundDecoyOpportunities(board, strategy, gameState);
        opportunities.push(...roundDecoyOpportunities);
        
        // 5. Decoy for weather protection
        const weatherDecoyOpportunities = this.findWeatherDecoyOpportunities(board, strategy, gameState);
        opportunities.push(...weatherDecoyOpportunities);
        
        return opportunities;
    }

    /**
     * Find opportunities to Decoy our own units
     */
    findMyUnitDecoyOpportunities(board, strategy) {
        const opportunities = [];
        
        Object.entries(board).forEach(([row, rowData]) => {
            if (!rowData.units) return;
            
            rowData.units.forEach(unit => {
                let score = 0;
                let reason = '';
                
                // High-value units that can be replayed
                if (unit.power >= 8) {
                    score += 0.3;
                    reason += 'High power unit';
                }
                
                // Units with abilities that can be reused
                if (unit.abilities) {
                    if (unit.abilities.includes('medic')) {
                        score += 0.4;
                        reason += 'Medic ability reuse';
                    }
                    if (unit.abilities.includes('spy')) {
                        score += 0.5;
                        reason += 'Spy value extraction';
                    }
                    if (unit.abilities.includes('muster')) {
                        score += 0.3;
                        reason += 'Muster ability reuse';
                    }
                    if (unit.abilities.includes('tight_bond')) {
                        score += 0.2;
                        reason += 'Tight bond potential';
                    }
                }
                
                // Strategy-based scoring
                if (strategy.focus === 'tempo' && unit.power > 6) {
                    score += 0.2;
                    reason += 'Tempo strategy';
                }
                
                if (strategy.focus === 'control' && unit.abilities && 
                    (unit.abilities.includes('medic') || unit.abilities.includes('spy'))) {
                    score += 0.3;
                    reason += 'Control strategy';
                }
                
                // Round-based considerations
                if (gameState?.roundNumber === 1) {
                    score += 0.1; // More valuable in early rounds
                }
                
                if (score > 0.3) {
                    opportunities.push({
                        target: unit,
                        targetRow: row,
                        score: Math.min(1.0, score),
                        reason: reason,
                        type: 'my_unit'
                    });
                }
            });
        });
        
        return opportunities;
    }

    /**
     * Find opportunities to Decoy opponent units
     */
    findOpponentDecoyOpportunities(opponentBoard, strategy) {
        const opportunities = [];
        
        Object.entries(opponentBoard).forEach(([row, rowData]) => {
            if (!rowData.units) return;
            
            rowData.units.forEach(unit => {
                let score = 0;
                let reason = '';
                
                // High-value opponent units
                if (unit.power >= 8) {
                    score += 0.4;
                    reason += 'High power opponent unit';
                }
                
                // Disrupt opponent synergies
                if (unit.abilities) {
                    if (unit.abilities.includes('tight_bond')) {
                        score += 0.5;
                        reason += 'Disrupt tight bond';
                    }
                    if (unit.abilities.includes('muster')) {
                        score += 0.4;
                        reason += 'Disrupt muster';
                    }
                    if (unit.abilities.includes('spy')) {
                        score += 0.6;
                        reason += 'Steal spy value';
                    }
                }
                
                // Strategy-based scoring
                if (strategy.focus === 'control') {
                    score += 0.2;
                    reason += 'Control strategy';
                }
                
                if (score > 0.4) {
                    opportunities.push({
                        target: unit,
                        targetRow: row,
                        score: Math.min(1.0, score),
                        reason: reason,
                        type: 'opponent_unit'
                    });
                }
            });
        });
        
        return opportunities;
    }

    /**
     * Find Decoy opportunities for combo potential
     */
    findComboDecoyOpportunities(board, strategy, gameState) {
        const opportunities = [];
        const hand = this.player.hand?.cards || [];
        
        // Check if we have cards that work well with Decoy
        const medicCards = hand.filter(card => 
            card.abilities && card.abilities.includes('medic')
        );
        
        const spyCards = hand.filter(card => 
            card.abilities && card.abilities.includes('spy')
        );
        
        // Look for units that can be Decoyed and then revived/used
        Object.entries(board).forEach(([row, rowData]) => {
            if (!rowData.units) return;
            
            rowData.units.forEach(unit => {
                let score = 0;
                let reason = '';
                
                // Medic combo potential
                if (medicCards.length > 0 && unit.power >= 6) {
                    score += 0.4;
                    reason += 'Medic combo potential';
                }
                
                // Spy combo potential
                if (spyCards.length > 0 && unit.abilities && unit.abilities.includes('spy')) {
                    score += 0.5;
                    reason += 'Spy combo potential';
                }
                
                // Replay high-value units
                if (unit.power >= 10) {
                    score += 0.3;
                    reason += 'Replay high-value unit';
                }
                
                if (score > 0.3) {
                    opportunities.push({
                        target: unit,
                        targetRow: row,
                        score: Math.min(1.0, score),
                        reason: reason,
                        type: 'combo'
                    });
                }
            });
        });
        
        return opportunities;
    }

    /**
     * Find Decoy opportunities for round management
     */
    findRoundDecoyOpportunities(board, strategy, gameState) {
        const opportunities = [];
        
        // Save valuable units for later rounds
        if (gameState?.roundNumber === 1) {
            Object.entries(board).forEach(([row, rowData]) => {
                if (!rowData.units) return;
                
                rowData.units.forEach(unit => {
                    let score = 0;
                    let reason = '';
                    
                    // Save high-value units for round 3
                    if (unit.power >= 8) {
                        score += 0.4;
                        reason += 'Save for final round';
                    }
                    
                    // Save units with valuable abilities
                    if (unit.abilities) {
                        if (unit.abilities.includes('medic')) {
                            score += 0.3;
                            reason += 'Save medic for later';
                        }
                        if (unit.abilities.includes('spy')) {
                            score += 0.4;
                            reason += 'Save spy for later';
                        }
                    }
                    
                    if (score > 0.3) {
                        opportunities.push({
                            target: unit,
                            targetRow: row,
                            score: Math.min(1.0, score),
                            reason: reason,
                            type: 'round_management'
                        });
                    }
                });
            });
        }
        
        return opportunities;
    }

    /**
     * Find Decoy opportunities for weather protection
     */
    findWeatherDecoyOpportunities(board, strategy, gameState) {
        const opportunities = [];
        
        // Check if there's weather on the board
        if (gameState?.weatherEffects && gameState.weatherEffects.length > 0) {
            Object.entries(board).forEach(([row, rowData]) => {
                if (!rowData.units) return;
                
                // Check if this row has weather
                const hasWeather = gameState.weatherEffects.some(weather => weather.row === row);
                
                if (hasWeather) {
                    rowData.units.forEach(unit => {
                        let score = 0;
                        let reason = '';
                        
                        // Save units from weather damage
                        if (unit.power > 1) {
                            score += 0.5;
                            reason += 'Protect from weather';
                        }
                        
                        // High-value units especially
                        if (unit.power >= 6) {
                            score += 0.3;
                            reason += 'High-value weather protection';
                        }
                        
                        if (score > 0.3) {
                            opportunities.push({
                                target: unit,
                                targetRow: row,
                                score: Math.min(1.0, score),
                                reason: reason,
                                type: 'weather_protection'
                            });
                        }
                    });
                }
            });
        }
        
        return opportunities;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAIControllerV2;
}
