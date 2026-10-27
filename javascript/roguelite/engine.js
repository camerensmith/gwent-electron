// ─── Roguelite rules engine ───
// Plain JS (no React) shared by roguelite.html (setup, map, shop, camp) and index.html
// (the battle bridge in gwent.js). Every card in a run is a real card_dict key, so the
// deck you build on the road is the deck you fight with.
// Depends on: cards.js (card_dict), decks.js (premade_deck), abilities.js (ability_dict, optional).

(function () {
  'use strict';

  var RL = {};

  // ── Economy constants (single source of truth; the How-to-Play panel reads these) ──
  RL.START_GOLD = 3;
  RL.START_RATIONS = 60;
  RL.MAX_RATIONS = 100;
  RL.CAMP_RATIONS = 30;
  RL.UPKEEP_PER_STEP_DIVISOR = 4; // march cost = ceil(upkeep / 4)
  RL.STARTING_UNITS = 16;
  RL.STARTING_SPECIALS = 4;
  RL.WARES_PER_SHOP = 6;

  // ── Seeded RNG (LCG) — used so map assignments and shop stock are stable per seed ──
  RL.makeRng = function (seed) {
    var s = (Math.floor((seed || Math.random()) * 2147483647) >>> 0) || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  };
  function pick(arr, rng) { return arr[Math.floor((rng || Math.random)() * arr.length)]; }
  function shuffle(arr, rng) {
    var a = arr.slice();
    rng = rng || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  RL.shuffle = shuffle;
  RL.pick = pick;

  function dict() { return window.card_dict || {}; }

  // ── Card info ──
  var ROW_LABELS = {
    close: 'Close Combat', ranged: 'Ranged', siege: 'Siege', agile: 'Agile (Close or Ranged)',
    any: 'Any row', melee_siege: 'Close or Siege', ranged_siege: 'Ranged or Siege'
  };

  function imagePath(deckTag, filename) {
    var name = deckTag + '_' + filename;
    if (deckTag === 'special' && filename.indexOf('realms_') === 0) name = filename;
    var ext = 'jpg';
    if (['realms_horn', 'realms_purge', 'realms_decree'].indexOf(name) !== -1 || name.indexOf('special_realms_') === 0) ext = 'png';
    if (name.toLowerCase().indexOf('realms_') === 0 && name !== name.toLowerCase()) name = name.toLowerCase();
    return 'images/sm/' + name + '.' + ext;
  }

  var infoCache = {};
  RL.cardInfo = function (key) {
    if (infoCache[key]) return infoCache[key];
    var c = dict()[key];
    if (!c) return null;
    var deckTag = String(c.deck || '').split(' ')[0];
    var abilities = c.ability ? c.ability.split(' ').filter(Boolean) : [];
    var hero = abilities[0] === 'hero';
    if (hero) abilities = abilities.slice(1);
    var special = deckTag === 'special' || deckTag === 'weather';
    var abilityDict = window.ability_dict || {};
    var abilityText = abilities
      .map(function (a) { return abilityDict[a] ? { name: abilityDict[a].name, desc: String(abilityDict[a].description || '').trim() } : null; })
      .filter(Boolean);
    var info = {
      key: key,
      name: c.name,
      strength: special ? 0 : (Number(c.strength) || 0),
      row: c.row || '',
      rowLabel: special ? (deckTag === 'weather' ? 'Weather' : 'Special') : (ROW_LABELS[c.row] || c.row),
      hero: hero,
      special: special,
      faction: deckTag,
      abilities: abilities,
      abilityText: abilityText,
      image: imagePath(deckTag, c.filename),
      quote: c.quote || '',
      maxCopies: Math.max(1, parseInt(c.count || '1', 10) || 1)
    };
    infoCache[key] = info;
    return info;
  };

  // A run deck entry is { uid, key, bonus }. bonus = permanent strength from camp drills.
  var uidCounter = 0;
  RL.newEntry = function (key, bonus) {
    uidCounter++;
    return { uid: 'c' + Date.now().toString(36) + uidCounter + Math.random().toString(36).slice(2, 6), key: key, bonus: bonus || 0 };
  };

  RL.entryStrength = function (entry) {
    var info = RL.cardInfo(entry.key);
    return info ? info.strength + (info.special ? 0 : (entry.bonus || 0)) : 0;
  };

  RL.sortDeck = function (deck) {
    return deck.slice().sort(function (a, b) {
      var ia = RL.cardInfo(a.key) || {}, ib = RL.cardInfo(b.key) || {};
      if (!!ia.special !== !!ib.special) return ia.special ? 1 : -1;
      if (!!ia.hero !== !!ib.hero) return ia.hero ? -1 : 1;
      var d = RL.entryStrength(b) - RL.entryStrength(a);
      if (d) return d;
      return String(ia.name).localeCompare(String(ib.name));
    });
  };

  RL.deckStats = function (deck) {
    var s = { cards: deck.length, units: 0, heroes: 0, specials: 0, strength: 0 };
    deck.forEach(function (e) {
      var info = RL.cardInfo(e.key);
      if (!info) return;
      if (info.special) { s.specials++; return; }
      s.units++;
      if (info.hero) s.heroes++;
      s.strength += RL.entryStrength(e);
    });
    return s;
  };

  // ── Upkeep & marching ──
  // Every unit eats 1 ration of upkeep, heroes eat 2 (1 with Hardtack); specials are free.
  // Each step on the map costs ceil(upkeep / 4) rations: a bigger army is a hungrier army.
  function hasItem(items, id) { return (items || []).some(function (i) { return i.id === id; }); }
  RL.hasItem = hasItem;

  RL.cardUpkeep = function (key, items) {
    var info = RL.cardInfo(key);
    if (!info || info.special) return 0;
    if (info.hero) return hasItem(items, 'hardtack') ? 1 : 2;
    return 1;
  };
  RL.upkeep = function (deck, items) {
    return deck.reduce(function (sum, e) { return sum + RL.cardUpkeep(e.key, items); }, 0);
  };
  RL.marchCost = function (deck, items) {
    var cost = Math.ceil(RL.upkeep(deck, items) / RL.UPKEEP_PER_STEP_DIVISOR);
    if (hasItem(items, 'lean_provision')) cost -= 1;
    return Math.max(1, cost);
  };

  // ── Deck building ──
  RL.premadesFor = function (factionId) {
    return (window.premade_deck || []).filter(function (d) { return d.faction === factionId && Array.isArray(d.cards); });
  };

  function expandPremade(premade) {
    var keys = [];
    premade.cards.forEach(function (c) {
      var key = Array.isArray(c) ? c[0] : c.index;
      var n = Array.isArray(c) ? c[1] : c.count;
      if (!dict()[key]) return;
      for (var i = 0; i < (parseInt(n, 10) || 1); i++) keys.push(key);
    });
    return keys;
  }

  function isSpecialDeck(deck) { return deck.indexOf('special') === 0 || deck.indexOf('weather') === 0; }

  // All units a faction can field (its own + neutral) and every non-unit card it may use.
  RL.factionPool = function (factionId) {
    var units = [], specials = [];
    var d = dict();
    Object.keys(d).forEach(function (k) {
      var c = d[k];
      if (!c || c.row === 'leader' || !c.deck) return;
      if (isSpecialDeck(c.deck)) {
        var tags = c.deck.split(' ');
        if (tags.length === 1 || tags.indexOf(factionId) !== -1) specials.push(k);
      } else if (c.deck === factionId || c.deck === 'neutral') {
        units.push(k);
      }
    });
    return { units: units, specials: specials };
  };

  // For factions with no premade deck: a random but legal faction deck.
  function generatedDeck(factionId, rng) {
    var pool = RL.factionPool(factionId);
    var keys = [];
    shuffle(pool.units, rng).forEach(function (k) {
      if (keys.length >= 26) return;
      var info = RL.cardInfo(k);
      var n = Math.min(info.maxCopies, 1 + Math.floor(rng() * Math.min(info.maxCopies, 3)));
      for (var i = 0; i < n && keys.length < 26; i++) keys.push(k);
    });
    shuffle(pool.specials.filter(function (k) { return dict()[k].deck.indexOf(' ') !== -1; }), rng).slice(0, 3)
      .concat(shuffle(pool.specials.filter(function (k) { return dict()[k].deck.indexOf(' ') === -1; }), rng).slice(0, 4))
      .forEach(function (k) { keys.push(k); });
    return keys;
  }

  // Base deck for a faction. `variant` picks between premades (setup "reroll").
  // Several premades reference cards that no longer exist; those are topped up with random
  // faction units so every base deck has at least MIN_BASE_UNITS real units.
  var MIN_BASE_UNITS = 22;
  RL.baseDeck = function (factionId, variant, rng) {
    rng = rng || RL.makeRng(((variant || 0) + 1) * 0.1234567);
    var premades = RL.premadesFor(factionId);
    if (!premades.length) return generatedDeck(factionId, rng);
    var keys = expandPremade(premades[Math.abs(variant || 0) % premades.length]);
    var unitCount = function () { return keys.filter(function (k) { return !RL.cardInfo(k).special; }).length; };
    if (unitCount() < MIN_BASE_UNITS) {
      var extra = generatedDeck(factionId, rng).filter(function (k) { return !RL.cardInfo(k).special; });
      for (var i = 0; i < extra.length && unitCount() < MIN_BASE_UNITS; i++) {
        var copies = keys.filter(function (k) { return k === extra[i]; }).length;
        if (copies < RL.cardInfo(extra[i]).maxCopies) keys.push(extra[i]);
      }
    }
    return keys;
  };

  RL.variantCount = function (factionId) {
    var n = RL.premadesFor(factionId).length;
    return n || 5;
  };

  // Faction-critical non-unit cards (e.g. Syndicate's Murder/Vivaldi Bank) by display name.
  function requiredSpecialKeys(factionId, rng) {
    var names;
    if (factionId === 'witchers') names = shuffle(window.WITCHER_SIGNS || [], rng).slice(0, 4);
    else names = (window.FACTION_REQUIRED_SPECIALS || {})[factionId] || [];
    var d = dict();
    return names.map(function (name) {
      return Object.keys(d).find(function (k) {
        var c = d[k];
        if (!c || c.name !== name || !isSpecialDeck(c.deck)) return false;
        var tags = c.deck.split(' ');
        return tags.length === 1 || tags.indexOf(factionId) !== -1;
      });
    }).filter(Boolean);
  }

  // Shape a list of keys: optionally strip heroes, keep at most `maxUnits` units (the
  // strongest are cut first) and `maxSpecials` non-unit cards.
  function shape(keys, opts, rng) {
    var units = [], specials = [];
    keys.forEach(function (k) {
      var info = RL.cardInfo(k);
      if (!info) return;
      if (info.special) specials.push(k);
      else if (opts.heroes || !info.hero) units.push(k);
    });
    if (units.length > opts.maxUnits) {
      units = shuffle(units, rng).sort(function (a, b) { return RL.cardInfo(a).strength - RL.cardInfo(b).strength; }).slice(0, opts.maxUnits);
    }
    var required = opts.required || [];
    specials = required.concat(shuffle(specials.filter(function (k) { return required.indexOf(k) === -1; }), rng))
      .slice(0, Math.max(opts.maxSpecials, required.length));
    return units.concat(specials);
  }

  // The deck a new run starts with: the faction's deck minus its heroes and best units.
  RL.startingDeck = function (factionId, variant) {
    var rng = RL.makeRng(((variant || 0) + 1) * 0.7654321);
    var keys = shape(RL.baseDeck(factionId, variant, rng), {
      heroes: false, maxUnits: RL.STARTING_UNITS, maxSpecials: RL.STARTING_SPECIALS,
      required: requiredSpecialKeys(factionId, rng)
    }, rng);
    return RL.sortDeck(keys.map(function (k) { return RL.newEntry(k); }));
  };

  // Opponent strength scales with the act and the node type.
  RL.ENEMY_TIERS = {
    'battle-0': { heroes: false, maxUnits: 15, maxSpecials: 3, label: 'a stripped-down deck (no heroes)' },
    'elite-0':  { heroes: false, maxUnits: 22, maxSpecials: 4, label: 'a full deck without heroes' },
    'boss-0':   { heroes: true,  maxUnits: 99, maxSpecials: 99, label: 'their complete deck, heroes included' },
    'battle-1': { heroes: false, maxUnits: 99, maxSpecials: 5, label: 'a full deck without heroes' },
    'elite-1':  { heroes: true,  maxUnits: 99, maxSpecials: 99, label: 'their complete deck, heroes included' },
    'boss-1':   { heroes: true,  maxUnits: 99, maxSpecials: 99, label: 'their complete deck, heroes included' }
  };
  RL.enemyTier = function (nodeType, act) {
    return RL.ENEMY_TIERS[nodeType + '-' + Math.min(1, act || 0)] || RL.ENEMY_TIERS['battle-0'];
  };

  // Returns [{ index, count }] in the shape gwent.js's Deck.initializeFromID expects.
  RL.enemyDeckCards = function (factionId, nodeType, act) {
    var rng = Math.random;
    var variant = Math.floor(rng() * RL.variantCount(factionId));
    var keys = shape(RL.baseDeck(factionId, variant, rng), RL.enemyTier(nodeType, act), rng);
    return RL.toIndexCounts(keys);
  };

  RL.toIndexCounts = function (keys) {
    var counts = {};
    var order = [];
    keys.forEach(function (k) {
      if (!counts[k]) { counts[k] = 0; order.push(k); }
      counts[k]++;
    });
    return order.map(function (k) { return { index: k, count: counts[k] }; });
  };

  // ── Shop ──
  RL.priceFor = function (key) {
    var info = RL.cardInfo(key);
    if (!info) return 1;
    if (info.special) return 2;
    if (info.hero) return 4;
    var p = info.strength >= 8 ? 3 : info.strength >= 4 ? 2 : 1;
    if (info.abilities.length && p < 3) p += 1;
    return p;
  };
  RL.sellValue = function (key) { return Math.max(1, Math.floor(RL.priceFor(key) / 2)); };

  RL.generateWares = function (factionId, seed, bonus) {
    var rng = RL.makeRng(seed);
    var pool = RL.factionPool(factionId);
    var heroes = pool.units.filter(function (k) { return RL.cardInfo(k).hero; });
    var regulars = pool.units.filter(function (k) { return !RL.cardInfo(k).hero; });
    var count = RL.WARES_PER_SHOP + (bonus || 0);
    var wares = [];
    var used = {};
    for (var i = 0; i < count * 4 && wares.length < count; i++) {
      var r = rng();
      var src = r < 0.2 ? pool.specials : r < 0.35 ? heroes : regulars;
      if (!src.length) src = regulars;
      var key = pick(src, rng);
      if (used[key]) continue;
      used[key] = true;
      wares.push({ id: 'w' + i, key: key });
    }
    return wares;
  };

  RL.randomRecruit = function (factionId) {
    var pool = RL.factionPool(factionId).units.filter(function (k) {
      var info = RL.cardInfo(k);
      return !info.hero && info.strength >= 4 && info.strength <= 8;
    });
    return pool.length ? pick(pool) : null;
  };

  // ── Rewards (rolled once per node when the map is generated, so they can be shown) ──
  RL.REWARDS = {
    'battle-0': { gold: [1, 2], rationChance: 0.5, rations: [5, 10] },
    'elite-0':  { gold: [2, 4], rationChance: 1,   rations: [8, 15] },
    'boss-0':   { gold: [4, 6], rationChance: 1,   rations: [15, 25] },
    'battle-1': { gold: [2, 3], rationChance: 0.5, rations: [5, 12] },
    'elite-1':  { gold: [3, 5], rationChance: 1,   rations: [10, 18] },
    'boss-1':   { gold: [5, 8], rationChance: 1,   rations: [0, 0] }
  };
  RL.rollReward = function (nodeType, act, rng) {
    var cfg = RL.REWARDS[nodeType + '-' + Math.min(1, act || 0)] || RL.REWARDS['battle-0'];
    var ri = function (lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); };
    var gold = ri(cfg.gold[0], cfg.gold[1]);
    var rations = rng() < cfg.rationChance ? ri(cfg.rations[0], cfg.rations[1]) : 0;
    return { gold: gold, rations: rations };
  };

  window.RL = RL;
})();
