// Preload script — runs in the renderer before page scripts.
// contextIsolation is enabled, so only explicitly exposed APIs
// are available to the renderer via the contextBridge.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
