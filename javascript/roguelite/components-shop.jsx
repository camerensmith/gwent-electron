// ─── Shop screen ───

const { useState: useStateShop, useMemo: useMemoShop } = React;

// Selling stops here so a battle never starts with too few cards to draw a hand.
const MIN_DECK = 10;

function Shop({ run, onLeave, onTransact }) {
  const RL = window.RL;
  const faction = window.FACTIONS.find(f => f.id === run.factionId);
  const items = run.equipped || [];
  const hasBlackMarket = RL.hasItem(items, 'black_market');
  const [merchantDiscount] = useStateShop(() => RL.hasItem(items, 'travelling_merch') && Math.random() < 0.3);
  const [wares] = useStateShop(() => RL.generateWares(run.factionId, run.shopSeed || Math.random(), hasBlackMarket ? 2 : 0));
  const [purchased, setPurchased] = useStateShop({});
  const [gold, setGold] = useStateShop(run.gold);
  const [localDeck, setLocalDeck] = useStateShop(run.deck);
  const [hovered, setHovered] = useStateShop(null);

  const sortedDeck = useMemoShop(() => RL.sortDeck(localDeck), [localDeck]);
  const marchNow = RL.marchCost(localDeck, items);

  const priceOf = (key) => {
    const base = RL.priceFor(key);
    return merchantDiscount ? Math.max(1, base - 1) : base;
  };
  const marchIfAdded = (key) => RL.marchCost([...localDeck, { key }], items);

  const buy = (w) => {
    const p = priceOf(w.key);
    if (gold < p || purchased[w.id]) return;
    window.rlSfx('menu_buy');
    setGold(g => g - p);
    setPurchased(o => ({ ...o, [w.id]: true }));
    setLocalDeck(d => [...d, RL.newEntry(w.key)]);
    onTransact({ type: 'buy' });
  };
  const canSell = localDeck.length > MIN_DECK;
  const sell = (entry) => {
    if (!canSell) return;
    window.rlSfx('menu_buy');
    setGold(g => g + RL.sellValue(entry.key));
    setLocalDeck(d => d.filter(c => c.uid !== entry.uid));
    if (hovered && hovered.uid === entry.uid) setHovered(null);
    onTransact({ type: 'sell' });
  };

  const merchantLine = window.MERCHANT_LINES[run.factionId] || '"Coin first, friend. Always coin first."';
  const leave = () => onLeave({ gold, deck: localDeck });

  return (
    <div className="screen bg-table bg-vignette" data-screen-label="05 Shop">
      <div className="topnav">
        <button className="back-btn" onClick={leave} title="Leave shop">&#9666;</button>
        <span className="crumb">Roguelite &middot; Merchant</span>
      </div>

      <div className="shop2-root">
        <div className="shop2-head">
          <div>
            <div className="shop-title">The Merchant's Tent</div>
            <div className="flavour shop2-line">{merchantLine}</div>
          </div>
          <div className="shop2-purse">
            <div className="shop-purse">
              <div className="purse-coin">G</div>
              <div>
                <div className="amt">{gold}</div>
                <div className="label">Gold</div>
              </div>
            </div>
            <div className="shop2-purse-note">
              Gold you spend here is gold you can't lose in battle.<br />
              Marching costs {marchNow} rations per step with this deck.
            </div>
          </div>
        </div>

        <div className="shop2-body">
          <div className="shop2-wares">
            <div className="shop-col-title">
              For sale &middot; {faction.name} and neutral cards
              {hasBlackMarket && <span className="shop2-tag">Black Market +2</span>}
              {merchantDiscount && <span className="shop2-tag good">Travelling Merchant: &minus;1 gold</span>}
            </div>
            <div className="shop2-ware-grid">
              {wares.map(w => {
                const p = priceOf(w.key);
                const sold = purchased[w.id];
                const afford = gold >= p;
                const newMarch = marchIfAdded(w.key);
                return (
                  <div key={w.id} className={`shop2-ware ${sold ? 'sold' : ''}`}>
                    <window.CardTile entry={{ key: w.key }} size="md" onHover={setHovered} dimmed={sold} />
                    <button
                      className={`gw-btn compact shop2-buy ${!afford && !sold ? 'unaffordable' : ''}`}
                      disabled={sold || !afford}
                      onClick={() => buy(w)}
                    >
                      {sold ? 'Bought' : <>Buy &middot; {p}g</>}
                    </button>
                    {!sold && newMarch > marchNow && <div className="shop2-warn">March cost {marchNow} &rarr; {newMarch}</div>}
                  </div>
                );
              })}
              {wares.length === 0 && <div className="shop-empty">The stall is bare.</div>}
            </div>
          </div>

          <div className="shop2-detail">
            <window.CardDetail entry={hovered} extra={{ items }} />
          </div>

          <div className="shop2-deck">
            <div className="shop-col-title">Your deck &middot; {localDeck.length} cards</div>
            {!canSell && <div className="shop2-warn">You need at least {MIN_DECK} cards. You can't sell any more.</div>}
            <div className="shop2-deck-list">
              {sortedDeck.map(e => {
                const info = RL.cardInfo(e.key);
                if (!info) return null;
                return (
                  <div
                    key={e.uid}
                    className={`deck-card-row ${info.hero ? 'is-hero' : ''} ${info.special ? 'is-special' : ''}`}
                    onMouseEnter={() => setHovered(e)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="dc-strength">{info.special ? '✦' : RL.entryStrength(e)}</div>
                    <div className="dc-name">{info.name}{e.bonus > 0 ? <span className="dc-bonus"> +{e.bonus}</span> : null}</div>
                    <button className="ware-action sell" disabled={!canSell} onClick={() => sell(e)}>Sell +{RL.sellValue(e.key)}g</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shop-footer">
          <div className="shop-flavour">"The road is long. Coin shortens it, just so."</div>
          <button className="gw-btn" onClick={leave}>&#10230; Leave the Tent</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Shop });
