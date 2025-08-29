/**
 * Gwent Classic Deck Loader
 * Loads external deck JSON files and integrates them into the game
 */

class DeckLoader {
    constructor() {
        this.externalDecks = [];
        this.allDecks = [];
        this.isLoaded = false;
    }

    /**
     * Initialize the deck loader
     */
    async initialize() {
        try {
            await this.loadExternalDecks();
            this.mergeWithExistingDecks();
            this.isLoaded = true;
            console.log(`Deck Loader initialized with ${this.allDecks.length} total decks`);
        } catch (error) {
            console.error('Error initializing deck loader:', error);
            // Fallback to existing decks only
            this.allDecks = window.premade_deck || [];
        }
    }

    /**
     * Load all external deck JSON files
     */
    async loadExternalDecks() {
        const deckFiles = [
            // Northern Realms (using actual file names)
            'decks/northern_realms_5_royal_command.json',
            'decks/northern_realms_6_steel_forged.json',
            'decks/northern_realms_7_medell_legacy.json',
            
            // Monsters (using actual file names)
            'decks/monsters_3_eredin_destroyer.json',
            'decks/monsters_4_eredin_king.json',
            'decks/monsters_5_eredin_treacherous.json',
            'decks/monsters_6_beasts_horrors.json',
            
            // Lyria & Rivia (using actual file names)
            'decks/lyria_rivia_3_royal_knights.json',
            'decks/lyria_rivia_4_siege_masters.json',
            
            // Scoia'tael (using actual file names)
            'decks/scoiatael_3_elven_archers.json',
            'decks/scoiatael_4_dwarven_engineers.json',
            
            // Skellige (using actual file names)
            'decks/skellige_3_berserker_rage.json',
            'decks/skellige_4_naval_power.json',
            
            // Toussaint (using actual file names)
            'decks/toussaint_3_chivalry_honor.json',
            'decks/toussaint_4_dark_secrets.json'
        ];

        console.log('Starting to load external decks...');
        
        for (const deckFile of deckFiles) {
            try {
                const deck = await this.loadDeckFile(deckFile);
                if (deck) {
                    this.externalDecks.push(deck);
                    console.log(`✅ Loaded external deck: ${deck.title} (${deck.faction})`);
                }
            } catch (error) {
                console.warn(`❌ Failed to load deck ${deckFile}:`, error);
            }
        }
        
        console.log(`External deck loading complete. Loaded ${this.externalDecks.length} out of ${deckFiles.length} attempted decks.`);
    }

    /**
     * Load a single deck JSON file
     */
    async loadDeckFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const deckData = await response.json();
            console.log(`📄 Loaded deck data from ${filePath}:`, deckData);
            
            // Validate deck structure
            if (this.validateDeck(deckData)) {
                const normalizedDeck = this.normalizeDeck(deckData);
                console.log(`✅ Normalized deck:`, normalizedDeck);
                return normalizedDeck;
            } else {
                console.warn(`❌ Invalid deck structure in ${filePath}:`, deckData);
                return null;
            }
        } catch (error) {
            console.warn(`❌ Error loading deck file ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Validate deck structure
     */
    validateDeck(deck) {
        // Check if deck exists and has required fields
        if (!deck || !deck.faction || !deck.leader || !Array.isArray(deck.cards) || deck.cards.length === 0) {
            return false;
        }
        
        // Title is optional, we can generate one
        return true;
    }

    /**
     * Normalize deck data to match internal format
     */
    normalizeDeck(deck) {
        // Generate title if missing
        let title = deck.title;
        if (!title) {
            // Extract leader name from leader ID
            const leaderName = this.getLeaderName(deck.leader);
            title = `${this.formatFactionName(deck.faction)} - ${leaderName}`;
        }
        
        // Generate description if missing
        let description = deck.description;
        if (!description) {
            description = `Custom ${this.formatFactionName(deck.faction)} deck with ${deck.leader}`;
        }
        
        return {
            title: title,
            description: description,
            leader: deck.leader,
            faction: deck.faction,
            cards: deck.cards,
            isExternal: true
        };
    }
    
    /**
     * Get leader name from leader ID
     */
    getLeaderName(leaderId) {
        // Try to get from card_dict if available
        if (window.card_dict && window.card_dict[leaderId]) {
            return window.card_dict[leaderId].name || leaderId;
        }
        return leaderId;
    }
    
    /**
     * Format faction name for display
     */
    formatFactionName(faction) {
        const factionNames = {
            'realms': 'Northern Realms',
            'monsters': 'Monsters',
            'nilfgaard': 'Nilfgaard',
            'scoiatael': 'Scoia\'tael',
            'skellige': 'Skellige',
            'syndicate': 'Syndicate',
            'toussaint': 'Toussaint',
            'lyria_rivia': 'Lyria & Rivia',
            'witcher_universe': 'Witcher Universe',
            'zerrikania': 'Zerrikania'
        };
        return factionNames[faction] || faction;
    }

    /**
     * Merge external decks with existing decks
     */
    mergeWithExistingDecks() {
        // Get existing decks
        const existingDecks = window.premade_deck || [];
        
        // Combine all decks
        this.allDecks = [...existingDecks, ...this.externalDecks];
        
        // Update the global premade_deck variable
        window.premade_deck = this.allDecks;
        
        // Also update the custom_decks variable for compatibility
        if (window.custom_decks) {
            window.custom_decks = this.allDecks;
        }
        
        console.log(`Merged ${existingDecks.length} existing decks with ${this.externalDecks.length} external decks`);
    }

    /**
     * Get all available decks
     */
    getAllDecks() {
        return this.allDecks;
    }

    /**
     * Get decks by faction
     */
    getDecksByFaction(faction) {
        return this.allDecks.filter(deck => deck.faction === faction);
    }

    /**
     * Get a random deck
     */
    getRandomDeck() {
        if (this.allDecks.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.allDecks.length);
        return this.allDecks[randomIndex];
    }

    /**
     * Get a random deck by faction
     */
    getRandomDeckByFaction(faction) {
        const factionDecks = this.getDecksByFaction(faction);
        if (factionDecks.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * factionDecks.length);
        return factionDecks[randomIndex];
    }

    /**
     * Check if deck loader is ready
     */
    isReady() {
        return this.isLoaded;
    }

    /**
     * Test the deck loader functionality
     */
    test() {
        console.log('🧪 Testing Deck Loader...');
        console.log(`   - Is loaded: ${this.isLoaded}`);
        console.log(`   - External decks: ${this.externalDecks.length}`);
        console.log(`   - Total decks: ${this.allDecks.length}`);
        
        if (this.allDecks.length > 0) {
            const randomDeck = this.getRandomDeck();
            console.log(`   - Random deck test: ${randomDeck.title} (${randomDeck.faction})`);
            
            const factionDecks = this.getDecksByFaction('monsters');
            console.log(`   - Monsters faction decks: ${factionDecks.length}`);
            
            console.log(`   - All factions: ${[...new Set(this.allDecks.map(d => d.faction))].join(', ')}`);
        }
        
        // Test external deck loading specifically
        console.log('🔍 External Deck Details:');
        this.externalDecks.forEach((deck, index) => {
            console.log(`   ${index + 1}. ${deck.title} (${deck.faction}) - ${deck.cards.length} cards`);
        });
        
        return this.isLoaded && this.allDecks.length > 0;
    }

    /**
     * Reload all decks
     */
    async reload() {
        this.externalDecks = [];
        this.allDecks = [];
        this.isLoaded = false;
        await this.initialize();
    }
}

// Initialize deck loader when the page loads
let deckLoader = null;

document.addEventListener('DOMContentLoaded', async () => {
    deckLoader = new DeckLoader();
    await deckLoader.initialize();
    
    // Expose to global scope
    window.deckLoader = deckLoader;
    
    console.log('Deck Loader ready');
    
    // Test the deck loader after a short delay
    setTimeout(() => {
        if (deckLoader) {
            deckLoader.test();
        }
    }, 2000);
    
    // Add global test function for debugging
    window.testDeckLoader = () => {
        if (deckLoader) {
            deckLoader.test();
        } else {
            console.log('Deck Loader not available');
        }
    };
    
    // Add global reload function for testing
    window.reloadExternalDecks = async () => {
        if (deckLoader) {
            console.log('🔄 Reloading external decks...');
            await deckLoader.reload();
            deckLoader.test();
        } else {
            console.log('Deck Loader not available');
        }
    };
    
    console.log('💡 Use testDeckLoader() in console to test the deck loader');
    console.log('💡 Use reloadExternalDecks() in console to reload external decks');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckLoader;
}
