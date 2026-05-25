// Static data for roguelite mode — IDs match Gwent Electron's javascript/factions.js + cards.js.
// Leader entries carry the real internal `card_id` from cards.js so wiring up later is one-line.

window.FACTIONS = [
  { id: 'realms',     name: 'Northern Realms', motto: 'Steel and standards.',           hue: 38,
    leaders: [
      { id: 'foltest_siegemaster',  name: 'Foltest — The Siegemaster',              image: 'images/sm/realms_foltest_siegemaster.jpg',  ability: 'foltest_siegemaster' },
      { id: 'foltest_lord',         name: 'Foltest — Lord Commander of the North',  image: 'images/sm/realms_foltest_lord.jpg',          ability: 'foltest_lord' },
      { id: 'foltest_king',         name: 'Foltest — King of Temeria',              image: 'images/sm/realms_foltest_king.jpg',          ability: 'foltest_king' },
      { id: 'foltest_steelforged',  name: 'Foltest — The Steel-Forged',             image: 'images/sm/realms_foltest_steelforged.jpg',   ability: 'foltest_steelforged' },
      { id: 'radovid_stern',        name: 'Radovid V — the Stern',                  image: 'images/sm/realms_radovid_stern.jpg',         ability: 'radovid_stern' },
      { id: 'queen_calanthe',       name: 'Queen Calanthe — Lioness of Cintra',     image: 'images/sm/realms_queen_calanthe.jpg',        ability: 'queen_calanthe' }
    ] },
  { id: 'nilfgaard',  name: 'Nilfgaard',       motto: 'A black sun rises.',             hue: 0,
    leaders: [
      { id: 'emhyr_emperor',    name: 'Emhyr var Emreis — Emperor of Nilfgaard',  image: 'images/sm/nilfgaard_emhyr_emperor.jpg',            ability: 'emhyr_emperor' },
      { id: 'emhyr_whiteflame', name: 'Emhyr var Emreis — the White Flame',       image: 'images/sm/nilfgaard_emhyr_whiteflame.jpg',         ability: 'emhyr_whiteflame' },
      { id: 'emhyr_relentless', name: 'Emhyr var Emreis — The Relentless',        image: 'images/sm/nilfgaard_emhyr_relentless.jpg',         ability: 'emhyr_relentless' },
      { id: 'emhyr_imperial',   name: 'Emhyr var Emreis — His Imperial Majesty',  image: 'images/sm/nilfgaard_emhyr_imperial.jpg',           ability: 'emhyr_imperial' },
      { id: 'emhyr_invader',    name: 'Emhyr var Emreis — Invader of the North',  image: 'images/sm/nilfgaard_emhyr_invader_of_the_north.jpg', ability: 'emhyr_invader' }
    ] },
  { id: 'monsters',   name: 'Monsters',        motto: 'From the dark, they come.',      hue: 280,
    leaders: [
      { id: 'eredin_commander',        name: 'Eredin — Commander of the Red Riders',    image: 'images/sm/monsters_eredin_commander.jpg',          ability: 'eredin_commander' },
      { id: 'eredin_bringer_of_death', name: 'Eredin — Bringer of Death',               image: 'images/sm/monsters_eredin_bringer_of_death.jpg',   ability: 'eredin_bringer_of_death' },
      { id: 'eredin_destroyer',        name: 'Eredin — Destroyer of Worlds',            image: 'images/sm/monsters_eredin_destroyer.jpg',          ability: 'eredin_destroyer' },
      { id: 'eredin_king',             name: 'Eredin — King of the Wild Hunt',          image: 'images/sm/monsters_eredin_king.jpg',               ability: 'eredin_king' },
      { id: 'eredin_treacherous',      name: 'Eredin Bréacc Glas — The Treacherous',   image: 'images/sm/monsters_eredin_the_treacherous.jpg',    ability: 'eredin_treacherous' },
      { id: 'mo_bloody_baron',         name: 'Phillip Strenger — the Bloody Baron',     image: 'images/sm/monsters_bloody_baron.jpg',              ability: 'mo_bloody_baron' }
    ] },
  { id: 'scoiatael',  name: "Scoia'tael",      motto: 'The forest remembers.',          hue: 130,
    leaders: [
      { id: 'francesca_queen',     name: 'Francesca Findabair — Queen of Dol Blathanna',  image: 'images/sm/scoiatael_francesca_queen.jpg',                  ability: 'francesca_queen' },
      { id: 'francesca_beautiful', name: 'Francesca Findabair — the Beautiful',            image: 'images/sm/scoiatael_francesca_beautiful.jpg',              ability: 'francesca_beautiful' },
      { id: 'francesca_daisy',     name: 'Francesca Findabair — Daisy of the Valley',     image: 'images/sm/scoiatael_francesca_daisy.jpg',                  ability: 'francesca_daisy' },
      { id: 'francesca_pureblood', name: 'Francesca Findabair — Pureblood Elf',           image: 'images/sm/scoiatael_francesca_pureblood.jpg',              ability: 'francesca_pureblood' },
      { id: 'francesca_hope',      name: 'Francesca Findabair — Hope of the Aen Seidhe', image: 'images/sm/scoiatael_francesca_hope_of_the_aen_seidhe.jpg', ability: 'francesca_hope' }
    ] },
  { id: 'skellige',   name: 'Skellige',        motto: 'Salt, steel, and storm.',        hue: 200,
    leaders: [
      { id: 'crach_an_craite', name: 'Crach an Craite', image: 'images/sm/skellige_crach_an_craite.jpg', ability: 'crach_an_craite' },
      { id: 'king_bran',       name: 'King Bran',       image: 'images/sm/skellige_king_bran.jpg',       ability: 'king_bran' }
    ] },
  { id: 'novigrad',   name: 'Free City of Novigrad', motto: 'Coin buys all.',           hue: 50,
    leaders: [
      { id: 'novigrad_sigismund',  name: 'Sigismund Dijkstra — the Shrewd',         image: 'images/sm/novigrad_sigismund.jpg',       ability: 'novigrad_sigismund' },
      { id: 'novigrad_sigismund2', name: 'Sigismund Dijkstra — the Politician',     image: 'images/sm/novigrad_sigismund2.jpg',      ability: 'novigrad_sigismund2' },
      { id: 'cyrus_hemmelfart',    name: 'Cyrus Hemmelfart — Hierarch of Novigrad', image: 'images/sm/novigrad_cyrus_hemmelfart.jpg', ability: 'cyrus_hemmelfart' }
    ] },
  { id: 'witchers',   name: 'Witchers',        motto: 'Evil is evil.',                  hue: 220,
    leaders: [
      { id: 'vilgefortz_magician_kovir', name: 'Vilgefortz — Magician of Kovir',          image: 'images/sm/witchers_vilgefortz_magician_kovir.jpg', ability: 'vilgefortz_magician_kovir' },
      { id: 'vilgefortz_sorcerer',       name: 'Vilgefortz — Sorcerer of Roggeveen',      image: 'images/sm/witchers_vilgefortz_sorcerer.jpg',       ability: 'vilgefortz_sorcerer' },
      { id: 'cosimo_malaspina',          name: 'Cosimo Malaspina — Master of Mutations',  image: 'images/sm/witchers_cosimo_malaspina.jpg',          ability: 'cosimo_malaspina' },
      { id: 'alzur_maker',               name: 'Alzur — The Maker of Spells',             image: 'images/sm/witchers_alzur_maker.jpg',               ability: 'alzur_maker' }
    ] },
  { id: 'toussaint',  name: 'Toussaint',       motto: 'A toast, and a fang.',           hue: 340,
    leaders: [
      { id: 'anna_henrietta_duchess',  name: 'Anna Henrietta — Lady Duchess',                  image: 'images/sm/toussaint_anna_henrietta_duchess.jpg',   ability: 'anna_henrietta_duchess' },
      { id: 'anna_henrietta_ladyship', name: 'Anna Henrietta — Her Enlightened Ladyship',      image: 'images/sm/toussaint_anna_henrietta_ladyship.jpg',  ability: 'anna_henrietta_ladyship' },
      { id: 'anna_henrietta_grace',    name: 'Anna Henrietta — Her Grace',                     image: 'images/sm/toussaint_anna_henrietta_grace.jpg',     ability: 'anna_henrietta_grace' }
    ] },
  { id: 'lyria_rivia', name: 'Lyria & Rivia',  motto: 'Pride before the shield.',       hue: 165,
    leaders: [
      { id: 'meve_princess',    name: 'Meve — The Princess of Lyria', image: 'images/sm/lyria_rivia_meve_princess.jpg',    ability: 'meve_princess' },
      { id: 'meve_resolute',    name: 'Meve — The Resolute',          image: 'images/sm/lyria_rivia_meve_resolute.jpg',    ability: 'meve_resolute' },
      { id: 'meve_white_queen', name: 'Meve — The White Queen',       image: 'images/sm/lyria_rivia_meve_white_queen.jpg', ability: 'meve_white_queen' }
    ] },
  { id: 'syndicate',  name: 'Syndicate',       motto: 'Every shadow has a price.',      hue: 25,
    leaders: [
      { id: 'carlo_varese',        name: 'Carlo Varese — Cleaver',              image: 'images/sm/syndicate_carlo_varese.jpg',         ability: 'carlo_varese' },
      { id: 'francis_bedlam',      name: 'Francis Bedlam — King of Beggars',   image: 'images/sm/syndicate_francis_bedlam.jpg',       ability: 'francis_bedlam' },
      { id: 'cyprian_wiley',       name: 'Cyprian Wiley — Whoreson Junior',    image: 'images/sm/syndicate_cyprian_wiley.jpg',        ability: 'cyprian_wiley' },
      { id: 'sigi_reuven_leader',  name: 'Sigi Reuven — the Cunning',          image: 'images/sm/syndicate_sigi_reuvenleader.jpg',    ability: 'sigi_reuven_leader' },
      { id: 'gudrun_bjornsdottir', name: 'Gudrun Bjornsdottir — Pirate Queen', image: 'images/sm/syndicate_gudrun_bjornsdottir.jpg',  ability: 'gudrun_bjornsdottir' }
    ] },
  { id: 'zerrikania', name: 'Zerrikania',      motto: 'The serpent watches the sun.',   hue: 60,
    leaders: [
      { id: 'zerrikanterment', name: 'Zerrikanterment',       image: 'images/sm/zerrikania_zerrikanterment.jpg',   ability: 'zerrikanterment' },
      { id: 'baal_zebuth',     name: 'Ball-Zebuth',           image: 'images/sm/zerrikania_baal_zebuth.jpg',       ability: 'baal_zebuth' },
      { id: 'rarog',           name: 'Raróg',                 image: 'images/sm/zerrikania_rarog.jpg',             ability: 'rarog' },
      { id: 'azar_javed',      name: 'Azar Javed — Renegade', image: 'images/sm/zerrikania_azar_javedleader.jpg',  ability: 'azar_javed' }
    ] },
  { id: 'ofir',       name: 'Ofir',            motto: 'The desert favours the patient.', hue: 30,
    leaders: [
      { id: 'ofir_aamad',               name: 'Aamad — the Wise',          image: 'images/sm/ofir_aamad.jpg',               ability: 'ofir_aamad' },
      { id: 'ofir_aamad_merchant',      name: 'Aamad — The Merchant King', image: 'images/sm/ofir_aamad1.jpg',              ability: 'ofir_aamad_merchant' },
      { id: 'ofir_grand_vizier_saheem', name: 'Grand Vizier Saheem',       image: 'images/sm/ofir_grand_vizier_saheem.jpg', ability: 'ofir_grand_vizier_saheem' }
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

// Leader ability descriptions — keyed by ability id (mirrors abilities.js).
window.LEADER_ABILITIES = {
  foltest_siegemaster:       'Doubles the strength of all your Siege units (unless a Commander\'s Horn is also present on that row).',
  foltest_lord:              'Clear any weather effects (resulting from Biting Frost, Torrential Rain or Impenetrable Fog cards) in play.',
  foltest_king:              'Pick an Impenetrable Fog card from your deck and play it instantly.',
  foltest_steelforged:       'Destroy your enemy\'s strongest Siege unit(s) if the combined strength of all his or her Siege units is 10 or more.',
  radovid_stern:             'Discard 2 cards and draw 1 card of your choice from your deck.',
  queen_calanthe:            'Play a unit then draw a card from your deck.',
  emhyr_emperor:             'Cancel Decoy ability for one round.',
  emhyr_whiteflame:          'Cancel your opponent\'s Leader Ability.',
  emhyr_relentless:          'Draw a card from your opponent\'s discard pile.',
  emhyr_imperial:            'Pick a Torrential Rain card from your deck and play it instantly.',
  emhyr_invader:             'Abilities that restore a unit to the battlefield restore a randomly-chosen unit. Affects both players.',
  eredin_commander:          'Double the strength of all your Close Combat units (unless a Commander\'s Horn is also present on that row).',
  eredin_bringer_of_death:   'Restore a card from your discard pile to your hand.',
  eredin_destroyer:          'Discard 2 cards and draw 1 card of your choice from your deck.',
  eredin_king:               'Look at 3 random cards from your opponent\'s hand.',
  eredin_treacherous:        'Doubles the strength of all spy cards (affects both players).',
  mo_bloody_baron:           'When a unit dies from a Curse, draw a card from your deck and play it immediately.',
  francesca_queen:           'If you have 4 or more Ranged combat units in play, they gain +2 strength each.',
  francesca_beautiful:       'Doubles the strength of all your Ranged Combat units (unless a Commander\'s Horn is also present on that row).',
  francesca_daisy:           'Draw an extra card at the beginning of the battle.',
  francesca_pureblood:       'Pick a Biting Frost card from your deck and play it instantly.',
  francesca_hope:            'Automatically calculate the maximal row value based on agile units in ranged or close, and based on cards already on those rows.',
  crach_an_craite:           'Once per game: Play the Kraken card from your hand or deck (if it exists).',
  king_bran:                 'Once per game: Add +1 strength to all ships in play until the end of the round.',
  novigrad_sigismund:        'Once per game, prevent the first death of a friendly unit.',
  novigrad_sigismund2:       'If an opponent plays a spy on you, draw 1 card.',
  cyrus_hemmelfart:          'Once per game: Play an Inquisitional Pyres card on the appropriate row.',
  vilgefortz_magician_kovir: 'Halves the strength of all spy cards (affects both players).',
  vilgefortz_sorcerer:       'Clear all weather effects in play.',
  cosimo_malaspina:          'Once per game, add +2 strength to a random unit on your board until the end of the round. This unit also cannot be brought below 2 strength.',
  alzur_maker:               'Destroy one of your units on the board and summon a Koshchey.',
  anna_henrietta_duchess:    'Destroy one Commander\'s Horn on one of your opponent\'s rows.',
  anna_henrietta_ladyship:   'Restore a unit from your discard pile and play it immediately.',
  anna_henrietta_grace:      'Play Nightfall immediately (even if it\'s not in your deck) and destroy it after the end of the round.',
  meve_princess:             'If an opponent has 4 or more cards in one row, destroy one of them.',
  meve_resolute:             'Once per game, boost the power of all allied units on the battlefield by +1 until the end of the round.',
  meve_white_queen:          'All medic cards can choose two unit cards from the discard pile (affects both players).',
  carlo_varese:              'Kill the strongest Hero card in play. (Once per game)',
  francis_bedlam:            'Send all spy unit cards to the grave of the side they are on.',
  cyprian_wiley:             'Seize the unit(s) with the lowest strength of the opponent\'s melee row.',
  sigi_reuven_leader:        'Play a Dimeritum Shackles card in any of the opponent\'s rows.',
  gudrun_bjornsdottir:       'Summon Flyndr\'s Crew.',
  zerrikanterment:           'Amount of worshippers boost is doubled.',
  baal_zebuth:               'Select 2 cards from your opponent\'s discard pile and shuffle them back into his/her deck.',
  rarog:                     'Draw a random card from the discard pile to your hand (any card) and then shuffle the rest back into the deck.',
  azar_javed:                'Destroy the enemy\'s weakest hero card (max 1 card).',
  ofir_aamad:                'Whenever you draw a card, you gain +1 total power for this round permanently (resets upon round completion back to 0).',
  ofir_aamad_merchant:       'If you\'ve drawn 5 cards this round (emissary, spy, trade, or other means), you win the round. Only happens once per game.',
  ofir_grand_vizier_saheem:  'Once per game, you may look at the top 3 cards of your opponent\'s deck, add one to your hand, and discard one.',
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
  { id: 'ransack',      group: 'rations',   name: 'Ransack',          desc: 'The boss plunders your supplies. \u201310 Rations on battle start.' },
  { id: 'feast',        group: 'rations',   name: 'A Feast Demanded', desc: 'You pay 3 extra Rations each turn this battle.' },
  { id: 'persistent_rain', group: 'weather', name: 'A Sky That Will Not Clear', desc: 'Persistent Torrential Rain on Ranged \u2014 Clear Skies cannot lift it.' },
  { id: 'frost_start',     group: 'weather', name: 'A Bitter Beginning',         desc: 'Battle opens with Biting Frost on Close. Clearable as normal.' },
  { id: 'tempest',         group: 'weather', name: 'The Skellige Tempest',       desc: 'Ranged & Siege reduced to 1/unit for the whole battle.' },
  { id: 'no_specials',     group: 'rules',   name: 'A Silent Council',           desc: 'No Special cards may be played by either side.' },
  { id: 'no_heroes',       group: 'rules',   name: 'Heroes Forsworn',            desc: 'Hero immunity is suspended this battle.' },
  { id: 'uroboros',        group: 'deck_manipulation', name: 'Mark of Uroboros',  desc: 'From the start of play, when any player draws a card from a deck, another card (or equal amount to the cards drawn) are discarded from the deck.' },
  { id: 'dampening',       group: 'deck_manipulation', name: 'Dampening',         desc: 'Both players nonunit cards are immediately discarded from their decks at the start of play.' },
  { id: 'twist_of_fate',   group: 'twist',   name: 'Twist of Fate',              desc: 'On turn 3, both players graveyards and draw decks are swapped.' },
  { id: 'banishment',      group: 'attrition', name: 'Banishment',               desc: 'At the start of this battle, a random unit is permanently removed from your deck.' },
  { id: 'warp',            group: 'twist',   name: 'Warp',                        desc: 'At the start of turn 2, each player may choose a card from their deck and play it immediately.' },
  { id: 'landfall',        group: 'twist',   name: 'Landfall',                    desc: "At the start of turn 3, both players' decks are immediately moved to their graveyards." },
  { id: 'sorcery',         group: 'twist',   name: 'Sorcery',                     desc: 'At the start of turn 3, a random card is played from your and your opponents decks, starting with you.' },
  { id: 'gluttony',        group: 'draw',    name: 'Gluttony',                    desc: 'Both players get +1 cards to draw, and they may discard an additional card when redrawing.' }
];

// Elite intrinsic effect.
window.ELITE_EFFECTS = {
  easy:   { id: 'veteran_e', name: 'Veteran Tactics',   desc: 'The elite gains +1 strength to all its units at the start of each turn.' },
  medium: { id: 'veteran_m', name: 'Veteran Tactics',   desc: 'The elite gains +2 strength to all its units at the start of each turn.' },
  hard:   { id: 'veteran_h', name: 'Veteran Tactics',   desc: 'The elite gains +3 strength to all its units at the start of each turn.' }
};

window.RATION_COSTS = {
  hero: 3,
  siege: 2,
  ranged: 1,
  close: 1,
  agile: 2,   // "any" or multi-position units
  special: 0,
};

window.STARTING_RATIONS_MIN = 115;
window.STARTING_RATIONS_MAX = 135;
window.BATTLE_RATION_DRAIN = { battle: [8, 12], elite: [12, 18], boss: [15, 25] };

// Compute travel cost based on deck composition
window.calcTravelCost = function(deck, equipped) {
  const hasLean = (equipped || []).some(i => i.id === 'lean_provision');
  const hasHardtack = (equipped || []).some(i => i.id === 'hardtack');
  let cost = 0;
  for (const card of deck) {
    if (card.type === 'special') continue;
    let unitCost;
    if (card.hero) {
      unitCost = hasHardtack ? 1 : window.RATION_COSTS.hero;
    } else {
      const row = (card.row || '').toLowerCase();
      if (row === 'siege') unitCost = window.RATION_COSTS.siege;
      else if (row === 'agile' || row === 'any') unitCost = window.RATION_COSTS.agile;
      else unitCost = window.RATION_COSTS.close; // close or ranged = 1
    }
    if (hasLean) unitCost = Math.max(0, unitCost - 1);
    cost += unitCost;
  }
  return cost;
};

// Reward ranges per act (0-indexed) and node type.
// battle:  always gold, potentially rations (rationChance = probability of getting any rations).
// elite:   Act 1 — gold OR rations (not both); Act 2 — gold, rations, or combination ≤ comboMax.
//          goldChance = probability of pure-gold outcome when not in combo mode (Act 1 only).
// boss:    always both gold AND rations.
// Losing any encounter forfeits the exact gold the player stood to win (goldLoss = goldReward).
window.BATTLE_REWARDS = {
  act1: {
    battle: { goldMin: 1, goldMax: 2, rationChance: 0.5, rationMin: 5, rationMax: 15 },
    elite:  { goldMin: 2, goldMax: 3, goldChance: 0.65, rationMin: 10, rationMax: 20 },
    boss:   { goldMin: 3, goldMax: 5, rationMin: 15, rationMax: 30 }
  },
  act2: {
    battle: { goldMin: 2, goldMax: 3, rationChance: 0.5, rationMin: 5, rationMax: 20 },
    elite:  { goldMin: 3, goldMax: 5, rationMin: 15, rationMax: 25, comboMax: 7 },
    boss:   { goldMin: 3, goldMax: 6, rationMin: 15, rationMax: 30 }
  }
};

// Items — meta-progression.
window.ITEMS = [
  { id: 'kings_bounty',    name: "King's Bounty",        glyph: '\u2014',  rarity: 'common',   desc: '+1 gold from every battle won.' },
  { id: 'quartermaster',   name: "Quartermaster's Ledger", glyph: '\u2752', rarity: 'common',   desc: '+15 Rations at the start of the run.' },
  { id: 'lean_provision',  name: 'Lean Provisioning',     glyph: '\u25cb', rarity: 'uncommon', desc: 'All Unit ration costs reduced by 1 (minimum 0).' },
  { id: 'foragers_eye',    name: "Forager's Eye",         glyph: '\u25c8', rarity: 'uncommon', desc: 'Camps grant +8 additional Rations.' },
  { id: 'black_market',    name: 'Black Market Ledger',   glyph: '\u2756', rarity: 'rare',     desc: 'Shops offer 2 additional cards per visit.' },
  { id: 'travelling_merch',name: 'Travelling Merchant',   glyph: '\u2696', rarity: 'rare',     desc: '30% chance per Shop visit: all prices reduced by 1.' },
  { id: 'hardtack',        name: 'Hardtack',              glyph: '\u25c6', rarity: 'rare',     desc: 'Heroes cost 1 Ration instead of 3.' },
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
  { id: 'find_rations', kind: 'rations', amount:  10, line: 'A farmer hails you. She offers bread, salted meat, a flask. "For luck."' },
  { id: 'lose_rations', kind: 'rations', amount: -8, line: 'Your stores are damp. Half the salt-pork goes into the mud.' },
  { id: 'mercenary',    kind: 'recruit',             line: 'A masked rider falls in beside you. "I have nothing left to lose," they say.' },
  { id: 'waylay',       kind: 'deck',    amount: -1, line: 'You are ambushed at a ford. A card is lost in the river.' },
  { id: 'boon_draw',    kind: 'buff',    buff: 'draw_plus_one',  line: 'A diviner reads your palm. "You will see more clearly in the next contest." (+1 card draw, next encounter)' },
  { id: 'boon_peek',    kind: 'buff',    buff: 'peek_enemy',     line: 'A spy in your favour. (Peek 1 enemy card, next encounter)' },
  { id: 'boon_clear',   kind: 'buff',    buff: 'clear_skies',    line: 'A clear-eyed priest blesses your standard. (Clear Skies primed, next encounter)' }
];

// Node-type metadata.
window.NODE_TYPES = {
  battle:   { glyph: '\u2694',  label: 'Skirmish',   flavour: 'A skirmish. Spoils await.',                  reward: '1\u20132 gold \u00b7 rations possible', weight: 0.50 },
  elite:    { glyph: '\u2726',  label: 'Elite',      flavour: 'A champion stands in your road.',           reward: '2\u20133 gold or rations',             weight: 0.12 },
  shop:     { glyph: '\u2696',  label: 'Merchant',   flavour: 'Coin changes hands in a quiet tent.',        reward: 'buy / sell',                           weight: 0.13 },
  rest:     { glyph: '\u2617',  label: 'Camp',       flavour: 'A fire, a flask, a song half-remembered.',   reward: 'rest',                                 weight: 0.13 },
  cache:    { glyph: '\u25c8',  label: 'Cache',      flavour: 'A buried strongbox, half-forgotten.',        reward: '+2 gold',                              weight: 0.07 },
  mystery:  { glyph: '?',       label: 'Mystery',    flavour: 'The road bends into something unseen.',      reward: '???',                                  weight: 0.05 },
  boss:     { glyph: '\u25c6',  label: 'Endbringer', flavour: 'The road ends here. So might you.',          reward: 'gold + rations \u00b7 trophy',          weight: 0 }
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
