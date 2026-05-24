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

function NodeTooltip({ node, assignment, position, hasMapEtcher }) {
  if (!node) return null;
  const t = window.NODE_TYPES[node.type];
  const left = Math.min(Math.max(position.x + 36, 8), 880);
  const top = Math.max(position.y - 100, 8);
  return (
    <div className="node-tooltip" style={{ left, top }}>
      <div className="tt-name">{t.label}</div>
      <div className="tt-flavour">"{t.flavour}"</div>
      <div className="tt-reward">{t.reward}</div>
      {assignment?.oppFaction && (
        <div className="tt-opp">
          <window.FactionSigil faction={assignment.oppFaction} size={26} />
          <div>
            <div className="tt-opp-name">{assignment.oppFaction.name}</div>
            <div className="tt-opp-leader">{assignment.oppLeader.name}</div>
          </div>
        </div>
      )}
      {assignment?.effects && assignment.effects.length > 0 && (
        <div className="tt-mod">
          {assignment.effects.map((eff, i) => (
            <div key={i} style={{ marginTop: i > 0 ? 8 : 0 }}>
              <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: 2 }}>{eff.name}</strong>
              <span>{eff.desc}</span>
            </div>
          ))}
        </div>
      )}
      {assignment?.mystery && hasMapEtcher && (
        <div className="tt-mod">
          <strong style={{ color: 'var(--mystery)', display: 'block', marginBottom: 4 }}>Map-Etched Vision</strong>
          <em>{assignment.mystery.line}</em>
        </div>
      )}
    </div>
  );
}

function RogueMap({ run, tweaks, onBack, onPickNode, onMainMenu }) {
  const faction = window.FACTIONS.find(f => f.id === run.factionId);
  const leader = run.leader;

  const map = useMemoMap(() => generateMap({
    floorsPerAct: 8, acts: 2, minWidth: 2, maxWidth: 4, seed: run.seed
  }), [run.seed]);

  const [nodeStates, setNodeStates] = useStateMap(() => {
    if (run.nodeStates) return run.nodeStates;
    const s = {};
    map.nodes.forEach(n => { s[n.id] = n.floor === 0 ? 'available' : 'locked'; });
    return s;
  });
  const [currentFloor, setCurrentFloor] = useStateMap(run.currentFloor ?? 0);

  const battleAssignments = useMemoMap(() => {
    let s = Math.floor(run.seed * 9301 + 1) >>> 0;
    const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const otherFactions = window.FACTIONS.filter(f => f.id !== run.factionId);
    const difficulty = run.difficulty || 'medium';
    const out = {};

    const pickFromGroups = (n) => {
      const groups = {};
      window.BOSS_EFFECTS.forEach(e => {
        if (!groups[e.group || e.id]) groups[e.group || e.id] = [];
        groups[e.group || e.id].push(e);
      });
      const groupKeys = Object.keys(groups);
      groupKeys.sort(() => rng() - 0.5);
      const picked = [];
      for (let i = 0; i < n && i < groupKeys.length; i++) {
        const g = groups[groupKeys[i]];
        picked.push(g[Math.floor(rng() * g.length)]);
      }
      return picked;
    };

    map.nodes.forEach(n => {
      if (n.type === 'battle' || n.type === 'elite' || n.type === 'boss') {
        const opp = otherFactions[Math.floor(rng() * otherFactions.length)];
        const ldr = opp.leaders[Math.floor(rng() * opp.leaders.length)];
        const assign = { oppFaction: opp, oppLeader: ldr, effects: [] };
        if (n.type === 'elite') {
          assign.effects = [window.ELITE_EFFECTS[difficulty] || window.ELITE_EFFECTS.medium];
        } else if (n.type === 'boss') {
          const count = n.act === 1 ? 3 : 2;
          assign.effects = pickFromGroups(count);
        }
        out[n.id] = assign;
      } else if (n.type === 'mystery') {
        out[n.id] = { mystery: window.MYSTERY_OUTCOMES[Math.floor(rng() * window.MYSTERY_OUTCOMES.length)] };
      }
    });
    return out;
  }, [map, run.seed, run.factionId, run.difficulty]);

  const MAP_WIDTH = 900;
  const FLOOR_GAP = 100;
  const { positions, totalHeight } = layoutMap({
    nodes: map.nodes, edges: map.edges, layers: map.layers,
    width: MAP_WIDTH, floorGap: FLOOR_GAP, topPad: 90, bottomPad: 90
  });

  const [hovered, setHovered] = useStateMap(null);
  const scrollRef = useRefMap(null);

  useEffectMap(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = totalHeight;
    }
  }, []);

  useEffectMap(() => {
    if (!scrollRef.current) return;
    const targetY = totalHeight - 90 - currentFloor * FLOOR_GAP;
    const halfH = scrollRef.current.clientHeight / 2;
    scrollRef.current.scrollTo({ top: Math.max(0, targetY - halfH), behavior: 'smooth' });
  }, [currentFloor]);

  const currentLayer = map.layers[currentFloor];
  const currentAct = currentLayer ? currentLayer.act : 0;

  const nextEncounter = useMemoMap(() => {
    const candidates = map.nodes.filter(n =>
      n.floor === currentFloor &&
      nodeStates[n.id] === 'available' &&
      battleAssignments[n.id] &&
      ['battle','elite','boss'].includes(n.type)
    );
    if (!candidates[0]) return null;
    return { node: candidates[0], ...battleAssignments[candidates[0].id] };
  }, [currentFloor, map.nodes, nodeStates, battleAssignments]);

  const handleNodeClick = (node) => {
    if (nodeStates[node.id] !== 'available') return;
    const nextNodeStates = { ...nodeStates };
    nextNodeStates[node.id] = 'visited';
    map.nodes.filter(n => n.floor === node.floor && n.id !== node.id).forEach(n => {
      nextNodeStates[n.id] = 'locked';
    });
    map.edges.filter(e => e.from === node.id).forEach(e => {
      nextNodeStates[e.to] = 'available';
    });
    const nextFloor = node.floor + 1;
    setNodeStates(nextNodeStates);
    setCurrentFloor(nextFloor);
    onPickNode(node, battleAssignments[node.id], { nodeStates: nextNodeStates, currentFloor: nextFloor });
  };

  const NODE_COLORS = {
    battle: '#d4ab48', elite: '#b66dff', shop: '#d7b34d',
    rest: '#6ea99a', cache: '#f0d27e', mystery: '#8a8aff', boss: '#ff6464'
  };
  const NODE_INK = {
    battle: '#1a1004', elite: '#18002a', shop: '#2a1a05',
    rest: '#052016', cache: '#2a1a05', mystery: '#060620', boss: '#2a0000'
  };

  return (
    <div className="screen" data-screen-label="04 Roguelite Map">
      <div className="map-root">
        <aside className="map-side">
          <div className="topnav" style={{ position: 'static', marginBottom: 4 }}>
            <button className="back-btn" onClick={onMainMenu} title="Abandon run">&#9666;</button>
            <span className="crumb">Run</span>
          </div>

          <div className="ms-header">
            <window.FactionSigil faction={faction} size={56} />
            <div>
              <div className="ms-faction-name">{faction.name}</div>
              <div className="ms-leader">{leader.name}</div>
            </div>
          </div>

          <div className="act-banner">
            <span className="ab-act">Act {currentAct + 1} / 2</span>
            <span className="ab-title">{window.ACT_BOSSES[currentAct].actName}</span>
          </div>

          <div className="purse">
            <div className="purse-coin">G</div>
            <div>
              <div className="purse-amt">{run.gold}</div>
              <div className="purse-label">Gold</div>
            </div>
          </div>

          <div className={`rations-bar ${run.rations < 0 ? 'starving' : run.rations <= 5 ? 'low' : ''}`}>
            <div className="rations-glyph">{run.rations < 0 ? '\u2620' : '\u25c8'}</div>
            <div style={{ flex: 1 }}>
              <div className="rations-row">
                <span className="rations-amt">{run.rations ?? 0}</span>
                <span className="rations-label">{run.rations < 0 ? 'Starving' : 'Rations'}</span>
              </div>
              <div className="rations-fill">
                <div className="rations-fill-inner" style={{
                  width: Math.max(0, Math.min(100, (run.rations || 0) / (run.maxRations || 40) * 100)) + '%'
                }} />
              </div>
            </div>
          </div>
          {run.rations < 0 ? (
            <div className="rations-warn starving">"The stores are bare. The saddlebags spill at every step."</div>
          ) : run.rations <= 5 ? (
            <div className="rations-warn">"The stores grow lean. Find a camp."</div>
          ) : null}

          {run.equipped && run.equipped.length > 0 && (
            <div>
              <div className="ms-section-title">Equipped</div>
              <div className="item-chips">
                {run.equipped.map(it => (
                  <div className="item-chip" key={it.id} title={it.name + ' \u2014 ' + it.desc}>
                    <span className="item-chip-glyph">{it.glyph}</span>
                    <span className="item-chip-name">{it.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="ms-section-title">Run Stats</div>
            <div className="ms-stat"><span className="lab">Floor</span><span className="val">{currentFloor + 1} / {map.layers.length}</span></div>
            <div className="ms-stat"><span className="lab">Battles Won</span><span className="val">{run.wins}</span></div>
            <div className="ms-stat"><span className="lab">Battles Lost</span><span className="val" style={{ color: (run.losses || 0) > 0 ? 'var(--danger)' : undefined }}>{run.losses || 0}</span></div>
            <div className="ms-stat"><span className="lab">Deck Size</span><span className="val">{run.deck.length}</span></div>
            <div className="ms-stat"><span className="lab">Cards Bought</span><span className="val">{run.bought || 0}</span></div>
            <div className="ms-stat"><span className="lab">Cards Sold</span><span className="val">{run.sold || 0}</span></div>
          </div>

          {nextEncounter && (
            <div>
              <div className="ms-section-title">Next Encounter</div>
              <div className="next-encounter">
                <div className="ne-opp">
                  <window.FactionSigil faction={nextEncounter.oppFaction} size={36} />
                  <div>
                    <div className="ne-opp-name">{nextEncounter.oppFaction.name} &middot; <em style={{color: nextEncounter.node.type==='boss'?'var(--boss)':nextEncounter.node.type==='elite'?'var(--elite)':'var(--gold)', fontStyle:'normal'}}>{nextEncounter.node.type === 'boss' ? 'BOSS' : nextEncounter.node.type === 'elite' ? 'ELITE' : 'Skirmish'}</em></div>
                    <div className="ne-opp-leader">{nextEncounter.oppLeader.name}</div>
                  </div>
                </div>
                {nextEncounter.effects && nextEncounter.effects.length > 0 ? (
                  <div className="ne-effects">
                    {nextEncounter.effects.map((eff, i) => (
                      <div className="ne-effect" key={i}>
                        <div className="ne-mod-name">{eff.name}</div>
                        <div className="ne-mod-desc">{eff.desc}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ne-no-effect">No special effects &mdash; a plain skirmish.</div>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="ms-section-title">Path Legend</div>
            <div className="legend-grid">
              {Object.entries(window.NODE_TYPES).map(([k, v]) => (
                <div key={k} className="legend-row">
                  <span className="legend-dot" style={{
                    background: NODE_COLORS[k],
                    color: NODE_INK[k],
                    borderColor: 'rgba(0,0,0,.4)',
                  }}>{v.glyph}</span>
                  {v.label}
                </div>
              ))}
            </div>
          </div>

          <button className="gw-btn compact ghost" onClick={onBack} style={{ marginTop: 'auto' }}>
            &#8617; Abandon Run
          </button>
        </aside>

        <div className={`map-stage ${tweaks.mapStyle === 'parchment' ? 'is-parchment' : ''}`}>
          <div className="map-topbar">
            <div className="floor-counter">
              <span className="fc-label">Act {currentAct + 1} &middot; Floor</span>
              <span className="fc-value">{(currentLayer?.floorInAct ?? 0) + 1} / 8</span>
            </div>
            {tweaks.modifierAlwaysVisible && nextEncounter && nextEncounter.effects && nextEncounter.effects.length > 0 && (
              <div className="modifier-pill">
                <span className="mp-sign">{nextEncounter.node.type === 'boss' ? '\u25c6' : '\u2718'}</span>
                <div>
                  <div className="mp-label">{nextEncounter.node.type === 'boss' ? 'Boss Effects' : 'Elite Buff'}</div>
                  <div className="mp-name">{nextEncounter.effects.map(e => e.name).join(' \u00b7 ')}</div>
                </div>
              </div>
            )}
          </div>

          <div className="map-scroll" ref={scrollRef}>
            <div style={{ position: 'relative', width: MAP_WIDTH, margin: '0 auto', height: totalHeight + 60 }}>
              <svg className="connectors" width={MAP_WIDTH} height={totalHeight + 60}>
                {map.edges.map((e, idx) => {
                  const a = positions[e.from], b = positions[e.to];
                  if (!a || !b) return null;
                  const fromNode = map.nodes.find(n => n.id === e.from);
                  const toNode = map.nodes.find(n => n.id === e.to);
                  const traversed = nodeStates[fromNode.id] === 'visited' && nodeStates[toNode.id] === 'visited';
                  const live = nodeStates[fromNode.id] === 'visited' && nodeStates[toNode.id] === 'available';
                  const stroke = traversed ? 'rgba(255,210,77,.85)' : live ? 'var(--gold)' : 'rgba(255,210,77,.18)';
                  return (
                    <path
                      key={idx}
                      d={curvePath(a, b)}
                      stroke={stroke}
                      strokeWidth={traversed || live ? 2 : 1.5}
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
                const layer = map.layers[n.floor];
                const isAct2Boss = n.type === 'boss' && layer.act === 1;
                return (
                  <div
                    key={n.id}
                    className="node"
                    data-type={n.type}
                    data-state={visualState}
                    style={{ left: p.x - 28, top: p.y - 28, color: NODE_COLORS[n.type] }}
                    onClick={() => handleNodeClick(n)}
                    onMouseEnter={() => setHovered({ node: n, x: p.x, y: p.y })}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="glyph">{window.NODE_TYPES[n.type].glyph}</span>
                    {n.type === 'boss' && (
                      <div className="label">{isAct2Boss ? 'Final Boss' : 'Act Boss'}</div>
                    )}
                  </div>
                );
              })}

              {map.layers.map((L, f) => {
                const y = totalHeight - 90 - f * FLOOR_GAP;
                const isActStart = L.floorInAct === 0;
                return (
                  <React.Fragment key={f}>
                    {isActStart && (
                      <div style={{
                        position: 'absolute', left: -120, top: y - 16,
                        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.22em',
                        color: 'var(--gold)', textTransform: 'uppercase', textAlign: 'right', width: 80,
                      }}>
                        Act {L.act + 1}
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      left: -36, top: y - 8,
                      fontFamily: 'Cinzel, serif',
                      color: f === currentFloor ? 'var(--gold)' : 'var(--tan-dim)',
                      fontSize: 11, letterSpacing: '0.16em',
                    }}>
                      {String(L.floorInAct + 1).padStart(2, '0')}
                    </div>
                  </React.Fragment>
                );
              })}

              {hovered && <NodeTooltip
                node={hovered.node}
                assignment={battleAssignments[hovered.node.id]}
                position={{ x: hovered.x, y: hovered.y - (scrollRef.current?.scrollTop || 0) }}
                hasMapEtcher={(run.equipped || []).some(i => i.id === 'map_etcher')}
              />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RogueMap });
