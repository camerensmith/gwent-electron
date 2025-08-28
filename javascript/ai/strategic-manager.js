/**
 * Strategic Manager - Handles high-level game strategy and round management
 */
class StrategicManager {
    constructor(player) {
        this.player = player;
        this.gameState = new GameStateAnalyzer(player);
        this.roundStrategy = new RoundStrategy(player);
    }

    /**
     * Determine the overall strategy for the current game state
     */
    getGameStrategy() {
        const state = this.gameState.analyze();
        const round = game.roundCount;
        const cardsInHand = this.player.hand.cards.length;
        const opponentCards = this.player.opponent().hand.cards.length;
        
        // Determine if we should be aggressive, defensive, or balanced
        if (round === 1) {
            return this.getRound1Strategy(state, cardsInHand, opponentCards);
        } else if (round === 2) {
            return this.getRound2Strategy(state, cardsInHand, opponentCards);
        } else {
            return this.getRound3Strategy(state, cardsInHand, opponentCards);
        }
    }

    /**
     * First round strategy - establish board presence
     */
    getRound1Strategy(state, cardsInHand, opponentCards) {
        if (cardsInHand > opponentCards + 2) {
            return {
                type: 'AGGRESSIVE',
                priority: 'ESTABLISH_PRESENCE',
                riskTolerance: 'HIGH',
                cardUsage: 'MODERATE'
            };
        } else if (cardsInHand < opponentCards - 2) {
            return {
                type: 'DEFENSIVE',
                priority: 'CONSERVE_RESOURCES',
                riskTolerance: 'LOW',
                cardUsage: 'MINIMAL'
            };
        } else {
            return {
                type: 'BALANCED',
                priority: 'CONTROL_BOARD',
                riskTolerance: 'MEDIUM',
                cardUsage: 'MODERATE'
            };
        }
    }

    /**
     * Second round strategy - adapt based on first round outcome
     */
    getRound2Strategy(state, cardsInHand, opponentCards) {
        if (state.wonRound1) {
            return {
                type: 'CONTROL',
                priority: 'MAINTAIN_LEAD',
                riskTolerance: 'LOW',
                cardUsage: 'CONSERVATIVE'
            };
        } else {
            return {
                type: 'AGGRESSIVE',
                priority: 'WIN_ROUND',
                riskTolerance: 'HIGH',
                cardUsage: 'AGGRESSIVE'
            };
        }
    }

    /**
     * Third round strategy - final push or resource management
     */
    getRound3Strategy(state, cardsInHand, opponentCards) {
        if (this.player.health === 1) {
            return {
                type: 'DESPERATE',
                priority: 'WIN_AT_ALL_COSTS',
                riskTolerance: 'MAXIMUM',
                cardUsage: 'MAXIMUM'
            };
        } else if (cardsInHand > opponentCards) {
            return {
                type: 'OVERWHELM',
                priority: 'OVERWHELM_OPPONENT',
                riskTolerance: 'HIGH',
                cardUsage: 'AGGRESSIVE'
            };
        } else {
            return {
                type: 'EFFICIENT',
                priority: 'MAXIMIZE_VALUE',
                riskTolerance: 'MEDIUM',
                cardUsage: 'EFFICIENT'
            };
        }
    }

    /**
     * Decide whether to pass this round
     */
    shouldPass() {
        const strategy = this.getGameStrategy();
        const state = this.gameState.analyze();
        
        // Always pass if we're winning and opponent passed
        if (this.player.opponent().passed && this.player.winning) {
            return true;
        }

        // Strategic passing based on game state
        if (strategy.type === 'DEFENSIVE' && state.opponentAdvantage > 20) {
            return true;
        }

        if (strategy.type === 'CONTROL' && state.ourAdvantage > 15) {
            return true;
        }

        // Pass if we're significantly behind and need to conserve cards
        if (state.opponentAdvantage > 30 && this.player.hand.cards.length < 4) {
            return true;
        }

        return false;
    }

    /**
     * Get the optimal number of cards to play this turn
     */
    getOptimalCardCount() {
        const strategy = this.getGameStrategy();
        const state = this.gameState.analyze();
        
        switch (strategy.cardUsage) {
            case 'MINIMAL':
                return 1;
            case 'CONSERVATIVE':
                return Math.min(2, this.player.hand.cards.length);
            case 'MODERATE':
                return Math.min(3, this.player.hand.cards.length);
            case 'AGGRESSIVE':
                return Math.min(4, this.player.hand.cards.length);
            case 'MAXIMUM':
                return this.player.hand.cards.length;
            default:
                return 2;
        }
    }
}
