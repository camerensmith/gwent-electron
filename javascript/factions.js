"use strict"

var factions = {
	novigrad: {
		name: "Free City of Novigrad",
		factionAbility: player => {
			// Passive ability: After drawing opening hand, may redraw 1 extra card
			// This is handled in initialRedraw function
		},
		activeAbility: false,
		abilityUses: 0,
		description: "After drawing your opening hand, you may redraw 1 extra card."
	},
	realms: {
		name: "Northern Realms",
		factionAbility: player => game.roundStart.push(async () => {
			if (game.roundCount > 1 && game.roundHistory[game.roundCount - 2].winner === player) {
				player.deck.draw(player.hand);
				await ui.notification("north", 1200);
			}
			return false;
		}),
		activeAbility: false,
		abilityUses: 0,
		description: "Draw a card from your deck whenever you win a round."
	},
	nilfgaard: {
		name: "Nilfgaardian Empire",
		description: "Wins any round that ends in a draw.",
		activeAbility: false,
		abilityUses: 0
	},
	monsters: {
		name: "Monsters",
		factionAbility: player => game.roundEnd.push( () => {
			let units = board.row.filter( (r,i) => player === player_me ^ i < 3)
				.reduce((a,r) => r.cards.filter(c => c.isUnit() && !c.immortal).concat(a), []);
			if (units.length === 0)
				return;
			let card = units[randomInt(units.length)];
			// Safety check: Only set noRemove on cards that belong to the Monsters player
			if (card.holder && card.holder.deck && card.holder.deck.faction === "monsters") {
				console.log("[MONSTERS] Setting noRemove on:", card.name, card.key, "for player:", player.tag);
				card.noRemove = true;
				game.roundStart.push(async () => {
					await ui.notification("monsters", 1200);
					delete card.noRemove;
					return true; 
				});
			} else {
				console.error("[MONSTERS] ERROR: Attempted to set noRemove on card that doesn't belong to Monsters:", card.name, card.key, "card holder faction:", card.holder?.deck?.faction, "player faction:", player.deck?.faction);
			}
			return false;
		}),
		description: "Keeps a random Unit Card out after each round.",
		activeAbility: false,
		abilityUses: 0
	},
	scoiatael: {
		name: "Scoia'tael",
		factionAbility: player => game.gameStart.push(async () => {
			let notif = "";
			if (player === player_me && !(player.controller instanceof ControllerAI)) {
				await ui.popup("Go First [E]", () => game.firstPlayer = player, "Let Opponent Start [Q]", () => game.firstPlayer = player.opponent(), "Would you like to go first?", "The Scoia'tael faction perk allows you to decide who will get to go first.");
				notif = game.firstPlayer.tag + "-first";
			} else if (player.controller instanceof ControllerAI) {
				if (Math.random() < 0.5) {
					game.firstPlayer = player;
					notif = "scoiatael";
				} else {
					game.firstPlayer = player.opponent();
					notif = game.firstPlayer.tag + "-first";
				}
			}
			await ui.notification(notif, 1200);
			return true;
		}),
		description: "Decides who takes first turn.",
		activeAbility: false,
		abilityUses: 0
	},
	skellige: {
		name: "Skellige",
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount != 3) return false;
			await ui.notification("skellige-" + player.tag, 1200);
			await Promise.all(player.grave.findCardsRandom(c => c.isUnit(), 2).map(c => board.toRow(c, player.grave)));
			return true;
		}),
		description: "2 random cards from the graveyard are placed on the battlefield at the start of the third round.",
		activeAbility: false,
		abilityUses: 0
	},
	witchers: {
		name: "Witchers",
		factionAbility: async player => {
			await ui.notification("witchers", 1200);
		},
		description: "Can skip a turn once per game.",
		activeAbility: true,
		abilityUses: 1,
		weight: (player) => {
			// More valuable since it's once per game - use strategically
			// Higher weight in critical situations (behind, need to pass, etc.)
			const powerDiff = player.opponent().total - player.total;
			const handSize = player.hand.cards.length;
			
			// Very valuable when significantly behind
			if (powerDiff > 20) return 40;
			// Valuable when behind and low on cards
			if (powerDiff > 10 && handSize < 5) return 35;
			// Valuable when opponent passed and we're slightly behind
			if (player.opponent().passed && powerDiff > 0 && powerDiff < 10) return 30;
			// Standard value
			return 25;
		}
	},
	toussaint: {
		name: "Toussaint",
		factionAbility: player => game.roundStart.push(async () => {
			if (game.roundCount > 1 && !(game.roundHistory[game.roundCount - 2].winner === player)) {
				player.deck.draw(player.hand);
				await ui.notification("toussaint", 1200);
			}
			return false;
		}),
		activeAbility: false,
		abilityUses: 0,
		description: "Draw a card from your deck whenever you lose a round."
	},
	lyria_rivia: {
		name: "Lyria & Rivia",
		factionAbility: player => {
			let card = new Card("spe_lyria_rivia_morale", card_dict["spe_lyria_rivia_morale"], player);
			card.removed.push(() => setTimeout(() => card.holder.grave.removeCard(card), 2000));
			card.placed.push(async () => await ui.notification("lyria_rivia", 1200));
			player.endTurnAfterAbilityUse = false;
			ui.showPreviewVisuals(card);
			ui.enablePlayer(true);
			if (!(player.controller instanceof ControllerAI)) ui.setSelectable(card, true);
		},
		activeAbility: true,
		abilityUses: 1,
		description: "Once per game, apply a Morale Boost effect in the selected row (boost all units by 1 in this turn).",
		weight: (player) => {
			let units = player.getAllRowCards().concat(player.hand.cards).filter(c => c.isUnit()).filter(c => !c.abilities.includes("spy"));
			let rowStats = {
				"close": 0,
				"ranged": 0,
				"siege": 0,
				"agile": 0
			};
			units.forEach(c => {
				rowStats[c.row] += 1;
			});
			rowStats["close"] += rowStats["agile"];
			return Math.max(rowStats["close"], rowStats["ranged"], rowStats["siege"]);
		}
	},
	syndicate: {
		name: "Syndicate",
		factionAbility: player => game.gameStart.push(async () => {
			let card = new Card("sy_sigi_reuven", card_dict["sy_sigi_reuven"], player);
			await board.addCardToRow(card, card.row, card.holder);
		}),
		activeAbility: false,
		abilityUses: 0,
		description: "Starts the game with the Hero card Sigi Reuven on the board."
	},
	zerrikania: {
		name: "Zerrikania",
		factionAbility: player => game.roundStart.push(async () => {
			if (game.roundCount > 1 && !(game.roundHistory[game.roundCount - 2].winner === player)) {
				// Find all worshipper cards in the graveyard
				let worshippers = player.grave.findCards(c => c.isUnit() && c.abilities.includes("worshipper"));
				if (worshippers.length <= 0) return;
				
				let grave = player.grave;
				// Randomly select a worshipper
				let selectedWorshipper = worshippers[Math.floor(Math.random() * worshippers.length)];
				
				grave.removeCard(selectedWorshipper);
				grave.addCard(selectedWorshipper);
				await selectedWorshipper.animate("medic");
				await selectedWorshipper.autoplay(grave);
				await ui.notification("zerrikania", 1200);
			}
			return false;
		}),
		activeAbility: false,
		abilityUses: 0,
		description: "Restore a random worshipper from your discard pile onto the field whenever you lose a round."
	},
	ofir: {
		name: "Ofir",
		factionAbility: async player => {
			// Search deck for weather cards
			const weatherCards = player.deck.findCards(c => c.faction === "weather");
			
			if (weatherCards.length === 0) {
				await ui.notification("ofir", 1200);
				return; // No weather cards in deck
			}
			
			await ui.notification("ofir", 1200);
			
			if (player.controller instanceof ControllerAI) {
				// AI: Choose best weather card based on weight
				let bestCard = null;
				let bestWeight = -1;
				for (let card of weatherCards) {
					const weight = player.controller.weightWeather(card);
					if (weight > bestWeight) {
						bestWeight = weight;
						bestCard = card;
					}
				}
				if (bestCard) {
					player.deck.removeCard(bestCard);
					await board.toWeather(bestCard, player.deck);
				}
			} else {
				// Player: Let them choose from weather cards
				player.endTurnAfterAbilityUse = false;
				await ui.queueCarousel(player.deck, 1, async (container, index) => {
					const selectedCard = container.cards[index];
					if (selectedCard && selectedCard.faction === "weather") {
						container.removeCard(selectedCard);
						await board.toWeather(selectedCard, container);
					}
					player.endTurnAfterAbilityUse = true;
				}, c => c.faction === "weather", false, true, "Choose a weather card to play");
			}
		},
		activeAbility: true,
		abilityUses: 1,
		description: "Once per game, you may search your deck for a weather card and play it.",
		weight: (player) => {
			// Check if there are weather cards in deck
			const weatherCards = player.deck.findCards(c => c.faction === "weather");
			if (weatherCards.length === 0) return 0;
			
			// Find the best weather card value
			let bestWeight = -1;
			for (let card of weatherCards) {
				const weight = player.controller.weightWeather(card);
				if (weight > bestWeight) {
					bestWeight = weight;
				}
			}
			return Math.max(0, bestWeight);
		}
	}
}