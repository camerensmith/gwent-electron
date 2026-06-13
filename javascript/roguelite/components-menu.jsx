// ─── Main Menu, Run Setup, Rest screens ───

const { useState, useMemo, useEffect } = React;

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffled = (arr) => arr.slice().sort(() => Math.random() - 0.5);

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

function MainMenu({ onNavigate }) {
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
          <button className="menu-btn primary"
            onClick={() => { if(window.rlTocar) window.rlTocar('menu_buy'); onNavigate('quick'); }}
            onMouseEnter={() => { if(window.rlTocar) window.rlTocar('card'); }}>
            <span><span className="menu-glyph">&#9876;</span>Quick Match</span>
            <span className="arrow">&#9656;</span>
          </button>
          <button className="menu-btn primary"
            onClick={() => { if(window.rlTocar) window.rlTocar('menu_buy'); onNavigate('roguelite'); }}
            onMouseEnter={() => { if(window.rlTocar) window.rlTocar('card'); }}>
            <span><span className="menu-glyph">&#10022;</span>Roguelite</span>
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
          <span style={{ letterSpacing: '0.16em' }}>&#9835; ON</span>
        </div>
      </div>
    </div>
  );
}

function generateStartingDeck(factionId) {
  const pool = window.CARD_POOL[factionId] || [];
  const deck = [];
  const unitCount = 16 + Math.floor(Math.random() * 5);
  for (let i = 0; i < unitCount; i++) {
    const name = pool[Math.floor(Math.random() * pool.length)];
    const isHero = Math.random() < 0.18;
    const strength = isHero ? 5 + Math.floor(Math.random() * 11) : 1 + Math.floor(Math.random() * 10);
    const row = rand(['Close', 'Ranged', 'Siege', 'Agile']);
    deck.push({ name, strength, hero: isHero, row, type: 'unit', id: Math.random().toString(36).slice(2) });
  }

  // Faction-guaranteed nonunit cards always included in the starting deck.
  const requiredSpecials = factionId === 'witchers'
    ? [...window.WITCHER_SIGNS].sort(() => Math.random() - 0.5).slice(0, 4)
    : [...(window.FACTION_REQUIRED_SPECIALS[factionId] || [])];

  // Total nonunit card count varies between 0 and 10; required cards fill first.
  const totalSpecialTarget = Math.floor(Math.random() * 11);
  const randomCount = Math.max(0, totalSpecialTarget - requiredSpecials.length);
  const allSpecialNames = [...requiredSpecials];
  for (let i = 0; i < randomCount; i++) {
    const pool = window.SPECIALS_POOL;
    allSpecialNames.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  for (const name of allSpecialNames) {
    deck.push({ name, strength: 0, hero: false, row: 'Special', type: 'special', id: Math.random().toString(36).slice(2) });
  }

  return deck.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'unit' ? -1 : 1;
    if (a.hero !== b.hero) return a.hero ? -1 : 1;
    return b.strength - a.strength;
  });
}

function DeckPreview({ deck }) {
  const total = deck.reduce((s, c) => s + c.strength, 0);
  const heroes = deck.filter(c => c.hero).length;
  const specials = deck.filter(c => c.type === 'special').length;
  const units = deck.filter(c => c.type === 'unit').length;
  return (
    <div className="deck-preview-wrap">
      <div className="deck-stat-row">
        <div className="deck-stat"><div className="value">{deck.length}</div><div className="label">Cards</div></div>
        <div className="deck-stat"><div className="value">{units}</div><div className="label">Units</div></div>
        <div className="deck-stat"><div className="value">{heroes}</div><div className="label">Heroes</div></div>
        <div className="deck-stat"><div className="value">{total}</div><div className="label">Strength</div></div>
      </div>
      <div className="deck-list">
        {deck.map(c => (
          <div key={c.id} className={`deck-card-row ${c.hero ? 'is-hero' : ''} ${c.type === 'special' ? 'is-special' : ''}`}>
            <div className="dc-strength">{c.type === 'special' ? '\u2726' : c.strength}</div>
            <div className="dc-name">{c.name}</div>
            <div className="dc-row">{c.row}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RunSetup({ mode, onBack, onBegin }) {
  const [factionId, setFactionId] = useState(window.FACTIONS[0].id);
  const [leaderIdx, setLeaderIdx] = useState(0);
  const [deckSeed, setDeckSeed] = useState(0);
  const [equipped, setEquipped] = useState([]);

  const faction = window.FACTIONS.find(f => f.id === factionId);
  const deck = useMemo(() => generateStartingDeck(factionId), [factionId, deckSeed]);

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
          <div className="setup-header"><h2>Choose Your Banner</h2><span className="step">1 of 2</span></div>
          <div className="faction-grid">
            {window.FACTIONS.map(f => (
              <div
                key={f.id}
                className={`faction-tile ${f.id === factionId ? 'active' : ''}`}
                onClick={() => { setFactionId(f.id); setLeaderIdx(0); setDeckSeed(s => s + 1); }}
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
          <div className="setup-header"><h2>Banner &amp; Leader</h2><span className="step">{faction.name}</span></div>
          <div className="faction-detail">
            <div className="faction-banner">
              <FactionSigil faction={faction} size={82} />
              <div>
                <div className="fb-name-row">
                  <h3 className="fb-name">{faction.name}</h3>
                  <img
                    className="faction-shield"
                    src={`images/icons/deck_shield_${faction.id}.png`}
                    alt={`${faction.name} shield`}
                  />
                </div>
                <div className="fb-motto">{faction.motto}</div>
              </div>
            </div>

            <div className="leader-pick">
              <h3>Choose a Leader &mdash; {faction.leaders.length} available</h3>
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
              {faction.leaders[leaderIdx] && faction.leaders[leaderIdx].ability && window.LEADER_ABILITIES[faction.leaders[leaderIdx].ability] && (
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
          </div>
        </div>

        <div className="setup-col">
          <div className="setup-header">
            <h2>Starting Hand of Fate</h2>
            <span className="step">2 of 2</span>
          </div>
          <DeckPreview deck={deck} />
          <button className="gw-btn compact ghost" style={{ marginTop: 12 }} onClick={() => setDeckSeed(s => s + 1)}>
            &#8635; Reroll Starting Deck
          </button>
        </div>

        <div className="setup-items-strip">
          <div className="sis-header">
            <span className="sis-eyebrow">PROVISIONS &middot; Equip up to 2 items for this run</span>
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
            <span className="flavour" style={{ fontSize: 16 }}>
              "The road is long. Choose your colours well."
            </span>
          </div>
          <button
            className="gw-btn"
            onClick={() => onBegin({ factionId, leader: faction.leaders[leaderIdx], deck, mode: 'roguelite', equipped })}
          >
            &#9876; Begin Run
          </button>
        </div>
      </div>
    </div>
  );
}

function RestArea({ run, onLeave }) {
  const flavour = useMemo(() => rand(window.REST_LINES), []);
  const items = run.equipped || [];
  const hasForagers = items.some(i => i.id === 'foragers_eye');
  const rationsGained = hasForagers ? 28 : 20;
  return (
    <div className="screen bg-stone bg-vignette" data-screen-label="06 Rest Area">
      <div className="topnav">
        <button className="back-btn" onClick={onLeave} title="Back to map">&#9666;</button>
        <span className="crumb">Roguelite &middot; Camp</span>
      </div>

      <div className="rest-root">
        <div className="rest-inner">
          <h1 className="rest-title">A Quiet Camp</h1>
          <div className="campfire">
            <div className="flame f1" />
            <div className="flame f2" />
            <div className="flame f3" />
          </div>
          <p className="rest-flavour">"{flavour}"</p>

          <div className="rest-rations-banner">
            <span className="rrb-glyph">&#9672;</span>
            <div>
              <div className="rrb-amt">+{rationsGained}</div>
              <div className="rrb-label">Rations restored</div>
              {hasForagers && <div className="rrb-bonus">Forager's Eye &middot; +2</div>}
            </div>
            <div className="rrb-stock">
              <div className="rrb-stock-amt">{run.rations}</div>
              <div className="rrb-stock-label">of {run.maxRations} carried</div>
            </div>
          </div>

          <div className="rest-options">
            <div className="rest-option" onClick={onLeave}>
              <span className="ro-glyph">&#9623;</span>
              <div className="ro-name">Rest a While</div>
              <div className="ro-desc">You sit, the fire crackles, the road waits. Rations have been restored.</div>
            </div>
            <div className="rest-option disabled" title="Not yet implemented">
              <span className="ro-glyph">&#9874;</span>
              <div className="ro-name">Sharpen a Card</div>
              <div className="ro-desc">Coming later &mdash; upgrade one card in your run deck.</div>
            </div>
            <div className="rest-option disabled" title="Not yet implemented">
              <span className="ro-glyph">&#10022;</span>
              <div className="ro-name">Remove a Card</div>
              <div className="ro-desc">Coming later &mdash; purge one card from your run deck.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MainMenu, RunSetup, RestArea, FactionSigil, generateStartingDeck });
