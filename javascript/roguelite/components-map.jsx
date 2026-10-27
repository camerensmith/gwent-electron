// ─── Roguelite Map ───

const { useState: useStateMap, useMemo: useMemoMap, useEffect: useEffectMap, useRef: useRefMap } = React;

function generateMap({ floorsPerAct = 8, acts = 2, minWidth = 2, maxWidth = 4, seed = Math.random() }) {
  let s = Math.floor(seed * 2_147_483_647) >>> 0;
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const ri = (n) => Math.floor(rng() * n);

  const layers = [];
  for (let a = 0; a < acts; a++) {
    for (let f = 0; f < floorsPerAct; f++) {
      let width;
      const isFirst = f === 0;
      const isLast = f === floorsPerAct - 1;
      const isPenultimate = f === floorsPerAct - 2;
      if (isFirst) width = 3;
      else if (isLast) width = 1;
      else if (isPenultimate) width = 1;
      else width = minWidth + ri(maxWidth - minWidth + 1);
      layers.push({ act: a, floorInAct: f, width, isFirst, isLast, isPenultimate });
    }
  }

  const types = window.NODE_TYPES;
  const typeKeys = Object.keys(types).filter(k => k !== 'boss');
  const weightedPick = (avoid = new Set()) => {
    const available = typeKeys.filter(k => !avoid.has(k));
    const total = available.reduce((s, k) => s + types[k].weight, 0);
    let r = rng() * total;
    for (const k of available) {
      r -= types[k].weight;
      if (r <= 0) return k;
    }
    return available[0];
  };

  const nodes = [];
  layers.forEach((L, idx) => {
    for (let i = 0; i < L.width; i++) {
      let type;
      if (L.isLast) type = 'boss';
      else if (L.isPenultimate) type = 'rest';
      else if (L.isFirst) type = 'battle';
      else if (L.floorInAct === Math.floor(L.width / 2) + 1) type = rng() < 0.4 ? 'elite' : (rng() < 0.5 ? 'shop' : 'battle');
      else type = weightedPick();
      nodes.push({
        id: `n${idx}-${i}`,
        floor: idx,
        act: L.act,
        floorInAct: L.floorInAct,
        slot: i,
        slotsInFloor: L.width,
        type,
        state: idx === 0 ? 'available' : 'locked',
      });
    }
  });

  const edges = [];
  for (let f = 0; f < layers.length - 1; f++) {
    const sameAct = layers[f].act === layers[f + 1].act;
    const cur = nodes.filter(n => n.floor === f);
    const next = nodes.filter(n => n.floor === f + 1);
    if (!sameAct) {
      const boss = cur[0];
      next.forEach(dst => edges.push({ from: boss.id, to: dst.id, transition: true }));
      continue;
    }
    cur.forEach((src, i) => {
      const choices = [];
      const srcRatio = (i + 0.5) / cur.length;
      next.forEach((dst, j) => {
        const dstRatio = (j + 0.5) / next.length;
        choices.push({ dst, dist: Math.abs(srcRatio - dstRatio) });
      });
      choices.sort((a, b) => a.dist - b.dist);
      const numConn = next.length === 1 ? 1 : (rng() < 0.5 ? 1 : 2);
      for (let k = 0; k < numConn && k < choices.length; k++) {
        edges.push({ from: src.id, to: choices[k].dst.id });
      }
    });
    next.forEach((dst) => {
      const hasIncoming = edges.some(e => e.to === dst.id && nodes.find(n => n.id === e.from).floor === f);
      if (!hasIncoming) {
        let best = cur[0], bestDist = Infinity;
        const dstRatio = (dst.slot + 0.5) / next.length;
        cur.forEach((src, i) => {
          const srcRatio = (i + 0.5) / cur.length;
          const d = Math.abs(srcRatio - dstRatio);
          if (d < bestDist) { bestDist = d; best = src; }
        });
        edges.push({ from: best.id, to: dst.id });
      }
    });
  }

  const seen = new Set();
  const dedupedEdges = edges.filter(e => {
    const k = e.from + '\u2192' + e.to;
    if (seen.has(k)) return false; seen.add(k); return true;
  });

  return { nodes, edges: dedupedEdges, layers };
}

function layoutMap({ nodes, edges, layers, width, floorGap = 130, topPad = 100, bottomPad = 100 }) {
  const positions = {};
  const totalHeight = topPad + bottomPad + floorGap * (layers.length - 1);
  nodes.forEach(n => {
    const w = n.slotsInFloor;
    const ratio = w === 1 ? 0.5 : (n.slot + 0.5) / w;
    const y = totalHeight - bottomPad - n.floor * floorGap;
    const jitter = ((parseInt(n.id.replace(/\D/g, ''), 10) || 0) % 7 - 3) * 6;
    const x = ratio * (width - 80) + 40 + jitter;
    positions[n.id] = { x, y };
  });
  return { positions, totalHeight };
}

function curvePath(a, b) {
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
}

// Opponents, effects, mystery outcomes and battle stakes for every node, fixed by the run seed
// so the map can show exactly what each step costs and pays before you commit to it.
function computeAssignments(map, run) {
  const rng = window.RL.makeRng((run.seed * 9301 + 0.5) % 1);
  const otherFactions = window.FACTIONS.filter(f => f.id !== run.factionId);
  const out = {};

  const pickFromGroups = (n) => {
    const groups = {};
    window.BOSS_EFFECTS.forEach(e => {
      const g = e.group || e.id;
      (groups[g] = groups[g] || []).push(e);
    });
    const groupKeys = window.RL.shuffle(Object.keys(groups), rng);
    return groupKeys.slice(0, n).map(g => groups[g][Math.floor(rng() * groups[g].length)]);
  };

  map.nodes.forEach(n => {
    if (n.type === 'battle' || n.type === 'elite' || n.type === 'boss') {
      const opp = otherFactions[Math.floor(rng() * otherFactions.length)];
      const ldr = opp.leaders[Math.floor(rng() * opp.leaders.length)];
      const assign = { oppFaction: opp, oppLeader: ldr, effects: [], reward: window.RL.rollReward(n.type, n.act, rng) };
      if (n.type === 'elite') {
        const vet = n.act >= 1 ? 2 : 1;
        assign.effects = [{ ...window.ELITE_EFFECT, desc: `Every enemy unit enters play with +${vet} strength.` }];
      } else if (n.type === 'boss') {
        assign.effects = pickFromGroups(n.act === 1 ? 3 : 2);
      }
      out[n.id] = assign;
    } else if (n.type === 'mystery') {
      out[n.id] = { mystery: window.MYSTERY_OUTCOMES[Math.floor(rng() * window.MYSTERY_OUTCOMES.length)] };
    }
  });
  return out;
}

// Gold a battle pays (King's Bounty adds 1).
function battleGold(assignment, items) {
  return assignment.reward.gold + (window.RL.hasItem(items, 'kings_bounty') ? 1 : 0);
}

const NODE_COLORS = {
  battle: '#d4ab48', elite: '#b66dff', shop: '#d7b34d',
  rest: '#6ea99a', cache: '#f0d27e', mystery: '#8a8aff', boss: '#ff6464'
};
const NODE_INK = {
  battle: '#1a1004', elite: '#18002a', shop: '#2a1a05',
  rest: '#052016', cache: '#2a1a05', mystery: '#060620', boss: '#2a0000'
};

function NodeTooltip({ node, position }) {
  if (!node) return null;
  const t = window.NODE_TYPES[node.type];
  const left = Math.min(Math.max(position.x + 36, 8), 640);
  const top = Math.max(position.y - 40, 8);
  return (
    <div className="node-tooltip" style={{ left, top }}>
      <div className="tt-name">{t.label}</div>
      <div className="tt-reward">{t.explain}</div>
    </div>
  );
}

// The panel that answers "what happens if I go there?" before you commit.
function RouteDetail({ node, assignment, run, marchCost, onMarch, onCancel }) {
  if (!node) {
    return (
      <div className="route-panel empty">
        <div className="rp-eyebrow">Your next step</div>
        <div className="rp-empty-text">Click a glowing node to see what it costs and what it pays.</div>
      </div>
    );
  }
  const t = window.NODE_TYPES[node.type];
  const items = run.equipped || [];
  const isFight = ['battle', 'elite', 'boss'].includes(node.type);
  const starving = run.rations < marchCost;
  const hasEtcher = window.RL.hasItem(items, 'map_etcher');
  const isFinal = node.type === 'boss' && node.act === 1;

  let body = null;
  if (isFight && assignment) {
    const gold = battleGold(assignment, items);
    const rations = assignment.reward.rations;
    const cantCover = node.type !== 'boss' && run.gold < gold;
    const tier = window.RL.enemyTier(node.type, node.act);
    body = (
      <>
        <div className="rp-opp">
          <window.FactionSigil faction={assignment.oppFaction} size={44} />
          <div>
            <div className="rp-opp-name">{assignment.oppFaction.name}</div>
            <div className="rp-opp-leader">{assignment.oppLeader.name}</div>
          </div>
        </div>
        <div className="rp-line muted">They field {tier.label}.</div>
        <div className="rp-stakes">
          <div className="rp-stake win">
            <div className="rp-stake-label">If you win</div>
            <div className="rp-stake-value">+{gold} gold{rations ? ` · +${rations} rations` : ''}</div>
            {isFinal && <div className="rp-stake-sub">and the run is won</div>}
          </div>
          <div className="rp-stake lose">
            <div className="rp-stake-label">If you lose</div>
            <div className="rp-stake-value">{node.type === 'boss' ? 'The run ends' : `−${gold} gold`}</div>
            {cantCover && <div className="rp-stake-sub">You only have {run.gold}, so a loss ends the run</div>}
          </div>
        </div>
        {assignment.effects.length > 0 && (
          <div className="rp-effects">
            <div className="rp-eyebrow">{node.type === 'boss' ? 'Boss rules' : 'Elite rule'}</div>
            {assignment.effects.map((e, i) => (
              <div key={i} className="rp-effect"><strong>{e.name}.</strong> {e.desc}</div>
            ))}
          </div>
        )}
      </>
    );
  } else if (node.type === 'shop') {
    body = <div className="rp-line">Buy real cards for your deck or sell cards for gold. You have <b>{run.gold}</b> gold.</div>;
  } else if (node.type === 'rest') {
    const gain = window.RL.CAMP_RATIONS + (window.RL.hasItem(items, 'foragers_eye') ? 10 : 0);
    body = <div className="rp-line">Choose one: <b>rest</b> for +{gain} rations, or <b>drill</b> a unit for +1 strength for the rest of the run.</div>;
  } else if (node.type === 'cache') {
    body = <div className="rp-line">A buried strongbox: <b>+2 gold</b>.</div>;
  } else if (node.type === 'mystery') {
    body = hasEtcher && assignment && assignment.mystery
      ? <div className="rp-line"><em>Map-etched:</em> "{assignment.mystery.line}"</div>
      : <div className="rp-line">Anything could be waiting: gold, food, a recruit, a blessing, or an ambush.</div>;
  }

  return (
    <div className={`route-panel type-${node.type}`}>
      <div className="rp-head">
        <span className="legend-dot" style={{ background: NODE_COLORS[node.type], color: NODE_INK[node.type] }}>{t.glyph}</span>
        <div>
          <div className="rp-title">{isFinal ? 'Final Boss' : t.label}</div>
          <div className="rp-flavour">"{t.flavour}"</div>
        </div>
      </div>
      {body}
      <div className={`rp-march ${starving ? 'starving' : ''}`}>
        {starving
          ? <>Marching costs {marchCost} rations and you have {run.rations}. <b>You will starve and a random card will desert.</b></>
          : <>Marching here costs <b>{marchCost}</b> rations ({run.rations} &rarr; {run.rations - marchCost}).</>}
      </div>
      <div className="rp-actions">
        <button className="gw-btn compact ghost" onClick={onCancel}>Back</button>
        <button className="gw-btn compact" onClick={onMarch}>March &#9656;</button>
      </div>
    </div>
  );
}

function RogueMap({ run, tweaks, onAbandon, onExit, onPickNode, onShowDeck, onShowHelp }) {
  const faction = window.FACTIONS.find(f => f.id === run.factionId);
  const leader = run.leader;
  const items = run.equipped || [];

  const map = useMemoMap(() => generateMap({
    floorsPerAct: 8, acts: 2, minWidth: 2, maxWidth: 4, seed: run.seed
  }), [run.seed]);

  const nodeStates = useMemoMap(() => {
    if (run.nodeStates) return run.nodeStates;
    const s = {};
    map.nodes.forEach(n => { s[n.id] = n.floor === 0 ? 'available' : 'locked'; });
    return s;
  }, [run.nodeStates, map]);
  const currentFloor = run.currentFloor ?? 0;

  const assignments = useMemoMap(() => computeAssignments(map, run), [map, run.seed, run.factionId]);

  const MAP_WIDTH = 900;
  const FLOOR_GAP = 100;
  const { positions, totalHeight } = layoutMap({
    nodes: map.nodes, edges: map.edges, layers: map.layers,
    width: MAP_WIDTH, floorGap: FLOOR_GAP, topPad: 90, bottomPad: 90
  });

  const [hovered, setHovered] = useStateMap(null);
  const [selectedId, setSelectedId] = useStateMap(null);
  const scrollRef = useRefMap(null);

  useEffectMap(() => {
    if (!scrollRef.current) return;
    const targetY = totalHeight - 90 - currentFloor * FLOOR_GAP;
    const halfH = scrollRef.current.clientHeight / 2;
    scrollRef.current.scrollTop = Math.max(0, targetY - halfH);
  }, [currentFloor]);

  const currentLayer = map.layers[Math.min(currentFloor, map.layers.length - 1)];
  const currentAct = currentLayer ? currentLayer.act : 0;
  const selected = selectedId ? map.nodes.find(n => n.id === selectedId) : null;

  const marchCost = window.RL.marchCost(run.deck, items);
  const stepsOfFood = Math.floor(Math.max(0, run.rations) / marchCost);
  const stats = window.RL.deckStats(run.deck);

  const handleNodeClick = (node) => {
    if (nodeStates[node.id] !== 'available') return;
    window.rlSfx('card');
    setSelectedId(node.id);
  };

  const march = () => {
    const node = selected;
    if (!node || nodeStates[node.id] !== 'available') return;
    const nextNodeStates = { ...nodeStates };
    nextNodeStates[node.id] = 'visited';
    map.nodes.filter(n => n.floor === node.floor && n.id !== node.id).forEach(n => {
      nextNodeStates[n.id] = 'locked';
    });
    map.edges.filter(e => e.from === node.id).forEach(e => {
      nextNodeStates[e.to] = 'available';
    });
    setSelectedId(null);
    window.rlSfx('menu_buy');
    onPickNode(node, assignments[node.id], { nodeStates: nextNodeStates, currentFloor: node.floor + 1 });
  };

  return (
    <div className="screen" data-screen-label="04 Roguelite Map">
      <div className="map-root">
        <aside className="map-side">
          <div className="ms-header">
            <window.FactionSigil faction={faction} size={56} />
            <div>
              <div className="ms-faction-name">{faction.name}</div>
              <div className="ms-leader">{leader.name}</div>
            </div>
          </div>

          <div className="act-banner">
            <span className="ab-act">Act {currentAct + 1} / 2 &middot; Floor {(currentLayer?.floorInAct ?? 0) + 1} / 8</span>
            <span className="ab-title">{window.ACT_BOSSES[currentAct].actName}</span>
          </div>

          <div className="res-card gold">
            <div className="purse-coin">G</div>
            <div className="res-main">
              <div className="res-amt">{run.gold}</div>
              <div className="res-label">Gold</div>
            </div>
            <div className="res-help">Your purse is your life. Lose a battle and you pay its stake. If you can't pay, the run ends.</div>
          </div>

          <div className={`res-card rations ${run.rations < marchCost ? 'starving' : stepsOfFood <= 3 ? 'low' : ''}`}>
            <div className="rations-glyph">{run.rations < marchCost ? '☠' : '◈'}</div>
            <div className="res-main">
              <div className="res-amt">{run.rations}<span className="res-max"> / {run.maxRations}</span></div>
              <div className="res-label">Rations</div>
            </div>
            <div className="rations-fill">
              <div className="rations-fill-inner" style={{ width: Math.max(0, Math.min(100, run.rations / run.maxRations * 100)) + '%' }} />
            </div>
            <div className="res-help">
              Each step costs <b>{marchCost}</b>, which is enough food for <b>{stepsOfFood}</b> more step{stepsOfFood === 1 ? '' : 's'}.
              {run.rations < marchCost && ' You are starving: every step costs a card.'}
            </div>
          </div>

          <div className="res-card deck" onClick={onShowDeck}>
            <div className="res-main">
              <div className="res-amt">{stats.cards}</div>
              <div className="res-label">Cards in deck</div>
            </div>
            <div className="res-help">{stats.units} units &middot; {stats.heroes} heroes &middot; {stats.specials} specials &middot; upkeep {window.RL.upkeep(run.deck, items)}</div>
            <button className="gw-btn compact ghost res-btn">View Deck</button>
          </div>

          {run.nextEncounterBuff && (
            <div className="boon-chip">
              <span className="boon-glyph">&#10022;</span>
              {(window.MYSTERY_OUTCOMES.find(o => o.buff === run.nextEncounterBuff) || {}).effect}
            </div>
          )}

          {items.length > 0 && (
            <div>
              <div className="ms-section-title">Provisions</div>
              <div className="item-chips">
                {items.map(it => (
                  <div className="item-chip" key={it.id} title={it.desc}>
                    <span className="item-chip-glyph">{it.glyph}</span>
                    <span className="item-chip-name">{it.name}</span>
                    <span className="item-chip-desc">{it.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ms-record">
            <span>Won <b>{run.wins || 0}</b></span>
            <span>Lost <b>{run.losses || 0}</b></span>
          </div>

          <div className="ms-foot">
            <button className="gw-btn compact ghost" onClick={onShowHelp}>? How to Play</button>
            <button className="gw-btn compact ghost" onClick={onExit} title="Your run is saved. Continue it from the main menu.">Save &amp; Exit</button>
            <button className="gw-btn compact ghost danger" onClick={onAbandon}>Abandon</button>
          </div>
        </aside>

        <div className={`map-stage ${tweaks.mapStyle === 'parchment' ? 'is-parchment' : ''}`}>
          <div className="map-legend">
            {Object.entries(window.NODE_TYPES).map(([k, v]) => (
              <div key={k} className="legend-row">
                <span className="legend-dot" style={{ background: NODE_COLORS[k], color: NODE_INK[k] }}>{v.glyph}</span>
                {v.label}
              </div>
            ))}
          </div>

          <div className="map-scroll" ref={scrollRef}>
            <div style={{ position: 'relative', width: MAP_WIDTH, margin: '0 auto', height: totalHeight + 60 }}>
              <svg className="connectors" width={MAP_WIDTH} height={totalHeight + 60}>
                {map.edges.map((e, idx) => {
                  const a = positions[e.from], b = positions[e.to];
                  if (!a || !b) return null;
                  const traversed = nodeStates[e.from] === 'visited' && nodeStates[e.to] === 'visited';
                  const live = nodeStates[e.from] === 'visited' && nodeStates[e.to] === 'available';
                  const stroke = traversed ? 'rgba(255,210,77,.85)' : live ? 'var(--gold)' : 'rgba(255,210,77,.18)';
                  return (
                    <path
                      key={idx}
                      d={curvePath(a, b)}
                      stroke={stroke}
                      strokeWidth={traversed || live ? 2.5 : 1.5}
                      fill="none"
                      strokeDasharray={live ? '6 6' : traversed ? '0' : '4 8'}
                    />
                  );
                })}
              </svg>

              {map.nodes.map(n => {
                const p = positions[n.id];
                const state = nodeStates[n.id];
                const isCurrent = n.floor === currentFloor - 1 && state === 'visited';
                const visualState = isCurrent ? 'current' : state;
                const isFinalBoss = n.type === 'boss' && n.act === 1;
                return (
                  <div
                    key={n.id}
                    className={`node ${selectedId === n.id ? 'selected' : ''}`}
                    data-type={n.type}
                    data-state={visualState}
                    style={{ left: p.x - 28, top: p.y - 28, color: NODE_COLORS[n.type] }}
                    onClick={() => handleNodeClick(n)}
                    onMouseEnter={() => setHovered({ node: n, x: p.x, y: p.y })}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="glyph">{window.NODE_TYPES[n.type].glyph}</span>
                    {n.type === 'boss' && (
                      <div className="label">{isFinalBoss ? 'Final Boss' : 'Act Boss'}</div>
                    )}
                  </div>
                );
              })}

              {map.layers.map((L, f) => {
                const y = totalHeight - 90 - f * FLOOR_GAP;
                return (
                  <React.Fragment key={f}>
                    {L.floorInAct === 0 && (
                      <div className="floor-act-label" style={{ top: y - 16 }}>Act {L.act + 1}</div>
                    )}
                    <div className={`floor-num ${f === currentFloor ? 'current' : ''}`} style={{ top: y - 8 }}>
                      {String(L.floorInAct + 1).padStart(2, '0')}
                    </div>
                  </React.Fragment>
                );
              })}

              {hovered && hovered.node.id !== selectedId && <NodeTooltip
                node={hovered.node}
                position={{ x: hovered.x, y: hovered.y }}
              />}
            </div>
          </div>

          <RouteDetail
            node={selected}
            assignment={selected ? assignments[selected.id] : null}
            run={run}
            marchCost={marchCost}
            onMarch={march}
            onCancel={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RogueMap, generateMap, computeAssignments, battleGold });
