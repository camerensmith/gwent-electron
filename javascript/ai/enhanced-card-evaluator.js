/**
 * Enhanced Card Evaluator - Provides sophisticated card evaluation and weighting
 */
class EnhancedCardEvaluator {
    constructor(player, gameState) {
        this.player = player;
        this.gameState = gameState;
        this.baseEvaluator = new BaseCardEvaluator(player);
    }

    /**
     * Evaluate a card with enhanced strategic considerations
     */
    evaluateCard(card, strategy, context = {}) {
        const baseScore = this.baseEvaluator.evaluateCard(card);
        const strategicScore = this.evaluateStrategicValue(card, strategy);
        const situationalScore = this.evaluateSituationalValue(card, context);
        const synergyScore = this.evaluateSynergyValue(card);
        
        // Weight the different evaluation components
        const finalScore = (
            baseScore * 0.4 +
            strategicScore * 0.3 +
            situationalScore * 0.2 +
            synergyScore * 0.1
        );
        
        return {
            score: Math.max(0, finalScore),
            breakdown: {
                base: baseScore,
                strategic: strategicScore,
                situational: situationalScore,
                synergy: synergyScore
            },
            card: card
        };
    }

    /**
     * Evaluate strategic value based on current game strategy
     */
    evaluateStrategicValue(card, strategy) {
        let score = 0;
        
        switch (strategy.type) {
            case 'AGGRESSIVE':
                score += this.evaluateAggressiveValue(card);
                break;
            case 'DEFENSIVE':
                score += this.evaluateDefensiveValue(card);
                break;
            case 'CONTROL':
                score += this.evaluateControlValue(card);
                break;
            case 'EFFICIENT':
                score += this.evaluateEfficientValue(card);
                break;
        }
        
        return score;
    }

    /**
     * Evaluate card value for aggressive strategy
     */
    evaluateAggressiveValue(card) {
        let score = 0;
        
        // High power cards are valuable for aggressive play
        if (card.isUnit()) {
            score += card.power * 0.8;
            
            // Bonus for cards that can quickly establish board presence
            if (card.abilities.includes('muster')) {
                score += 15;
            }
            
            // Bonus for cards that can buff other units
            if (card.abilities.includes('horn') || card.abilities.includes('morale')) {
                score += 20;
            }
        }
        
        // Special cards that can remove opponent threats
        if (card.abilities.includes('scorch') || card.abilities.includes('lock')) {
            score += 25;
        }
        
        return score;
    }

    /**
     * Evaluate card value for defensive strategy
     */
    evaluateDefensiveValue(card) {
        let score = 0;
        
        // Cards that can protect our units
        if (card.abilities.includes('shield')) {
            score += 30;
        }
        
        // Cards that can clear weather effects
        if (card.abilities.includes('clear')) {
            score += 20;
        }
        
        // High-value cards that can be saved for later
        if (card.isUnit() && card.power > 8) {
            score += card.power * 0.6;
        }
        
        // Cards that can disrupt opponent combos
        if (card.abilities.includes('lock') || card.abilities.includes('knockback')) {
            score += 20;
        }
        
        return score;
    }

    /**
     * Evaluate card value for control strategy
     */
    evaluateControlValue(card) {
        let score = 0;
        
        // Cards that can control the board state
        if (card.abilities.includes('weather')) {
            score += 25;
        }
        
        // Cards that can manipulate card advantage
        if (card.abilities.includes('spy')) {
            score += 35;
        }
        
        // Cards that can provide card draw or deck manipulation
        if (card.abilities.includes('medic') || card.abilities.includes('decoy')) {
            score += 20;
        }
        
        // Balanced unit cards
        if (card.isUnit() && card.power >= 6 && card.power <= 10) {
            score += card.power * 0.7;
        }
        
        return score;
    }

    /**
     * Evaluate card value for efficient strategy
     */
    evaluateEfficientValue(card) {
        let score = 0;
        
        // High power-to-cost ratio cards
        if (card.isUnit()) {
            const efficiency = card.power / Math.max(card.basePower, 1);
            score += efficiency * 15;
        }
        
        // Cards that provide multiple effects
        if (card.abilities.length > 1) {
            score += card.abilities.length * 5;
        }
        
        // Cards that can be used flexibly
        if (card.row === 'agile') {
            score += 10;
        }
        
        return score;
    }

    /**
     * Evaluate situational value based on current game context
     */
    evaluateSituationalValue(card, context) {
        let score = 0;
        const state = this.gameState.analyze();
        
        // Weather considerations
        if (card.abilities.includes('clear') && state.boardState.weatherEffects.active.length > 0) {
            score += 30;
        }
        
        // Opponent threat assessment
        if (this.isCardCounterToOpponentThreats(card, state)) {
            score += 25;
        }
        
        // Board state considerations
        if (this.isCardOptimalForCurrentBoard(card, state)) {
            score += 20;
        }
        
        // Round-specific considerations
        if (this.isCardOptimalForCurrentRound(card, game.roundCount)) {
            score += 15;
        }
        
        return score;
    }

    /**
     * Check if card counters opponent threats
     */
    isCardCounterToOpponentThreats(card, state) {
        // Check if opponent has high-value units that this card can counter
        const opponentRows = state.boardState.opponentRows;
        let hasHighValueTargets = false;
        
        opponentRows.forEach(row => {
            if (row.highestUnit > 8) {
                hasHighValueTargets = true;
            }
        });
        
        if (hasHighValueTargets) {
            return card.abilities.includes('scorch') || card.abilities.includes('lock');
        }
        
        return false;
    }

    /**
     * Check if card is optimal for current board state
     */
    isCardOptimalForCurrentBoard(card, state) {
        // Check if we have units that can benefit from this card
        if (card.abilities.includes('horn') || card.abilities.includes('morale')) {
            const ourRows = state.boardState.ourRows;
            let hasUnitsToBuff = false;
            
            ourRows.forEach(row => {
                if (row.unitCount > 2) {
                    hasUnitsToBuff = true;
                }
            });
            
            return hasUnitsToBuff;
        }
        
        return false;
    }

    /**
     * Check if card is optimal for current round
     */
    isCardOptimalForCurrentRound(card, round) {
        if (round === 1) {
            // First round: prefer establishing presence
            return card.abilities.includes('muster') || (card.isUnit() && card.power > 6);
        } else if (round === 2) {
            // Second round: prefer flexible cards
            return card.row === 'agile' || card.abilities.includes('medic');
        } else {
            // Third round: prefer high-impact cards
            return card.power > 8 || card.abilities.includes('scorch');
        }
    }

    /**
     * Evaluate synergy value with current board and hand
     */
    evaluateSynergyValue(card) {
        let score = 0;
        
        // Check for bond synergies
        if (card.abilities.includes('bond')) {
            const bondTargets = this.player.getAllRowCards().filter(c => c.target === card.target);
            score += bondTargets.length * 10;
        }
        
        // Check for muster synergies
        if (card.abilities.includes('muster')) {
            const musterTargets = this.player.hand.cards.filter(c => c.target === card.target);
            score += musterTargets.length * 8;
        }
        
        // Check for weather synergies
        if (card.abilities.includes('weather')) {
            const weatherRows = this.player.getAllRows().filter(row => !row.effects.weather);
            score += weatherRows.length * 5;
        }
        
        // Check for row-specific synergies
        if (card.row !== 'agile' && card.row !== 'weather') {
            const rowCards = this.player.getAllRowCards().filter(c => c.row === card.row);
            score += rowCards.length * 3;
        }
        
        return score;
    }

    /**
     * Get optimal play order for multiple cards
     */
    getOptimalPlayOrder(cards, strategy) {
        const evaluations = cards.map(card => ({
            card: card,
            evaluation: this.evaluateCard(card, strategy)
        }));
        
        // Sort by evaluation score, then by strategic priority
        return evaluations.sort((a, b) => {
            if (Math.abs(a.evaluation.score - b.evaluation.score) < 5) {
                // If scores are close, prioritize by strategic value
                return b.evaluation.breakdown.strategic - a.evaluation.breakdown.strategic;
            }
            return b.evaluation.score - a.evaluation.score;
        });
    }

    /**
     * Evaluate the best target for a card with targeting abilities
     */
    evaluateTargets(card, possibleTargets) {
        if (!possibleTargets || possibleTargets.length === 0) {
            return null;
        }
        
        const targetEvaluations = possibleTargets.map(target => ({
            target: target,
            score: this.evaluateTarget(card, target)
        }));
        
        return targetEvaluations.sort((a, b) => b.score - a.score);
    }

    /**
     * Evaluate a specific target for a card
     */
    evaluateTarget(card, target) {
        let score = 0;
        
        if (card.abilities.includes('scorch')) {
            // Prefer targeting high-power units
            score += target.power * 2;
            
            // Bonus for targeting units without shields
            if (!target.abilities.includes('shield')) {
                score += 10;
            }
        }
        
        if (card.abilities.includes('lock')) {
            // Prefer targeting units with powerful abilities
            if (target.abilities.includes('horn') || target.abilities.includes('muster')) {
                score += 25;
            }
            
            // Bonus for targeting high-power units
            score += target.power;
        }
        
        if (card.abilities.includes('medic')) {
            // Prefer targeting high-value units from grave
            score += target.power;
            
            // Bonus for targeting units with useful abilities
            if (target.abilities.includes('spy')) {
                score += 20;
            }
        }
        
        return score;
    }
}

/**
 * Base Card Evaluator - Provides fundamental card evaluation
 */
class BaseCardEvaluator {
    constructor(player) {
        this.player = player;
    }

    /**
     * Basic card evaluation
     */
    evaluateCard(card) {
        let score = 0;
        
        if (card.isUnit()) {
            score += card.power;
            
            // Basic ability bonuses
            if (card.abilities.includes('hero')) {
                score += 5;
            }
            
            if (card.abilities.includes('spy')) {
                score += 15;
            }
            
            if (card.abilities.includes('medic')) {
                score += 10;
            }
        }
        
        return score;
    }
}
