/**
 * Export default_decks from decks.js to JSON files in decks/aidecks/
 * Run with: node export-aidecks.js
 */

const fs = require('fs');
const path = require('path');

// Read the decks.js file
const decksJsPath = path.join(__dirname, 'javascript', 'decks.js');
const decksJsContent = fs.readFileSync(decksJsPath, 'utf8');

// Extract default_decks array using eval (since it's a JS file)
// We'll use a safer approach - require won't work directly, so we'll parse it
let default_decks = [];
try {
    // Create a safe context to evaluate the decks
    const vm = require('vm');
    const context = { default_decks: [], module: {}, exports: {} };
    // Extract just the default_decks assignment
    const match = decksJsContent.match(/let default_decks = \[[\s\S]*?\];/);
    if (match) {
        vm.runInNewContext(match[0], context);
        default_decks = context.default_decks;
    }
} catch (e) {
    console.error('Error parsing decks.js:', e);
    process.exit(1);
}

// Ensure aidecks directory exists
const aidecksDir = path.join(__dirname, 'decks', 'aidecks');
if (!fs.existsSync(aidecksDir)) {
    fs.mkdirSync(aidecksDir, { recursive: true });
}

// Export each deck to a JSON file
let exported = 0;
default_decks.forEach((deck, index) => {
    // Create a safe filename from the deck title
    const safeTitle = deck.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    
    const filename = `${safeTitle}.json`;
    const filepath = path.join(aidecksDir, filename);
    
    // Write deck to JSON file
    fs.writeFileSync(filepath, JSON.stringify(deck, null, 2), 'utf8');
    console.log(`Exported: ${filename}`);
    exported++;
});

console.log(`\n✅ Exported ${exported} decks to ${aidecksDir}`);

