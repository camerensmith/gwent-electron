// ─── Shared roguelite UI: card tiles, card detail, event modal, deck viewer, How to Play ───

const { useState: useStateC, useMemo: useMemoC } = React;

function sfx(name) { if (window.rlTocar) window.rlTocar(name); }

// A real card from card_dict, drawn with its artwork. `entry` is a run-deck entry
// ({ uid, key, bonus }) or anything with a `key`.
function CardTile({ entry, size = 'md', onClick, onHover, selected, dimmed, children }) {
  const info = window.RL.cardInfo(entry.key);
  if (!info) return null;
  const strength = window.RL.entryStrength(entry);
  return (
    <div
      className={`rl-card size-${size} ${info.hero ? 'is-hero' : ''} ${info.special ? 'is-special' : ''} ${selected ? 'selected' : ''} ${dimmed ? 'dimmed' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      onMouseEnter={onHover ? () => onHover(entry) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
    >
      <div className="rl-card-art" style={{ backgroundImage: `url('${info.image}')` }} />
      <div className="rl-card-badge">{info.special ? '✦' : strength}</div>
      {entry.bonus > 0 && !info.special && <div className="rl-card-bonus">+{entry.bonus}</div>}
      <div className="rl-card-name">{info.name}</div>
      {children}
    </div>
  );
}

// Text block explaining what a card does.
function CardDetail({ entry, extra }) {
  if (!entry) {
    return <div className="rl-card-detail empty">Hover a card to read it.</div>;
  }
  const info = window.RL.cardInfo(entry.key);
  if (!info) return null;
  const strength = window.RL.entryStrength(entry);
  return (
    <div className="rl-card-detail">
      <div className="rcd-art" style={{ backgroundImage: `url('${info.image}')` }} />
      <div className="rcd-body">
        <div className="rcd-name">{info.name}</div>
        <div className="rcd-meta">
          {info.special ? info.rowLabel : (
            <>
              <span className="rcd-str">{strength}</span> strength
              {entry.bonus > 0 && <span className="rcd-bonus"> (+{entry.bonus} drilled)</span>}
              {' · '}{info.rowLabel}
              {info.hero && <span className="rcd-hero"> · Hero (immune to weather and most effects)</span>}
            </>
          )}
        </div>
        {info.abilityText.map((a, i) => (
          <div className="rcd-ability" key={i}><strong>{a.name}.</strong> {a.desc}</div>
        ))}
        {!info.abilityText.length && !info.special && <div className="rcd-ability muted">No special ability.</div>}
        {!info.special && (
          <div className="rcd-upkeep">Upkeep: {window.RL.cardUpkeep(entry.key, extra && extra.items)} {info.hero ? '(heroes eat more)' : ''}</div>
        )}
        {info.quote && <div className="rcd-quote">"{info.quote}"</div>}
      </div>
    </div>
  );
}

// Modal used for every road event (cache, mystery, starvation, battle results).
// event = { tone: 'good'|'bad'|'neutral', eyebrow, title, line, deltas: [{ text, tone }], card, button }
function EventModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div className="rl-modal-backdrop">
      <div className={`rl-modal tone-${event.tone || 'neutral'}`}>
        {event.eyebrow && <div className="rl-modal-eyebrow">{event.eyebrow}</div>}
        <div className="rl-modal-title">{event.title}</div>
        {event.line && <div className="rl-modal-line">"{event.line}"</div>}
        {event.card && (
          <div className="rl-modal-card"><CardTile entry={event.card} size="md" /></div>
        )}
        {event.deltas && event.deltas.length > 0 && (
          <div className="rl-modal-deltas">
            {event.deltas.map((d, i) => (
              <div key={i} className={`rl-delta tone-${d.tone || 'neutral'}`}>{d.text}</div>
            ))}
          </div>
        )}
        {event.note && <div className="rl-modal-note">{event.note}</div>}
        <div className="rl-modal-actions">
          {(event.actions || [{ label: event.button || 'Continue' }]).map((a, i, all) => (
            <button
              key={i}
              className={`gw-btn ${a.ghost ? 'ghost' : ''}`}
              autoFocus={i === all.length - 1}
              onClick={() => { onClose(); if (a.onClick) a.onClick(); }}
            >{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Full-screen overlay listing the run deck.
function DeckViewer({ deck, items, onClose, title }) {
  const [hovered, setHovered] = useStateC(null);
  const sorted = useMemoC(() => window.RL.sortDeck(deck), [deck]);
  const stats = window.RL.deckStats(deck);
  return (
    <div className="rl-modal-backdrop" onClick={onClose}>
      <div className="rl-deck-viewer" onClick={e => e.stopPropagation()}>
        <div className="rdv-head">
          <div>
            <div className="rl-modal-eyebrow">{title || 'Your Deck'}</div>
            <div className="rdv-stats">
              {stats.cards} cards &middot; {stats.units} units &middot; {stats.heroes} heroes &middot; {stats.specials} specials &middot; {stats.strength} total strength
            </div>
            <div className="rdv-stats muted">
              Upkeep {window.RL.upkeep(deck, items)} &rarr; marching costs {window.RL.marchCost(deck, items)} rations per step
            </div>
          </div>
          <button className="gw-btn compact ghost" onClick={onClose}>Close</button>
        </div>
        <div className="rdv-body">
          <div className="rdv-grid">
            {sorted.map(e => <CardTile key={e.uid} entry={e} size="sm" onHover={setHovered} />)}
          </div>
          <div className="rdv-side"><CardDetail entry={hovered} extra={{ items }} /></div>
        </div>
      </div>
    </div>
  );
}

// The rules, in plain language. Numbers come from engine.js so they never drift.
function HowToPlay({ onClose }) {
  const RL = window.RL;
  const types = window.NODE_TYPES;
  return (
    <div className="rl-modal-backdrop" onClick={onClose}>
      <div className="rl-howto" onClick={e => e.stopPropagation()}>
        <div className="rl-modal-eyebrow">How a run works</div>
        <div className="rl-modal-title">Two acts. Two bosses. One deck.</div>

        <div className="rh-grid">
          <section>
            <h4>The goal</h4>
            <p>Climb the map from the bottom to the top. Each act ends with a boss. Beat the Act 2 boss to win the run.</p>
            <p>The deck you carry is the deck you fight with. Every card you buy, sell, drill or lose changes your next battle.</p>
          </section>
          <section>
            <h4>Gold is your life</h4>
            <p>Every battle has a <b>stake</b>. Win and you earn it; lose and you pay it. If you can't pay, the run ends.</p>
            <p>Losing to a <b>boss</b> always ends the run. You start with {RL.START_GOLD} gold. Spending gold at merchants makes your deck stronger, but leaves you less to lose.</p>
          </section>
          <section>
            <h4>Rations feed your army</h4>
            <p>Every step on the map costs rations. Each unit is 1 upkeep and each hero is 2. Specials are free. A step costs your upkeep &divide; {RL.UPKEEP_PER_STEP_DIVISOR}, rounded up.</p>
            <p>If you can't pay for a step, you <b>starve</b> and a random card deserts. Camps and some victories restore rations. You start with {RL.START_RATIONS}, and you can carry at most {RL.MAX_RATIONS}.</p>
          </section>
          <section>
            <h4>The road</h4>
            <div className="rh-nodes">
              {Object.entries(types).map(([k, t]) => (
                <div key={k} className="rh-node">
                  <span className={`legend-dot node-dot-${k}`}>{t.glyph}</span>
                  <div><b>{t.label}.</b> {t.explain}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="rh-foot">
          <span className="flavour">Click a glowing node to see exactly what it costs and pays, then March.</span>
          <button className="gw-btn" onClick={onClose} autoFocus>Got it</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CardTile, CardDetail, EventModal, DeckViewer, HowToPlay, rlSfx: sfx });
