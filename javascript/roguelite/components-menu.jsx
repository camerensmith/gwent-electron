// ─── Main Menu, Run Setup, Rest screens ───

const { useState, useMemo, useEffect } = React;

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function FactionSigil({ faction, size = 38 }) {
  const letter = faction.name === "Scoia'tael" ? "S" : faction.name[0];
  const hue = faction.hue;
  return (
    <div
      className="faction-sigil"
      style={{
        width: size, height: size,
        background: `radial-gradient(circle at 30% 30%, hsl(${hue}, 60%, 75%), hsl(${hue}, 55%, 45%) 70%, hsl(${hue}, 60%, 22%) 100%)`,
        fontSize: size * 0.5,
      }}
    >
      {letter}
    </div>
  );
}

function Embers({ count = 30 }) {
  const seeds = useMemo(() =>
    Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      drift: (Math.random() - 0.5) * 80,
      duration: 6 + Math.random() * 6,
      delay: -Math.random() * 12,
      size: 1 + Math.random() * 3,
    })),
  [count]);
  return (
    <div className="embers">
      {seeds.map((s, i) => (
        <div
          key={i}
          className="ember"
          style={{
            left: s.left + '%',
            width: s.size, height: s.size,
            animationDuration: s.duration + 's',
            animationDelay: s.delay + 's',
            '--drift': s.drift + 'px',
          }}
        />
      ))}
    </div>
  );
}

function MainMenu({ onNavigate, savedRun }) {
  return (
    <div className="screen bg-stone bg-vignette filigree-corners" data-screen-label="01 Main Menu">
      <Embers count={28} />
      <div className="menu-root">
        <div className="menu-title-wrap">
          <img
            src="images/gwentroguelite.png"
            className="menu-logo-img"
            alt="Gwent — The Legendary Card Game: Roguelite"
            onError={function(e){
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = '';
            }}
          />
          <h1 className="menu-title" style={{display:'none'}}>Gwent Electron</h1>
          <div className="menu-sub">— a card game in the old style —</div>
          <div className="menu-rule" />
        </div>

        <div className="menu-buttons">
          {savedRun && (
            <button className="menu-btn primary continue"
              onClick={() => { if(window.rlTocar) window.rlTocar('menu_buy'); onNavigate('continue'); }}
              onMouseEnter={() => { if(window.rlTocar) window.rlTocar('card'); }}>
              <span>
                <span className="menu-glyph">&#10148;</span>Continue Run
                <span className="menu-btn-sub">{(window.FACTIONS.find(f => f.id === savedRun.factionId) || {}).name} &middot; floor {(savedRun.currentFloor || 0) + 1} &middot; {savedRun.gold} gold</span>
              </span>
              <span className="arrow">&#9656;</span>
            </button>
          )}
          <button className="menu-btn primary"
            onClick={() => { if(window.rlTocar) window.rlTocar('menu_buy'); onNavigate('quick'); }}
            onMouseEnter={() => { if(window.rlTocar) window.rlTocar('card'); }}>
            <span><span className="menu-glyph">&#9876;</span>Quick Match</span>
            <span className="arrow">&#9656;</span>
          </button>
          <button className="menu-btn primary"
            onClick={() => { if(window.rlTocar) window.rlTocar('menu_buy'); onNavigate('roguelite'); }}
            onMouseEnter={() => { if(window.rlTocar) window.rlTocar('card'); }}>
            <span><span className="menu-glyph">&#10022;</span>{savedRun ? 'New Roguelite Run' : 'Roguelite'}</span>
            <span className="arrow">&#9656;</span>
          </button>
          <button className="menu-btn"
            onClick={() => { if(window.rlTocar) window.rlTocar('menu_buy'); onNavigate('stats'); }}
            onMouseEnter={() => { if(window.rlTocar) window.rlTocar('card'); }}>
            <span><span className="menu-glyph">&#9672;</span>Statistics</span>
            <span className="arrow">&#9656;</span>
          </button>
          <button className="menu-btn"
            onClick={() => { if(window.rlTocar) window.rlTocar('menu_buy'); onNavigate('rules'); }}
            onMouseEnter={() => { if(window.rlTocar) window.rlTocar('card'); }}>
            <span><span className="menu-glyph">&#9623;</span>Rulebook</span>
            <span className="arrow">&#9656;</span>
          </button>
          <button className="menu-btn"
            onClick={() => { if(window.rlTocar) window.rlTocar('menu_buy'); onNavigate('quit'); }}
            onMouseEnter={() => { if(window.rlTocar) window.rlTocar('card'); }}>
            <span><span className="menu-glyph">&#10005;</span>Quit</span>
            <span className="arrow">&#9656;</span>
          </button>
        </div>

        <div className="menu-footer">
          <span>v 4.0 &middot; The Roguelite Update</span>
        </div>
      </div>
    </div>
  );
}

function DeckPreview({ deck, onHover }) {
  const RL = window.RL;
  const stats = RL.deckStats(deck);
  return (
    <div className="deck-preview-wrap">
      <div className="deck-stat-row">
        <div className="deck-stat"><div className="value">{stats.cards}</div><div className="label">Cards</div></div>
        <div className="deck-stat"><div className="value">{stats.units}</div><div className="label">Units</div></div>
        <div className="deck-stat"><div className="value">{stats.specials}</div><div className="label">Specials</div></div>
        <div className="deck-stat"><div className="value">{stats.strength}</div><div className="label">Strength</div></div>
      </div>
      <div className="deck-list">
        {deck.map(e => {
          const info = RL.cardInfo(e.key);
          if (!info) return null;
          return (
            <div key={e.uid}
              className={`deck-card-row ${info.hero ? 'is-hero' : ''} ${info.special ? 'is-special' : ''}`}
              onMouseEnter={onHover ? () => onHover(e) : undefined}
              onMouseLeave={onHover ? () => onHover(null) : undefined}>
              <div className="dc-strength">{info.special ? '✦' : RL.entryStrength(e)}</div>
              <div className="dc-name">{info.name}</div>
              <div className="dc-row">{info.rowLabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RunSetup({ onBack, onBegin }) {
  const RL = window.RL;
  const [factionId, setFactionId] = useState(window.FACTIONS[0].id);
  const [leaderIdx, setLeaderIdx] = useState(0);
  const [variant, setVariant] = useState(0);
  const [equipped, setEquipped] = useState([]);
  const [hovered, setHovered] = useState(null);

  const faction = window.FACTIONS.find(f => f.id === factionId);
  const deck = useMemo(() => RL.startingDeck(factionId, variant), [factionId, variant]);
  const variants = RL.variantCount(factionId);
  const startRations = RL.START_RATIONS + (equipped.some(i => i.id === 'quartermaster') ? 20 : 0);

  const toggleItem = (item) => {
    setEquipped(prev => {
      if (prev.find(i => i.id === item.id)) return prev.filter(i => i.id !== item.id);
      if (prev.length >= 2) return [prev[1], item];
      return [...prev, item];
    });
  };

  return (
    <div className="screen bg-table bg-vignette" data-screen-label="02 Run Setup">
      <div className="topnav">
        <button className="back-btn" onClick={onBack} title="Back">&#9666;</button>
        <span className="crumb">Roguelite &middot; Run Setup</span>
      </div>

      <div className="setup-root">
        <div className="setup-col">
          <div className="setup-header"><h2>1 &middot; Choose a Faction</h2></div>
          <div className="faction-grid">
            {window.FACTIONS.map(f => (
              <div
                key={f.id}
                className={`faction-tile ${f.id === factionId ? 'active' : ''}`}
                onClick={() => { setFactionId(f.id); setLeaderIdx(0); setVariant(0); }}
              >
                <FactionSigil faction={f} size={38} />
                <div>
                  <div className="ft-name">{f.name}</div>
                  <div className="ft-motto">{f.motto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="setup-col">
          <div className="setup-header"><h2>2 &middot; Choose a Leader</h2><span className="step">{faction.name}</span></div>
          <div className="faction-detail">
            <div className="leader-pick">
              <div className="leader-scroll">
                <div className="leader-row">
                  {faction.leaders.map((ldr, i) => (
                    <div
                      key={ldr.id}
                      className={`leader-tile ${i === leaderIdx ? 'active' : ''}`}
                      onClick={() => setLeaderIdx(i)}
                    >
                      <div
                        className={`leader-portrait${ldr.image ? ' has-image' : ''}`}
                        data-card-id={ldr.id}
                        style={ldr.image ? { backgroundImage: `url('${ldr.image}')` } : undefined}
                      />
                      <div className="lt-name">{ldr.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              {faction.leaders[leaderIdx] && window.LEADER_ABILITIES[faction.leaders[leaderIdx].ability] && (
                <div className="leader-ability">
                  <div className="la-label">Leader Ability</div>
                  <div className="la-text">{window.LEADER_ABILITIES[faction.leaders[leaderIdx].ability]}</div>
                </div>
              )}
            </div>

            <div className="faction-passive">
              <div className="fp-label">Faction Passive</div>
              <div className="fp-text">{window.FACTION_PASSIVES[faction.id]}</div>
            </div>

            <div className="setup-start-card">
              <div className="fp-label">You start with</div>
              <div className="ssc-row">
                <div><b>{RL.START_GOLD}</b> gold</div>
                <div><b>{startRations}</b> rations</div>
                <div>march cost <b>{RL.marchCost(deck, equipped)}</b> / step</div>
              </div>
              <div className="ssc-note">
                Your starting deck is your faction's deck without its heroes or best units.
                Win battles to earn gold, then buy stronger cards from merchants.
              </div>
            </div>
          </div>
        </div>

        <div className="setup-col">
          <div className="setup-header">
            <h2>3 &middot; Starting Deck</h2>
            {variants > 1 && <span className="step">version {(variant % variants) + 1} of {variants}</span>}
          </div>
          <DeckPreview deck={deck} onHover={setHovered} />
          {hovered && <div className="setup-hover-detail"><window.CardDetail entry={hovered} extra={{ items: equipped }} /></div>}
          {variants > 1 && (
            <button className="gw-btn compact ghost" style={{ marginTop: 12 }} onClick={() => setVariant(v => v + 1)}>
              &#8635; Try Another Starting Deck
            </button>
          )}
        </div>

        <div className="setup-items-strip">
          <div className="sis-header">
            <span className="sis-eyebrow">4 &middot; Provisions: pick up to 2 bonuses for this run</span>
            <span className="sis-count">{equipped.length} / 2</span>
          </div>
          <div className="sis-row">
            {window.ITEMS.map(item => {
              const isEquipped = !!equipped.find(i => i.id === item.id);
              return (
                <div
                  key={item.id}
                  className={`item-card ${isEquipped ? 'equipped' : ''} rarity-${item.rarity}`}
                  onClick={() => toggleItem(item)}
                  title={item.desc}
                >
                  <div className="item-card-head">
                    <span className="item-card-glyph">{item.glyph}</span>
                    <span className="item-card-name">{item.name}</span>
                  </div>
                  <div className="item-card-desc">{item.desc}</div>
                  {isEquipped && <div className="item-card-equipped-flag">EQUIPPED</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="setup-footer-grid">
          <div className="left">
            <span className="flavour" style={{ fontSize: 18 }}>
              "The road is long. Choose your colours well."
            </span>
          </div>
          <button
            className="gw-btn"
            onClick={() => onBegin({ factionId, leader: faction.leaders[leaderIdx], deck, equipped, variant })}
          >
            &#9876; Begin Run
          </button>
        </div>
      </div>
    </div>
  );
}

// Camp: choose ONE — rest (rations) or drill (one unit gets +1 strength for the run).
function RestArea({ run, onLeave }) {
  const RL = window.RL;
  const flavour = useMemo(() => rand(window.REST_LINES), []);
  const items = run.equipped || [];
  const gain = RL.CAMP_RATIONS + (RL.hasItem(items, 'foragers_eye') ? 10 : 0);
  const actualGain = Math.min(run.maxRations, run.rations + gain) - run.rations;
  const [mode, setMode] = useState(null); // null | 'drill'
  const [hovered, setHovered] = useState(null);
  const drillable = useMemo(
    () => RL.sortDeck(run.deck).filter(e => { const i = RL.cardInfo(e.key); return i && !i.special && !i.hero; }),
    [run.deck]
  );

  const rest = () => { window.rlSfx('menu_buy'); onLeave({ kind: 'rest', gain: actualGain }); };
  const drill = (entry) => { window.rlSfx('menu_buy'); onLeave({ kind: 'drill', uid: entry.uid }); };

  return (
    <div className="screen bg-stone bg-vignette" data-screen-label="06 Rest Area">
      <div className="topnav">
        <span className="crumb">Roguelite &middot; Camp</span>
      </div>

      {mode !== 'drill' ? (
        <div className="rest-root">
          <div className="rest-inner">
            <h1 className="rest-title">A Quiet Camp</h1>
            <div className="campfire">
              <div className="flame f1" />
              <div className="flame f2" />
              <div className="flame f3" />
            </div>
            <p className="rest-flavour">"{flavour}"</p>
            <div className="rest-choose">Choose one</div>

            <div className="rest-options">
              <div className="rest-option" onClick={rest}>
                <span className="ro-glyph">&#9672;</span>
                <div className="ro-name">Rest</div>
                <div className="ro-desc">
                  Restore <b>+{actualGain}</b> rations ({run.rations} &rarr; {run.rations + actualGain} of {run.maxRations}).
                  {actualGain < gain && ' Your packs are nearly full.'}
                </div>
              </div>
              <div className={`rest-option ${drillable.length ? '' : 'disabled'}`} onClick={drillable.length ? () => setMode('drill') : undefined}>
                <span className="ro-glyph">&#9874;</span>
                <div className="ro-name">Drill</div>
                <div className="ro-desc">Pick one unit. It gains <b>+1 strength</b> for the rest of the run. Heroes can't be drilled.</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="drill-root">
          <div className="drill-head">
            <div>
              <div className="rest-title" style={{ fontSize: 40 }}>Drill a Unit</div>
              <div className="flavour">Click the unit that will train tonight. It keeps +1 strength for the rest of the run.</div>
            </div>
            <button className="gw-btn compact ghost" onClick={() => setMode(null)}>&#9666; Back</button>
          </div>
          <div className="drill-body">
            <div className="rdv-grid">
              {drillable.map(e => <window.CardTile key={e.uid} entry={e} size="sm" onHover={setHovered} onClick={() => drill(e)} />)}
            </div>
            <div className="rdv-side"><window.CardDetail entry={hovered} extra={{ items }} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MainMenu, RunSetup, RestArea, FactionSigil });
