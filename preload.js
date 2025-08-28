const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Game control
  newGame: () => ipcRenderer.send('new-game'),
  loadDeck: (filePath) => ipcRenderer.send('load-deck', filePath),
  showRules: () => ipcRenderer.send('show-rules'),
  showDeckBuilder: () => ipcRenderer.send('show-deck-builder'),
  setAIDifficulty: (difficulty) => ipcRenderer.send('set-ai-difficulty', difficulty),
  
  // Listen for messages from main process
  onNewGame: (callback) => ipcRenderer.on('new-game', callback),
  onLoadDeck: (callback) => ipcRenderer.on('load-deck', callback),
  onShowRules: (callback) => ipcRenderer.on('show-rules', callback),
  onShowDeckBuilder: (callback) => ipcRenderer.on('show-deck-builder', callback),
  onSetAIDifficulty: (callback) => ipcRenderer.on('set-ai-difficulty', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development'
});

// Expose some Node.js APIs that might be useful
contextBridge.exposeInMainWorld('nodeAPI', {
  // File system operations (read-only for security)
  readFile: (filePath) => {
    // Only allow reading from specific directories for security
    const allowedPaths = ['decks', 'images', 'sfx'];
    const isAllowed = allowedPaths.some(path => filePath.includes(path));
    
    if (!isAllowed) {
      throw new Error('Access denied: Cannot read from this location');
    }
    
    return require('fs').readFileSync(filePath, 'utf8');
  },
  
  // Path utilities
  join: (...paths) => require('path').join(...paths),
  resolve: (...paths) => require('path').resolve(...paths),
  
  // Environment info
  env: process.env.NODE_ENV || 'production'
});

// Expose a safe console API
contextBridge.exposeInMainWorld('safeConsole', {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  info: (...args) => console.info(...args)
});

// Handle uncaught errors in renderer
window.addEventListener('error', (event) => {
  console.error('Renderer error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
