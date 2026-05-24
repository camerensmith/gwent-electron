// ─── Root app — screen state machine, run state, Tweaks panel ───

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mapStyle": "tactical",
  "accent": "gold",
  "modifierAlwaysVisible": true,
  "orientation": "vertical"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState('menu');
  const [run, setRun] = useState(null);
  const [runOutcome, setRunOutcome] = useState(null);
  const [unlockedItemIds] = useState(() => new Set(window.ITEMS.map(i => i.id)));
  const [lastUnlocked, setLastUnlocked] = useState(null);

  useEffect(() => {
    const stage = document.querySelector('.stage');
    if (!stage) return;
    stage.classList.remove('accent-gold', 'accent-silver', 'accent-crimson', 'accent-emerald');
    stage.classList.add('accent-' + (tweaks.accent || 'gold'));
  }, [tweaks.accent]);

  // On mount: apply any roguelite battle result returned from index.html
  useEffect(() => {
    const rawResult = sessionStorage.getItem('rogueliteBattleResult');
    if (!rawResult) return;
    sessionStorage.removeItem('rogueliteBattleResult');

    let result;
    try { result = JSON.parse(rawResult); } catch(e) { return; }

    const rawRun = sessionStorage.getItem('rogueliteRunState');
    if (!rawRun) return;
    sessionStorage.removeItem('rogueliteRunState');

    let savedRun;
    try { savedRun = JSON.parse(rawRun); } catch(e) { return; }

    const { won, rationDrain, goldReward, goldLoss, nodeType, isFinalBoss } = result;
    const clampedDrain = Math.min(rationDrain, Math.max(0, savedRun.rations));

    if (won) {
      const newRun = {
        ...savedRun,
        gold: savedRun.gold + goldReward,
        rations: savedRun.rations - clampedDrain,
        wins: (savedRun.wins || 0) + 1,
        elites: (savedRun.elites || 0) + (nodeType === 'elite' ? 1 : 0),
        bosses: (savedRun.bosses || 0) + (nodeType === 'boss' ? 1 : 0),
        nextEncounterBuff: null,
      };
      setRun(newRun);
      if (isFinalBoss) {
        const candidate = window.ITEMS[Math.floor(Math.random() * window.ITEMS.length)];
        setLastUnlocked(candidate);
        setRunOutcome('win');
        setScreen('summary');
      } else {
        setScreen('map');
      }
    } else {
      const bankrupt = savedRun.gold < goldLoss;
      const newRun = {
        ...savedRun,
        gold: Math.max(0, savedRun.gold - goldLoss),
        rations: savedRun.rations - clampedDrain,
        losses: (savedRun.losses || 0) + 1,
        nextEncounterBuff: null,
      };
      setRun(newRun);
      if (bankrupt) {
        setRunOutcome('bankrupt');
        setScreen('summary');
      } else {
        setScreen('map');
      }
    }
  }, []);

  const navigate = (target) => {
    if (target === 'quick') {
      // Hand off to the existing Gwent Electron deck builder and game.
      window.location.href = 'index.html';
    } else if (target === 'roguelite') {
      setRun({ mode: 'roguelite' });
      setScreen('setup');
    } else if (target === 'stats') {
      window.location.href = 'statistics-viewer.html';
    } else if (target === 'rules') {
      window.open('rules.html', '_blank');
    } else if (target === 'quit') {
      if (window.confirm('Quit Gwent Electron?')) window.close();
    }
  };

  const beginRun = ({ factionId, leader, deck, equipped }) => {
    const items = equipped || [];
    const hasQM = items.some(i => i.id === 'quartermaster');
    const rollStart = window.STARTING_RATIONS_MIN +
      Math.floor(Math.random() * (window.STARTING_RATIONS_MAX - window.STARTING_RATIONS_MIN + 1));
    const start = rollStart + (hasQM ? 5 : 0);
    setRun({
      mode: 'roguelite',
      factionId,
      leader,
      deck: deck.map((c, i) => ({ ...c, id: c.id || ('d' + i) })),
      equipped: items,
      gold: 0,
      rations: start,
      startRations: start,
      maxRations: 40,
      wins: 0,
      losses: 0,
      elites: 0,
      bosses: 0,
      bought: 0,
      sold: 0,
      rests: 0,
      floorsReached: 0,
      seed: Math.random(),
      shopSeed: Math.random(),
      difficulty: 'medium',
    });
    setScreen('map');
  };

  const handlePickNode = (node, assignment) => {
    setRun(r => {
      let newRations = r.rations - window.RATION_TRAVEL_COST;
      let newDeck = r.deck;
      let starveDiscarded = null;
      if (newRations < 0 && newDeck.length > 0) {
        const idx = Math.floor(Math.random() * newDeck.length);
        starveDiscarded = newDeck[idx];
        newDeck = newDeck.filter((_, i) => i !== idx);
      }
      if (starveDiscarded) {
        setTimeout(() => {
          window.alert(`Starvation:\n\nYour stores are bare. A card slips from your saddlebag.\n\n\u2014 ${starveDiscarded.name} was discarded.`);
        }, 30);
      }
      return {
        ...r,
        floorsReached: Math.max(r.floorsReached || 0, node.floor + 1),
        rations: newRations,
        deck: newDeck,
      };
    });
    const items = run?.equipped || [];
    const has = (id) => items.some(i => i.id === id);

    if (has('lucky_coin') && Math.random() < 0.1) {
      setRun(r => ({ ...r, gold: r.gold + 1 }));
    }

    if (node.type === 'shop') {
      setScreen('shop');
    } else if (node.type === 'rest') {
      const gain = has('foragers_eye') ? 6 : 4;
      setRun(r => ({
        ...r,
        rests: (r.rests || 0) + 1,
        rations: Math.min(r.maxRations, r.rations + gain),
      }));
      setScreen('rest');
    } else if (node.type === 'cache') {
      const reward = 2;
      setRun(r => ({ ...r, gold: r.gold + reward }));
      window.alert(`Cache opened \u2014 +${reward} gold.`);
    } else if (node.type === 'mystery') {
      const out = assignment?.mystery || window.MYSTERY_OUTCOMES[Math.floor(Math.random() * window.MYSTERY_OUTCOMES.length)];
      let delta = '';
      if (out.kind === 'gold')    { setRun(r => ({ ...r, gold: Math.max(0, r.gold + out.amount) })); delta = `${out.amount >= 0 ? '+' : ''}${out.amount} gold`; }
      if (out.kind === 'rations') { setRun(r => ({ ...r, rations: Math.max(0, Math.min(r.maxRations, r.rations + out.amount)) })); delta = `${out.amount >= 0 ? '+' : ''}${out.amount} rations`; }
      if (out.kind === 'deck')    { setRun(r => ({ ...r, deck: r.deck.slice(Math.abs(out.amount)) })); delta = `${out.amount} card${Math.abs(out.amount) > 1 ? 's' : ''} lost`; }
      if (out.kind === 'recruit') {
        const merc = window.MERCENARY_POOL[Math.floor(Math.random() * window.MERCENARY_POOL.length)];
        setRun(r => ({ ...r, deck: [...r.deck, { ...merc, id: 'merc' + Math.random().toString(36).slice(2) }] }));
        delta = `recruited: ${merc.name}`;
      }
      if (out.kind === 'buff') {
        setRun(r => ({ ...r, nextEncounterBuff: out.buff }));
        delta = `boon applied to next encounter`;
      }
      window.alert(`Mystery:\n\n"${out.line}"\n\n\u2014 ${delta}`);
    } else if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
      resolveBattle(node, assignment);
    }
  };

  const resolveBattle = (node, assignment) => {
    const items = run?.equipped || [];
    const has = (id) => items.some(i => i.id === id);

    const goldReward = (node.type === 'elite' ? 2 : node.type === 'boss' ? 5 : 1) + (has('kings_bounty') ? 1 : 0);
    const goldLoss = window.LOSS_GOLD_COST[node.type] || 1;
    const isFinalBoss = node.type === 'boss' && node.act === 1;

    // Persist run state across the page navigation so we can restore it on return
    sessionStorage.setItem('rogueliteRunState', JSON.stringify(run));

    // Build the battle context that gwent.js will read on index.html load
    const ctx = {
      playerFaction:  run.factionId,
      playerLeaderId: run.leader?.id || null,
      oppFaction:     assignment?.oppFaction?.id   || null,
      oppLeaderId:    assignment?.oppLeader?.id    || null,
      oppLeaderName:  assignment?.oppLeader?.name  || 'Opponent',
      nodeType:       node.type,
      goldReward,
      goldLoss,
      currentRations: run.rations,
      leanProvision:  has('lean_provision'),
      hardtack:       has('hardtack'),
      isFinalBoss,
      nextEncounterBuff: run?.nextEncounterBuff || null,
    };

    sessionStorage.setItem('rogueliteBattle', JSON.stringify(ctx));
    window.location.href = 'index.html';
  };

  return (
    <>
      {screen === 'menu' && (
        <window.MainMenu onNavigate={navigate} />
      )}
      {screen === 'quick' && (
        <window.QuickMatchHandoff onBack={() => setScreen('menu')} />
      )}
      {screen === 'setup' && (
        <window.RunSetup
          mode="roguelite"
          onBack={() => setScreen('menu')}
          onBegin={beginRun}
        />
      )}
      {screen === 'map' && run && (
        <window.RogueMap
          run={run}
          tweaks={tweaks}
          onBack={() => { if (window.confirm('Abandon this run? Progress will be lost.')) { setRunOutcome('loss'); setScreen('summary'); } }}
          onMainMenu={() => { if (window.confirm('Abandon this run? Progress will be lost.')) { setRunOutcome('loss'); setScreen('summary'); } }}
          onPickNode={handlePickNode}
        />
      )}
      {screen === 'shop' && run && (
        <window.Shop
          run={run}
          onLeave={({ gold, deck }) => {
            setRun(r => ({ ...r, gold, deck, shopSeed: Math.random() }));
            setScreen('map');
          }}
          onTransact={(t) => {
            setRun(r => ({
              ...r,
              bought: (r.bought || 0) + (t.type === 'buy' ? 1 : 0),
              sold:   (r.sold   || 0) + (t.type === 'sell' ? 1 : 0),
            }));
          }}
        />
      )}
      {screen === 'rest' && run && (
        <window.RestArea run={run} onLeave={() => setScreen('map')} />
      )}
      {screen === 'summary' && run && (
        <window.RunSummary
          run={run}
          outcome={runOutcome || 'loss'}
          unlockedItem={runOutcome === 'win' ? lastUnlocked : null}
          onReturnMenu={() => { setRun(null); setRunOutcome(null); setLastUnlocked(null); setScreen('menu'); }}
        />
      )}

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Map">
          <window.TweakRadio
            label="Map style"
            value={tweaks.mapStyle}
            options={[
              { value: 'tactical', label: 'Tactical' },
              { value: 'parchment', label: 'Parchment' },
            ]}
            onChange={v => setTweak('mapStyle', v)}
          />
          <window.TweakRadio
            label="Modifier preview"
            value={tweaks.modifierAlwaysVisible ? 'always' : 'hover'}
            options={[
              { value: 'always', label: 'Always' },
              { value: 'hover', label: 'On hover' },
            ]}
            onChange={v => setTweak('modifierAlwaysVisible', v === 'always')}
          />
        </window.TweakSection>

        <window.TweakSection label="Theme">
          <window.TweakRadio
            label="Accent"
            value={tweaks.accent}
            options={['gold', 'silver', 'crimson', 'emerald']}
            onChange={v => setTweak('accent', v)}
          />
        </window.TweakSection>

        <window.TweakSection label="Jump To">
          <window.TweakButton label="Main Menu" onClick={() => setScreen('menu')} />
          <window.TweakButton label="Run Setup" onClick={() => setScreen('setup')} />
          <window.TweakButton label="Demo Run (Map)" onClick={() => {
            const f = window.FACTIONS[0];
            setRun({
              mode: 'roguelite',
              factionId: f.id, leader: f.leaders[0],
              deck: window.generateStartingDeck(f.id),
              gold: 8, wins: 2, losses: 1, elites: 0, bosses: 0,
              bought: 1, sold: 0, rests: 1, floorsReached: 3,
              rations: 18, startRations: 26, maxRations: 40,
              equipped: [], seed: Math.random(), shopSeed: Math.random(), difficulty: 'medium',
            });
            setScreen('map');
          }} />
          <window.TweakButton label="Demo Run (Starving)" onClick={() => {
            const f = window.FACTIONS[0];
            setRun({
              mode: 'roguelite',
              factionId: f.id, leader: f.leaders[0],
              deck: window.generateStartingDeck(f.id),
              gold: 4, wins: 5, losses: 3, elites: 1, bosses: 0,
              bought: 2, sold: 2, rests: 1, floorsReached: 9,
              rations: -2, startRations: 24, maxRations: 40,
              equipped: [], seed: Math.random(), shopSeed: Math.random(), difficulty: 'medium',
            });
            setScreen('map');
          }} />
          <window.TweakButton label="Demo Shop" onClick={() => {
            const f = window.FACTIONS[0];
            setRun({
              mode: 'roguelite',
              factionId: f.id, leader: f.leaders[0],
              deck: window.generateStartingDeck(f.id),
              gold: 6, wins: 3, bought: 0, sold: 0,
              rations: 14, startRations: 26, maxRations: 40,
              equipped: [], seed: Math.random(), shopSeed: Math.random(), difficulty: 'medium',
            });
            setScreen('shop');
          }} />
          <window.TweakButton label="Demo Rest" onClick={() => {
            const f = window.FACTIONS[0];
            setRun({
              mode: 'roguelite',
              factionId: f.id, leader: f.leaders[0],
              deck: window.generateStartingDeck(f.id),
              gold: 4, wins: 2,
              rations: 6, startRations: 26, maxRations: 40,
              equipped: [], seed: Math.random(), shopSeed: Math.random(), difficulty: 'medium',
            });
            setScreen('rest');
          }} />
          <window.TweakButton label="Demo Summary (Win)" onClick={() => {
            const f = window.FACTIONS[2];
            setRun({
              mode: 'roguelite',
              factionId: f.id, leader: f.leaders[0],
              deck: window.generateStartingDeck(f.id),
              gold: 14, wins: 12, losses: 3, elites: 2, bosses: 2,
              bought: 6, sold: 3, rests: 2, floorsReached: 16,
              rations: 11, startRations: 28, maxRations: 40,
              equipped: [window.ITEMS[0], window.ITEMS[1]],
              seed: Math.random(), shopSeed: Math.random(), difficulty: 'medium',
            });
            setLastUnlocked(window.ITEMS[4]);
            setRunOutcome('win');
            setScreen('summary');
          }} />
          <window.TweakButton label="Demo Summary (Loss)" onClick={() => {
            const f = window.FACTIONS[5];
            setRun({
              mode: 'roguelite',
              factionId: f.id, leader: f.leaders[0],
              deck: window.generateStartingDeck(f.id),
              gold: 0, wins: 4, losses: 4, elites: 1, bosses: 0,
              bought: 2, sold: 1, rests: 1, floorsReached: 9,
              rations: 0, startRations: 24, maxRations: 40,
              equipped: [window.ITEMS[0]],
              seed: Math.random(), shopSeed: Math.random(), difficulty: 'medium',
            });
            setRunOutcome('bankrupt');
            setScreen('summary');
          }} />
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
