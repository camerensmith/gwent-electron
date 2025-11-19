/**
 * Round Strategy - Handles round-specific decision making and tactics
 */
class RoundStrategy {
    constructor(player) {
        this.player = player;
    }

    /**
     * Get the optimal strategy for the current round
     */
    getRoundStrategy(roundNumber) {
        switch (roundNumber) {
            case 1:
                return this.getRound1Strategy();
            case 2:
                return this.getRound2Strategy();
            case 3:
                return this.getRound3Strategy();
            default:
                return this.getDefaultStrategy();
        }
    }

    /**
     * First round strategy - establish board presence and gather information
     */
    getRound1Strategy() {
        return {
            name: 'ESTABLISH_PRESENCE',
            objectives: [
                'ESTABLISH_BOARD_PRESENCE',
                'GATHER_INFORMATION',
                'SETUP_SYNERGIES',
                'CONSERVE_RESOURCES'
            ],
            priorities: {
                primary: 'BOARD_PRESENCE',
                secondary: 'INFORMATION_GATHERING',
                tertiary: 'SYNERGY_SETUP'
            },
            riskTolerance: 'MEDIUM',
            cardUsage: 'MODERATE',
            timing: 'EARLY_TO_MID'
        };
    }

    /**
     * Second round strategy - adapt based on first round outcome
     */
    getRound2Strategy() {
        // In round 2, health === 2 means we won round 1, health === 1 means we lost round 1
        const wonRound1 = this.player.health === 2;
        const cardAdvantage = this.player.hand.cards.length - this.player.opponent().hand.cards.length;
        
        if (wonRound1) {
            return {
                name: 'MAINTAIN_LEAD',
                objectives: [
                    'MAINTAIN_BOARD_CONTROL',
                    'CONSERVE_CARDS',
                    'FORCE_OPPONENT_COMMITMENT',
                    'SETUP_FINAL_ROUND'
                ],
                priorities: {
                    primary: 'BOARD_CONTROL',
                    secondary: 'CARD_CONSERVATION',
                    tertiary: 'OPPONENT_PRESSURE'
                },
                riskTolerance: 'LOW',
                cardUsage: 'CONSERVATIVE',
                timing: 'REACTIVE'
            };
        } else {
            return {
                name: 'RECOVER_AND_PUSH',
                objectives: [
                    'WIN_THIS_ROUND',
                    'RECOVER_CARD_ADVANTAGE',
                    'DISRUPT_OPPONENT_PLANS',
                    'ESTABLISH_STRONG_POSITION'
                ],
                priorities: {
                    primary: 'ROUND_WIN',
                    secondary: 'CARD_ADVANTAGE',
                    tertiary: 'OPPONENT_DISRUPTION'
                },
                riskTolerance: 'HIGH',
                cardUsage: 'AGGRESSIVE',
                timing: 'AGGRESSIVE'
            };
        }
    }

    /**
     * Third round strategy - final push or resource management
     */
    getRound3Strategy() {
        const health = this.player.health;
        const cardAdvantage = this.player.hand.cards.length - this.player.opponent().hand.cards.length;
        
        if (health === 1) {
            return {
                name: 'DESPERATE_PUSH',
                objectives: [
                    'WIN_AT_ALL_COSTS',
                    'MAXIMIZE_POWER_OUTPUT',
                    'IGNORE_CARD_EFFICIENCY',
                    'FORCE_OPPONENT_OUT'
                ],
                priorities: {
                    primary: 'POWER_MAXIMIZATION',
                    secondary: 'ROUND_WIN',
                    tertiary: 'OPPONENT_PRESSURE'
                },
                riskTolerance: 'MAXIMUM',
                cardUsage: 'MAXIMUM',
                timing: 'IMMEDIATE'
            };
        } else if (cardAdvantage > 2) {
            return {
                name: 'OVERWHELM',
                objectives: [
                    'OVERWHELM_OPPONENT',
                    'MAINTAIN_CARD_ADVANTAGE',
                    'FORCE_EFFICIENT_TRADES',
                    'SECURE_DECISIVE_WIN'
                ],
                priorities: {
                    primary: 'CARD_ADVANTAGE',
                    secondary: 'POWER_OUTPUT',
                    tertiary: 'EFFICIENT_TRADES'
                },
                riskTolerance: 'HIGH',
                cardUsage: 'AGGRESSIVE',
                timing: 'SUSTAINED'
            };
        } else {
            return {
                name: 'EFFICIENT_FINISH',
                objectives: [
                    'MAXIMIZE_CARD_VALUE',
                    'MAINTAIN_BOARD_PRESENCE',
                    'FORCE_OPPONENT_MISTAKES',
                    'SECURE_NARROW_WIN'
                ],
                priorities: {
                    primary: 'CARD_EFFICIENCY',
                    secondary: 'BOARD_PRESENCE',
                    tertiary: 'OPPONENT_PRESSURE'
                },
                riskTolerance: 'MEDIUM',
                cardUsage: 'EFFICIENT',
                timing: 'CALCULATED'
            };
        }
    }

    /**
     * Default strategy for unexpected situations
     */
    getDefaultStrategy() {
        return {
            name: 'ADAPTIVE',
            objectives: [
                'MAINTAIN_BOARD_PRESENCE',
                'CONSERVE_RESOURCES',
                'ADAPT_TO_SITUATION',
                'MINIMIZE_RISKS'
            ],
            priorities: {
                primary: 'ADAPTATION',
                secondary: 'RISK_MANAGEMENT',
                tertiary: 'BOARD_PRESENCE'
            },
            riskTolerance: 'LOW',
            cardUsage: 'CONSERVATIVE',
            timing: 'REACTIVE'
        };
    }

    /**
     * Determine if we should commit to winning this round
     */
    shouldCommitToRound(roundNumber) {
        const strategy = this.getRoundStrategy(roundNumber);
        
        if (roundNumber === 1) {
            // First round: commit if we have card advantage or strong synergies
            const cardAdvantage = this.player.hand.cards.length - this.player.opponent().hand.cards.length;
            return cardAdvantage > 1;
        } else if (roundNumber === 2) {
            // Second round: commit if we lost first round or have significant advantage
            // In round 2, health === 1 means we lost round 1
            const lostRound1 = this.player.health === 1;
            if (lostRound1) return true; // Must commit if we lost round 1
            const powerAdvantage = this.player.total - this.player.opponent().total;
            return powerAdvantage > 20;
        } else {
            // Third round: always commit
            return true;
        }
    }

    /**
     * Get the optimal timing for playing cards this round
     */
    getOptimalTiming(roundNumber) {
        const strategy = this.getRoundStrategy(roundNumber);
        
        switch (strategy.timing) {
            case 'EARLY_TO_MID':
                return {
                    early: 0.3,
                    mid: 0.5,
                    late: 0.2
                };
            case 'REACTIVE':
                return {
                    early: 0.2,
                    mid: 0.3,
                    late: 0.5
                };
            case 'AGGRESSIVE':
                return {
                    early: 0.5,
                    mid: 0.3,
                    late: 0.2
                };
            case 'SUSTAINED':
                return {
                    early: 0.3,
                    mid: 0.4,
                    late: 0.3
                };
            case 'IMMEDIATE':
                return {
                    early: 0.7,
                    mid: 0.2,
                    late: 0.1
                };
            case 'CALCULATED':
                return {
                    early: 0.2,
                    mid: 0.5,
                    late: 0.3
                };
            default:
                return {
                    early: 0.3,
                    mid: 0.4,
                    late: 0.3
                };
        }
    }

    /**
     * Determine if we should pass based on round strategy
     */
    shouldPassBasedOnStrategy(roundNumber) {
        const strategy = this.getRoundStrategy(roundNumber);
        const opponentPassed = this.player.opponent().passed;
        const powerDifference = this.player.opponent().total - this.player.total;
        
        // Always pass if opponent passed and we're winning
        if (opponentPassed && this.player.winning) {
            return true;
        }
        
        // Strategic passing based on round and strategy
        if (roundNumber === 1) {
            // First round: pass if we're significantly behind and strategy is defensive
            if (strategy.name === 'ESTABLISH_PRESENCE' && powerDifference > 25) {
                return true;
            }
        } else if (roundNumber === 2) {
            // Second round: only pass if we won first round and have control
            // NEVER pass if we lost round 1 - we need to win this round!
            const wonRound1 = this.player.health === 2;
            if (wonRound1 && strategy.name === 'MAINTAIN_LEAD' && powerDifference < -15) {
                return true;
            }
        } else if (roundNumber === 3) {
            // Third round: pass if we're way ahead and opponent hasn't passed
            if (powerDifference < -30 && !opponentPassed) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get the optimal number of cards to play this round
     */
    getOptimalCardCount(roundNumber) {
        const strategy = this.getRoundStrategy(roundNumber);
        const handSize = this.player.hand.cards.length;
        
        switch (strategy.cardUsage) {
            case 'MINIMAL':
                return Math.min(1, handSize);
            case 'CONSERVATIVE':
                return Math.min(2, handSize);
            case 'MODERATE':
                return Math.min(3, handSize);
            case 'AGGRESSIVE':
                return Math.min(4, handSize);
            case 'EFFICIENT':
                return Math.min(Math.ceil(handSize * 0.6), handSize);
            case 'MAXIMUM':
                return handSize;
            default:
                return Math.min(2, handSize);
        }
    }

    /**
     * Determine if we should use special abilities this round
     */
    shouldUseSpecialAbilities(roundNumber) {
        const strategy = this.getRoundStrategy(roundNumber);
        const health = this.player.health;
        
        // Always use abilities if we're desperate
        if (health === 1) return true;
        
        // Use abilities based on strategy
        switch (strategy.name) {
            case 'ESTABLISH_PRESENCE':
                return roundNumber === 1;
            case 'MAINTAIN_LEAD':
                return false; // Save for later
            case 'RECOVER_AND_PUSH':
                return true; // Need every advantage
            case 'DESPERATE_PUSH':
                return true;
            case 'OVERWHELM':
                return true;
            case 'EFFICIENT_FINISH':
                return false; // Save for emergencies
            default:
                return false;
        }
    }
}
