/**
 * Gwent Classic Statistics Tracker
 * Tracks comprehensive game statistics and saves them locally
 */

class StatisticsTracker {
    constructor() {
        this.stats = this.loadStats();
        this.currentGame = {
            startTime: null,
            playerDeck: null,
            opponentDeck: null,
            playerLeader: null,
            opponentLeader: null,
            rounds: [],
            finalResult: null,
            maxUnitsInHand: 0,
            maxUnitsOnBoard: 0,
            cardsPlayed: [],
            abilitiesUsed: []
        };
        this.sessionStats = {
            gamesPlayed: 0,
            startTime: Date.now()
        };
        
        // Initialize tracking
        this.setupEventListeners();
        this.integrateWithGameLogic();
        console.log('Statistics Tracker initialized');
    }
    
    /**
     * Load existing statistics from localStorage
     */
    loadStats() {
        try {
            const saved = localStorage.getItem('gwent-stats');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('Loaded existing statistics:', parsed);
                return parsed;
            }
        } catch (e) {
            console.error('Error loading statistics:', e);
        }
        
        // Return default structure
        return {
            profile: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0,
                totalPlayTime: 0,
                favoriteFaction: null,
                favoriteLeader: null,
                favoriteCard: null,
                mostUsedFaction: null,
                mostUsedLeader: null,
                lastPlayed: null
            },
            factions: {
                northern_realms: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
                monsters: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
                nilfgaard: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
                scoiatael: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
                skellige: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
                syndicate: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
                toussaint: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
                lyria_rivia: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
                witcher_universe: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 }
            },
            leaders: {},
            cards: {},
            opponents: {},
            records: {
                mostUnitsInHand: 0,
                mostUnitsOnBoard: 0,
                longestGame: 0,
                shortestGame: 0,
                mostCardsPlayed: 0,
                mostAbilitiesUsed: 0
            },
            gameHistory: [],
            sessionHistory: []
        };
    }
    
    /**
     * Save statistics to localStorage
     */
    saveStats() {
        try {
            localStorage.setItem('gwent-stats', JSON.stringify(this.stats));
            console.log('Statistics saved successfully');
        } catch (e) {
            console.error('Error saving statistics:', e);
        }
    }
    
    /**
     * Integrate with existing game logic
     */
    integrateWithGameLogic() {
        // Override the existing showStats function to include our enhanced stats
        if (typeof showStats !== 'undefined') {
            const originalShowStats = showStats;
            window.showStats = (apagarFim) => {
                // Call original function
                originalShowStats(apagarFim);
                
                // Also show our enhanced stats
                setTimeout(() => {
                    this.showEnhancedStats();
                }, 1000);
            };
        }
        
        // Hook into the existing game logic
        this.hookIntoGameEvents();
    }
    
    /**
     * Hook into existing game events
     */
    hookIntoGameEvents() {
        // Watch for the start game button
        const startGameBtn = document.getElementById('start-game');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                setTimeout(() => this.onGameStart(), 500);
            });
        }
        
        // Watch for AI game start
        const startAIGameBtn = document.getElementById('start-ai-game');
        if (startAIGameBtn) {
            startAIGameBtn.addEventListener('click', () => {
                setTimeout(() => this.onGameStart(), 500);
            });
        }
        
        // Watch for deck changes
        this.observeDeckChanges();
        
        // Watch for game state changes
        this.observeGameStateChanges();
    }
    
    /**
     * Observe deck changes
     */
    observeDeckChanges() {
        // Watch for faction changes
        const changeFactionBtn = document.getElementById('change-faction');
        if (changeFactionBtn) {
            changeFactionBtn.addEventListener('click', () => {
                setTimeout(() => this.updateCurrentDeckInfo(), 1000);
            });
        }
        
        // Watch for deck selection
        const selectDeckBtn = document.getElementById('select-deck');
        if (selectDeckBtn) {
            selectDeckBtn.addEventListener('click', () => {
                setTimeout(() => this.updateCurrentDeckInfo(), 1000);
            });
        }
    }
    
    /**
     * Update current deck information
     */
    updateCurrentDeckInfo() {
        if (this.currentGame.startTime) {
            this.currentGame.playerDeck = this.getCurrentDeck();
            this.currentGame.playerLeader = this.getPlayerLeader();
            console.log('Updated deck info:', this.currentGame.playerDeck, this.currentGame.playerLeader);
        }
    }
    
    /**
     * Observe game state changes
     */
    observeGameStateChanges() {
        // Watch for round changes by monitoring the round scores
        setInterval(() => {
            if (this.currentGame.startTime) {
                this.checkForRoundChange();
                this.updateHandAndBoardCounts();
            }
        }, 1000);
    }
    
    /**
     * Check for round changes
     */
    checkForRoundChange() {
        try {
            const roundScores = document.querySelectorAll('.row-score');
            if (roundScores.length >= 3) {
                const currentRound = this.getCurrentRoundFromScores(roundScores);
                if (currentRound !== this.currentGame.rounds.length + 1) {
                    this.onRoundChange(currentRound);
                }
            }
        } catch (e) {
            // Ignore errors
        }
    }
    
    /**
     * Get current round from score display
     */
    getCurrentRoundFromScores(roundScores) {
        let activeRound = 1;
        for (let i = 0; i < roundScores.length; i++) {
            const score = roundScores[i].textContent;
            if (score !== '0' && score !== '') {
                activeRound = i + 1;
            }
        }
        return activeRound;
    }
    
    /**
     * Update hand and board counts
     */
    updateHandAndBoardCounts() {
        const handSize = this.getHandSize();
        const boardUnits = this.getBoardUnits();
        
        if (handSize > this.currentGame.maxUnitsInHand) {
            this.currentGame.maxUnitsInHand = handSize;
        }
        
        if (boardUnits > this.currentGame.maxUnitsOnBoard) {
            this.currentGame.maxUnitsOnBoard = boardUnits;
        }
    }
    
    /**
     * Show enhanced statistics
     */
    showEnhancedStats() {
        if (!this.stats.profile.totalGames) {
            return; // No stats to show
        }
        
        // Show the full statistics modal instead of just a message
        this.showStatisticsModal();
    }
    
    /**
     * Show statistics in a modal overlay within the game
     */
    showStatisticsModal() {
        if (!this.stats.profile.totalGames) {
            this.showNoStatsMessage();
            return;
        }
        
        this.createStatisticsModal();
        this.displayStatsInModal();
    }
    
    /**
     * Show message when no statistics are available
     */
    showNoStatsMessage() {
        const message = `
🎯 No Statistics Available Yet

Start playing games to see your comprehensive statistics!

The tracker will automatically monitor:
• Game results and win rates
• Faction performance
• Leader usage patterns
• Personal records and achievements
• Session information
        `;
        
        if (typeof aviso !== 'undefined') {
            aviso("Statistics", message);
        } else {
            alert(message);
        }
    }
    
    /**
     * Create the statistics modal overlay
     */
    createStatisticsModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('statistics-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'statistics-modal';
        modal.className = 'statistics-modal-overlay';
        
        modal.innerHTML = `
            <div class="statistics-modal-content">
                <div class="statistics-modal-header">
                    <h2>🎯 Gwent Classic Statistics</h2>
                    <button class="statistics-close-btn" onclick="window.statsTracker.closeStatisticsModal()">×</button>
                </div>
                <div class="statistics-modal-body" id="statistics-modal-content">
                    Loading statistics...
                </div>
                <div class="statistics-modal-footer">
                    <button class="statistics-btn" onclick="window.statsTracker.refreshModalStats()">🔄 Refresh</button>
                    <button class="statistics-btn" onclick="window.statsTracker.exportStats()">📊 Export Data</button>
                    <button class="statistics-btn statistics-btn-danger" onclick="window.statsTracker.clearStats()">🗑️ Clear Stats</button>
                </div>
            </div>
        `;
        
        // Add styles
        this.addStatisticsModalStyles();
        
        // Add to body
        document.body.appendChild(modal);
        
        // Add event listeners
        this.addModalEventListeners(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    /**
     * Add CSS styles for the statistics modal
     */
    addStatisticsModalStyles() {
        if (document.getElementById('statistics-modal-styles')) {
            return; // Styles already added
        }
        
        const style = document.createElement('style');
        style.id = 'statistics-modal-styles';
        style.textContent = `
            .statistics-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .statistics-modal-overlay.show {
                opacity: 1;
            }
            
            .statistics-modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                border-radius: 15px;
                max-width: 90vw;
                max-height: 90vh;
                width: 1200px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .statistics-modal-overlay.show .statistics-modal-content {
                transform: scale(1);
            }
            
            .statistics-modal-header {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .statistics-modal-header h2 {
                color: #ffd700;
                margin: 0;
                font-size: 1.8em;
            }
            
            .statistics-close-btn {
                background: none;
                border: none;
                color: #fff;
                font-size: 2em;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s ease;
            }
            
            .statistics-close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .statistics-modal-body {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
                color: #e8e8e8;
            }
            
            .statistics-modal-footer {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px 20px;
                display: flex;
                justify-content: center;
                gap: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .statistics-btn {
                background: linear-gradient(135deg, #ffd700, #ffed4e);
                color: #000;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .statistics-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
            }
            
            .statistics-btn-danger {
                background: linear-gradient(135deg, #f87171, #ef4444);
                color: #fff;
            }
            
            .statistics-btn-danger:hover {
                box-shadow: 0 5px 15px rgba(248, 113, 113, 0.3);
            }
            
            .statistics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
            }
            
            .statistics-card {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .statistics-card h3 {
                color: #ffd700;
                margin-bottom: 15px;
                border-bottom: 2px solid rgba(255, 215, 0, 0.3);
                padding-bottom: 8px;
            }
            
            .statistics-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
            }
            
            .statistics-label {
                color: #b8b8b8;
                font-weight: 500;
            }
            
            .statistics-value {
                color: #ffffff;
                font-weight: bold;
            }
            
            .statistics-percentage {
                color: #4ade80;
            }
            
            .statistics-faction-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .statistics-faction-item {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                padding: 12px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .statistics-faction-name {
                font-weight: bold;
                margin-bottom: 8px;
                color: #ffd700;
                font-size: 0.9em;
            }
            
            .statistics-faction-winrate {
                font-size: 1.1em;
                font-weight: bold;
            }
            
            .winrate-high { color: #4ade80; }
            .winrate-medium { color: #fbbf24; }
            .winrate-low { color: #f87171; }
            
            .statistics-record-item {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
                border: 1px solid rgba(255, 215, 0, 0.3);
            }
            
            .statistics-record-value {
                color: #ffd700;
            }
            
            .statistics-game-item {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 8px;
                border-left: 4px solid;
            }
            
            .statistics-game-win { border-left-color: #4ade80; }
            .statistics-game-loss { border-left-color: #f87171; }
            .statistics-game-draw { border-left-color: #fbbf24; }
            
            .statistics-game-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .statistics-game-result {
                font-weight: bold;
                padding: 3px 10px;
                border-radius: 15px;
                font-size: 0.8em;
            }
            
            .statistics-game-win .statistics-game-result { background: #4ade80; color: #000; }
            .statistics-game-loss .statistics-game-result { background: #f87171; color: #000; }
            .statistics-game-draw .statistics-game-result { background: #fbbf24; color: #000; }
            
            .statistics-game-details {
                font-size: 0.8em;
                opacity: 0.8;
            }
            
            @media (max-width: 768px) {
                .statistics-modal-content {
                    width: 95vw;
                    max-height: 95vh;
                }
                
                .statistics-grid {
                    grid-template-columns: 1fr;
                }
                
                .statistics-faction-grid {
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Add event listeners for the modal
     */
    addModalEventListeners(modal) {
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeStatisticsModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Close on click outside modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeStatisticsModal();
            }
        });
        
        // Store the escape handler for cleanup
        modal._escapeHandler = handleEscape;
    }
    
    /**
     * Display statistics in the modal
     */
    displayStatsInModal() {
        const content = document.getElementById('statistics-modal-content');
        if (!content) return;
        
        const stats = this.getStatsSummary();
        
        content.innerHTML = `
            <div class="statistics-grid">
                <!-- Profile Overview -->
                <div class="statistics-card">
                    <h3>👤 Profile Overview</h3>
                    <div class="statistics-item">
                        <span class="statistics-label">Total Games</span>
                        <span class="statistics-value">${stats.profile.totalGames}</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Wins</span>
                        <span class="statistics-value">${stats.profile.wins}</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Losses</span>
                        <span class="statistics-value">${stats.profile.losses}</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Draws</span>
                        <span class="statistics-value">${stats.profile.draws}</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Win Rate</span>
                        <span class="statistics-value statistics-percentage">${stats.profile.winRate.toFixed(1)}%</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Last Played</span>
                        <span class="statistics-value">${this.formatDate(stats.profile.lastPlayed)}</span>
                    </div>
                </div>
                
                <!-- Favorites -->
                <div class="statistics-card">
                    <h3>⭐ Favorites</h3>
                    <div class="statistics-item">
                        <span class="statistics-label">Favorite Faction</span>
                        <span class="statistics-value">${this.formatFaction(stats.profile.mostUsedFaction)}</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Favorite Leader</span>
                        <span class="statistics-value">${stats.profile.mostUsedLeader || 'None'}</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Favorite Card</span>
                        <span class="statistics-value">${stats.profile.favoriteCard || 'None'}</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Session Games</span>
                        <span class="statistics-value">${stats.sessionStats.gamesPlayed}</span>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Session Duration</span>
                        <span class="statistics-value">${this.formatDuration(Date.now() - stats.sessionStats.startTime)}</span>
                    </div>
                </div>
                
                <!-- Faction Performance -->
                <div class="statistics-card">
                    <h3>🏰 Faction Performance</h3>
                    <div class="statistics-faction-grid">
                        ${Object.entries(stats.factions)
                            .filter(([_, faction]) => faction.games > 0)
                            .sort(([_, a], [__, b]) => b.games - a.games)
                            .map(([faction, data]) => `
                                <div class="statistics-faction-item">
                                    <div class="statistics-faction-name">${this.formatFaction(faction)}</div>
                                    <div class="statistics-item">
                                        <span class="statistics-label">Games</span>
                                        <span class="statistics-value">${data.games}</span>
                                    </div>
                                    <div class="statistics-item">
                                        <span class="statistics-label">Win Rate</span>
                                        <span class="statistics-faction-winrate ${this.getWinrateClass(data.winRate)}">${data.winRate.toFixed(1)}%</span>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
                
                <!-- Records -->
                <div class="statistics-card">
                    <h3>🏆 Records & Achievements</h3>
                    <div class="statistics-item statistics-record-item">
                        <span class="statistics-label">Most Units in Hand</span>
                        <span class="statistics-value statistics-record-value">${stats.records.mostUnitsInHand}</span>
                    </div>
                    <div class="statistics-item statistics-record-item">
                        <span class="statistics-label">Most Units on Board</span>
                        <span class="statistics-value statistics-record-value">${stats.records.mostUnitsOnBoard}</span>
                    </div>
                    <div class="statistics-item statistics-record-item">
                        <span class="statistics-label">Longest Game</span>
                        <span class="statistics-value statistics-record-value">${this.formatDuration(stats.records.longestGame)}</span>
                    </div>
                    <div class="statistics-item statistics-record-item">
                        <span class="statistics-label">Shortest Game</span>
                        <span class="statistics-value statistics-record-value">${this.formatDuration(stats.records.shortestGame)}</span>
                    </div>
                    <div class="statistics-item statistics-record-item">
                        <span class="statistics-label">Most Cards Played</span>
                        <span class="statistics-value statistics-record-value">${stats.records.mostCardsPlayed}</span>
                    </div>
                </div>
                
                <!-- Recent Games -->
                <div class="statistics-card">
                    <h3>📜 Recent Games</h3>
                    ${stats.recentGames.length > 0 ? 
                        stats.recentGames.reverse().map(game => `
                            <div class="statistics-game-item statistics-game-${game.finalResult}">
                                <div class="statistics-game-header">
                                    <span class="statistics-game-result">${game.finalResult.toUpperCase()}</span>
                                    <span class="statistics-game-details">${this.formatDate(game.timestamp)}</span>
                                </div>
                                <div class="statistics-game-details">
                                    Deck: ${game.playerDeck || 'Unknown'} | 
                                    Leader: ${game.playerLeader || 'Unknown'} | 
                                    Duration: ${this.formatDuration(game.duration)} | 
                                    Cards: ${game.cardsPlayed.length} | 
                                    Max Hand: ${game.maxUnitsInHand} | 
                                    Max Board: ${game.maxUnitsOnBoard}
                                </div>
                            </div>
                        `).join('') : 
                        '<div style="text-align: center; color: #b8b8b8; font-style: italic; padding: 20px;">No recent games to display</div>'
                    }
                </div>
            </div>
        `;
    }
    
    /**
     * Refresh the statistics in the modal
     */
    refreshModalStats() {
        this.displayStatsInModal();
    }
    
    /**
     * Close the statistics modal
     */
    closeStatisticsModal() {
        const modal = document.getElementById('statistics-modal');
        if (modal) {
            // Clean up event listeners
            if (modal._escapeHandler) {
                document.removeEventListener('keydown', modal._escapeHandler);
            }
            
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    /**
     * Get winrate class for styling
     */
    getWinrateClass(winrate) {
        if (winrate >= 60) return 'winrate-high';
        if (winrate >= 40) return 'winrate-medium';
        return 'winrate-low';
    }
    
    /**
     * Format date for display
     */
    formatDate(timestamp) {
        if (!timestamp) return 'Never';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }
    
    /**
     * Format duration for display
     */
    formatDuration(milliseconds) {
        if (!milliseconds) return '0s';
        
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Format faction name for display
     */
    formatFaction(faction) {
        if (!faction) return 'None';
        
        const factionNames = {
            'northern_realms': 'Northern Realms',
            'monsters': 'Monsters',
            'nilfgaard': 'Nilfgaard',
            'scoiatael': 'Scoia\'tael',
            'skellige': 'Skellige',
            'syndicate': 'Syndicate',
            'toussaint': 'Toussaint',
            'lyria_rivia': 'Lyria & Rivia',
            'witcher_universe': 'Witcher Universe'
        };
        
        return factionNames[faction] || faction;
    }
    
    /**
     * Setup event listeners for tracking
     */
    setupEventListeners() {
        // Listen for game events
        document.addEventListener('DOMContentLoaded', () => {
            this.observeGameState();
        });
        
        // Track when game starts
        this.observeGameStart();
        
        // Track card plays
        this.observeCardPlays();
        
        // Track round changes
        this.observeRoundChanges();
        
        // Track game end
        this.observeGameEnd();
    }
    
    /**
     * Observe game state changes
     */
    observeGameState() {
        // Monitor hand size changes
        this.observeHandSize();
        
        // Monitor board state changes
        this.observeBoardState();
        
        // Monitor leader usage
        this.observeLeaderUsage();
    }
    
    /**
     * Track when a game starts
     */
    observeGameStart() {
        // Watch for the start button click or game initialization
        const startButton = document.getElementById('button_start');
        if (startButton) {
            startButton.addEventListener('click', () => {
                setTimeout(() => this.onGameStart(), 100);
            });
        }
        
        // Also watch for URL changes or other game start indicators
        this.watchForGameStart();
    }
    
    /**
     * Watch for game start through various indicators
     */
    watchForGameStart() {
        // Check periodically for game start indicators
        setInterval(() => {
            if (this.isGameActive() && !this.currentGame.startTime) {
                this.onGameStart();
            }
        }, 1000);
    }
    
    /**
     * Check if a game is currently active
     */
    isGameActive() {
        // Look for game UI elements
        const gameBoard = document.querySelector('.game-board');
        const endScreen = document.getElementById('end-screen');
        const deckCustomization = document.getElementById('deck-customization');
        
        return gameBoard && gameBoard.style.display !== 'none' && 
               (!endScreen || endScreen.style.display === 'none') &&
               (!deckCustomization || deckCustomization.style.display === 'none');
    }
    
    /**
     * Called when a game starts
     */
    onGameStart() {
        this.currentGame = {
            startTime: Date.now(),
            playerDeck: this.getCurrentDeck(),
            opponentDeck: this.getOpponentDeck(),
            playerLeader: this.getPlayerLeader(),
            opponentLeader: this.getOpponentLeader(),
            rounds: [],
            finalResult: null,
            maxUnitsInHand: 0,
            maxUnitsOnBoard: 0,
            cardsPlayed: [],
            abilitiesUsed: []
        };
        
        console.log('Game started - tracking statistics:', this.currentGame);
        
        // Start monitoring hand and board
        this.startMonitoring();
    }
    
    /**
     * Get current player's deck information
     */
    getCurrentDeck() {
        try {
            // Look for deck selection UI or current deck info
            const deckSelectors = document.querySelectorAll('.deck-selector, .deck-option');
            for (let selector of deckSelectors) {
                if (selector.classList.contains('selected') || selector.classList.contains('active')) {
                    return selector.getAttribute('data-deck') || selector.textContent.trim();
                }
            }
            
            // Fallback: check if we can find deck info in the UI
            const deckInfo = document.querySelector('.deck-info, .current-deck');
            if (deckInfo) {
                return deckInfo.textContent.trim();
            }
            
            // Try to get from the deck name display
            const deckNameDisplay = document.getElementById('deck-name-me');
            if (deckNameDisplay && deckNameDisplay.textContent) {
                return deckNameDisplay.textContent.trim();
            }
            
            return 'unknown';
        } catch (e) {
            console.log('Could not determine current deck:', e);
            return 'unknown';
        }
    }
    
    /**
     * Get opponent's deck information
     */
    getOpponentDeck() {
        try {
            // This might be available after the game starts
            // For now, we'll track it when we can detect it
            return 'unknown';
        } catch (e) {
            return 'unknown';
        }
    }
    
    /**
     * Get player's leader
     */
    getPlayerLeader() {
        try {
            // Look for leader display in the UI
            const leaderDisplay = document.querySelector('.player-leader, .leader-card');
            if (leaderDisplay) {
                return leaderDisplay.getAttribute('data-leader') || leaderDisplay.textContent.trim();
            }
            
            // Try to get from the leader container
            const leaderContainer = document.getElementById('leader-me');
            if (leaderContainer) {
                const leaderCard = leaderContainer.querySelector('.card');
                if (leaderCard) {
                    return leaderCard.getAttribute('data-name') || 'Unknown Leader';
                }
            }
            
            return 'unknown';
        } catch (e) {
            return 'unknown';
        }
    }
    
    /**
     * Get opponent's leader
     */
    getOpponentLeader() {
        try {
            // Look for opponent leader display
            const opponentLeader = document.querySelector('.opponent-leader, .enemy-leader');
            if (opponentLeader) {
                return opponentLeader.getAttribute('data-leader') || opponentLeader.textContent.trim();
            }
            
            // Try to get from the opponent leader container
            const opponentLeaderContainer = document.getElementById('leader-op');
            if (opponentLeaderContainer) {
                const leaderCard = opponentLeaderContainer.querySelector('.card');
                if (leaderCard) {
                    return leaderCard.getAttribute('data-name') || 'Unknown Leader';
                }
            }
            
            return 'unknown';
        } catch (e) {
            return 'unknown';
        }
    }
    
    /**
     * Start monitoring game state
     */
    startMonitoring() {
        // Monitor hand size
        this.monitorHandSize();
        
        // Monitor board state
        this.monitorBoardState();
        
        // Monitor round changes
        this.monitorRounds();
    }
    
    /**
     * Monitor hand size changes
     */
    monitorHandSize() {
        setInterval(() => {
            if (this.currentGame.startTime) {
                const handSize = this.getHandSize();
                if (handSize > this.currentGame.maxUnitsInHand) {
                    this.currentGame.maxUnitsInHand = handSize;
                    console.log('New record: Most units in hand:', handSize);
                }
            }
        }, 500);
    }
    
    /**
     * Get current hand size
     */
    getHandSize() {
        try {
            const handCards = document.querySelectorAll('.hand .card, .player-hand .card');
            return handCards.length;
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * Monitor board state changes
     */
    monitorBoardState() {
        setInterval(() => {
            if (this.currentGame.startTime) {
                const boardUnits = this.getBoardUnits();
                if (boardUnits > this.currentGame.maxUnitsOnBoard) {
                    this.currentGame.maxUnitsOnBoard = boardUnits;
                    console.log('New record: Most units on board:', boardUnits);
                }
            }
        }, 500);
    }
    
    /**
     * Get current board units count
     */
    getBoardUnits() {
        try {
            const boardCards = document.querySelectorAll('.game-board .card:not(.leader)');
            return boardCards.length;
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * Monitor round changes
     */
    monitorRounds() {
        // This will be called when rounds change
        // We'll track it through the existing game logic
    }
    
    /**
     * Track when a card is played
     */
    observeCardPlays() {
        // Watch for card movements from hand to board
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkForCardPlay(node);
                        }
                    });
                }
            });
        });
        
        // Start observing the game board
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            observer.observe(gameBoard, { childList: true, subtree: true });
        }
    }
    
    /**
     * Check if a card was just played
     */
    checkForCardPlay(node) {
        if (node.classList && node.classList.contains('card')) {
            // Check if this card was just played (moved from hand to board)
            setTimeout(() => {
                this.onCardPlayed(node);
            }, 100);
        }
    }
    
    /**
     * Called when a card is played
     */
    onCardPlayed(cardElement) {
        if (!this.currentGame.startTime) return;
        
        try {
            const cardName = cardElement.getAttribute('data-name') || 
                           cardElement.querySelector('.card-name')?.textContent || 
                           'unknown';
            
            const cardFaction = cardElement.getAttribute('data-faction') || 
                              cardElement.querySelector('.card-faction')?.textContent || 
                              'unknown';
            
            this.currentGame.cardsPlayed.push({
                name: cardName,
                faction: cardFaction,
                timestamp: Date.now(),
                round: this.getCurrentRound()
            });
            
            // Update card usage statistics
            this.updateCardStats(cardName, cardFaction);
            
            console.log('Card played:', cardName, 'from faction:', cardFaction);
        } catch (e) {
            console.log('Error tracking card play:', e);
        }
    }
    
    /**
     * Get current round number
     */
    getCurrentRound() {
        try {
            // Look for round indicator in the UI
            const roundIndicator = document.querySelector('.round-indicator, .current-round');
            if (roundIndicator) {
                const roundText = roundIndicator.textContent;
                const roundMatch = roundText.match(/(\d+)/);
                return roundMatch ? parseInt(roundMatch[1]) : 1;
            }
            return 1;
        } catch (e) {
            return 1;
        }
    }
    
    /**
     * Update card usage statistics
     */
    updateCardStats(cardName, faction) {
        if (!this.stats.cards[cardName]) {
            this.stats.cards[cardName] = {
                name: cardName,
                faction: faction,
                timesPlayed: 0,
                lastPlayed: null
            };
        }
        
        this.stats.cards[cardName].timesPlayed++;
        this.stats.cards[cardName].lastPlayed = Date.now();
        
        // Update faction stats
        if (faction && this.stats.factions[faction]) {
            // We'll update win/loss stats when the game ends
        }
    }
    
    /**
     * Track round changes
     */
    observeRoundChanges() {
        // Watch for round changes in the UI
        setInterval(() => {
            if (this.currentGame.startTime) {
                const currentRound = this.getCurrentRound();
                if (currentRound !== this.currentGame.rounds.length + 1) {
                    this.onRoundChange(currentRound);
                }
            }
        }, 1000);
    }
    
    /**
     * Called when a round changes
     */
    onRoundChange(roundNumber) {
        if (!this.currentGame.startTime) return;
        
        this.currentGame.rounds.push({
            round: roundNumber,
            timestamp: Date.now(),
            handSize: this.getHandSize(),
            boardUnits: this.getBoardUnits()
        });
        
        console.log('Round changed to:', roundNumber);
    }
    
    /**
     * Track game end
     */
    observeGameEnd() {
        // Watch for end screen or game over indicators
        setInterval(() => {
            if (this.currentGame.startTime && this.isGameEnded()) {
                this.onGameEnd();
            }
        }, 1000);
    }
    
    /**
     * Check if the game has ended
     */
    isGameEnded() {
        const endScreen = document.getElementById('end-screen');
        return endScreen && endScreen.style.display !== 'none' && endScreen.style.opacity !== '0';
    }
    
    /**
     * Called when a game ends
     */
    onGameEnd() {
        if (!this.currentGame.startTime) return;
        
        try {
            // Determine game result
            this.currentGame.finalResult = this.determineGameResult();
            
            // Calculate game duration
            const gameDuration = Date.now() - this.currentGame.startTime;
            
            // Update statistics
            this.updateGameStats();
            
            // Add to game history
            this.stats.gameHistory.push({
                ...this.currentGame,
                duration: gameDuration,
                timestamp: Date.now()
            });
            
            // Keep only last 100 games
            if (this.stats.gameHistory.length > 100) {
                this.stats.gameHistory = this.stats.gameHistory.slice(-100);
            }
            
            // Update session stats
            this.sessionStats.gamesPlayed++;
            
            // Save statistics
            this.saveStats();
            
            console.log('Game ended - Result:', this.currentGame.finalResult, 'Duration:', gameDuration);
            
            // Reset current game
            this.currentGame = {
                startTime: null,
                playerDeck: null,
                opponentDeck: null,
                playerLeader: null,
                opponentLeader: null,
                rounds: [],
                finalResult: null,
                maxUnitsInHand: 0,
                maxUnitsOnBoard: 0,
                cardsPlayed: [],
                abilitiesUsed: []
            };
            
        } catch (e) {
            console.error('Error processing game end:', e);
        }
    }
    
    /**
     * Determine the result of the game
     */
    determineGameResult() {
        try {
            const endScreen = document.getElementById('end-screen');
            if (endScreen) {
                if (endScreen.querySelector('.end-win')) return 'win';
                if (endScreen.querySelector('.end-lose')) return 'loss';
                if (endScreen.querySelector('.end-draw')) return 'draw';
            }
            
            // Fallback: check player health
            const playerHealth = this.getPlayerHealth();
            const opponentHealth = this.getOpponentHealth();
            
            if (playerHealth <= 0 && opponentHealth <= 0) return 'draw';
            if (opponentHealth <= 0) return 'win';
            if (playerHealth <= 0) return 'loss';
            
            return 'unknown';
        } catch (e) {
            return 'unknown';
        }
    }
    
    /**
     * Get player health
     */
    getPlayerHealth() {
        try {
            const healthDisplay = document.querySelector('.player-health, .health-player');
            if (healthDisplay) {
                const healthText = healthDisplay.textContent;
                const healthMatch = healthText.match(/(\d+)/);
                return healthMatch ? parseInt(healthMatch[1]) : 2;
            }
            return 2;
        } catch (e) {
            return 2;
        }
    }
    
    /**
     * Get opponent health
     */
    getOpponentHealth() {
        try {
            const healthDisplay = document.querySelector('.opponent-health, .health-enemy');
            if (healthDisplay) {
                const healthText = healthDisplay.textContent;
                const healthMatch = healthText.match(/(\d+)/);
                return healthMatch ? parseInt(healthMatch[1]) : 2;
            }
            return 2;
        } catch (e) {
            return 2;
        }
    }
    
    /**
     * Update game statistics
     */
    updateGameStats() {
        const result = this.currentGame.finalResult;
        if (!result || result === 'unknown') return;
        
        // Update profile stats
        this.stats.profile.totalGames++;
        if (result === 'win') this.stats.profile.wins++;
        else if (result === 'loss') this.stats.profile.losses++;
        else if (result === 'draw') this.stats.profile.draws++;
        
        this.stats.profile.winRate = (this.stats.profile.wins / this.stats.profile.totalGames) * 100;
        this.stats.profile.lastPlayed = Date.now();
        
        // Update faction stats
        if (this.currentGame.playerDeck && this.currentGame.playerDeck !== 'unknown') {
            const faction = this.getFactionFromDeck(this.currentGame.playerDeck);
            if (faction && this.stats.factions[faction]) {
                this.stats.factions[faction].games++;
                if (result === 'win') this.stats.factions[faction].wins++;
                else if (result === 'loss') this.stats.factions[faction].losses++;
                else if (result === 'draw') this.stats.factions[faction].draws++;
                
                this.stats.factions[faction].winRate = 
                    (this.stats.factions[faction].wins / this.stats.factions[faction].games) * 100;
            }
        }
        
        // Update leader stats
        if (this.currentGame.playerLeader && this.currentGame.playerLeader !== 'unknown') {
            if (!this.stats.leaders[this.currentGame.playerLeader]) {
                this.stats.leaders[this.currentGame.playerLeader] = {
                    name: this.currentGame.playerLeader,
                    games: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    winRate: 0
                };
            }
            
            const leader = this.stats.leaders[this.currentGame.playerLeader];
            leader.games++;
            if (result === 'win') leader.wins++;
            else if (result === 'loss') leader.losses++;
            else if (result === 'draw') leader.draws++;
            
            leader.winRate = (leader.wins / leader.games) * 100;
        }
        
        // Update records
        if (this.currentGame.maxUnitsInHand > this.stats.records.mostUnitsInHand) {
            this.stats.records.mostUnitsInHand = this.currentGame.maxUnitsInHand;
        }
        
        if (this.currentGame.maxUnitsOnBoard > this.stats.records.mostUnitsOnBoard) {
            this.stats.records.mostUnitsOnBoard = this.currentGame.maxUnitsOnBoard;
        }
        
        const gameDuration = Date.now() - this.currentGame.startTime;
        if (gameDuration > this.stats.records.longestGame) {
            this.stats.records.longestGame = gameDuration;
        }
        
        if (this.stats.records.shortestGame === 0 || gameDuration < this.stats.records.shortestGame) {
            this.stats.records.shortestGame = gameDuration;
        }
        
        if (this.currentGame.cardsPlayed.length > this.stats.records.mostCardsPlayed) {
            this.stats.records.mostCardsPlayed = this.currentGame.cardsPlayed.length;
        }
        
        // Update most used faction and leader
        this.updateMostUsed();
    }
    
    /**
     * Get faction from deck name
     */
    getFactionFromDeck(deckName) {
        const deckLower = deckName.toLowerCase();
        
        if (deckLower.includes('northern') || deckLower.includes('temeria') || 
            deckLower.includes('aedirn') || deckLower.includes('kaedwen') || 
            deckLower.includes('cintra') || deckLower.includes('redania')) {
            return 'northern_realms';
        } else if (deckLower.includes('monster')) {
            return 'monsters';
        } else if (deckLower.includes('nilfgaard')) {
            return 'nilfgaard';
        } else if (deckLower.includes('scoia') || deckLower.includes('elven') || 
                   deckLower.includes('dwarven')) {
            return 'scoiatael';
        } else if (deckLower.includes('skellige')) {
            return 'skellige';
        } else if (deckLower.includes('syndicate')) {
            return 'syndicate';
        } else if (deckLower.includes('toussaint')) {
            return 'toussaint';
        } else if (deckLower.includes('lyria') || deckLower.includes('rivia')) {
            return 'lyria_rivia';
        } else if (deckLower.includes('witcher')) {
            return 'witcher_universe';
        }
        
        return null;
    }
    
    /**
     * Update most used faction and leader
     */
    updateMostUsed() {
        // Find most used faction
        let mostUsedFaction = null;
        let mostGames = 0;
        
        for (const [faction, stats] of Object.entries(this.stats.factions)) {
            if (stats.games > mostGames) {
                mostGames = stats.games;
                mostUsedFaction = faction;
            }
        }
        
        if (mostUsedFaction) {
            this.stats.profile.mostUsedFaction = mostUsedFaction;
        }
        
        // Find most used leader
        let mostUsedLeader = null;
        mostGames = 0;
        
        for (const [leader, stats] of Object.entries(this.stats.leaders)) {
            if (stats.games > mostGames) {
                mostGames = stats.games;
                mostUsedLeader = leader;
            }
        }
        
        if (mostUsedLeader) {
            this.stats.profile.mostUsedLeader = mostUsedLeader;
        }
        
        // Find favorite card (most played)
        let favoriteCard = null;
        let mostPlayed = 0;
        
        for (const [cardName, stats] of Object.entries(this.stats.cards)) {
            if (stats.timesPlayed > mostPlayed) {
                mostPlayed = stats.timesPlayed;
                favoriteCard = cardName;
            }
        }
        
        if (favoriteCard) {
            this.stats.profile.favoriteCard = favoriteCard;
        }
    }
    
    /**
     * Get statistics summary
     */
    getStatsSummary() {
        return {
            profile: this.stats.profile,
            factions: this.stats.factions,
            leaders: this.stats.leaders,
            records: this.stats.records,
            recentGames: this.stats.gameHistory.slice(-10),
            sessionStats: this.sessionStats
        };
    }
    
    /**
     * Export statistics to JSON
     */
    exportStats() {
        const dataStr = JSON.stringify(this.stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gwent-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
    
    /**
     * Clear all statistics
     */
    clearStats() {
        if (confirm('Are you sure you want to clear all statistics? This cannot be undone.')) {
            this.stats = this.loadStats(); // Reset to defaults
            this.saveStats();
            console.log('All statistics cleared');
            
            // Refresh modal if it's open
            const modal = document.getElementById('statistics-modal');
            if (modal) {
                this.displayStatsInModal();
            }
        }
    }
}

// Initialize the statistics tracker when the page loads
let statsTracker = null;

document.addEventListener('DOMContentLoaded', () => {
    statsTracker = new StatisticsTracker();
    
    // Expose to global scope for debugging
    window.statsTracker = statsTracker;
    
    console.log('Statistics tracker ready');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatisticsTracker;
}
