"use strict"

var ability_dict = {
	clear: {
		name: "Clear Weather",
		description: "Removes all Weather Cards (Biting Frost, Impenetrable Fog and Torrential Rain) effects. "
	},
	frost: {
		name: "Biting Frost",
		description: "Sets the strength of all Close Combat cards to 1 for both players. "
	},
	fog: {
		name: "Impenetrable Fog",
		description: "Sets the strength of all Ranged Combat cards to 1 for both players. "
	},
	rain: {
		name: "Torrential Rain",
		description: "Sets the strength of all Siege Combat cards to 1 for both players. "
	},
	storm: {
		name: "Skellige Storm",
		description: "Reduces the Strength of all Range and Siege Units to 1. "
	},
	sandstorm: {
		name: "Sandstorm",
		description: "Reduces the Strength of all Close Combat and Ranged Combat Units to 1 (non-Hero units only). "
	},
	nightfall: {
		name: "Nightfall",
		description: "Affects all rows. When applied, triggers Hunger transformations on units with the Hunger ability. "
	},
	hero: {
		name: "Hero",
		description: "Not affected by any Special Cards or abilities. "
	},
	decoy: {
		name: "Decoy",
		description: "Swap with a card on the battlefield to return it to your hand. "
	},
	horn: {
		name: "Commander's Horn",
		description: "Doubles the strength of all unit cards in that row. Limited to 1 per row. ",
		placed: async card => await card.animate("horn")
	},
	redania_horn: {
		name: "Redanian Horn",
		description: "Doubles the strength of all unit cards in that row. Limited to 1 per row. ",
		placed: async card => await card.animate("horn")
	},
	redania_purge: {
		name: "Purge",
		description: "Discard after playing. Kills the strongest card(s) on the battlefield. ",
		activated: async card => {	
			await ability_dict["scorch"].placed(card);
			await board.toGrave(card, card.holder.hand);
		},
		placed: async (card, row) => {
			if (card.isLocked() || game.scorchCancelled) return;
			if (row !== undefined) row.cards.splice(row.cards.indexOf(card), 1);
			let maxUnits = board.row.map(r => [r, r.maxUnits()]).filter(p => p[1].length > 0).filter(p => !p[0].isShielded());
			if (row !== undefined) row.cards.push(card);
			let maxPower = maxUnits.reduce((a,p) => Math.max(a, p[1][0].power), 0);
			let scorched = maxUnits.filter(p => p[1][0].power === maxPower);
			let cards = scorched.reduce((a, p) => a.concat(p[1].map(u => [p[0], u])), []);
			await Promise.all(cards.map(async u => await u[1].animate("scorch", true, false)));
			await Promise.all(cards.map(async u => await board.toGrave(u[1], u[0])));
		}
	},
	mardroeme: {
		name: "Mardroeme",
		description: "Triggers transformation of all Berserker cards on the same row. ",
		placed: async (card, row) => {
			if (card.isLocked()) return;
			let berserkers = row.findCards(c => c.abilities.includes("berserker"));
			await Promise.all(berserkers.map(async c => await ability_dict["berserker"].placed(c, row)));
		}
	},
	berserker: {
		name: "Berserker",
		description: "Transforms into a bear when a Mardroeme card is on its row. ",
		placed: async (card, row) => {
			if (row.effects.mardroeme === 0 || card.isLocked()) return;
			row.removeCard(card);
			await row.addCard(new Card(card.target, card_dict[card.target], card.holder));
		}
	},
	scorch: {
		name: "Scorch",
		description: "Discard after playing. Kills the strongest card(s) on the battlefield. ",
		activated: async card => {	
			await ability_dict["scorch"].placed(card);
			await board.toGrave(card, card.holder.hand);
		},
		placed: async (card, row) => {
			if (card.isLocked() || game.scorchCancelled) return;
			if (row !== undefined) row.cards.splice(row.cards.indexOf(card), 1);
			let maxUnits = board.row.map(r => [r, r.maxUnits()]).filter(p => p[1].length > 0).filter(p => !p[0].isShielded());
			if (row !== undefined) row.cards.push(card);
			let maxPower = maxUnits.reduce((a,p) => Math.max(a, p[1][0].power), 0);
			let scorched = maxUnits.filter(p => p[1][0].power === maxPower);
			let cards = scorched.reduce((a, p) => a.concat(p[1].map(u => [p[0], u])), []);
			await Promise.all(cards.map(async u => await u[1].animate("scorch", true, false)));
			await Promise.all(cards.map(async u => await board.toGrave(u[1], u[0])));
		}
	},
	scorch_c: {
		name: "Scorch - Close Combat",
		description: "Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more. ",
		placed: async (card) => {
			// Trigger the row scorch effect (animation plays on target units, not the triggering card)
			await board.getRow(card, "close", card.holder.opponent()).scorch();
		}
	},
	scorch_r: {
		name: "Scorch - Ranged",
		description: "Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more. ",
		placed: async (card) => {
			// Trigger the row scorch effect (animation plays on target units, not the triggering card)
			await board.getRow(card, "ranged", card.holder.opponent()).scorch();
		}
	},
	scorch_s: {
		name: "Scorch - Siege",
		description: "Destroys your enemy's strongest Siege Combat unit(s) if the combined strength of all his or her Siege Combat units is 10 or more. ",
		placed: async (card) => {
			// Trigger the row scorch effect (animation plays on target units, not the triggering card)
			await board.getRow(card, "siege", card.holder.opponent()).scorch();
		}
	},
	any: {
		name:"Any", 
		description: "Can be placed in any row (Close Combat, Ranged Combat, or Siege). Cannot be moved once placed. "
	},
	melee_siege: {
		name:"Melee/Siege", 
		description: "Can be placed in either the Close Combat or Siege row. Cannot be moved once placed. "
	},
	ranged_siege: {
		name:"Ranged/Siege", 
		description: "Can be placed in either the Ranged Combat or Siege row. Cannot be moved once placed. "
	},
	muster: {
		name:"Muster", 
		description: "Find any cards with the same name in your deck and play them instantly. ",
		placed: async (card) => {
			if (card.isLocked()) return;
			
			// CRITICAL: Only muster if card has a valid, non-empty string target
			const cardTarget = card.target;
			if (!cardTarget || typeof cardTarget !== "string" || cardTarget.trim() === "") {
				return;
			}
			
			// Find all cards in hand and deck with the EXACT same target
			const units = [];
			
			// Check hand
			for (const c of card.holder.hand.cards) {
				if (c === card) continue; // Skip the exact same card instance
				const cTarget = c.target;
				if (cTarget && typeof cTarget === "string" && cTarget.trim() !== "" && cTarget === cardTarget) {
					units.push([card.holder.hand, c]);
				}
			}
			
			// Check deck
			for (const c of card.holder.deck.cards) {
				if (c === card) continue; // Skip the exact same card instance
				const cTarget = c.target;
				if (cTarget && typeof cTarget === "string" && cTarget.trim() !== "" && cTarget === cardTarget) {
					units.push([card.holder.deck, c]);
				}
			}
			
			if (units.length === 0) return;
			
			await card.animate("muster");
			if (card.row === "agile") {
				await Promise.all(units.map(async p => await board.addCardToRow(p[1], card.currentLocation, p[1].holder, p[0])));
			} else {
				await Promise.all(units.map(async p => await board.addCardToRow(p[1], p[1].row, p[1].holder, p[0])));
			}
		}
	},
	spy: {
		name: "Spy",
		description: "Place on your opponent's battlefield (counts towards your opponent's total) and draw 2 cards from your deck. ",
		placed: async (card) => {
			if (card.isLocked()) return;
			await card.animate("spy");
			for (let i = 0; i < 2; i++) {
				if (card.holder.deck.cards.length > 0) await card.holder.deck.draw(card.holder.hand);
			}
			const originalHolder = card.holder;
			card.holder = card.holder.opponent();
			
			// Check if the opponent (who received the spy) has novigrad_sigismund2 ability
			const opponent = card.holder;
			const hasSigismund2 = opponent.getAllRowCards().some(c => 
				c.abilities && c.abilities.includes("novigrad_sigismund2")
			);
			
			if (hasSigismund2 && opponent.deck.cards.length > 0) {
				await opponent.deck.draw(opponent.hand);
			}
		}
	},
	medic: {
		name: "Medic",
		description: "Choose one card from your discard pile and play it instantly (no Heroes or Special Cards). ",
		placed: async (card) => {
			if (card.isLocked() || (card.holder.grave.findCards(c => c.isUnit()) <= 0)) return;
			let grave = board.getRow(card, "grave", card.holder);
			let respawns = [];
			if (game.randomRespawn) {
				for (var i = 0; i < game.medicCount; i++) {
					if (card.holder.grave.findCards(c => c.isUnit()).length > 0) {
						let res = grave.findCardsRandom(c => c.isUnit())[0];
						grave.removeCard(res);
						grave.addCard(res);
						await res.animate("medic");
						await res.autoplay(grave);
					}
				}
				return;
			} else if (card.holder.controller instanceof ControllerAI) {
				for (var i = 0; i < game.medicCount; i++) {
					if (card.holder.grave.findCards(c => c.isUnit()).length > 0) {
						let res = card.holder.controller.medic(card, grave);
						grave.removeCard(res);
						grave.addCard(res);
						await res.animate("medic");
						await res.autoplay(grave);
					}
				}
				return;
			}
			await ui.queueCarousel(card.holder.grave, game.medicCount, (c, i) => respawns.push({ card: c.cards[i] }), c => c.isUnit(), true);
			await Promise.all(respawns.map(async wrapper => {
				let res = wrapper.card;
				grave.removeCard(res);
				grave.addCard(res);
				await res.animate("medic");
				await res.autoplay(grave);
			}));
		}
	},
	morale: {
		name: "Morale Boost",
		description: "Adds +1 to all units in the row (excluding itself). ",
		placed: async (card, row) => {
			if (card.isLocked()) return;
			// CRITICAL: Don't play morale animation if:
			// 1. We're mustering (game.isMustering is true)
			// 2. This card is being mustered (card.isMustered is true)
			// 3. This card has muster ability (muster animation will play instead)
			if (!game.isMustering && !card.isMustered && !card.abilities.includes("muster")) {
				// Animate all units in the row (excluding the morale card itself)
				if (row && row.cards) {
					const unitsToAnimate = row.cards.filter(c => c.isUnit() && c !== card);
					await Promise.all(unitsToAnimate.map(c => c.animate("morale")));
				}
			}
		}
	},
	bond: {
		name: "Tight Bond",
		description: "Place next to a card with the same name to double the strength of both cards. ",
		placed: async card => {
			if (card.isLocked()) return;
			let bonds = card.currentLocation.findCards(c => c.target === card.target).filter(c => c.abilities.includes("bond")).filter(c => !c.isLocked());
			if (bonds.length > 1) await Promise.all(bonds.map(c => c.animate("bond")));
		}
	},
	avenger: {
		name: "Avenger",
		description: "When this card is removed from the battlefield, it summons a powerful new Unit Card to take its place. ",
		removed: async (card) => {
			if (game.over || game.roundHistory.length > 2 || card.isLocked()) return;
			// Special case: Crow Messenger musters other Crow Messengers but avenges into Crowmother
			let avengerTarget = card.target;
			if (card.key === "sk_crow_messenger") {
				avengerTarget = "sk_crowmother";
			}
			
			// Helper function to determine the row for the avenged unit
			// Prefer the same row where the original card died (if valid), otherwise use target's row
			const getAvengerRow = (avengerCard, originalCard) => {
				const avengerRowDesignation = avengerCard.row;
				const originalRow = originalCard.currentLocation;
				
				// If original card died in a Row, check if that row is valid for the avenger
				if (originalRow instanceof Row) {
					const rowIndex = originalRow.getRowIndex();
					// Convert row index to row name
					// board.row[0] = siege (op), [1] = ranged (op), [2] = close (op)
					// board.row[3] = close (me), [4] = ranged (me), [5] = siege (me)
					let rowName;
					if (rowIndex === 0 || rowIndex === 5) rowName = "siege";
					else if (rowIndex === 1 || rowIndex === 4) rowName = "ranged";
					else if (rowIndex === 2 || rowIndex === 3) rowName = "close";
					else rowName = null;
					
					// Check if the avenger's row designation allows this row
					if (rowName) {
						if (avengerRowDesignation === "agile") {
							// Agile can be close or ranged
							if (rowName === "close" || rowName === "ranged") {
								return rowName;
							}
						} else if (avengerRowDesignation === "any") {
							// Any can be close, ranged, or siege
							if (rowName === "close" || rowName === "ranged" || rowName === "siege") {
								return rowName;
							}
						} else if (avengerRowDesignation === "melee_siege") {
							// Melee/Siege can be close or siege
							if (rowName === "close" || rowName === "siege") {
								return rowName;
							}
						} else if (avengerRowDesignation === "ranged_siege") {
							// Ranged/Siege can be ranged or siege
							if (rowName === "ranged" || rowName === "siege") {
								return rowName;
							}
						} else if (avengerRowDesignation === rowName) {
							// Exact match
							return rowName;
						}
					}
				}
				
				// Fallback: use target's row designation, with defaults for flexible rows
				if (avengerRowDesignation === "agile" || avengerRowDesignation === "any" || avengerRowDesignation === "melee_siege") {
					return "close";
				} else if (avengerRowDesignation === "ranged_siege") {
					return "ranged";
				}
				return avengerRowDesignation;
			};
			
			if (card_dict[avengerTarget]["ability"].includes("muster") && (card.holder.deck.findCards(c => c.key === avengerTarget).length === 0 && card.holder.hand.findCards(c => c.key === avengerTarget).length === 0)) {
				for (let i = 0; i < card_dict[avengerTarget]["count"]; i++) {
					let avenger = new Card(avengerTarget, card_dict[avengerTarget], card.holder);
					avenger.removed.push(() => setTimeout(() => avenger.holder.grave.removeCard(avenger), 2000));
					if (avengerTarget != card.key) {
						const targetRow = getAvengerRow(avenger, card);
						await board.addCardToRow(avenger, targetRow, card.holder);
					}
				}
			} else if (avengerTarget === card.key) await board.moveTo(card, card.row, card.holder.grave);
			else {
				let avenger;
				// Avenger bypasses embargo because it can create new cards from nothing
				// First check deck, then hand, then create new if not found
				if (card.holder.deck.findCards(c => c.key === avengerTarget).length) {
					avenger = card.holder.deck.findCard(c => c.key === avengerTarget);
					const targetRow = getAvengerRow(avenger, card);
					await board.moveTo(avenger, targetRow, card.holder.deck);
				} else if (card.holder.hand.findCards(c => c.key === avengerTarget).length) {
					avenger = card.holder.hand.findCard(c => c.key === avengerTarget);
					const targetRow = getAvengerRow(avenger, card);
					await board.moveTo(avenger, targetRow, card.holder.hand);
				} else {
					// Not found in deck or hand - create new card (bypasses embargo)
					avenger = new Card(avengerTarget, card_dict[avengerTarget], card.holder);
					const targetRow = getAvengerRow(avenger, card);
					await board.addCardToRow(avenger, targetRow, card.holder);
					if (avengerTarget != card.key) avenger.removed.push(() => setTimeout(() => avenger.holder.grave.removeCard(avenger), 2000));
				}
			}
		},
		weight: (card) => {
			if (game.roundHistory.length > 2) return 1;
			// Special case: Crow Messenger avenges into Crowmother
			let avengerTarget = card.target;
			if (card.key === "sk_crow_messenger") {
				avengerTarget = "sk_crowmother";
			}
			return Number(card_dict[avengerTarget]["strength"]);
		}
	},
	hunger: {
		name: "Hunger",
		description: "When Nightfall weather is applied to this card's row, transform this card into its target card. The Hunger card is discarded and the target card is played in its place.",
		weight: (card) => {
			if (!card.target || !card_dict[card.target]) return 1;
			// Weight based on the target card's strength, similar to avenger
			return Number(card_dict[card.target]["strength"]);
		}
	},
	cintra_slaughter: {
		name: "Slaughter of Cintra",
		description: "When using the Slaugther of Cintra special card, destroy all units on your side of the board having the Slaughter of Cintra ability then draw as many cards as units destroyed.",
		activated: async card => {
			// Play cintra sound effect when the ability is activated
			tocar("cintra", false);
			
			let targets = board.row.map(r => [r, r.findCards(c => c.abilities.includes("cintra_slaughter")).filter(c => c.holder === card.holder).filter(c => !c.isLocked())]);
			let cards = targets.reduce((a, p) => a.concat(p[1].map(u => [p[0], u])), []);
			let nb_draw = cards.length;
			await Promise.all(cards.map(async u => await u[1].animate("scorch", true, false)));
			await Promise.all(cards.map(async u => await board.toGrave(u[1], u[0])));
			await board.toGrave(card, card.holder.hand);
			for (let i = 0; i < nb_draw; i++) {
				if (card.holder.deck.cards.length > 0) await card.holder.deck.draw(card.holder.hand);
			}
		},
		weight: (card) => 30
	},
	foltest_king: {
		description: "Pick an Impenetrable Fog card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Impenetrable Fog");
			if (out) await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "fog")
	},
	foltest_lord: {
		description: "Clear any weather effects (resulting from Biting Frost, Torrential Rain or Impenetrable Fog cards) in play.",
		activated: async () => {
			tocar("clear", false);
			await weather.clearWeather()
		},
		weight: (card, ai) =>  ai.weightCard(card_dict["spe_clear"])
	},
	foltest_siegemaster: {
		description: "Doubles the strength of all your Siege units (unless a Commander's Horn is also present on that row).",
		activated: async card => await board.getRow(card, "siege", card.holder).leaderHorn(card),
		weight: (card, ai) => ai.weightHornRow(card, board.getRow(card, "siege", card.holder))
	},
	foltest_steelforged: {
		description: "Destroy your enemy's strongest Siege unit(s) if the combined strength of all his or her Siege units is 10 or more.",
		activated: async card => await ability_dict["scorch_s"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "siege")
	},
	foltest_son: {
		description: "Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more.",
		activated: async card => await ability_dict["scorch_r"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "ranged")
	},
	emhyr_imperial: {
		description: "Pick a Torrential Rain card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Torrential Rain");
			if (out) await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "rain")
	},
	emhyr_emperor: {
		description: "Look at 3 random cards from your opponent's hand.",
		activated: async card => {
			if (card.holder.controller instanceof ControllerAI) return;
			let container = new CardContainer();
			container.cards = card.holder.opponent().hand.findCardsRandom(() => true, 3);
			try {
				Carousel.curr.cancel();
			} catch (err) {}
			await ui.viewCardsInContainer(container);
		},
		weight: card => {
			let count = card.holder.opponent().hand.cards.length;
			return count === 0 ? 0 : Math.max(10, 10 * (8 - count));
		}
	},
	emhyr_whiteflame: {
		description: "Cancel your opponent's Leader Ability."
	},
	emhyr_relentless: {
		description: "Draw a card from your opponent's discard pile.",
		activated: async card => {
			let grave = board.getRow(card, "grave", card.holder.opponent());
			if (grave.findCards(c => c.isUnit()).length === 0) return;
			if (card.holder.controller instanceof ControllerAI) {
				let newCard = card.holder.controller.medic(card, grave);
				newCard.holder = card.holder;
				await board.toHand(newCard, grave);
				return;
			}
			try {
				Carousel.curr.cancel();
			} catch (err) {}
			await ui.queueCarousel(grave, 1, (c,i) => {
				let newCard = c.cards[i];
				newCard.holder = card.holder;
				board.toHand(newCard, grave);
			}, c => c.isUnit(), true);
		},
		weight: (card, ai, max, data) => ai.weightMedic(data, 0, card.holder.opponent())
	},
	emhyr_invader: {
		description: "Abilities that restore a unit to the battlefield restore a randomly-chosen unit. Affects both players.",
		gameStart: () => game.randomRespawn = true
	},
	eredin_commander: {
		description: "Double the strength of all your Close Combat units (unless a Commander's horn is 	also present on that row).",
		activated: async card => await board.getRow(card, "close", card.holder).leaderHorn(card),
		weight: (card, ai) => ai.weightHornRow(card, board.getRow(card, "close", card.holder))
	},
	eredin_bringer_of_death: {
		name: "Eredin : Bringer of Death",
		description: "Restore a card from your discard pile to your hand.",
		activated: async card => {
			let newCard;
			if (card.holder.controller instanceof ControllerAI) newCard = card.holder.controller.medic(card, card.holder.grave);
			else {
				try {
					Carousel.curr.exit();
				} catch (err) {}
				await ui.queueCarousel(card.holder.grave, 1, (c,i) => newCard = c.cards[i], c => c.isUnit(), false, false);
			}
			if (newCard) await board.toHand(newCard, card.holder.grave);
		},
		weight: (card, ai, max, data) => ai.weightMedic(data, 0, card.holder)
	},
	eredin_destroyer: {
		description: "Discard 2 cards and draw 1 card of your choice from your deck.",
		activated: async (card) => {
			let hand = board.getRow(card, "hand", card.holder);
			let deck = board.getRow(card, "deck", card.holder);
			if (card.holder.controller instanceof ControllerAI) {
				let cards = card.holder.controller.discardOrder(card).splice(0, 2).filter(c => c.basePower < 7);
				await Promise.all(cards.map(async c => await board.toGrave(c, card.holder.hand)));
				card.holder.deck.draw(card.holder.hand);
				return;
			} else {
				try {
					Carousel.curr.exit();
				} catch (err) {}
			}
			await ui.queueCarousel(hand, 2, (c,i) => board.toGrave(c.cards[i], c), () => true);
			await ui.queueCarousel(deck, 1, (c,i) => board.toHand(c.cards[i], deck), () => true, true);
		},
		weight: (card, ai) => {
			let cards = ai.discardOrder(card).splice(0,2).filter(c => c.basePower < 7);
			if (cards.length < 2) return 0;
			return cards[0].abilities.includes("muster") ? 50 : 25;
		}
	},
	eredin_king: {
		description: "Pick any weather card from your deck and play it instantly.",
		activated: async card => {
			let deck = board.getRow(card, "deck", card.holder);
			if (card.holder.controller instanceof ControllerAI) await ability_dict["eredin_king"].helper(card).card.autoplay(card.holder.deck);
			else {
				try {
					Carousel.curr.cancel();
				} catch (err) { }
				await ui.queueCarousel(deck, 1, (c,i) => board.toWeather(c.cards[i], deck), c => c.faction === "weather", true);
			}
		},
		weight: (card, ai, max) => ability_dict["eredin_king"].helper(card).weight,
		helper: card => {
			let weather = card.holder.deck.cards.filter(c => c.row === "weather").reduce((a,c) => a.map(c => c.name).includes(c.name) ? a : a.concat([c]), []);
			let out, weight = -1;
			weather.forEach(c => {
				let w = card.holder.controller.weightWeatherFromDeck(c, c.abilities[0]);
				if (w > weight) {
					weight = w;
					out = c;
				}
			});
			return {
				card: out,
				weight: weight
			};
		}
	},
	eredin_treacherous: {
		description: "Doubles the strength of all spy cards (affects both players).",
		gameStart: () => game.spyPowerMult = 2
	},
	francesca_queen: {
		description: "Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more.",
		activated: async card => await ability_dict["scorch_c"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "close")
	},
	francesca_beautiful: {
		description: "Doubles the strength of all your Ranged Combat units (unless a Commander's Horn is also present on that row).",
		activated: async card => await board.getRow(card, "ranged", card.holder).leaderHorn(card),
		weight: (card, ai) => ai.weightHornRow(card, board.getRow(card, "ranged", card.holder))
	},
	francesca_daisy: {
		description: "Draw an extra card at the beginning of the battle.",
		placed: card => game.gameStart.push(() => {
			let draw = card.holder.deck.removeCard(0);
			card.holder.hand.addCard(draw);
			return true;
		})
	},
	francesca_pureblood: {
		description: "Pick a Biting Frost card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Biting Frost");
			if (out) await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "frost")
	},
	francesca_hope: {
		description: "Move agile units to whichever valid row maximizes their strength (don't move units already in optimal row).",
		activated: async card => {
			let close = board.getRow(card, "close");
			let ranged =  board.getRow(card, "ranged");
			let cards = ability_dict["francesca_hope"].helper(card);
			await Promise.all(cards.map(async p => await board.moveTo(p.card, p.row === close ? ranged : close, p.row)));
		},
		weight: card => {
			let cards = ability_dict["francesca_hope"].helper(card);
			return cards.reduce((a,c) => a + c.weight, 0);
		},
		helper: card => {
			let close = board.getRow(card, "close");
			let ranged = board.getRow(card, "ranged");
			return validCards(close).concat(validCards(ranged));
			
			function validCards(cont) {
				return cont.findCards(c => c.row === "agile").filter(c => dif(c,cont) > 0).map(c => ({
					card:c, row:cont, weight:dif(c,cont)
				}))
			}
			
			function dif(card, source) {
				return (source === close ? ranged : close).calcCardScore(card) - card.power;
			}
		}
	},
	crach_an_craite: {
		description: "Shuffle all cards from each player's graveyard back into their decks.",
		activated: async card => {
			Promise.all(card.holder.grave.cards.map(c => board.toDeck(c, card.holder.grave)));
			await Promise.all(card.holder.opponent().grave.cards.map(c => board.toDeck(c, card.holder.opponent().grave)));
		},
		weight: (card, ai, max, data) => {
			if (game.roundCount < 2) return 0;
			let medics = card.holder.hand.findCard(c => c.abilities.includes("medic"));
			if (medics !== undefined) return 0;
			let spies = card.holder.hand.findCard(c => c.abilities.includes("spy"));
			if (spies !== undefined) return 0;
			if (card.holder.hand.findCard(c => c.abilities.includes("decoy")) !== undefined && (data.medic.length || data.spy.length && card.holder.deck.findCard(c => c.abilities.includes("medic")) !== undefined)) return 0;
			return 15;
		}
	},
	king_bran: {
		description: "Units only lose half their Strength in bad weather conditions.",
		placed: card => {
			for (var i = 0; i < board.row.length; i++) {
				if ((card.holder === player_me && i > 2) || (card.holder === player_op && i < 3)) board.row[i].halfWeather = true;
			}
		}
	},
	queen_calanthe: {
		description: "Play a unit then draw a card from you deck.",
		activated: async card => {
			let units = card.holder.hand.cards.filter(c => c.isUnit());
			if (units.length === 0) return;
			let wrapper = {
				card: null
			};
			if (card.holder.controller instanceof ControllerAI) wrapper.card = units[randomInt(units.length)];
			else await ui.queueCarousel(board.getRow(card, "hand", card.holder), 1, (c, i) => wrapper.card = c.cards[i], c => c.isUnit(), true);
			wrapper.card.autoplay();
			card.holder.hand.removeCard(wrapper.card);
			if (card.holder.deck.cards.length > 0) await card.holder.deck.draw(card.holder.hand);
		},
		weight: (card, ai) => {
			let units = card.holder.hand.cards.filter(c => c.isUnit());
			if (units.length === 0) return 0;
			return 15;
		}
	},
	fake_ciri: {
		description: "Discard a card from your hand and then draw two cards from your deck.",
		activated: async card => {
			if (card.holder.hand.cards.length === 0) return;
			let hand = board.getRow(card, "hand", card.holder);
			if (card.holder.controller instanceof ControllerAI) {
				let cards = card.holder.controller.discardOrder(card).splice(0, 1).filter(c => c.basePower < 7);
				await Promise.all(cards.map(async c => await board.toGrave(c, card.holder.hand)));
			} else {
				try {
					Carousel.curr.exit();
				} catch (err) {}
				await ui.queueCarousel(hand, 1, (c, i) => board.toGrave(c.cards[i], c), () => true);
			}
			for (let i = 0; i < 2; i++) {
				if (card.holder.deck.cards.length > 0) await card.holder.deck.draw(card.holder.hand);
			}
		},
		weight: (card, ai) => {
			if (card.holder.hand.cards.length === 0) return 0;
			return 15;
		}
	},
	radovid_stern: {
		description: "Discard 2 cards and draw 1 card of your choice from your deck.",
		activated: async (card) => {
			let hand = board.getRow(card, "hand", card.holder);
			let deck = board.getRow(card, "deck", card.holder);
			if (card.holder.controller instanceof ControllerAI) {
				let cards = card.holder.controller.discardOrder(card).splice(0, 2).filter(c => c.basePower < 7);
				await Promise.all(cards.map(async c => await board.toGrave(c, card.holder.hand)));
				card.holder.deck.draw(card.holder.hand);
				return;
			} else {
				try {
					Carousel.curr.exit();
				} catch (err) {}
			}
			await ui.queueCarousel(hand, 2, (c, i) => board.toGrave(c.cards[i], c), () => true);
			await ui.queueCarousel(deck, 1, (c, i) => board.toHand(c.cards[i], deck), () => true, true);
		},
		weight: (card, ai) => {
			let cards = ai.discardOrder(card).splice(0, 2).filter(c => c.basePower < 7);
			if (cards.length < 2) return 0;
			return cards[0].abilities.includes("muster") ? 50 : 25;
		}
	},
	radovid_ruthless: {
		description: "Cancel the scorch ability for one round",
		activated: async card => {
			game.scorchCancelled = true;
			await ui.notification("north-scorch-cancelled", 1200);
			game.roundStart.push(async () => {
				game.scorchCancelled = false;
				return true;
			});
		},
		weight: (card, ai, max) => {
			// If scorch is already cancelled, no point using this
			if (game.scorchCancelled) return 0;
			
			// Calculate how vulnerable the player's units are to scorch
			let vulnerableValue = 0;
			const playerRows = ai.player.getAllRows();
			
			// First, check for global scorch vulnerability (strongest units across all rows)
			// Get all player units from non-shielded rows
			const allPlayerUnits = [];
			playerRows.forEach(row => {
				if (!row.isShielded()) {
					allPlayerUnits.push(...row.cards.filter(c => c.isUnit()));
				}
			});
			
			if (allPlayerUnits.length > 0) {
				const maxPower = Math.max(...allPlayerUnits.map(c => c.power));
				// Check if player has the globally strongest units
				const opponentRows = ai.player.opponent().getAllRows();
				const allOpponentUnits = opponentRows.filter(r => !r.isShielded())
					.reduce((acc, row) => acc.concat(row.cards.filter(c => c.isUnit())), []);
				
				if (allOpponentUnits.length === 0 || Math.max(...allOpponentUnits.map(c => c.power), 0) <= maxPower) {
					// Player has the strongest units - vulnerable to global scorch
					const globalScorchTargets = allPlayerUnits.filter(c => c.power === maxPower);
					const globalLoss = globalScorchTargets.reduce((sum, c) => sum + c.power, 0);
					vulnerableValue += globalLoss;
				}
			}
			
			// Also check for row-specific scorch vulnerability (scorch_c, scorch_r, scorch_s)
			playerRows.forEach(row => {
				// Row-specific scorch only works if row total >= 10 and row is not shielded
				if (row.total >= 10 && !row.isShielded()) {
					const units = row.cards.filter(c => c.isUnit());
					if (units.length > 0) {
						const maxPower = Math.max(...units.map(c => c.power));
						const scorchTargets = units.filter(c => c.power === maxPower);
						const rowLoss = scorchTargets.reduce((sum, c) => sum + c.power, 0);
						vulnerableValue += rowLoss * 0.5; // Row-specific scorches are less common, weight them less
					}
				}
			});
			
			// If no vulnerable units, weight is low
			if (vulnerableValue === 0) return 0;
			
			// Weight is proportional to the potential loss
			// Higher value = more important to protect
			// Cap it at a reasonable maximum to avoid overvaluing
			return Math.min(Math.floor(vulnerableValue), 50);
		}
	},
	vilgefortz_magician_kovir: {
		description: "Halves the strength of all spy cards (affects both players).",
		gameStart: () => game.spyPowerMult = 0.5
	},
	redania_radovid_kingofredania: {
		description: "Draw 2 cards from your deck, play one and discard the other.",
		activated: async (card) => {
			const player = card.holder;
			const deck = board.getRow(card, "deck", player);
			if (player.controller instanceof ControllerAI) {
				// AI: Draw 2, play best, discard worst
				const drawn = [];
				for (let i = 0; i < 2 && deck.cards.length > 0; i++) {
					const c = deck.cards[0];
					deck.removeCard(c);
					drawn.push(c);
				}
				if (drawn.length === 0) return;
				// Play best card
				drawn.sort((a, b) => player.controller.weightCard(b, player.controller.getMaximums(), player.controller.getBoardData()) - player.controller.weightCard(a, player.controller.getMaximums(), player.controller.getBoardData()));
				await player.playCard(drawn[0]);
				// Discard the other
				if (drawn.length > 1) {
					await board.toGrave(drawn[1], player.hand);
				}
			} else {
				// Player: Draw 2, let them choose
				const drawn = [];
				for (let i = 0; i < 2 && deck.cards.length > 0; i++) {
					const c = deck.cards[0];
					deck.removeCard(c);
					player.hand.addCard(c);
					drawn.push(c);
				}
				if (drawn.length === 0) return;
				// Let player choose which to play, which to discard
				await ui.queueCarousel(player.hand, 1, async (c, i) => {
					const selected = c.cards[i];
					player.hand.removeCard(selected);
					await player.playCard(selected);
					// Discard the other
					const other = drawn.find(c => c !== selected);
					if (other) {
						player.hand.removeCard(other);
						await board.toGrave(other, player.hand);
					}
				}, c => drawn.includes(c), true);
			}
		},
		weight: (card, ai, max) => {
			// Good if we have cards in deck
			return Math.min(ai.player.deck.cards.length * 5, 40);
		}
	},
	redania_radovid_thestrategist: {
		description: "Choose one hero card on your battlefield, put it into your hand.",
		activated: async (card) => {
			const player = card.holder;
			const heroes = player.getAllRowCards().filter(c => c.hero);
			if (heroes.length === 0) return;
			if (player.controller instanceof ControllerAI) {
				// AI: Return weakest hero
				const weakest = heroes.sort((a, b) => a.power - b.power)[0];
				await board.toHand(weakest, weakest.currentLocation);
			} else {
				// Player: Choose hero
				const container = new CardContainer();
				container.cards = heroes;
				await ui.queueCarousel(container, 1, async (c, i) => {
					await board.toHand(c.cards[i], c.cards[i].currentLocation);
				}, () => true, true);
			}
		},
		weight: (card, ai, max) => {
			const heroes = ai.player.getAllRowCards().filter(c => c.hero);
			if (heroes.length === 0) return 0;
			// Value based on weakest hero (can replay it)
			const weakest = heroes.sort((a, b) => a.power - b.power)[0];
			return weakest.power * 2;
		}
	},
	redania_radovid_themystic: {
		description: "Your opponent must discard one card of their choosing and draw another one from their deck.",
		activated: async (card) => {
			const opponent = card.holder.opponent();
			const hand = board.getRow(card, "hand", opponent);
			const deck = board.getRow(card, "deck", opponent);
			if (hand.cards.length === 0) return;
			if (opponent.controller instanceof ControllerAI) {
				// AI opponent: Discard worst card
				const worst = hand.cards.sort((a, b) => opponent.controller.weightCard(a, opponent.controller.getMaximums(), opponent.controller.getBoardData()) - opponent.controller.weightCard(b, opponent.controller.getMaximums(), opponent.controller.getBoardData()))[0];
				await board.toGrave(worst, hand);
				if (deck.cards.length > 0) {
					deck.draw(hand);
				}
			} else {
				// Human opponent: Choose card to discard
				await ui.queueCarousel(hand, 1, async (c, i) => {
					await board.toGrave(c.cards[i], c);
					if (deck.cards.length > 0) {
						deck.draw(hand);
					}
				}, () => true);
			}
		},
		weight: (card, ai, max) => {
			const opponent = ai.player.opponent();
			if (opponent.hand.cards.length === 0) return 0;
			// Disrupt opponent's hand
			return 15;
		}
	},
	redania_radovid_thestern: {
		description: "Destroy one unit (non hero) card on your side of the battlefield. That card's power total is permanently added to your total score this round.",
		activated: async (card) => {
			const player = card.holder;
			const units = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			if (units.length === 0) return;
			if (player.controller instanceof ControllerAI) {
				// AI: Destroy weakest unit for points
				const weakest = units.sort((a, b) => a.power - b.power)[0];
				const power = weakest.power;
				await board.toGrave(weakest, weakest.currentLocation);
				player.total += power;
				player.updateScore();
			} else {
				// Player: Choose unit
				const container = new CardContainer();
				container.cards = units;
				await ui.queueCarousel(container, 1, async (c, i) => {
					const selected = c.cards[i];
					const power = selected.power;
					await board.toGrave(selected, selected.currentLocation);
					player.total += power;
					player.updateScore();
				}, () => true, true);
			}
		},
		weight: (card, ai, max) => {
			const units = ai.player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			if (units.length === 0) return 0;
			// Value based on weakest unit's power (sacrifice for points)
			const weakest = units.sort((a, b) => a.power - b.power)[0];
			return weakest.power;
		}
	},
	redania_radovid_themadking: {
		description: "Destroy your strongest card, and your opponent's strongest card. (Both nonhero)",
		activated: async (card) => {
			const player = card.holder;
			const opponent = player.opponent();
			const myUnits = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			const oppUnits = opponent.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			
			if (myUnits.length > 0) {
				const maxPower = Math.max(...myUnits.map(c => c.power));
				const strongest = myUnits.filter(c => c.power === maxPower)[0];
				await strongest.animate("scorch", true, false);
				await board.toGrave(strongest, strongest.currentLocation);
			}
			
			if (oppUnits.length > 0) {
				const maxPower = Math.max(...oppUnits.map(c => c.power));
				const strongest = oppUnits.filter(c => c.power === maxPower)[0];
				await strongest.animate("scorch", true, false);
				await board.toGrave(strongest, strongest.currentLocation);
			}
		},
		weight: (card, ai, max) => {
			const player = ai.player;
			const opponent = player.opponent();
			const myUnits = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			const oppUnits = opponent.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			
			if (myUnits.length === 0 || oppUnits.length === 0) return 0;
			
			const myMax = Math.max(...myUnits.map(c => c.power));
			const oppMax = Math.max(...oppUnits.map(c => c.power));
			
			// Good if opponent's strongest is stronger than ours
			if (oppMax > myMax) {
				return (oppMax - myMax) * 2;
			}
			return 0;
		}
	},
	cosimo_malaspina: {
		description: "Once per game, add +2 strength to a random unit on your board until the end of the round. This unit also cannot be brought below 2 strength.",
		activated: async (card, player) => {
			// Get all units on the player's board
			const units = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			
			if (units.length === 0) {
				// No units to boost
				return;
			}
			
			// Select a random unit
			const randomIndex = Math.floor(Math.random() * units.length);
			const targetUnit = units[randomIndex];
			
			// Store original setPower function and base power
			const originalSetPower = targetUnit.setPower.bind(targetUnit);
			const originalBasePower = targetUnit.basePower;
			const powerBeforeBoost = targetUnit.power;
			
			// Set minimum power to 2
			targetUnit.cosimoMinPower = 2;
			targetUnit.cosimoBoosted = true;
			
			// Override setPower to enforce minimum
			targetUnit.setPower = function(n) {
				// Ensure power never goes below 2
				if (this.cosimoMinPower !== undefined && n < this.cosimoMinPower) {
					n = this.cosimoMinPower;
				}
				return originalSetPower(n);
			};
			
			// Boost by +2
			targetUnit.setPower(powerBeforeBoost + 2);
			
			// Update row total if unit is on a row
			if (targetUnit.currentLocation && typeof targetUnit.currentLocation.updateTotal === 'function') {
				targetUnit.currentLocation.updateTotal(2);
			}
			
			// Store reference for cleanup
			player.cosimoBoostedUnit = targetUnit;
			
			// Reset at end of round
			game.roundEnd.push(async () => {
				if (player.cosimoBoostedUnit && player.cosimoBoostedUnit === targetUnit && targetUnit.cosimoBoosted) {
					// Restore original setPower
					targetUnit.setPower = originalSetPower;
					
					// Remove minimum power protection
					delete targetUnit.cosimoMinPower;
					delete targetUnit.cosimoBoosted;
					
					// Remove the +2 boost
					if (targetUnit.currentLocation && typeof targetUnit.currentLocation.updateTotal === 'function') {
						const currentPower = targetUnit.power;
						// Calculate how much to reduce (should be 2, but be safe)
						const powerToReduce = Math.min(2, currentPower - powerBeforeBoost);
						if (powerToReduce > 0) {
							targetUnit.setPower(currentPower - powerToReduce);
							targetUnit.currentLocation.updateTotal(-powerToReduce);
						}
					}
					
					// Clear reference
					player.cosimoBoostedUnit = null;
				}
				return true; // Remove this hook after execution
			});
		},
		weight: (card, ai, max) => {
			const player = ai.player;
			const units = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			
			if (units.length === 0) return 0;
			
			// Value is based on having units to boost
			// More valuable if we have strong units that would benefit from +2 and protection
			const avgPower = units.reduce((sum, c) => sum + c.power, 0) / units.length;
			return Math.max(10, avgPower * 0.5);
		}
	},
	resilience: {
		name: "Resilience",
		description: "Remains on the board for the following round if another unit on your side of the board had an ability in common.",
		placed: async card => {
			game.roundEnd.push(async () => {
				if (card.isLocked()) return;
				let units = card.holder.getAllRowCards().filter(c => c.abilities.includes(card.abilities.at(-1)));
				if (units.length < 2) return;
				card.noRemove = true;
				await card.animate("resilience");
				game.roundStart.push(async () => {
					delete card.noRemove;
					let school = card.abilities.at(-1);
					if (!card.holder.effects["witchers"][school]) card.holder.effects["witchers"][school] = 0;
					card.holder.effects["witchers"][school]++;
					return true;
				});
			});
		}
	},
	witcher_wolf_school: {
		name: "Wolf School of Witchers",
		description: "Each unit of this witcher school is boosted by 2 for each card of this given school.",
		placed: async card => {
			let school = card.abilities.at(-1);
			if (!card.holder.effects["witchers"][school]) card.holder.effects["witchers"][school] = 0;
			card.holder.effects["witchers"][school]++;
		},
		removed: async card => {
			let school = card.abilities.at(-1);
			card.holder.effects["witchers"][school]--;
		}
	},
	witcher_viper_school: {
		name: "Viper School of Witchers",
		description: "Each unit of this witcher school is boosted by 2 for each card of this given school.",
		placed: async card => {
			let school = card.abilities.at(-1);
			if (!card.holder.effects["witchers"][school]) card.holder.effects["witchers"][school] = 0;
			card.holder.effects["witchers"][school]++;
		},
		removed: async card => {
			let school = card.abilities.at(-1);
			card.holder.effects["witchers"][school]--;
		}
	},
	witcher_bear_school: {
		name: "Bear School of Witchers",
		description: "Each unit of this witcher school is boosted by 2 for each card of this given school.",
		placed: async card => {
			let school = card.abilities.at(-1);
			if (!card.holder.effects["witchers"][school]) card.holder.effects["witchers"][school] = 0;
			card.holder.effects["witchers"][school]++;
		},
		removed: async card => {
			let school = card.abilities.at(-1);
			card.holder.effects["witchers"][school]--;
		}
	},
	witcher_cat_school: {
		name: "Cat School of Witchers",
		description: "Each unit of this witcher school is boosted by 2 for each card of this given school.",
		placed: async card => {
			let school = card.abilities.at(-1);
			if (!card.holder.effects["witchers"][school]) card.holder.effects["witchers"][school] = 0;
			card.holder.effects["witchers"][school]++;
		},
		removed: async card => {
			let school = card.abilities.at(-1);
			card.holder.effects["witchers"][school]--;
		}
	},
	witcher_griffin_school: {
		name: "Griffin School of Witchers",
		description: "Each unit of this witcher school is boosted by 2 for each card of this given school.",
		placed: async card => {
			let school = card.abilities.at(-1);
			if (!card.holder.effects["witchers"][school]) card.holder.effects["witchers"][school] = 0;
			card.holder.effects["witchers"][school]++;
		},
		removed: async card => {
			let school = card.abilities.at(-1);
			card.holder.effects["witchers"][school]--;
		}
	},
	shield: {
		name: "Shield",
		description: "Protects units in the row from all abilities except weather effects.",
		weight: (card) => 30
	},
	seize: {
		name: "Seize",
		description: "Move the Melee unit(s) with the lowest strength on your side of the board/ Their abilities won't work anymore.",
		activated: async card => {
			let opCloseRow = board.getRow(card, "close", card.holder.opponent());
			let meCloseRow = board.getRow(card, "close", card.holder);
			if (opCloseRow.isShielded()) return;
			let units = opCloseRow.minUnits();
			if (units.length === 0) return;
			await Promise.all(units.map(async c => await c.animate("seize")));
			units.forEach(async c => {
				c.holder = card.holder;
				await board.moveToNoEffects(c, meCloseRow, opCloseRow);
			});
			await board.toGrave(card, card.holder.hand);
		},
		weight: (card) => {
			if (card.holder.opponent().getAllRows()[0].isShielded()) return 0;
			return card.holder.opponent().getAllRows()[0].minUnits().reduce((a, c) => a + c.power, 0) * 2
		}
	},
	lock: {
		name: "Lock",
		description: "Lock/cancels the ability of the next unit played in that row (ignores units without abilities and heroes).",
		weight: (card, ai, max) => {
			// Never play shackles if opponent has passed
			if (ai && ai.player && ai.player.opponent() && ai.player.opponent().passed) {
				return 0;
			}
			return 20;
		}
	},
	sign_aard: {
		name: "Sign: Aard",
		description: "Pushes all units of the selected row (Melee or Ranged) or row back towards the Siege row, ignores shields.",
		activated: async (card, row) => {
			let units = row.findCards(c => c.isUnit());
			if (units.length > 0) {
				let targetRow;
				for (var i = 0; i < board.row.length; i++) {
					if (board.row[i] === row) {
						if (i < 3) targetRow = board.row[Math.max(0, i - 1)];
						else targetRow = board.row[Math.min(5, i + 1)];
					}
				}
				await Promise.all(units.map(async c => await c.animate("aard")));
				units.map(async c => {
					if (c.abilities.includes("bond") || c.abilities.includes("morale") || c.abilities.includes("horn")) await board.moveTo(c, targetRow, row);
					else await board.moveToNoEffects(c, targetRow, row);
				});
			}
			await board.toGrave(card, card.holder.hand);
		},
		weight: (card) => {
			if (board.getRow(card, "close", card.holder.opponent()).cards.length + board.getRow(card, "ranged", card.holder.opponent()).cards.length === 0) return 0;
			let score = 0;
			if (board.getRow(card, "close", card.holder.opponent()).cards.length > 0 && (
					board.getRow(card, "close", card.holder.opponent()).effects.horn > 0 ||
					board.getRow(card, "ranged", card.holder.opponent()).effects.weather ||
					Object.keys(board.getRow(card, "close", card.holder.opponent()).effects.bond).length > 1 ||
					board.getRow(card, "close", card.holder.opponent()).isShielded()
				)
			) score = Math.floor(board.getRow(card, "close", card.holder.opponent()).cards.filter(c => c.isUnit()).reduce((a, c) => a + c.power, 0) * 0.5);
			if (board.getRow(card, "ranged", card.holder.opponent()).cards.length > 0 && (
					board.getRow(card, "ranged", card.holder.opponent()).effects.horn > 0 ||
					board.getRow(card, "siege", card.holder.opponent()).effects.weather ||
					Object.keys(board.getRow(card, "ranged", card.holder.opponent()).effects.bond).length > 1 ||
					board.getRow(card, "ranged", card.holder.opponent()).isShielded()
				)
			) score = Math.floor(board.getRow(card, "close", card.holder.opponent()).cards.filter(c => c.isUnit()).reduce((a, c) => a + c.power, 0) * 0.5);
			return Math.max(1, score);
		}
	},
	alzur_maker: {
		description: "Destroy one of your units on the board and summon a Koshchey.",
		activated: (card, player) => {
			player.endTurnAfterAbilityUse = false;
			ui.showPreviewVisuals(card);
			ui.enablePlayer(true);
			if(!(player.controller instanceof ControllerAI)) ui.setSelectable(card, true);
		},
		target: "wu_koshchey",
		weight: (card, ai, max) => {
			if (ai.player.getAllRowCards().filter(c => c.isUnit()).length === 0) return 0;
			return ai.weightScorchRow(card, max, "close");
		}
	},
	vilgefortz_sorcerer: {
		description: "Clear all weather effects in play.",
		activated: async () => {
			tocar("clear", false);
			await weather.clearWeather()
		},
		weight: (card, ai) => ai.weightCard(card_dict["spe_clear"])
	},
	anna_henrietta_duchess: {
		description: "Destroy one Commander's Horn in any opponent's row of your choice.",
		activated: (card, player) => {
			player.endTurnAfterAbilityUse = false;
			ui.showPreviewVisuals(card);
			ui.enablePlayer(true);
			if (!(player.controller instanceof ControllerAI)) ui.setSelectable(card, true);
		},
		weight: (card, ai) => {
			let horns = card.holder.opponent().getAllRows().filter(r => r.special.findCards(c => c.abilities.includes("horn")).length > 0).sort((a, b) => b.total - a.total);
			if (horns.length === 0) return 0;
			return horns[0].total;
		}
	},
	toussaint_wine: {
		name: "Toussaint Wine",
		description: "Placed on Melee or Ranged row, boosts all units of the selected row by two. Limited to one per row.",
		placed: async card => {
			tocar("wine", false); // Play wine sound effect
			await card.animate("wine");
		}
	},
	wine: {
		name: "Toussaint Wine",
		description: "Placed on Melee or Ranged row, boosts all units of the selected row by two. Limited to one per row.",
		placed: async card => {
			tocar("wine", false); // Play wine sound effect
			await card.animate("wine");
		}
	},
	anna_henrietta_ladyship: {
		description: "Restore a unit from your discard pile and play it immediatly.",
		activated: async card => {
			let newCard;
			if (card.holder.controller instanceof ControllerAI) newCard = card.holder.controller.medic(card, card.holder.grave);
			else {
				try {
					Carousel.curr.exit();
				} catch (err) {}
				await ui.queueCarousel(card.holder.grave, 1, (c, i) => newCard = c.cards[i], c => c.isUnit(), false, false);
			}
			if (newCard) await newCard.autoplay(card.holder.grave);
		},
		weight: (card, ai, max, data) => ai.weightMedic(data, 0, card.holder)
	},
	anna_henrietta_grace: {
		description: "Cancel Decoy ability for one round.",
		activated: async card => {
			game.decoyCancelled = true;
			await ui.notification("toussaint-decoy-cancelled", 1200);
			game.roundStart.push(async () => {
				game.decoyCancelled = false;
				return true;
			});
		},
		weight: (card) => game.decoyCancelled ? 0 : 10
	},
	meve_princess: {
		description: "If an opponent has 4 or more cards in one row, destroy one of them.",
		activated: async (card, player) => {
			const opponent = player.opponent();
			
			// Get opponent's rows (indices 3-5 for opponent)
			const opponentRows = [];
			for (let i = 0; i < 3; i++) {
				const rowIndex = player === player_me ? 3 + i : i;
				const row = board.row[rowIndex];
				// Count non-special cards (units and special cards that count as cards)
				const cardCount = row.cards.filter(c => c.isUnit() || (c.isSpecial() && c.faction !== "weather")).length;
				if (cardCount >= 4) {
					opponentRows.push(row);
				}
			}
			
			// If no rows have 4+ cards, ability does nothing
			if (opponentRows.length === 0) {
				await ui.notification("meve_princess_no_target", 1200);
				return;
			}
			
			// If multiple rows qualify, randomly pick one
			const targetRow = opponentRows[randomInt(opponentRows.length)];
			
			// Get all destroyable cards in that row (non-hero units and special cards)
			const destroyableCards = targetRow.cards.filter(c => 
				(c.isUnit() && !c.hero) || (c.isSpecial() && c.faction !== "weather")
			);
			
			if (destroyableCards.length === 0) {
				await ui.notification("meve_princess_no_target", 1200);
				return;
			}
			
			// Randomly pick one card to destroy
			const targetCard = destroyableCards[randomInt(destroyableCards.length)];
			
			// Animate and destroy the card
			await targetCard.animate("scorch", true, false);
			await board.toGrave(targetCard, targetRow);
			board.updateScores();
		},
		weight: (card, ai, max) => {
			const opponent = ai.player.opponent();
			let bestValue = 0;
			
			// Check all opponent rows for 4+ cards
			for (let i = 0; i < 3; i++) {
				const rowIndex = ai.player === player_me ? 3 + i : i;
				const row = board.row[rowIndex];
				const cardCount = row.cards.filter(c => c.isUnit() || (c.isSpecial() && c.faction !== "weather")).length;
				
				if (cardCount >= 4) {
					// Value is based on average card power in that row
					const destroyableCards = row.cards.filter(c => 
						(c.isUnit() && !c.hero) || (c.isSpecial() && c.faction !== "weather")
					);
					if (destroyableCards.length > 0) {
						const avgPower = destroyableCards.reduce((sum, c) => sum + (c.power || 0), 0) / destroyableCards.length;
						bestValue = Math.max(bestValue, avgPower * 2); // Weight based on potential value destroyed
					}
				}
			}
			
			return bestValue;
		}
	},
	shield_c: {
		name: "Melee Shield",
		description: "Protects units in the Melee row from all abilities except weather effects.",
		weight: (card) => 20
	},
	shield_r: {
		name: "Ranged Shield",
		description: "Protects units in the Ranged row from all abilities except weather effects.",
		weight: (card) => 20
	},
	shield_s: {
		name: "Siege Shield",
		description: "Protects units in the Siege row from all abilities except weather effects.",
		weight: (card) => 20
	},
	meve_white_queen: {
		description: "All medic cards can choose two unit cards from the discard pile (affects both players).",
		gameStart: () => game.medicCount = 2
	},
	meve_resolute: {
		description: "Once per game, boost the power of all allied units on the battlefield by +1 until the end of the round.",
		activated: async (card, player) => {
			// Get all units currently on the battlefield (not in hand)
			const unitsToBoost = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			
			if (unitsToBoost.length === 0) {
				// No units to boost, but ability is still used
				return;
			}
			
			// Initialize tracking if needed
			if (!player.meveResoluteBoosted) {
				player.meveResoluteBoosted = [];
			}
			
			// Boost each unit by +1
			for (const unit of unitsToBoost) {
				const currentPower = unit.power;
				unit.setPower(currentPower + 1);
				player.meveResoluteBoosted.push(unit);
				
				// Update the row total
				if (unit.currentLocation instanceof Row) {
					const row = unit.currentLocation;
					const oldTotal = row.total;
					row.updateTotal(1);
				}
			}
			
			// Add roundEnd hook to reset the boost
			game.roundEnd.push(async () => {
				if (player.meveResoluteBoosted && player.meveResoluteBoosted.length > 0) {
					// Create a copy of the array to avoid issues if units are removed during iteration
					const boostedUnits = [...player.meveResoluteBoosted];
					for (const unit of boostedUnits) {
						// Check if unit still exists and is on the battlefield
						if (unit && unit.currentLocation instanceof Row) {
							const currentPower = unit.power;
							// Only reduce if power is still boosted (safety check)
							if (currentPower > unit.basePower) {
								unit.setPower(currentPower - 1);
								
								// Update the row total
								const row = unit.currentLocation;
								row.updateTotal(-1);
							}
						}
					}
					player.meveResoluteBoosted = [];
				}
				return true; // Remove this hook after execution
			});
		},
		weight: (card, ai, max) => {
			const player = ai.player;
			const unitsOnField = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			const unitCount = unitsOnField.length;
			
			if (unitCount === 0) {
				return 0; // No units to boost, not worth using
			}
			
			// Base value: +1 per unit
			let value = unitCount;
			
			// Bonus if we're behind or in a close game
			const scoreDiff = player.opponent().total - player.total;
			if (scoreDiff > 0) {
				value += Math.min(scoreDiff, 10); // Extra value if behind
			}
			
			// Bonus if opponent has passed (we can secure the round)
			if (player.opponent().passed) {
				value += 5;
			}
			
			// Penalty if we're way ahead (save for later rounds)
			if (scoreDiff < -15) {
				value -= 5;
			}
			
			// Higher value in later rounds (round 2 or 3)
			if (game.roundCount >= 2) {
				value += 3;
			}
			
			return Math.max(1, Math.min(value, 30));
		}
	},
	carlo_varese: {
		description: "If the opponent has a total of 10 or higher on one row, destroy that row's strongest card(s) (affects only the opponent's side of the battle field).",
		activated: async (card, player) => {
			player.endTurnAfterAbilityUse = false;
			ui.showPreviewVisuals(card);
			ui.enablePlayer(true);
			if (!(player.controller instanceof ControllerAI)) ui.setSelectable(card, true);
		},
		weight: (card, ai, max) => {
			return Math.max(ai.weightScorchRow(card, max, "close"), ai.weightScorchRow(card, max, "ranged"), ai.weightScorchRow(card, max, "siege"));
		}
	},
	francis_bedlam: {
		description: "Send all spy unit cards to the grave of the side they are on.",
		activated: async (card, player) => {
			let op_spies = card.holder.opponent().getAllRowCards().filter(c => c.isUnit() && c.abilities.includes("spy"));
			let me_spies = card.holder.getAllRowCards().filter(c => c.isUnit() && c.abilities.includes("spy"));
			await op_spies.map(async c => await board.toGrave(c, c.currentLocation));
			await me_spies.map(async c => await board.toGrave(c, c.currentLocation));
		},
		weight: (card, ai, max) => {
			let op_spies = card.holder.opponent().getAllRowCards().filter(c => c.isUnit() && c.abilities.includes("spy")).reduce((a,c) => a + c.power,0);
			let me_spies = card.holder.getAllRowCards().filter(c => c.isUnit() && c.abilities.includes("spy")).reduce((a, c) => a + c.power,0);
			return Math.max(0, op_spies - me_spies);
		}
	},
	cyprian_wiley: {
		description: "Seize the unit(s) with the lowest strength of the opponents melee row.",
		activated: async card => {
			let opCloseRow = board.getRow(card, "close", card.holder.opponent());
			let meCloseRow = board.getRow(card, "close", card.holder);
			if (opCloseRow.isShielded()) return;
			let units = opCloseRow.minUnits();
			if (units.length === 0) return;
			await Promise.all(units.map(async c => await c.animate("seize")));
			units.forEach(async c => {
				c.holder = card.holder;
				await board.moveToNoEffects(c, meCloseRow, opCloseRow);
			});
		},
		weight: (card) => {
			if (card.holder.opponent().getAllRows()[0].isShielded()) return 0;
			return card.holder.opponent().getAllRows()[0].minUnits().reduce((a, c) => a + c.power, 0) * 2
		}
	},
	gudrun_bjornsdottir: {
		description: "Summon Flyndr's Crew",
		activated: async (card, player) => {
			let new_card = new Card("sy_flyndr_crew", card_dict["sy_flyndr_crew"], player);
			await board.addCardToRow(new_card, new_card.row, card.holder);
		},
		weight: (card, ai, max) => {
			return card.holder.getAllRows()[0].cards.length + Number(card_dict["sy_flyndr_crew"]["strength"]);
		}
	},
	cyrus_hemmelfart: {
		description: "Play a Dimeritum Shackles card in any of the opponent's row.",
		activated: async (card, player) => {
			player.endTurnAfterAbilityUse = false;
			ui.showPreviewVisuals(card);
			ui.enablePlayer(true);
			if (!(player.controller instanceof ControllerAI)) ui.setSelectable(card, true);
		},
		weight: (card) => 20
	},
	azar_javed: {
		description: "Destroy the enemy's weakest hero card (max 1 card).",
		activated: async (card, player) => {
			let heroes = player.opponent().getAllRowCards().filter(c => c.hero);
			if (heroes.length === 0) return;
			let target = heroes.sort((a, b) => a.power - b.power)[0];
			await target.animate("scorch", true, false);
			await board.toGrave(target, target.currentLocation);
		},
		weight: (card, ai, max) => {
			let heroes = card.holder.opponent().getAllRowCards().filter(c => c.hero);
			if (heroes.length === 0) return 0;
			return heroes.sort((a, b) => a.power - b.power)[0].power;
		}
	},
	bank: {
		name: "Bank",
		description: "Draw a card from your deck.",
		activated: async card => {
			card.holder.deck.draw(card.holder.hand);
			await board.toGrave(card, card.holder.hand);
		},
		weight: (card) => 20
	},
	witch_hunt: {
		name: "Witch Hunt",
		description: "Destroy the weakest unit(s) on the opposite row",
		placed: async card => {
			let row = card.currentLocation.getOppositeRow();
			if (row.isShielded() || game.scorchCancelled) return;
			
			// Check for Peace Treaty protection
			const targetPlayer = row.cards.length > 0 ? row.cards[0].holder : null;
			if (targetPlayer && game.peaceTreatyActive && game.peaceTreatyActive[targetPlayer.tag]) {
				return; // Peace Treaty prevents witch_hunt
			}
			
			// Play scorch animation and sound on the card itself (like scorch_c/r/s)
			await card.animate("scorch", true, false);
			
			let units = row.minUnits();
			await Promise.all(units.map(async c => await c.animate("scorch", true, false)));
			await Promise.all(units.map(async c => await board.toGrave(c, row)));
		}
	},
	zerrikanterment: {
		description: "Amount of worshippers boost is doubled.",
		gameStart: () => game.whorshipBoost *= 2
	},
	baal_zebuth: {
		description: "Select 2 cards from your opponent's discard pile and shuffle them back into his/her deck.",
		activated: async (card) => {
			let grave = card.holder.opponent().grave;
			if (card.holder.controller instanceof ControllerAI) {
				let cards = grave.findCardsRandom(false,2);
				await Promise.all(cards.map(async c => await board.toDeck(c, c.holder.grave)));
				return;
			} else {
				try {
					Carousel.curr.exit();
				} catch (err) {}
			}
			await ui.queueCarousel(grave, 2, (c, i) => board.toDeck(c.cards[i], c), () => true);
		},
		weight: (card) => {
			if (card.holder.opponent().grave.cards.length < 5) return 0;
			else return 20;
		}
	},
	rarog: {
		description: "Draw a random card from the discard pile to your hand (any card) and then shuffle the rest back into the deck.",
		activated: async (card) => {
			if (card.holder.grave.cards.length === 0) return;
			let grave = card.holder.grave;
			let c = grave.findCardsRandom(false, 1)[0];
			await board.toHand(c, c.holder.grave);
			Promise.all(card.holder.grave.cards.map(c => board.toDeck(c, card.holder.grave)));
		},
		weight: (card) => {
			let medics = card.holder.hand.cards.filter(c => c.abilities.includes("medic"));
			if (medics.length > 0 || card.holder.grave.cards.length == 0) return 0;
			else return 15;
		}
	},
	worshipper: {
		name: "Worshipper",
		description: "Boost by 1 all worshipped units on your side of the board.",
		placed: async card => {
			if (card.isLocked()) return;
			card.holder.effects["worshippers"]++;
			// Update all worshipped cards' power when a worshipper is added
			const worshippedCards = card.holder.getAllRowCards().filter(c => c.abilities.includes("worshipped") && !c.isLocked());
			for (const worshippedCard of worshippedCards) {
				if (worshippedCard.currentLocation && worshippedCard.currentLocation.cardScore) {
					worshippedCard.currentLocation.cardScore(worshippedCard);
				}
			}
			// Update scores to reflect the boost to worshipped units
			board.updateScores();
		},
		removed: async card => {
			if (card.isLocked()) return;
			card.holder.effects["worshippers"]--;
			// Update all worshipped cards' power when a worshipper is removed
			const worshippedCards = card.holder.getAllRowCards().filter(c => c.abilities.includes("worshipped") && !c.isLocked());
			for (const worshippedCard of worshippedCards) {
				if (worshippedCard.currentLocation && worshippedCard.currentLocation.cardScore) {
					worshippedCard.currentLocation.cardScore(worshippedCard);
				}
			}
			// Update scores to reflect the loss of boost to worshipped units
			board.updateScores();
		},
		weight: (card) => {
			let wcards = card.holder.getAllRowCards().filter(c => c.abilities.includes("worshipped"));
			return wcards.length * game.whorshipBoost;
		}
	},
	worshipped: {
		name: "Worshipped",
		description: "Boosted by 1 by all worshippers present on your side of the board.",
		// Note: No placed callback needed - power is calculated automatically via cardScore() 
		// when board.updateScores() is called after card placement
	},
	inspire: {
		name: "Inspire",
		description: "All units with Inspire ability take the highest base strength of the Inspire units on your side of the board. Still affected by weather.",
	},
	immortal: {
		name: "Immortal",
		description: "The card will remain on the battlefield for two rounds instead of one. Cannot die from any other effect.",
		placed: async card => {
			card.immortal = true;
			card.immortalRounds = 2;
			game.roundEnd.push(async () => {
				if (card.immortal && card.immortalRounds > 0) {
					card.immortalRounds--;
					if (card.immortalRounds === 0) {
						card.immortal = false;
					} else {
						card.noRemove = true;
						await card.animate("immortal");
						game.roundStart.push(async () => {
							delete card.noRemove;
							return true;
						});
					}
				}
				return false;
			});
		}
	},
	execute: {
		name: "Execute",
		description: "Destroy a hero card if it is alone in the opposite row.",
		placed: async (card) => {
			if (card.isLocked()) return;
			// Get the opposite row using the Row's getOppositeRow method
			if (!(card.currentLocation instanceof Row)) {
				console.warn("Execute: card.currentLocation is not a Row:", card.currentLocation);
				return;
			}
			const oppositeRow = card.currentLocation.getOppositeRow();
			if (!oppositeRow) {
				console.warn("Execute: Could not find opposite row for card:", card.name);
				return;
			}
			
			// Check for Peace Treaty protection
			const targetPlayer = oppositeRow.cards.length > 0 ? oppositeRow.cards[0].holder : null;
			if (targetPlayer && game.peaceTreatyActive && game.peaceTreatyActive[targetPlayer.tag]) {
				return; // Peace Treaty prevents execute
			}
			
			// Check for units and heroes in the row (special cards don't prevent execute)
			// Note: isUnit() returns false for heroes, so we need to check heroes separately
			const allUnitsAndHeroes = oppositeRow.cards.filter(c => {
				if (!c) return false;
				
				// Check if it's a hero (heroes are units but isUnit() returns false for them)
				if (c.hero) {
					return true;
				}
				
				// Check if it's a regular unit
				if (typeof c.isUnit === 'function') {
					return c.isUnit();
				}
				
				// Fallback: check if it has unit-like properties (not a special card)
				// Special cards typically don't have power/strength or have row === "weather" or "special"
				const hasUnitProperties = (c.power !== undefined || c.strength !== undefined) && 
				                         c.row && c.row !== "weather" && c.row !== "special";
				return hasUnitProperties;
			});
			
			const heroes = allUnitsAndHeroes.filter(c => c.hero && !c.immortal);
			const otherUnits = allUnitsAndHeroes.filter(c => !c.hero);
			
			// Execute only works if there's exactly one hero and no other units
			if (heroes.length === 1 && otherUnits.length === 0) {
				// Play execute sound effect
				tocar("execute", false);
				await heroes[0].animate("execute", true, false);
				await board.toGrave(heroes[0], oppositeRow);
			}
		},
		weight: (card, ai, max) => {
			// Check if opponent has Peace Treaty active
			const opponent = ai.player.opponent();
			if (game.peaceTreatyActive && game.peaceTreatyActive[opponent.tag]) {
				return 0; // Peace Treaty blocks execute
			}
			// Value based on opponent having lone heroes
			const rows = opponent.getAllRows();
			let executeValue = 0;
			for (const row of rows) {
				const heroes = row.cards.filter(c => c.isUnit() && c.hero && !c.immortal);
				const otherUnits = row.cards.filter(c => c.isUnit() && !c.hero);
				// If there's exactly one hero and no other units, execute can kill it
				if (heroes.length === 1 && otherUnits.length === 0) {
					executeValue += heroes[0].power;
				}
			}
			return Math.min(card.power + executeValue, 30);
		}
	},
	curse: {
		name: "Curse",
		description: "Place this card on your opponent's battlefield on the corresponding row. The next non-hero unit card placed on this row will be destroyed.",
		placed: async (card) => {
			if (card.isLocked()) return;
			// Place on opponent's side (like spy)
			card.holder = card.holder.opponent();
			// Mark the row as cursed
			const row = card.currentLocation;
			if (!row.curseCard) {
				row.curseCard = card;
			}
		}
	},
	waylay: {
		name: "Waylay",
		description: "Play on your opponent's battlefield on the corresponding row (counts towards your opponent's total). If any unit is played on this row, Bandit Camp is removed and you draw 2 cards.",
		placed: async (card) => {
			if (card.isLocked()) return;
			// Play waylay sound effect when card is placed
			tocar("waylay", false);
			
			// Place on opponent's side (like spy/curse)
			// The card is already on the opponent's row via getRow logic, and will count towards their score
			card.holder = card.holder.opponent();
			// Mark the row with waylay card
			const row = card.currentLocation;
			if (!row.waylayCard) {
				row.waylayCard = card;
			}
		},
		weight: (card, ai, max) => {
			// Value based on opponent's likelihood to play units on that row
			const opponent = ai.player.opponent();
			const row = board.getRow(card, card.row, opponent);
			const opponentUnits = opponent.getAllRowCards().filter(c => c.isUnit());
			const rowUnits = opponentUnits.filter(c => {
				const cardRow = board.getRow(c, c.row, opponent);
				return cardRow === row;
			});
			// Higher value if opponent has many units that could be played on this row
			const potentialValue = rowUnits.length * 3;
			// Also consider opponent's hand size (more cards = more likely to play)
			const handBonus = opponent.hand.cards.length * 2;
			return Math.min(card.power + potentialValue + handBonus, 25);
		}
	},
	decree: {
		name: "Decree",
		description: "Play your leader's ability now (even if it was used).",
		placed: async (card) => {
			if (card.isLocked()) return;
			tocar("decree", false);
			const player = card.holder;
			// Trigger leader ability directly without affecting leader availability
			// This acts as a pseudo-trigger that doesn't change the leader's state
			try {
				Carousel.curr.cancel();
			} catch (err) {}
			// Call leader's activated function directly
			if (player.leader && player.leader.activated && player.leader.activated.length > 0) {
				await player.leader.activated[0](player.leader, player);
			}
		}
	},
	omen: {
		name: "Omen",
		description: "Create a copy of Cat and Dog and add it to your hand.",
		placed: async (card) => {
			if (card.isLocked()) return;
			const player = card.holder;
			const targetKey = "ne_catanddog";

			// Play omen animation (like emissary)
			await card.animate("omen");

			// Create a new card instance and add to hand
			const catAndDogData = card_dict[targetKey];
			if (!catAndDogData) {
				console.error("Cat and Dog card data not found for omen ability.");
				return;
			}
			const newCard = new Card(targetKey, catAndDogData, player);
			player.hand.addCard(newCard);
		},
		weight: (card, ai, max) => {
			// Value based on getting Cat and Dog (0 power agile unit)
			// Generally useful for hand size and potential synergies
			return card.power + 8; // Moderate value for card advantage
		}
	},
	trade: {
		name: "Trade",
		description: "When your opponent's total power reaches 12, 24, or 36, draw 1 card.",
		placed: async (card) => {
			// Trade is handled via game state tracking in gwent.js
			// This placed function is just for ability definition
		},
		weight: (card, ai, max) => {
			// Value based on opponent's current total and likelihood to reach thresholds
			const opponent = ai.player.opponent();
			const thresholds = [12, 24, 36];
			const currentTotal = opponent.total;
			// Check how close opponent is to next threshold
			const nextThreshold = thresholds.find(t => t > currentTotal);
			if (!nextThreshold) return card.power; // Already past all thresholds
			const distanceToThreshold = nextThreshold - currentTotal;
			// More conservative threshold bonus - only high value when very close
			const thresholdBonus = distanceToThreshold <= 3 ? 6 : (distanceToThreshold <= 6 ? 3 : 0);
			// Moderate synergy bonus (reduced from 3 to 2 per card)
			const tradeCards = ai.player.getAllRowCards().filter(c => c.isUnit() && c.abilities.includes("trade"));
			const synergyBonus = tradeCards.length * 2;
			// Base power + conservative bonuses, capped lower
			return Math.min(card.power + thresholdBonus + synergyBonus, 18);
		}
	},
	adaptive: {
		name: "Adaptive",
		description: "This unit's base Strength is 2 (instead of 1) while affected by Weather.",
	},
	emissary: {
		name: "Emissary",
		description: "Place on your opponent's battlefield. Draw 3 cards from the top of your opponent's deck, place 1 in your deck, then another is randomly discarded, and the last one is inserted back into your opponent's deck. Both your deck and your opponent's deck are shuffled.",
		placed: async (card) => {
			if (card.isLocked()) return;
			
			// Play emissary sound effect
			tocar("emissary", false);
			
			await card.animate("emissary");
			const opponent = card.holder.opponent();
			const player = card.holder;
			
			// Draw up to 3 cards from opponent's deck
			const drawnCards = [];
			for (let i = 0; i < 3 && opponent.deck.cards.length > 0; i++) {
				const drawnCard = opponent.deck.cards[0];
				opponent.deck.removeCard(drawnCard);
				drawnCards.push(drawnCard);
			}
			
			if (drawnCards.length === 0) {
				// Place on opponent's side (like spy)
				card.holder = opponent;
				return;
			}
			
			// Create a temporary container to manage the drawn cards
			const tempContainer = new CardContainer();
			drawnCards.forEach(c => {
				c.currentLocation = tempContainer;
				tempContainer.cards.push(c);
			});
			
			if (card.holder.controller instanceof ControllerAI) {
				// AI: Choose the best card to add to own deck, randomly discard one, shuffle the last back
				const sortedCards = [...drawnCards].sort((a, b) => {
					const weightA = card.holder.controller.weightCard(a, card.holder.controller.getMaximums(), card.holder.controller.getBoardData());
					const weightB = card.holder.controller.weightCard(b, card.holder.controller.getMaximums(), card.holder.controller.getBoardData());
					return weightB - weightA;
				});
				const keepCard = sortedCards[0];
				if (keepCard && tempContainer.cards.includes(keepCard)) {
					tempContainer.removeCard(keepCard);
					// Add to player's deck
					player.deck.addCard(keepCard);
				}
				// Randomly discard one of the remaining cards
				if (tempContainer.cards.length > 0) {
					const randomIndex = Math.floor(Math.random() * tempContainer.cards.length);
					const discardCard = tempContainer.cards[randomIndex];
					tempContainer.removeCard(discardCard);
					await board.toGrave(discardCard, tempContainer);
				}
				// Insert the last one back into opponent's deck
				if (tempContainer.cards.length > 0) {
					const shuffleCard = tempContainer.cards[0];
					tempContainer.removeCard(shuffleCard);
					opponent.deck.addCard(shuffleCard);
				}
			} else {
				// Player: Let them choose which card to add to their deck
				card.holder.endTurnAfterAbilityUse = false;
				await ui.queueCarousel(tempContainer, 1, async (container, index) => {
					const selectedCard = container.cards[index];
					container.removeCard(selectedCard);
					// Add to player's deck
					player.deck.addCard(selectedCard);
				}, () => true, false, true, "Choose a card to add to your deck");
				
				// Randomly discard one of the remaining cards
				if (tempContainer.cards.length > 0) {
					const randomIndex = Math.floor(Math.random() * tempContainer.cards.length);
					const discardCard = tempContainer.cards[randomIndex];
					tempContainer.removeCard(discardCard);
					await board.toGrave(discardCard, tempContainer);
				}
				
				// Insert the last one back into opponent's deck
				if (tempContainer.cards.length > 0) {
					const shuffleCard = tempContainer.cards[0];
					tempContainer.removeCard(shuffleCard);
					opponent.deck.addCard(shuffleCard);
				}
				
				card.holder.endTurnAfterAbilityUse = true;
			}
			
			// Shuffle both decks by shuffling their card arrays
			// Shuffle player's deck
			if (player.deck.cards.length > 1) {
				for (let i = player.deck.cards.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[player.deck.cards[i], player.deck.cards[j]] = [player.deck.cards[j], player.deck.cards[i]];
				}
			}
			
			// Shuffle opponent's deck
			if (opponent.deck.cards.length > 1) {
				for (let i = opponent.deck.cards.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[opponent.deck.cards[i], opponent.deck.cards[j]] = [opponent.deck.cards[j], opponent.deck.cards[i]];
				}
			}
			
			// Place on opponent's side (like spy)
			card.holder = opponent;
		},
		weight: (card, ai, max) => {
			// Emissary is like a spy but with card advantage potential
			// Value based on card advantage and opponent's deck quality
			const opponent = ai.player.opponent();
			const handSize = ai.player.hand.cards.length;
			const opponentHandSize = opponent.hand.cards.length;
			const cardAdvantage = opponentHandSize - handSize;
			
			// Base value similar to spy (15), but consider card advantage
			let score = 12; // Slightly less than spy since it's more complex
			
			// More valuable if we're behind in cards
			if (cardAdvantage > 0) {
				score += Math.min(cardAdvantage * 2, 8);
			}
			
			// Less valuable if we're ahead in cards (don't need more)
			if (cardAdvantage < -2) {
				score -= 3;
			}
			
			// Consider opponent's deck size (more cards = more value)
			const deckBonus = Math.min(opponent.deck.cards.length / 5, 3);
			score += deckBonus;
			
			// Don't overvalue - cap at reasonable level
			return Math.min(score, 20);
		}
	},
	ofir_aamad: {
		name: "Aamad, the Wise",
		description: "Whenever you draw a card, you gain +1 total power for this round permanently (resets upon round completion back to 0).",
		gameStart: (card, player) => {
			// Initialize the bonus tracker
			if (!player.aamadBonus) {
				player.aamadBonus = 0;
			}
			
			// Hook into the draw method to track card draws
			const originalDraw = player.deck.draw.bind(player.deck);
			player.deck.draw = async function(hand) {
				const result = await originalDraw(hand);
				// Check if the hand's owner has Aamad as leader
				const drawingPlayer = hand.holder || player;
				if (drawingPlayer.leader && drawingPlayer.leader.abilities && drawingPlayer.leader.abilities.includes("ofir_aamad")) {
					drawingPlayer.aamadBonus = (drawingPlayer.aamadBonus || 0) + 1;
					drawingPlayer.updateTotal(1);
				}
				return result;
			};
			
			// Reset bonus at round start
			game.roundStart.push(async () => {
				if (player.aamadBonus && player.aamadBonus > 0) {
					// Subtract the old bonus from total
					player.updateTotal(-player.aamadBonus);
					player.aamadBonus = 0;
				}
				return false; // Don't remove this hook
			});
		}
	},
	ofir_aamad_merchant: {
		description: "Passive: If you've drawn 10 cards this round, you win the round.",
		gameStart: (card, player) => {
			// Initialize draw counter
			if (!player.merchantKingDraws) {
				player.merchantKingDraws = 0;
			}
			
			// Track all card draws by hooking into hand.addCard
			// This catches: normal draws, emissary, spy, trade, waylay, etc.
			const originalAddCard = player.hand.addCard.bind(player.hand);
			player.hand.addCard = function(card) {
				const result = originalAddCard(card);
				
				// Check if this player has the merchant king ability
				if (player.leader && player.leader.abilities && player.leader.abilities.includes("ofir_aamad_merchant")) {
					// Increment draw counter
					player.merchantKingDraws = (player.merchantKingDraws || 0) + 1;
					
					// Check if 10 cards have been drawn
					if (player.merchantKingDraws >= 10 && !player.merchantKingWon) {
						// Mark that we've triggered the win to prevent multiple triggers
						player.merchantKingWon = true;
						
						// Win the round immediately
						(async () => {
							// Ensure player's total is higher than opponent to guarantee win
							const opponent = player.opponent();
							const currentDiff = player.total - opponent.total;
							if (currentDiff <= 0) {
								// Temporarily boost player's total to ensure win
								player.updateTotal(Math.abs(currentDiff) + 1);
							}
							
							// End the round (this will determine winner based on totals)
							if (!game.over) {
								// Force both players to pass if needed, then end round
								if (!player.passed) {
									player.setPassed(true);
								}
								if (!opponent.passed) {
									opponent.setPassed(true);
								}
								await game.endRound();
							}
						})();
					}
				}
				
				return result;
			};
			
			// Also track deck.draw for normal draws (as backup)
			const originalDraw = player.deck.draw.bind(player.deck);
			player.deck.draw = async function(hand) {
				const result = await originalDraw(hand);
				// The hand.addCard hook will catch this, but we track here too for safety
				const drawingPlayer = hand.holder || player;
				if (drawingPlayer.leader && drawingPlayer.leader.abilities && drawingPlayer.leader.abilities.includes("ofir_aamad_merchant")) {
					// Counter is incremented in hand.addCard, so we don't need to do it here
					// But we can add a check if needed
				}
				return result;
			};
			
			// Reset draw counter and win flag at round start
			game.roundStart.push(async () => {
				if (player.merchantKingDraws !== undefined) {
					player.merchantKingDraws = 0;
				}
				if (player.merchantKingWon !== undefined) {
					player.merchantKingWon = false;
				}
				return false; // Don't remove this hook
			});
		},
		weight: (card, ai, max) => {
			const player = ai.player;
			const currentDraws = player.merchantKingDraws || 0;
			const drawsNeeded = 10 - currentDraws;
			
			// If we're close to 10 draws, this becomes very valuable
			if (currentDraws >= 7) {
				return 50; // Very high priority if close to winning
			} else if (currentDraws >= 5) {
				return 30; // High priority if halfway there
			} else if (currentDraws >= 3) {
				return 15; // Moderate priority
			}
			
			// Base value: encourage drawing cards
			// Value increases if we have cards/abilities that draw (emissary, spy, trade)
			const drawAbilities = player.getAllRowCards().filter(c => 
				c.abilities.includes("emissary") || 
				c.abilities.includes("spy") || 
				c.abilities.includes("trade")
			).length;
			
			return Math.max(5, 5 + drawAbilities * 2);
		}
	},
	ofir_grand_vizier_saheem: {
		description: "Once per game, you may look at the top 3 cards of your opponent's deck, add one to your hand, and discard one.",
		activated: async (card) => {
			const player = card.holder;
			const opponent = player.opponent();
			
			// Draw top 3 cards from opponent's deck
			const drawnCards = [];
			for (let i = 0; i < 3 && opponent.deck.cards.length > 0; i++) {
				const drawnCard = opponent.deck.cards[0];
				opponent.deck.removeCard(drawnCard);
				drawnCards.push(drawnCard);
			}
			
			if (drawnCards.length === 0) return; // No cards to draw
			
			if (player.controller instanceof ControllerAI) {
				// AI: Choose best card to keep, discard worst
				drawnCards.sort((a, b) => {
					const weightA = player.controller.weightCard(a, player.controller.getMaximums(), player.controller.getBoardData());
					const weightB = player.controller.weightCard(b, player.controller.getMaximums(), player.controller.getBoardData());
					return weightB - weightA;
				});
				// Keep best, discard others
				player.hand.addCard(drawnCards[0]);
				for (let i = 1; i < drawnCards.length; i++) {
					await board.toGrave(drawnCards[i], player.hand);
				}
			} else {
				// Player: Let them choose which to keep, discard others
				player.endTurnAfterAbilityUse = false;
				// Create a temporary container for the carousel
				const tempContainer = new CardContainer();
				drawnCards.forEach(c => {
					c.currentLocation = tempContainer;
					tempContainer.cards.push(c);
				});
				await ui.queueCarousel(tempContainer, 1, async (container, index) => {
					const selectedCard = container.cards[index];
					const otherCards = drawnCards.filter(c => c !== selectedCard);
					container.removeCard(selectedCard);
					player.hand.addCard(selectedCard);
					// Discard the others
					for (let otherCard of otherCards) {
						await board.toGrave(otherCard, container);
					}
					player.endTurnAfterAbilityUse = true;
				}, () => true, false, true, "Choose a card to add to your hand (others will be discarded)");
			}
		},
		weight: (card, ai, max) => {
			// Good if opponent has cards in deck
			const opponent = ai.player.opponent();
			return Math.min(opponent.deck.cards.length * 3, 30);
		}
	},
	fortify: {
		name: "Fortify",
		description: "When this unit is alone on its row, gain +10 strength.",
		placed: async (card) => {
			if (card.isLocked()) return;
			// Check if alone and trigger animation/update
			const row = card.currentLocation;
			if (row instanceof Row) {
				const unitsInRow = row.cards.filter(c => c.isUnit() && c !== card);
				if (unitsInRow.length === 0) {
					await card.animate("fortify");
					row.updateScore();
				}
			}
		},
		weight: (card, ai, max) => {
			// Value based on likelihood of being alone
			const player = ai.player;
			// Handle flexible row designations - default to close row for evaluation
			let rowName = card.row;
			if (rowName === "agile" || rowName === "any" || rowName === "melee_siege") {
				rowName = "close";
			} else if (rowName === "ranged_siege") {
				rowName = "ranged";
			}
			const row = board.getRow(card, rowName, player);
			if (!row) {
				// Fallback if row is still undefined
				return card.power;
			}
			const currentUnits = row.cards.filter(c => c.isUnit()).length;
			// More valuable if row is empty or has few units
			const aloneBonus = currentUnits === 0 ? 10 : (currentUnits === 1 ? 5 : 0);
			return Math.min(card.power + aloneBonus, 30);
		}
	},
	guard: {
		name: "Guard",
		description: "When placed on the battlefield, the unit adjacent gains Battle Guard - any attack that would kill the guarded unit instead kills the unit who guarded the unit.",
		placed: async (card) => {
			if (card.isLocked()) return;
			const row = card.currentLocation;
			if (!row || !row.cards) return;
			const index = row.cards.indexOf(card);
			if (index === -1) return;
			// Find adjacent unit (before or after this card)
			let adjacentCard = null;
			if (index > 0) {
				adjacentCard = row.cards[index - 1];
			} else if (index < row.cards.length - 1) {
				adjacentCard = row.cards[index + 1];
			}
			if (adjacentCard && adjacentCard.isUnit() && !adjacentCard.hero) {
				// Mark this card as the guard for the adjacent unit
				adjacentCard.guardedBy = card;
				// Play guard animation on both the guard card and the guarded unit
				await Promise.all([
					card.animate("guard"),
					adjacentCard.animate("guard")
				]);
			}
		},
		weight: (card, ai, max) => {
			// Value based on protecting high-value units
			// Check if we have valuable units that could be guarded
			const player = ai.player;
			
			// Determine which rows this card can be played on
			const possibleRows = [];
			if (card.row === "close" || card.row === "agile" || card.row === "any" || card.row === "melee_siege") {
				possibleRows.push(board.getRow(card, "close", player));
			}
			if (card.row === "ranged" || card.row === "agile" || card.row === "any" || card.row === "ranged_siege") {
				possibleRows.push(board.getRow(card, "ranged", player));
			}
			if (card.row === "siege" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege") {
				possibleRows.push(board.getRow(card, "siege", player));
			}
			
			// Check if any of the possible rows have units (guard needs adjacent units)
			const rowsWithUnits = possibleRows.filter(row => row.cards.filter(c => c.isUnit() && !c.hero).length > 0);
			
			// Check if AI has no choice (down to last cards or no other units for specified rows)
			const cardsInHand = player.hand.cards.length;
			const allUnits = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			// Has no choice if:
			// 1. Down to 2 or fewer cards
			// 2. Card has specific row requirement and no units exist on board
			// 3. Card is agile/any but no units exist on any row
			const hasNoChoice = cardsInHand <= 2 || 
				(card.row !== "agile" && card.row !== "any" && card.row !== "melee_siege" && card.row !== "ranged_siege" && allUnits.length === 0) ||
				((card.row === "agile" || card.row === "any") && allUnits.length === 0);
			
			// If no rows have units, heavily penalize unless AI has no choice
			if (rowsWithUnits.length === 0) {
				if (hasNoChoice) {
					// Last resort - return minimal value
					return Math.max(1, card.power);
				}
				// Check if there are other playable cards (not guard/morale) that could be played instead
				const otherPlayableCards = player.hand.cards.filter(c => 
					c !== card && 
					!c.abilities.includes("guard") && 
					!c.abilities.includes("morale")
				);
				if (otherPlayableCards.length > 0) {
					return 0; // Don't play guard on empty row if there are other options
				}
				// No other options - minimal value
				return Math.max(1, card.power);
			}
			
			// Find highest value unit that could be protected in rows with units
			let highestValue = 0;
			rowsWithUnits.forEach(row => {
				const rowUnits = row.cards.filter(c => c.isUnit() && !c.hero);
				if (rowUnits.length > 0) {
					const rowMax = Math.max(...rowUnits.map(c => c.power));
					highestValue = Math.max(highestValue, rowMax);
				}
			});
			
			// Guard is more valuable if protecting high-power units
			const protectionValue = highestValue >= 10 ? 8 : (highestValue >= 5 ? 4 : 0);
			return Math.min(card.power + protectionValue, 20);
		}
	},
	necromancy: {
		name: "Necromancy",
		description: "When this unit is played, return all units (including heroes) with a base power of 4 or less to the field in their appropriate rows.",
		placed: async (card) => {
			if (card.isLocked()) return;
			const player = card.holder;
			// Find all units in grave with basePower <= 4 (including heroes)
			// Create a snapshot to avoid issues if grave changes during processing
			const eligibleCards = [...player.grave.cards.filter(c => c.isUnit() && c.basePower <= 4)];
			if (eligibleCards.length === 0) return;
			
			// Create animation overlay on grave (discard pile)
			const graveElem = player.grave.elem;
			let graveAnim = null;
			
			if (graveElem) {
				// Create animation overlay on grave
				graveAnim = document.createElement("div");
				graveAnim.style.position = "absolute";
				graveAnim.style.top = "0";
				graveAnim.style.left = "0";
				graveAnim.style.width = "100%";
				graveAnim.style.height = "100%";
				graveAnim.style.backgroundImage = iconURL("anim_necromancy");
				graveAnim.style.backgroundSize = "cover";
				graveAnim.style.backgroundPosition = "center";
				graveAnim.style.pointerEvents = "none";
				graveAnim.style.zIndex = "1000";
				graveAnim.style.opacity = "0";
				graveElem.style.position = "relative";
				graveElem.appendChild(graveAnim);
			}
			
			// Play animations simultaneously on trigger card and grave
			await Promise.all([
				// Animate the trigger card on battlefield
				(async () => {
					await card.animate("necromancy", false, false);
				})(),
				// Animate the grave
				(async () => {
					if (graveAnim) {
						await sleep(50);
						fadeIn(graveAnim, 300);
						await sleep(300);
						await sleep(1000);
						fadeOut(graveAnim, 300);
						await sleep(300);
						if (graveElem && graveAnim.parentNode === graveElem) {
							graveElem.removeChild(graveAnim);
						}
					}
				})()
			]);
			
			// Return all eligible cards to the field in their appropriate rows
			for (const unit of eligibleCards) {
				// Remove from grave
				player.grave.removeCard(unit);
				
				// Determine the appropriate row for this unit
				let targetRow;
				if (unit.row === "close" || unit.row === "agile" || unit.row === "any" || unit.row === "melee_siege") {
					targetRow = board.getRow(unit, "close", player);
				} else if (unit.row === "ranged" || unit.row === "ranged_siege") {
					targetRow = board.getRow(unit, "ranged", player);
				} else if (unit.row === "siege") {
					targetRow = board.getRow(unit, "siege", player);
				} else {
					// Default to close if row is unclear
					targetRow = board.getRow(unit, "close", player);
				}
				
				// Add card to the appropriate row
				await board.addCardToRow(unit, targetRow, player, player.grave);
			}
			
			board.updateScores();
		},
		weight: (card, ai, max) => {
			// Value based on all units in grave that would be returned
			const player = ai.player;
			const eligibleCards = player.grave.cards.filter(c => c.isUnit() && c.basePower <= 4);
			if (eligibleCards.length === 0) return card.power;
			// Value is based on the total power of all units that would be returned
			const totalPower = eligibleCards.reduce((sum, c) => sum + c.basePower, 0);
			// Also consider abilities - units with abilities are more valuable
			const abilityBonus = eligibleCards.filter(c => c.abilities && c.abilities.length > 0).length * 2;
			// Value is based on all cards we can get back
			const restoreValue = totalPower + abilityBonus;
			return Math.min(card.power + restoreValue, 30);
		}
	},
		sacrifice: {
		name: "Sacrifice",
		description: "When this unit is played, it automatically kills the weakest friendly unit and plays a random higher cost unit from your deck immediately, then shuffles your deck. If no higher cost unit card exists, the friendly unit just dies.",
		placed: async (card) => {
			if (card.isLocked()) return;
			const player = card.holder;
			const friendlyUnits = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			if (friendlyUnits.length === 0) return; // No units to sacrifice
			
			// Automatically target the weakest unit on the board
			const sacrificeTarget = friendlyUnits.sort((a, b) => a.basePower - b.basePower)[0];
			if (!sacrificeTarget) return;
			
			// Get the sacrifice power and row before removing
			const sacrificePower = sacrificeTarget.basePower;
			const sacrificeRow = sacrificeTarget.currentLocation;
			
			// Simultaneously play anim_sacrifice over the selected card on the battlefield and over the deck
			const deckElem = player.deck.elem;
			let deckAnim = null;
			
			if (deckElem) {
				// Create animation overlay on deck
				deckAnim = document.createElement("div");
				deckAnim.style.position = "absolute";
				deckAnim.style.top = "0";
				deckAnim.style.left = "0";
				deckAnim.style.width = "100%";
				deckAnim.style.height = "100%";
				deckAnim.style.backgroundImage = iconURL("anim_sacrifice");
				deckAnim.style.backgroundSize = "cover";
				deckAnim.style.backgroundPosition = "center";
				deckAnim.style.pointerEvents = "none";
				deckAnim.style.zIndex = "1000";
				deckAnim.style.opacity = "0";
				deckElem.style.position = "relative";
				deckElem.appendChild(deckAnim);
			}
			
			// Play animations simultaneously
			await Promise.all([
				// Animate the card on battlefield (like scorch - fade in/out but no expand)
				// Sound will play automatically via Card.animate method
				(async () => {
					await sacrificeTarget.animate("sacrifice", true, false);
				})(),
				// Animate the deck
				(async () => {
					if (deckAnim) {
						await sleep(50);
						fadeIn(deckAnim, 300);
						await sleep(300);
						await sleep(1000);
						fadeOut(deckAnim, 300);
						await sleep(300);
						if (deckElem && deckAnim.parentNode === deckElem) {
							deckElem.removeChild(deckAnim);
						}
					}
				})()
			]);
			
			// Kill the sacrifice target and put it in the discard pile
			await board.toGrave(sacrificeTarget, sacrificeTarget.currentLocation);
			
			// Check if deck has cards before trying to draw
			if (player.deck.cards.length === 0) {
				player.endTurnAfterAbilityUse = true;
				return; // No cards in deck
			}
			
			// Get a snapshot of deck cards to avoid issues if deck changes
			const deckCards = [...player.deck.cards];
			
			// Try to find a unit that's 1 strength higher, then 2, etc. (as close as possible while still being greater)
			let foundUnit = null;
			for (let strengthDiff = 1; strengthDiff <= 20; strengthDiff++) {
				const targetStrength = sacrificePower + strengthDiff;
				const matchingUnits = deckCards.filter(c => c.isUnit() && c.basePower === targetStrength);
				if (matchingUnits.length > 0) {
					// Found units with this strength - pick one at random
					foundUnit = matchingUnits[Math.floor(Math.random() * matchingUnits.length)];
					break;
				}
			}
			
			// If no exact match found, try any unit with higher basePower
			if (!foundUnit) {
				const higherCostUnits = deckCards.filter(c => c.isUnit() && c.basePower > sacrificePower);
				if (higherCostUnits.length > 0) {
					// Sort by basePower ascending to get the closest match
					higherCostUnits.sort((a, b) => a.basePower - b.basePower);
					foundUnit = higherCostUnits[0];
				}
			}
			
			if (foundUnit) {
				// Verify the card is still in the deck before removing
				const cardIndex = player.deck.cards.indexOf(foundUnit);
				if (cardIndex !== -1 && player.deck.cards.length > 0) {
					try {
						player.deck.removeCard(foundUnit);
					} catch (err) {
						console.warn("Error removing card from deck:", err);
						// Card might have already been removed, continue anyway
						player.endTurnAfterAbilityUse = true;
						return;
					}
				} else {
					// Card not found in deck, can't proceed
					player.endTurnAfterAbilityUse = true;
					return;
				}
				
				// Shuffle deck
				if (player.deck.cards.length > 1) {
					for (let i = player.deck.cards.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1));
						[player.deck.cards[i], player.deck.cards[j]] = [player.deck.cards[j], player.deck.cards[i]];
					}
				}
				
				// Determine target row for the new unit
				let targetRow = sacrificeRow; // Default to same row as sacrificed unit
				
				// If the new unit can go into multiple rows (agile/any), choose one at random
				if (foundUnit.row === "agile" || foundUnit.row === "any") {
					const possibleRows = [];
					if (foundUnit.row === "agile" || foundUnit.row === "any") {
						possibleRows.push(board.getRow(foundUnit, "close", player));
						possibleRows.push(board.getRow(foundUnit, "ranged", player));
					}
					if (foundUnit.row === "any") {
						possibleRows.push(board.getRow(foundUnit, "siege", player));
					}
					if (possibleRows.length > 0) {
						targetRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
					}
				} else if (foundUnit.row === "melee_siege") {
					const possibleRows = [
						board.getRow(foundUnit, "close", player),
						board.getRow(foundUnit, "siege", player)
					];
					targetRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
				} else if (foundUnit.row === "ranged_siege") {
					const possibleRows = [
						board.getRow(foundUnit, "ranged", player),
						board.getRow(foundUnit, "siege", player)
					];
					targetRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
				} else {
					// Fixed row - use the appropriate row
					targetRow = board.getRow(foundUnit, foundUnit.row, player);
				}
				
				// Add the unit to the target row
				await board.addCardToRow(foundUnit, targetRow, player, player.deck);
			}
			
			player.endTurnAfterAbilityUse = true;
		},
		weight: (card, ai, max) => {
			// Value based on having weak units to sacrifice and good units in deck
			const player = ai.player;
			const friendlyUnits = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			if (friendlyUnits.length === 0) return card.power;
			// Find weakest unit we could sacrifice
			const weakest = friendlyUnits.sort((a, b) => a.basePower - b.basePower)[0];
			const sacrificePower = weakest.basePower;
			// Find units in deck with higher basePower
			const higherCostUnits = player.deck.cards.filter(c => c.isUnit() && c.basePower > sacrificePower);
			if (higherCostUnits.length === 0) {
				// No upgrade available, sacrifice is just killing a unit
				return Math.max(card.power - weakest.basePower, 0);
			}
			// Calculate average value of potential upgrades
			const avgUpgradePower = higherCostUnits.reduce((sum, c) => sum + c.basePower, 0) / higherCostUnits.length;
			const upgradeValue = avgUpgradePower - sacrificePower;
			return Math.min(card.power + upgradeValue, 25);
		}
	},
	bribe: {
		name: "Bribe",
		description: "When this unit enters play, take a random non-hero, non-modified unit card strength 6 or less from your opponent's deck, and place it on your board in their appropriate row. Your opponent draws a card into their hand.",
		placed: async (card) => {
			if (card.isLocked()) return;
			const player = card.holder;
			const opponent = player.opponent();
			
			// Create animation overlay on opponent's deck
			const deckElem = opponent.deck.elem;
			let deckAnim = null;
			
			if (deckElem) {
				// Create animation overlay on deck
				deckAnim = document.createElement("div");
				deckAnim.style.position = "absolute";
				deckAnim.style.top = "0";
				deckAnim.style.left = "0";
				deckAnim.style.width = "100%";
				deckAnim.style.height = "100%";
				deckAnim.style.backgroundImage = iconURL("anim_bribe");
				deckAnim.style.backgroundSize = "cover";
				deckAnim.style.backgroundPosition = "center";
				deckAnim.style.pointerEvents = "none";
				deckAnim.style.zIndex = "1000";
				deckAnim.style.opacity = "0";
				deckElem.style.position = "relative";
				deckElem.appendChild(deckAnim);
			}
			
			// Play animations simultaneously on unit and deck
			await Promise.all([
				// Animate the unit on battlefield
				(async () => {
					// Play bribe sound effect
					tocar("bribe", false);
					await card.animate("bribe", false, false);
				})(),
				// Animate the opponent's deck
				(async () => {
					if (deckAnim) {
						await sleep(50);
						fadeIn(deckAnim, 300);
						await sleep(300);
						await sleep(1000);
						fadeOut(deckAnim, 300);
						await sleep(300);
						if (deckElem && deckAnim.parentNode === deckElem) {
							deckElem.removeChild(deckAnim);
						}
					}
				})()
			]);
			
			// Find eligible cards: non-hero, non-strength-modified, strength 6 or less
			// Only search in opponent's deck
			const eligibleCards = opponent.deck.cards.filter(c => 
				c.isUnit() && 
				!c.hero && 
				c.basePower <= 6 && 
				c.power === c.basePower // non-strength-modified
			);
			
			if (eligibleCards.length === 0) {
				// Opponent draws a card anyway
				if (opponent.deck.cards.length > 0) {
					await opponent.deck.draw(opponent.hand);
				}
				return; // No eligible cards found
			}
			
			// Pick a random eligible card
			const randomCard = eligibleCards[Math.floor(Math.random() * eligibleCards.length)];
			
			// Set the holder to the player who played bribe
			randomCard.holder = player;
			
			// Get the appropriate row for this card on the player's side
			const targetRow = board.getRow(randomCard, randomCard.row, player);
			
			// Place it on the player's board (from opponent's deck)
			await board.moveTo(randomCard, targetRow, opponent.deck);
			
			// Opponent draws a card
			if (opponent.deck.cards.length > 0) {
				await opponent.deck.draw(opponent.hand);
			}
		}
	},
	martyr: {
		name: "Martyr",
		description: "If this unit dies, draw a card.",
		removed: async (card) => {
			if (card.isLocked() || game.over) return;
			const player = card.holder;
			// Draw a card when this unit dies
			if (player.deck.cards.length > 0) {
				await player.deck.draw(player.hand);
			}
		},
		weight: (card, ai, max) => {
			// Value based on card advantage when unit dies
			const player = ai.player;
			const unitCount = player.getAllRowCards().filter(c => c.isUnit()).length;
			const handSize = player.hand.cards.length;
			const deckSize = player.deck.cards.length;
			
			// Base value for card draw on death
			const drawValue = 8; // Card advantage is valuable
			
			// More valuable if we have few cards in hand (need card advantage)
			const handBonus = handSize < 5 ? 5 : (handSize < 7 ? 2 : 0);
			
			// More valuable if we have cards in deck to draw
			const deckBonus = deckSize > 0 ? 2 : 0;
			
			// Consider if we can strategically sacrifice this unit
			// If it's a weak unit, it's easier to trigger the draw
			const sacrificeValue = card.power <= 3 ? 3 : (card.power <= 5 ? 1 : 0);
			
			// Less valuable if we're ahead and don't need card advantage
			const opponent = player.opponent();
			const cardAdvantage = handSize - opponent.hand.cards.length;
			const powerAdvantage = player.total - opponent.total;
			const aheadPenalty = (cardAdvantage > 2 && powerAdvantage > 10) ? -2 : 0;
			
			return Math.min(card.power + drawValue + handBonus + deckBonus + sacrificeValue + aheadPenalty, 25);
		}
	},
	clairvoyance: {
		name: "Clairvoyance",
		description: "Look at the top 3 cards of your deck.",
		placed: async (card) => {
			if (card.isLocked()) return;
			const player = card.holder;
			
			// Get top 3 cards from deck
			const topCards = [];
			for (let i = 0; i < 3 && player.deck.cards.length > 0; i++) {
				const deckCard = player.deck.cards[i];
				topCards.push(deckCard);
			}
			
			if (topCards.length === 0) return; // No cards in deck
			
			// Play clairvoyance sound effect
			tocar("clairvoyance", false);
			
			// Play clairvoyance animation (like emissary)
			await card.animate("clairvoyance");
			
			// Create a temporary container for viewing
			const tempContainer = new CardContainer();
			topCards.forEach(c => {
				c.currentLocation = tempContainer;
				tempContainer.cards.push(c);
			});
			
			// For AI: Just view and continue (no action needed)
			if (player.controller instanceof ControllerAI) {
				// AI can see the cards internally, no UI needed
				// Cards remain in deck in same order
				return;
			}
			
			// For player: Show cards in carousel for viewing
			player.endTurnAfterAbilityUse = false;
			// Use count 1 but the action just closes - cards remain in deck
			await ui.queueCarousel(tempContainer, 1, async (container, index) => {
				// Just viewing - no action needed, cards stay in deck in same order
				// The carousel allows viewing, then player clicks to close
				player.endTurnAfterAbilityUse = true;
			}, () => true, false, true, "Clairvoyance: View the top 3 cards of your deck (click to close)");
			
			// Cards remain in deck in the same order (no removal happened)
		}
	},
	mo_bloody_baron: {
		description: "When a unit dies from a Curse, draw a card from your deck and play it immediately.",
		gameStart: (card, player) => {
			// This is a passive ability that triggers when curse kills a unit
			// The logic is handled in Row.addCard when curse triggers
		}
	},
	peace_treaty: {
		name: "Peace Treaty",
		description: "This card stays on the board until the start of your next turn. Prevents any damaging effects (execution, scorch, et al) to your units until the start of your next turn.",
		placed: async (card) => {
			if (card.isLocked()) return;
			const player = card.holder;
			
			// Create custom container for Peace Treaty on the right side, between decks
			const panelRight = document.getElementById("panel-right");
			if (!panelRight) {
				console.error("panel-right not found for Peace Treaty placement");
				return;
			}
			
			// Create or get the peace treaty container
			let treatyContainer = document.getElementById("peace-treaty-container");
			if (!treatyContainer) {
				treatyContainer = document.createElement("div");
				treatyContainer.id = "peace-treaty-container";
				treatyContainer.className = "peace-treaty-container";
				// Position between decks (between deck-op and deck-me)
				const deckMe = document.getElementById("deck-me");
				if (deckMe) {
					panelRight.insertBefore(treatyContainer, deckMe);
				} else {
					panelRight.appendChild(treatyContainer);
				}
			}
			
			// Add the card to the container
			card.currentLocation = treatyContainer;
			if (card.elem && card.elem.parentNode) {
				card.elem.parentNode.removeChild(card.elem);
			}
			if (card.elem) {
				treatyContainer.appendChild(card.elem);
				card.elem.classList.add("peace-treaty-card");
			}
			
			// Set up protection flag
			if (!game.peaceTreatyActive) {
				game.peaceTreatyActive = {};
			}
			game.peaceTreatyActive[player.tag] = true;
			
			// Set up removal at start of next turn
			const removeHook = async () => {
				// turnStart runs before currPlayer switches, so check if opponent is the player who played Peace Treaty
				// Check if it's the player's turn starting and they have a peace treaty
				if (game.currPlayer && game.currPlayer.opponent() === player && game.peaceTreatyActive && game.peaceTreatyActive[player.tag]) {
					// Remove protection
					delete game.peaceTreatyActive[player.tag];
					
					// Remove blue glow class before sending to discard
					if (card.elem) {
						card.elem.classList.remove("peace-treaty-card");
					}
					
					// Remove card from container and send to grave
					if (card.elem && card.elem.parentNode === treatyContainer) {
						treatyContainer.removeChild(card.elem);
					}
					await board.toGrave(card, treatyContainer);
					
					// Clean up container if empty
					if (treatyContainer.children.length === 0 && treatyContainer.parentNode) {
						treatyContainer.remove();
					}
					
					return true; // Signal that this hook has been processed
				}
				return false;
			};
			
			game.turnStart.push(removeHook);
		},
		weight: (card, ai, max) => {
			// Value based on protecting units from damage
			const player = ai.player;
			const opponent = player.opponent();
			const totalUnits = player.getAllRowCards().filter(c => c.isUnit()).length;
			
			// AI should err on the side of not using Peace Treaty unless there are units on the field
			if (totalUnits === 0) {
				return 0; // Don't use Peace Treaty if no units to protect
			}
			
			const highValueUnits = player.getAllRowCards().filter(c => c.isUnit() && c.power >= 8).length;
			
			// More valuable if we have many units or high-value units to protect
			const protectionValue = totalUnits * 2 + highValueUnits * 5;
			
			// Check if opponent has damaging abilities
			const opponentHasScorch = opponent.getAllRowCards().some(c => 
				c.abilities.includes("scorch") || c.abilities.includes("scorch_c") || 
				c.abilities.includes("scorch_r") || c.abilities.includes("scorch_s")
			);
			const opponentHasExecute = opponent.getAllRowCards().some(c => 
				c.abilities.includes("execute")
			);
			
			const threatBonus = (opponentHasScorch ? 10 : 0) + (opponentHasExecute ? 5 : 0);
			
			return Math.min(protectionValue + threatBonus, 30);
		}
	},
	conspiracy: {
		name: "Conspiracy",
		description: "When this unit enters play, add a single special card from your graveyard into your deck, and discard 2 cards from your opponent's deck into their discard pile.",
		placed: async (card) => {
			if (card.isLocked()) return;
			const player = card.holder;
			const opponent = player.opponent();
			
			// Play conspiracy sound effect
			tocar("conspiracy", false);
			
			// Ensure card element is ready before animating
			// The animation should play over the card that triggers conspiracy
			if (card.elem && card.elem.children && card.elem.children.length > 0) {
				await card.animate("conspiracy", false, false);
			} else {
				// Wait a bit for card element to be ready
				await sleep(100);
				await card.animate("conspiracy", false, false);
			}
			
			// Find special cards in the discard pile
			const specialCardsInGrave = player.grave.cards.filter(c => c.isSpecial());
			
			// Add a single special card from graveyard to deck (if available)
			if (specialCardsInGrave.length > 0) {
				// For AI: choose randomly, for player: could show carousel but for simplicity, choose first/random
				const selectedCard = specialCardsInGrave[Math.floor(Math.random() * specialCardsInGrave.length)];
				await board.toDeck(selectedCard, player.grave);
			}
			
			// Discard 2 cards from opponent's deck into their discard pile
			for (let i = 0; i < 2 && opponent.deck.cards.length > 0; i++) {
				const cardToDiscard = opponent.deck.cards[0]; // Take from top of deck
				opponent.deck.removeCard(cardToDiscard);
				await board.toGrave(cardToDiscard, opponent.deck);
			}
		},
		weight: (card, ai, max) => {
			const player = ai.player;
			const opponent = player.opponent();
			const specialCardsInGrave = player.grave.cards.filter(c => c.isSpecial());
			
			// Value from recovering a special card (if available)
			const recoveryValue = specialCardsInGrave.length > 0 ? 5 : 0;
			
			// Value from discarding opponent's cards (disruption)
			// Each card discarded from opponent's deck is valuable
			const opponentDeckSize = opponent.deck.cards.length;
			const discardValue = Math.min(opponentDeckSize, 2) * 4; // Up to 2 cards, each worth 4 points
			
			// Bonus if opponent has few cards left in deck (more valuable to discard)
			const deckPressureBonus = opponentDeckSize < 5 ? 5 : (opponentDeckSize < 10 ? 2 : 0);
			
			return Math.min(card.power + recoveryValue + discardValue + deckPressureBonus, 25);
		}
	},
	skellige_tactics: {
		name: "Skellige Tactics",
		description: "When this unit is placed on the battlefield, move target Dimun Warship and target Cog into its row, as many as are in play (on the battlefield not in hand or deck or discard).",
		placed: async (card) => {
			if (card.isLocked()) return;
			const player = card.holder;
			const targetRow = card.currentLocation;
			
		if (!(targetRow instanceof Row)) return;
		
		// Play tactics sound effect
		tocar("tactics", false);
		
		await card.animate("skelligetactics", false, false);
			
			// Find all Dimun Warship and Cog cards on the battlefield
			const dimunWarships = player.getAllRowCards().filter(c => 
				c.key === "sk_dimun_warship" && 
				c.isUnit() && 
				c !== card &&
				!(c.currentLocation instanceof Row && c.currentLocation === targetRow) &&
				!c.isLocked()
			);
			
			const cogs = player.getAllRowCards().filter(c => 
				c.key === "sk_cog" && 
				c.isUnit() && 
				c !== card &&
				!(c.currentLocation instanceof Row && c.currentLocation === targetRow) &&
				!c.isLocked()
			);
			
			const cardsToMove = [...dimunWarships, ...cogs];
			
			if (cardsToMove.length === 0) return;
			
			// Move all target cards to the same row as this card
			await Promise.all(cardsToMove.map(async c => {
				const currentRow = c.currentLocation;
				if (currentRow instanceof Row && currentRow !== targetRow) {
					await board.moveTo(c, targetRow, currentRow);
				}
			}));
		},
		weight: (card, ai, max) => {
			const player = ai.player;
			// Count how many Dimun Warships and Cogs are on the battlefield
			const dimunWarships = player.getAllRowCards().filter(c => c.key === "sk_dimun_warship" && c.isUnit());
			const cogs = player.getAllRowCards().filter(c => c.key === "sk_cog" && c.isUnit());
			const totalShips = dimunWarships.length + cogs.length;
			
			if (totalShips === 0) {
				// No ships to pull, just base power
				return card.power;
			}
			
			// Calculate value based on consolidating ships
			let consolidationValue = totalShips * 2;
			
			// Bonus if ships are spread across multiple rows (more value in consolidating)
			const shipRows = new Set();
			[...dimunWarships, ...cogs].forEach(ship => {
				if (ship.currentLocation instanceof Row) {
					shipRows.add(ship.currentLocation);
				}
			});
			
			if (shipRows.size > 1) {
				consolidationValue += 3; // Bonus for consolidating from multiple rows
			}
			
			// Consider which row we'd place this card in
			// If card has flexible row placement, evaluate best row
			let bestRowValue = 0;
			if (card.row === "agile" || card.row === "any" || card.row === "ranged_siege" || card.row === "melee_siege") {
				// Evaluate potential rows
				const potentialRows = [];
				if (card.row === "agile" || card.row === "any" || card.row === "melee_siege") {
					potentialRows.push(board.getRow(card, "close", player));
				}
				if (card.row === "agile" || card.row === "any" || card.row === "ranged_siege") {
					potentialRows.push(board.getRow(card, "ranged", player));
				}
				if (card.row === "any" || card.row === "ranged_siege" || card.row === "melee_siege") {
					potentialRows.push(board.getRow(card, "siege", player));
				}
				
				// Find row with best synergies (horn, morale, existing units)
				potentialRows.forEach(row => {
					let rowValue = row.total;
					// Bonus if row has horn
					if (row.special.findCards(c => c.abilities.includes("horn")).length > 0) {
						rowValue += totalShips * 2; // Ships will benefit from horn
					}
					// Bonus if row has units (morale synergy)
					const rowUnits = row.cards.filter(c => c.isUnit()).length;
					if (rowUnits > 0) {
						rowValue += rowUnits; // Consolidation bonus
					}
					bestRowValue = Math.max(bestRowValue, rowValue);
				});
			} else {
				// Fixed row - evaluate that row
				const targetRow = board.getRow(card, card.row, player);
				bestRowValue = targetRow.total;
				if (targetRow.special.findCards(c => c.abilities.includes("horn")).length > 0) {
					bestRowValue += totalShips * 2;
				}
			}
			
			// Combine base value with consolidation and row synergy
			const totalValue = card.power + consolidationValue + Math.min(bestRowValue / 10, 5);
			
			return Math.min(totalValue, 30);
		}
	},
	veteran: {
		name: "Veteran",
		description: "Gains +1, +2, and +3 additional strength for up to 3 turns on the board. The bonus increments at the start of your next turn (+1 on turn 1, +2 on turn 2 for a total of +3, +3 on turn 3 for a total of +6).",
		placed: (card) => {
			// Initialize veteran turn counter
			card.veteranTurns = 0;
			card.veteranBonus = 0;
			
			// Add hook to game.turnStart to increment veteran bonus
			const veteranHook = async () => {
				// Check if card is still on the board
				const isOnBoard = card.currentLocation instanceof Row;
				if (!isOnBoard) {
					return true; // Remove hook if card is no longer on board
				}
				
				// turnStart runs before currPlayer switches, so check if opponent is the card owner
				// This means it's the card owner's turn starting
				const isOwnerTurnStarting = game.currPlayer && game.currPlayer.opponent() === card.holder;
				
				// Only trigger for the card owner's turn and if card is on board
				if (isOwnerTurnStarting && card.veteranTurns < 3) {
					card.veteranTurns++;
					
					// Calculate cumulative bonus: turn 1 = +1, turn 2 = +3, turn 3 = +6
					// Using triangular number formula: n * (n + 1) / 2
					card.veteranBonus = card.veteranTurns * (card.veteranTurns + 1) / 2;
					
					// Update the card's power
					card.currentLocation.updateScore();
					
					// Remove hook after 3 turns
					if (card.veteranTurns >= 3) {
						return true; // Signal to remove this hook
					}
					return false; // Don't remove the hook yet
				}
				
				return false;
			};
			
			game.turnStart.push(veteranHook);
		},
		weight: (card, ai, max) => {
			// Base value of the card
			let baseValue = Number(card_dict[card.key]["strength"]);
			
			// Veteran can gain up to +6 strength over 3 turns
			// Average expected value: if card stays 1 turn = +1, 2 turns = +3, 3 turns = +6
			// Conservative estimate: assume it gets at least +3 (2 turns) in most games
			// More valuable in longer rounds where it can reach full potential
			const expectedBonus = 3; // Conservative estimate
			
			return baseValue + expectedBonus;
		}
	},
	embargo: {
		name: "Embargo",
		description: "Prevents the opponent from drawing from their deck on their next turn only. The effect does not stack - only one unit can trigger embargo.",
		placed: async (card) => {
			if (card.isLocked()) return;
			
			const player = card.holder;
			const opponent = player.opponent();
			
			// Only one embargo can be active at a time - remove any existing embargo
			if (game.embargoActive) {
				// Remove existing embargo animation
				if (game.embargoActive.deckAnim && game.embargoActive.deckAnim.parentNode) {
					game.embargoActive.deckAnim.parentNode.removeChild(game.embargoActive.deckAnim);
				}
				// Remove existing turn hooks
				if (game.embargoActive.turnStartHook) {
					const index = game.turnStart.indexOf(game.embargoActive.turnStartHook);
					if (index > -1) game.turnStart.splice(index, 1);
				}
				if (game.embargoActive.turnEndHook) {
					const index = game.turnEnd.indexOf(game.embargoActive.turnEndHook);
					if (index > -1) game.turnEnd.splice(index, 1);
				}
			}
			
			// Play animation over the unit first
			tocar("embargo", false); // Play embargo sound effect
			await card.animate("embargo");
			
			// Then play animation over opponent's deck and keep it static
			const deckElem = opponent.deck.elem;
			if (deckElem) {
				const deckAnim = document.createElement("div");
				deckAnim.style.position = "absolute";
				deckAnim.style.top = "0";
				deckAnim.style.left = "0";
				deckAnim.style.width = "100%";
				deckAnim.style.height = "100%";
				deckAnim.style.backgroundImage = iconURL("anim_embargo");
				deckAnim.style.backgroundSize = "cover";
				deckAnim.style.backgroundPosition = "center";
				deckAnim.style.pointerEvents = "none";
				deckAnim.style.zIndex = "1000";
				deckAnim.style.opacity = "1"; // Start visible (static animation)
				deckElem.style.position = "relative";
				deckElem.appendChild(deckAnim);
				
				// Store embargo state
				game.embargoActive = {
					blockedPlayer: opponent,
					deckAnim: deckAnim,
					deckElem: deckElem,
					turnStartHook: null,
					turnEndHook: null
				};
				
				// Set up turnStart hook to ensure embargo is active during opponent's turn
				const turnStartHook = async () => {
					// Check if it's the blocked player's turn starting
					if (game.currPlayer === opponent && game.embargoActive && game.embargoActive.blockedPlayer === opponent) {
						// Ensure animation is visible
						if (game.embargoActive.deckAnim) {
							game.embargoActive.deckAnim.style.opacity = "1";
						}
					}
					return false; // Don't remove hook
				};
				
				// Set up turnEnd hook to remove embargo when opponent's turn ends
				// turnEnd runs before currPlayer switches, so check if current player is the blocked player
				const turnEndHook = async () => {
					// Check if it's the blocked player's turn ending (before switch)
					if (game.currPlayer === opponent && game.embargoActive && game.embargoActive.blockedPlayer === opponent) {
						// Remove animation
						if (game.embargoActive.deckAnim && game.embargoActive.deckElem) {
							fadeOut(game.embargoActive.deckAnim, 300);
							await sleep(300);
							if (game.embargoActive.deckAnim.parentNode === game.embargoActive.deckElem) {
								game.embargoActive.deckElem.removeChild(game.embargoActive.deckAnim);
							}
						}
						// Clear embargo state
						game.embargoActive = null;
						return true; // Remove this hook
					}
					return false;
				};
				
				game.embargoActive.turnStartHook = turnStartHook;
				game.embargoActive.turnEndHook = turnEndHook;
				
				game.turnStart.push(turnStartHook);
				game.turnEnd.push(turnEndHook);
			}
		},
		weight: (card, ai, max) => {
			// Embargo is valuable for disrupting opponent's card draw
			// More valuable if opponent has few cards in hand or relies on drawing
			const opponent = ai.player.opponent();
			const handSize = opponent.hand.cards.length;
			const deckSize = opponent.deck.cards.length;
			
			// Base value
			let value = card.power;
			
			// More valuable if opponent has few cards (they need to draw)
			if (handSize <= 3) value += 5;
			else if (handSize <= 5) value += 3;
			
			// More valuable if opponent has many cards in deck (more potential draws to block)
			if (deckSize > 15) value += 2;
			
			return Math.min(value, 20);
		}
	},
	sign_igni: {
		name: "Sign: Igni",
		description: "Scorch the strongest non-Hero unit on the opposing row, but only if its strength is ≥ 7.",
		placed: async (card, row) => {
			if (card.isLocked()) return;
			const player = card.holder;
			const opponent = player.opponent();
			
			// Get the opposite row
			const oppositeRow = row.getOppositeRow();
			if (!oppositeRow) return;
			
			// Check if Peace Treaty blocks this
			if (game.peaceTreatyActive[opponent.id]) {
				// Peace Treaty blocks Igni
				const source = card.currentLocation || card.holder.hand;
				await board.toGrave(card, source);
				return;
			}
			
			// Find strongest non-Hero unit on the opposing row
			const units = oppositeRow.cards.filter(c => c.isUnit() && !c.hero);
			if (units.length === 0) {
				const source = card.currentLocation || card.holder.hand;
				await board.toGrave(card, source);
				return;
			}
			
			// Sort by power (descending) and find strongest with strength >= 7
			const sortedUnits = units.sort((a, b) => b.power - a.power);
			const target = sortedUnits.find(u => u.power >= 7);
			
			if (!target) {
				// No valid target (strength < 7)
				const source = card.currentLocation || card.holder.hand;
				await board.toGrave(card, source);
				return;
			}
			
			// Play animation
			await card.animate("scorch");
			
			// Scorch the target
			await target.animate("scorch", true, false);
			await board.toGrave(target, oppositeRow);
			const source = card.currentLocation || card.holder.hand;
			await board.toGrave(card, source);
			board.updateScores();
		},
		weight: (card, ai, max) => {
			const player = ai.player;
			const opponent = player.opponent();
			
			// Check if Peace Treaty is active
			if (game.peaceTreatyActive[opponent.id]) {
				return -50; // Cannot use if Peace Treaty is active
			}
			
			// Check all opponent rows for valid targets
			let bestValue = -10;
			for (let i = 0; i < 3; i++) {
				const opponentRow = board.row[3 + i]; // Opponent's rows
				const units = opponentRow.cards.filter(c => c.isUnit() && !c.hero && c.power >= 7);
				if (units.length > 0) {
					const strongest = units.sort((a, b) => b.power - a.power)[0];
					// Value is the power of the unit we'd destroy
					bestValue = Math.max(bestValue, strongest.power);
				}
			}
			
			return bestValue;
		}
	},
	sign_quen: {
		name: "Sign: Quen",
		description: "This unit becomes unaffected by weather effects.",
		placed: async (card, row) => {
			if (card.isLocked()) return;
			const player = card.holder;
			
			// Show carousel of units to protect
			const units = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			if (units.length === 0) {
				const source = card.currentLocation || card.holder.hand;
				await board.toGrave(card, source);
				return;
			}
			
			// For AI: select best unit to protect
			if (player.controller instanceof ControllerAI) {
				// Find unit most affected by weather
				const weatherRows = [];
				for (let i = 0; i < 6; i++) {
					if (board.row[i].effects.weather) {
						weatherRows.push(board.row[i]);
					}
				}
				
				let bestTarget = null;
				let bestValue = 0;
				units.forEach(unit => {
					const unitRow = unit.currentLocation;
					if (unitRow && unitRow.effects.weather && unit.power > 1) {
						const value = unit.power - 1; // How much power we'd save
						if (value > bestValue) {
							bestValue = value;
							bestTarget = unit;
						}
					}
				});
				
				if (bestTarget) {
					bestTarget.weatherImmune = true;
					bestTarget.currentLocation.updateScore();
					await card.animate("quen");
					const source = card.currentLocation || card.holder.hand;
					await board.toGrave(card, source);
					board.updateScores();
					return;
				}
			}
			
			// For player: show carousel
			const selected = await ui.carousel(units, "Select a unit to protect from weather");
			const source = card.currentLocation || card.holder.hand;
			if (selected) {
				selected.weatherImmune = true;
				selected.currentLocation.updateScore();
				await card.animate("quen");
				await board.toGrave(card, source);
				board.updateScores();
			} else {
				await board.toGrave(card, source);
			}
		},
		weight: (card, ai, max) => {
			// Handle case where ai might be undefined (called from different contexts)
			if (!ai || !ai.player) {
				// Fallback: use card.holder if ai is not available
				const player = card.holder;
				if (!player) return -5; // Can't evaluate without player
				const units = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
				
				// Find units affected by weather
				let totalValue = 0;
				units.forEach(unit => {
					const unitRow = unit.currentLocation;
					if (unitRow && unitRow.effects.weather && unit.power > 1 && !unit.weatherImmune) {
						totalValue += (unit.power - 1); // Power we'd save
					}
				});
				
				return totalValue > 0 ? totalValue : -5;
			}
			
			const player = ai.player;
			const units = player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
			
			// Find units affected by weather
			let totalValue = 0;
			units.forEach(unit => {
				const unitRow = unit.currentLocation;
				if (unitRow && unitRow.effects.weather && unit.power > 1 && !unit.weatherImmune) {
					totalValue += (unit.power - 1); // Power we'd save
				}
			});
			
			return totalValue > 0 ? totalValue : -5;
		}
	},
	sign_yrden: {
		name: "Sign: Yrden",
		description: "Remove any row effects from chosen row.",
		placed: async (card, row) => {
			if (card.isLocked()) return;
			
			// Remove all row effects
			// Clear weather
			if (row.effects.weather) {
				row.removeOverlay(weather.types.frost.name);
				row.removeOverlay(weather.types.fog.name);
				row.removeOverlay(weather.types.rain.name);
				row.removeOverlay(weather.types.sandstorm.name);
				row.removeOverlay(weather.types.storm.name);
				row.effects.weather = false;
			}
			
			// Clear nightfall
			if (row.effects.nightfall) {
				row.removeOverlay("nightfall");
				row.effects.nightfall = false;
			}
			
			// Remove horn/morale/mardroeme/wine effects
			row.effects.horn = 0;
			row.effects.morale = 0;
			row.effects.mardroeme = 0;
			row.effects.toussaint_wine = 0;
			
			// Remove special cards that provide effects
			const hornCards = row.special.cards.filter(c => c.abilities.includes("horn") || c.abilities.includes("redania_horn"));
			for (const hornCard of hornCards) {
				await board.toGrave(hornCard, row);
			}
			
			const moraleCards = row.special.cards.filter(c => c.abilities.includes("morale"));
			for (const moraleCard of moraleCards) {
				await board.toGrave(moraleCard, row);
			}
			
			const mardroemeCards = row.special.cards.filter(c => c.abilities.includes("mardroeme"));
			for (const mardroemeCard of mardroemeCards) {
				await board.toGrave(mardroemeCard, row);
			}
			
			const wineCards = row.special.cards.filter(c => c.abilities.includes("toussaint_wine") || c.abilities.includes("wine"));
			for (const wineCard of wineCards) {
				await board.toGrave(wineCard, row);
			}
			
			await card.animate("yrden");
			const source = card.currentLocation || card.holder.hand;
			await board.toGrave(card, source);
			row.updateScore();
			board.updateScores();
		},
		weight: (card, ai, max) => {
			const player = ai.player;
			const opponent = player.opponent();
			
			// Check both player's and opponent's rows
			let bestValue = -5;
			
			// Check opponent rows (remove their beneficial effects)
			for (let i = 0; i < 3; i++) {
				const row = board.row[3 + i]; // Opponent's rows
				let value = 0;
				
				// Value of removing weather (if it hurts opponent)
				if (row.effects.weather) {
					const units = row.cards.filter(c => c.isUnit() && !c.hero);
					units.forEach(unit => {
						if (unit.power > 1) {
							value += (unit.power - 1); // Power restored
						}
					});
				}
				
				// Value of removing horn (if opponent has it)
				if (row.effects.horn > 0) {
					const units = row.cards.filter(c => c.isUnit());
					units.forEach(unit => {
						value += unit.power; // Power lost by opponent
					});
				}
				
				// Value of removing morale/wine
				if (row.effects.morale > 0 || row.effects.toussaint_wine > 0) {
					const units = row.cards.filter(c => c.isUnit());
					value += units.length * (row.effects.morale + row.effects.toussaint_wine * 2);
				}
				
				bestValue = Math.max(bestValue, value);
			}
			
			// Check own rows (remove negative effects)
			for (let i = 0; i < 3; i++) {
				const row = board.row[i]; // Player's rows
				let value = 0;
				
				// Value of removing weather (if it hurts us)
				if (row.effects.weather) {
					const units = row.cards.filter(c => c.isUnit() && !c.hero);
					units.forEach(unit => {
						if (unit.power > 1) {
							value += (unit.power - 1); // Power restored
						}
					});
				}
				
				bestValue = Math.max(bestValue, value);
			}
			
			return bestValue;
		}
	},
	sign_axii: {
		name: "Sign: Axii",
		description: "Move the Melee unit(s) with the lowest strength on your side of the board/ Their abilities won't work anymore.",
		activated: async card => {
			let opCloseRow = board.getRow(card, "close", card.holder.opponent());
			let meCloseRow = board.getRow(card, "close", card.holder);
			if (opCloseRow.isShielded()) return;
			let units = opCloseRow.minUnits();
			if (units.length === 0) return;
			await Promise.all(units.map(async c => await c.animate("seize")));
			units.forEach(async c => {
				c.holder = card.holder;
				await board.moveToNoEffects(c, meCloseRow, opCloseRow);
			});
			await board.toGrave(card, card.holder.hand);
		},
		weight: (card) => {
			if (card.holder.opponent().getAllRows()[0].isShielded()) return 0;
			return card.holder.opponent().getAllRows()[0].minUnits().reduce((a, c) => a + c.power, 0) * 2
		}
	},
	novigrad_sigismund: {
		name: "Sigismund Dijkstra",
		description: "Once per game, prevent the first death of a friendly unit.",
		gameStart: (card, player) => {
			player.sigismundDeathPreventionUsed = false;
		}
	},
	novigrad_sigismund2: {
		name: "Sigismund Dijkstra",
		description: "If an opponent plays a spy on you, draw 1 card.",
		placed: async (card) => {
			// This ability is passive - it triggers when a spy is placed on this player's side
			// The actual logic is handled in the spy ability's placed function
		}
	},
};