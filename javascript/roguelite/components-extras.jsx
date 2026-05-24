// ─── Run Summary screen + Quick Match handoff ───

function RunSummary({ run, outcome, onReturnMenu, unlockedItem }) {
  const faction = window.FACTIONS.find(f => f.id === run.factionId);
  const isWin = outcome === 'win';
  const isBankrupt = outcome === 'bankrupt';
  const headerTitle = isWin
    ? 'A Victorious Run'
    : isBankrupt ? 'Out of Coin, Out of Time' : 'The Road Ends Here';
  const outcomeLabel = isWin ? '\u2726 VICTORY \u2726' : isBankrupt ? '\u20ac BANKRUPT \u20ac' : '\u2715 DEFEAT \u2715';
  const flavour = isWin
    ? '"Two bosses laid low. The standards still fly. The fire still burns."'
    : isBankrupt
      ? '"A purse without coin is a purse without friends. The road forgets you."'
      : '"The standards lie in the dust. There will be other roads."';
  return (
    <div className="screen bg-stone bg-vignette filigree-corners" data-screen-label="07 Run Summary">
      <div className="rs-root">
        <div className="rs-banner">
          <span className="rs-banner-rule" />
          <span className="rs-banner-title">{headerTitle}</span>
          <span className="rs-banner-rule" />
        </div>
        <div className={`rs-outcome ${isWin ? 'win' : isBankrupt ? 'bankrupt' : 'loss'}`}>{outcomeLabel}</div>
        <div className="rs-flavour">{flavour}</div>

        <div className="rs-summary">
          <div className="rs-summary-side">
            <window.FactionSigil faction={faction} size={64} />
            <div>
              <div className="rs-faction-name">{faction.name}</div>
              <div className="rs-leader-name">{run.leader?.name || ''}</div>
            </div>
            {(run.equipped || []).length > 0 && (
              <div className="rs-items">
                <div className="rs-items-label">Items Equipped</div>
                {run.equipped.map(it => (
                  <div className="rs-item-row" key={it.id}>
                    <span className="rs-item-glyph">{it.glyph}</span>
                    <span>{it.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rs-stats-grid">
            <div className="rs-stat"><div className="rsv">{run.wins || 0}</div><div className="rsl">Battles Won</div></div>
            <div className="rs-stat"><div className="rsv">{run.losses || 0}</div><div className="rsl">Battles Lost</div></div>
            <div className="rs-stat"><div className="rsv">{run.bosses || 0}</div><div className="rsl">Bosses Defeated</div></div>
            <div className="rs-stat"><div className="rsv">{run.elites || 0}</div><div className="rsl">Elites Defeated</div></div>
            <div className="rs-stat"><div className="rsv">{run.gold}</div><div className="rsl">Gold Carried</div></div>
            <div className="rs-stat"><div className="rsv">{run.rations ?? 0}</div><div className="rsl">Rations Left</div></div>
            <div className="rs-stat"><div className="rsv">{run.bought || 0}</div><div className="rsl">Cards Bought</div></div>
            <div className="rs-stat"><div className="rsv">{run.sold || 0}</div><div className="rsl">Cards Sold</div></div>
            <div className="rs-stat"><div className="rsv">{run.rests || 0}</div><div className="rsl">Rests Taken</div></div>
            <div className="rs-stat"><div className="rsv">{run.deck.length}</div><div className="rsl">Final Deck</div></div>
            <div className="rs-stat"><div className="rsv">{run.floorsReached || 1}</div><div className="rsl">Floors Climbed</div></div>
            <div className="rs-stat"><div className="rsv">{run.startRations ?? '\u2014'}</div><div className="rsl">Start Rations</div></div>
          </div>
        </div>

        {isWin && unlockedItem && (
          <div className="rs-unlock">
            <div className="rs-unlock-eyebrow">&mdash; Item Unlocked &mdash;</div>
            <div className="rs-unlock-card">
              <span className="rs-unlock-glyph">{unlockedItem.glyph}</span>
              <div>
                <div className="rs-unlock-name">{unlockedItem.name}</div>
                <div className="rs-unlock-desc">{unlockedItem.desc}</div>
              </div>
            </div>
          </div>
        )}

        <div className="rs-actions">
          <button className="gw-btn ghost" onClick={onReturnMenu}>&#8617; To Main Menu</button>
          <button className="gw-btn" onClick={onReturnMenu}>&#9876; Another Run</button>
        </div>
      </div>
    </div>
  );
}

// Quick Match handoff — navigates to index.html (the existing deck builder + game).
function QuickMatchHandoff({ onBack }) {
  return (
    <div className="screen bg-table bg-vignette" data-screen-label="03 Quick Match Handoff">
      <div className="topnav">
        <button className="back-btn" onClick={onBack} title="Back">&#9666;</button>
        <span className="crumb">Quick Match</span>
      </div>
      <div className="qm-root">
        <div className="qm-inner">
          <div className="qm-eyebrow">QUICK MATCH</div>
          <h1 className="qm-title">Loading Deck Selector&hellip;</h1>
          <p className="qm-flavour">
            "A quick contest. Steel sharpens steel."
          </p>
          <button className="gw-btn" onClick={() => { window.location.href = 'index.html'; }} style={{ marginTop: 32 }}>
            &#9876; Go to Deck Selector
          </button>
          <br />
          <button className="gw-btn ghost" onClick={onBack} style={{ marginTop: 14 }}>&#8617; Back to Main Menu</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RunSummary, QuickMatchHandoff });
