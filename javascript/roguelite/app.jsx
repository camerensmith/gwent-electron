// ─── Root app — screen state machine, run state, Tweaks panel ───

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mapStyle": "tactical",
  "accent": "gold",
  "modifierAlwaysVisible": true,
  "orientation": "vertical"
}/*EDITMODE-END*/;

// ── Persistence: the run survives closing the app (localStorage) and the trip to the
//    battle page (sessionStorage). Browser storage can be unavailable, so every access is guarded.
const SAVE_KEY = 'rogueliteSavedRun';
const HOWTO_KEY = 'rogueliteSeenHowTo';

function storageGet(store, key) { try { return window[store].getItem(key); } catch (e) { return null; } }
function storageSet(store, key, value) { try { window[store].setItem(key, value); } catch (e) {} }
function storageRemove(store, key) { try { window[store].removeItem(key); } catch (e) {} }

function parseRun(raw) {
  if (!raw) return null;
  try {
    const run = JSON.parse(raw);
    // Runs saved before decks were real cards have entries without a `key`; they can't be resumed.
    if (!run || !run.factionId || !Array.isArray(run.deck) || run.deck.some(e => !e.key || !window.RL.cardInfo(e.key))) return null;
    return run;
  } catch (e) { return null; }
}
const loadSavedRun = () => parseRun(storageGet('localStorage', SAVE_KEY));
const saveRun = (run) => storageSet('localStorage', SAVE_KEY, JSON.stringify(run));
const clearSavedRun = () => storageRemove('localStorage', SAVE_KEY);

const removeRandomCard = (deck) => {
  if (!deck.length) return { deck, removed: null };
  const idx = Math.floor(Math.random() * deck.length);
  return { deck: deck.filter((_, i) => i !== idx), removed: deck[idx] };
};

const cardName = (entry) => (window.RL.cardInfo(entry.key) || {}).name || 'a card';

// Apply a finished battle to the run. Returns the new run plus either an event to show or the end of the run.
function applyBattleResult(savedRun, result) {
  const RL = window.RL;
  const { won, rationDrain, goldReward, rationReward, goldLoss, nodeType, isFinalBoss } = result;
  let run = { ...savedRun, pendingBattle: null, nextEncounterBuff: null };
  const deltas = [];

  if (rationDrain > 0) {
    const paid = Math.min(run.rations, rationDrain);
    run.rations -= paid;
    deltas.push({ text: `−${paid} rations (boss rules)`, tone: 'bad' });
  }
  (result.permanentlyRemoved || []).forEach(key => {
    const idx = run.deck.findIndex(e => e.key === key);
    if (idx === -1) return;
    deltas.push({ text: `${cardName(run.deck[idx])} was banished from your deck`, tone: 'bad' });
    run.deck = run.deck.filter((_, i) => i !== idx);
  });

  const label = nodeType === 'boss' ? 'Boss' : nodeType === 'elite' ? 'Elite' : 'Skirmish';
  if (won) {
    const gained = Math.min(run.maxRations, run.rations + (rationReward || 0)) - run.rations;
    run = {
      ...run,
      gold: run.gold + goldReward,
      rations: run.rations + gained,
      wins: (run.wins || 0) + 1,
      elites: (run.elites || 0) + (nodeType === 'elite' ? 1 : 0),
      bosses: (run.bosses || 0) + (nodeType === 'boss' ? 1 : 0),
    };
    deltas.unshift(...[{ text: `+${goldReward} gold`, tone: 'good' }].concat(gained > 0 ? [{ text: `+${gained} rations`, tone: 'good' }] : []));
    if (isFinalBoss) return { run, end: { outcome: 'win', reason: 'You defeated the final boss.' } };
    return {
      run,
      event: {
        tone: 'good',
        eyebrow: `${label} won`,
        title: nodeType === 'boss' ? 'Act 1 Complete' : 'Victory',
        line: nodeType === 'boss' ? 'The pretender falls. The road climbs on, into the last mile.' : 'The field is yours. You gather what the fallen left behind.',
        deltas,
      },
    };
  }

  run = { ...run, losses: (run.losses || 0) + 1 };
  if (nodeType === 'boss') {
    return { run, end: { outcome: 'loss', reason: 'You were defeated by the boss. Losing a boss battle ends the run.' } };
  }
  if (run.gold < goldLoss) {
    return { run: { ...run, gold: 0 }, end: { outcome: 'bankrupt', reason: `You lost a battle with a stake of ${goldLoss} gold but only had ${run.gold}.` } };
  }
  run.gold -= goldLoss;
  deltas.unshift({ text: `−${goldLoss} gold (the stake)`, tone: 'bad' });
  return {
    run,
    event: {
      tone: 'bad',
      eyebrow: `${label} lost`,
      title: 'Defeat',
      line: 'You pay what you owe and limp back onto the road.',
      deltas,
      note: `${run.gold} gold left. If you lose a battle whose stake is more than that, the run ends.`,
    },
  };
}

function App() {
  const RL = window.RL;
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState('menu');
  const [run, setRun] = useState(null);
  const [ending, setEnding] = useState(null); // { outcome, reason }
  const [events, setEvents] = useState([]);
  const [overlay, setOverlay] = useState(null); // 'deck' | 'help' | null
  const [savedRun, setSavedRun] = useState(() => loadSavedRun());

  useEffect(() => {
    const stage = document.querySelector('.stage');
    if (!stage) return;
    stage.classList.remove('accent-gold', 'accent-silver', 'accent-crimson', 'accent-emerald');
    stage.classList.add('accent-' + (tweaks.accent || 'gold'));
  }, [tweaks.accent]);

  // Keep the saved run in step with every change while a run is active.
  useEffect(() => {
    if (run && run.factionId && ['map', 'shop', 'rest'].includes(screen)) saveRun(run);
  }, [run, screen]);

  const pushEvents = (list) => { if (list.length) setEvents(prev => prev.concat(list)); };
  const closeEvent = () => {
    const [current, ...rest] = events;
    setEvents(rest);
    if (current && current.onClose) current.onClose();
  };

  const endRun = (r, end) => {
    clearSavedRun();
    setSavedRun(null);
    setRun(r);
    setEnding(end);
    setScreen('summary');
  };

  // On mount: apply a battle result returned from index.html
  useEffect(() => {
    const rawResult = storageGet('sessionStorage', 'rogueliteBattleResult');
    if (!rawResult) return;
    storageRemove('sessionStorage', 'rogueliteBattleResult');
    let result;
    try { result = JSON.parse(rawResult); } catch (e) { return; }
    const before = parseRun(storageGet('sessionStorage', 'rogueliteRunState')) || loadSavedRun();
    storageRemove('sessionStorage', 'rogueliteRunState');
    if (!before) return;

    const out = applyBattleResult(before, result);
    if (out.end) { endRun(out.run, out.end); return; }
    setRun(out.run);
    saveRun(out.run);
    setScreen('map');
    if (out.event) setEvents([out.event]);
  }, []);

  const launchBattle = (r, node, assignment) => {
    const items = r.equipped || [];
    const gold = window.battleGold(assignment, items);
    const actIndex = node.act || 0;
    const whetstoneUsedActs = r.whetstoneUsedActs || [];
    const whetstoneApplies = RL.hasItem(items, 'whetstone') && !whetstoneUsedActs.includes(actIndex);

    const ctx = {
      playerFaction:  r.factionId,
      playerLeaderId: r.leader?.id || null,
      playerDeck:     r.deck.map(e => ({ key: e.key, bonus: e.bonus || 0 })),
      oppFaction:     assignment?.oppFaction?.id   || null,
      oppLeaderId:    assignment?.oppLeader?.id    || null,
      oppLeaderName:  assignment?.oppLeader?.name  || 'Opponent',
      nodeType:       node.type,
      act:            actIndex,
      goldReward:     gold,
      rationReward:   assignment?.reward?.rations || 0,
      goldLoss:       gold,
      currentRations: r.rations,
      whetstone:      whetstoneApplies,
      isFinalBoss:    node.type === 'boss' && node.act === 1,
      nextEncounterBuff: r.nextEncounterBuff || null,
      bossEffects:    assignment?.effects?.filter(e => e.id !== 'veteran') || [],
    };
    const saved = {
      ...r,
      whetstoneUsedActs: whetstoneApplies ? [...whetstoneUsedActs, actIndex] : whetstoneUsedActs,
      pendingBattle: ctx,
    };
    saveRun(saved);
    storageSet('sessionStorage', 'rogueliteRunState', JSON.stringify(saved));
    storageSet('sessionStorage', 'rogueliteBattle', JSON.stringify(ctx));
    window.location.href = 'index.html';
  };

  const resumeBattle = (r) => {
    storageSet('sessionStorage', 'rogueliteRunState', JSON.stringify(r));
    storageSet('sessionStorage', 'rogueliteBattle', JSON.stringify(r.pendingBattle));
    window.location.href = 'index.html';
  };

  const navigate = (target) => {
    if (target === 'quick') {
      // Hand off to the existing Gwent Electron deck builder and game.
      // Flag tells index.html to skip the splash screen.
      storageSet('sessionStorage', 'fromMainMenu', '1');
      window.location.href = 'index.html';
    } else if (target === 'roguelite') {
      if (savedRun) {
        setEvents([{
          tone: 'bad', eyebrow: 'New run', title: 'Abandon your current run?',
          line: 'Starting a new run throws away the one in progress.',
          actions: [
            { label: 'Keep it', ghost: true },
            { label: 'Start New Run', onClick: () => { clearSavedRun(); setSavedRun(null); setScreen('setup'); } },
          ],
        }]);
        return;
      }
      setScreen('setup');
    } else if (target === 'continue' && savedRun) {
      if (savedRun.pendingBattle) { resumeBattle(savedRun); return; }
      setRun(savedRun);
      setScreen(savedRun.pendingScreen || 'map');
    } else if (target === 'stats') {
      window.location.href = 'statistics-viewer.html';
    } else if (target === 'rules') {
      window.open('rules.html', '_blank');
    } else if (target === 'quit') {
      if (window.confirm('Quit Gwent Electron?')) window.close();
    }
  };

  const beginRun = ({ factionId, leader, deck, equipped, variant }) => {
    const items = equipped || [];
    const start = RL.START_RATIONS + (RL.hasItem(items, 'quartermaster') ? 20 : 0);
    const newRun = {
      mode: 'roguelite',
      factionId,
      leader,
      variant,
      deck,
      equipped: items,
      gold: RL.START_GOLD,
      rations: start,
      startRations: start,
      maxRations: RL.MAX_RATIONS,
      wins: 0, losses: 0, elites: 0, bosses: 0,
      bought: 0, sold: 0, rests: 0, drills: 0,
      floorsReached: 0,
      whetstoneUsedActs: [],
      seed: Math.random(),
      shopSeed: Math.random(),
    };
    setRun(newRun);
    setScreen('map');
    if (!storageGet('localStorage', HOWTO_KEY)) {
      storageSet('localStorage', HOWTO_KEY, '1');
      setOverlay('help');
    }
  };

  const handlePickNode = (node, assignment, mapState) => {
    const items = run.equipped || [];
    let r = {
      ...run,
      nodeStates: mapState.nodeStates,
      currentFloor: mapState.currentFloor,
      floorsReached: Math.max(run.floorsReached || 0, node.floor + 1),
    };
    const roadDeltas = [];
    const evts = [];

    // March: pay rations, or starve and lose a card
    const cost = RL.marchCost(r.deck, items);
    if (r.rations >= cost) {
      r.rations -= cost;
    } else {
      r.rations = 0;
      const { deck, removed } = removeRandomCard(r.deck);
      r.deck = deck;
      evts.push({
        tone: 'bad', eyebrow: 'Starvation', title: 'The stores are bare',
        line: 'With nothing left to eat, one of your company slips away in the night.',
        card: removed,
        deltas: removed ? [{ text: `${cardName(removed)} deserted`, tone: 'bad' }] : [],
        note: 'Rest at a camp, or win battles that pay rations, to stop the bleeding.',
      });
    }
    if (RL.hasItem(items, 'lucky_coin') && Math.random() < 0.1) {
      r.gold += 1;
      roadDeltas.push({ text: '+1 gold (Lucky Coin)', tone: 'good' });
    }

    if (node.type === 'shop') {
      r = { ...r, pendingScreen: 'shop' };
      setScreen('shop');
    } else if (node.type === 'rest') {
      r = { ...r, pendingScreen: 'rest' };
      setScreen('rest');
    } else if (node.type === 'cache') {
      r.gold += 2;
      evts.push({ tone: 'good', eyebrow: 'Cache', title: 'A Buried Strongbox', line: window.NODE_TYPES.cache.flavour, deltas: [{ text: '+2 gold', tone: 'good' }, ...roadDeltas] });
      roadDeltas.length = 0;
    } else if (node.type === 'mystery') {
      const out = assignment?.mystery || window.MYSTERY_OUTCOMES[Math.floor(Math.random() * window.MYSTERY_OUTCOMES.length)];
      const deltas = [];
      let card = null;
      let tone = 'neutral';
      if (out.kind === 'gold') {
        const before = r.gold;
        r.gold = Math.max(0, r.gold + out.amount);
        deltas.push({ text: `${r.gold - before >= 0 ? '+' : ''}${r.gold - before} gold`, tone: out.amount >= 0 ? 'good' : 'bad' });
        tone = out.amount >= 0 ? 'good' : 'bad';
      } else if (out.kind === 'rations') {
        const before = r.rations;
        r.rations = Math.max(0, Math.min(r.maxRations, r.rations + out.amount));
        deltas.push({ text: `${r.rations - before >= 0 ? '+' : ''}${r.rations - before} rations`, tone: out.amount >= 0 ? 'good' : 'bad' });
        tone = out.amount >= 0 ? 'good' : 'bad';
      } else if (out.kind === 'deck') {
        const { deck, removed } = removeRandomCard(r.deck);
        r.deck = deck;
        card = removed;
        if (removed) deltas.push({ text: `${cardName(removed)} was lost`, tone: 'bad' });
        tone = 'bad';
      } else if (out.kind === 'recruit') {
        const key = RL.randomRecruit(r.factionId);
        if (key) {
          card = RL.newEntry(key);
          r.deck = [...r.deck, card];
          deltas.push({ text: `${cardName(card)} joined your deck`, tone: 'good' });
        }
        tone = 'good';
      } else if (out.kind === 'buff') {
        r.nextEncounterBuff = out.buff;
        deltas.push({ text: out.effect, tone: 'good' });
        tone = 'good';
      }
      evts.push({ tone, eyebrow: 'Mystery', title: 'Something on the Road', line: out.line, card, deltas: deltas.concat(roadDeltas) });
      roadDeltas.length = 0;
    }

    if (roadDeltas.length) evts.push({ tone: 'good', eyebrow: 'On the road', title: 'A Glint in the Dust', deltas: roadDeltas });

    if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
      if (evts.length) {
        // Show what happened on the march first, then go to battle.
        evts[evts.length - 1].button = 'To Battle';
        evts[evts.length - 1].onClose = () => launchBattle(r, node, assignment);
        setRun(r);
        pushEvents(evts);
      } else {
        launchBattle(r, node, assignment);
      }
      return;
    }
    setRun(r);
    pushEvents(evts);
  };

  const abandon = () => {
    setEvents([{
      tone: 'bad', eyebrow: 'Abandon run', title: 'Give up this run?',
      line: 'The road will forget you. Progress is lost.',
      actions: [
        { label: 'Keep Going', ghost: true },
        { label: 'Abandon', onClick: () => endRun(run, { outcome: 'loss', reason: 'You abandoned the run.' }) },
      ],
    }]);
  };

  return (
    <>
      {screen === 'menu' && (
        <window.MainMenu onNavigate={navigate} savedRun={savedRun} />
      )}
      {screen === 'setup' && (
        <window.RunSetup
          onBack={() => setScreen('menu')}
          onBegin={beginRun}
        />
      )}
      {screen === 'map' && run && (
        <window.RogueMap
          run={run}
          tweaks={tweaks}
          onAbandon={abandon}
          onExit={() => { saveRun(run); setSavedRun(run); setRun(null); setScreen('menu'); }}
          onPickNode={handlePickNode}
          onShowDeck={() => setOverlay('deck')}
          onShowHelp={() => setOverlay('help')}
        />
      )}
      {screen === 'shop' && run && (
        <window.Shop
          run={run}
          onLeave={({ gold, deck }) => {
            setRun(r => ({ ...r, gold, deck, shopSeed: Math.random(), pendingScreen: null }));
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
        <window.RestArea run={run} onLeave={(choice) => {
          setRun(r => {
            if (choice.kind === 'rest') {
              return { ...r, rations: Math.min(r.maxRations, r.rations + choice.gain), rests: (r.rests || 0) + 1, pendingScreen: null };
            }
            return {
              ...r,
              deck: r.deck.map(e => e.uid === choice.uid ? { ...e, bonus: (e.bonus || 0) + 1 } : e),
              drills: (r.drills || 0) + 1,
              pendingScreen: null,
            };
          });
          setScreen('map');
        }} />
      )}
      {screen === 'summary' && run && (
        <window.RunSummary
          run={run}
          outcome={ending?.outcome || 'loss'}
          reason={ending?.reason}
          onReturnMenu={() => { setRun(null); setEnding(null); setScreen('menu'); }}
          onNewRun={() => { setRun(null); setEnding(null); setScreen('setup'); }}
        />
      )}

      {overlay === 'deck' && run && (
        <window.DeckViewer deck={run.deck} items={run.equipped} onClose={() => setOverlay(null)} />
      )}
      {overlay === 'help' && <window.HowToPlay onClose={() => setOverlay(null)} />}
      {events.length > 0 && <window.EventModal event={events[0]} onClose={closeEvent} />}

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
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
