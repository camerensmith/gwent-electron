// Static data for roguelite mode — IDs match Gwent Electron's javascript/factions.js + cards.js.
// Leader entries carry the real internal `card_id` from cards.js so wiring up later is one-line.

window.FACTIONS = [
  { id: 'realms',     name: 'Northern Realms', motto: 'Steel and standards.',           hue: 38,
    leaders: [
      { id: 'foltest_siegemaster',  name: 'Foltest — The Siegemaster',              image: 'images/sm/realms_foltest_siegemaster.jpg' },
      { id: 'foltest_lord',         name: 'Foltest — Lord Commander of the North',  image: 'images/sm/realms_foltest_lord.jpg' },
      { id: 'foltest_king',         name: 'Foltest — King of Temeria',              image: 'images/sm/realms_foltest_king.jpg' },
      { id: 'foltest_steelforged',  name: 'Foltest — The Steel-Forged',             image: 'images/sm/realms_foltest_steelforged.jpg' },
      { id: 'radovid_stern',        name: 'Radovid V — the Stern',                  image: 'images/sm/realms_radovid_stern.jpg' },
      { id: 'queen_calanthe',       name: 'Queen Calanthe — Lioness of Cintra',     image: 'images/sm/realms_queen_calanthe.jpg' }
    ] },
  { id: 'nilfgaard',  name: 'Nilfgaard',       motto: 'A black sun rises.',             hue: 0,
    leaders: [
      { id: 'emhyr_emperor',    name: 'Emhyr var Emreis — Emperor of Nilfgaard',  image: 'images/sm/nilfgaard_emhyr_emperor.jpg' },
      { id: 'emhyr_whiteflame', name: 'Emhyr var Emreis — the White Flame',       image: 'images/sm/nilfgaard_emhyr_whiteflame.jpg' },
      { id: 'emhyr_relentless', name: 'Emhyr var Emreis — The Relentless',        image: 'images/sm/nilfgaard_emhyr_relentless.jpg' },
      { id: 'emhyr_imperial',   name: 'Emhyr var Emreis — His Imperial Majesty',  image: 'images/sm/nilfgaard_emhyr_imperial.jpg' },
      { id: 'emhyr_invader',    name: 'Emhyr var Emreis — Invader of the North',  image: 'images/sm/nilfgaard_emhyr_invader_of_the_north.jpg' }
    ] },
  { id: 'monsters',   name: 'Monsters',        motto: 'From the dark, they come.',      hue: 280,
    leaders: [
      { id: 'eredin_commander',        name: 'Eredin — Commander of the Red Riders',    image: 'images/sm/monsters_eredin_commander.jpg' },
      { id: 'eredin_bringer_of_death', name: 'Eredin — Bringer of Death',               image: 'images/sm/monsters_eredin_bringer_of_death.jpg' },
      { id: 'eredin_destroyer',        name: 'Eredin — Destroyer of Worlds',            image: 'images/sm/monsters_eredin_destroyer.jpg' },
      { id: 'eredin_king',             name: 'Eredin — King of the Wild Hunt',          image: 'images/sm/monsters_eredin_king.jpg' },
      { id: 'eredin_treacherous',      name: 'Eredin Bréacc Glas — The Treacherous',   image: 'images/sm/monsters_eredin_the_treacherous.jpg' },
      { id: 'mo_bloody_baron',         name: 'Phillip Strenger — the Bloody Baron',     image: 'images/sm/monsters_bloody_baron.jpg' }
    ] },
  { id: 'scoiatael',  name: "Scoia'tael",      motto: 'The forest remembers.',          hue: 130,
    leaders: [
      { id: 'francesca_queen',     name: 'Francesca Findabair — Queen of Dol Blathanna',  image: 'images/sm/scoiatael_francesca_queen.jpg' },
      { id: 'francesca_beautiful', name: 'Francesca Findabair — the Beautiful',            image: 'images/sm/scoiatael_francesca_beautiful.jpg' },
      { id: 'francesca_daisy',     name: 'Francesca Findabair — Daisy of the Valley',     image: 'images/sm/scoiatael_francesca_daisy.jpg' },
      { id: 'francesca_pureblood', name: 'Francesca Findabair — Pureblood Elf',           image: 'images/sm/scoiatael_francesca_pureblood.jpg' },
      { id: 'francesca_hope',      name: 'Francesca Findabair — Hope of the Aen Seidhe', image: 'images/sm/scoiatael_francesca_hope_of_the_aen_seidhe.jpg' }
    ] },
  { id: 'skellige',   name: 'Skellige',        motto: 'Salt, steel, and storm.',        hue: 200,
    leaders: [
      { id: 'crach_an_craite', name: 'Crach an Craite', image: 'images/sm/skellige_crach_an_craite.jpg' },
      { id: 'king_bran',       name: 'King Bran',       image: 'images/sm/skellige_king_bran.jpg' }
    ] },
  { id: 'novigrad',   name: 'Free City of Novigrad', motto: 'Coin buys all.',           hue: 50,
    leaders: [
      { id: 'novigrad_sigismund',  name: 'Sigismund Dijkstra — the Shrewd',       image: 'images/sm/novigrad_sigismund.jpg' },
      { id: 'novigrad_sigismund2', name: 'Sigismund Dijkstra — the Politician',   image: 'images/sm/novigrad_sigismund2.jpg' },
      { id: 'cyrus_hemmelfart',    name: 'Cyrus Hemmelfart — Hierarch of Novigrad', image: 'images/sm/novigrad_cyrus_hemmelfart.jpg' }
    ] },
  { id: 'witchers',   name: 'Witchers',        motto: 'Evil is evil.',                  hue: 220,
    leaders: [
      { id: 'vilgefortz_magician_kovir', name: 'Vilgefortz — Magician of Kovir',          image: 'images/sm/witchers_vilgefortz_magician_kovir.jpg' },
      { id: 'vilgefortz_sorcerer',       name: 'Vilgefortz — Sorcerer of Roggeveen',      image: 'images/sm/witchers_vilgefortz_sorcerer.jpg' },
      { id: 'cosimo_malaspina',          name: 'Cosimo Malaspina — Master of Mutations',  image: 'images/sm/witchers_cosimo_malaspina.jpg' },
      { id: 'alzur_maker',               name: 'Alzur — The Maker of Spells',             image: 'images/sm/witchers_alzur_maker.jpg' }
    ] },
  { id: 'toussaint',  name: 'Toussaint',       motto: 'A toast, and a fang.',           hue: 340,
    leaders: [
      { id: 'anna_henrietta_duchess',  name: 'Anna Henrietta — Lady Duchess',                  image: 'images/sm/toussaint_anna_henrietta_duchess.jpg' },
      { id: 'anna_henrietta_ladyship', name: 'Anna Henrietta — Her Enlightened Ladyship',      image: 'images/sm/toussaint_anna_henrietta_ladyship.jpg' },
      { id: 'anna_henrietta_grace',    name: 'Anna Henrietta — Her Grace',                     image: 'images/sm/toussaint_anna_henrietta_grace.jpg' }
    ] },
  { id: 'lyria_rivia', name: 'Lyria & Rivia',  motto: 'Pride before the shield.',       hue: 165,
    leaders: [
      { id: 'meve_princess',    name: 'Meve — The Princess of Lyria', image: 'images/sm/lyria_rivia_meve_princess.jpg' },
      { id: 'meve_resolute',    name: 'Meve — The Resolute',          image: 'images/sm/lyria_rivia_meve_resolute.jpg' },
      { id: 'meve_white_queen', name: 'Meve — The White Queen',       image: 'images/sm/lyria_rivia_meve_white_queen.jpg' }
    ] },
  { id: 'syndicate',  name: 'Syndicate',       motto: 'Every shadow has a price.',      hue: 25,
    leaders: [
      { id: 'carlo_varese',        name: 'Carlo Varese — Cleaver',             image: 'images/sm/syndicate_carlo_varese.jpg' },
      { id: 'francis_bedlam',      name: 'Francis Bedlam — King of Beggars',  image: 'images/sm/syndicate_francis_bedlam.jpg' },
      { id: 'cyprian_wiley',       name: 'Cyprian Wiley — Whoreson Junior',   image: 'images/sm/syndicate_cyprian_wiley.jpg' },
      { id: 'sigi_reuven_leader',  name: 'Sigi Reuven — the Cunning',         image: 'images/sm/syndicate_sigi_reuvenleader.jpg' },
      { id: 'gudrun_bjornsdottir', name: 'Gudrun Bjornsdottir — Pirate Queen', image: 'images/sm/syndicate_gudrun_bjornsdottir.jpg' }
    ] },
  { id: 'zerrikania', name: 'Zerrikania',      motto: 'The serpent watches the sun.',   hue: 60,
    leaders: [
      { id: 'zerrikanterment', name: 'Zerrikanterment',       image: 'images/sm/zerrikania_zerrikanterment.jpg' },
      { id: 'baal_zebuth',     name: 'Ball-Zebuth',           image: 'images/sm/zerrikania_baal_zebuth.jpg' },
      { id: 'rarog',           name: 'Raróg',                 image: 'images/sm/zerrikania_rarog.jpg' },
      { id: 'azar_javed',      name: 'Azar Javed — Renegade', image: 'images/sm/zerrikania_azar_javedleader.jpg' }
    ] },
  { id: 'ofir',       name: 'Ofir',            motto: 'The desert favours the patient.', hue: 30,
    leaders: [
      { id: 'ofir_aamad',               name: 'Aamad — the Wise',         image: 'images/sm/ofir_aamad.jpg' },
      { id: 'ofir_aamad_merchant',      name: 'Aamad — The Merchant King', image: 'images/sm/ofir_aamad1.jpg' },
      { id: 'ofir_grand_vizier_saheem', name: 'Grand Vizier Saheem',       image: 'images/sm/ofir_grand_vizier_saheem.jpg' }
    ] }
];

// Sample card pool per faction (placeholder names — your real card data lives in cards.js).
window.CARD_POOL = {
  realms:    ['Foot Soldier', 'Crinfrid Reaver', 'Siege Engineer', 'Blue Stripes Commando', 'Trebuchet', 'Catapult', 'Field Medic', 'Heavy Infantry', 'Banner-Knight', 'Pikeman', 'Dun Banner Cavalry', 'Ballista', 'Kaedweni Sergeant'],
  nilfgaard: ['Black Infantry', 'Impera Brigade', 'Vrihedd Officer', 'Spy of Cintra', 'Letho of Gulet', 'Albrich', 'Stefan Skellen', 'Etolian Conscript', 'Spotter', 'Vattier de Rideaux', 'Cynthia', 'Nausicaa Brigade'],
  monsters:  ['Arachas', 'Endrega', 'Nekker', 'Ghoul', 'Drowner', 'Wyvern', 'Werewolf', 'Fiend', 'Foglet', 'Forktail', 'Katakan', 'Bruxa', 'Frightener'],
  scoiatael: ['Elven Skirmisher', 'Dwarven Skirmisher', 'Vrihedd Brigade', 'Havekar Healer', 'Dol Blathanna Archer', 'Filavandrel', 'Riordain', 'Yaevinn', 'Toruviel', 'Mahakam Defender'],
  skellige:  ['Clan an Craite Warrior', 'Drummond Shieldmaiden', 'Dimun Pirate', 'Tuirseach Skirmisher', 'Hjalmar', 'Cerys', 'Madman Lugos', 'Olaf', 'Light Longship', 'Heavy Longship', 'War Longship'],
  novigrad:  ['City Watchman', 'Vigilante', 'Hawker', 'Whoreson', 'Cleaver', 'Bedlam', 'Brawler', 'Cutpurse', 'Yennefer', 'Triss', 'Cyprian Wiley', 'Dudu'],
  witchers:  ['Wolf Apprentice', 'Cat Adept', 'Griffin Squire', 'Bear Tracker', 'Viper Initiate', 'Sign: Igni', 'Sign: Aard', 'Sign: Quen', 'Sign: Yrden', 'Sign: Axii', 'Geralt', 'Vesemir'],
  toussaint: ['Knight-Errant', 'Vintner', 'Sommelier', 'Hunger Unit', 'Beauclair Guard', 'Detlaff Acolyte', 'Bruxa', 'Alp', 'Garkain', 'Ekimmara', 'Regis', 'Orianna'],
  lyria_rivia: ['Lyrian Pikeman', 'Rivian Halberdier', 'Knighthood', 'Mounted Knight', 'Court Sorcerer', 'Standard-Bearer', 'Field Surgeon', 'Crossbowman', 'Light Cavalry', 'Wagenburg', 'Royal Guard', 'Gascon'],
  syndicate: ['Enforcer', 'Bookkeeper', 'Thief', 'Cutthroat', 'Bagman', 'Fixer', 'Boss', 'Smuggler', 'Witch Hunter', 'Executioner', 'Tax Collector', 'Coin Master'],
  zerrikania:['Serpent Worshipper', 'Hyena Pack', 'Leopard Stalker', 'Sun Acolyte', 'Sacred Dragon', 'Snake Charmer', 'Fire Dancer', 'Oasis Guard', 'Spice Trader', 'Painted Lion'],
  ofir:      ['Sand Skirmisher', 'Camel Lancer', 'Dune Reader', 'Spice Caravan', 'Adaptive Scout', 'Mosaic Archer', 'Falconer', 'Mystic', 'Bedouin Raider', 'Runewright', 'Runestone', 'Slave Trader']
};

window.SPECIALS_POOL = ['Decoy', 'Scorch', "Commander's Horn", 'Biting Frost', 'Impenetrable Fog', 'Torrential Rain', 'Clear Skies', 'Cull'];

// Faction passives.
window.FACTION_PASSIVES = {
  realms:    'Draw a card from your deck whenever you win a round.',
  nilfgaard: 'Wins any round that ends in a draw.',
  monsters:  'Keeps a random Unit Card out after each round.',
  scoiatael: 'Decides who takes first turn.',
  skellige:  '2 random units return from the graveyard at the start of round 3.',
  novigrad:  'After drawing your opening hand, you may redraw 1 extra card.',
  witchers:  'Can skip a turn once per game.',
  toussaint: 'Draw a card from your deck whenever you lose a round.',
  lyria_rivia: 'Once per game, apply Morale Boost (+1 to all units in a chosen row).',
  syndicate: 'Starts the game with Sigi Reuven on the board.',
  zerrikania: 'Restore a random worshipper from your discard pile when you lose a round.',
  ofir:      'Once per game, search your deck for a weather card and play it.'
};

// Modifier templates — used ONLY by Boss encounters.
window.MODIFIERS = [
  { id: 'persistent_rain', name: 'A Sky That Will Not Clear', desc: 'Torrential Rain on Ranged Combat for the entire battle. Clear Skies cannot lift it.',           sign: 'minus' },
  { id: 'frost_start',     name: 'A Bitter Beginning',         desc: 'The battle opens with Biting Frost on Close Combat. Weather may be cleared as normal.',       sign: 'minus' },
  { id: 'close_swarm',     name: 'Iron in the Vanguard',       desc: 'Enemy Close Combat units gain +2 strength.',                                                   sign: 'minus' },
  { id: 'no_specials',     name: 'A Silent Council',           desc: 'No Special cards may be played by either side this battle.',                                   sign: 'minus' },
  { id: 'no_heroes',       name: 'Heroes Forsworn',            desc: 'Hero immunity is suspended — Heroes may be killed by abilities this battle.',                  sign: 'minus' },
  { id: 'tempest',         name: 'The Skellige Tempest',       desc: 'Ranged and Siege rows are reduced to 1 strength per unit for the entire battle.',             sign: 'minus' },
  { id: 'fog_persistent',  name: 'A Fog That Lingers',         desc: 'Impenetrable Fog on Ranged Combat. Clear Skies cannot lift it.',                                sign: 'minus' }
];

// Boss-only mechanical effects.
window.BOSS_EFFECTS = [
  { id: 'burn_deck',    group: 'attrition', name: 'Burn the Stores',  desc: 'On battle start, 1 random Unit is burnt from your deck (not hand).' },
  { id: 'decimation',   group: 'attrition', name: 'Decimation',       desc: 'At the start of round 3, 3 random cards are removed from your deck.' },
  { id: 'marked_round', group: 'power',     name: 'A Marked Round',   desc: 'The boss gains +3 strength to all units on a random round (revealed at round start).' },
  { id: 'champion',     name: 'Champion of the Realm',                desc: "The boss's Leader ability triggers twice this battle." },
  { id: 'ransack',      group: 'rations',   name: 'Ransack',          desc: 'The boss plunders your supplies. \u20133 Rations on battle start.' },
  { id: 'feast',        group: 'rations',   name: 'A Feast Demanded', desc: 'You pay 1 extra Ration each turn this battle.' },
  { id: 'persistent_rain', group: 'weather', name: 'A Sky That Will Not Clear', desc: 'Persistent Torrential Rain on Ranged \u2014 Clear Skies cannot lift it.' },
  { id: 'frost_start',     group: 'weather', name: 'A Bitter Beginning',         desc: 'Battle opens with Biting Frost on Close. Clearable as normal.' },
  { id: 'tempest',         group: 'weather', name: 'The Skellige Tempest',       desc: 'Ranged & Siege reduced to 1/unit for the whole battle.' },
  { id: 'no_specials',     group: 'rules',   name: 'A Silent Council',           desc: 'No Special cards may be played by either side.' },
  { id: 'no_heroes',       group: 'rules',   name: 'Heroes Forsworn',            desc: 'Hero immunity is suspended this battle.' }
];

// Elite intrinsic effect.
window.ELITE_EFFECTS = {
  easy:   { id: 'veteran_e', name: 'Veteran Tactics',   desc: 'The elite gains +1 strength to all its units at the start of each turn.' },
  medium: { id: 'veteran_m', name: 'Veteran Tactics',   desc: 'The elite gains +2 strength to all its units at the start of each turn.' },
  hard:   { id: 'veteran_h', name: 'Veteran Tactics',   desc: 'The elite gains +3 strength to all its units at the start of each turn.' }
};

window.RATION_COSTS = {
  default: { unit: 1, hero: 2, special: 0 },
  witchers: { unit: 1, hero: 2, special: 0, sign: 0, castle: 0 }
};

window.STARTING_RATIONS_MIN = 22;
window.STARTING_RATIONS_MAX = 32;
window.RATION_TRAVEL_COST = 1;
window.LOSS_GOLD_COST = { battle: 1, elite: 2, boss: 4 };
window.BATTLE_RATION_DRAIN = { battle: [4, 6], elite: [5, 8], boss: [7, 10] };

// Items — meta-progression.
window.ITEMS = [
  { id: 'kings_bounty',    name: "King's Bounty",        glyph: '\u2014',  rarity: 'common',   desc: '+1 gold from every battle won.' },
  { id: 'quartermaster',   name: "Quartermaster's Ledger", glyph: '\u2752', rarity: 'common',   desc: '+5 Rations at the start of the run.' },
  { id: 'lean_provision',  name: 'Lean Provisioning',     glyph: '\u25cb', rarity: 'uncommon', desc: 'All Unit ration costs reduced by 1 (minimum 0).' },
  { id: 'foragers_eye',    name: "Forager's Eye",         glyph: '\u25c8', rarity: 'uncommon', desc: 'Camps grant +2 additional Rations.' },
  { id: 'black_market',    name: 'Black Market Ledger',   glyph: '\u2756', rarity: 'rare',     desc: 'Shops offer 2 additional cards per visit.' },
  { id: 'travelling_merch',name: 'Travelling Merchant',   glyph: '\u2696', rarity: 'rare',     desc: '30% chance per Shop visit: all prices reduced by 1.' },
  { id: 'hardtack',        name: 'Hardtack',              glyph: '\u25c6', rarity: 'rare',     desc: 'Heroes cost 1 Ration instead of 2.' },
  { id: 'map_etcher',      name: 'Map Etcher',            glyph: '\u2734', rarity: 'rare',     desc: 'Mystery node contents are revealed before clicking.' },
  { id: 'lucky_coin',      name: 'Lucky Coin',            glyph: '\u25c9', rarity: 'common',   desc: '10% chance per map node to find +1 gold underfoot.' },
  { id: 'whetstone',       name: 'Whetstone',             glyph: '\u2718', rarity: 'uncommon', desc: 'First battle of each Act, your units gain +1 strength on round 1.' }
];

// Mercenary pool for Mystery "recruit" outcomes.
window.MERCENARY_POOL = [
  { name: 'Hedge-Knight Errant',   strength: 4, type: 'unit', row: 'Close',  hero: false },
  { name: 'Old Witcher (Retired)', strength: 6, type: 'unit', row: 'Close',  hero: false },
  { name: 'Bandit Crossbowman',    strength: 3, type: 'unit', row: 'Ranged', hero: false },
  { name: 'Wandering Bard',        strength: 2, type: 'unit', row: 'Agile',  hero: false },
  { name: 'Mercenary Surgeon',     strength: 4, type: 'unit', row: 'Close',  hero: false },
  { name: 'Exiled Sorceress',      strength: 7, type: 'unit', row: 'Ranged', hero: true  },
  { name: 'Free Sapper Crew',      strength: 4, type: 'unit', row: 'Siege',  hero: false }
];

// Mystery outcomes.
window.MYSTERY_OUTCOMES = [
  { id: 'find_gold',    kind: 'gold',    amount:  2, line: 'A buried strongbox. Old, but the coin still rings true.' },
  { id: 'lose_gold',    kind: 'gold',    amount: -2, line: 'A patrol stops you and demands tribute. They are larger than your purse.' },
  { id: 'find_rations', kind: 'rations', amount:  3, line: 'A farmer hails you. She offers bread, salted meat, a flask. "For luck."' },
  { id: 'lose_rations', kind: 'rations', amount: -2, line: 'Your stores are damp. Half the salt-pork goes into the mud.' },
  { id: 'mercenary',    kind: 'recruit',             line: 'A masked rider falls in beside you. "I have nothing left to lose," they say.' },
  { id: 'waylay',       kind: 'deck',    amount: -1, line: 'You are ambushed at a ford. A card is lost in the river.' },
  { id: 'boon_draw',    kind: 'buff',    buff: 'draw_plus_one',  line: 'A diviner reads your palm. "You will see more clearly in the next contest." (+1 card draw, next encounter)' },
  { id: 'boon_peek',    kind: 'buff',    buff: 'peek_enemy',     line: 'A spy in your favour. (Peek 1 enemy card, next encounter)' },
  { id: 'boon_clear',   kind: 'buff',    buff: 'clear_skies',    line: 'A clear-eyed priest blesses your standard. (Clear Skies primed, next encounter)' }
];

// Node-type metadata.
window.NODE_TYPES = {
  battle:   { glyph: '\u2694',  label: 'Skirmish',   flavour: 'A skirmish. Spoils await.',                  reward: '+1 gold',           weight: 0.50 },
  elite:    { glyph: '\u2726',  label: 'Elite',      flavour: 'A champion stands in your road.',           reward: '+2 gold \u00b7 cache', weight: 0.12 },
  shop:     { glyph: '\u2696',  label: 'Merchant',   flavour: 'Coin changes hands in a quiet tent.',        reward: 'buy / sell',         weight: 0.13 },
  rest:     { glyph: '\u2617',  label: 'Camp',       flavour: 'A fire, a flask, a song half-remembered.',   reward: 'rest',               weight: 0.13 },
  cache:    { glyph: '\u25c8',  label: 'Cache',      flavour: 'A buried strongbox, half-forgotten.',        reward: '+2 gold',            weight: 0.07 },
  mystery:  { glyph: '?',       label: 'Mystery',    flavour: 'The road bends into something unseen.',      reward: '???',                weight: 0.05 },
  boss:     { glyph: '\u25c6',  label: 'Endbringer', flavour: 'The road ends here. So might you.',          reward: '+5 gold \u00b7 trophy', weight: 0 }
};

// Faction-themed merchant flavour.
window.MERCHANT_LINES = {
  realms:     '"Standards aren\'t free, sellsword. Coin first."',
  nilfgaard:  '"The Empire suffers no debt. Pay, or pass."',
  monsters:   '"Mmmm. Shiny coin. Take. Bring more."',
  scoiatael:  '"For the cause, friend. But the cause has prices."',
  skellige:   '"You drink, you fight, you pay. In that order."',
  novigrad:   '"For you? Special price. Same as everyone."',
  witchers:   '"A witcher\'s gear is never cheap, ploughman."',
  toussaint:  '"Vintage and steel, monsieur. Both age well."',
  lyria_rivia:'"Honour first. Coin second. But coin, nonetheless."',
  syndicate:  '"Nothin\' personal. Just business. Always business."',
  zerrikania: '"The serpent guards her hoard, traveller."',
  ofir:       '"The desert teaches patience. The price does not."'
};

window.REST_LINES = [
  'You sit by a fire that asks nothing of you.',
  'The wind drops. Somewhere a horse blows softly.',
  'A traveller waves from across the embers and does not approach.',
  'You sharpen a blade you did not know was dull.',
  'A song you half-remember finds you, then leaves.'
];

// Act-level boss flavour.
window.ACT_BOSSES = [
  { actName: 'The Long Road',  title: 'The Pretender King',   flavour: 'A usurper holds the river-crossing. He has been waiting for you.' },
  { actName: 'The Last Mile',  title: 'The Black Sun Itself', flavour: 'The sky darkens. The horizon is full of banners.' }
];
