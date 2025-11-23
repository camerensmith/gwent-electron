# Multiplayer Implementation Plan

## Overview
This document outlines what would be required to implement multiplayer functionality for Gwent Classic, allowing two players to play against each other over the network.

## Architecture Requirements

### 1. Network Infrastructure
**Option A: WebSocket Server (Recommended)**
- **Backend Server**: Node.js/Express server with Socket.io or native WebSocket
- **Hosting**: Could use services like:
  - Heroku (free tier available)
  - Railway
  - Fly.io
  - Self-hosted VPS
- **Protocol**: WebSocket for real-time bidirectional communication
- **Estimated Complexity**: Medium-High

**Option B: Peer-to-Peer (WebRTC)**
- No server required, direct connection between players
- More complex setup, NAT traversal issues
- **Estimated Complexity**: High

**Option C: Serverless (Firebase/Supabase)**
- Real-time database with WebSocket-like functionality
- Easier setup, but vendor lock-in
- **Estimated Complexity**: Medium

### 2. Core Components Needed

#### A. Multiplayer Manager Class
```javascript
class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.isHost = false;
        this.isConnected = false;
        this.opponentReady = false;
    }
    
    // Connection management
    connect(serverUrl)
    disconnect()
    createRoom()
    joinRoom(roomId)
    
    // Game state synchronization
    sendAction(actionType, data)
    receiveAction(actionType, data)
    
    // Deck synchronization
    sendDeck(deckData)
    receiveOpponentDeck(deckData)
}
```

#### B. Action Serialization System
All game actions need to be serializable:
- **Play Card**: `{type: 'playCard', cardKey, row, cardId}`
- **Pass**: `{type: 'pass'}`
- **Select Row**: `{type: 'selectRow', rowIndex}`
- **Select Card**: `{type: 'selectCard', cardId}`
- **Leader Ability**: `{type: 'leaderAbility', abilityKey}`
- **Faction Ability**: `{type: 'factionAbility'}`
- **Initial Redraw**: `{type: 'redraw', cardIndices: []}`

#### C. State Synchronization Points
1. **Deck Selection**: Both players send deck data before game starts
2. **Initial Draw**: Synchronize random seed or draw order
3. **Card Plays**: Every card play must be synchronized
4. **Turn Management**: Only active player can act
5. **Round End**: Synchronize round results
6. **Game End**: Synchronize final results

## UI Changes Required

### 1. Initial Screen (`index.html`)
Add "Multiplayer" button next to "Play" button:
```html
<button class="start-game_class" id="button_multiplayer" style="display:none">Multiplayer</button>
```

### 2. Multiplayer Lobby Screen (New Section)
```html
<section id="multiplayer-lobby" style="display:none">
    <div id="lobby-content">
        <h1>Multiplayer Lobby</h1>
        
        <!-- Host View -->
        <div id="host-view">
            <p>Room Code: <span id="room-code"></span></p>
            <p>Waiting for opponent to join...</p>
            <div id="opponent-status">Not connected</div>
            <button id="cancel-lobby">Cancel</button>
        </div>
        
        <!-- Join View -->
        <div id="join-view">
            <input type="text" id="room-code-input" placeholder="Enter room code">
            <button id="join-room">Join Room</button>
            <button id="back-to-main">Back</button>
        </div>
        
        <!-- Ready Check -->
        <div id="ready-section" style="display:none">
            <p>Both players ready!</p>
            <button id="start-multiplayer-game">Start Game</button>
        </div>
    </div>
</section>
```

### 3. Deck Customization (Modify Existing)
- Add "Ready" button when in multiplayer mode
- Disable "Start Game" until opponent is ready
- Show opponent's ready status

## Code Changes Required

### 1. Game Initialization (`gwent.js`)
**File**: `javascript/gwent.js`

**Changes**:
- Modify `startNewGame()` to accept multiplayer mode
- Add multiplayer initialization path
- Create `Player` with `isAI = false` for both players in multiplayer
- Wait for both players' deck data before starting

### 2. Action Broadcasting (`gwent.js`)
**Files to Modify**:
- `Player.playCard()` - Broadcast card play
- `Player.passRound()` - Broadcast pass
- `UI.selectRow()` - Broadcast row selection
- `UI.selectCard()` - Broadcast card selection
- `Player.activateLeader()` - Broadcast leader ability
- `Game.initialRedraw()` - Synchronize redraws

**Pattern**:
```javascript
// Before executing action locally
if (game.multiplayer && game.isMyTurn) {
    multiplayerManager.sendAction('playCard', {
        cardKey: card.key,
        cardId: card.id,
        row: rowIndex
    });
}
// Then execute action
await executeAction();
```

### 3. Action Reception (`gwent.js`)
**New Function**:
```javascript
async receiveOpponentAction(actionType, data) {
    // Validate it's opponent's turn
    if (game.currPlayer !== player_op) return;
    
    switch(actionType) {
        case 'playCard':
            // Recreate card and play it
            const card = player_op.hand.findCard(c => c.id === data.cardId);
            await player_op.playCard(card);
            break;
        case 'pass':
            await player_op.passRound();
            break;
        // ... other actions
    }
}
```

### 4. Turn Management
- Add validation: Only allow actions when `game.currPlayer === player_me`
- Disable UI when it's opponent's turn
- Show "Waiting for opponent..." message

### 5. Random Number Synchronization
**Challenge**: Random events (coin toss, card draws, etc.) need to be synchronized.

**Solutions**:
- **Option A**: Use shared random seed (both players use same seed)
- **Option B**: Host determines all random events, sends results
- **Option C**: Use deterministic algorithms for shared events

## Implementation Steps

### Phase 1: Infrastructure Setup
1. Set up WebSocket server (Node.js + Socket.io)
2. Create room management system
3. Implement basic connection handling

### Phase 2: UI Implementation
1. Add multiplayer button to initial screen
2. Create lobby screen
3. Add room code generation/input
4. Add ready/status indicators

### Phase 3: Deck Synchronization
1. Serialize deck data structure
2. Send/receive deck data
3. Validate deck compatibility
4. Wait for both players before starting

### Phase 4: Game Action Synchronization
1. Implement action serialization
2. Broadcast all player actions
3. Receive and replay opponent actions
4. Add turn validation

### Phase 5: State Synchronization
1. Synchronize initial card draw
2. Handle random events consistently
3. Synchronize round/game end
4. Handle disconnections/reconnections

### Phase 6: Testing & Polish
1. Test all card abilities in multiplayer
2. Test edge cases (disconnects, timeouts)
3. Add error handling
4. Add reconnection logic

## Estimated Complexity

### Time Estimate
- **Infrastructure Setup**: 4-8 hours
- **UI Implementation**: 4-6 hours
- **Deck Synchronization**: 2-4 hours
- **Action Synchronization**: 8-12 hours
- **State Synchronization**: 4-6 hours
- **Testing & Bug Fixes**: 6-10 hours

**Total**: ~28-46 hours of development time

### Technical Challenges
1. **Random Number Synchronization**: Ensuring both players see same random events
2. **Network Latency**: Handling delays in action transmission
3. **Disconnection Handling**: What happens if a player disconnects?
4. **Cheating Prevention**: Client-side validation vs server-side authority
5. **State Reconciliation**: Handling desyncs between clients

## Alternative: Simpler Approach

### Option: Local Network Only
- Use WebRTC for direct peer-to-peer connection
- No server required
- Players share room code/IP address
- Simpler but requires same network or port forwarding

## Recommended Tech Stack

### Backend
- **Node.js** + **Express** + **Socket.io**
- **Redis** (optional, for room management if scaling)
- **PostgreSQL/MongoDB** (optional, for match history)

### Frontend
- **Socket.io-client** (for WebSocket connection)
- Minimal changes to existing codebase

## Security Considerations
1. **Input Validation**: Validate all actions server-side
2. **Rate Limiting**: Prevent action spam
3. **Cheating Prevention**: Server should validate game rules
4. **Authentication**: Optional user accounts for matchmaking

## Next Steps
1. Decide on infrastructure (WebSocket server vs P2P)
2. Set up development environment
3. Create proof-of-concept with basic card play
4. Iteratively add features

Would you like me to start implementing any specific part of this?

