/**
 * Game State Analyzer - Provides comprehensive analysis of current game state
 */
class GameStateAnalyzer {
    constructor(player) {
        this.player = player;
    }

    /**
     * Comprehensive game state analysis
     */
    analyze() {
        return {
            boardState: this.analyzeBoardState(),
            cardAdvantage: this.analyzeCardAdvantage(),
            powerAdvantage: this.analyzePowerAdvantage(),
            strategicPosition: this.analyzeStrategicPosition(),
            roundHistory: this.analyzeRoundHistory(),
            factionAdvantages: this.analyzeFactionAdvantages()
        };
    }

    /**
     * Analyze the current board state
     */
    analyzeBoardState() {
        const ourRows = this.player.getAllRows();
        const opponentRows = this.player.opponent().getAllRows();
        
        return {
            ourRows: ourRows.map(row => this.analyzeRow(row)),
            opponentRows: opponentRows.map(row => this.analyzeRow(row)),
            weatherEffects: this.analyzeWeatherEffects(),
            specialEffects: this.analyzeSpecialEffects()
        };
    }

    /**
     * Analyze individual row state
     */
    analyzeRow(row) {
        const units = row.cards.filter(c => c.isUnit());
        const specials = row.cards.filter(c => !c.isUnit());
        
        return {
            totalPower: units.reduce((sum, c) => sum + c.power, 0),
            unitCount: units.length,
            specialCount: specials.length,
            hasWeather: row.effects.weather,
            hasHorn: row.effects.horn > 0,
            isShielded: row.isShielded(),
            highestUnit: units.length > 0 ? Math.max(...units.map(c => c.power)) : 0,
            lowestUnit: units.length > 0 ? Math.min(...units.map(c => c.power)) : 0,
            averagePower: units.length > 0 ? units.reduce((sum, c) => sum + c.power, 0) / units.length : 0
        };
    }

    /**
     * Analyze weather effects on the board
     */
    analyzeWeatherEffects() {
        const weatherTypes = Object.values(weather.types);
        const activeWeather = weatherTypes.filter(w => w.count > 0);
        
        return {
            active: activeWeather.map(w => w.name),
            affectedRows: activeWeather.flatMap(w => w.rows),
            impact: this.calculateWeatherImpact()
        };
    }

    /**
     * Calculate the impact of weather effects
     */
    calculateWeatherImpact() {
        let ourImpact = 0;
        let opponentImpact = 0;
        
        Object.values(weather.types).forEach(w => {
            if (w.count > 0) {
                w.rows.forEach(row => {
                    if (this.player.getAllRows().includes(row)) {
                        ourImpact += row.cards.filter(c => c.isUnit()).reduce((sum, c) => sum + c.power, 0);
                    } else {
                        opponentImpact += row.cards.filter(c => c.isUnit()).reduce((sum, c) => sum + c.power, 0);
                    }
                });
            }
        });
        
        return { our: ourImpact, opponent: opponentImpact };
    }

    /**
     * Analyze special effects on the board
     */
    analyzeSpecialEffects() {
        return {
            horns: this.countSpecialEffects('horn'),
            shields: this.countSpecialEffects('shield'),
            weatherClears: this.countSpecialEffects('clear')
        };
    }

    /**
     * Count special effects by type
     */
    countSpecialEffects(effectType) {
        let count = 0;
        this.player.getAllRows().forEach(row => {
            if (row.effects[effectType]) count += row.effects[effectType];
        });
        return count;
    }

    /**
     * Analyze card advantage
     */
    analyzeCardAdvantage() {
        const ourCards = this.player.hand.cards.length;
        const opponentCards = this.player.opponent().hand.cards.length;
        const ourDeck = this.player.deck.cards.length;
        const opponentDeck = this.player.opponent().deck.cards.length;
        
        return {
            handAdvantage: ourCards - opponentCards,
            deckAdvantage: ourDeck - opponentDeck,
            totalAdvantage: (ourCards + ourDeck) - (opponentCards + opponentDeck),
            handRatio: ourCards / Math.max(opponentCards, 1),
            deckRatio: ourDeck / Math.max(opponentDeck, 1)
        };
    }

    /**
     * Analyze power advantage
     */
    analyzePowerAdvantage() {
        const ourPower = this.player.total;
        const opponentPower = this.player.opponent().total;
        const difference = ourPower - opponentPower;
        
        return {
            ourPower,
            opponentPower,
            difference,
            ourAdvantage: Math.max(0, difference),
            opponentAdvantage: Math.max(0, -difference),
            powerRatio: ourPower / Math.max(opponentPower, 1)
        };
    }

    /**
     * Analyze strategic position
     */
    analyzeStrategicPosition() {
        const cardAdvantage = this.analyzeCardAdvantage();
        const powerAdvantage = this.analyzePowerAdvantage();
        
        // Calculate strategic score (-100 to 100, where positive is good for us)
        let strategicScore = 0;
        
        // Card advantage contribution (40% weight)
        strategicScore += (cardAdvantage.handAdvantage * 5) + (cardAdvantage.deckAdvantage * 2);
        
        // Power advantage contribution (30% weight)
        strategicScore += powerAdvantage.difference * 0.5;
        
        // Board control contribution (20% weight)
        const boardControl = this.calculateBoardControl();
        strategicScore += boardControl * 10;
        
        // Weather advantage contribution (10% weight)
        const weatherAdvantage = this.calculateWeatherAdvantage();
        strategicScore += weatherAdvantage * 5;
        
        return {
            score: Math.max(-100, Math.min(100, strategicScore)),
            boardControl,
            weatherAdvantage,
            position: this.getPositionDescription(strategicScore)
        };
    }

    /**
     * Calculate board control percentage
     */
    calculateBoardControl() {
        const ourRows = this.player.getAllRows();
        const opponentRows = this.player.opponent().getAllRows();
        
        let ourControl = 0;
        let opponentControl = 0;
        
        ourRows.forEach(row => {
            ourControl += row.cards.filter(c => c.isUnit()).reduce((sum, c) => sum + c.power, 0);
        });
        
        opponentRows.forEach(row => {
            opponentControl += row.cards.filter(c => c.isUnit()).reduce((sum, c) => sum + c.power, 0);
        });
        
        const total = ourControl + opponentControl;
        return total > 0 ? (ourControl / total) * 100 : 50;
    }

    /**
     * Calculate weather advantage
     */
    calculateWeatherAdvantage() {
        const weatherImpact = this.calculateWeatherImpact();
        const totalImpact = weatherImpact.our + weatherImpact.opponent;
        
        if (totalImpact === 0) return 0;
        return ((weatherImpact.opponent - weatherImpact.our) / totalImpact) * 100;
    }

    /**
     * Get position description
     */
    getPositionDescription(score) {
        if (score >= 75) return 'DOMINANT';
        if (score >= 50) return 'ADVANTAGEOUS';
        if (score >= 25) return 'SLIGHTLY_FAVORABLE';
        if (score >= -25) return 'EVEN';
        if (score >= -50) return 'SLIGHTLY_UNFAVORABLE';
        if (score >= -75) return 'DISADVANTAGEOUS';
        return 'CRITICAL';
    }

    /**
     * Analyze round history
     */
    analyzeRoundHistory() {
        // This would need to be implemented based on how the game tracks round history
        return {
            roundsWon: 0, // Placeholder
            roundsLost: 0, // Placeholder
            currentStreak: 0 // Placeholder
        };
    }

    /**
     * Analyze faction-specific advantages
     */
    analyzeFactionAdvantages() {
        const ourFaction = this.player.deck.faction;
        const opponentFaction = this.player.opponent().deck.faction;
        
        return {
            ourFaction,
            opponentFaction,
            factionMatchup: this.getFactionMatchup(ourFaction, opponentFaction),
            ourFactionStrength: this.getFactionStrength(ourFaction),
            opponentFactionStrength: this.getFactionStrength(opponentFaction)
        };
    }

    /**
     * Get faction matchup analysis
     */
    getFactionMatchup(ourFaction, opponentFaction) {
        // This would contain faction-specific matchup logic
        const matchups = {
            'nilfgaard': { 'monsters': 'FAVORABLE', 'northern_realms': 'EVEN', 'scoiatael': 'UNFAVORABLE' },
            'monsters': { 'nilfgaard': 'UNFAVORABLE', 'northern_realms': 'FAVORABLE', 'scoiatael': 'EVEN' },
            'northern_realms': { 'nilfgaard': 'EVEN', 'monsters': 'UNFAVORABLE', 'scoiatael': 'FAVORABLE' },
            'scoiatael': { 'nilfgaard': 'FAVORABLE', 'monsters': 'EVEN', 'northern_realms': 'UNFAVORABLE' }
        };
        
        return matchups[ourFaction]?.[opponentFaction] || 'UNKNOWN';
    }

    /**
     * Get faction strength rating
     */
    getFactionStrength(faction) {
        const strengths = {
            'nilfgaard': 85,
            'monsters': 80,
            'northern_realms': 75,
            'scoiatael': 70
        };
        
        return strengths[faction] || 50;
    }
}
