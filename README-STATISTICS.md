# 🎯 Gwent Classic Statistics Tracker

A comprehensive statistics tracking system that monitors your Gwent Classic gameplay without interfering with the game experience.

## ✨ Features

### **📊 Comprehensive Tracking**
- **Game Results**: Wins, losses, draws, and win rates
- **Faction Performance**: Individual statistics for each faction
- **Leader Usage**: Track performance with different leaders
- **Card Analytics**: Most played cards and usage patterns
- **Performance Records**: Longest/shortest games, most units in hand/on board
- **Session Tracking**: Current session statistics and duration

### **🔍 Real-Time Monitoring**
- **Automatic Detection**: Tracks games as they happen
- **Non-Intrusive**: Runs in the background without affecting gameplay
- **Smart Integration**: Works with existing game mechanics
- **Persistent Storage**: Saves all data locally using localStorage

### **📈 Analytics Dashboard**
- **Visual Statistics**: Beautiful, organized display of all metrics
- **Faction Comparison**: Side-by-side performance analysis
- **Record Tracking**: Personal bests and achievements
- **Game History**: Detailed log of recent games
- **Export Functionality**: Download your data as JSON

## 🚀 Getting Started

### **1. Automatic Integration**
The statistics tracker automatically loads when you start the game. No setup required!

### **2. Accessing Statistics**
- **In-Game**: Click "Statistics" button on the end screen
- **Main Menu**: Click "📊 Detailed Stats" in the deck customization area
- **Direct Access**: Open `statistics-viewer.html` in your browser

### **3. Viewing Your Stats**
- **Profile Overview**: Total games, win rate, and basic metrics
- **Faction Performance**: How you perform with each faction
- **Leader Analysis**: Success rates with different leaders
- **Records & Achievements**: Your personal bests
- **Recent Games**: Detailed history of recent matches

## 📋 What Gets Tracked

### **Game Events**
- ✅ Game start and end times
- ✅ Win/loss/draw results
- ✅ Game duration
- ✅ Deck and leader used
- ✅ Round progression

### **Performance Metrics**
- ✅ Units in hand (maximum)
- ✅ Units on board (maximum)
- ✅ Cards played per game
- ✅ Faction win rates
- ✅ Leader success rates

### **Personal Records**
- ✅ Longest and shortest games
- ✅ Most units in hand at once
- ✅ Most units on board at once
- ✅ Most cards played in a game
- ✅ Session duration and games

## 🛠️ Technical Details

### **Data Storage**
- **Local Storage**: All data saved in your browser's localStorage
- **Persistent**: Data survives browser restarts and game updates
- **Private**: Your statistics are stored locally, not shared

### **Performance Impact**
- **Minimal**: Uses efficient event listeners and minimal polling
- **Non-Blocking**: Doesn't interfere with game performance
- **Smart Monitoring**: Only tracks when games are active

### **Browser Compatibility**
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Electron Apps**: Fully compatible with desktop versions
- **Mobile**: Works on mobile browsers (though desktop recommended)

## 🎮 How It Works

### **1. Game Detection**
The tracker automatically detects when:
- A game starts (start button clicked)
- Cards are played (DOM mutations observed)
- Rounds change (score monitoring)
- Games end (end screen detection)

### **2. Data Collection**
- **Passive Monitoring**: Watches for UI changes
- **Event Hooking**: Integrates with existing game functions
- **Smart Fallbacks**: Multiple methods to detect game state

### **3. Statistics Processing**
- **Real-Time Updates**: Stats update as you play
- **Automatic Calculations**: Win rates, averages, and records
- **Data Validation**: Ensures accuracy and consistency

## 📱 Using the Statistics Viewer

### **Main Dashboard**
- **Profile Overview**: Your overall gaming statistics
- **Favorites**: Most used faction, leader, and card
- **Session Info**: Current session duration and games

### **Faction Performance**
- **Individual Stats**: Games, wins, losses, draws per faction
- **Win Rate Analysis**: Color-coded performance indicators
- **Usage Patterns**: Which factions you prefer

### **Records & Achievements**
- **Personal Bests**: Your highest scores and achievements
- **Game Records**: Longest, shortest, and most active games
- **Performance Milestones**: Track your improvement over time

### **Recent Games**
- **Game History**: Last 10 games with detailed information
- **Result Tracking**: Win/loss/draw with timestamps
- **Performance Analysis**: Cards played, units managed, duration

## 🔧 Advanced Features

### **Data Export**
- **JSON Format**: Download your complete statistics
- **Backup**: Save your data for safekeeping
- **Analysis**: Use external tools to analyze your data

### **Data Management**
- **Clear Statistics**: Reset all data if needed
- **Auto-Refresh**: Statistics update automatically
- **Persistent Storage**: Data survives browser restarts

### **Integration**
- **Enhanced Stats**: Works with existing game statistics
- **Seamless Experience**: No additional setup required
- **Smart Detection**: Automatically adapts to game changes

## 🎯 Tips for Best Results

### **1. Play Multiple Games**
- Statistics become more meaningful with more data
- Try different factions and leaders for comprehensive tracking
- Play both short and long games to establish records

### **2. Check Your Stats Regularly**
- Monitor your progress over time
- Identify your strengths and areas for improvement
- Celebrate new records and achievements

### **3. Use Different Decks**
- Experiment with various faction combinations
- Track which strategies work best for you
- Build a diverse gaming profile

## 🐛 Troubleshooting

### **Statistics Not Updating**
- **Refresh the page**: Sometimes the tracker needs a fresh start
- **Check console**: Look for error messages in browser console
- **Verify integration**: Ensure `statistics-tracker.js` is loaded

### **Data Not Persisting**
- **Check localStorage**: Ensure your browser supports localStorage
- **Clear browser data**: Don't clear localStorage if you want to keep stats
- **Browser compatibility**: Try a different browser if issues persist

### **Performance Issues**
- **Close other tabs**: Reduce browser memory usage
- **Restart browser**: Clear memory and refresh the tracker
- **Check for conflicts**: Ensure no other scripts are interfering

## 🔮 Future Enhancements

### **Planned Features**
- **Advanced Analytics**: Charts and graphs for visual analysis
- **Achievement System**: Unlockable milestones and badges
- **Social Features**: Compare stats with friends (optional)
- **Export Options**: CSV, Excel, and other formats
- **Cloud Sync**: Optional cloud storage for cross-device access

### **Community Requests**
- **Custom Metrics**: Track specific aspects of gameplay
- **Tournament Mode**: Special statistics for competitive play
- **Deck Analysis**: Performance metrics for specific deck builds
- **Meta Tracking**: Analyze opponent strategies and success rates

## 📞 Support

### **Getting Help**
- **Check Console**: Look for error messages in browser console
- **Verify Files**: Ensure all JavaScript files are properly loaded
- **Browser Testing**: Try different browsers to isolate issues

### **Feature Requests**
- **Suggestions Welcome**: Ideas for new tracking metrics
- **Bug Reports**: Report any issues or unexpected behavior
- **Improvement Ideas**: Ways to make the system better

---

**🎮 Happy Gaming!** 

Track your progress, analyze your strategies, and become a Gwent master with comprehensive statistics tracking!
