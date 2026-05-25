// ─── Shop screen ───

const { useState: useStateShop, useMemo: useMemoShop, useCallback: useCallbackShop } = React;

function priceFor(card) {
  if (card.type === 'special') return 2;
  if (card.hero) return 3;
  if (card.strength >= 8) return 3;
  if (card.strength >= 4) return 2;
  return 1;
}

function generateWares(factionId, seed, bonus) {
  seed = seed === undefined ? Math.random() : seed;
  bonus = bonus || 0;
  const pool = window.CARD_POOL[factionId] || [];
  const specials = window.SPECIALS_POOL;
  let s = Math.floor(seed * 7919) >>> 0;
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const count = 3 + Math.floor(rng() * 3) + bonus;
  const wares = [];
  for (let i = 0; i < count; i++) {
    const isSpecial = rng() < 0.18;
    if (isSpecial) {
      wares.push({
        id: 'w' + i,
        name: specials[Math.floor(rng() * specials.length)],
        strength: 0, hero: false, row: 'Special', type: 'special',
      });
    } else {
      const isHero = rng() < 0.16;
      const strength = isHero ? 5 + Math.floor(rng() * 11) : 1 + Math.floor(rng() * 10);
      wares.push({
        id: 'w' + i,
        name: pool[Math.floor(rng() * pool.length)],
        strength, hero: isHero,
        row: ['Close', 'Ranged', 'Siege', 'Agile'][Math.floor(rng() * 4)],
        type: 'unit',
      });
    }
  }
  return wares;
}

function CardRow({ card, action, actionLabel, actionDisabled, price, sellMode, onHover, onHoverOut }) {
  return (
    <div
      className={`ware ${card.hero ? 'is-hero' : ''} ${card.type === 'special' ? 'is-special' : ''} ${actionDisabled ? 'unaffordable' : ''}`}
      onMouseEnter={onHover ? () => onHover(card) : undefined}
      onMouseLeave={onHoverOut || undefined}
    >
      <div className="ware-strength">{card.type === 'special' ? '\u2726' : card.strength}</div>
      <div className="ware-info">
        <div className="ware-name">{card.name}{card.hero ? ' \u25c6' : ''}</div>
        <div className="ware-row">
          {card.row}{card.hero ? ' \u00b7 Hero' : card.type === 'special' ? ' \u00b7 Special' : ''}
        </div>
      </div>
      <div className="ware-price">
        <span className="coin" />
        {price}
      </div>
      <button
        className={`ware-action ${sellMode ? 'sell' : ''}`}
        onClick={actionDisabled ? null : action}
        disabled={actionDisabled}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function Shop({ run, onLeave, onTransact }) {
  const faction = window.FACTIONS.find(f => f.id === run.factionId);
  const items = run.equipped || [];
  const hasBlackMarket = items.some(i => i.id === 'black_market');
  const merchantDiscount = useMemoShop(() => {
    return items.some(i => i.id === 'travelling_merch') && Math.random() < 0.3;
  }, []);
  const [wares] = useStateShop(() => generateWares(run.factionId, run.shopSeed || Math.random(), hasBlackMarket ? 2 : 0));
  const [purchased, setPurchased] = useStateShop({});
  const [soldIds, setSoldIds] = useStateShop({});
  const [gold, setGold] = useStateShop(run.gold);
  const [localDeck, setLocalDeck] = useStateShop(run.deck);
  const [hoveredCard, setHoveredCard] = useStateShop(null);

  const handleHover = useCallbackShop((card) => setHoveredCard(card), []);
  const handleHoverOut = useCallbackShop(() => setHoveredCard(null), []);

  const adjustedPrice = (card) => {
    const base = priceFor(card);
    return merchantDiscount ? Math.max(1, base - 1) : base;
  };

  const buy = (w) => {
    const p = adjustedPrice(w);
    if (gold < p || purchased[w.id]) return;
    setGold(g => g - p);
    setPurchased(o => ({ ...o, [w.id]: true }));
    setLocalDeck(d => [...d, { ...w, id: 'b' + Math.random().toString(36).slice(2) }]);
    onTransact({ type: 'buy', card: w, price: p });
  };
  const sell = (card) => {
    if (soldIds[card.id]) return;
    const p = priceFor(card);
    setGold(g => g + p);
    setSoldIds(o => ({ ...o, [card.id]: true }));
    setLocalDeck(d => d.filter(c => c.id !== card.id));
    onTransact({ type: 'sell', card, price: p });
  };

  const merchantLine = window.MERCHANT_LINES[run.factionId] || '"Coin first, friend. Always coin first."';

  return (
    <div className="screen bg-table bg-vignette" data-screen-label="05 Shop">
      <div className="topnav">
        <button className="back-btn" onClick={() => onLeave({ gold, deck: localDeck })} title="Leave shop">&#9666;</button>
        <span className="crumb">Roguelite &middot; Merchant</span>
      </div>

      <div className="shop-root">
        <div className="shop-header">
          <div className="shop-card-viewer">
            {hoveredCard && window.CARD_IMAGE_MAP && window.CARD_IMAGE_MAP[hoveredCard.name]
              ? <img
                  className="shop-card-viewer-img"
                  src={window.CARD_IMAGE_MAP[hoveredCard.name]}
                  alt={hoveredCard.name}
                />
              : <div className="shop-card-viewer-empty" />
            }
          </div>
          <div>
            <div className="shop-title">The Merchant's Tent</div>
            <div className="shop-merchant" style={{ justifyContent: 'center', marginTop: 6 }}>
              {merchantLine}
            </div>
          </div>
          <div className="shop-merchant">
            <div className="shop-purse">
              <div className="purse-coin">G</div>
              <div>
                <div className="amt">{gold}</div>
                <div className="label">Gold</div>
              </div>
            </div>
          </div>
        </div>

        <div className="shop-body">
          <div className="shop-col">
            <div className="shop-col-header">
              <div>
                <div className="shop-col-title">Merchant's Wares</div>
                <div className="shop-col-sub">
                  {faction.name} requisition &middot; {wares.length} on offer
                  {hasBlackMarket && <span style={{color:'var(--gold)', marginLeft: 8}}>&middot; Black Market</span>}
                  {merchantDiscount && <span style={{color:'var(--rest)', marginLeft: 8}}>&middot; Travelling Merchant: &minus;1g</span>}
                </div>
              </div>
              <div className="shop-col-sub" style={{ color: 'var(--tan)' }}>1&ndash;3 gold</div>
            </div>
            <div className="wares-list">
              {wares.map(w => {
                const p = adjustedPrice(w);
                return (
                  <div key={w.id} className={purchased[w.id] ? 'purchased' : ''}>
                    <CardRow
                      card={w}
                      price={p}
                      action={() => buy(w)}
                      actionLabel={purchased[w.id] ? '\u2713 Sold' : 'Buy'}
                      actionDisabled={gold < p}
                      onHover={handleHover}
                      onHoverOut={handleHoverOut}
                    />
                  </div>
                );
              })}
              {wares.length === 0 && <div className="shop-empty">The stall is bare.</div>}
            </div>
          </div>

          <div className="shop-col">
            <div className="shop-col-header">
              <div>
                <div className="shop-col-title">Your Library</div>
                <div className="shop-col-sub">Sell from your run deck</div>
              </div>
              <div className="shop-col-sub" style={{ color: 'var(--tan)' }}>{localDeck.length} cards</div>
            </div>
            <div className="wares-list">
              {localDeck.map(c => (
                <div key={c.id} className={soldIds[c.id] ? 'purchased' : ''}>
                  <CardRow
                    card={c}
                    price={priceFor(c)}
                    action={() => sell(c)}
                    actionLabel={soldIds[c.id] ? '\u2713 Sold' : 'Sell'}
                    sellMode
                    onHover={handleHover}
                    onHoverOut={handleHoverOut}
                  />
                </div>
              ))}
              {localDeck.length === 0 && <div className="shop-empty">Your library is empty. A lean traveller, indeed.</div>}
            </div>
          </div>
        </div>

        <div className="shop-footer">
          <div className="shop-flavour">"The road is long. Coin shortens it, just so."</div>
          <button className="gw-btn" onClick={() => onLeave({ gold, deck: localDeck })}>
            &#10230; Leave the Tent
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Shop });
