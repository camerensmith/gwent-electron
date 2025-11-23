# Multiplayer via GitHub Pages + Session ID

## Architecture Overview

Since GitHub Pages only serves static files (no server-side code), we need a **separate WebSocket server** that both clients connect to. Both players visit the GitHub Pages site, enter the same session ID, and connect to the shared server.

```
Player 1 (GitHub Pages)  ──┐
                            ├──> WebSocket Server (separate hosting)
Player 2 (GitHub Pages)  ──┘         (manages rooms/sessions)
```

## Recommended Approach

### Option 1: Free WebSocket Service (Easiest)
Use a free WebSocket service that provides hosted infrastructure:

**Services:**
- **Pusher** (free tier: 200k messages/day)
- **Ably** (free tier: 3M messages/month)
- **PubNub** (free tier: 1M messages/month)
- **Socket.io Cloud** (if available)

**Pros:**
- No server setup required
- Free tier sufficient for casual play
- Easy to implement
- Handles scaling automatically

**Cons:**
- Vendor lock-in
- May have rate limits
- Less control

### Option 2: Self-Hosted WebSocket Server (Most Control)
Host a simple Node.js server on:
- **Railway** (free tier)
- **Render** (free tier)
- **Fly.io** (free tier)
- **Heroku** (paid now, but alternatives available)
- **Your own VPS** ($5/month)

**Pros:**
- Full control
- No vendor lock-in
- Can customize as needed

**Cons:**
- Requires server setup
- Need to maintain server

### Option 3: Serverless Functions (Medium Complexity)
Use serverless WebSocket:
- **AWS API Gateway WebSocket** (pay per use)
- **Cloudflare Workers** (with Durable Objects)
- **Vercel/Netlify Functions** (limited WebSocket support)

## Implementation for GitHub Pages

### Step 1: WebSocket Server Setup

Create a simple Node.js server (`server.js`):

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your GitHub Pages domain
    methods: ["GET", "POST"]
  }
});

// Room management
const rooms = new Map(); // roomId -> {host: socketId, guest: socketId, hostDeck: {}, guestDeck: {}}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (roomId, isHost) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { host: null, guest: null, hostDeck: null, guestDeck: null });
    }
    
    const room = rooms.get(roomId);
    if (isHost) {
      room.host = socket.id;
      socket.emit('room-joined', { role: 'host', roomId });
    } else {
      room.guest = socket.id;
      socket.emit('room-joined', { role: 'guest', roomId });
      // Notify host that guest joined
      io.to(roomId).emit('opponent-joined');
    }
    
    // If both players connected, notify them
    if (room.host && room.guest) {
      io.to(roomId).emit('both-players-ready');
    }
  });

  socket.on('send-deck', (roomId, deckData, isHost) => {
    const room = rooms.get(roomId);
    if (isHost) {
      room.hostDeck = deckData;
    } else {
      room.guestDeck = deckData;
    }
    
    // If both decks received, notify players
    if (room.hostDeck && room.guestDeck) {
      io.to(roomId).emit('decks-ready');
    }
  });

  socket.on('game-action', (roomId, action) => {
    // Broadcast action to opponent
    socket.to(roomId).emit('opponent-action', action);
  });

  socket.on('disconnect', () => {
    // Clean up room if player leaves
    for (const [roomId, room] of rooms.entries()) {
      if (room.host === socket.id || room.guest === socket.id) {
        socket.to(roomId).emit('opponent-disconnected');
        // Clean up room after delay
        setTimeout(() => {
          if (rooms.has(roomId)) {
            const r = rooms.get(roomId);
            if ((r.host === socket.id && !r.guest) || (r.guest === socket.id && !r.host)) {
              rooms.delete(roomId);
            }
          }
        }, 60000); // 1 minute grace period
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
```

### Step 2: Client-Side Connection (GitHub Pages)

Add to your existing codebase:

**File: `javascript/multiplayer.js`** (new file)

```javascript
class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.isHost = false;
        this.isConnected = false;
        this.opponentReady = false;
        // WebSocket server URL - change this to your deployed server
        this.serverUrl = 'wss://your-websocket-server.railway.app';
    }

    connect(roomId, isHost) {
        return new Promise((resolve, reject) => {
            try {
                this.socket = io(this.serverUrl);
                this.roomId = roomId;
                this.isHost = isHost;

                this.socket.on('connect', () => {
                    this.isConnected = true;
                    this.socket.emit('join-room', roomId, isHost);
                    resolve();
                });

                this.socket.on('room-joined', (data) => {
                    console.log('Joined room:', data);
                });

                this.socket.on('opponent-joined', () => {
                    console.log('Opponent joined!');
                    if (this.isHost) {
                        // Show that opponent is ready for deck selection
                        ui.showOpponentJoined();
                    }
                });

                this.socket.on('both-players-ready', () => {
                    console.log('Both players ready!');
                    this.opponentReady = true;
                });

                this.socket.on('decks-ready', () => {
                    console.log('Both decks received, starting game...');
                    if (this.isHost) {
                        // Host starts the game
                        this.startGame();
                    }
                });

                this.socket.on('opponent-action', (action) => {
                    this.handleOpponentAction(action);
                });

                this.socket.on('opponent-disconnected', () => {
                    console.warn('Opponent disconnected');
                    ui.showMessage('Opponent disconnected. Waiting for reconnection...');
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    sendDeck(deckData) {
        if (this.socket && this.isConnected) {
            this.socket.emit('send-deck', this.roomId, deckData, this.isHost);
        }
    }

    sendAction(actionType, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit('game-action', this.roomId, {
                type: actionType,
                data: data,
                timestamp: Date.now()
            });
        }
    }

    handleOpponentAction(action) {
        // Process opponent's action
        switch(action.type) {
            case 'playCard':
                this.receivePlayCard(action.data);
                break;
            case 'pass':
                this.receivePass();
                break;
            case 'selectRow':
                this.receiveSelectRow(action.data);
                break;
            // ... other actions
        }
    }

    receivePlayCard(data) {
        // Find card in opponent's hand and play it
        const card = player_op.hand.findCard(c => c.id === data.cardId);
        if (card) {
            // Execute the play action
            player_op.playCard(card);
        }
    }

    receivePass() {
        player_op.passRound();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }
}

// Global instance
const multiplayerManager = new MultiplayerManager();
```

### Step 3: UI for Session ID Entry

**Modify `index.html`** - Add multiplayer lobby:

```html
<section id="multiplayer-lobby" style="display:none">
    <div class="lobby-container">
        <h1>Multiplayer</h1>
        
        <!-- Session ID Input -->
        <div id="session-input">
            <input type="text" id="session-id-input" placeholder="Enter Session ID" maxlength="6">
            <button id="create-room">Create Room</button>
            <button id="join-room-btn">Join Room</button>
        </div>
        
        <!-- Room Status -->
        <div id="room-status" style="display:none">
            <p>Session ID: <strong id="display-session-id"></strong></p>
            <p id="player-status">Waiting for opponent...</p>
            <button id="cancel-multiplayer">Cancel</button>
        </div>
        
        <!-- Ready for Deck Selection -->
        <div id="deck-ready" style="display:none">
            <p>Opponent connected! Select your deck.</p>
        </div>
    </div>
</section>
```

### Step 4: Integration with Existing Code

**Modify `DeckMaker.startNewGame()`**:

```javascript
async startNewGame(fullAI = false, multiplayer = false) {
    if (multiplayer) {
        // Multiplayer mode - wait for opponent's deck
        const myDeck = this.getDeckData();
        multiplayerManager.sendDeck(myDeck);
        
        // Wait for both decks to be ready
        return new Promise((resolve) => {
            const checkDecks = setInterval(() => {
                if (multiplayerManager.decksReady) {
                    clearInterval(checkDecks);
                    // Both decks ready, start game
                    this.initializeMultiplayerGame();
                    resolve();
                }
            }, 100);
        });
    } else {
        // Existing single-player/AI code
        // ... existing implementation
    }
}
```

## Deployment Strategy

### 1. WebSocket Server Deployment

**Option A: Railway (Recommended - Free Tier)**
```bash
# Create railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE"
  }
}

# Deploy
railway login
railway init
railway up
```

**Option B: Render**
- Create new Web Service
- Connect GitHub repo
- Set build command: `npm install`
- Set start command: `node server.js`

### 2. GitHub Pages Configuration

No changes needed - just deploy your static files as normal. The client code will connect to your WebSocket server.

### 3. Environment Configuration

**In your GitHub Pages code**, set the WebSocket server URL:

```javascript
// In multiplayer.js or config file
const WEBSOCKET_SERVER_URL = 'wss://your-server.railway.app';
// Or use environment variable if using a build process
```

## User Flow

1. **Player 1 (Host)**:
   - Clicks "Multiplayer" button
   - Clicks "Create Room"
   - Gets a 6-character session ID (e.g., "ABC123")
   - Shares ID with Player 2
   - Selects deck
   - Waits for Player 2 to join and select deck

2. **Player 2 (Guest)**:
   - Clicks "Multiplayer" button
   - Enters session ID from Player 1
   - Clicks "Join Room"
   - Selects deck
   - Both players see "Ready" status

3. **Game Start**:
   - Host clicks "Start Game" (or auto-starts when both ready)
   - Both players' games initialize with their decks
   - Game proceeds with synchronized actions

## Session ID Generation

Simple approach:
```javascript
function generateSessionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
```

## Advantages of This Approach

✅ **Works with GitHub Pages** - No server-side code needed on GitHub
✅ **Simple for users** - Just enter session ID
✅ **Free hosting options** - Can use free tiers
✅ **Scalable** - Can handle multiple concurrent games
✅ **No port forwarding** - Works from anywhere

## Next Steps

1. **Set up WebSocket server** (Railway/Render)
2. **Add multiplayer UI** to GitHub Pages site
3. **Implement client connection** code
4. **Test locally** first
5. **Deploy server** to hosting service
6. **Update client** with server URL
7. **Test end-to-end**

Would you like me to start implementing any of these components?

