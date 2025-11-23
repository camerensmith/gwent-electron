"use strict"

class Controller {}

class ControllerAI {
	constructor(player) {
		this.player = player;
	}

	async startTurn(player) {
		if (player.opponent().passed && (player.winning || player.deck.faction === "nilfgaard" && player.total === player.opponent().total)) {
			nilfgaard_wins_draws = player.deck.faction === "nilfgaard" && player.total === player.opponent().total;
			await player.passRound();
			return;
		}
		let diff = player.opponent().total - player.total;
		
		// Declare round and health variables at the top for use throughout the function
		const isRound2 = game.roundCount === 2;
		const isRound3 = game.roundCount === 3;
		const isTied1to1 = player.health === 1 && player.opponent().health === 1;
		const lostRound1 = player.health === 1; // Lost round 1 (health decreased from 2 to 1)
		const opponentWonRound1 = player.opponent().health === 1; // Opponent won round 1
		
		// CRITICAL: If score is tied 1-1 in round 3, AI cannot pass (would lose game)
		if (isRound3 && isTied1to1) {
			// Score is tied 1-1 - whoever loses round 3 loses the game
			// AI cannot pass under ANY circumstances - must fight to the end
			console.log("🚫 Round 3: Score tied 1-1 - cannot pass (must win or lose game)");
			// Skip all strategic passing logic below - go straight to card playing
		} else {
			// Not round 3 with 1-1 tie - proceed with strategic passing logic
		
		// CRITICAL: If AI lost round 1, they cannot concede round 2 (would result in game loss)
		
		if (isRound2 && lostRound1) {
			// AI lost round 1 - they MUST win round 2 or lose the game
			// If they're losing, they cannot pass under any circumstances
			if (diff > 0) {
				// AI is losing in round 2 - cannot pass, must fight
				console.log("🚫 Round 2: AI lost round 1 and is losing - cannot pass (must win or lose game)");
				// Continue to play cards - don't allow strategic passing
			} else {
				// AI is winning or tied - can use default logic
				// BUT: Check if AI must play 3 cards first
				if (player.mustPlay3CardsRound2 && (player.round2CardsPlayed || 0) < 3) {
					// Cannot pass yet - must play 3 cards first
					console.log(`🎯 Round 2: AI must play 3 cards - has played ${player.round2CardsPlayed || 0}/3, blocking strategic pass`);
				} else {
					// Strategic passing based on turn count and score difference
					const turnCount = player.turnCount || 0;
					if (turnCount >= 2 && turnCount <= 4) {
						// Check for winning passing (any amount ahead)
						if (diff < 0) {
							let passChance = 0;
							if (turnCount === 2) passChance = 0.25; // 25% chance on turn 2
							else if (turnCount === 3) passChance = 0.55; // 55% chance on turn 3
							else if (turnCount === 4) passChance = 0.85; // 85% chance on turn 4
							
							if (Math.random() < passChance) {
								console.log(`⚠️ Turn ${turnCount}: AI is winning by ${Math.abs(diff)} points - strategic pass (${Math.round(passChance * 100)}% chance)`);
								await player.passRound();
								return;
							}
						}
					}
				}
			}
		} else if (isRound2 && opponentWonRound1) {
			// Opponent won round 1 - use default strategic passing logic
			// BUT: Check if AI must play 3 cards first
			if (player.mustPlay3CardsRound2 && (player.round2CardsPlayed || 0) < 3) {
				// Cannot pass yet - must play 3 cards first
				console.log(`🎯 Round 2: AI must play 3 cards - has played ${player.round2CardsPlayed || 0}/3, blocking strategic pass`);
			} else {
				const turnCount = player.turnCount || 0;
				if (turnCount >= 2 && turnCount <= 4) {
					// Check for deficit passing (5+ points behind)
					if (diff >= 5) {
						let passChance = 0;
						if (turnCount === 2) passChance = 0.50; // 50% chance on turn 2
						else if (turnCount === 3) passChance = 0.60; // 60% chance on turn 3
						else if (turnCount === 4) passChance = 0.70; // 70% chance on turn 4
						
						if (Math.random() < passChance) {
							console.log(`⚠️ Turn ${turnCount}: AI has ${diff} point deficit - strategic pass (${Math.round(passChance * 100)}% chance)`);
							await player.passRound();
							return;
						}
					}
					
					// Check for winning passing (any amount ahead)
					if (diff < 0) {
						let passChance = 0;
						if (turnCount === 2) passChance = 0.35; // 35% chance on turn 2
						else if (turnCount === 3) passChance = 0.75; // 75% chance on turn 3
						else if (turnCount === 4) passChance = 0.95; // 95% chance on turn 4
						
						if (Math.random() < passChance) {
							console.log(`⚠️ Turn ${turnCount}: AI is winning by ${Math.abs(diff)} points - strategic pass (${Math.round(passChance * 100)}% chance)`);
							await player.passRound();
							return;
						}
					}
				}
			}
		} else {
			// Not round 2, or neither player lost round 1 - use default strategic passing
			// BUT skip if round 3 with 1-1 tie (cannot pass in deciding round)
			// AND check if AI must play 3 cards in round 2
			if (!(isRound3 && isTied1to1)) {
				// Check if AI must play 3 cards in round 2
				if (isRound2 && player.mustPlay3CardsRound2 && (player.round2CardsPlayed || 0) < 3) {
					// Cannot pass yet - must play 3 cards first
					console.log(`🎯 Round 2: AI must play 3 cards - has played ${player.round2CardsPlayed || 0}/3, blocking strategic pass`);
				} else {
					const turnCount = player.turnCount || 0;
					if (turnCount >= 2 && turnCount <= 4) {
						// Check for deficit passing (5+ points behind)
						if (diff >= 5) {
							let passChance = 0;
							if (turnCount === 2) passChance = 0.50; // 50% chance on turn 2
							else if (turnCount === 3) passChance = 0.60; // 60% chance on turn 3
							else if (turnCount === 4) passChance = 0.70; // 70% chance on turn 4
							
							if (Math.random() < passChance) {
								console.log(`⚠️ Turn ${turnCount}: AI has ${diff} point deficit - strategic pass (${Math.round(passChance * 100)}% chance)`);
								await player.passRound();
								return;
							}
						}
						
						// Check for winning passing (any amount ahead)
						if (diff < 0) {
							let passChance = 0;
							if (turnCount === 2) passChance = 0.35; // 35% chance on turn 2
							else if (turnCount === 3) passChance = 0.75; // 75% chance on turn 3
							else if (turnCount === 4) passChance = 0.95; // 95% chance on turn 4
							
							if (Math.random() < passChance) {
								console.log(`⚠️ Turn ${turnCount}: AI is winning by ${Math.abs(diff)} points - strategic pass (${Math.round(passChance * 100)}% chance)`);
								await player.passRound();
								return;
							}
						}
					}
				}
			}
		}
		} // End of else block for strategic passing (skipped if round 3 with 1-1 tie)
		
		// CRITICAL RULE: In round 1, if there's a 20+ point deficit, always pass
		// This prevents wasting cards when the round is already lost
		const isRound1Deficit = game.roundCount === 1;
		const cardsOnBoardDeficit = player.getAllRowCards().length;
		if (isRound1Deficit && diff >= 20 && cardsOnBoardDeficit > 0) {
			// Only pass if we've played at least one card (not first turn)
			console.log("⚠️ Round 1: AI has 20+ point deficit - passing to conserve cards");
			await player.passRound();
			return;
		}
		
		let data_max = this.getMaximums();
		let data_board = this.getBoardData();
		let weights = player.hand.cards.map(
			c => ({
				weight: this.weightCard(c, data_max, data_board),
				action: async () => await this.playCard(c, data_max, data_board),
				card: c
			})
		);
		if (player.opponent().passed && diff < 16) {
			let oneshot = weights.filter(w => (w.card.basePower > diff && w.card.basePower < diff + 5) || (w.weight > diff && w.weight > diff + 5));
			if (oneshot.length > 0) {
				let oneshot_card = oneshot.sort((a, b) => (a.weight - b.weight))[0];
				await oneshot_card.action();
				return;
			}
			let playable = weights.filter(w => w.weight > 0).sort((a, b) => (b.weight - a.weight));
			if (playable.length > 2) playable = playable.slice(0, 2);
			let weightTotal = playable.reduce((a, c) => a + c.weight, 0);
			if (weightTotal > diff) {
				await playable[0].action();
				return;
			}
		}
		if (player.leaderAvailable) weights.push({
			name: "Leader Ability",
			weight: this.weightLeader(player.leader, data_max, data_board),
			action: async () => {
				await ui.notification("op-leader", 1200);
				await player.activateLeader();
			}
		});
		if (player.factionAbilityUses > 0) {
			let factionAbility = factions[player.deck.faction];
			weights.push({
				name: "Faction ability",
				weight: factionAbility.weight(player),
				action: async () => {
					await player.useFactionAbility();
				}
			});
		}
		// Calculate pass weight
		let passWeight = this.weightPass();
		const opponent = player.opponent();
		
		// CRITICAL: If score is tied 1-1 in round 3, AI cannot pass if losing or tied (would lose game)
		if (isRound3 && isTied1to1 && diff >= 0) {
			// Score is tied 1-1 and AI is losing or tied - cannot pass
			passWeight = 0;
			console.log("🚫 Round 3: Score tied 1-1 and AI is losing/tied - pass weight set to 0 (must win or lose game)");
		}
		
		// CRITICAL: If AI lost round 1, they cannot pass in round 2 if losing (would lose game)
		// Reuse isRound2 and lostRound1 from earlier in the function
		if (isRound2 && lostRound1 && diff > 0) {
			// AI lost round 1 and is losing in round 2 - cannot pass
			passWeight = 0;
			console.log("🚫 Round 2: AI lost round 1 and is losing - pass weight set to 0 (must win or lose game)");
		}
		
		// NEW LOGIC: If AI has 8+ cards and must play 3 cards in round 2, prevent passing until 3 cards are played
		if (isRound2 && player.mustPlay3CardsRound2) {
			const cardsPlayedThisRound = player.round2CardsPlayed || 0;
			if (cardsPlayedThisRound < 3) {
				// Must play at least 3 cards - cannot pass yet
				passWeight = 0;
				console.log(`🎯 Round 2: AI must play 3 cards - has played ${cardsPlayedThisRound}/3, cannot pass yet`);
			} else {
				// Has played 3+ cards, can now use normal pass logic
				console.log(`✅ Round 2: AI has played ${cardsPlayedThisRound} cards - can now pass normally`);
			}
		}
		
		// Filter out cards with negative or zero weight (bad plays)
		const playableWeights = weights.filter(w => w.weight > 0);
		
		// NEVER allow passing if starting the first round without playing any cards
		const isFirstRoundStart = game.roundCount === 1 && player.getAllRowCards().length === 0 && !opponent.passed;
		if (isFirstRoundStart && player.hand.cards.length > 0) {
			// Remove pass option completely - must play at least one card
			passWeight = 0;
		}
		
		// CRITICAL RULE: In round 1, NEVER go below 5 cards in hand
		// If playing a card from hand would leave fewer than 5 cards, force pass instead
		const isRound1 = game.roundCount === 1;
		const currentCards = player.hand.cards.length;
		if (isRound1 && currentCards === 5 && !isFirstRoundStart) {
			// We have exactly 5 cards - playing any card from hand would leave us with 4
			// Filter out card plays and only allow leader/faction abilities or pass
			const cardPlays = weights.filter(w => w.card);
			const nonCardPlays = weights.filter(w => !w.card);
			
			// If we have leader or faction abilities, we can still use those (they don't consume hand cards)
			if (nonCardPlays.length > 0) {
				// Remove card plays from consideration
				weights = nonCardPlays;
				// Add pass with high weight
				passWeight = 1000;
				console.log("⚠️ Round 1: AI has 5 cards - removing card plays, only allowing leader/faction abilities or pass");
			} else {
				// No leader/faction abilities available - must pass
				console.log("⚠️ Round 1: AI has 5 cards - passing to maintain minimum of 5 cards");
				await player.passRound();
				return;
			}
		}
		
		// CRITICAL: NEVER allow passing in round 3 (deciding round) - must play all cards
		const isDecidingRound = game.roundCount === 3;
		if (isDecidingRound) {
			// In round 3, NEVER pass if we have ANY cards in hand
			// Even if all cards are "unplayable" (decoy with no target, bad weather, etc.),
			// we must still try to play the best available option
			if (player.hand.cards.length > 0) {
				// We have cards - remove pass option completely, must play something
				passWeight = 0;
				console.log("⚠️ Round 3: AI has cards - pass weight set to 0, must play cards");
			}
			// Only if we have NO cards at all can we pass in round 3
		}
		
		// If we have playable cards, prioritize them over passing
		if (playableWeights.length > 0) {
			// Add pass option if:
			// 1. Very high weight (1000+) - critical rules like "never go below 4 cards in round 1"
			// 2. OR strategically sound (opponent passed and we're winning)
			// BUT never in first round before playing any cards, and NEVER in round 3
			// DOUBLE CHECK: In round 3, NEVER add pass, even if weightPass() returned a high value
			if (passWeight >= 1000 && !isFirstRoundStart && !isDecidingRound) {
				// Critical pass (e.g., must conserve cards in round 1) - always add
				weights.push({
					name: "Pass",
					weight: passWeight,
					action: async () => await player.passRound()
				});
			} else if (passWeight >= 20 && opponent.passed && player.winning && !isFirstRoundStart && !isDecidingRound) {
				// Strategic pass - opponent passed and we're winning
				weights.push({
					name: "Pass",
					weight: passWeight,
					action: async () => await player.passRound()
				});
			}
			
			// CRITICAL SAFETY CHECK: In round 3, remove pass from weights if it somehow got added
			if (isDecidingRound && player.hand.cards.length > 0) {
				weights = weights.filter(w => w.name !== "Pass");
				console.log("⚠️ Round 3: Removed pass option from weights array - must play cards");
			}
			
			// Calculate total weight from playable cards
			let weightTotal = weights.reduce((a, c) => a + c.weight, 0);
			
			// If we have playable cards, use weighted random selection
			if (weightTotal > 0) {
			for (var i = 0; i < weights.length; ++i) {
				if (weights[i].card) console.log("[" + weights[i].card.name + "] Weight: " + weights[i].weight);
				else console.log("[" + weights[i].name + "] Weight: " + weights[i].weight);
			}
			let rand = randomInt(weightTotal);
			console.log("Chosen weight: " + rand);
			for (var i = 0; i < weights.length; ++i) {
				rand -= weights[i].weight;
				if (rand < 0) break;
			}
			console.log(weights[i]);
			await weights[i].action();
				return;
			}
		}
		
		// Fallback: if no playable cards, try to play any card (even with low weight)
		const allCardWeights = weights.filter(w => w.card);
		if (allCardWeights.length > 0) {
			// Sort by weight (best to worst) and play the best available
			allCardWeights.sort((a, b) => b.weight - a.weight);
			
			// Check if the best card is a Decoy - if so, verify it can actually be played
			const bestCard = allCardWeights[0].card;
			const isDecidingRound = game.roundCount === 3;
			if (bestCard && (bestCard.key === "spe_decoy" || bestCard.abilities.includes("decoy"))) {
				// Decoy requires a valid target - check if one exists
				const hasValidTarget = player.getAllRowCards().some(c => c.isUnit());
				if (!hasValidTarget) {
					// No valid target for decoy
					if (isDecidingRound) {
						// In round 3, skip Decoy and try the next best card instead of passing
						console.log("⚠️ Round 3: Decoy has no valid targets - trying next best card");
						if (allCardWeights.length > 1) {
							// Try the next best card
							await allCardWeights[1].action();
							return;
						}
						// No other cards - will fall through to round 3 logic below
					} else {
						// Not round 3 - can pass if Decoy is unplayable
						console.log("⚠️ AI only has Decoy but no valid targets - passing turn");
						await player.passRound();
						return;
					}
				}
			}
			
			// Check if the best card is clear weather with negative weight
			// Only play it if it's the only option (all other cards also have negative/zero weight)
			const isClearWeather = bestCard && (bestCard.key === "spe_clear" || bestCard.ability === "clear");
			if (isClearWeather && allCardWeights[0].weight < 0) {
				// Check if there are other non-weather cards available
				const nonWeatherCards = allCardWeights.filter(w => 
					w.card && w.card.row !== "weather" && !(w.card.deck && w.card.deck.startsWith("weather"))
				);
				if (nonWeatherCards.length > 0) {
					// Don't play clear weather if there are other options, even if they're bad
					// Play the best non-weather card instead
					await nonWeatherCards[0].action();
					return;
				}
				// Only clear weather available - play it even if negative weight
			}
			
			// Play the best card even if weight is low/negative (better than passing)
			await allCardWeights[0].action();
			return;
		}
		
		// Last resort: only pass if truly no options
		// BUT NEVER pass if starting the first round without playing any cards
		// AND NEVER pass in round 3 (deciding round) unless truly no options
		// Reuse isFirstRoundStart variable declared earlier in function
		const isDecidingRoundFinal = game.roundCount === 3;
		
		if (isFirstRoundStart && player.hand.cards.length > 0) {
			// Force play the best available card, even if it has negative weight
			// This ensures we always play at least one card in round 1
			const allCardWeights = weights.filter(w => w.card);
			if (allCardWeights.length > 0) {
				allCardWeights.sort((a, b) => b.weight - a.weight);
				await allCardWeights[0].action();
				return;
			}
		}
		
		// In round 3, force playing ANY card before passing
		if (isDecidingRoundFinal && player.hand.cards.length > 0) {
			const allCardWeights = weights.filter(w => w.card);
			if (allCardWeights.length > 0) {
				// Sort by weight and play the best available, even if negative
				allCardWeights.sort((a, b) => b.weight - a.weight);
				// Only pass if ALL cards are truly unplayable (decoy with no target, etc.)
				// But even then, try to play the "least bad" option
				const bestCard = allCardWeights[0];
				if (bestCard && bestCard.card) {
					// Check if it's a decoy with no target
					if ((bestCard.card.key === "spe_decoy" || bestCard.card.abilities.includes("decoy")) && 
						!player.getAllRowCards().some(c => c.isUnit())) {
						// Decoy with no target - truly unplayable, must pass
						console.log("⚠️ Round 3: Only Decoy with no target - must pass");
						await player.passRound();
						return;
					}
					// Otherwise, play the card even if it has negative weight
					await bestCard.action();
					return;
				}
			}
		}
		
		await player.passRound();
	}

	isSelfRowIndex(i) {
		return (this.player === player_me && i > 2) || (this.player === player_op && i < 3);
	}

	getSelfRowIndexes() {
		if (this.player === player_me) return [3, 4, 5];
		return [0, 1, 2];
	}

	getMaximums() {
		let rmax = board.row.map(
			r => ({
				row: r,
				cards: r.cards.filter(c => c.isUnit()).reduce((a, c) =>
					(!a.length || a[0].power < c.power) ? [c] : a[0].power === c.power ? a.concat([c]) : a, []
				)
			})
		);
		let max = rmax.filter((r, i) => r.cards.length && this.isSelfRowIndex(i)).reduce((a, r) => Math.max(a, r.cards[0].power), 0);
		let max_me = rmax.filter((r, i) => this.isSelfRowIndex(i) && r.cards.length && r.cards[0].power === max).reduce(
			(a, r) => a.concat(
				r.cards.map(
					c => ({
						row: r,
						card: c
					})
				)
			), []
		);
		max = rmax.filter((r, i) => r.cards.length && !this.isSelfRowIndex(i)).reduce((a, r) => Math.max(a, r.cards[0].power), 0);
		let max_op = rmax.filter((r, i) => !this.isSelfRowIndex(i) && r.cards.length && r.cards[0].power === max).reduce(
			(a, r) => a.concat(
				r.cards.map(
					c => ({
						row: r,
						card: c
					})
				)
			), []
		);
		let rmax_noshield = rmax.filter((r, i) => !r.row.isShielded());
		let max_noshield = rmax_noshield.filter((r, i) => r.cards.length && this.isSelfRowIndex(i)).reduce((a, r) => Math.max(a, r.cards[0].power), 0);
		let max_me_noshield = rmax_noshield.filter((r, i) => this.isSelfRowIndex(i) && r.cards.length && r.cards[0].power === max_noshield).reduce(
			(a, r) => a.concat(
				r.cards.map(
					c => ({
						row: r,
						card: c
					})
				)
			), []
		);
		max_noshield = rmax_noshield.filter((r, i) => r.cards.length && !this.isSelfRowIndex(i)).reduce((a, r) => Math.max(a, r.cards[0].power), 0);
		let max_op_noshield = rmax_noshield.filter((r, i) => !this.isSelfRowIndex(i) && r.cards.length && r.cards[0].power === max_noshield).reduce(
			(a, r) => a.concat(
				r.cards.map(
					c => ({
						row: r,
						card: c
					})
				)
			), []
		);
		return {
			rmax: rmax,
			me: max_me,
			op: max_op,
			rmax_noshield: rmax_noshield,
			me_noshield: max_me_noshield,
			op_noshield: max_op_noshield
		};
	}

	getBoardData() {
		let data = this.countCards(new CardContainer());
		this.player.getAllRows().forEach(r => this.countCards(r, data));
		data.grave_me = this.countCards(this.player.grave);
		data.grave_op = this.countCards(this.player.opponent().grave);
		return data;
	}

	countCards(container, data) {
		data = data ? data : {
			spy: [],
			medic: [],
			bond: {},
			scorch: []
		};
		container.cards.filter(c => c.isUnit()).forEach(c => {
			for (let x of c.abilities) {
				if (!c.isLocked()) {
					switch (x) {
						case "spy":
						case "medic":
							data[x].push(c);
							break;
						case "scorch_r":
						case "scorch_c":
						case "scorch_s":
							data["scorch"].push(c);
							break;
						case "bond":
							if (!data.bond[c.target]) data.bond[c.target] = 0;
							data.bond[c.target]++;
					}
				}
			}
		});
		return data;
	}

	redraw() {
		// Safety check: Don't redraw if deck is empty
		if (this.player.deck.cards.length === 0) {
			console.warn("Attempted to redraw from empty deck");
			return;
		}
		let card = this.discardOrder({
			holder: this.player
		}).shift();
		if (card && card.power < 15) {
			// Double-check deck still has cards before swapping
			if (this.player.deck.cards.length > 0) {
				this.player.deck.swap(this.player.hand, this.player.hand.removeCard(card));
			}
		}
	}

	discardOrder(card, src = null) {
		let cards = [];
		let groups = {};
		let source = src ? src : card.holder.hand;
		let musters = source.cards.filter(c => c.abilities.includes("muster"));
		musters.forEach(curr => {
			let name = curr.target;
			if(!groups[name]) groups[name] = [];
			groups[name].push(curr);
		});
		for (let group of Object.values(groups)) {
			group.sort(Card.compare);
			group.pop();
			cards.push(...group);
		}
		let tmusters = source.cards.filter(c => Object.keys(groups).includes(c.target) && !c.abilities.includes("muster"));
		cards.push(...tmusters);
		let weathers = source.cards.filter(c => c.row === "weather");
		if (weathers.length > 1) {
			weathers.splice(randomInt(weathers.length), 1);
			cards.push(...weathers);
		}
		let normal = source.cards.filter(c => c.abilities.length === 0 && c.basePower < 7);
		normal.sort(Card.compare);
		cards.push(...normal);
		let bonds = source.cards.filter(c => c.abilities.includes("bond"));
		groups = {};
		bonds.forEach(curr => {
			let name = curr.target;
			if (!groups[name]) groups[name] = [];
			groups[name].push(curr);
		});
		for (let group of Object.values(groups)) {
			if (group.length === 1 && group[0].basePower < 6) cards.push(group[0]);
		}
		return cards;
	}

	async playCard(c, max, data) {
		// Track cards played in round 2 for the 8+ cards logic
		if (game.roundCount === 2) {
			this.player.round2CardsPlayed = (this.player.round2CardsPlayed || 0) + 1;
			console.log(`📊 Round 2: Card played, count now: ${this.player.round2CardsPlayed}`);
		}
		
		if (c.key === "spe_horn" || c.key === "spe_redania_horn") await this.horn(c);
		else if (c.key === "spe_mardroeme") await this.mardroeme(c);
		else if (c.abilities.includes("decoy")) await this.decoy(c, max, data);
		else if (c.faction === "special" && (c.abilities.includes("scorch") || c.abilities.includes("redania_purge"))) await this.scorch(c, max, data);
		else if (c.faction === "special" && c.abilities.includes("cull")) await this.cull(c, max, data);
		else if (c.faction === "special" && c.abilities.includes("cintra_slaughter")) await this.slaughterCintra(c);
		else if (c.faction === "special" && c.abilities.includes("seize")) await this.seizeCards(c);
		else if (c.faction === "special" && (
			c.abilities.includes("shield") ||
			c.abilities.includes("shield_c") ||
			c.abilities.includes("shield_r") ||
			c.abilities.includes("shield_s"))
		) await this.shieldCards(c);
		else if (c.faction === "special" && c.abilities.includes("lock")) await this.lock(c);
		else if (c.faction === "special" && c.abilities.includes("sign_aard")) await this.knockback(c);
		else if (c.faction === "special" && c.abilities.includes("toussaint_wine")) await this.toussaintWine(c);
		else if (c.faction === "special" && c.abilities.includes("decree")) {
			// Royal Decree - activate leader ability
			await this.player.playCard(c);
		} 		else if (c.faction === "special" && c.abilities.includes("peace_treaty")) {
			// Peace Treaty - play directly (no row selection needed)
			c.holder.hand.removeCard(c);
			await ability_dict["peace_treaty"].placed(c);
			this.player.endTurn();
			return;
		} else if (c.faction === "special" && c.abilities.includes("sign_axii")) {
			// Sign: Axii works like Seize - no row selection needed
			c.holder.hand.removeCard(c);
			await ability_dict["sign_axii"].activated(c);
			this.player.endTurn();
			return;
		} else if (c.faction === "special" && (c.abilities.includes("sign_igni") || c.abilities.includes("sign_yrden"))) {
			// Sign cards that need row selection
			const signAbility = c.abilities.find(a => a.startsWith("sign_"));
			let bestRow = null;
			let bestValue = -50;
			
			// For Igni, we want opponent's rows
			// For Yrden, we want rows with effects
			if (signAbility === "sign_igni") {
				// Select best opponent row
				for (let i = 0; i < 3; i++) {
					const row = board.row[3 + i]; // Opponent's rows
					const value = ability_dict[signAbility].weight ? ability_dict[signAbility].weight(c, this, max) : 0;
					if (value > bestValue) {
						bestValue = value;
						bestRow = row;
					}
				}
			} else if (signAbility === "sign_yrden") {
				// Select row with most effects (player or opponent)
				for (let i = 0; i < 6; i++) {
					const row = board.row[i];
					const value = ability_dict[signAbility].weight ? ability_dict[signAbility].weight(c, this, max) : 0;
					if (value > bestValue) {
						bestValue = value;
						bestRow = row;
					}
				}
			}
			
			if (bestRow && bestValue > -10) {
				c.holder.hand.removeCard(c);
				await ability_dict[signAbility].placed(c, bestRow);
				this.player.endTurn();
				return;
			}
		} else if (c.faction === "special" && c.abilities.includes("sign_quen")) {
			// Quen - doesn't need row selection, targets a unit
			c.holder.hand.removeCard(c);
			await ability_dict["sign_quen"].placed(c, null);
			this.player.endTurn();
			return;
		} else if ((c.isUnit() || c.hero) && c.abilities.includes("witch_hunt")) await this.witchHunt(c);
		else if ((c.isUnit() || c.hero) && (c.row === "agile" || c.row === "any" || c.row === "melee_siege" || c.row === "ranged_siege")) {
			// For flexible row cards, always use bestAgileRowChange to select optimal row
			await this.player.playCardToRow(c, this.bestAgileRowChange(c).row);
		}
		else if (c.faction === "special" && c.abilities.includes("bank")) await this.bank(c);
		else await this.player.playCard(c);
	}

	async horn(card) {
		// CRITICAL RULE: Only play horn on rows that have units
		// Filter to rows without horn AND with at least one unit
		let rows = this.player.getAllRows().filter(r => 
			!r.special.containsCardByKey("spe_horn") && 
			!r.special.containsCardByKey("spe_redania_horn") &&
			r.cards.filter(c => c.isUnit()).length > 0
		); 
		
		// If no rows with units exist, don't play horn
		if (rows.length === 0) {
			console.warn("⚠️ AI cannot play Horn - no rows with units found");
			// Don't try to play the card if there are no rows with units
			return;
		}
		
		let max_row;
		let max = 0;
		for (let i = 0; i < rows.length; ++i) {
			let r = rows[i];
			let dif = [0, 0];
			this.calcRowPower(r, dif, true);
			r.effects.horn++;
			this.calcRowPower(r, dif, false);
			r.effects.horn--;
			let score = dif[1] - dif[0];
			if (max < score) {
				max = score;
				max_row = r;
			}
		}
		
		// Should always have a max_row at this point since we filtered for rows with units
		if (max_row && max_row instanceof Row) {
			await this.player.playCardToRow(card, max_row);
		} else {
			console.warn("⚠️ AI cannot play Horn - no valid row found");
			// Don't try to play the card if we can't find a valid row
			return;
		}
	}

	async mardroeme(card) { 
		let row, max = 0;
		this.getSelfRowIndexes().forEach(i => {
			let curr = this.weightMardroemeRow(card, board.row[i]);
			if (curr > max) {
				max = curr;
				row = board.row[i];
			}
		});
		await this.player.playCardToRow(card, row);
	}

	medic(card, grave) {
		let data = this.countCards(grave);
		let targ;
		if (data.spy.length) {
			let min = data.spy.reduce((a, c) => Math.min(a, c.power), Number.MAX_VALUE);
			targ = data.spy.filter(c => c.power === min)[0];
		} else if (data.medic.length) {
			let max = data.medic.reduce((a, c) => Math.max(a, c.power), 0);
			targ = data.medic.filter(c => c.power === max)[0];
		} else if (data.scorch.length) targ = data.scorch[randomInt(data.scorch.length)];
		else {
			let units = grave.findCards(c => c.isUnit());
			targ = units.reduce((a, c) => a.power < c.power ? c : a, units[0]);
		}
		return targ;
	}

	async decoy(card, max, data) {
		let targ, row;
		if (game.decoyCancelled) return;
		let usable_data;
		if (card.row.length > 0) {
		if (card.row === "close" || card.row === "agile" || card.row === "any" || card.row === "melee_siege") usable_data = this.countCards(board.getRow(card,"close",this.player), usable_data);
		if (card.row === "ranged" || card.row === "agile" || card.row === "any" || card.row === "ranged_siege") usable_data = this.countCards(board.getRow(card, "ranged", this.player), usable_data);
		if (card.row === "siege" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege") usable_data = this.countCards(board.getRow(card, "siege", this.player), usable_data);
			if (card.row === "siege") usable_data = this.countCards(board.getRow(card, "siege", this.player), usable_data);
		} else usable_data = data;
		if (usable_data.spy.length) {
			let min = usable_data.spy.reduce((a, c) => Math.min(a, c.power), Number.MAX_VALUE);
			targ = usable_data.spy.filter(c => c.power === min)[0];
		} else if (usable_data.medic.length) targ = usable_data.medic[randomInt(usable_data.medic.length)];
		else if (usable_data.scorch.length) targ = usable_data.scorch[randomInt(usable_data.scorch.length)];
		else {
			let pairs = max.rmax.filter((r, i) => this.isSelfRowIndex(i) && r.cards.length)
				.filter((r, i) => card.row.length === 0 || (["close", "agile", "any"].includes(card.row) && (i === 2 || i === 3)) || (["ranged", "agile", "any"].includes(card.row) && (i === 1 || i === 4)) || (["siege", "any"].includes(card.row) && (i === 0 || i === 5)))
				.reduce((a, r) => r.cards.map(c => ({
					r: r.row,
					c: c
				})).concat(a), []);
			if (pairs.length) {
				let pair = pairs[randomInt(pairs.length)];
				targ = pair.c;
				row = pair.r;
			}
		}
		// CRITICAL: Decoy requires a target - cannot be played without swapping
		if (!targ) {
			console.log("⚠️ AI cannot play Decoy - no valid target found - trying other cards");
			// Don't pass immediately - return and let the AI try other cards
			// This is especially important in round 3 where we must play cards
			return;
		}
		if (targ) {
			for (let i = 0; !row; ++i) {
				if (board.row[i].cards.indexOf(targ) !== -1) {
					row = board.row[i];
					break;
				}
			}
			targ.decoyTarget = true;
			setTimeout(() => board.toHand(targ, row), 1000);
		}
		await this.player.playCardToRow(card, row);
	}

	async scorch(card, max, data) {
		await this.player.playScorch(card);
	}

	async cull(card, max, data) {
		await this.player.playCull(card);
	}

	async slaughterCintra(card) {
		await this.player.playSlaughterCintra(card);
	}

	async seizeCards(card) {
		await this.player.playSeize(card);
	}

	async shieldCards(card) {
		if (card.abilities.includes("shield_c")) {
			await this.player.playCardToRow(card, board.getRow(card, "close", this.player));
			return;
		} else if (card.abilities.includes("shield_r")) {
			await this.player.playCardToRow(card, board.getRow(card, "ranged", this.player));
			return;
		} if (card.abilities.includes("shield_s")) {
			await this.player.playCardToRow(card, board.getRow(card, "siege", this.player));
			return;
		}
		let units = card.holder.getAllRowCards().concat(card.holder.hand.cards).filter(c => c.isUnit()).filter(c => !c.abilities.includes("spy"));
		let rowStats = {
			"close": 0,
			"ranged": 0,
			"siege": 0,
			"agile": 0
		};
		units.forEach(c => {
			rowStats[c.row] += c.power;
		});
		rowStats["close"] += rowStats["agile"];
		let max_row;
		if (rowStats["close"] >= rowStats["ranged"] && rowStats["close"] >= rowStats["siege"]) max_row = board.getRow(card, "close", this.player);
		else if (rowStats["ranged"] > rowStats["close"] && rowStats["ranged"] >= rowStats["siege"]) max_row = board.getRow(card, "ranged", this.player);
		else max_row = board.getRow(card, "siege", this.player);
		await this.player.playCardToRow(card, max_row);
	}

	async lock(card) {
		await this.player.playCardToRow(card, board.getRow(card, "close", this.player.opponent()));
	}

	async knockback(card) {
		await this.player.playKnockback(card);
	}

	async toussaintWine(card) {
		await this.player.playCardToRow(card,this.bestRowToussaintWine(card));
	}

	async witchHunt(card) {
		const targetRow = this.bestWitchHuntRow(card);
		if (!targetRow) {
			// Peace Treaty is active, don't play witch_hunt
			return;
		}
		await this.player.playCardToRow(card, targetRow.getOppositeRow());
	}

	async bank(card) {
		await this.player.playBank(card);
	}

	bestWitchHuntRow(card) {
		// Check if opponent has Peace Treaty active
		const opponent = this.player.opponent();
		if (game.peaceTreatyActive && game.peaceTreatyActive[opponent.tag]) {
			// Peace Treaty blocks witch_hunt - return null to prevent playing it
			return null;
		}
		if (card.row == "agile") {
			let r = [board.getRow(card, "close", this.player.opponent()), board.getRow(card, "ranged", this.player.opponent())];
			let rows = r.filter(r => !r.isShielded() && !game.scorchCancelled).map(r => ({
				row: r,
				value: r.minUnits().reduce((a, c) => a + c.power, 0)
			}));
			if (rows.length > 0) return rows.sort((a, b) => b.value - a.value)[0].row;
			else return board.getRow(card, "close", card.holder.opponent())
		} else return board.getRow(card, card.row, card.holder.opponent());
	}

	bestRowToussaintWine(card) {
		let units = card.holder.getAllRowCards().concat(card.holder.hand.cards).filter(c => c.isUnit()).filter(c => !c.abilities.includes("spy"));
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
		let rows = card.holder.getAllRows();
		rowStats["close"] = board.getRow(card, "close", this.player).effects.toussaint_wine > 0 ? 0 : rowStats["close"];
		rowStats["ranged"] = board.getRow(card, "ranged", this.player).effects.toussaint_wine > 0 ? 0 : rowStats["ranged"];
		rowStats["siege"] = board.getRow(card, "siege", this.player).effects.toussaint_wine > 0 ? 0 : rowStats["siege"];
		let max_row;
		if (rowStats["close"] >= rowStats["ranged"] && rowStats["close"] >= rowStats["siege"]) max_row = board.getRow(card,"close",this.player);
		else if (rowStats["ranged"] > rowStats["close"] && rowStats["ranged"] >= rowStats["siege"]) max_row = board.getRow(card, "ranged", this.player);
		else max_row = board.getRow(card, "siege", this.player);
		return max_row;
	}

	bestRowMorale(card) {
		// Find the row with the most units (morale boosts all units in a row by +1)
		let units = card.holder.getAllRowCards().concat(card.holder.hand.cards).filter(c => c.isUnit()).filter(c => !c.abilities.includes("spy"));
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
		
		// Filter out rows that already have morale boost (don't waste the ability)
		let closeRow = board.getRow(card, "close", this.player);
		let rangedRow = board.getRow(card, "ranged", this.player);
		let siegeRow = board.getRow(card, "siege", this.player);
		
		if (closeRow.effects.morale > 0) rowStats["close"] = 0;
		if (rangedRow.effects.morale > 0) rowStats["ranged"] = 0;
		if (siegeRow.effects.morale > 0) rowStats["siege"] = 0;
		
		// Also check if the row already has the morale special card
		if (closeRow.special.containsCardByKey("spe_lyria_rivia_morale")) rowStats["close"] = 0;
		if (rangedRow.special.containsCardByKey("spe_lyria_rivia_morale")) rowStats["ranged"] = 0;
		if (siegeRow.special.containsCardByKey("spe_lyria_rivia_morale")) rowStats["siege"] = 0;
		
		// Select the row with the most units
		let max_row;
		if (rowStats["close"] >= rowStats["ranged"] && rowStats["close"] >= rowStats["siege"]) {
			max_row = closeRow;
		} else if (rowStats["ranged"] > rowStats["close"] && rowStats["ranged"] >= rowStats["siege"]) {
			max_row = rangedRow;
		} else {
			max_row = siegeRow;
		}
		
		// If all rows have morale or no units, default to close row
		if (!max_row || (rowStats["close"] === 0 && rowStats["ranged"] === 0 && rowStats["siege"] === 0)) {
			max_row = closeRow;
		}
		
		return max_row;
	}

	weightPass() {
		const opponent = this.player.opponent();
		let dif = opponent.total - this.player.total;
		const cardsInHand = this.player.hand.cards.length;
		const roundNumber = game.roundCount;
		const cardsOnBoard = this.player.getAllRowCards().length;
		const turnsPlayed = cardsOnBoard; // Approximate turn count
		
		// Get AI difficulty settings
		const difficulty = window.aiDifficultyManager ? window.aiDifficultyManager.getDifficulty() : 'medium';
		const shouldBeOptimal = window.aiDifficultyManager ? window.aiDifficultyManager.shouldMakeOptimalDecision() : true;
		
		// CRITICAL: If score is tied 1-1 in round 3, AI cannot pass if losing or tied (would lose game)
		const isTied1to1 = this.player.health === 1 && opponent.health === 1;
		if (roundNumber === 3 && isTied1to1 && dif >= 0) {
			// Score is tied 1-1 and AI is losing or tied - cannot pass under any circumstances
			return 0; // Zero weight - must fight, cannot pass
		}
		
		// CRITICAL: If AI lost round 1, they cannot pass in round 2 if losing (would lose game)
		const lostRound1 = this.player.health === 1; // Lost round 1 (health decreased from 2 to 1)
		if (roundNumber === 2 && lostRound1 && dif > 0) {
			// AI lost round 1 and is losing in round 2 - cannot pass under any circumstances
			return 0; // Zero weight - must fight, cannot pass
		}
		
		// CRITICAL RULE: NEVER go below 5 cards in hand, EVER
		if (cardsInHand <= 4) {
			return 1000; // Very high weight to pass - must conserve cards
		}
		
		// CRITICAL RULE: In round 1, NEVER go below 5 cards
		// If we have exactly 5 cards, we must pass to maintain minimum
		if (roundNumber === 1 && cardsInHand === 5) {
			// Only allow passing if we've played at least one card (not first turn)
			const cardsOnBoard = this.player.getAllRowCards().length;
			if (cardsOnBoard > 0) {
				return 1000; // Very high weight to pass - must maintain 5+ cards
			}
		}
		
		// ALWAYS pass if opponent passed and we're winning (round is over)
		if (opponent.passed && this.player.winning) {
			return 1000;
		}
		
		// CRITICAL RULE: In round 1, if there's a 20+ point deficit, always pass
		// This prevents wasting cards when the round is already lost
		if (roundNumber === 1 && dif >= 18 && cardsOnBoard > 0) {
			// Only pass if we've played at least one card (not first turn)
			return 1000; // Very high weight to pass - round is lost, conserve cards
		}
		
		// ROUND 1: Conservative strategy - preserve cards
		if (roundNumber === 1) {
			// After playing at least 1 card, be more conservative
			if (cardsOnBoard > 0) {
				// If we're ahead or close (within 10 points), strongly consider passing
				if (dif <= 10 && cardsInHand <= 6) {
					// More cards played = more weight to pass
					let passWeight = 40 + (cardsOnBoard * 10);
					if (dif < 0) passWeight += 20; // Bonus if winning
					if (!opponent.passed) passWeight += 15; // Can pass first
					return Math.min(passWeight, 90);
				}
				// If we're slightly behind (10-20 points) but have played 2+ cards, consider passing
				if (dif > 10 && dif <= 20 && cardsOnBoard >= 2 && cardsInHand <= 6) {
					return 30; // Moderate weight to pass and conserve
				}
			}
			// Never pass immediately without playing at least one card
			if (cardsOnBoard === 0 && !opponent.passed) {
				return 0;
			}
		}
		
		// ROUND 2: Strategic - win if losing game, conservative if 1-1
		if (roundNumber === 2) {
			const lostRound1 = this.player.health < 2; // Lost round 1
			const isLosing = !this.player.winning;
			
			// If we lost round 1, we MUST win round 2 or we lose the game
			if (lostRound1) {
				// Only pass if we're winning by a significant margin (15+ points)
				if (isLosing) {
					return 0; // Cannot pass - must fight
				}
				if (dif < -15 && cardsInHand <= 6) {
					return 50; // Can pass if winning by 15+ and have cards to spare
				}
				return 0; // Otherwise, keep fighting
			}
			// If we won round 1 (1-1 situation), be more conservative
			else {
				// Similar to round 1 logic - preserve cards
				if (cardsOnBoard > 0 && dif <= 10 && cardsInHand <= 6) {
					let passWeight = 35 + (cardsOnBoard * 8);
					if (dif < 0) passWeight += 15;
					if (!opponent.passed) passWeight += 10;
					return Math.min(passWeight, 85);
				}
			}
		}
		
		// ROUND 3: Deciding round - play all cards, but don't fight losing battles after 3rd turn
		if (roundNumber === 3) {
			// CRITICAL: If score is tied 1-1, never pass (whoever loses round 3 loses the game)
			if (isTied1to1) {
				// Score tied 1-1 - must fight to the end, cannot pass
				if (cardsInHand > 0) {
					return 0; // Must play cards
				}
				return 1000; // No cards - must pass (only if truly no options)
			}
			
			const isLosing = !this.player.winning;
			// After 3rd turn, don't fight losing battles
			if (turnsPlayed >= 3 && isLosing && dif > 20) {
				// We're losing by 20+ after 3 turns - likely unwinnable
				// Check if we have enough cards to catch up
				const avgCardValue = 7;
				const potentialPoints = cardsInHand * avgCardValue;
				if (potentialPoints < dif * 1.2) { // Need 20% more than deficit to be safe
					return 60; // Moderate weight to pass - unwinnable
				}
			}
			// Otherwise, fight to the end in round 3
			if (cardsInHand > 0) {
				return 0; // Must play cards
			}
			return 1000; // No cards - must pass
		}
		
		// GENERAL: Don't fight losing battles after 3rd turn (any round)
		const isLosing = !this.player.winning;
		if (turnsPlayed >= 3 && isLosing && dif > 25) {
			// Losing by 25+ after 3 turns - evaluate if worth fighting
			const avgCardValue = 7;
			const potentialPoints = cardsInHand * avgCardValue;
			if (potentialPoints < dif * 1.3) {
				// Not enough potential to catch up - pass to conserve cards
				return 50;
			}
		}
		
		// Apply difficulty-based randomization to pass decision
		// Hard = always optimal, Medium/Easy = sometimes suboptimal
		if (!shouldBeOptimal) {
			// Make suboptimal decision based on difficulty
			const suboptimalChance = Math.random();
			if (difficulty === 'easy' && suboptimalChance < 0.3) {
				// 30% chance to make wrong pass decision on Easy
				return Math.random() < 0.5 ? 100 : 0; // Random pass/play
			} else if (difficulty === 'medium' && suboptimalChance < 0.15) {
				// 15% chance to make wrong pass decision on Medium
				return Math.random() < 0.5 ? 100 : 0; // Random pass/play
			}
		}
		
		// Check if we only have weather cards that would hurt us
		const weatherCards = this.player.hand.cards.filter(c => 
			c.row === "weather" || (c.deck && c.deck.startsWith("weather"))
		);
		if (weatherCards.length > 0 && weatherCards.length === cardsInHand) {
			const data_max = this.getMaximums();
			const data_board = this.getBoardData();
			let allWeatherBad = true;
			for (const weatherCard of weatherCards) {
				const weight = this.weightCard(weatherCard, data_max, data_board);
				if (weight > 0) {
					allWeatherBad = false;
					break;
				}
			}
			if (allWeatherBad) {
				return 100; // High weight to pass if only bad weather cards
			}
		}
		
		// Default: don't pass - try to play cards
		return 0;
	}

	weightLeader(card, max, data) {
		let w = ability_dict[card.abilities[0]].weight;
		if (ability_dict[card.abilities[0]].weight) {
			let score = w(card, this, max, data);
			return score;
		}
		return 10 + (game.roundCount - 1) * 15;
	}

	weightScorchRow(card, max, row_name) {
		if (game.scorchCancelled) return 0;
		// Check if opponent has Peace Treaty active
		const opponent = this.player.opponent();
		if (game.peaceTreatyActive && game.peaceTreatyActive[opponent.tag]) {
			return 0; // Peace Treaty blocks scorch
		}
		let index = 3 + (row_name === "close" ? 0 : row_name === "ranged" ? 1 : 2);
		if (this.player === player_me) index = 2 - (row_name === "close" ? 0 : row_name === "ranged" ? 1 : 2);
		const targetRow = board.row[index];
		if (targetRow.total < 10 || targetRow.isShielded()) return 0;
		
		// Get opponent's row (the row we're targeting)
		const opponentRow = targetRow;
		const opponentMaxUnits = opponentRow.maxUnits();
		if (opponentMaxUnits.length === 0) return 0;
		const opponentMaxPower = opponentMaxUnits[0].power;
		
		// Row-specific scorch (scorch_c, scorch_r, scorch_s) only affects the opponent's row,
		// so it won't kill our units. No need to check our own row for row-specific scorch.
		
		// No risk of killing our own units, return full value
		let score = max.rmax[index].cards.reduce((a, c) => a + c.power, 0);
		return score;
	}

	weightHornRow(card, row) {
		if (row.effects.horn) return 0;
		const unitCount = row.cards.filter(c => c.isUnit()).length;
		
		// Heavily penalize playing horn on empty rows
		if (unitCount === 0) {
			// Only allow if truly no other options exist (check if all other rows also have no units or already have horn)
			const allRows = this.player.getAllRows();
			const rowsWithUnits = allRows.filter(r => r.cards.filter(c => c.isUnit()).length > 0 && !r.effects.horn);
			const rowsWithoutHorn = allRows.filter(r => !r.effects.horn);
			
			// If there are rows with units that don't have horn, heavily penalize this empty row
			if (rowsWithUnits.length > 0) {
				return 0; // Don't play horn on empty row if there are rows with units available
			}
			
			// If all rows are empty or have horn, allow minimal weight as last resort
			if (rowsWithoutHorn.length <= 1) {
				return 1; // Last resort only
			}
			
			// If there are other empty rows without horn, prefer those (but still low weight)
			return 1;
		}
		
		// Row has units - calculate normal weight with bonus
		let base = this.weightRowChange(card, row);
		// Bonus scaled by unit presence, capped to avoid overcommitment
		base += Math.min(5, unitCount * 2);
		return base;
	}

	weightRowChange(card, row) {
		return Math.max(0, this.weightRowChangeTrue(card, row));
	}

	bestAgileRowChange(card) {
		let rows = [];
		if (card.row === "agile") {
			rows = [{
				row: board.getRow(card, "close", card.holder),
				score: 0 
			},
			{
				row: board.getRow(card, "ranged", card.holder),
				score: 0
			}];
		} else if (card.row === "melee_siege") {
			rows = [{
				row: board.getRow(card, "close", card.holder),
				score: 0 
			},
			{
				row: board.getRow(card, "siege", card.holder),
				score: 0
			}];
		} else if (card.row === "ranged_siege") {
			rows = [{
				row: board.getRow(card, "ranged", card.holder),
				score: 0 
			},
			{
				row: board.getRow(card, "siege", card.holder),
				score: 0
			}];
		} else if (card.row === "any") {
			rows = [{
				row: board.getRow(card, "close", card.holder),
				score: 0 
			},
			{
				row: board.getRow(card, "ranged", card.holder),
				score: 0
			},
			{
				row: board.getRow(card, "siege", card.holder),
				score: 0
			}];
		}
		// Get AI difficulty settings for weather avoidance
		const difficulty = window.aiDifficultyManager ? window.aiDifficultyManager.getDifficulty() : 'medium';
		const shouldAvoidWeather = window.aiDifficultyManager ? window.aiDifficultyManager.shouldAvoidWeather() : true;
		
		for (var i = 0; i < rows.length; i++) {
			rows[i].score = this.weightRowChange(card, rows[i].row);
			
			// WEATHER AVOIDANCE: Penalize weather-affected rows
			if (card.isUnit() && !card.hero && shouldAvoidWeather) {
				const hasWeather = rows[i].row.special.cards.some(c => 
					c.row === "weather" || (c.deck && c.deck.startsWith("weather")) ||
					c.abilities && (c.abilities.includes("frost") || c.abilities.includes("fog") || 
						c.abilities.includes("rain") || c.abilities.includes("storm") || 
						c.abilities.includes("sandstorm") || c.abilities.includes("nightfall"))
				);
				
				if (hasWeather) {
					// Check if there are rows without weather
					const rowsWithoutWeather = rows.filter(r => {
						return !r.row.special.cards.some(c => 
							c.row === "weather" || (c.deck && c.deck.startsWith("weather")) ||
							c.abilities && (c.abilities.includes("frost") || c.abilities.includes("fog") || 
								c.abilities.includes("rain") || c.abilities.includes("storm") || 
								c.abilities.includes("sandstorm") || c.abilities.includes("nightfall"))
						);
					});
					
					// If there are alternative rows without weather, heavily penalize this row
					if (rowsWithoutWeather.length > 0) {
						// Penalty based on difficulty: Hard = full penalty, Medium = moderate, Easy = light
						const penalty = difficulty === 'hard' ? 100 : (difficulty === 'medium' ? 60 : 30);
						rows[i].score = Math.max(0, rows[i].score - penalty);
					}
				}
			}
		}
		return rows.sort((a, b) => b.score - a.score)[0];
	}

	bestHornRow(card) {
		// CRITICAL RULE: Only play horn on rows that have units
		// Filter to rows without horn AND with at least one unit
		let validRows = this.player.getAllRows().filter(r => 
			!r.special.containsCardByKey("spe_horn") && 
			!r.special.containsCardByKey("spe_redania_horn") &&
			r.cards.filter(c => c.isUnit()).length > 0
		);
		
		// If no rows with units exist, return a row with score 0
		if (!validRows.length) {
			// Return a dummy row with score 0 to prevent playing horn
			let defaultRow = board.getRow(card, "close", card.holder);
			return { row: defaultRow, score: 0 };
		}
		
		let rows = [];
		if (card.row === "agile") {
			rows = [{
				row: board.getRow(card, "close", card.holder),
				score: 0 
			},
			{
				row: board.getRow(card, "ranged", card.holder),
				score: 0
			}];
		} else if (card.row === "melee_siege") {
			rows = [{
				row: board.getRow(card, "close", card.holder),
				score: 0 
			},
			{
				row: board.getRow(card, "siege", card.holder),
				score: 0
			}];
		} else if (card.row === "ranged_siege") {
			rows = [{
				row: board.getRow(card, "ranged", card.holder),
				score: 0 
			},
			{
				row: board.getRow(card, "siege", card.holder),
				score: 0
			}];
		} else if (card.row === "any") {
			rows = [{
				row: board.getRow(card, "close", card.holder),
				score: 0 
			},
			{
				row: board.getRow(card, "ranged", card.holder),
				score: 0
			},
			{
				row: board.getRow(card, "siege", card.holder),
				score: 0
			}];
		}
		
		// Filter rows to only those with units and without horn
		rows = rows.filter(r => 
			validRows.includes(r.row) &&
			!r.row.special.containsCardByKey("spe_horn") && 
			!r.row.special.containsCardByKey("spe_redania_horn") &&
			r.row.cards.filter(c => c.isUnit()).length > 0
		);
		
		// If no valid rows after filtering, return score 0
		if (!rows.length) {
			let defaultRow = board.getRow(card, "close", card.holder);
			return { row: defaultRow, score: 0 };
		}
		
		for (var i = 0; i < rows.length; i++) rows[i].score = this.weightHornRow(card, rows[i].row);
		return rows.sort((a, b) => b.score - a.score)[0];
	}

	weightRowChangeTrue(card, row) {
		let dif = [0, 0];
		this.calcRowPower(row, dif, true);
		row.updateState(card, true);
		this.calcRowPower(row, dif, false);
		if (!card.isSpecial()) dif[0] -= row.calcCardScore(card);
		row.updateState(card, false);
		return dif[1] - dif[0];
	}

	weightWeather(card) {
		let rows;
		const isClearWeather = card.key === "spe_clear" || card.ability == "clear";
		
		if (card.abilities) {
			if (card.key === "spe_clear" || card.abilities.includes("clear")) {
				rows = Object.values(weather.types).filter(t => t.count > 0).flatMap(t => t.rows);
			} else {
				// Handle all weather types including storm, sandstorm, nightfall
				let weatherType = card.abilities.find(a => ["frost", "fog", "rain", "storm", "sandstorm", "nightfall"].includes(a));
				if (weatherType) {
					rows = Object.values(weather.types).filter(t => t.count === 0 && t.name === weatherType).flatMap(t => t.rows);
				} else {
					rows = [];
				}
			}
		} else {
			if (card.ability == "clear") rows = Object.values(weather.types).filter(t => t.count > 0).flatMap(t => t.rows);
			else {
				// Handle weather types from ability string
				let weatherType = card.ability;
				if (["frost", "fog", "rain", "storm", "sandstorm", "nightfall"].includes(weatherType)) {
					rows = Object.values(weather.types).filter(t => t.count === 0 && t.name === weatherType).flatMap(t => t.rows);
				} else {
					rows = [];
				}
			}
		}
		if (!rows.length) return isClearWeather ? -50 : 1; // Heavily penalize clear weather if no weather active
		
		let dif = [0, 0];
		rows.forEach(r => {
			let state = r.effects.weather;
			this.calcRowPower(r, dif, true);
			r.effects.weather = !state;
			this.calcRowPower(r, dif, false);
			r.effects.weather = state;
		});
		
		const netValue = dif[1] - dif[0];
		
		// For clear weather: only play if we're at a disadvantage (netValue > 0 means we benefit)
		// OR if there are no other card options (handled in startTurnOriginal)
		if (isClearWeather) {
			// Only play clear weather if it significantly helps us (we're losing points due to weather)
			// Otherwise heavily penalize it
			if (netValue > 5) {
				return netValue; // Worth playing if it helps significantly
			} else {
				return -30; // Heavily penalize unless we really need it
			}
		}
		
		return netValue;
	}

	weightMardroemeRow(card, row) {
		if (card.key === "spe_mardroeme" && row.special.containsCardByKey("spe_mardroeme")) return 0;
		let ermion = card.holder.hand.cards.filter(c => c.key === "sk_ermion").length > 0;
		if (ermion && card.key !== "sk_ermion" && row === board.getRow(card, "ranged", this.player)) return 0;
		let bers_cards = row.cards.filter(c => c.abilities.includes("berserker"));
		let weightData = {
			bond: {},
			strength: 0,
			scorch: 0
		};
		for (var i = 0; i < bers_cards.length; i++) {
			var c = bers_cards[i];
			var ctarget = card_dict[c.target];
			weightData.strength -= c.power;
			if (ctarget.ability.includes("morale")) weightData.strength += Number(ctarget["strength"]) + row.cards.filter(c => c.isUnit()).length - 1;
			if (ctarget.ability.includes("bond")) {
				if (!weightData.bond[c.target]) weightData.bond[c.target] = [0, Number(ctarget["strength"])];
				weightData.bond[c.target][0]++;
			}
			if (ctarget.ability.includes("scorch_c")) weightData.scorch += this.weightScorchRow(card, this.getMaximums(), "close");
		}
		let weight = weightData.strength + Object.keys(weightData.bond).reduce((s, c) => s + Math.pow(weightData.bond[c][0], 2) * weightData.bond[c][1], 0) + weightData.scorch;
		return Math.max(1, weight);
	}

	weightMedic(data, score, owner) {
		let units = owner.grave.findCards(c => c.isUnit());
		let grave = data["grave_" + owner.opponent().tag];
		
		// AI should not play medic unless there are units in the discard pile
		if (!units.length) {
			// Only play medic if tactically necessary (e.g., desperate situation, last health)
			if (this.player.health === 1 && this.player.hand.cards.length <= 3) {
				// Desperate situation - might be worth playing even without units (card advantage)
				return Math.min(2, score);
			}
			// Otherwise, avoid playing medic when there are no units to restore
			return 0;
		}
		
		// There are units in grave - evaluate normally
		return score + (grave.spy.length ? 50 : grave.medic.length ? 15 : grave.scorch.length ? 10 : this.player.health === 1 ? 1 : 0);
	}

	weightBerserker(card, row, score) {
		if (card.holder.hand.cards.filter(c => c.abilities.includes("mardroeme")).length < 1 && !row.effects.mardroeme > 0) return score;
		score -= card.basePower;
		let ctarget = card_dict[card.target];
		if (ctarget.ability.includes("morale")) score += Number(ctarget["strength"]) + row.cards.filter(c => c.isUnit()).length - 1;
		else if (ctarget.ability.includes("bond")) {
			let n = 1 + (
				!row.effects.mardroeme ?
					row.cards.filter(c => c.key === card.key).filter(c => !c.isLocked()).length
				:
					row.cards.filter(c => c.key === card.target).filter(c => !c.isLocked()).length
			);
			score += Number(ctarget["strength"]) * (n * n);
		} else if (ctarget.ability.includes("scorch_c")) score += this.weightScorchRow(card, this.getMaximums(), "close");
		else score += Number(ctarget["strength"]);
		return Math.max(1, score);
	}

	weightWeatherFromDeck(card, weather_id) {
		if (card.holder.deck.findCard(c => c.abilities.includes(weather_id)) === undefined) return 0;
		return this.weightCard({
			abilities: [weather_id],
			row: "weather"
		});
	}

	weightCard(card, max, data) {
		let abi;
		if (card.abilities) abi = card.abilities;
		else if (card["ability"]) abi = card["ability"].split(" ");
		else {
			abi = [];
			console.log("Missing abilities for card:");
			console.log(card);
		}
		if (abi.includes("decoy")) {
			if (game.decoyCancelled) return 0;
			
			// CRITICAL: Decoy requires a valid target unit to swap with
			// Check if there are any units on our side of the board
			const hasValidTarget = this.player.getAllRowCards().some(c => c.isUnit());
			if (!hasValidTarget) {
				return 0; // No valid targets - cannot play decoy
			}
			
			if (card.row.length > 0) {
				let row_data;
				if (card.row === "close" || card.row === "agile" || card.row === "any" || card.row === "melee_siege") row_data = this.countCards(board.getRow(card,"close",this.player), row_data);
				if (card.row === "ranged" || card.row === "agile" || card.row === "any" || card.row === "ranged_siege") row_data = this.countCards(board.getRow(card, "ranged", this.player), row_data);
				if (card.row === "siege" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege") row_data = this.countCards(board.getRow(card, "siege", this.player), row_data);
				if (card.row === "siege") row_data = this.countCards(board.getRow(card, "siege", this.player), row_data);
				return row_data.spy.length ? 50 : row_data.medic.length ? 15 : row_data.scorch.length ? 10 : max.me.length ? card.power : 0;
			} else return data.spy.length ? 50 : data.medic.length ? 15 : data.scorch.length ? 10 : max.me.length ? 1 : 0;
		}
		if (abi.includes("horn") || abi.includes("redania_horn")) {
			// CRITICAL RULE: Only play horn on rows that have units
			// Filter to rows without horn AND with at least one unit
			let rows = this.player.getAllRows().filter(r => 
				!r.special.containsCardByKey("spe_horn") && 
				!r.special.containsCardByKey("spe_redania_horn") &&
				r.cards.filter(c => c.isUnit()).length > 0
			);
			// If no rows with units exist, don't play horn
			if (!rows.length) return 0;
			rows = rows.map(r => this.weightHornRow(card, r));
			return Math.max(...rows) / 2;
		}
		if (abi) {
			if (abi.includes("scorch")) {
				if (game.scorchCancelled) return Math.max(0, card.power);
				// Check if opponent has Peace Treaty active
				const opponent = this.player.opponent();
				if (game.peaceTreatyActive && game.peaceTreatyActive[opponent.tag]) {
					return 0; // Peace Treaty blocks scorch
				}
				let power_op = max.op_noshield.length ? max.op_noshield[0].card.power : 0;
				let power_me = max.me_noshield.length ? max.me_noshield[0].card.power : 0;
				
				// CRITICAL: Never scorch if it would kill our own units
				// If we have the strongest units globally, scorch would kill our own units
				if (power_me > power_op) {
					return 0; // Don't scorch if we have the strongest units
				}
				
				// If we tie for strongest power, carefully calculate if it's worth it
				if (power_me === power_op && power_op > 0) {
					// Get all our units with max power across ALL rows (scorch affects all rows)
					const myAllUnits = this.player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
					const myMaxPowerUnits = myAllUnits.filter(c => c.power === power_me);
					const myLoss = myMaxPowerUnits.reduce((sum, c) => sum + c.power, 0);
					
					// Get opponent's units with max power across ALL rows
					const opponentAllUnits = opponent.getAllRowCards().filter(c => c.isUnit() && !c.hero);
					const opponentMaxPowerUnits = opponentAllUnits.filter(c => c.power === power_op);
					const opponentLoss = opponentMaxPowerUnits.reduce((sum, c) => sum + c.power, 0);
					
					// Only worth it if we kill significantly more opponent power than our own
					// Require at least 2:1 ratio to make it worthwhile (smart usage)
					if (myLoss * 2 >= opponentLoss) {
						return 0; // Would kill too many of our own units relative to opponent
					}
					// Return net value (opponent loss - our loss), but only if positive
					const netValue = opponentLoss - myLoss;
					return Math.max(0, netValue);
				}
				
				// We don't have the strongest units, so scorch is safe
				// Calculate total value of killing opponent's strongest units
				let total_op = 0;
				if (max.op_noshield.length > 0) {
					// Get all opponent units with max power across all rows
					const opponentAllUnits = opponent.getAllRowCards().filter(c => c.isUnit() && !c.hero);
					const opponentMaxPower = Math.max(...opponentAllUnits.map(c => c.power), 0);
					const opponentMaxUnits = opponentAllUnits.filter(c => c.power === opponentMaxPower);
					
					total_op = opponentMaxUnits.reduce((sum, c) => {
						// Consider martyr cost if applicable
						if (c.abilities.includes("martyr")) {
							return sum + this.evaluateKillingOpponentUnit(c, card);
						}
						return sum + c.power;
					}, 0);
				}
				
				return total_op;
			}
			if (abi.includes("cull")) {
				if (game.scorchCancelled) return Math.max(0, card.power);
				// Check if opponent has Peace Treaty active
				const opponent = this.player.opponent();
				if (game.peaceTreatyActive && game.peaceTreatyActive[opponent.tag]) {
					return 0; // Peace Treaty blocks cull
				}
				// Get all units from both players (excluding heroes)
				const myAllUnits = this.player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
				const opponentAllUnits = opponent.getAllRowCards().filter(c => c.isUnit() && !c.hero);
				
				if (myAllUnits.length === 0 && opponentAllUnits.length === 0) return 0; // No valid targets
				
				// Find minimum power across all units
				const allUnits = [...myAllUnits, ...opponentAllUnits];
				const minPower = Math.min(...allUnits.map(c => c.power), Infinity);
				if (minPower === Infinity) return 0; // No valid targets
				
				// Get units with minimum power
				const myMinPowerUnits = myAllUnits.filter(c => c.power === minPower);
				const opponentMinPowerUnits = opponentAllUnits.filter(c => c.power === minPower);
				
				const myLoss = myMinPowerUnits.reduce((sum, c) => sum + c.power, 0);
				const opponentLoss = opponentMinPowerUnits.reduce((sum, c) => {
					// Consider martyr cost if applicable
					if (c.abilities.includes("martyr")) {
						return sum + this.evaluateKillingOpponentUnit(c, card);
					}
					return sum + c.power;
				}, 0);
				
				// CRITICAL: Avoid cull if we have the weakest units and opponent doesn't
				// Only use if opponent has weak units and we don't, or if we kill more opponent power
				if (myMinPowerUnits.length > 0 && opponentMinPowerUnits.length === 0) {
					return 0; // We have weakest units, opponent doesn't - don't use
				}
				
				// If both have weakest units, only use if we kill significantly more opponent power
				if (myMinPowerUnits.length > 0 && opponentMinPowerUnits.length > 0) {
					// Require at least 2:1 ratio to make it worthwhile
					if (myLoss * 2 >= opponentLoss) {
						return 0; // Would kill too many of our own units relative to opponent
					}
					// Return net value (opponent loss - our loss), but only if positive
					const netValue = opponentLoss - myLoss;
					return Math.max(0, netValue);
				}
				
				// We don't have the weakest units, so cull is safe - calculate value
				return opponentLoss;
			}
			if (abi.includes("decoy")) return game.decoyCancelled ? 0 : data.spy.length ? 50 : data.medic.length ? 15 : data.scorch.length ? 10 : max.me.length ? 1 : 0;
			if (abi.includes("mardroeme")) {
				let rows = this.player.getAllRows();
				return Math.max(...rows.map(r => this.weightMardroemeRow(card, r)));
			}
			if (["cintra_slaughter", "seize", "lock", "shield", "sign_aard", "shield_c", "shield_r", "shield_s", "bank", "waylay", "trade", "guard", "necromancy", "sacrifice", "omen", "execute", "martyr", "fortify", "peace_treaty", "conspiracy", "skellige_tactics", "emissary"].includes(abi.at(-1))) {
				if (ability_dict[abi.at(-1)].weight) {
					return ability_dict[abi.at(-1)].weight(card, this, max);
				}
			}
			if (abi.includes("witch_hunt")) {
				if (game.scorchCancelled) return card.power;
				// Check if opponent has Peace Treaty active
				const opponent = this.player.opponent();
				if (game.peaceTreatyActive && game.peaceTreatyActive[opponent.tag]) {
					return 0; // Peace Treaty blocks witch_hunt
				}
				let best_row = this.bestWitchHuntRow(card);
				if (best_row) {
					const weakestUnits = best_row.minUnits();
					// Calculate damage considering martyr cost
					let dmg = 0;
					for (const unit of weakestUnits) {
						if (unit.abilities.includes("martyr")) {
							// Use martyr-adjusted value
							dmg += this.evaluateKillingOpponentUnit(unit, card);
						} else {
							dmg += unit.power;
						}
					}
					if (dmg < 6) dmg = 0;
					return dmg + card.power;
				}
				return card.power;
			}
			if (abi.includes("toussaint_wine") || abi.includes("wine")) {
				let units = card.holder.getAllRowCards().concat(card.holder.hand.cards).filter(c => c.isUnit()).filter(c => !c.abilities.includes("spy"));
				let rowStats = { "close": 0, "ranged": 0, "siege": 0, "agile": 0 };
				units.forEach(c => {
					rowStats[c.row] += 1;
				});
				rowStats["close"] += rowStats["agile"];
				let rows = card.holder.getAllRows();
				rowStats["close"] = board.getRow(card,"close",this.player).effects.toussaint_wine > 0 ? 0 : rowStats["close"];
				rowStats["ranged"] = board.getRow(card, "ranged", this.player).effects.toussaint_wine > 0 ? 0 : rowStats["ranged"];
				rowStats["siege"] = board.getRow(card, "siege", this.player).effects.toussaint_wine > 0 ? 0 : rowStats["siege"];
				return 2 * Math.max(rowStats["close"], rowStats["ranged"], rowStats["siege"]);
			}
			if (abi.at(-1) && abi.at(-1).startsWith("witcher_")) {
				let witchers = card.holder.getAllRowCards().filter(c => c.abilities.includes(abi.at(-1)));
				let keep = witchers.filter(c => c.hero);
				return card.power + (2 * witchers.length * 2) + (keep.length > 0 ? keep[0].power : 0);
			}
			if (abi.includes("inspire")) {
				let insp = card.holder.getAllRowCards().filter(c => c.abilities.includes("inspire"));
				let best_power = 0;
				if (insp.length > 0) best_power = insp.sort((a, b) => b.power - a.power)[0].power;
				let max_power = Math.max(card.power, best_power);
				if (card.power === max_power) return max_power + insp.map(c => max_power - c.power).reduce((a, c) => a + c, 0);
				return max_power;
			}
			
			// Hunger (transformation ability - transforms with nightfall)
			if (abi.includes("hunger")) {
				// Weight based on whether nightfall is active or can be played
				let nightfallActive = board.row.some(r => r.effects.nightfall);
				let nightfallInHand = card.holder.hand.cards.some(c => c.abilities.includes("nightfall"));
				if (nightfallActive || nightfallInHand) {
					// Can transform, weight based on target card value
					if (card.target && card_dict[card.target]) {
						let targetPower = Number(card_dict[card.target].strength);
						return targetPower + (nightfallActive ? 10 : 5);
					}
				}
				return card.power;
			}
			
			// Resilience (stays on board between rounds)
			if (abi.includes("resilience")) {
				// Bonus for resilience cards in later rounds
				let resilienceBonus = (game.roundCount - 1) * 5;
				return card.power + resilienceBonus;
			}
			
			// Worshipped (boosted by worshippers)
			if (abi.includes("worshipped")) {
				let worshippers = card.holder.getAllRowCards().filter(c => c.abilities.includes("worshipper"));
				let boost = worshippers.length;
				// Check for zerrikanterment (doubles boost)
				if (card.holder.getAllRowCards().some(c => c.abilities.includes("zerrikanterment"))) {
					boost *= 2;
				}
				return card.power + boost;
			}
			
			// Redania Purge (like scorch but discards after)
			if (abi.includes("redania_purge")) {
				if (game.scorchCancelled) return Math.max(0, card.power);
				const opponent = this.player.opponent();
				if (game.peaceTreatyActive && game.peaceTreatyActive[opponent.tag]) {
					return 0; // Peace Treaty blocks redania_purge
				}
				let power_op = max.op_noshield.length ? max.op_noshield[0].card.power : 0;
				let power_me = max.me_noshield.length ? max.me_noshield[0].card.power : 0;
				if (power_me > power_op) return 0;
				let total_op = power_op * max.op_noshield.length;
				let total_me = power_me * max.me_noshield.length;
				return power_me < power_op ? total_op : Math.max(0, total_op - total_me);
			}
		}
		if (card.row === "weather" || (card.deck && card.deck.startsWith("weather"))) {
			const weatherWeight = this.weightWeather(card);
			// For clear weather, allow negative weights to be considered only if no other options
			// This is handled in startTurnOriginal fallback logic
			return weatherWeight;
		}
		// Handle special cards that don't have a row (like Sign: Axii, Seize, etc.)
		// These cards use their ability's weight function directly
		if (card.faction === "special" && (!card.row || card.row === "")) {
			// Check if the card has an ability with a weight function
			if (abi.length > 0 && ability_dict[abi[abi.length - 1]] && ability_dict[abi[abi.length - 1]].weight) {
				const weightFunc = ability_dict[abi[abi.length - 1]].weight;
				// Some weight functions expect (card, ai, max), others just (card)
				// Try with ai and max first, fallback to just card
				try {
					if (weightFunc.length > 1) {
						// Function expects multiple parameters
						return weightFunc(card, this, max);
					} else {
						// Function expects just card
						return weightFunc(card);
					}
				} catch (e) {
					// If that fails, try with just card
					return weightFunc(card);
				}
			}
			// Fallback: return a default weight for special cards without rows
			return 10;
		}
		// Handle leader cards - they don't go on rows, so return early
		if (card.row === "leader") {
			// Leader cards are not playable units, return 0 weight
			return 0;
		}
		
		// Handle empty row strings - default to "close" for unit cards
		let rowName = card.row;
		if (!rowName || rowName === "") {
			rowName = "close"; // Default to close row for cards without specified row
		} else if (card.row === "agile" || card.row === "any" || card.row === "melee_siege") {
			rowName = "close";
		} else if (card.row === "ranged_siege") {
			rowName = "ranged";
		}
		let row = board.getRow(card, rowName, this.player);
		if (!row) {
			// Fallback if getRow still returns undefined
			console.warn("getRow returned undefined for card:", card.name, "row:", rowName);
			return 0;
		}
		let score = row.calcCardScore(card);
		
		// WEATHER AVOIDANCE: Penalize playing units on weather-affected rows
		// Difficulty affects how strictly we avoid weather
		if (card.isUnit() && !card.hero) {
			const difficulty = window.aiDifficultyManager ? window.aiDifficultyManager.getDifficulty() : 'medium';
			const shouldAvoidWeather = window.aiDifficultyManager ? window.aiDifficultyManager.shouldAvoidWeather() : true;
			
			// Check if this row has weather
			const hasWeather = row.special.cards.some(c => 
				c.row === "weather" || (c.deck && c.deck.startsWith("weather")) ||
				c.abilities && (c.abilities.includes("frost") || c.abilities.includes("fog") || 
					c.abilities.includes("rain") || c.abilities.includes("storm") || 
					c.abilities.includes("sandstorm") || c.abilities.includes("nightfall"))
			);
			
			if (hasWeather && shouldAvoidWeather) {
				// Check if card can be played on other rows (agile, any, etc.)
				const canPlayElsewhere = card.row === "agile" || card.row === "any" || 
					card.row === "melee_siege" || card.row === "ranged_siege";
				
				if (canPlayElsewhere) {
					// Find alternative rows without weather
					const allRows = this.player.getAllRows();
					const alternativeRows = allRows.filter(r => {
						if (r === row) return false; // Not the current row
						// Check if card can be played on this row
						if (card.row === "agile" || card.row === "any") {
							return r.type === "close" || r.type === "ranged";
						} else if (card.row === "melee_siege") {
							return r.type === "close" || r.type === "siege";
						} else if (card.row === "ranged_siege") {
							return r.type === "ranged" || r.type === "siege";
						}
						return false;
					});
					
					const rowsWithoutWeather = alternativeRows.filter(r => {
						return !r.special.cards.some(c => 
							c.row === "weather" || (c.deck && c.deck.startsWith("weather")) ||
							c.abilities && (c.abilities.includes("frost") || c.abilities.includes("fog") || 
								c.abilities.includes("rain") || c.abilities.includes("storm") || 
								c.abilities.includes("sandstorm") || c.abilities.includes("nightfall"))
						);
					});
					
					// If there are alternative rows without weather, heavily penalize this row
					if (rowsWithoutWeather.length > 0) {
						// Penalty based on difficulty: Hard = full penalty, Medium = moderate, Easy = light
						const penalty = difficulty === 'hard' ? 100 : (difficulty === 'medium' ? 60 : 30);
						score = Math.max(0, score - penalty);
					}
				} else {
					// Card can only be played on this row - check if we have other options
					const otherPlayableCards = this.player.hand.cards.filter(c => 
						c !== card && c.isUnit() && !c.hero &&
						!(c.row === "agile" || c.row === "any" || c.row === "melee_siege" || c.row === "ranged_siege")
					);
					
					// If we have other options and should avoid weather, reduce score
					if (otherPlayableCards.length > 0 && shouldAvoidWeather) {
						const penalty = difficulty === 'hard' ? 50 : (difficulty === 'medium' ? 30 : 15);
						score = Math.max(0, score - penalty);
					}
				}
			}
		}
		
		// Check for units with horn ability - penalize playing on empty rows
		if (card.isUnit() && (abi.includes("horn") || abi.includes("redania_horn"))) {
			const hornUnitCount = row.cards.filter(c => c.isUnit()).length;
			if (hornUnitCount === 0) {
				// Check if there are other rows with units available
				const allRows = this.player.getAllRows();
				const rowsWithUnits = allRows.filter(r => r.cards.filter(c => c.isUnit()).length > 0);
				if (rowsWithUnits.length > 0) {
					// Heavily penalize - only allow if no other options
					score = Math.max(0, score - 50);
				}
			}
		}
		
		switch (abi[abi.length - 1]) {
			case "bond":
				score = (card.row === "agile" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege") ? this.bestAgileRowChange(card).score : this.weightRowChange(card, row);
				break;
			case "morale":
				// Heavily penalize playing morale on empty rows
				const moraleUnitCount = row.cards.filter(c => c.isUnit()).length;
				if (moraleUnitCount === 0) {
					// Check if there are other rows with units available
					const allRows = this.player.getAllRows();
					const rowsWithUnits = allRows.filter(r => r.cards.filter(c => c.isUnit()).length > 0);
					
					// Check if AI has no choice (down to last cards or no other units for specified rows)
					const cardsInHand = this.player.hand.cards.length;
					const allUnits = this.player.getAllRowCards().filter(c => c.isUnit() && !c.hero);
					// Has no choice if:
					// 1. Down to 2 or fewer cards
					// 2. Card has specific row requirement and no units exist on board
					// 3. Card is agile/any but no units exist on any row
					const hasNoChoice = cardsInHand <= 2 || 
						(card.row !== "agile" && card.row !== "any" && card.row !== "melee_siege" && card.row !== "ranged_siege" && allUnits.length === 0) ||
						((card.row === "agile" || card.row === "any") && allUnits.length === 0);
					
					if (rowsWithUnits.length > 0) {
						// Check if there are other playable cards (not guard/morale) that could be played instead
						const otherPlayableCards = this.player.hand.cards.filter(c => 
							c !== card && 
							!c.abilities.includes("guard") && 
							!c.abilities.includes("morale")
						);
						if (otherPlayableCards.length > 0 && !hasNoChoice) {
							score = 0; // Don't play morale on empty row if there are other options
						} else {
							score = 1; // Last resort only if no other options
						}
					} else {
						// All rows are empty - only play if no choice
						if (hasNoChoice) {
							score = 1; // Last resort only if all rows are empty and no other options
						} else {
							score = 0; // Don't play morale on empty rows if we have other cards
						}
					}
				} else {
				score = (card.row === "agile" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege") ? this.bestAgileRowChange(card).score : this.weightRowChange(card, row);
				}
				break;
			case "horn":
				score = (card.row === "agile" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege") ? this.bestHornRow(card).score : this.weightHornRow(card, row);
				break;
			case "medic":
				score = this.weightMedic(data, score, card.holder);
				break;
			case "spy":
				// Boost spy value in strategic situations:
				// 1. When losing significantly (play spy to get card advantage)
				// 2. When getting low on cards (need card draw)
				// 3. To open a round (early in round)
				const opponent = this.player.opponent();
				const pointDeficit = opponent.total - this.player.total;
				const cardsInHand = this.player.hand.cards.length;
				const cardsInDeck = this.player.deck.cards.length;
				const roundNumber = game.roundCount;
				const isEarlyRound = roundNumber === 1 && this.player.getAllRowCards().length < 3;
				
				let spyBonus = 15; // Base spy value
				
				// Boost if losing significantly (20+ points)
				if (pointDeficit >= 20) {
					spyBonus += 25; // Strong incentive to play spy when losing
				} else if (pointDeficit >= 10) {
					spyBonus += 15; // Moderate boost when losing
				}
				
				// Boost if getting low on cards (need card advantage)
				if (cardsInHand <= 3 || cardsInDeck <= 5) {
					spyBonus += 20; // Strong incentive when low on cards
				} else if (cardsInHand <= 5) {
					spyBonus += 10; // Moderate boost when getting low
				}
				
				// Boost to open a round (early in round 1)
				if (isEarlyRound) {
					spyBonus += 15; // Good to play spy early to get card advantage
				}
				
				score = spyBonus + score;
				break;
			case "muster":
				let pred = c => c.target === card.target;
				let units = card.holder.hand.cards.filter(pred).concat(card.holder.deck.cards.filter(pred));
				score *= units.length;
				break;
			case "scorch_c":
				score = Math.max(1, this.weightScorchRow(card, max, "close"));
				break;
			case "scorch_r":
				score = Math.max(1, this.weightScorchRow(card, max, "ranged"));
				break;
			case "scorch_s":
				score = Math.max(1, this.weightScorchRow(card, max, "siege"));
				break;
			case "berserker":
				score = this.weightBerserker(card, row, score);
				break;
			case "avenger":
			case "avenger_kambi":
			case "worshipper":
			case "hunger":
				return score + ability_dict[abi.at(-1)].weight(card);
		}
		// Apply defensive considerations (playing around opponent abilities)
		score = this.applyDefensiveConsiderations(card, row, score);
		return score;
	}

	/**
	 * Apply defensive considerations when playing cards (awareness of opponent abilities)
	 */
	applyDefensiveConsiderations(card, row, score) {
		if (!card.isUnit()) return score;
		const opponent = this.player.opponent();
		let defensivePenalty = 0;

		// Waylay: Avoid playing units on rows with waylay (opponent draws 2 cards)
		if (row.waylayCard && row.waylayCard.holder === opponent) {
			defensivePenalty += 5; // Penalize playing into waylay
		}

		// Execute: Don't leave lone heroes vulnerable
		if (card.hero) {
			const otherUnits = row.cards.filter(c => c.isUnit() && !c.hero && c !== card);
			if (otherUnits.length === 0) {
				// This would be a lone hero - check if opponent has execute
				const opponentExecute = opponent.getAllRowCards().filter(c => 
					c.isUnit() && c.abilities.includes("execute")
				);
				if (opponentExecute.length > 0) {
					defensivePenalty += card.power; // Heavy penalty for vulnerable lone hero
				}
			}
		}


		// Guard: Be aware that guarded units are protected
		// (This is more of an offensive consideration, but worth noting)
		const guardedUnits = row.cards.filter(c => c.guardedBy);
		if (guardedUnits.length > 0 && card.abilities.includes("scorch")) {
			// Scorch won't work on guarded units
			defensivePenalty += 2;
		}

		// Martyr: Consider strategic value of our own martyr units
		// If we have martyr units and need card draw, they're more valuable
		if (card.abilities.includes("martyr")) {
			const handSize = this.player.hand.cards.length;
			const opponentHandSize = opponent.hand.cards.length;
			const cardDisadvantage = opponentHandSize - handSize;
			// More valuable if we're behind in cards
			if (cardDisadvantage > 1) {
				score += 3; // Bonus for martyr when we need cards
			}
		}

		// Peace Treaty: Opponent's Peace Treaty protects their units from damage
		// Don't waste damaging abilities when opponent has Peace Treaty active
		if (game.peaceTreatyActive && game.peaceTreatyActive[opponent.tag]) {
			if (card.abilities.includes("scorch") || card.abilities.includes("scorch_c") || 
			    card.abilities.includes("scorch_r") || card.abilities.includes("scorch_s") ||
			    card.abilities.includes("execute") || card.abilities.includes("witch_hunt") ||
			    card.abilities.includes("redania_purge")) {
				defensivePenalty += 50; // Heavy penalty - Peace Treaty blocks these abilities
			}
		}

		return Math.max(0, score - defensivePenalty);
	}

	/**
	 * Evaluate cost/benefit of killing an opponent unit (considering martyr)
	 */
	evaluateKillingOpponentUnit(targetUnit, killingCard) {
		if (!targetUnit || !targetUnit.isUnit()) return 0;
		
		const opponent = targetUnit.holder;
		const powerRemoved = targetUnit.power;
		let value = powerRemoved;
		
		// If the unit has martyr, opponent draws a card (cost)
		if (targetUnit.abilities.includes("martyr")) {
			const opponentHandSize = opponent.hand.cards.length;
			const ourHandSize = this.player.hand.cards.length;
			const cardAdvantage = ourHandSize - opponentHandSize;
			
			// Cost of giving opponent a card
			const martyrCost = 8; // Base cost for giving opponent card advantage
			
			// If we're already ahead in cards, the cost is less
			const costReduction = cardAdvantage > 2 ? 3 : (cardAdvantage > 0 ? 1 : 0);
			
			// If the martyr unit is high power, it might still be worth killing
			// Calculate net value: power removed - cost of giving them a card
			const netValue = powerRemoved - (martyrCost - costReduction);
			
			// Only worth it if net value is positive, or if it's a very high power unit
			if (netValue > 0 || powerRemoved >= 10) {
				value = netValue;
			} else {
				// Not worth killing low-power martyrs unless we're desperate
				value = Math.max(0, netValue);
			}
		}
		
		return value;
	}

	calcRowPower(r, dif, add) {
		r.findCards(c => c.isUnit()).forEach(c => {
			let p = r.calcCardScore(c);
			c.holder === this.player ? (dif[0] += add ? p : -p) : (dif[1] += add ? p : -p);
		});
	}
}

class Player {
	constructor(id, name, deck, isAI = true) {
		this.id = id;
		this.tag = (id === 0) ? "me" : "op";
		this.controller = isAI ? new ControllerAI(this) : new Controller();
		this.hand = game.fullAI ? 
			(id === 0) ?
				new Hand(document.getElementById("hand-row"), this.tag)
			:
				new Hand(document.getElementById("op-hand-row"), this.tag)
		:
			(id === 0) ?
				new Hand(document.getElementById("hand-row"), this.tag)
			:
				new HandAI(this.tag)
		;
		this.grave = new Grave(document.getElementById("grave-" + this.tag));
		this.deck = new Deck(deck.faction, document.getElementById("deck-" + this.tag));
		this.deck_data = deck;
		this.leader = new Card(deck.leader.index, deck.leader.card, this);
		this.elem_leader = document.getElementById("leader-" + this.tag);
		this.elem_leader.children[0].appendChild(this.leader.elem);
		this.reset();
		this.name = name;
		document.getElementById("name-" + this.tag).innerHTML = name;
		// Only use deck title if it exists and is not empty, otherwise use faction name
		var nomeDeck = (deck.title && deck.title.trim()) ? deck.title : factions[deck.faction].name;
		if (nomeDeck.indexOf(" - ") > -1) nomeDeck = nomeDeck.replace(" - ", ":<br /><i>") + "</i>";
		document.getElementById("deck-name-" + this.tag).innerHTML = nomeDeck;
		document.getElementById("stats-" + this.tag).getElementsByClassName("profile-img")[0].children[0].children[0];
		let x = document.querySelector("#stats-" + this.tag + " .profile-img > div > div");
		x.style.backgroundImage = iconURL("deck_shield_" + deck.faction);
		// Add click handler to show faction ability
		x.addEventListener("click", () => this.showFactionAbility(), false);
		x.addEventListener("mouseover", function() {
			tocar("card", false);
			this.style.transform = "scale(1.05)";
		});
		x.addEventListener("mouseout", function() {
			this.style.transform = "scale(1)";
		});
	}

	reset() {
		this.grave.reset();
		this.hand.reset();
		this.deck.reset();
		this.deck.initializeFromID(this.deck_data.cards, this);
		this.health = 2;
		this.total = 0;
		this.passed = false;
		this.handsize = 10;
		this.winning = false;
		this.factionAbilityUses = 0;
		this.turnCount = 0; // Initialize turn count
		this.effects = {
			"witchers": {},
			"worshippers": 0,
			"inspire": 0
		};
		let factionAbility = factions[this.deck.faction];
		if (factionAbility["activeAbility"]) {
			if (factionAbility.factionAbilityInit) factionAbility.factionAbilityInit(this);
			this.updateFactionAbilityUses(factionAbility["abilityUses"]);
			document.getElementById("faction-ability-" + this.tag).classList.remove("hide");
			if (this.tag === "me") document.getElementById("faction-ability-" + this.tag).addEventListener("click", () => this.activateFactionAbility(), false);
		} else document.getElementById("faction-ability-" + this.tag).classList.add("hide");
		this.enableLeader();
		this.setPassed(false);
		document.getElementById("gem1-" + this.tag).classList.add("gem-on");
		document.getElementById("gem2-" + this.tag).classList.add("gem-on");
	}

	roundStartReset() {
		this.effects = {
			"witchers": {},
			"worshippers": 0,
			"inspire": 0
		};
		// Recalculate worshipper count from cards that stayed on the field
		// This is important for cards that persist between rounds (resilience, immortal, monsters faction)
		const worshippersOnField = this.getAllRowCards().filter(c => c.abilities.includes("worshipper") && !c.isLocked());
		this.effects["worshippers"] = worshippersOnField.length;
		// Reset turn count at the start of each round
		this.turnCount = 0;
		// Reset round 2 card tracking
		this.round2CardsPlayed = 0;
		this.mustPlay3CardsRound2 = false;
		
		// Check if we're starting round 2 and AI has 8+ cards
		// roundCount is incremented before roundStartReset is called, so roundCount === 2 means we're starting round 2
		if (game.roundCount === 2 && this.controller instanceof ControllerAI && this.hand.cards.length >= 8) {
			// 70% chance to force playing at least 3 cards in round 2
			if (Math.random() < 0.7) {
				this.mustPlay3CardsRound2 = true;
				console.log(`🎯 Round 2: AI has ${this.hand.cards.length} cards - will play at least 3 cards this round`);
			}
		}
	}

	opponent() {
		return board.opponent(this);
	}

	updateTotal(n) {
		const oldTotal = this.total;
		this.total += n;
		document.getElementById("score-total-" + this.tag).children[0].innerHTML = this.total;
		board.updateLeader();
		
		// Trade ability: When opponent's total reaches 12, 24, or 36, the player with Trade cards draws 1 card from their deck
		const opponent = this.opponent();
		const thresholds = [12, 24, 36];
		if (!game.tradeThresholdsTriggered) {
			game.tradeThresholdsTriggered = {
				me: new Set(),
				op: new Set()
			};
		}
		if (!(game.tradeThresholdsTriggered[this.tag] instanceof Set)) {
			game.tradeThresholdsTriggered[this.tag] = new Set();
		}
		const triggeredThresholds = game.tradeThresholdsTriggered[this.tag];
		if (thresholds.includes(this.total) && !triggeredThresholds.has(this.total)) {
			triggeredThresholds.add(this.total);
			// Find Trade cards on the opponent's field (the player who owns the Trade cards)
			const tradeCards = opponent.getAllRowCards().filter(c => c.isUnit() && c.abilities.includes("trade"));
			if (tradeCards.length > 0 && opponent.deck.cards.length > 0) {
				const tradeCard = tradeCards[0];
				(async () => {
					// Play trade sound effect
					tocar("trade", false);
					
					// Play anim_trade over the deck
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
						deckAnim.style.backgroundImage = iconURL("anim_trade");
						deckAnim.style.backgroundSize = "cover";
						deckAnim.style.backgroundPosition = "center";
						deckAnim.style.pointerEvents = "none";
						deckAnim.style.zIndex = "1000";
						deckAnim.style.opacity = "0";
						deckElem.style.position = "relative";
						deckElem.appendChild(deckAnim);
					}
					
					// Play animation over deck
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
					
					// Draw card from opponent's deck (the player who owns the Trade cards)
					// Check if embargo is preventing this player from drawing
					if (game.embargoActive && game.embargoActive.blockedPlayer === opponent) {
						// Embargo is active - prevent drawing
						return;
					}
					// Safety check: Don't draw from empty deck
					if (opponent.deck.cards.length === 0) {
						console.warn("Trade ability: Attempted to draw from empty deck");
						return;
					}
					const drawn = opponent.deck.cards[0];
					opponent.deck.removeCard(drawn);
					opponent.hand.addCard(drawn);
				})();
			}
		}
	}

	setWinning(isWinning) {
		if (this.winning ^ isWinning) document.getElementById("score-total-" + this.tag).classList.toggle("score-leader");
		this.winning = isWinning;
	}

	setPassed(hasPassed) {
		if (this.passed ^ hasPassed) document.getElementById("passed-" + this.tag).classList.toggle("passed");
		this.passed = hasPassed;
	}

	async startTurn() {
		// Increment turn count for this player
		if (this.turnCount === undefined) this.turnCount = 0;
		this.turnCount++;
		
		document.getElementById("stats-" + this.tag).classList.add("current-turn");
		if (this.leaderAvailable) this.elem_leader.children[1].classList.remove("hide");
		if (this === player_me) {
			document.getElementById("pass-button").classList.remove("noclick");
			document.getElementById("giveup-button").classList.remove("noclick");
			may_pass1 = true;
			may_giveup1 = true;
		}
		if (this.controller instanceof ControllerAI) {
			await this.controller.startTurn(this);
		}
	}

	passRound() {
		this.setPassed(true);
		ui.notification("op-pass", 1200);
		this.endTurn();
	}

	async playScorch(card) {
		if (!game.scorchCancelled) await this.playCardAction(card, async () => await ability_dict["scorch"].activated(card));
	}

	async playCull(card) {
		if (!game.scorchCancelled) await this.playCardAction(card, async () => await ability_dict["cull"].activated(card));
	}

	async playSlaughterCintra(card) {
		await this.playCardAction(card, async () => await ability_dict["cintra_slaughter"].activated(card)); 
	}

	async playSeize(card) {
		await this.playCardAction(card, async () => await ability_dict["seize"].activated(card));
	}

	async playKnockback(card) {
		let best_row = board.getRow(card, "close", this.opponent());
		if (board.getRow(card, "close", this.opponent()).cards.length === 0) best_row = board.getRow(card, "ranged", this.opponent());
		if (board.getRow(card, "ranged", this.opponent()).cards.length > 1 && board.getRow(card, "siege", this.opponent()).effects.weather) best_row = board.getRow(card, "ranged", this.opponent());
		if ((
			board.getRow(card, "ranged", this.opponent()).isShielded() || board.getRow(card, "ranged", this.opponent()).effects.horn > 0
		) && board.getRow(card, "ranged", this.opponent()).cards.length > 0) best_row = board.getRow(card, "ranged", this.opponent());
		if (Object.keys(board.getRow(card, "ranged", this.opponent()).effects.bond).length > 0 && board.getRow(card, "siege", this.opponent()).effects.horn === 0) best_row = board.getRow(card, "ranged", this.opponent());
		await this.playCardAction(card, async () => await ability_dict["sign_aard"].activated(card, best_row));
	}

	async playBank(card) {
		await this.playCardAction(card, async () => await ability_dict["bank"].activated(card));
	}

	async playCardToRow(card, row) {
		await this.playCardAction(card, async () => await board.moveTo(card, row, this.hand));
	}

	async playCard(card) {
		await this.playCardAction(card, async () => await card.autoplay(this.hand));
	}

	async playCardAction(card, action) {
		ui.showPreviewVisuals(card);
		await sleep(1000);
		ui.hidePreview(card);
		await action();
		this.endTurn();
	}

	endTurn() {
		if (!this.passed && !this.canPlay()) {
			this.setPassed(true);
			ui.notification("op-pass", 1200);
		}
		if (this === player_me) {
			document.getElementById("pass-button").classList.add("noclick");
			document.getElementById("giveup-button").classList.add("noclick");
			may_pass1 = false;
			may_giveup1 = false;
		}
		document.getElementById("stats-" + this.tag).classList.remove("current-turn");
		this.elem_leader.children[1].classList.add("hide");
		game.endTurn()
	}

	endRound(win) {
		if (!win) {
			if (this.health < 1) return;
			document.getElementById("gem" + this.health + "-" + this.tag).classList.remove("gem-on");
			this.health--;
		}
		this.setPassed(false);
		this.setWinning(false);
	}

	canPlay() {
		// Check if we have any playable cards
		if (this.hand.cards.length === 0 && !this.leaderAvailable && this.factionAbilityUses === 0) {
			return false;
		}
		
		// Special check: Decoy cards require a valid target to swap with
		// If the only card in hand is a Decoy with no valid targets, we can't play
		const decoyCards = this.hand.cards.filter(c => 
			c.key === "spe_decoy" || c.abilities.includes("decoy")
		);
		
		if (decoyCards.length > 0 && this.hand.cards.length === decoyCards.length && !this.leaderAvailable && this.factionAbilityUses === 0) {
			// Only decoy cards in hand - check if there are any valid targets
			const hasValidTarget = this.getAllRowCards().some(c => c.isUnit());
			if (!hasValidTarget) {
				return false; // No valid targets for decoy
			}
		}
		
		return true;
	}

	async activateLeader() {
		try {
			Carousel.curr.cancel();
		} catch (err) {}
		if (this.leaderAvailable) {
			this.endTurnAfterAbilityUse = true;
			
			// For AI players, add safeguard: if ability has no viable option, just end turn
			if (this.controller instanceof ControllerAI) {
				try {
					await this.leader.activated[0](this.leader, this);
				} catch (err) {
					console.warn("[LEADER ABILITY] Error activating leader ability for AI:", err);
					// If ability fails, just disable leader and end turn
					this.disableLeader();
					this.endTurn();
					return;
				}
			} else {
				await this.leader.activated[0](this.leader, this);
			}
			
			this.disableLeader();
			if (this.endTurnAfterAbilityUse) this.endTurn();
			else {
				if (this.controller instanceof ControllerAI) {
					if (this.leader.key === "wu_alzur_maker") {
						let worse_unit = this.getAllRowCards().filter(c => c.isUnit()).sort((a, b) => a.power - b.power)[0];
						if (worse_unit) {
							ui.selectCard(worse_unit);
						} else {
							// No units available, just end turn
							this.endTurn();
						}
					} else if (this.leader.key === "sy_carlo_varese") {
						let max = this.controller.getMaximums();
						let rows = [this.controller.weightScorchRow(this.leader, max, "close"), this.controller.weightScorchRow(this.leader, max, "ranged"), this.controller.weightScorchRow(this.leader, max, "siege")];
						let maxv = 0, max_row;
						let offset = 3;
						if (this === player_me) {
							offset = 0;
							rows = rows.reverse();
						}
						for (var i = 0; i < 3; i++) {
							if (rows[i] > maxv) {
								maxv = rows[i];
								max_row = board.row[offset + i];
							}
						}
						if (max_row) {
							ui.selectRow(max_row);
						} else {
							// No viable row to scorch, just end turn
							this.endTurn();
						}
					} else if (this.leader.key === "lr_meve_princess") {
						// Meve Princess: automatically finds rows with 4+ cards and destroys one
						await ability_dict["meve_princess"].activated(this.leader, this);
						if (this.endTurnAfterAbilityUse) this.endTurn();
					} else if (this.leader.key === "sy_cyrus_hemmelfart") {
						let offset = 3;
						if (this === player_me) offset = 0;
						ui.selectRow(board.row[offset+randomInt(2)]);
					}
				}
			}
		}
	}

	disableLeader() {
		this.leaderAvailable = false;
		let elem = this.elem_leader.cloneNode(true);
		this.elem_leader.parentNode.replaceChild(elem, this.elem_leader);
		this.elem_leader = elem;
		this.elem_leader.children[0].classList.add("fade");
		this.elem_leader.children[1].classList.add("hide");
		this.elem_leader.classList.remove("leader-ready");
		this.elem_leader.addEventListener("click", async () => await ui.viewCard(this.leader), false);
	}

	enableLeader() {
		this.leaderAvailable = this.leader.activated.length > 0;
		let elem = this.elem_leader.cloneNode(true);
		this.elem_leader.parentNode.replaceChild(elem, this.elem_leader);
		this.elem_leader = elem;
		this.elem_leader.children[0].classList.remove("fade");
		this.elem_leader.children[1].classList.remove("hide");
		if (this.leaderAvailable) this.elem_leader.classList.add("leader-ready");
		if (this.id === 0 && this.leader.activated.length > 0) {
			// Player's own leader - can activate or view
			this.elem_leader.children[0].addEventListener("click",
				async () => await ui.viewCard(this.leader, async () => await this.activateLeader()), false
			);
			this.elem_leader.children[0].addEventListener("mouseover", function() {
				tocar("card", false);
				this.style.boxShadow = "0 0 1.5vw #6d5210";
			});
			this.elem_leader.children[0].addEventListener("mouseout", function() {
				this.style.boxShadow = "0 0 0 #6d5210";
			});
			window.addEventListener("keydown", function(e) {
				if (may_leader && may_pass1 && !game.fullAI && e.keyCode == 88 && !lancado) {
					if (exibindo_lider) {
						exibindo_lider = false;
						player_me.activateLeader();
					} else if (player_me.leaderAvailable) {
						may_leader = false;
						exibindo_lider = true;
						player_me.callLeader();
					}
				}
			});
			window.addEventListener("keyup", function (e) {
				if (player_me.leaderAvailable) may_leader = true;
			});
		} else {
			// Opponent's leader (AI or player) - can view but not activate
			this.elem_leader.children[0].addEventListener("click", async () => await ui.viewCard(this.leader), false);
			this.elem_leader.children[0].addEventListener("mouseover", function() {
				tocar("card", false);
				this.style.boxShadow = "0 0 1.5vw #6d5210";
				this.style.cursor = "pointer";
			});
			this.elem_leader.children[0].addEventListener("mouseout", function() {
				this.style.boxShadow = "0 0 0 #6d5210";
				this.style.cursor = "";
			});
		}
	}
	
	async callLeader() {
		await ui.viewCard(player_me.leader, async () => await player_me.activateLeader());
	}

	async showFactionAbility() {
		let factionData = factions[this.deck.faction];
		if (!factionData) return;
		const factionName = factionData.name || this.deck.faction;
		const description = factionData.description || "No description available.";
		const usesText = factionData.activeAbility ? 
			`\n\nUses remaining: ${this.factionAbilityUses}` : 
			"\n\nPassive ability (always active)";
		
		// Create a simple tooltip/popover element
		const tooltip = document.createElement("div");
		tooltip.id = "faction-ability-tooltip";
		tooltip.style.cssText = `
			position: fixed;
			z-index: 10001;
			background: linear-gradient(rgba(0, 0, 0, 0.95) 50%, rgba(0, 0, 0, 1) 100%);
			border: 0.2vw ridge rgb(40, 40, 40);
			padding: 1vw 1.5vw;
			border-radius: 0.5vw;
			max-width: 30vw;
			pointer-events: auto;
			cursor: pointer;
			box-shadow: 0 0 2vw rgba(0, 0, 0, 0.8);
		`;
		
		// Position near the deck shield
		const deckShield = document.querySelector(`#stats-${this.tag} .profile-img > div > div`);
		if (deckShield) {
			const rect = deckShield.getBoundingClientRect();
			tooltip.style.left = (rect.right + 20) + "px";
			tooltip.style.top = (rect.top - 50) + "px";
		} else {
			// Fallback to center
			tooltip.style.left = "50%";
			tooltip.style.top = "50%";
			tooltip.style.transform = "translate(-50%, -50%)";
		}
		
		// Add content
		tooltip.innerHTML = `
			<h3 style="font-size: 1.05vw; text-transform: uppercase; color: grey; margin: 0 0 0.5vw 0; line-height: 100%;">${factionName} Faction Ability</h3>
			<p style="font-size: 1.1vw; margin: 0; white-space: pre-line;">${description}${usesText}</p>
			<p style="font-size: 0.9vw; color: #888; margin: 0.5vw 0 0 0; font-style: italic;">Click anywhere to close</p>
		`;
		
		// Add to body
		document.body.appendChild(tooltip);
		
		// Fade in
		tooltip.style.opacity = "0";
		tooltip.style.transition = "opacity 0.2s";
		setTimeout(() => { tooltip.style.opacity = "1"; }, 10);
		
		// Dismiss on click anywhere
		const dismiss = () => {
			tooltip.style.opacity = "0";
			setTimeout(() => {
				if (tooltip.parentNode) {
					tooltip.parentNode.removeChild(tooltip);
				}
			}, 200);
		};
		
		tooltip.addEventListener("click", dismiss);
		// Also dismiss on click outside (on document)
		const outsideClick = (e) => {
			if (!tooltip.contains(e.target)) {
				dismiss();
				document.removeEventListener("click", outsideClick);
			}
		};
		// Use setTimeout to avoid immediate dismissal
		setTimeout(() => {
			document.addEventListener("click", outsideClick);
		}, 100);
		
		// Also dismiss on Escape key
		const escapeHandler = (e) => {
			if (e.key === "Escape" || e.keyCode === 27) {
				dismiss();
				document.removeEventListener("keydown", escapeHandler);
			}
		};
		document.addEventListener("keydown", escapeHandler);
	}

	async activateFactionAbility() {
		let factionData = factions[this.deck.faction];
		if (factionData.activeAbility && this.factionAbilityUses > 0) await ui.popup("Use faction ability [E]", () => this.useFactionAbility(), "Cancel [Q]", () => this.escapeFactionAbility(), "Would you like to use your faction ability?", "Faction ability: " + factionData.description, false);
		return;
	}

	async useFactionAbility() {
		let factionData = factions[this.deck.faction];
		if (factionData.activeAbility && this.factionAbilityUses > 0) {
			this.endTurnAfterAbilityUse = true;
			await factionData.factionAbility(this);
			this.updateFactionAbilityUses(this.factionAbilityUses - 1);
			if (this.endTurnAfterAbilityUse) this.endTurn();
			if (this.controller instanceof ControllerAI) {
				if (this.deck.faction === "lyria_rivia") {
					let best_row = this.controller.bestRowMorale(ui.previewCard);
					ui.selectRow(best_row, true);
				}
			}
		}
		return;
	}

	async escapeFactionAbility() {
		ui.enablePlayer(true);
	}

	updateFactionAbilityUses(count) {
		this.factionAbilityUses = Math.max(0,count);
		document.getElementById("faction-ability-count-" + this.tag).innerHTML = this.factionAbilityUses;
		if (this.factionAbilityUses === 0) document.getElementById("faction-ability-" + this.tag).classList.add("fade");
		else document.getElementById("faction-ability-" + this.tag).classList.remove("fade");
	}

	getAllRows() {
		if (this === player_me) return board.row.filter((r, i) => i > 2);
		return board.row.filter((r, i) => i < 3).reverse();
	}

	getAllRowCards() {
		return this.getAllRows().reduce((a, r) => r.cards.concat(a), []);
	}
}

class CardContainer {
	constructor(elem) {
		this.elem = elem;
		this.cards = [];
	}

	isEmpty() {
		return this.cards.length === 0;
	}

	findCard(predicate) {
		for (let i = this.cards.length - 1; i >= 0; --i) {
			if (predicate(this.cards[i])) return this.cards[i];
		}
	}

	findCards(predicate) {
		return this.cards.filter(predicate);
	}

	containsCardByKey(key) {
		return (this.findCards(c => c.key === key).length) > 0; 
	}

	findCardsRandom(predicate, n) {
		let valid = predicate ? this.cards.filter(predicate) : this.cards;
		if (valid.length === 0) return [];
		if (!n || n === 1) return [valid[randomInt(valid.length)]];
		valid = [...valid].sort(() => 0.5 - Math.random())
		return valid.slice(0, n);
	}

	getCards(predicate) {
		// Collect matching indices
		const indices = this.cards.reduce((a, c, i) => (predicate(c, i) ? [i] : []).concat(a), []);
		// CRITICAL: Sort indices in descending order before removing
		// This prevents index shifting issues - removing from high to low doesn't affect earlier indices
		indices.sort((a, b) => b - a);
		return indices.map(i => this.removeCard(i));
	}

	getCard(predicate) {
		for (let i = this.cards.length - 1; i >= 0; --i) {
			if (predicate(this.cards[i])) return this.removeCard(i);
		}
	}

	getCardsRandom(predicate, n) {
		return this.findCardsRandom(predicate, n).map(c => this.removeCard(c));
	}

	addCard(card, index) {
		this.cards.push(card);
		this.addCardElement(card, index ? index : 0);
		this.resize();
		card.currentLocation = this;
	}

	removeCard(card, index) {
		if (this.cards.length === 0) {
			console.warn("Attempted to remove card from empty " + this.constructor.name);
			return null;
		}
		const cardIndex = isNumber(card) ? card : this.cards.indexOf(card);
		if (cardIndex === -1) {
			console.warn("Card not found in " + this.constructor.name + " when trying to remove");
			return null;
		}
		card = this.cards.splice(cardIndex, 1)[0];
		if (!card) {
			console.warn("Failed to remove card from " + this.constructor.name);
			return null;
		}
		this.removeCardElement(card, index ? index : 0);
		this.resize();
		nova = card.key;
		if (card.id !== undefined) nova += card.id;
		return card;
	}

	addCardSorted(card) {
		let i = this.getSortedIndex(card);
		this.cards.splice(i, 0, card);
		return i;
	}

	getSortedIndex(card) {
		for (var i = 0; i < this.cards.length; ++i) {
			if (Card.compare(card, this.cards[i]) < 0) break;
		}
		return i;
	}

	addCardRandom(card) {
		this.cards.push(card);
		let index = randomInt(this.cards.length);
		if (index !== this.cards.length - 1) {
			let t = this.cards[this.cards.length - 1];
			this.cards[this.cards.length - 1] = this.cards[index];
			this.cards[index] = t;
		}
		return index;
	}

	removeCardElement(card, index) {
		if (this.elem) this.elem.removeChild(card.elem);
	}

	addCardElement(card, index) {
		if (this.elem && card && card.elem && index !== this.cards.length) {
			this.elem.insertBefore(card.elem, this.elem.children[index]);
		}
	}

	resize() {}

	resizeCardContainer(overlap_count, gap, coef) {
		let n = this.elem.children.length;
		let param = (n < overlap_count) ? "" + gap + "vw" : defineCardRowMargin(n, coef);
		let children = this.elem.getElementsByClassName("card");
		for (let x of children) x.style.marginLeft = x.style.marginRight = param;

		function defineCardRowMargin(n, coef = 0) {
			return "calc((100% - (4.45vw * " + n + ")) / (2*" + n + ") - (" + coef + "vw * " + n + "))";
		}
	}

	setSelectable() {
		this.elem.classList.add("row-selectable");
		alteraClicavel(this, true);
	}

	clearSelectable() {
		this.elem.classList.remove("row-selectable");
		alteraClicavel(this, false);
		for (card in this.cards) card.elem.classList.add("noclick");
	}

	reset() {
		while (this.cards.length) this.removeCard(0);
		if (this.elem) {
			while (this.elem.firstChild) this.elem.removeChild(this.elem.firstChild);
		}
		this.cards = [];
	}
}

class Grave extends CardContainer {
	constructor(elem) {
		super(elem)
		elem.addEventListener("click", () => ui.viewCardsInContainer(this), false);
	}

	addCard(card) {
		this.setCardOffset(card, this.cards.length);
		super.addCard(card, this.cards.length);
	}

	removeCard(card) {
		let n = isNumber(card) ? card : this.cards.indexOf(card);
		return super.removeCard(card, n);
	}

	removeCardElement(card, index) {
		if (card && card.elem) {
			card.elem.style.left = "";
		}
		for (let i = index; i < this.cards.length; ++i) {
			if (this.cards[i] && this.cards[i].elem) {
				this.setCardOffset(this.cards[i], i);
			}
		}
		super.removeCardElement(card, index);
	}

	setCardOffset(card, n) {
		if (card && card.elem) {
			card.elem.style.left = -0.03 * n + "vw";
		}
	}
}

class RowSpecial extends CardContainer {
	constructor(elem,row) {
		super(elem)
		this.row = row;
	}

	addCard(card) {
		this.setCardOffset(card, this.cards.length);
		super.addCard(card, this.cards.length);
	}

	removeCard(card) {
		let n = isNumber(card) ? card : this.cards.indexOf(card);
		if (card.removed) {
			for (let x of card.removed) x(card);
		}
		return super.removeCard(card, n);
	}

	removeCardElement(card, index) {
		card.elem.style.left = "";
		for (let i = index; i < this.cards.length; ++i) this.setCardOffset(this.cards[i], i);
		super.removeCardElement(card, index);
	}

	setCardOffset(card, n) {
		card.elem.style.left = (1 + n) + "vw";
	}

}

class Deck extends CardContainer {
	constructor(faction, elem) {
		super(elem);
		this.faction = faction;
		this.counter = document.createElement("div");
		this.counter.classList = "deck-counter center";
		this.counter.appendChild(document.createTextNode(this.cards.length));
		this.elem.appendChild(this.counter);
	}

	initializeFromID(card_id_list, player) {
		console.log("[DECK INIT] initializeFromID called with:", card_id_list);
		console.log("[DECK INIT] Number of unique cards:", card_id_list.length);
		const totalCards = card_id_list.reduce((sum, c) => sum + (c.count || 0), 0);
		console.log("[DECK INIT] Total card count:", totalCards);
		
		const clonedList = card_id_list.reduce((a, c) => a.concat(clone(c.count, c)), []);
		console.log("[DECK INIT] Cloned list length:", clonedList.length);
		this.initialize(clonedList, player);

		function clone(n, elem) {
			for (var i = 0, a = []; i < n; ++i) a.push(elem);
			return a;
		}
	}

	initialize(card_data_list, player) {
		console.log("[DECK INIT] initialize called with", card_data_list.length, "cards");
		let successCount = 0;
		let failCount = 0;
		for (let i = 0; i < card_data_list.length; ++i) {
			const cardKey = card_data_list[i].index;
			// Check if card exists in card_dict before trying to create it
			if (!card_dict[cardKey]) {
				console.warn("[DECK INIT] Skipping invalid card (not found in card_dict):", cardKey);
				failCount++;
				continue;
			}
			let card = new Card(cardKey, card_dict[cardKey], player);
			if (!card || !card.elem) {
				console.warn("[DECK INIT] Skipping invalid card (creation failed):", cardKey);
				failCount++;
				continue;
			}
			card.holder = player;
			this.addCardRandom(card);
			this.addCardElement();
			successCount++;
		}
		console.log("[DECK INIT] Successfully initialized", successCount, "cards, failed", failCount);
		this.resize();
	}

	addCard(card) {
		this.addCardRandom(card);
		this.addCardElement();
		this.resize();
	}

	async draw(hand) {
		// Check if embargo is active and preventing this player from drawing
		const player = hand === player_op.hand ? player_op : player_me;
		if (game.embargoActive && game.embargoActive.blockedPlayer === player) {
			// Embargo is active - prevent drawing
			return;
		}
		
		// Safety check: Don't draw from empty deck
		if (this.cards.length === 0) {
			console.warn("Attempted to draw from empty deck");
			return;
		}
		
		tocar("game_buy", false);
		// Remove the card from deck first to avoid race conditions
		// This ensures the card is removed before any other operation
		const removedCard = this.removeCard(0);
		if (!removedCard) {
			console.warn("No card available to draw from deck");
			return;
		}
		
		if (hand === player_op.hand) {
			hand.addCard(removedCard);
		} else {
			// For player's hand, pass null as source since we already removed it
			await board.toHand(removedCard, null);
		}
	}

	swap(container, card) {
		// Safety check: Don't swap from empty deck
		if (this.cards.length === 0) {
			console.warn("Attempted to swap from empty deck");
			return;
		}
		container.addCard(this.removeCard(0));
		this.addCard(card);
	}

	addCardElement() {
		let elem = document.createElement("div");
		elem.classList.add("deck-card");
		elem.style.backgroundImage = iconURL("deck_back_" + this.faction, "jpg");
		this.setCardOffset(elem, this.cards.length - 1);
		this.elem.insertBefore(elem, this.counter);
	}

	removeCardElement() {
		this.elem.removeChild(this.elem.children[this.cards.length]).style.left = "";
	}

	setCardOffset(elem, n) {
		elem.style.left = -0.03 * n + "vw";
	}

	resize() {
		this.counter.innerHTML = this.cards.length;
		this.setCardOffset(this.counter, this.cards.length);
	}

	reset() {
		super.reset();
		this.elem.appendChild(this.counter);
	}
}

class HandAI extends CardContainer {
	constructor(tag) {
		super(undefined, tag);
		if (this.tag === "me") {
			this.counter = document.getElementById("hand-count-me");
			this.hidden_elem = document.getElementById("hand-me");
		} else {
			this.counter = document.getElementById("hand-count-op");
			this.hidden_elem = document.getElementById("hand-op");
		}
	}
	
	resize() {
		this.counter.innerHTML = this.cards.length;
	}
}

class Hand extends CardContainer {
	constructor(elem,tag) {
		super(elem);
		this.tag = tag;
		if (this.tag === "me") this.counter = document.getElementById("hand-count-me");
		else this.counter = document.getElementById("hand-count-op");
	}

	addCard(card) {
		if (!card || !card.elem) {
			console.warn("Attempted to add invalid card to container");
			return;
		}
		let i = this.addCardSorted(card);
		this.addCardElement(card, i);
		this.resize();
	}

	resize() {
		this.counter.innerHTML = this.cards.length;
		this.resizeCardContainer(11, 0.075, .00225);
	}
}

class Row extends CardContainer {
	constructor(elem) {
		super(elem.getElementsByClassName("row-cards")[0]);
		this.elem_parent = elem;
		this.special = new RowSpecial(elem.getElementsByClassName("row-special")[0],this);
		this.total = 0;
		this.effects = {
			weather: false,
			nightfall: false,
			bond: {},
			morale: 0,
			horn: 0,
			mardroeme: 0,
			shield: 0,
			lock: 0,
			toussaint_wine: 0
		};
		this.halfWeather = false;
		this.waylayCard = null;
		this.curseCard = null;
		this.elem.addEventListener("click", () => ui.selectRow(this), true);
		this.elem.addEventListener("mouseover", function() {
			if (hover_row) {
				tocar("card", false);
				this.style.boxShadow = "0 0 1.5vw #6d5210";
			}
		});
		this.elem.addEventListener("mouseout", function() {
			this.style.boxShadow = "0 0 0 #6d5210"
		});
		window.addEventListener("keydown", function (e) {
			if (e.keyCode == 13 && fileira_clicavel !== null && may_act_card) {
				ui.selectRow(fileira_clicavel);
				may_act_card = false;
				fileira_clicavel = null;
			}
		});
		window.addEventListener("keyup", function (e) {
			if (e.keyCode == 13) may_act_card = true;
		});
		this.special.elem.addEventListener("click", () => ui.selectRow(this,true), false, true);
	}

	async addCard(card, runEffect = true) {
		card.currentLocation = this;
		// Check for waylay - if any unit (including heroes) is played, remove waylay and draw 2 cards
		if (this.waylayCard && (card.isUnit() || card.hero) && runEffect) {
			const waylay = this.waylayCard;
			this.waylayCard = null; // Remove waylay after triggering
			// Play waylay sound effect when triggered
			tocar("waylay", false);
			
			// Get the original player who played the waylay (opponent of current holder)
			// The waylay card's holder was changed to opponent in the placed callback,
			// so we need to get the original player (opponent of current holder)
			const waylayPlayer = waylay.holder.opponent();
			
			// Remove the waylay card from the row
			waylay.currentLocation.removeCard(waylay, false);
			
			// Send waylay to the original player's grave (the one who played it), not the opponent's
			// Temporarily restore the original holder so it goes to the correct grave
			const originalHolder = waylay.holder;
			waylay.holder = waylayPlayer;
			await board.toGrave(waylay, null); // Pass null since card is already removed
			waylay.holder = originalHolder; // Restore holder for consistency
			
			// Draw 2 cards for the player who played waylay
			for (let i = 0; i < 2 && waylayPlayer.deck.cards.length > 0; i++) {
				await waylayPlayer.deck.draw(waylayPlayer.hand);
			}
			board.updateScores();
		}
		// Check for curse - kill next non-hero unit placed on this row (before adding to row)
		// NOTE: Hero units do NOT trigger curse - they pass through and the curse remains on the row
		// The curse will persist until either a non-hero unit triggers it or the round ends
		if (this.curseCard && card.isUnit() && !card.hero && runEffect) {
			const curse = this.curseCard;
			this.curseCard = null; // Remove curse after triggering
			// Add card temporarily to process removal, then destroy it
			if (card.isSpecial()) this.special.addCard(card);
			else {
				let index = this.addCardSorted(card);
				this.addCardElement(card, index);
				this.resize();
			}
			// Remove the card that was just added
			if (card.isSpecial()) {
				this.special.removeCard(card);
			} else {
				this.removeCard(card, false);
			}
			tocar("curse", false);
			await card.animate("scorch", true, false);
			await board.toGrave(card, this);
			// Remove and destroy the curse card
			if (curse.isSpecial()) {
				curse.currentLocation.special.removeCard(curse);
			} else {
				curse.currentLocation.removeCard(curse, false);
			}
			await board.toGrave(curse, curse.currentLocation);
			board.updateScores();
			
			// Bloody Baron leader ability: When a unit dies to Curse, draw a card and play it immediately
			const bloodyBaronPlayer = curse.holder;
			if (bloodyBaronPlayer && bloodyBaronPlayer.leader && bloodyBaronPlayer.leader.abilities && bloodyBaronPlayer.leader.abilities.includes("mo_bloody_baron")) {
				// Safety check: Don't draw from empty deck
				if (bloodyBaronPlayer.deck.cards.length > 0) {
					await ui.notification("monsters", 1200);
					// Get the card key before drawing (since draw will remove it)
					const cardKey = bloodyBaronPlayer.deck.cards[0].key;
					// Draw the card to hand (this will remove it from deck)
					await bloodyBaronPlayer.deck.draw(bloodyBaronPlayer.hand);
					// Play the card immediately (find it in hand after drawing)
					const cardInHand = bloodyBaronPlayer.hand.cards.find(c => c.key === cardKey);
					if (cardInHand) {
						await cardInHand.autoplay(bloodyBaronPlayer.hand);
					}
				}
			}
			
			return; // Don't process the card further since it was destroyed
		}
		if (card.isSpecial()) this.special.addCard(card);
		else {
			let index = this.addCardSorted(card);
			this.addCardElement(card, index);
			this.resize();
		}
		// CRITICAL: Wait for card to be fully positioned before triggering animations
		// This ensures animations align with the card's final position on the field
		await sleep(50); // Small delay to ensure card element is fully rendered in its new position
		if (this.effects.lock && card.isUnit() && card.abilities.length) {
			card.locked = true;
			this.effects.lock = Math.max(this.effects.lock - 1, 0);
			let lock_card = this.special.findCard(c => c.abilities.includes("lock"));
			if (lock_card) await board.toGrave(lock_card, this.special);
			// Show persistent lock animation
			await card.showLockAnimation();
		}
		if (runEffect && !card.isLocked()) {
			this.updateState(card, true);
			for (let x of card.placed) await x(card, this);
		}
		// Check for Fortify: if another unit was added, existing fortify units may no longer be alone
		if (card.isUnit() && runEffect) {
			const fortifyUnits = this.cards.filter(c => c.isUnit() && c !== card && c.abilities.includes("fortify") && !c.isLocked());
			for (const fortifyUnit of fortifyUnits) {
				// This fortify unit is no longer alone, update score (animation not needed for losing bonus)
				// Score will update automatically via updateScores()
			}
		}
		card.elem.classList.add("noclick");
		await sleep(600);
		board.updateScores();
	}

	// Override
	removeCard(card, runEffect = true) {
		// Clear guard relationship if this card is a guard
		if (card && this.cards) {
			this.cards.forEach(c => {
				if (c.guardedBy === card) {
					c.guardedBy = null;
				}
			});
		}
		if (isNumber(card) && card === -1) {
			card = this.special.cards[0];
			this.special.reset();
			return card;
		}
		card = isNumber(card) ? this.cards[card] : card;
		if (card.isSpecial()) this.special.removeCard(card);
		else {
			super.removeCard(card);
			card.resetPower();
			// Remove lock animation overlay when card is removed
			card.hideLockAnimation();
			card.locked = false;
		}
		this.updateState(card, false);
		if (runEffect) {
			if (!card.decoyTarget) {
				for (let x of card.removed) x(card);
			} else card.decoyTarget = false;
		}
		// Check for Fortify: if a unit was removed, remaining fortify units may now be alone
		if (card.isUnit() && runEffect) {
			const remainingUnits = this.cards.filter(c => c.isUnit());
			const fortifyUnits = remainingUnits.filter(c => c.abilities.includes("fortify") && !c.isLocked());
			// If there's exactly one unit left and it has fortify, it's now alone
			if (remainingUnits.length === 1 && fortifyUnits.length === 1) {
				// Trigger animation for the fortify unit that just became alone
				(async () => {
					try {
						await fortifyUnits[0].animate("fortify");
					} catch (err) {
						console.error("Fortify animation failed:", err);
					}
				})();
			}
		}
		this.updateScore();
		return card;
	}

	// Override
	removeCardElement(card, index) {
		super.removeCardElement(card, index);
		let x = card.elem;
		x.style.marginLeft = x.style.marginRight = "";
		x.classList.remove("noclick");
	}

	updateState(card, activate) {
		// CRITICAL: updateState should ONLY update row effects, NOT trigger animations
		// Animations should ONLY be triggered by the 'placed' callbacks in abilities.js
		// This ensures each ability is tethered to its own animation and sound effect
		for (let x of card.abilities) {
			if (!card.isLocked()) {
				switch (x) {
					case "morale":
						// Only update morale effect - animation is handled by abilities.js placed callback
						// Cards being mustered shouldn't trigger their own abilities' effects
						if (!card.isMustered) {
							this.effects.morale += activate ? 1 : -1;
						}
						break;
					case "horn":
					case "redania_horn":
						// Update horn effect for both special horn cards AND unit cards with horn ability
						// Animation is handled by abilities.js placed callback
						// Don't update horn effect if this card is being mustered
						if (!card.isMustered) {
							this.effects.horn += activate ? 1 : -1;
						}
						break;
					case "mardroeme":
					case "lock":
						this.effects[x] += activate ? 1 : -1;
						break;
					case "toussaint_wine":
					case "wine":
						// Both "wine" and "toussaint_wine" apply the same effect
						// Animation is handled by abilities.js placed callback
						const effectName = x === "wine" ? "toussaint_wine" : x;
						this.effects[effectName] += activate ? 1 : -1;
						break;
					case "shield":
					case "shield_c":
					case "shield_r":
					case "shield_s":
						// Animation is handled by abilities.js placed callback
						this.effects["shield"] += activate ? 1 : -1;
						break;
					case "bond":
						if (!this.effects.bond[card.target])
							this.effects.bond[card.target] = 0;
						this.effects.bond[card.target] += activate ? 1 : -1;
						break;
				}
			}
		}
	}

	addOverlay(overlay) {
		var som = overlay == "fog" || overlay == "rain" || overlay == "storm" ? overlay : overlay == "frost" ? "cold" : overlay == "nightfall" ? "nightfall" : overlay == "sandstorm" ? "sandstorm" : "";
		if (som != "") tocar(som, false);
		
		// Nightfall is visual only and doesn't affect power
		if (overlay === "nightfall") {
			this.effects.nightfall = true;
			this.triggerHungerTransformations();
		} else {
			// Regular weather affects power
		this.effects.weather = true;
		}
		
		this.elem_parent.getElementsByClassName("row-weather")[0].classList.add(overlay);
		this.updateScore();
	}

	removeOverlay(overlay) {
		if (overlay === "nightfall") {
			this.effects.nightfall = false;
		} else {
		this.effects.weather = false;
		}
		this.elem_parent.getElementsByClassName("row-weather")[0].classList.remove(overlay);
		this.updateScore();
	}

	async triggerHungerTransformations() {
		// Find all cards with hunger ability in this row
		const hungerCardsOnRow = this.cards.filter(c => c.isUnit() && c.abilities.includes("hunger") && !c.isLocked() && c.target);
		
		// CRITICAL: Also find hunger cards in both players' discard piles (graves)
		// Nightfall should trigger hunger transformations even if the cards are in the discard pile
		const hungerCardsInGrave = [];
		
		// Check both players' graves for hunger cards
		for (const player of [player_me, player_op]) {
			const graveHungerCards = player.grave.cards.filter(c => 
				c.isUnit() && c.abilities.includes("hunger") && c.target
			);
			hungerCardsInGrave.push(...graveHungerCards);
		}
		
		// Combine hunger cards from row and grave
		const allHungerCards = [...hungerCardsOnRow, ...hungerCardsInGrave];
		
		// Transform each hunger card
		for (const hungerCard of allHungerCards) {
			const hungerTarget = hungerCard.target;
			if (!hungerTarget || !card_dict[hungerTarget]) continue;
			
			// Get the row where the hunger card is located (or null if in grave)
			const currentLocation = hungerCard.currentLocation;
			const isInGrave = !(currentLocation instanceof Row);
			
			// Helper function to determine the row for the transformed unit (similar to avenger)
			const getTransformedRow = (transformedCard, originalCard, wasInGrave) => {
				const transformedRowDesignation = transformedCard.row;
				const originalLocation = originalCard.currentLocation;
				
				// If the original card was in a Row, try to use that row
				if (originalLocation instanceof Row) {
					const rowIndex = originalLocation.getRowIndex();
					let rowName;
					if (rowIndex === 0 || rowIndex === 5) rowName = "siege";
					else if (rowIndex === 1 || rowIndex === 4) rowName = "ranged";
					else if (rowIndex === 2 || rowIndex === 3) rowName = "close";
					else rowName = null;
					
					if (rowName) {
						if (transformedRowDesignation === "agile") {
							if (rowName === "close" || rowName === "ranged") return rowName;
						} else if (transformedRowDesignation === "any") {
							if (rowName === "close" || rowName === "ranged" || rowName === "siege") return rowName;
						} else if (transformedRowDesignation === "melee_siege") {
							if (rowName === "close" || rowName === "siege") return rowName;
						} else if (transformedRowDesignation === "ranged_siege") {
							if (rowName === "ranged" || rowName === "siege") return rowName;
						} else if (transformedRowDesignation === rowName) {
							return rowName;
						}
					}
				}
				
				// If the card was in the discard pile, randomly select a valid row for flexible row types
				if (wasInGrave) {
					if (transformedRowDesignation === "agile") {
						// Agile can go to close or ranged - randomly select
						const possibleRows = ["close", "ranged"];
						return possibleRows[randomInt(possibleRows.length)];
					} else if (transformedRowDesignation === "any") {
						// Any can go to close, ranged, or siege - randomly select
						const possibleRows = ["close", "ranged", "siege"];
						return possibleRows[randomInt(possibleRows.length)];
					} else if (transformedRowDesignation === "melee_siege") {
						// Melee/Siege can go to close or siege - randomly select
						const possibleRows = ["close", "siege"];
						return possibleRows[randomInt(possibleRows.length)];
					} else if (transformedRowDesignation === "ranged_siege") {
						// Ranged/Siege can go to ranged or siege - randomly select
						const possibleRows = ["ranged", "siege"];
						return possibleRows[randomInt(possibleRows.length)];
					}
				}
				
				// Fallback: use target's row designation
				if (transformedRowDesignation === "agile" || transformedRowDesignation === "any" || transformedRowDesignation === "melee_siege") {
					return "close";
				} else if (transformedRowDesignation === "ranged_siege") {
					return "ranged";
				}
				return transformedRowDesignation;
			};
			
			// Check if target card is already on the field - if so, skip transformation
			const targetAlreadyOnField = hungerCard.holder.getAllRowCards().some(c => c.key === hungerTarget);
			if (targetAlreadyOnField) {
				// Target card is already on the field, skip transformation
				// If hunger card is on a row, discard it to grave
				if (!isInGrave) {
					await board.toGrave(hungerCard, currentLocation);
				}
				// If hunger card is in grave, it stays there (don't remove it)
				continue; // Skip this transformation
			}
			
			// If hunger card is on a row, discard it to grave (it transforms in place)
			if (!isInGrave) {
				await board.toGrave(hungerCard, currentLocation);
			}
			// If hunger card is in grave, it STAYS in the grave (don't remove it)
			
			// Create and play the target card
			let transformedCard;
			if (hungerCard.holder.deck.findCards(c => c.key === hungerTarget).length) {
				transformedCard = hungerCard.holder.deck.findCard(c => c.key === hungerTarget);
				const targetRow = getTransformedRow(transformedCard, hungerCard, isInGrave);
				await board.moveTo(transformedCard, targetRow, hungerCard.holder.deck);
			} else if (hungerCard.holder.hand.findCards(c => c.key === hungerTarget).length) {
				transformedCard = hungerCard.holder.hand.findCard(c => c.key === hungerTarget);
				const targetRow = getTransformedRow(transformedCard, hungerCard, isInGrave);
				await board.moveTo(transformedCard, targetRow, hungerCard.holder.hand);
			} else {
				transformedCard = new Card(hungerTarget, card_dict[hungerTarget], hungerCard.holder);
				const targetRow = getTransformedRow(transformedCard, hungerCard, isInGrave);
				await board.addCardToRow(transformedCard, targetRow, hungerCard.holder);
			}
		}
	}

	// Override
	resize() {
		this.resizeCardContainer(10, 0.075, .00325);
	}

	updateScore() {
		let total = 0;
		for (let card of this.cards) total += this.cardScore(card);
		let player = this.elem_parent.parentElement.id === "field-op" ? player_op : player_me;
		player.updateTotal(total - this.total);
		this.total = total;
		this.elem_parent.getElementsByClassName("row-score")[0].innerHTML = this.total;
	}

	cardScore(card) {
		const previousPower = card.power;
		let total = this.calcCardScore(card);
		
		// Check if adaptive ability triggered a strength change due to weather
		// Animate when: card has adaptive, weather is active, strength changed to 2 (adaptive value)
		if (card.abilities.includes("adaptive") && this.effects.weather && !card.hero && previousPower !== total) {
			// Calculate the base adaptive strength (2 when weather is active)
			const adaptiveBaseStrength = this.halfWeather ? Math.max(Math.min(2, card.basePower), Math.floor(card.basePower / 2)) : Math.min(2, card.basePower);
			
			// Animate if strength changed and is now at the adaptive base value (2) or higher
			// This happens when weather is applied and adaptive kicks in
			if (total >= adaptiveBaseStrength && (previousPower < adaptiveBaseStrength || previousPower === card.basePower)) {
				// Animate the adaptive effect when strength changes to adaptive value (2) due to weather
				card.animate("adaptive").catch(err => console.error("Adaptive animation failed:", err));
			}
		}
		
		card.setPower(total);
		return total;
	}

	calcCardScore(card) {
		if (card.key === "spe_decoy") return 0;
		let total = card.basePower;
		if (card.hero) return total;
		if (card.abilities.includes("spy")) total = Math.floor(game.spyPowerMult * total);
		if (card.abilities.includes("inspire") && !card.isLocked()) {
			let inspires = card.holder.getAllRowCards().filter(c => !c.isLocked() && c.abilities.includes("inspire"));
			if (inspires.length > 1) {
				let maxBase = inspires.reduce((a, b) => a.basePower > b.basePower ? a : b);
				total = maxBase.basePower;
			}
		}
		// Add veteran bonus if card has veteran ability
		if (card.abilities.includes("veteran") && card.veteranBonus) {
			total += card.veteranBonus;
		}
		if (this.effects.weather && !card.weatherImmune) {
			if (card.abilities.includes("adaptive")) {
				// Adaptive: base strength is 2 instead of 1 while affected by Weather
				total = this.halfWeather ? Math.max(Math.min(2, total), Math.floor(total / 2)) : Math.min(2, total);
			} else {
				total = this.halfWeather ? Math.max(Math.min(1, total), Math.floor(total / 2)) : Math.min(1, total);
			}
		}
		let bond = this.effects.bond[card.target];
		if (isNumber(bond) && bond > 1 && !card.isLocked()) total *= Number(bond);
		total += Math.max(0, this.effects.morale + (card.abilities.includes("morale") ? -1 : 0));
		total += Math.max(0, 2 * this.effects.toussaint_wine);
		if (card.abilities.at(-1) && card.abilities.at(-1).startsWith("witcher_") && !card.isLocked()) {
			let school = card.abilities.at(-1);
			if (card.holder.effects["witchers"][school]) total += (card.holder.effects["witchers"][school] - 1) * 2;
		}
		if (card.abilities.includes("worshipped") && card.holder.effects["worshippers"] > 0 && !card.isLocked()) {
			const boost = card.holder.effects["worshippers"] * game.whorshipBoost;
			total += boost;
			// Debug logging to track worshipper boost calculation
			if (boost !== 1 && boost !== 2) {
				console.log(`[WORSHIPPED DEBUG] Card: ${card.name}, Base: ${card.basePower}, Worshippers: ${card.holder.effects["worshippers"]}, Boost: ${boost}, Total: ${total}`);
			}
		}
		if (this.effects.horn - ((card.abilities.includes("horn") || card.abilities.includes("redania_horn")) ? 1 : 0) > 0) total *= 2;
		// Fortify: +10 if alone on its row
		if (card.abilities.includes("fortify") && !card.isLocked()) {
			const unitsInRow = this.cards.filter(c => c.isUnit() && c !== card);
			if (unitsInRow.length === 0) {
				total += 10;
			}
		}
		return total;
	}

	async leaderHorn(card) {
		if (this.special.containsCardByKey("spe_horn") || this.special.containsCardByKey("spe_redania_horn")) return;
		let hornKey = card.key === "spe_redania_horn" ? "spe_redania_horn" : "spe_horn";
		let horn = new Card(hornKey, card_dict[hornKey], card.holder);
		await this.addCard(horn);
		game.roundEnd.push(() => this.removeCard(horn));
	}

	async scorch() {
		if (this.total >= 10 && !this.isShielded() && !game.scorchCancelled) {
			// Check for Peace Treaty protection
			const player = this.cards.length > 0 ? this.cards[0].holder : null;
			if (player && game.peaceTreatyActive && game.peaceTreatyActive[player.tag]) {
				return; // Peace Treaty prevents scorch
			}
			const unitsToScorch = this.maxUnits();
			// Animate all units first (with proper delays)
			await Promise.all(unitsToScorch.map(async c => await c.animate("scorch", true, false)));
			// Then move all to grave
			await Promise.all(unitsToScorch.map(async c => await board.toGrave(c, this)));
		}
	}

	clear() {
		// Debug: Log all cards with noRemove before clearing
		const cardsWithNoRemove = this.cards.filter(c => c.noRemove);
		if (cardsWithNoRemove.length > 0) {
			console.log("[ROW CLEAR] Cards with noRemove before clearing:", cardsWithNoRemove.map(c => ({
				name: c.name,
				key: c.key,
				faction: c.holder?.deck?.faction,
				immortal: c.immortal,
				immortalRounds: c.immortalRounds,
				abilities: c.abilities
			})));
		}
		
		// Safety check: Clear noRemove from cards that shouldn't have it
		// Only Monsters faction ability, resilience, and immortal should set noRemove
		this.cards.forEach(c => {
			if (c.noRemove) {
				// Check if this is a valid noRemove case
				const isValidNoRemove = 
					// Monsters faction ability (checked in roundEnd, but verify faction)
					(c.holder && c.holder.deck && c.holder.deck.faction === "monsters") ||
					// Immortal ability
					(c.immortal && c.immortalRounds > 0) ||
					// Resilience ability (witchers)
					(c.abilities && c.abilities.some(abi => abi.startsWith("witcher_")));
				
				if (!isValidNoRemove) {
					console.warn("[ROW CLEAR] Clearing invalid noRemove from card:", c.name, c.key, "faction:", c.holder?.deck?.faction, "row:", this.getRowIndex());
					delete c.noRemove;
				}
			}
		});
		
		// Log cards that will stay (have noRemove)
		const cardsStaying = this.cards.filter(c => c.noRemove);
		if (cardsStaying.length > 0) {
			console.log("[ROW CLEAR] Cards staying on field:", cardsStaying.map(c => ({
				name: c.name,
				key: c.key,
				faction: c.holder?.deck?.faction
			})));
		}
		
		// Remove cards to grave
		const specialCardsToRemove = this.special.cards.filter(c => !c.noRemove);
		const cardsToRemove = this.cards.filter(c => !c.noRemove);
		
		// Remove all cards from arrays first (synchronously)
		specialCardsToRemove.forEach(c => {
			c.hideLockAnimation(); // Remove lock animation before removing card
			this.special.removeCard(c, false); // Don't run effects during clear
		});
		
		cardsToRemove.forEach(c => {
			c.hideLockAnimation(); // Remove lock animation before removing card
			this.removeCard(c, false); // Don't run effects during clear
		});
		
		// Then move them to grave (pass null as source since cards are already removed)
		const allCardsToRemove = [...specialCardsToRemove, ...cardsToRemove];
		allCardsToRemove.forEach(c => {
			// Card is already removed from row, so pass null as source
			board.toGrave(c, null).catch(err => {
				console.error("[ROW CLEAR] Error moving card to grave:", c.name, err);
			});
		});
		// Remove curse card at round end if it hasn't been triggered
		if (this.curseCard) {
			const curse = this.curseCard;
			this.curseCard = null;
			// Remove curse card from the board
			if (curse.isSpecial()) {
				if (curse.currentLocation && curse.currentLocation.special) {
					curse.currentLocation.special.removeCard(curse);
				}
			} else {
				if (curse.currentLocation) {
					curse.currentLocation.removeCard(curse, false);
				}
			}
			board.toGrave(curse, this);
		}
	}

	maxUnits() {
		let max = [];
		for (let i = 0; i < this.cards.length; ++i) {
			let card = this.cards[i];
			if (!card.isUnit()) continue;
			if (!max[0] || max[0].power < card.power) max = [card];
			else if (max[0].power === card.power) max.push(card);
		}
		return max;
	}

	minUnits() {
		let min = [];
		for (let i = 0; i < this.cards.length; ++i) {
			let card = this.cards[i];
			if (!card.isUnit()) continue;
			if (!min[0] || min[0].power > card.power) min = [card];
			else if (min[0].power === card.power) min.push(card);
		}
		return min;
	}

	// Override
	reset() {
		super.reset();
		this.special.reset();
		this.total = 0;
		this.effects = {
			weather: false,
			bond: {},
			morale: 0,
			horn: 0,
			mardroeme: 0,
			shield: 0,
			lock: 0,
			toussaint_wine: 0
		};
	}

	isShielded() {
		return (this.effects.shield > 0);
	}

	canBeScorched() {
		if (game.scorchCancelled) return false;
		return (this.cards.reduce((a, c) => a + c.power, 0) >= 10) && (this.cards.filter(c => c.isUnit()).length > 0);
	}

	getRowIndex() {
		for (let i = 0; i < board.row.length; i++) {
			if (board.row[i] === this) return i;
		}
		return -1;
	}

	getOppositeRow() {
		const index = this.getRowIndex();
		if (index === -1) return null;
		// Row mapping: 0↔5 (siege), 1↔4 (ranged), 2↔3 (close)
		// Formula: oppositeIndex = 5 - index
		const oppositeIndex = 5 - index;
		if (oppositeIndex >= 0 && oppositeIndex < board.row.length) return board.row[oppositeIndex];
		return null;
	}
}

class Weather extends CardContainer {
	constructor(elem) {
		super(document.getElementById("weather"));
		this.types = {
			rain: {
				name: "rain",
				count: 0,
				rows: []
			},
			fog: {
				name: "fog",
				count: 0,
				rows: []
			},
			frost: {
				name: "frost",
				count: 0,
				rows: []
			},
			sandstorm: {
				name: "sandstorm",
				count: 0,
				rows: []
			},
			storm: {
				name: "storm",
				count: 0,
				rows: []
			},
			nightfall: {
				name: "nightfall",
				count: 0,
				rows: []
			}
		}
		let i = 0;
		for (let key of Object.keys(this.types)) {
			if (key === "sandstorm") {
				// Sandstorm affects close and ranged rows (1,2,3,4)
				this.types[key].rows = [board.row[1], board.row[2], board.row[3], board.row[4]];
			} else if (key === "storm") {
				// Storm affects ranged and siege rows (1,2,4,5) - combines rain and fog
				this.types[key].rows = [board.row[1], board.row[2], board.row[4], board.row[5]];
			} else if (key === "nightfall") {
				// Nightfall affects all rows (0,1,2,3,4,5)
				this.types[key].rows = [board.row[0], board.row[1], board.row[2], board.row[3], board.row[4], board.row[5]];
			} else {
				this.types[key].rows = [board.row[i], board.row[5 - i++]];
			}
		}
		this.elem.addEventListener("click", () => ui.selectRow(this), false);
	}

	async addCard(card,withEffects=true) {
		super.addCard(card);
		card.elem.classList.add("noclick");
		if (!withEffects) return;
		if (card.key === "spe_clear") {
			tocar("clear", false);
			await sleep(500);
			this.clearWeather();
		} else {
			this.changeWeather(card, x => ++this.types[x].count === 1, (r, t) => r.addOverlay(t.name));
			for (let i = this.cards.length - 2; i >= 0; --i) {
				if (card.abilities.at(-1) === this.cards[i].abilities.at(-1)) {
					await sleep(750);
					await board.toGrave(card, this);
					break;
				}
			}
		}
		await sleep(750);
	}

	// Override
	removeCard(card, withEffects = true) {
		card = super.removeCard(card);
		card.elem.classList.remove("noclick");
		if (withEffects) this.changeWeather(card, x => --this.types[x].count === 0, (r, t) => r.removeOverlay(t.name));
		return card;
	}

	changeWeather(card, predicate, action) {
		for (let x of card.abilities) {
			if (x in this.types && predicate(x)) {
				for (let r of this.types[x].rows) action(r, this.types[x]);
			}
		}
	}

	async clearWeather() {
		await Promise.all(this.cards.map((c, i) => this.cards[this.cards.length - i - 1]).map(c => board.toGrave(c, this)));
	}

	// Override
	resize() {
		this.resizeCardContainer(4, 0.075, .045);
	}

	// Override
	reset() {
		super.reset();
		Object.keys(this.types).map(t => this.types[t].count = 0);
	}
}

class Board {
	constructor() {
		this.op_score = 0;
		this.me_score = 0;
		this.row = [];
		for (let x = 0; x < 6; ++x) {
			let elem = document.getElementById((x < 3) ? "field-op" : "field-me").children[x % 3];
			this.row[x] = new Row(elem);
		}
	}

	opponent(player) {
		return player === player_me ? player_op : player_me;
	}

	async toDeck(card, source) {
		tocar("discard", false);
		await this.moveTo(card, "deck", source);
	}

	async toGrave(card, source) {
		// Guard protection: if this unit is guarded, kill the guard instead
		if (card.guardedBy && card.guardedBy.currentLocation instanceof Row) {
			const guard = card.guardedBy;
			// Clear the guard relationship
			card.guardedBy = null;
			// Kill the guard instead
			await this.moveTo(guard, "grave", guard.currentLocation);
			return;
		}
		
		// Sigismund Dijkstra leader ability: prevent first death of friendly unit
		if (card && card.isUnit() && card.holder && 
			card.holder.leader && card.holder.leader.abilities && 
			card.holder.leader.abilities.includes("novigrad_sigismund") &&
			!card.holder.sigismundDeathPreventionUsed &&
			!card.hero) {
			card.holder.sigismundDeathPreventionUsed = true;
			await ui.notification("novigrad-sigismund", 1200);
			await card.animate("shield");
			return; // Don't actually remove the card
		}
		
		await this.moveTo(card, "grave", source);
	}

	async toHand(card, source) {
		// Determine which hand to add to
		const hand = card.holder === player_me ? player_me.hand : player_op.hand;
		// If source is provided, moveTo will handle removal
		// If source is null, the card is already removed or is new
		await this.moveTo(card, hand, source);
	}

	async toWeather(card, source) {
		await this.moveTo(card, weather, source);
	}

	async toRow(card, source) {
		let row = (card.row === "agile" || card.row === "any" || card.row === "melee_siege") ? "close" : (card.row === "ranged_siege" ? "ranged" : card.row) || "close";
		await this.moveTo(card, row, source);
	}

	async moveTo(card, dest, source = null) {
		if (isString(dest)) dest = this.getRow(card, dest);
		if (!card) {
			console.warn("moveTo called with null/undefined card");
			return;
		}
		try {
			cartaNaLinha(dest.elem.id, card);
		} catch(err) {}
		await translateTo(card, source ? source : null, dest);
		// Check if source has removeCard method before calling it
		let cardToAdd = card;
		if (source && typeof source.removeCard === 'function') {
			cardToAdd = source.removeCard(card);
			// If removal failed (returned null), use the original card
			if (!cardToAdd) {
				console.warn("moveTo: Card removal from source failed, using original card reference");
				cardToAdd = card;
			}
		}
		// Safety check: don't add null/undefined cards
		if (!cardToAdd) {
			console.warn("moveTo: Cannot add null/undefined card to destination");
			return;
		}
		if (dest instanceof Row || dest instanceof Weather) await dest.addCard(cardToAdd);
		else dest.addCard(cardToAdd);
	}

	async moveToNoEffects(card, dest, source = null) {
		if (isString(dest)) dest = this.getRow(card, dest);
		try {
			cartaNaLinha(dest.elem.id, card);
		} catch (err) {}
		await translateTo(card, source ? source : null, dest);
		// Check if source has removeCard method before calling it
		let cardToAdd;
		if (dest instanceof Row || dest instanceof Weather) {
			cardToAdd = (source && typeof source.removeCard === 'function') ? source.removeCard(card, false) : card;
			await dest.addCard(cardToAdd, false);
		} else {
			cardToAdd = (source && typeof source.removeCard === 'function') ? source.removeCard(card) : card;
			dest.addCard(cardToAdd);
		}
	}

	async addCardToRow(card, row_name, player, source) {
		let row;
		if (row_name instanceof Row) row = row_name;
		else {
			// Handle flexible row names (agile, any, melee_siege, ranged_siege)
			// These need to be resolved to actual row names before calling getRow
			let resolvedRowName = row_name;
			if (row_name === "agile" || row_name === "any" || row_name === "melee_siege" || row_name === "ranged_siege") {
				// For AI players, use the best row selection
				if (player && player.controller instanceof ControllerAI) {
					const aiController = player.controller;
					if (row_name === "agile") {
						// Agile can be close or ranged - use bestAgileRowChange to select
						const bestRow = aiController.bestAgileRowChange(card);
						row = bestRow.row;
					} else if (row_name === "any") {
						// Any can be close, ranged, or siege - use bestAgileRowChange
						const bestRow = aiController.bestAgileRowChange(card);
						row = bestRow.row;
					} else if (row_name === "melee_siege") {
						// Melee/Siege can be close or siege - use bestAgileRowChange
						const bestRow = aiController.bestAgileRowChange(card);
						row = bestRow.row;
					} else if (row_name === "ranged_siege") {
						// Ranged/Siege can be ranged or siege - use bestAgileRowChange
						const bestRow = aiController.bestAgileRowChange(card);
						row = bestRow.row;
					}
				} else {
					// For human players or when AI controller is not available, default to "close"
					// (agile defaults to close, any defaults to close, melee_siege defaults to close, ranged_siege defaults to ranged)
					if (row_name === "agile" || row_name === "any" || row_name === "melee_siege") {
						resolvedRowName = "close";
					} else if (row_name === "ranged_siege") {
						resolvedRowName = "ranged";
					}
					row = this.getRow(card, resolvedRowName, player);
				}
			} else {
				row = this.getRow(card, row_name, player);
			}
		}
		if (!row) {
			console.error("addCardToRow: Could not resolve row for card:", card.name, "row_name:", row_name);
			return; // Don't proceed if row is undefined
		}
		try {
			cartaNaLinha(row.elem.id, card);
		} catch(err) {}
		await translateTo(card, source, row);
		// CRITICAL: Remove card from source before adding to row (prevents cards from staying in hand/deck)
		// This is especially important for muster, where cards are being moved from hand/deck to the field
		const cardToAdd = (source && typeof source.removeCard === 'function') ? source.removeCard(card) : card;
		await row.addCard(cardToAdd);
	}

	getRow(card, row_name, player) {
		player = player ? player : card ? card.holder : player_me;
		let isMe = player === player_me;
		let isSpy = card.abilities.includes("spy");
		let isCurse = card.abilities.includes("curse");
		let isEmissary = card.abilities.includes("emissary");
		let isWaylay = card.abilities.includes("waylay");
		switch (row_name) {
			case "weather":
				return weather;
				break;
			case "close":
				return this.row[isMe ^ (isSpy || isCurse || isEmissary || isWaylay) ? 3 : 2];
			case "ranged":
				return this.row[isMe ^ (isSpy || isCurse || isEmissary || isWaylay) ? 4 : 1];
			case "siege":
				return this.row[isMe ^ (isSpy || isCurse || isEmissary || isWaylay) ? 5 : 0];
			case "grave":
				return player.grave;
			case "deck":
				return player.deck;
			case "hand":
				return player.hand;
			default:
				console.error(card.name + " sent to incorrect row \"" + row_name + "\" by " + card.holder.name);
		}
	}

	updateLeader() {
		let dif = player_me.total - player_op.total;
		player_me.setWinning(dif > 0);
		player_op.setWinning(dif < 0);
	}

	updateScores() {
		this.row.map(r => r.updateScore());
	}
}

class Game {
	constructor() {
		this.endScreen = document.getElementById("end-screen");
		// Use IDs for more reliable button selection
		this.customize_elem = document.getElementById("end-main-menu");
		this.replay_elem = document.getElementById("end-replay");
		if (this.customize_elem) {
			this.customize_elem.addEventListener("click", () => this.returnToCustomization(), false);
		}
		if (this.replay_elem) {
			this.replay_elem.addEventListener("click", () => this.restartGame(), false);
		}
		this.reset();
		this.randomOPDeck = true;
		this.fullAI = false;
	}

	reset() {
		this.firstPlayer;
		this.currPlayer = null;
		this.gameStart = [];
		this.roundStart = [];
		this.roundEnd = [];
		this.turnStart = [];
		this.turnEnd = [];
		this.roundCount = 0;
		this.roundHistory = [];
		this.over = false;
		this.randomRespawn = false;
		this.medicCount = 1;
		this.whorshipBoost = 1;
		this.spyPowerMult = 1;
		this.decoyCancelled = false;
		this.scorchCancelled = false;
		this.peaceTreatyActive = {};
		this.tradeThresholdsTriggered = {
			me: new Set(),
			op: new Set()
		};
		this.embargoActive = null;
		if (board) {
			if (board.row) {
				board.row.forEach(r => {
					r.halfWeather = false;
				});
			}
		}
		weather.reset();
		board.row.forEach(r => r.reset());
	}

	initPlayers(p1, p2) {
		let l1 = ability_dict[p1.leader.abilities[0]];
		let l2 = ability_dict[p2.leader.abilities[0]];
		let special_abilities = {
			emhyr_whiteflame: false,
			meve_white_queen: false
		};
		if (l1 === ability_dict["emhyr_whiteflame"] || l2 === ability_dict["emhyr_whiteflame"]) {
			p1.disableLeader();
			p2.disableLeader();
			special_abilities["emhyr_whiteflame"] = true;
		} else {
			initLeader(p1, l1);
			initLeader(p2, l2);
			if (l1 === ability_dict["meve_white_queen"] || l2 === ability_dict["meve_white_queen"]) special_abilities["meve_white_queen"] = true;
		}
		if (p1.deck.faction === p2.deck.faction && p1.deck.faction === "scoiatael") return special_abilities;
		initFaction(p1);
		initFaction(p2);

		function initLeader(player, leader) {
			if (leader.placed) leader.placed(player.leader);
			Object.keys(leader).filter(key => game[key]).map(key => {
				if (typeof leader[key] === 'function') {
					// Wrap the function to pass card and player parameters
					if (key === 'gameStart') {
						game[key].push(() => leader[key](player.leader, player));
					} else {
						game[key].push(leader[key]);
					}
				} else {
					game[key].push(leader[key]);
				}
			});
		}

		function initFaction(player) {
			if (factions[player.deck.faction] && factions[player.deck.faction].factionAbility && !factions[player.deck.faction].activeAbility) factions[player.deck.faction].factionAbility(player);
			if (factions[player.deck.faction] && factions[player.deck.faction].factionAbilityInit) factions[player.deck.faction].factionAbilityInit(player);
		}
		
		return special_abilities;
	}

	async startGame() {
		ui.toggleMusic_elem.classList.remove("music-customization");
		var special_abilities = this.initPlayers(player_me, player_op);
		await Promise.all([...Array(10).keys()].map(async () => {
			await player_me.deck.draw(player_me.hand);
			await player_op.deck.draw(player_op.hand);
		}));
		await this.runEffects(this.gameStart);
		if (!this.firstPlayer) this.firstPlayer = await this.coinToss();
		if (special_abilities["emhyr_whiteflame"]) await ui.notification("op-white-flame", 1200);
		if (special_abilities["meve_white_queen"]) await ui.notification("meve_white_queen", 1200);
		this.initialRedraw();
		somCarta();
	}

	async coinToss() {
		this.firstPlayer = (Math.random() < 0.5) ? player_me : player_op;
		await ui.notification(this.firstPlayer.tag + "-coin", 1200);
		return this.firstPlayer;
	}

	async initialRedraw() {
		// Handle Novigrad faction ability: allows 1 extra redraw
		const novigradRedraws = {
			me: player_me.deck.faction === "novigrad" ? 1 : 0,
			op: player_op.deck.faction === "novigrad" ? 1 : 0
		};
		
		if (player_op.controller instanceof ControllerAI) {
			for (let i = 0; i < 2 + novigradRedraws.op; i++) player_op.controller.redraw();
		}
		if (player_me.controller instanceof ControllerAI) {
			for (let i = 0; i < 2 + novigradRedraws.me; i++) player_me.controller.redraw();
		} else {
			const redrawCount = 2 + novigradRedraws.me;
			await ui.queueCarousel(player_me.hand, redrawCount, async (c, i) => await player_me.deck.swap(c, c.removeCard(i)), c => true, true, true, `Choose up to ${redrawCount} cards to redraw`);
			ui.enablePlayer(false);
		}
		game.startRound();
	}

	async startRound(verdict=false) {
		console.log("[START ROUND] Starting round", this.roundCount + 1);
		
		// Log cards on field before roundStart effects
		console.log("[START ROUND] Cards on field before roundStart effects:");
		board.row.forEach((row, i) => {
			if (row.cards.length > 0) {
				console.log(`  Row ${i}:`, row.cards.map(c => ({name: c.name, key: c.key, noRemove: c.noRemove})));
			}
		});
		
		if (this.tradeThresholdsTriggered) {
			for (let key of Object.keys(this.tradeThresholdsTriggered)) {
				if (this.tradeThresholdsTriggered[key] instanceof Set) {
					this.tradeThresholdsTriggered[key].clear();
				} else {
					this.tradeThresholdsTriggered[key] = new Set();
				}
			}
		}
		this.roundCount++;
		if (verdict && verdict.winner) this.currPlayer = verdict.winner.opponent();
		else this.currPlayer = (this.roundCount % 2 === 0) ? this.firstPlayer : this.firstPlayer.opponent();
		player_me.roundStartReset();
		player_op.roundStartReset();
		await this.runEffects(this.roundStart);
		
		// Log cards on field after roundStart effects
		console.log("[START ROUND] Cards on field after roundStart effects:");
		board.row.forEach((row, i) => {
			if (row.cards.length > 0) {
				console.log(`  Row ${i}:`, row.cards.map(c => ({name: c.name, key: c.key, noRemove: c.noRemove})));
			}
		});
		
		board.row.map(r => r.updateScore());
		if (!player_me.canPlay()) player_me.setPassed(true);
		if (!player_op.canPlay()) player_op.setPassed(true);
		if (player_op.passed && player_me.passed) return this.endRound();
		if (this.currPlayer.passed) this.currPlayer = this.currPlayer.opponent();
		await ui.notification("round-start", 1200);
		if (this.currPlayer.opponent().passed) await ui.notification(this.currPlayer.tag + "-turn", 1200);
		this.startTurn();
	}

	async startTurn() {
		await this.runEffects(this.turnStart);
		if (!this.currPlayer.opponent().passed) {
			this.currPlayer = this.currPlayer.opponent();
			await ui.notification(this.currPlayer.tag + "-turn", 1200);
		}
		ui.enablePlayer(this.currPlayer === player_me);
		this.currPlayer.startTurn();
	}

	async endTurn() {
		if (this.currPlayer === player_me) ui.enablePlayer(false);
		await this.runEffects(this.turnEnd);
		if (this.currPlayer.passed) await ui.notification(this.currPlayer.tag + "-pass", 1200);
		board.updateScores();
		if (player_op.passed && player_me.passed) this.endRound();
		else this.startTurn();
	}

	async endRound() {
		console.log("[END ROUND] Starting endRound, roundCount:", this.roundCount);
		limpar();
		let dif = player_me.total - player_op.total;
		if (dif === 0) {
			let nilf_me = player_me.deck.faction === "nilfgaard",
				nilf_op = player_op.deck.faction === "nilfgaard";
			dif = nilf_me ^ nilf_op ? nilf_me ? 1 : -1 : 0;
		}
		let winner = dif > 0 ? player_me : dif < 0 ? player_op : null;
		let verdict = {
			winner: winner,
			score_me: player_me.total,
			score_op: player_op.total
		}
		this.roundHistory.push(verdict);
		
		// Log cards on field before roundEnd effects
		console.log("[END ROUND] Cards on field before roundEnd effects:");
		board.row.forEach((row, i) => {
			if (row.cards.length > 0) {
				console.log(`  Row ${i}:`, row.cards.map(c => ({name: c.name, key: c.key, noRemove: c.noRemove})));
			}
		});
		
		await this.runEffects(this.roundEnd);
		
		// Log cards on field after roundEnd effects
		console.log("[END ROUND] Cards on field after roundEnd effects:");
		board.row.forEach((row, i) => {
			if (row.cards.length > 0) {
				console.log(`  Row ${i}:`, row.cards.map(c => ({name: c.name, key: c.key, noRemove: c.noRemove})));
			}
		});
		
		player_me.endRound(dif > 0);
		player_op.endRound(dif < 0);
		if (player_me.health === 0 || player_op.health === 0) this.over = true;
		
		console.log("[END ROUND] Calling clear() on all rows");
		// Clear all rows - must wait for all removals to complete
		await Promise.all(board.row.map(row => {
			row.clear();
			// Wait a bit for async operations to complete
			return new Promise(resolve => setTimeout(resolve, 100));
		}));
		
		// Log cards on field after clear
		console.log("[END ROUND] Cards on field after clear():");
		board.row.forEach((row, i) => {
			if (row.cards.length > 0) {
				console.log(`  Row ${i}:`, row.cards.map(c => ({name: c.name, key: c.key, noRemove: c.noRemove})));
			}
		});
		weather.clearWeather();
		if (dif > 0) await ui.notification("win-round", 1200);
		else if (dif < 0) {
			if (nilfgaard_wins_draws) {
				nilfgaard_wins_draws = false;
				await ui.notification("nilfgaard-wins-draws", 1200);
			}
			await ui.notification("lose-round", 1200);
		} else await ui.notification("draw-round", 1200);
		if (player_me.health === 0 || player_op.health === 0) this.endGame();
		else this.startRound(verdict);
	}

	async endGame() {
		may_giveup1 = false;
		this.over = true;
		let endScreen = document.getElementById("end-screen");
		let rows = endScreen.getElementsByTagName("tr");
		rows[1].children[0].innerHTML = player_me.name;
		rows[2].children[0].innerHTML = player_op.name;
		for (let i = 1; i < 4; ++i) {
			let round = this.roundHistory[i - 1];
			rows[1].children[i].innerHTML = round ? round.score_me : "X";
			rows[1].children[i].style.color = round && round.winner === player_me ? "goldenrod" : "";
			rows[2].children[i].innerHTML = round ? round.score_op : "X";
			rows[2].children[i].style.color = round && round.winner === player_op ? "goldenrod" : "";
		}
		endScreen.children[0].className = "";
		if (player_op.health <= 0 && player_me.health <= 0) endScreen.getElementsByTagName("p")[0].classList.remove("hide");
		else endScreen.getElementsByTagName("p")[0].classList.add("hide");
		var cond;
		if (player_op.health <= 0 && player_me.health <= 0) {
			endScreen.children[0].classList.add("end-draw");
			cond = 1;
		} else if (player_op.health === 0) {
			tocar("game_win", true);
			endScreen.children[0].classList.add("end-win");
			cond = 0;
		} else {
			tocar("game_lose", true);
			endScreen.children[0].classList.add("end-lose");
			cond = 2;
		}
		series[series.length] = cond;
		var maiores = [0,0,0];
		var maioresAux = [0,0,0];
		var aux = -1;
		for (var i = 0; i < series.length; i++) {
			var feito = false;
			if (aux == series[i]) {
				maioresAux[aux]++;
				feito = true;
			} else if (aux > -1) {
				if (maioresAux[aux] > maiores[aux]) maiores[aux] = maioresAux[aux];
				maioresAux[aux] = 0;
			}
			aux = series[i];
			if (!feito) maioresAux[aux]++;
		}
		for (var i = 0; i < 3; i++) if (maioresAux[i] > maiores[i]) maiores[i] = maioresAux[i];
		for (var i = 0; i < 3; i++) statistics[i][0] = maiores[i];
		statistics[cond][1]++;
		fadeIn(endScreen, 300);
		ui.enablePlayer(true);
		// Ensure end screen is clickable and buttons work
		endScreen.style.pointerEvents = "auto";
		endScreen.style.zIndex = "1000";
		// Ensure buttons are clickable
		if (this.customize_elem) this.customize_elem.style.pointerEvents = "auto";
		if (this.replay_elem) this.replay_elem.style.pointerEvents = "auto";
	}

	returnToCustomization() {
		iniciarMusica();
		this.reset();
		player_me.reset();
		player_op.reset();
		ui.toggleMusic_elem.classList.add("music-customization");
		// Hide end screen properly
		this.endScreen.style.opacity = 0;
		this.endScreen.style.zIndex = 0;
		this.endScreen.classList.add("hide");
		// Hide main game screen
		var mainEl = document.getElementsByTagName("main")[0];
		if (mainEl) mainEl.style.display = "none";
		// Show deck customization
		var deckEl = document.getElementById("deck-customization");
		if (deckEl) {
			deckEl.style.display = "block";
			deckEl.style.backgroundImage = "url('images/table.jpg')";
			deckEl.style.backgroundSize = "cover";
			deckEl.style.backgroundPosition = "center";
			deckEl.style.backgroundRepeat = "no-repeat";
		}
		// Remove noclick from click background
		var clickBg = document.getElementById("click-background");
		if (clickBg) clickBg.classList.remove("noclick");
	}

	restartGame() {
		iniciarMusica();
		limpar();
		this.reset();
		player_me.reset();
		player_op.reset();
		this.endScreen.classList.add("hide");
		this.startGame();
	}

	async runEffects(effects) {
		for (let i = effects.length - 1; i >= 0; --i) {
			let effect = effects[i];
			if (await effect()) effects.splice(i, 1)
		}
	}
}

class Card {
	constructor(key, card_data, player) {
		if (!card_data) {
			console.log("Invalid card data for: " + key);
			return;
		}
		this.id;
		if (card_data.id) this.id = Number(card_data.id);
		this.key = key;
		this.name = card_data.name;
		this.basePower = this.power = Number(card_data.strength);
		this.faction = card_data.deck;
		if (this.faction.startsWith("weather") || this.faction.startsWith("special")) this.faction = this.faction.split(" ")[0];
		this.abilities = (card_data.ability === "") ? [] : card_data.ability.split(" ");
		this.row = (this.faction === "weather") ? this.faction : card_data.row;
		this.filename = card_data.filename;
		this.placed = [];
		this.removed = [];
		this.activated = [];
		this.holder = player;
		this.locked = false;
		this.decoyTarget = false;
		this.target = "";
		this.currentLocation = board;
		if ("target" in card_data) this.target = card_data.target;
		this.quote = "";
		if ("quote" in card_data) this.quote = card_data.quote;
		this.hero = false;
		if (this.abilities.length > 0) {
			if (this.abilities[0] === "hero") {
				this.hero = true;
				this.abilities.splice(0, 1);
			}
			for (let x of this.abilities) {
				let ab = ability_dict[x];
				if (!ab) {
					console.warn(`Ability "${x}" not found in ability_dict for card ${this.key || this.name}`);
					continue;
				}
				if ("placed" in ab) this.placed.push(ab.placed);
				if ("removed" in ab) this.removed.push(ab.removed);
				if ("activated" in ab) this.activated.push(ab.activated);
			}
		}
		if (this.row === "leader") this.desc_name = "Leader Ability";
		else if (this.abilities.length > 0) {
			const lastAbility = ability_dict[this.abilities[this.abilities.length - 1]];
			if (lastAbility) {
				this.desc_name = lastAbility.name;
				if (this.abilities.length > 1) {
					const secondLastAbility = ability_dict[this.abilities[this.abilities.length - 2]];
					if (secondLastAbility) {
						this.desc_name += " / " + secondLastAbility.name;
					}
				}
			} else {
				// Ability not found in ability_dict, set desc_name to empty to avoid showing undefined/previous values
				this.desc_name = "";
			}
		} else if (this.row === "agile") this.desc_name = "Agile";
		else if (this.row === "any") this.desc_name = "Any";
		else if (this.row === "melee_siege") this.desc_name = "Melee/Siege";
		else if (this.hero) this.desc_name = "Hero";
		else this.desc_name = "";
		this.desc = this.row === "agile" ? "<p><b>Agile:</b> Can be placed in either the Close Combat or the Ranged Combat row.</p>" : (this.row === "any" ? "<p><b>Any:</b> " + ability_dict["any"].description + "</p>" : (this.row === "melee_siege" ? "<p><b>Melee/Siege:</b> " + ability_dict["melee_siege"].description + "</p>" : (this.row === "ranged_siege" ? "<p><b>Ranged/Siege:</b> " + ability_dict["ranged_siege"].description + "</p>" : "")));
		for (let i = this.abilities.length - 1; i >= 0; --i) {
			const ability = ability_dict[this.abilities[i]];
			if (!ability) {
				console.warn(`Ability "${this.abilities[i]}" not found in ability_dict for card ${this.key || this.name} when building description`);
				continue;
			}
			let abi_name = (ability.name ? ability.name : "Leader Ability");
			this.desc += "<p><b>" + abi_name + ":</b> " + (ability.description || "") + "</p>";
		}
		if (this.abilities.includes("avenger") && this.target) {
			// Special case: Crow Messenger avenges into Crowmother
			let avengerTarget = this.target;
			if (this.key === "sk_crow_messenger") {
				avengerTarget = "sk_crowmother";
			}
			let target = card_dict[avengerTarget];
			if (target) {
			this.desc += "<p>Summons <b>" + target["name"] + "</b> with strength " + target["strength"];
			if (target["ability"].length > 0) this.desc += " and abilities " + target["ability"].split(" ").map(a => ability_dict[a]["name"]).join(" / ");
			this.desc += "</p>";
			}
		}
		if (this.abilities.includes("hunger") && this.target) {
			let hungerTarget = this.target;
			let target = card_dict[hungerTarget];
			if (target) {
				this.desc += "<p>Transforms into <b>" + target["name"] + "</b> with strength " + target["strength"];
				if (target["ability"].length > 0) this.desc += " and abilities " + target["ability"].split(" ").map(a => ability_dict[a]["name"]).join(" / ");
				this.desc += " when Nightfall is applied to this row.</p>";
			}
		}
		if (this.hero) this.desc += "<p><b>Hero:</b> " + ability_dict["hero"].description + "</p>";
		this.elem = this.createCardElem(this);
	}

	getId() {
		return this.key;
	}

	setPower(n) {
		if (this.key === "spe_decoy") return;
		let elem = this.elem.children[0]?.children[0];
		if (!elem) return; // Safety check - element might not exist for some card types
		if (n !== this.power) {
			this.power = n;
			elem.innerHTML = this.power;
		}
		elem.style.color = (n > this.basePower) ? "goldenrod" : (n < this.basePower) ? "red" : "";
	}

	resetPower() {
		this.setPower(this.basePower);
	}

	async autoplay(source) {
		await board.toRow(this, source);
	}

	async animate(name, bFade = true, bExpand = true) {
		if (!may_pass1 && playingOnline) await sleep(600);
		var guia = {
			"medic" : "med",
			"muster" : "ally",
			"morale" : "moral",
			"bond" : "moral"
		}
		var temSom = new Array();
		for (var x in guia) temSom[temSom.length] = x;
		var literais = ["scorch", "spy", "horn", "shield", "lock", "seize", "aard", "resilience", "immortal", "fortify", "necromancy", "conspiracy", "skelligetactics", "clairvoyance", "omen", "guard", "quen", "yrden", "axii", "sacrifice", "embargo", "wine", "bribe", "emissary", "execute", "clear"];
		// CRITICAL: Ensure morale and bond always use "moral" sound, never "horn"
		// Handle morale and bond explicitly before the general mapping to prevent any confusion
		var som;
		if (name === "morale" || name === "bond") {
			som = "moral"; // Explicitly use "moral" sound for morale and bond
		} else {
			som = literais.indexOf(name) > -1 ? literais[literais.indexOf(name)] : temSom.indexOf(name) > -1 ? guia[name] : "";
		}
		if (som != "") tocar(som, false);
		// CRITICAL: Don't animate the scorch card itself - only animate units being killed
		// The scorch animation should only play on units that are being destroyed, not on the card triggering scorch
		if (name === "scorch" && (this.abilities.includes("scorch") || this.abilities.includes("scorch_c") || this.abilities.includes("scorch_r") || this.abilities.includes("scorch_s") || this.key === "spe_scorch")) {
			// This is the scorch card itself or a unit with scorch ability - don't animate it
			// The animation should only play on the units being killed (handled in abilities.js and row.scorch())
			return;
		}
		if (name === "scorch") return await this.scorch(name);
		let anim = this.elem.children[this.elem.children.length - 1];
		anim.style.backgroundImage = iconURL("anim_" + name);
		await sleep(50);
		if (bFade) fadeIn(anim, 300);
		if (bExpand) anim.style.backgroundSize = "100% auto";
		await sleep(300);
		if (bExpand) anim.style.backgroundSize = "80% auto";
		await sleep(1000);
		if (bFade) fadeOut(anim, 300);
		if (bExpand) anim.style.backgroundSize = "40% auto";
		await sleep(300);
		anim.style.backgroundImage = "";
	}

	showLockAnimation() {
		// Remove any existing lock animation first
		this.hideLockAnimation();
		
		// Create persistent lock animation overlay
		if (!this.elem) return;
		
		// Find or create the animation element (last child is typically the animation overlay)
		let anim = this.elem.children[this.elem.children.length - 1];
		if (!anim) {
			// Create animation element if it doesn't exist
			anim = document.createElement("div");
			anim.style.position = "absolute";
			anim.style.top = "0";
			anim.style.left = "0";
			anim.style.width = "100%";
			anim.style.height = "100%";
			anim.style.pointerEvents = "none";
			anim.style.zIndex = "1000";
			this.elem.style.position = "relative";
			this.elem.appendChild(anim);
		}
		
		// Set lock animation
		anim.style.backgroundImage = iconURL("anim_lock");
		anim.style.backgroundSize = "cover";
		anim.style.backgroundPosition = "center";
		anim.style.opacity = "1";
		anim.classList.add("lock-animation-persistent");
		
		// Store reference to animation element for easy removal
		this.lockAnimationElement = anim;
		
		// Play lock sound
		tocar("lock", false);
	}

	hideLockAnimation() {
		if (this.lockAnimationElement) {
			this.lockAnimationElement.style.backgroundImage = "";
			this.lockAnimationElement.classList.remove("lock-animation-persistent");
			this.lockAnimationElement = null;
		}
		// Also check the last child element in case reference is lost
		if (this.elem && this.elem.children.length > 0) {
			const lastChild = this.elem.children[this.elem.children.length - 1];
			if (lastChild && lastChild.classList.contains("lock-animation-persistent")) {
				lastChild.style.backgroundImage = "";
				lastChild.classList.remove("lock-animation-persistent");
			}
		}
	}

	async scorch(name) {
		let anim = this.elem.children[this.elem.children.length-1];
		anim.style.backgroundSize = "cover";
		anim.style.backgroundImage = iconURL("anim_" + name);
		await sleep(50);
		fadeIn(anim, 300);
		await sleep(1300);
		fadeOut(anim, 300);
		await sleep(300);
		anim.style.backgroundSize = "";
		anim.style.backgroundImage = "";
	}

	isUnit() {
		return !this.hero && (this.row === "close" || this.row === "ranged" || this.row === "siege" || this.row === "agile" || this.row === "any" || this.row === "melee_siege" || this.row === "ranged_siege");
	}

	isSpecial() {
		return ["spe_horn", "spe_redania_horn", "spe_mardroeme", "spe_sign_quen", "spe_sign_yrden", "spe_toussaint_wine", "spe_lyria_rivia_morale", "spe_wyvern_shield", "spe_mantlet", "spe_garrison", "spe_dimeritium_shackles"].includes(this.key);
	}

	static compare(a, b) {
		var dif = factionRank(a) - factionRank(b);
		if (dif !== 0) return dif;
		if (a.target && b.target && a.target === b.target) {
			if (a.id && b.id) return Number(a.id) - Number(b.id);
			if (a.key && b.key) return a.key.localeCompare(b.key);
		}
		dif = a.basePower - b.basePower;
		if (dif && dif !== 0) return dif;
		if (!a.name || !b.name) return 0; // Handle undefined names
		return a.name.localeCompare(b.name);
		
		function factionRank(c) {
			return c.faction === "special" ? -2 : (c.faction === "weather") ? -1 : 0;
		}
	}
	
	static compare2(a, b) {
		if (!a.name || !b.name) return 0; // Handle undefined names
		return a.name.localeCompare(b.name);
	}

	createCardElem(card) {
		let elem = document.createElement("div");
		let imgPath = card.faction + "_" + card.filename;
		// Special handling for Redania special cards - now using realms_ prefix
		if (card.faction === "special" && card.filename.startsWith("realms_")) {
			imgPath = card.filename;
		}
		elem.style.backgroundImage = smallURL(imgPath);
		elem.classList.add("card");
		elem.addEventListener("click", () => ui.selectCard(card), false);
		if (card.row === "leader") return elem;
		let power = document.createElement("div");
		elem.appendChild(power);
		let bg;
		if (card.hero) {
			bg = "power_hero";
			elem.classList.add("hero");
		} else if (card.faction === "weather") {
			// Special handling for Skellige Storm - use power_storm.png
			if (card.filename === "storm") {
				bg = "power_storm";
			} else {
				bg = "power_" + card.abilities[0];
			}
		}
		else if (card.faction === "special") {
			let str = card.abilities[0];
			if (str === "shield_c" || str === "shield_r" || str === "shield_s")
				str = "shield";
			else if (str === "redania_purge") str = "scorch"; // Use scorch icon for purge
			else if (str === "redania_horn") str = "horn"; // Use horn icon for redanian horn
			else if (str === "decree") str = "decree";
			else if (str === "peace_treaty") str = "peace_treaty"; // Use peace_treaty icon
			// Sign abilities use power_ prefix
			if (str && str.startsWith("sign_")) {
				bg = "power_" + str.replace("sign_", "");
			} else {
				bg = "power_" + str;
			}
			elem.classList.add("special");
		} else bg = "power_normal";
		power.style.backgroundImage = iconURL(bg);
		let row = document.createElement("div");
		elem.appendChild(row);
		if (card.row === "close" || card.row === "ranged" || card.row === "siege" || card.row === "agile" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege") {
			let num = document.createElement("div");
			num.appendChild(document.createTextNode(card.basePower));
			num.classList.add("center");
			power.appendChild(num);
			row.style.backgroundImage = iconURL("card_row_" + card.row);
		}
		let abi = document.createElement("div");
		elem.appendChild(abi);
		// For hero cards with melee_siege/ranged_siege, ensure ability area stays empty (row icon is only on row element)
		if (card.hero && (card.row === "melee_siege" || card.row === "ranged_siege")) {
			// Leave ability area empty for hero cards with melee_siege/ranged_siege
			abi.style.backgroundImage = "";
		} else if (card.faction !== "special" && card.faction !== "weather" && card.abilities.length > 0) {
			let str = card.abilities[card.abilities.length - 1];
			if (str && str.trim() !== "") {
				if (str === "cerys") str = "muster";
				if (str.startsWith("avenger")) str = "avenger";
				if (str === "scorch_c") str = "scorch_combat";
				else if (str === "scorch_r") str = "scorch_ranged";
				else if (str === "scorch_s") str = "scorch_siege";
				else if (str === "shield_c" || str == "shield_r" || str === "shield_s") str = "shield";
				else if (str === "redania_purge") str = "scorch"; // Use scorch icon for purge
				else if (str === "redania_horn") str = "horn";
				else if (str === "decree") str = "decree"; // Use decree icon
				else if (str === "waylay") str = "waylay";
				else if (str === "guard") str = "guard";
				else if (str === "sacrifice") str = "sacrifice";
			else if (str === "conspiracy") str = "conspiracy";
			else if (str === "worshipper") str = "worshipper";
			else if (str === "worshipped") str = "worshipped";
			else if (str === "skellige_tactics") str = "skelligetactics";
				if (str && str.trim() !== "") {
					abi.style.backgroundImage = iconURL("card_ability_" + str);
				}
			}
		} else if ((card.key === "spe_redania_decree") || (card.faction === "special" && card.abilities.includes("decree") && card.filename === "realms_decree")) {
			abi.style.backgroundImage = iconURL("card_special_decree");
		} else if ((card.key === "nr_peace_treaty") || (card.faction === "special" && card.abilities.includes("peace_treaty"))) {
			abi.style.backgroundImage = iconURL("card_special_treaty");
		} else if (card.row === "agile") abi.style.backgroundImage = iconURL("card_ability_agile");
		else if (card.row === "any") abi.style.backgroundImage = iconURL("card_ability_agile"); // Use agile icon for "any" row type
		// For hero cards with melee_siege/ranged_siege, don't show row icon in ability area - it's already on the row element
		// The ability area should remain empty for hero cards with only melee_siege/ranged_siege
		// For non-hero cards with melee_siege/ranged_siege, also don't show row icon in ability area (it's on the row element)
		// Note: melee_siege and ranged_siege row icons are only shown on the row element, not in the ability area
		if (card.abilities.length > 1) {
			let abi2 = document.createElement("div");
			abi2.classList.add("card-ability-2");
			elem.appendChild(abi2);
			let str = card.abilities[card.abilities.length - 2];
			if (str && str.trim() !== "") {
				if (str === "cerys") str = "muster";
				if (str.startsWith("avenger")) str = "avenger";
				if (str === "scorch_c") str = "scorch_combat";
				else if (str === "scorch_r") str = "scorch_ranged";
				else if (str === "scorch_s") str = "scorch_siege";
				else if (str === "shield_c" || str == "shield_r" || str === "shield_s") str = "shield";
				else if (str === "redania_purge") str = "scorch"; // Use scorch icon for purge
				else if (str === "redania_horn") str = "horn";
				else if ((str === "decree" && card.key === "spe_redania_decree") || (str === "decree" && card.faction === "special" && card.filename === "realms_decree")) {
					abi2.style.backgroundImage = iconURL("card_special_decree");
				} else if (str === "decree") {
					str = "decree"; // Use decree icon
					abi2.style.backgroundImage = iconURL("card_ability_" + str);
				} else if (str === "waylay") {
					str = "waylay";
					abi2.style.backgroundImage = iconURL("card_ability_" + str);
				} else if (str === "guard") {
					str = "guard";
					abi2.style.backgroundImage = iconURL("card_ability_" + str);
				} else if (str === "sacrifice") {
					str = "sacrifice";
					abi2.style.backgroundImage = iconURL("card_ability_" + str);
				} else if (str === "conspiracy") {
					str = "conspiracy";
					abi2.style.backgroundImage = iconURL("card_ability_" + str);
				} else if (str === "skellige_tactics") {
					str = "skelligetactics";
					abi2.style.backgroundImage = iconURL("card_ability_" + str);
				} else if ((str === "peace_treaty" && card.key === "nr_peace_treaty") || (str === "peace_treaty" && card.faction === "special")) {
					abi2.style.backgroundImage = iconURL("card_special_treaty");
				} else if (str && str.trim() !== "") {
					abi2.style.backgroundImage = iconURL("card_ability_" + str);
				}
			}
		}
		elem.appendChild(document.createElement("div"));
		return elem;
	}

	isLocked() {
		return this.locked;
	}
}

class UI {
	constructor() {
		this.userInteracted = false;
		// Listen for first user interaction to enable audio (critical for mobile)
		const enableAudio = () => {
			if (!this.userInteracted) {
				this.userInteracted = true;
				// Unlock audio context on mobile by playing a silent sound
				// This is required for iOS and some Android browsers
				try {
					const unlockAudio = new Audio();
					unlockAudio.volume = 0.01;
					unlockAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
					unlockAudio.play().catch(() => {});
				} catch (e) {}
				
				// Try to play music after user interaction
				if (this.backgroundMusic && this.backgroundMusic.paused) {
					this.playBackgroundMusic();
				}
			}
		};
		// Listen for various user interactions (including mobile touch events)
		document.addEventListener('click', enableAudio, { once: true });
		document.addEventListener('keydown', enableAudio, { once: true });
		document.addEventListener('touchstart', enableAudio, { once: true });
		document.addEventListener('touchend', enableAudio, { once: true });
		// Also listen on the document body for better mobile coverage
		if (document.body) {
			document.body.addEventListener('touchstart', enableAudio, { once: true, passive: true });
		}
		
		this.carousels = [];
		this.notif_elem = document.getElementById("notification-bar");
		this.preview = document.getElementsByClassName("card-preview")[0];
		this.previewCard = null;
		this.lastRow = null;
		if (!isMobile()) {
			document.getElementById("pass-button").addEventListener("mousedown", function(e) {
				if (e.button == 0) passStart("mouse");
				else if (may_pass2 == "mouse") passBreak();
			});
			document.getElementById("pass-button").addEventListener("mouseup", () => {
				if (may_pass2 == "mouse") passBreak();
			}, false);
			document.getElementById("pass-button").addEventListener("mouseout", () => {
				if (may_pass2 == "mouse") passBreak();
			}, false);
			document.getElementById("giveup-button").addEventListener("mousedown", function(e) {
				if (e.button == 0) giveupStart("mouse");
				else if (may_giveup2 == "mouse") giveupBreak();
			});
			document.getElementById("giveup-button").addEventListener("mouseup", () => {
				if (may_giveup2 == "mouse") giveupBreak();
			}, false);
			document.getElementById("giveup-button").addEventListener("mouseout", () => {
				if (may_giveup2 == "mouse") giveupBreak();
			}, false);
			window.addEventListener("keydown", function (e) {
				if (e.keyCode == 32 || e.keyCode == 81) e.preventDefault();
				switch (e.keyCode) {
					case 81:
						try {
							ui.cancel();
							if (may_giveup1 && !game.fullAI) giveupStart("keyboard");
						} catch(err) {}
						break;
					case 32:
						if (!game.fullAI) passStart("keyboard");
						break;
				}
			});
			window.addEventListener("keyup", function (e) {
				if (e.keyCode == 32 && may_pass1 && may_pass2 == "keyboard") passBreak();
				else if (e.keyCode == 81 && may_giveup1 && may_giveup2 == "keyboard") giveupBreak();
			});
		} else {
			document.getElementById("pass-button").addEventListener("click", function(e) {
				player_me.passRound();
			});
			document.getElementById("giveup-button").addEventListener("click", function(e) {
				desistir();
			});
		}
		document.getElementById("click-background").addEventListener("click", () => ui.cancel(), false);
		// Add right-click listener to the playing field for card deselection
		document.getElementById("panel-mid").addEventListener("contextmenu", (e) => {
			e.preventDefault();
			ui.cancel();
		}, false);
		this.youtube;
		this.ytActive;
		this.toggleMusic_elem = document.getElementById("toggle-music");
		this.toggleMusic_elem.classList.add("fade");
		this.toggleMusic_elem.addEventListener("click", () => this.toggleMusic(), false);
	}

	passLoad() {
		load_pass--;
		if (load_pass == -1) {
			document.getElementById("pass-button").innerHTML = original;
			load_pass = load_passT;
			player_me.passRound();
			passBreak();
		} else document.getElementById("pass-button").innerHTML = load_pass + 1;
	}
	
	giveupLoad() {
		load_giveup--;
		if (load_giveup == -1) {
			document.getElementById("giveup-button").innerHTML = original2;
			load_giveup = load_giveupT;
			desistir();
			giveupBreak();
		} else document.getElementById("giveup-button").innerHTML = load_giveup + 1;
	}

	enablePlayer(enable) {
		let main = document.getElementsByTagName("main")[0].classList;
		lancado = (!(enable && !game.fullAI));
		if (enable && !game.fullAI) main.remove("noclick");
		else main.add("noclick");
	}

	initLocalMusic() {
		// Try multiple paths for audio loading to handle both dev and production
		let audioPaths = [
			"gwent.mp3",
			"./gwent.mp3",
			"../gwent.mp3",
			"resources/gwent.mp3"
		];
		
		// Check if we're in Electron and try to use the proper path
		if (window.electronAPI && window.electronAPI.getResourcePath) {
			try {
				const electronPath = window.electronAPI.getResourcePath("gwent.mp3");
				audioPaths.unshift(electronPath); // Add to beginning of array
				console.log("Electron resource path:", electronPath);
			} catch (e) {
				console.log("Could not get electron resource path:", e);
			}
		}
		
		console.log("Trying audio paths:", audioPaths);
		
		// Try to load audio with fallback paths
		this.tryLoadAudio(audioPaths, 0);
	}
	
	tryLoadAudio(audioPaths, index) {
		if (index >= audioPaths.length) {
			console.error("Failed to load audio from all paths:", audioPaths);
			return;
		}
		
		const audioPath = audioPaths[index];
		console.log(`Attempting to load audio from path ${index + 1}/${audioPaths.length}:`, audioPath);
		
		this.backgroundMusic = new Audio(audioPath);
		this.backgroundMusic.loop = true;
		this.backgroundMusic.volume = 0.6;
		this.soundEffectsVolume = 0.3;
		
		// Add error handling for audio loading
		this.backgroundMusic.addEventListener('error', (e) => {
			console.error(`Error loading audio from ${audioPath}:`, e);
			console.error('Audio error details:', this.backgroundMusic.error);
			// Try next path
			this.tryLoadAudio(audioPaths, index + 1);
		});
		
		// Add success handling
		this.backgroundMusic.addEventListener('canplaythrough', () => {
			console.log(`Successfully loaded audio from: ${audioPath}`);
			// Only try to autoplay if user has interacted
			if (this.userInteracted) {
			this.playBackgroundMusic();
			}
		});
		
		// Initialize music state
		if (this.ytActive !== undefined) return;
		this.ytActive = true;
		
		// Try to play with error handling
		this.backgroundMusic.play().catch(e => {
			// Suppress NotAllowedError (autoplay blocked) - this is expected browser behavior
			if (e.name !== 'NotAllowedError') {
			console.error('Could not play background music:', e);
				// Try next path on play error (only for non-autoplay errors)
				if (e.name !== 'NotAllowedError') {
			this.tryLoadAudio(audioPaths, index + 1);
				}
			}
		});
		
		this.toggleMusic_elem.classList.remove("fade");
		
		// Log current volume levels for debugging
		console.log("Audio levels set:");
		console.log("- Background music: " + Math.round(this.backgroundMusic.volume * 100) + "%");
		console.log("- Sound effects: " + Math.round(this.soundEffectsVolume * 100) + "%");
		console.log("You can adjust these with: ui.setBackgroundMusicVolume(0.5) or ui.setSoundEffectsVolume(0.4)");
	}
	
	playBackgroundMusic() {
		if (this.backgroundMusic && !this.backgroundMusic.paused) {
			return; // Already playing
		}
		
		if (this.backgroundMusic) {
			this.backgroundMusic.play().catch(e => {
				// Suppress NotAllowedError (autoplay blocked) - this is expected browser behavior
				if (e.name !== 'NotAllowedError') {
				console.error('Could not play background music:', e);
				}
			});
		}
	}

	toggleMusic() {
		if (this.backgroundMusic.paused) iniciarMusica();
		else {
			this.backgroundMusic.pause();
			this.toggleMusic_elem.classList.add("fade");
		}
	}

	setLocalMusicEnabled(enable) {
		if (this.ytActive === enable) return;
		if (enable && !this.mute) ui.backgroundMusic.play();
		else ui.backgroundMusic.pause();
		this.ytActive = enable;
	}

	// Volume control methods
	setBackgroundMusicVolume(volume) {
		// volume should be between 0.0 and 1.0
		if (volume >= 0 && volume <= 1) {
			this.backgroundMusic.volume = volume;
		}
	}

	setSoundEffectsVolume(volume) {
		// volume should be between 0.0 and 1.0
		// This will be used by the tocar function
		this.soundEffectsVolume = volume;
	}

	getBackgroundMusicVolume() {
		return this.backgroundMusic.volume;
	}

	getSoundEffectsVolume() {
		return this.soundEffectsVolume || 0.3; // Default to 0.3 if not set
	}

	async selectCard(card) {
		let row = this.lastRow;
		let pCard = this.previewCard;
		if (card === pCard) return;
		if (pCard === null || card.holder.hand.cards.includes(card)) {
			this.setSelectable(null, false);
			this.showPreview(card);
		} else if (pCard.abilities.includes("decoy")) {
			this.hidePreview(card);
			this.enablePlayer(false);
			card.decoyTarget = true;
			board.toHand(card, row);
			await board.moveTo(pCard, row, pCard.holder.hand);
			pCard.holder.endTurn();
		} else if (pCard.abilities.includes("alzur_maker")) {
			this.hidePreview(card);
			this.enablePlayer(false);
			await board.toGrave(card, row);
			let target = new Card(ability_dict["alzur_maker"].target, card_dict[ability_dict["alzur_maker"].target], card.holder);
			await board.addCardToRow(target, target.row, card.holder);
			pCard.holder.endTurn();
		}
	}

	async selectRow(row, isSpecial = false) {
		this.lastRow = row;
		if (this.previewCard === null) {
			if (isSpecial) await ui.viewCardsInContainer(row.special);
			else await ui.viewCardsInContainer(row);
			return;
		}
		// Handle Decoy: requires a target unit to swap with - cannot be played without a target
		if (this.previewCard.key === "spe_decoy" || this.previewCard.abilities.includes("decoy")) {
			const unitsInRow = row.cards.filter(c => c.isUnit());
			if (unitsInRow.length > 0) {
				// Valid target exists - will be handled by selectCard when user clicks a unit
				return;
			} else {
				// No valid target - cannot play decoy
				console.log("⚠️ Cannot play Decoy - no units in selected row to swap with");
				return;
			}
		}
		if (this.previewCard.abilities.includes("alzur_maker")) {
			return;
		}
		let card = this.previewCard;
		let holder = card.holder;
		this.hidePreview();
		this.enablePlayer(false);
		if (card.faction === "special" && (card.abilities.includes("scorch") || card.abilities.includes("redania_purge"))) {
			this.hidePreview();
			if (!game.scorchCancelled) await ability_dict["scorch"].activated(card);
		} else if (card.faction === "special" && card.abilities.includes("cull")) {
			this.hidePreview();
			if (!game.scorchCancelled) await ability_dict["cull"].activated(card);
		} else if (card.faction === "special" && card.abilities.includes("cintra_slaughter")) {
			this.hidePreview();
			await ability_dict["cintra_slaughter"].activated(card);
		} else if (card.faction === "special" && card.abilities.includes("seize")) {
			this.hidePreview();
			await ability_dict[card.abilities.at(-1)].activated(card);
		} else if (card.faction === "special" && card.abilities.includes("sign_aard")) {
			this.hidePreview();
			await ability_dict[card.abilities.at(-1)].activated(card, row);
		} else if (card.key === "spe_decoy" || card.abilities.includes("decoy")) {
			// Decoy requires a target - this should have been caught earlier, but double-check
			const unitsInRow = row.cards.filter(c => c.isUnit());
			if (unitsInRow.length === 0) {
				console.log("⚠️ Cannot play Decoy - no units in selected row to swap with");
				return;
			}
			// Valid target exists - will be handled by selectCard when user clicks a unit
			return;
		} else if (card.abilities.includes("alzur_maker")) {
			return;
		} else if (card.key === "spe_lyria_rivia_morale") await board.moveTo(card, row);
		else if (card.abilities.includes("carlo_varese")) {
			this.hidePreview(card);
			this.enablePlayer(false);
			if (!game.scorchCancelled) await row.scorch();
		} else if (card.abilities.includes("meve_princess")) {
			// Meve Princess: automatically finds rows with 4+ cards and destroys one
			// This should not be reached via row selection, but handle it just in case
			this.hidePreview(card);
			this.enablePlayer(false);
			await ability_dict["meve_princess"].activated(card, card.holder);
			holder.endTurn();
			return;
		} else if (card.abilities.includes("cyrus_hemmelfart")) {
			this.hidePreview(card);
			this.enablePlayer(false);
			let new_card = new Card("spe_dimeritium_shackles", card_dict["spe_dimeritium_shackles"], card.holder);
			await board.moveTo(new_card, row);
		} else if (card.faction === "special" && card.abilities.includes("bank")) {
			this.hidePreview();
			await ability_dict["bank"].activated(card);
		} else if (card.faction === "special" && card.abilities.includes("decree")) {
			// Royal Decree - activate leader ability immediately
			this.hidePreview();
			this.enablePlayer(false);
			await board.toGrave(card, card.holder.hand);
			await ability_dict["decree"].placed(card);
			holder.endTurn();
			return;
		} else if (card.faction === "special" && card.abilities.includes("peace_treaty")) {
			// Peace Treaty - allow row selection (any row works), but place in custom location
			this.hidePreview();
			this.enablePlayer(false);
			card.holder.hand.removeCard(card);
			await ability_dict["peace_treaty"].placed(card);
			holder.endTurn();
			return;
		} else if (card.abilities.includes("waylay")) {
			// Waylay - place on opponent's row (unit card)
			this.hidePreview();
			this.enablePlayer(false);
			await board.moveTo(card, row, card.holder.hand);
		} else if (card.faction === "special" && (card.abilities.includes("sign_igni") || card.abilities.includes("sign_yrden"))) {
			// Sign cards that need row selection
			this.hidePreview();
			this.enablePlayer(false);
			card.holder.hand.removeCard(card);
			await ability_dict[card.abilities.find(a => a.startsWith("sign_"))].placed(card, row);
			holder.endTurn();
		} else if (card.faction === "special" && card.abilities.includes("sign_axii")) {
			// Sign: Axii works like Seize - no row selection needed
			this.hidePreview();
			this.enablePlayer(false);
			card.holder.hand.removeCard(card);
			await ability_dict["sign_axii"].activated(card);
			holder.endTurn();
			return;
		} else if (card.faction === "special" && card.abilities.includes("sign_quen")) {
			// Quen - doesn't need row selection, targets a unit
			this.hidePreview();
			this.enablePlayer(false);
			card.holder.hand.removeCard(card);
			await ability_dict["sign_quen"].placed(card, row);
			holder.endTurn();
		} else await board.moveTo(card, row, card.holder.hand);
		holder.endTurn();
	}

	cancel() {
		if (!fimU) {
			fimU = true;
			tocar("discard", false);
			lCard = null;
			exibindo_lider = false;
			carta_c = false;
			this.hidePreview();
		}
	}

	showPreview(card) {
		fimU = false;
		tocar("explaining", false);
		this.showPreviewVisuals(card);
		this.setSelectable(card, true);
		document.getElementById("click-background").classList.remove("noclick");
	}

	showPreviewVisuals(card) {
		this.previewCard = card;
		this.preview.classList.remove("hide");
		getPreviewElem(this.preview.getElementsByClassName("card-lg")[0],card)
		this.preview.getElementsByClassName("card-lg")[0].addEventListener("mousedown", function() {
			if (fileira_clicavel !== null && may_act_card) {
				ui.selectRow(fileira_clicavel);
				may_act_card = false;
				fileira_clicavel = null;
			}
		});
		this.preview.getElementsByClassName("card-lg")[0].addEventListener("mouseup", function() {
			may_act_card = true;
		});
		let desc_elem = this.preview.getElementsByClassName("card-description")[0];
		this.setDescription(card, desc_elem);
	}

	hidePreview() {
		document.getElementById("click-background").classList.add("noclick");
		player_me.hand.cards.forEach(c => c.elem.classList.remove("noclick"));
		this.preview.classList.add("hide");
		this.setSelectable(null, false);
		this.previewCard = null;
		this.lastRow = null;
	}

	setDescription(card, desc) {
		if (card.hero || card.row === "agile" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege" || card.abilities.length > 0 || card.faction === "faction") {
			desc.classList.remove("hide");
			let str = card.row === "agile" ? "agile" : (card.row === "any" ? "any" : (card.row === "melee_siege" ? "melee_siege" : (card.row === "ranged_siege" ? "ranged_siege" : "")));
			if (card.abilities.length) str = card.abilities[card.abilities.length - 1];
			if (str === "cerys") str = "muster";
			if (str.startsWith("avenger")) str = "avenger";
			if (str === "scorch_c") str = "scorch_combat";
			else if (str === "scorch_r") str = "scorch_ranged";
			else if (str === "scorch_s") str = "scorch_siege";
			else if (str === "shield_c" || str == "shield_r" || str === "shield_s") str = "shield";
			else if (str === "redania_purge") str = "scorch"; // Use scorch icon for purge
			else if (str === "redania_horn") str = "horn"; // Use horn icon for redanian horn
			else if (str === "decree") str = "decree"; // Use decree icon
			else if (str === "waylay") str = "waylay";
			else if (str === "guard") str = "guard";
			else if (str === "sacrifice") str = "sacrifice";
			else if (str === "worshipper") str = "worshipper";
			else if (str === "worshipped") str = "worshipped";
			else if (str === "skellige_tactics") str = "skelligetactics";
			if (card.faction === "faction" || card.abilities.length === 0 && card.row !== "agile" && card.row !== "any" && card.row !== "melee_siege" && card.row !== "ranged_siege") desc.children[0].style.backgroundImage = "";
			else if (card.row === "leader") desc.children[0].style.backgroundImage = iconURL("deck_shield_" + card.faction);
			// Don't show row icon in description for hero cards - it's already shown on the card element
			// Hero cards should show the hero ability icon in the description instead
			else if (card.hero && (card.row === "melee_siege" || card.row === "ranged_siege")) {
				// For hero cards with melee_siege/ranged_siege, show hero icon instead of row icon in description
				desc.children[0].style.backgroundImage = iconURL("card_ability_hero");
			}
			else if (card.row === "melee_siege") desc.children[0].style.backgroundImage = iconURL("card_row_melee_siege");
			else if (card.row === "ranged_siege") desc.children[0].style.backgroundImage = iconURL("card_row_ranged_siege");
			else if (card.faction === "special") {
				// Special cards don't show ability icons
				desc.children[0].style.backgroundImage = "";
			} else desc.children[0].style.backgroundImage = iconURL("card_ability_" + str);
			desc.children[1].innerHTML = card.desc_name;
			desc.children[2].innerHTML = card.desc;
		} else desc.classList.add("hide");
	}

	async notification(name, duration) {
		var guia1 = {
			"notif-nilfgaard-wins-draws": "Nilfgaard wins draws",
			"notif-op-white-flame": "The opponent's leader cancel your opponent's Leader Ability",
			"notif-op-leader": "Opponent uses leader",
			"notif-me-first": "You will go first",
			"notif-op-first": "Your opponent will go first",
			"notif-me-coin": "You will go first",
			"notif-op-coin": "Your opponent will go first",
			"notif-round-start": "Round Start",
			"notif-me-pass": "Round passed",
			"notif-op-pass": "Your opponent has passed",
			"notif-win-round": "You won the round!",
			"notif-lose-round": "Your opponent won the round",
			"notif-draw-round": "The round ended in a draw",
			"notif-me-turn": "Your turn!",
			"notif-op-turn": "Opponent's turn",
			"notif-north": "Northern Realms faction ability triggered - North draws an additional card.",
			"notif-monsters": "Monsters faction ability triggered - one randomly-chosen Monster Unit Card stays on the board",
			"notif-scoiatael": "Opponent used the Scoia'tael faction perk to go first.",
			"notif-skellige-op": "Opponent Skellige Ability Triggered!",
			"notif-skellige-me": "Skellige Ability Triggered!",
			"notif-witchers": "Witchers used its faction ability and skipped a turn",
			"notif-toussaint": "Toussaint faction ability triggered - Toussaint draws an additional card.",
			"notif-toussaint-decoy-cancelled": "Toussaint Leader ability used - Decoy ability cancelled for the rest of the round.",
			"notif-lyria_rivia": "Lyria & Rivia ability used - Morale Boost effect applied to a row.",
			"notif-meve_white_queen": "Lyria & Rivia leader allows both players to restore 2 units when using the medic ability.",
			"notif-north-scorch-cancelled": "Northern Realms Leader ability used - Scorch ability cancelled for the rest of the round.",
			"notif-zerrikania": "Zerrikania ability used - Unit restored from discard pile.",
			"notif-ofir": "Ofir faction ability used - Weather card played from deck.",
			"notif-novigrad-sigismund": "Sigismund Dijkstra prevented the death of a friendly unit.",
		}
		var guia2 = {
			"me-pass" : "pass",
			"win-round" : "round_win",
			"lose-round" : "round_lose",
			"me-turn" : "turn_me",
			"op-turn" : "turn_op",
			"op-leader" : "turn_op",
			"op-white-flame" : "turn_op",
			"nilfgaard-wins-draws" : "turn_op"
		}
		var temSom = new Array();
		for (var x in guia2) temSom[temSom.length] = x;
		var som = temSom.indexOf(name) > -1 ? guia2[name] : name == "round-start" && game.roundHistory.length == 0 ? "round1_start" : "";
		if (som != "") tocar(som, false);
		this.notif_elem.children[0].id = "notif-" + name;
		this.notif_elem.children[0].style.backgroundImage = name == "op-leader" ? "url('images/icons/notif_" + player_op.deck.faction + ".png')" : "";
		var caracteres = guia1[this.notif_elem.children[0].id].length;
		var palavras = guia1[this.notif_elem.children[0].id].split(" ").length;
		duration = parseInt(0.7454878 * Math.max(parseInt((1e3 / 17) * caracteres), parseInt((6e4 / 300) * palavras)) + 211.653152) + 1;
		const fadeSpeed = 150;
		fadeIn(this.notif_elem, fadeSpeed);
		var ch = playingOnline && duration < 1000 & cache_notif.indexOf(name) == -1 ? 800 : 0;
		cache_notif[cache_notif.length] = name;
		duration += ch;
		let d = new Date().getTime();
		fadeOut(this.notif_elem, fadeSpeed, duration - fadeSpeed - 50);
		await sleep(duration);
	}

	async viewCard(card, action) {
		if (card === null) return;
		if (lCard !== card.name) {
			lCard = card.name;
			let container = new CardContainer();
			container.cards.push(card);
			await this.viewCardsInContainer(container, action);
		}
	}

	async viewCardsInContainer(container, action) {
		action = action ? action : function () {
			return this.cancel();
		};
		await this.queueCarousel(container, 1, action, () => true, false, true);
	}

	async queueCarousel(container, count, action, predicate, bSort, bQuit, title) {
		if (game.currPlayer === player_op) {
			if (player_op.controller instanceof ControllerAI) {
				for (let i = 0; i < count; ++i) {
					let cards = container.cards.reduce((a, c, i) => !predicate || predicate(c) ? a.concat([i]) : a, []);
					await action(container, cards[randomInt(cards.length)]);
				}
			}
			return;
		}
		let carousel = new Carousel(container, count, action, predicate, bSort, bQuit, title);
		if (Carousel.curr === undefined || Carousel.curr === null) carousel.start();
		else {
			this.carousels.push(carousel);
			return;
		}
		await sleepUntil(() => this.carousels.length === 0 && !Carousel.curr, 100);
	}

	quitCarousel() {
		if (this.carousels.length > 0) this.carousels.shift().start();
	}

	async popup(yesName, yes, noName, no, title, description, aviso, apagarFim) {
		let p = new Popup(yesName, yes, noName, no, title, description, aviso, apagarFim);
		await sleepUntil(() => !Popup.curr)
	}

	setSelectable(card, enable) {
		if (!enable) {
			for (let row of board.row) {
				row.elem.classList.remove("row-selectable");
				row.elem.classList.remove("noclick");
				row.special.elem.classList.remove("row-selectable");
				row.special.elem.classList.remove("noclick");
				alteraClicavel(row, false);
				for (let card of row.cards) {
					card.elem.classList.add("noclick");
				}
			}
			weather.elem.classList.remove("row-selectable");
			weather.elem.classList.remove("noclick");
			alteraClicavel(weather, false);
			return;
		}
		if (card.faction === "weather") {
			for (let row of board.row) {
				row.elem.classList.add("noclick");
				row.special.elem.classList.add("noclick");
			}
			weather.elem.classList.add("row-selectable");
			carta_c = true;
			document.getElementById("field-op").addEventListener("click",function() {
				cancelaClima();
			});
			document.getElementById("field-me").addEventListener("click",function() {
				cancelaClima();
			});
			alteraClicavel(weather, true);
			return;
		}
		weather.elem.classList.add("noclick");
		if (card.faction === "special" && (card.abilities.includes("scorch") || card.abilities.includes("redania_purge"))) {
			for (let r of board.row) {
				if (r.isShielded() || game.scorchCancelled) {
					r.elem.classList.add("noclick");
					r.special.elem.classList.add("noclick");
				} else {
					r.elem.classList.add("row-selectable");
					r.special.elem.classList.add("row-selectable");
					alteraClicavel(r, true);
				}
			}
			return;
		}
		if (card.faction === "special" && (card.abilities.includes("cintra_slaughter") || card.abilities.includes("bank") || card.abilities.includes("decree"))) {
			for (let i = 0; i < 6; i++) {
				let r = board.row[i];
				if (i > 2) {
					r.elem.classList.add("row-selectable");
					r.special.elem.classList.add("row-selectable");
					alteraClicavel(r, true);
				}
			}
			return;
		}
		if (card.faction === "special" && card.abilities.includes("peace_treaty")) {
			// Peace Treaty - allow selection of any row (all rows highlighted)
			for (let i = 0; i < 6; i++) {
				let r = board.row[i];
				r.elem.classList.add("row-selectable");
				r.special.elem.classList.add("row-selectable");
				alteraClicavel(r, true);
			}
			return;
		}
		if (card.faction === "special" && card.abilities.includes("sign_aard")) {
			for (var i = 1; i < 3; i++) {
				let r = board.row[i];
				if (!r.isShielded()) {
					r.elem.classList.add("row-selectable");
					r.special.elem.classList.add("row-selectable");
					alteraClicavel(r, true);
				}
			}
			return;
		}
		if (card.faction === "special" && card.abilities.includes("seize")) {
			let r = board.row[2];
			if (!r.isShielded()) {
				r.elem.classList.add("row-selectable");
				r.special.elem.classList.add("row-selectable");
				alteraClicavel(r, true);
			}
			return;
		}
		if (card.isSpecial()) {
			for (let i = 0; i < 6; i++) {
				let r = board.row[i];
				if (card.abilities.includes("lock")) {
					if (i > 2 || r.special.containsCardByKey(card.key) || r.isShielded()) {
						r.elem.classList.add("noclick");
						r.special.elem.classList.add("noclick");
					} else {
						r.special.elem.classList.add("row-selectable");
						fileira_clicavel = null;
					}
				} else if (card.abilities.includes("shield_c") || card.abilities.includes("shield_r") || card.abilities.includes("shield_s")) {
					if ((card.abilities.includes("shield_c") && i == 3) || (card.abilities.includes("shield_r") && i == 4) || (card.abilities.includes("shield_s") && i == 5)) {
						r.special.elem.classList.add("row-selectable");
						fileira_clicavel = null;
					} else {
						r.elem.classList.add("noclick");
						r.special.elem.classList.add("noclick");
					}
				} else {
					if (i < 3 || r.special.containsCardByKey(card.key) || ((card.abilities.includes("toussaint_wine") || card.abilities.includes("wine")) && i == 5)) {
						r.elem.classList.add("noclick");
						r.special.elem.classList.add("noclick");
					} else {
						r.special.elem.classList.add("row-selectable");
						fileira_clicavel = null;
					}
				}
			}
			return;
		}
		if (card.abilities.includes("decoy") || card.abilities.includes("alzur_maker")) {
			for (let i = 0; i < 6; ++i) {
				let r = board.row[i];
				let units = r.cards.filter(c => c.isUnit());
				if (i < 3 || (card.key === "spe_decoy" && units.length === 0) || (card.abilities.includes("decoy") && game.decoyCancelled)) {
					r.elem.classList.add("noclick");
					r.special.elem.classList.add("noclick");
					r.elem.classList.remove("card-selectable");
				} else {
					if (card.abilities.includes("decoy") && card.row.length > 0) {
						if ((card.row === "close" && i === 3) || (card.row === "ranged" && i === 4) || (card.row === "siege" && i === 5) || (card.row === "agile" && i > 2 && i < 5) || (card.row === "melee_siege" && (i === 3 || i === 5)) || (card.row === "ranged_siege" && (i === 4 || i === 5))) {
							// Decoy requires units to swap with - if no units, row is not clickable
							if (units.length > 0) {
							r.elem.classList.add("row-selectable");
							alteraClicavel(r, true);
							units.forEach(c => c.elem.classList.remove("noclick"));
						} else {
								// No units in row - decoy cannot be played here
							r.elem.classList.add("noclick");
							r.special.elem.classList.add("noclick");
							r.elem.classList.remove("card-selectable");
						}
					} else {
							r.elem.classList.add("noclick");
							r.special.elem.classList.add("noclick");
							r.elem.classList.remove("card-selectable");
						}
					} else {
						// Decoy requires units to swap with - if no units, row is not clickable
						if (units.length > 0) {
						r.elem.classList.add("row-selectable");
						alteraClicavel(r, true);
						units.forEach(c => c.elem.classList.remove("noclick"));
						} else {
							// No units in row - decoy cannot be played here
							r.elem.classList.add("noclick");
							r.special.elem.classList.add("noclick");
							r.elem.classList.remove("card-selectable");
						}
					}
				}
			}
			return;
		}
		if (card.abilities.includes("carlo_varese")) {
			for (let i = 0; i < 3; ++i) {
				let r = board.row[i];
				if (r.isShielded() || !r.canBeScorched()) {
					r.elem.classList.add("noclick");
					r.special.elem.classList.add("noclick");
					r.elem.classList.remove("card-selectable");
				} else {
					r.elem.classList.add("row-selectable");
					alteraClicavel(r, true);
				}
			}
			return;
		}
		if (card.abilities.includes("meve_princess")) {
			// Meve Princess: automatically finds rows with 4+ cards and destroys one
			// This is handled in selectRow, not here in setSelectable
			// No row selection needed - ability activates automatically
			return;
		}
		if (card.abilities.includes("cyrus_hemmelfart")) {
			for (let i = 0; i < 3; ++i) {
				let r = board.row[i];
				if (r.containsCardByKey("spe_dimeritium_shackles") || r.isShielded()) {
					r.elem.classList.add("noclick");
					r.special.elem.classList.add("noclick");
					r.elem.classList.remove("card-selectable");
				} else {
					r.elem.classList.add("row-selectable");
					alteraClicavel(r, true);
				}
			}
			return;
		}
		let currRows = card.row === "agile" ? [board.getRow(card, "close", card.holder), board.getRow(card, "ranged", card.holder)] : 
			card.row === "melee_siege" ? [board.getRow(card, "close", card.holder), board.getRow(card, "siege", card.holder)] :
			card.row === "ranged_siege" ? [board.getRow(card, "ranged", card.holder), board.getRow(card, "siege", card.holder)] :
			card.row === "any" ? [board.getRow(card, "close", card.holder), board.getRow(card, "ranged", card.holder), board.getRow(card, "siege", card.holder)] : 
			[board.getRow(card, card.row, card.holder)];
		for (let i = 0; i < 6; i++) {
			let row = board.row[i];
			if (currRows.includes(row)) {
				row.elem.classList.add("row-selectable");
				if (card.row !== "agile" && card.row !== "any" && card.row !== "melee_siege" && card.row !== "ranged_siege") alteraClicavel(row, true);
				else fileira_clicavel = null;
			} else {
				row.elem.classList.add("noclick");
			}
		}
	}
}

class Carousel {
	constructor(container, count, action, predicate, bSort, bExit = false, title) {
		if (count <= 0 || !container || !action || container.cards.length === 0) return;
		this.container = container;
		this.count = count;
		this.action = action ? action : () => this.cancel();
		this.predicate = predicate;
		this.bSort = bSort;
		this.indices = [];
		this.index = 0;
		this.bExit = bExit;
		this.title = title;
		this.cancelled = false;
		this.selection = [];
		if (!Carousel.elem) {
			Carousel.elem = document.getElementById("carousel");
			Carousel.elem.children[0].addEventListener("click", () => Carousel.curr.cancel(), false);
			window.addEventListener("keydown", function (e) {
				if (e.keyCode == 81) {
					e.preventDefault();
					try {
						Carousel.curr.cancel();
					} catch (err) {}
				}
			});
		}
		this.elem = Carousel.elem;
		document.getElementsByTagName("main")[0].classList.remove("noclick");
		this.elem.children[0].classList.remove("noclick");
		this.previews = this.elem.getElementsByClassName("card-lg");
		this.desc = this.elem.getElementsByClassName("card-description")[0];
		this.title_elem = this.elem.children[2];
	}

	start() {
		if (!this.elem) return;
		this.indices = this.container.cards.reduce((a, c, i) => (!this.predicate || this.predicate(c)) ? a.concat([i]) : a, []);
		if (this.indices.length <= 0) return this.exit();
		if (this.bSort) this.indices.sort((a, b) => Card.compare(this.container.cards[a], this.container.cards[b]));
		this.update();
		Carousel.setCurrent(this);
		if (this.title) {
			this.title_elem.innerHTML = this.title;
			this.title_elem.classList.remove("hide");
		} else this.title_elem.classList.add("hide");
		this.elem.classList.remove("hide");
		ui.enablePlayer(true);
		tocar("explaining", false);
		// Enable mouse wheel navigation
		try {
			const wheelHandler = (e) => {
				e.preventDefault();
				const delta = e.deltaY || e.wheelDelta || 0;
				if (delta > 0) this.shift(e, 1);
				else if (delta < 0) this.shift(e, -1);
			};
			// Attach to the visible carousel content area
			this._wheelHandler = wheelHandler;
			this.elem.addEventListener('wheel', wheelHandler, { passive: false });
		} catch(_) {}
		
		// Enable touch/swipe navigation for mobile and tablet
		if (this.isTouchDevice()) {
			this.setupTouchHandlers();
		}
		
		fimC = false;
		setTimeout(function() {
			var label = document.getElementById("carousel_label");
			if (label.innerText.indexOf("redraw") > -1 && label.className.indexOf("hide") == -1) tocar("game_start", false);
		}, 50);
	}

	shift(event, n) {
		try {
			(event || window.event).stopPropagation();
		} catch (err) {}
		tocar("card", false);
		this.index = Math.max(0, Math.min(this.indices.length - 1, this.index + n));
		this.update();
	}

	async select(event) {
		try {
			(event || window.event).stopPropagation();
		} catch (err) {}
		if (this.selection.indexOf(this.indices[this.index]) < 0) {
			var label = document.getElementById("carousel_label");
			if (label.innerText.indexOf("redraw") > -1 && label.className.indexOf("hide") == -1) tocar("redraw", false);
			else this.selection.push(this.indices[this.index]);
			--this.count;
			if (this.isLastSelection()) this.elem.classList.add("hide");
			if (this.count <= 0) ui.enablePlayer(false);
			if (label.innerText.indexOf("redraw") > -1 && label.className.indexOf("hide") == -1) await this.action(this.container, this.indices[this.index]);
			if (this.isLastSelection() && !this.cancelled) {
				this.exit();
				this.selection.map(async s => await this.action(this.container, s));
				this.selection = [];
				return;
			}			
		} else {
			this.selection.splice(this.selection.indexOf(this.indices[this.index]), 1);
			this.count++;
		}
		this.update();
	}

	cancel() {
		if (!fimC) {
			fimC = true;
			tocar("discard", false);
			lCard = null;
			exibindo_lider = false;
			if (this.bExit) {
				this.cancelled = true;
				this.exit();
			}
			ui.enablePlayer(true);
		}
	}

	isLastSelection() {
		return this.count <= 0 || this.indices.length === 0;
	}

	update() {
		this.indices = this.container.cards.reduce((a, c, i) => (!this.predicate || this.predicate(c)) ? a.concat([i]) : a, []);
		for (var i = 0; i < this.container.cards.length; i++) {
			var aux = this.container.cards[i];
			var comparador = aux["key"];
			if (aux["id"] !== undefined) comparador += aux["id"];
			if (comparador == nova) {
				this.index = i;
				nova = "";
			}
		}
		if (this.index >= this.indices.length) this.index = this.indices.length - 1;
		for (let i = 0; i < this.previews.length; i++) {
			let curr = this.index - 2 + i;
			if (curr >= 0 && curr < this.indices.length) {
				let card = this.container.cards[this.indices[curr]];
				getPreviewElem(this.previews[i], card);
				this.previews[i].classList.remove("hide");
				this.previews[i].classList.remove("noclick");
				if (this.selection.indexOf(this.indices[curr]) >= 0) this.previews[i].classList.add("selection");
				else this.previews[i].classList.remove("selection");
			} else {
				this.previews[i].style.backgroundImage = "";
				this.previews[i].classList.add("hide");
				this.previews[i].classList.add("noclick");
				this.previews[i].classList.remove("selection");
			}
		}
		ui.setDescription(this.container.cards[this.indices[this.index]], this.desc);
	}

	isTouchDevice() {
		// Check if device supports touch events and is likely mobile/tablet
		return ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) &&
		       (window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches);
	}

	setupTouchHandlers() {
		let touchStartX = 0;
		let touchStartY = 0;
		let touchEndX = 0;
		let touchEndY = 0;
		let isHorizontalSwipe = false;
		const minSwipeDistance = 50; // Minimum distance in pixels to trigger a swipe

		const touchStartHandler = (e) => {
			const touch = e.touches[0];
			touchStartX = touch.clientX;
			touchStartY = touch.clientY;
			isHorizontalSwipe = false;
		};

		const touchMoveHandler = (e) => {
			if (e.touches.length === 1) {
				const touch = e.touches[0];
				const deltaX = Math.abs(touch.clientX - touchStartX);
				const deltaY = Math.abs(touch.clientY - touchStartY);
				
				// If horizontal movement is greater than vertical, treat as horizontal swipe
				// and prevent default to stop page scrolling
				if (deltaX > deltaY && deltaX > 10) {
					isHorizontalSwipe = true;
					e.preventDefault();
				}
			}
		};

		const touchEndHandler = (e) => {
			if (!e.changedTouches || e.changedTouches.length === 0) return;
			
			const touch = e.changedTouches[0];
			touchEndX = touch.clientX;
			touchEndY = touch.clientY;

			const deltaX = touchEndX - touchStartX;
			const deltaY = touchEndY - touchStartY;
			const absDeltaX = Math.abs(deltaX);
			const absDeltaY = Math.abs(deltaY);

			// Only trigger swipe if horizontal movement is greater than vertical (horizontal swipe)
			// and exceeds minimum distance
			if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
				if (deltaX > 0) {
					// Swipe right - go to previous card
					this.shift(e, -1);
				} else {
					// Swipe left - go to next card
					this.shift(e, 1);
				}
			}
		};

		// Store handlers for cleanup
		this._touchStartHandler = touchStartHandler;
		this._touchMoveHandler = touchMoveHandler;
		this._touchEndHandler = touchEndHandler;

		// Add event listeners to the carousel element
		this.elem.addEventListener('touchstart', touchStartHandler, { passive: true });
		this.elem.addEventListener('touchmove', touchMoveHandler, { passive: false });
		this.elem.addEventListener('touchend', touchEndHandler, { passive: true });
	}

	exit() {
		for (let x of this.previews) {
			x.style.backgroundImage = "";
			x.classList.remove("selection");
		}
		try { if (this._wheelHandler) this.elem.removeEventListener('wheel', this._wheelHandler); } catch(_) {}
		// Clean up touch handlers
		try {
			if (this._touchStartHandler) this.elem.removeEventListener('touchstart', this._touchStartHandler);
			if (this._touchMoveHandler) this.elem.removeEventListener('touchmove', this._touchMoveHandler);
			if (this._touchEndHandler) this.elem.removeEventListener('touchend', this._touchEndHandler);
		} catch(_) {}
		this.elem.classList.add("hide");
		Carousel.clearCurrent();
		ui.quitCarousel();
	}

	static setCurrent(curr) {
		this.curr = curr;
	}

	static clearCurrent() {
		this.curr = null;
	}
}

class Popup {
	constructor(yesName, yes, noName, no, header, description, aviso, apagarFim) {
		this.yes = yes ? yes : () => {};
		this.no = no ? no : () => {};
		this.apagarFim = apagarFim !== undefined ? apagarFim : false;
		this.elem = document.getElementById("popup");
		let main = this.elem.children[0];
		main.children[0].innerHTML = header ? header : "";
		main.children[1].innerHTML = description ? description : "";
		if (!aviso) {
			main.children[2].children[0].style = "";
			main.children[2].children[0].innerHTML = (yesName) ? yesName : "Yes";
			main.children[2].children[0].style.pointerEvents = "auto";
		} else {
			main.children[2].children[0].style.display = "none";
			main.children[2].children[0].style.pointerEvents = "none";
		}
		main.children[2].children[1].innerHTML = (noName) ? noName : "No";
		main.children[2].children[1].style.pointerEvents = "auto";
		main.children[2].children[1].style.display = "inline-block";
		main.children[2].children[1].style.cursor = "pointer";
		// Ensure popup is above everything and clickable
		this.elem.style.zIndex = "10000";
		this.elem.style.pointerEvents = "auto";
		main.style.pointerEvents = "auto";
		this.elem.classList.remove("hide");
		Popup.setCurrent(this);
		ui.enablePlayer(true);
	}

	static setCurrent(curr) {
		this.curr = curr;
	}

	static clearCurrent() {
		this.curr = null;
	}

	selectYes() {
		tocar("card", false);
		this.clear()
		this.yes();
		return true;
	}

	selectNo() {
		tocar("card", false);
		if (this.apagarFim) {
			document.getElementById("end-screen").style.opacity = 1;
			document.getElementById("end-screen").style.zIndex = 1000;
		}
		this.clear();
		this.no();
		if (this.apagarFim) document.getElementsByTagName("main")[0].classList.remove("noclick");
		return false;
	}

	clear() {
		ui.enablePlayer(false);
		this.elem.classList.add("hide");
		Popup.clearCurrent();
	}
}

class DeckMaker {
	constructor() {
		this.elem = document.getElementById("deck-customization");
		this.bank_elem = document.getElementById("card-bank");
		this.deck_elem = document.getElementById("card-deck");
		this.leader_elem = document.getElementById("card-leader");
		this.leader_elem.children[1].addEventListener("click", () => this.selectLeader(), false);
		this.leader_elem.children[1].addEventListener("mouseover", function() {
			tocar("card", false);
			this.style.boxShadow = "0 0 1.5vw #6d5210"
		});
		this.leader_elem.children[1].addEventListener("mouseout", function() {
			this.style.boxShadow = "0 0 0 #6d5210"
		});
		this.faction = "novigrad";
		this.setFaction(this.faction, true);
		// Find first novigrad deck, or use first deck as fallback
		let novigrad_deck = premade_deck.find(d => d.faction === "novigrad");
		let start_deck = novigrad_deck ? JSON.parse(JSON.stringify(novigrad_deck)) : JSON.parse(JSON.stringify(premade_deck[0]));
		if (start_deck.faction === this.faction) {
			start_deck.cards = start_deck.cards.map(c => ({
				index: c[0],
				count: c[1]
			}));
			this.me_deck_title = start_deck.title;
			this.setLeader(start_deck.leader);
		}
		this.makeBank(this.faction, null);
		this.start_op_deck;
		this.me_deck_index = 0;
		this.op_deck_index = 0;
		this.change_elem = document.getElementById("change-faction");
		if (this.change_elem) this.change_elem.addEventListener("click", () => this.selectFaction(), false);
		var el;
		el = document.getElementById("select-deck"); if (el) el.addEventListener("click", () => this.selectDeck(), false);
		el = document.getElementById("select-op-deck"); if (el) el.addEventListener("click", () => this.selectOPDeck(), false);
		el = document.getElementById("download-deck"); if (el) el.addEventListener("click", () => this.downloadDeck(), false);
		el = document.getElementById("add-file"); if (el) el.addEventListener("change", () => this.uploadDeck(), false);
		el = document.getElementById("save-deck"); if (el) el.addEventListener("click", () => this.saveDeck(), false);
		el = document.getElementById("load-deck"); if (el) el.addEventListener("click", () => this.loadSavedDeck(), false);
		el = document.getElementById("clear-deck"); if (el) el.addEventListener("click", () => this.clearDeck(), false);
		el = document.getElementById("randomize-deck"); if (el) el.addEventListener("click", () => this.randomizeDeck(), false);
		el = document.getElementById("card-search"); 
		if (el) {
			el.addEventListener("input", () => {
				this.filterCards();
				this.updateSearchClear();
			}, false);
		}
		el = document.getElementById("card-search-clear");
		if (el) {
			el.addEventListener("click", () => {
				const searchInput = document.getElementById("card-search");
				if (searchInput) {
					searchInput.value = "";
					this.filterCards();
					this.updateSearchClear();
					searchInput.focus();
				}
			}, false);
		}
		document.getElementById("start-game").addEventListener("click", async () => await this.startNewGame(false), false);
		document.getElementById("start-ai-game").addEventListener("click", async () => await this.startNewGame(true), false);
		window.addEventListener("keydown", function (e) {
			// Don't trigger shortcuts if user is typing in an input field
			const activeElement = document.activeElement;
			if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
				return;
			}
			
			if (document.getElementById("deck-customization").className.indexOf("hide") == -1) {
				switch(e.keyCode) {
					case 69:
						try {
							Carousel.curr.cancel();
						} catch(err) {}
						if (isLoaded && iniciou) dm.startNewGame();
						break;
					case 88:
						if (!lancado) dm.selectLeader();
						break;
				}
			}
		});
		somCarta();
		this.update();
		// Check if search field has text on initialization
		this.updateSearchClear();
	}

	async setFaction(faction_name, silent) {
		if (!silent && this.faction === faction_name)
			return false;
		if (!silent) {
			tocar("warning", false);
			if (!confirm("Changing factions will clear the current deck. Continue? ")) {
				tocar("warning", false);
				return false;
			}
		}
		this.elem.getElementsByTagName("h1")[0].innerHTML = factions[faction_name].name;
		this.elem.getElementsByTagName("h1")[0].style.backgroundImage = iconURL("deck_shield_" + faction_name);
		document.getElementById("faction-description").innerHTML = factions[faction_name].description;
		this.leaders =
			Object.keys(card_dict).map(cid => ({
				card: card_dict[cid],
				index: cid
			}))
			.filter(c => c.card.deck === faction_name && c.card.row === "leader");
		if (!this.leader || this.faction !== faction_name) {
			this.leader = this.leaders[0];
			getPreviewElem(this.leader_elem.children[1], this.leader.card)
		}
		this.faction = faction_name;
		setTimeout(function() {
			somCarta();
		}, 300);
		return true;
	}

	setLeader(index) {
		this.leader = this.leaders.filter(l => l.index == index)[0];
		if (!this.leader) {
			console.warn(`Leader with index "${index}" not found. Using first available leader.`);
			this.leader = this.leaders[0];
		}
		if (this.leader && this.leader.card) {
			getPreviewElem(this.leader_elem.children[1], this.leader.card);
		} else {
			console.error('No valid leader found. Leaders array:', this.leaders);
		}
	}

	makeBank(faction, deck) {
		this.clear();
		let cards = Object.keys(card_dict).map(cid => ({
			card: card_dict[cid],
			index: cid
		})).filter(p => {
			// Exclude scorch and decoy for Witchers faction
			if (faction === "witchers" && (p.index === "spe_scorch" || p.index === "spe_decoy")) {
				return false;
			}
			// For other factions, use original filter
			return (
				(
					[faction, "neutral", "weather", "special"].includes(p.card.deck) ||
					(["weather", "special"].includes(p.card.deck.split(" ")[0]) && p.card.deck.split(" ").includes(faction))
				) && p.card.row !== "leader"
			);
		});
		cards.sort(function (id1, id2) {
			let a = card_dict[id1.index],
				b = card_dict[id2.index];
			let c1 = {
				name: a.name,
				basePower: -a.strength,
				faction: a.deck.split(" ")[0]
			};
			let c2 = {
				name: b.name,
				basePower: -b.strength,
				faction: b.deck.split(" ")[0]
			};
			return Card.compare2(c1, c2);
		});
		let deckMap = {};
		if (deck) {
			for (let i of Object.keys(deck)) deckMap[deck[i].index] = deck[i].count;
		}
		cards.forEach(p => {
			let count = deckMap[p.index] !== undefined ? Number(deckMap[p.index]) : 0;
			this.makePreview(p.index, Number.parseInt(p.card.count) - count, this.bank_elem, this.bank, );
			this.makePreview(p.index, count, this.deck_elem, this.deck);
		});
		// Apply search filter if there's a search query
		this.filterCards();
	}

	makePreview(index, num, container_elem, cards) {
		let card_data = card_dict[index];
		let elem = document.createElement("div");
		elem.classList.add("card-lg");
		elem = getPreviewElem(elem, card_data, num);
		container_elem.appendChild(elem);
		let bankID = {
			index: index,
			count: num,
			elem: elem
		};
		let isBank = cards === this.bank;
		cards.push(bankID);
		let cardIndex = cards.length - 1;
		elem.addEventListener("dblclick", () => this.select(cardIndex, isBank), false);
		elem.addEventListener("mouseover", () => {
			var aux = this;

			carta_selecionada = function() {
				aux.select(cardIndex, isBank);
			}
		}, false);
		window.addEventListener("keydown", function (e) {
			if (e.keyCode == 13 && carta_selecionada !== null) carta_selecionada();
		});
		elem.addEventListener('contextmenu', async (e) => {
			e.preventDefault();
			let container = new CardContainer();
			container.cards = [new Card(index, card_data, null)];
			try {
				Carousel.curr.cancel();
			} catch (err) { }
			await ui.viewCardsInContainer(container);
		}, false);
		return bankID;
	}

	update() {
		for (let x of this.bank) {
			if (x.count) x.elem.classList.remove("hide");
			else x.elem.classList.add("hide");
		}
		let total = 0,
			units = 0,
			special = 0,
			strength = 0,
			hero = 0;
		for (let x of this.deck) {
			let card_data = card_dict[x.index];
			if (x.count) x.elem.classList.remove("hide");
			else x.elem.classList.add("hide");
			total += x.count;
			if (card_data.deck.startsWith("special") || card_data.deck.startsWith("weather")) {
				special += x.count;
				continue;
			}
			units += x.count;
			strength += card_data.strength * x.count;
			if (card_data.ability.split(" ").includes("hero")) hero += x.count;
		}
		this.stats = {
			total: total,
			units: units,
			special: special,
			strength: strength,
			hero: hero
		};
		this.updateStats();
		// Reapply search filter to preserve search query when cards are added/removed
		this.filterCards();
	}

	updateStats() {
		let stats = document.getElementById("deck-stats");
		stats.children[1].innerHTML = this.stats.total;
		stats.children[3].innerHTML = this.stats.units + (this.stats.units < 22 ? "/22" : "");
		stats.children[5].innerHTML = this.stats.special + "/10";
		stats.children[7].innerHTML = this.stats.strength;
		stats.children[9].innerHTML = this.stats.hero;
		stats.children[3].style.color = this.stats.units < 22 ? "red" : "";
		stats.children[5].style.color = (this.stats.special > 10) ? "red" : "";
	}

	updateSearchClear() {
		const searchInput = document.getElementById("card-search");
		const clearButton = document.getElementById("card-search-clear");
		if (searchInput && clearButton) {
			if (searchInput.value.trim().length > 0) {
				clearButton.style.display = "block";
			} else {
				clearButton.style.display = "none";
			}
		}
	}

	filterCards() {
		const searchInput = document.getElementById("card-search");
		if (!searchInput) return;
		
		const query = searchInput.value.trim().toLowerCase();
		
		// If search is empty, show all cards that have count > 0
		if (query === "") {
			for (let x of this.bank) {
				if (x.count) x.elem.classList.remove("hide");
				else x.elem.classList.add("hide");
			}
			return;
		}
		
		// Filter cards based on search query
		for (let x of this.bank) {
			if (!x.count) {
				x.elem.classList.add("hide");
				continue;
			}
			
			const card_data = card_dict[x.index];
			if (!card_data) {
				x.elem.classList.add("hide");
				continue;
			}
			
			// Check card name
			const cardName = (card_data.name || "").toLowerCase();
			let matches = cardName.includes(query);
			
			// Check abilities
			if (!matches && card_data.ability) {
				const abilities = card_data.ability.split(" ");
				for (let abi of abilities) {
					if (abi.toLowerCase().includes(query)) {
						matches = true;
						break;
					}
					// Check ability name from ability_dict
					if (ability_dict[abi] && ability_dict[abi].name) {
						if (ability_dict[abi].name.toLowerCase().includes(query)) {
							matches = true;
							break;
						}
					}
				}
			}
			
			// Check keywords
			if (!matches) {
				const lowerQuery = query.toLowerCase();
				// Check for unit/special/weather keywords
				if (lowerQuery === "unit" && card_data.row && card_data.row !== "leader" && !card_data.deck.startsWith("special") && !card_data.deck.startsWith("weather")) {
					matches = true;
				} else if (lowerQuery === "special" && card_data.deck.startsWith("special")) {
					matches = true;
				} else if (lowerQuery === "weather" && card_data.deck.startsWith("weather")) {
					matches = true;
				} else if (lowerQuery === "hero" && card_data.ability && card_data.ability.split(" ").includes("hero")) {
					matches = true;
				} else if (lowerQuery === "leader" && card_data.row === "leader") {
					matches = true;
				} else if (card_data.row && card_data.row.toLowerCase().includes(lowerQuery)) {
					matches = true;
				} else if (card_data.deck && card_data.deck.toLowerCase().includes(lowerQuery)) {
					matches = true;
				}
			}
			
			// Show or hide based on match
			if (matches) {
				x.elem.classList.remove("hide");
			} else {
				x.elem.classList.add("hide");
			}
		}
	}

	selectLeader() {
		let container = new CardContainer();
		container.cards = this.leaders.map(c => {
			let card = new Card(c.index, c.card, player_me);
			card.data = c;
			return card;
		});
		let index = this.leaders.indexOf(this.leader);
		ui.queueCarousel(container, 1, (c, i) => {
			let data = c.cards[i].data;
			this.leader = data;
			getPreviewElem(this.leader_elem.children[1], data.card);
		}, () => true, false, true);
		Carousel.curr.index = index;
		Carousel.curr.update();
	}

	selectFaction() {
		let container = new CardContainer();
		container.cards = Object.keys(factions).map(f => {
			return {
				abilities: [f],
				filename: f,
				desc_name: factions[f].name,
				desc: factions[f].description,
				faction: "faction"
			};
		});
		let index = container.cards.reduce((a, c, i) => c.filename === this.faction ? i : a, 0);
		ui.queueCarousel(container, 1, (c, i) => {
			let change = this.setFaction(c.cards[i].filename);
			if (!change) return;
			this.makeBank(c.cards[i].filename);
			this.update();
		}, () => true, false, true);
		Carousel.curr.index = index;
		Carousel.curr.update();
	}

	select(index, isBank) {
		carta_selecionada = null;
		if (isBank) {
			tocar("menu_buy", false);
			this.add(index, this.deck);
			this.remove(index, this.bank);
		} else {
			tocar("discard", false);
			this.add(index, this.bank);
			this.remove(index, this.deck);
		}
		this.update();
	}

	add(index, cards) {
		let id = cards[index];
		id.elem.getElementsByClassName("card-count")[0].innerHTML = ++id.count;
		id.elem.getElementsByClassName("card-count")[0].classList.remove("hide");
	}

	remove(index, cards) {
		let id = cards[index];
		id.elem.getElementsByClassName("card-count")[0].innerHTML = --id.count;
		if (id.count === 0) id.elem.getElementsByClassName("card-count")[0].classList.add("hide");
	}

	clear() {
		while (this.bank_elem.firstChild) this.bank_elem.removeChild(this.bank_elem.firstChild);
		while (this.deck_elem.firstChild) this.deck_elem.removeChild(this.deck_elem.firstChild);
		this.bank = [];
		this.deck = [];
		this.stats = {};
	}

	clearDeck() {
		// Move all cards from deck back to bank
		for (let i = 0; i < this.deck.length; i++) {
			const deckCard = this.deck[i];
			if (deckCard && deckCard.count > 0) {
				// Find the corresponding card in bank (same index)
				const bankCard = this.bank[i];
				if (bankCard && bankCard.index === deckCard.index) {
					// Return all copies to bank
					bankCard.count += deckCard.count;
					deckCard.count = 0;
					// Update bank card display
					if (bankCard.count > 0) {
						bankCard.elem.getElementsByClassName("card-count")[0].innerHTML = bankCard.count;
						bankCard.elem.getElementsByClassName("card-count")[0].classList.remove("hide");
						bankCard.elem.classList.remove("hide");
					}
					// Hide deck card element
					if (deckCard.elem) {
						deckCard.elem.classList.add("hide");
						if (deckCard.elem.getElementsByClassName("card-count")[0]) {
							deckCard.elem.getElementsByClassName("card-count")[0].innerHTML = 0;
							deckCard.elem.getElementsByClassName("card-count")[0].classList.add("hide");
						}
					}
				}
			}
		}
		
		// Update stats and UI
		this.update();
		
		// Play sound feedback
		tocar("card", false);
	}

	randomizeDeck() {
		// First clear the current deck
		this.clearDeck();
		
		// Separate available cards into units and specials
		const availableUnits = [];
		const availableSpecials = [];
		
		for (let i = 0; i < this.bank.length; i++) {
			const bankCard = this.bank[i];
			if (bankCard && bankCard.count > 0) {
				const cardData = card_dict[bankCard.index];
				if (cardData) {
					const isSpecial = cardData.deck.startsWith("special") || cardData.deck.startsWith("weather");
					if (isSpecial) {
						availableSpecials.push({
							index: i,
							bankCard: bankCard,
							maxCount: bankCard.count
						});
					} else {
						availableUnits.push({
							index: i,
							bankCard: bankCard,
							maxCount: bankCard.count
						});
					}
				}
			}
		}
		
		// Randomly select 22-25 unit cards
		const targetUnitCount = 22 + randomInt(4); // 22-25
		let selectedUnits = [];
		let unitCount = 0;
		
		// Shuffle available units
		const shuffledUnits = [...availableUnits].sort(() => Math.random() - 0.5);
		
		for (const unit of shuffledUnits) {
			if (unitCount >= targetUnitCount) break;
			
			// Randomly decide how many copies to add (1 to maxCount)
			const copiesToAdd = Math.min(
				unit.maxCount,
				1 + randomInt(Math.min(unit.maxCount, targetUnitCount - unitCount))
			);
			
			if (copiesToAdd > 0 && unitCount + copiesToAdd <= targetUnitCount + 3) {
				selectedUnits.push({
					index: unit.index,
					count: copiesToAdd
				});
				unitCount += copiesToAdd;
			}
		}
		
		// If we don't have enough units, try to add more
		if (unitCount < 22) {
			for (const unit of shuffledUnits) {
				if (unitCount >= 25) break;
				const existing = selectedUnits.find(u => u.index === unit.index);
				const currentCount = existing ? existing.count : 0;
				const maxAvailable = unit.maxCount - currentCount;
				
				if (maxAvailable > 0) {
					const needed = Math.min(25 - unitCount, maxAvailable);
					if (needed > 0) {
						if (existing) {
							existing.count += needed;
						} else {
							selectedUnits.push({
								index: unit.index,
								count: needed
							});
						}
						unitCount += needed;
					}
				}
			}
		}
		
		// Muster logic: If any selected unit has muster, add all other units with the same target
		const musterGroups = new Map(); // Map of target -> array of availableUnits with that target
		for (const unit of availableUnits) {
			const cardData = card_dict[unit.bankCard.index];
			if (cardData && cardData.ability && cardData.ability.includes("muster") && cardData.target) {
				if (!musterGroups.has(cardData.target)) {
					musterGroups.set(cardData.target, []);
				}
				musterGroups.get(cardData.target).push(unit);
			}
		}
		
		// Check selected units for muster and add their muster group
		for (const selection of selectedUnits) {
			const cardData = card_dict[this.bank[selection.index].index];
			if (cardData && cardData.ability && cardData.ability.includes("muster") && cardData.target) {
				const musterGroup = musterGroups.get(cardData.target);
				if (musterGroup) {
					for (const unit of musterGroup) {
						const existing = selectedUnits.find(u => u.index === unit.index);
						if (!existing) {
							// Add all copies of this muster unit
							const copiesToAdd = unit.maxCount;
							if (unitCount + copiesToAdd <= targetUnitCount + 5) { // Allow some overflow for muster
								selectedUnits.push({
									index: unit.index,
									count: copiesToAdd
								});
								unitCount += copiesToAdd;
							}
						}
					}
				}
			}
		}
		
		// Randomly select 0-5 special cards
		const targetSpecialCount = randomInt(6); // 0-5
		let selectedSpecials = [];
		let specialCount = 0;
		
		// Shuffle available specials
		const shuffledSpecials = [...availableSpecials].sort(() => Math.random() - 0.5);
		
		for (const special of shuffledSpecials) {
			if (specialCount >= targetSpecialCount) break;
			
			// Randomly decide how many copies to add (1 to maxCount)
			const copiesToAdd = Math.min(
				special.maxCount,
				1 + randomInt(Math.min(special.maxCount, targetSpecialCount - specialCount))
			);
			
			if (copiesToAdd > 0 && specialCount + copiesToAdd <= targetSpecialCount) {
				selectedSpecials.push({
					index: special.index,
					count: copiesToAdd
				});
				specialCount += copiesToAdd;
			}
		}
		
		// Toussaint + Nightfall logic: If Toussaint faction and nightfall was selected, ensure at least 1 hunger card
		let hasNightfall = false;
		for (const selection of selectedSpecials) {
			const cardData = card_dict[this.bank[selection.index].index];
			if (cardData && cardData.ability && cardData.ability.includes("nightfall")) {
				hasNightfall = true;
				break;
			}
		}
		
		if (this.faction === "toussaint" && hasNightfall) {
			// Find hunger cards in available specials
			const hungerCards = availableSpecials.filter(special => {
				const cardData = card_dict[this.bank[special.index].index];
				return cardData && cardData.ability && cardData.ability.includes("hunger");
			});
			
			// Check if any hunger card is already selected
			let hasHunger = false;
			for (const selection of selectedSpecials) {
				const cardData = card_dict[this.bank[selection.index].index];
				if (cardData && cardData.ability && cardData.ability.includes("hunger")) {
					hasHunger = true;
					break;
				}
			}
			
			// If no hunger card selected, add one
			if (!hasHunger && hungerCards.length > 0) {
				const hungerCard = hungerCards[0]; // Pick first available hunger card
				const existing = selectedSpecials.find(s => s.index === hungerCard.index);
				if (!existing) {
					const copiesToAdd = Math.min(hungerCard.maxCount, 1);
					selectedSpecials.push({
						index: hungerCard.index,
						count: copiesToAdd
					});
					specialCount += copiesToAdd;
				}
			}
		}
		
		// Add selected cards to deck
		const allSelected = [...selectedUnits, ...selectedSpecials];
		for (const selection of allSelected) {
			const bankCard = this.bank[selection.index];
			const deckCard = this.deck[selection.index];
			
			if (bankCard && deckCard) {
				// Move cards from bank to deck
				const actualCount = Math.min(selection.count, bankCard.count);
				bankCard.count -= actualCount;
				deckCard.count += actualCount;
				
				// Update bank card display
				if (bankCard.count > 0) {
					bankCard.elem.getElementsByClassName("card-count")[0].innerHTML = bankCard.count;
					bankCard.elem.getElementsByClassName("card-count")[0].classList.remove("hide");
				} else {
					bankCard.elem.getElementsByClassName("card-count")[0].classList.add("hide");
					bankCard.elem.classList.add("hide");
				}
				
				// Update deck card display
				if (deckCard.count > 0) {
					deckCard.elem.getElementsByClassName("card-count")[0].innerHTML = deckCard.count;
					deckCard.elem.getElementsByClassName("card-count")[0].classList.remove("hide");
					deckCard.elem.classList.remove("hide");
				}
			}
		}
		
		// Randomize leader
		if (this.leaders && this.leaders.length > 0) {
			const randomLeaderIndex = randomInt(this.leaders.length);
			const randomLeader = this.leaders[randomLeaderIndex];
			this.setLeader(randomLeader.index);
		}
		
		// Update stats and UI
		this.update();
		
		// Play sound feedback
		tocar("card", false);
	}

	/**
	 * Generate a random deck for the opponent with proper constraints
	 */
	generateRandomOpponentDeck() {
		// Randomly select a faction
		const factionKeys = Object.keys(factions);
		const randomFaction = factionKeys[randomInt(factionKeys.length)];
		
		console.log("[RANDOM OP DECK] Generating random deck for faction:", randomFaction);
		
		// Get all cards for this faction (including special, weather, and neutral cards)
		const factionCards = [];
		for (const cardKey in card_dict) {
			const cardData = card_dict[cardKey];
			if (!cardData) continue;
			
			// Include faction cards, neutral cards, and universal special/weather cards
			const deckValue = cardData.deck;
			const isFactionCard = deckValue === randomFaction;
			const isNeutral = deckValue === "neutral";
			
			// Universal special/weather cards (no faction tag) - available to all factions
			const isUniversalSpecial = deckValue === "special";
			const isUniversalWeather = deckValue === "weather";
			
			// Faction-specific special/weather cards (e.g., "special syndicate", "weather toussaint")
			// Only include if the faction matches
			const deckParts = deckValue.split(" ");
			const isFactionSpecial = deckParts[0] === "special" && deckParts.length > 1 && deckParts.includes(randomFaction);
			const isFactionWeather = deckParts[0] === "weather" && deckParts.length > 1 && deckParts.includes(randomFaction);
			
			if (isFactionCard || isNeutral || isUniversalSpecial || isUniversalWeather || isFactionSpecial || isFactionWeather) {
				factionCards.push({
					key: cardKey,
					data: cardData
				});
			}
		}
		
		// Separate into units and specials
		const availableUnits = [];
		const availableSpecials = [];
		
		for (const card of factionCards) {
			const isSpecial = card.data.deck.startsWith("special") || card.data.deck.startsWith("weather");
			const isLeader = card.data.row === "leader";
			
			if (isLeader) continue; // Skip leaders
			
			if (isSpecial) {
				availableSpecials.push(card);
			} else {
				availableUnits.push(card);
			}
		}
		
		// Randomly select 22-30 unit cards
		const targetUnitCount = 22 + randomInt(9); // 22-30
		let selectedUnits = [];
		let unitCount = 0;
		
		// Shuffle available units
		const shuffledUnits = [...availableUnits].sort(() => Math.random() - 0.5);
		
		// Track muster groups
		const musterGroups = new Map();
		for (const unit of availableUnits) {
			if (unit.data.ability && unit.data.ability.includes("muster") && unit.data.target) {
				if (!musterGroups.has(unit.data.target)) {
					musterGroups.set(unit.data.target, []);
				}
				musterGroups.get(unit.data.target).push(unit);
			}
		}
		
		// First pass: select units
		for (const unit of shuffledUnits) {
			if (unitCount >= targetUnitCount) break;
			
			// Get max count for this card
			const maxCount = parseInt(unit.data.count || "1", 10);
			const copiesToAdd = Math.min(
				maxCount,
				1 + randomInt(Math.min(maxCount, targetUnitCount - unitCount))
			);
			
			if (copiesToAdd > 0 && unitCount + copiesToAdd <= targetUnitCount + 5) {
				selectedUnits.push({
					key: unit.key,
					count: copiesToAdd
				});
				unitCount += copiesToAdd;
			}
		}
		
		// Ensure minimum unit count
		if (unitCount < 22) {
			for (const unit of shuffledUnits) {
				if (unitCount >= 30) break;
				const existing = selectedUnits.find(u => u.key === unit.key);
				const currentCount = existing ? existing.count : 0;
				const maxCount = parseInt(unit.data.count || "1", 10);
				const maxAvailable = maxCount - currentCount;
				
				if (maxAvailable > 0) {
					const needed = Math.min(30 - unitCount, maxAvailable);
					if (needed > 0) {
						if (existing) {
							existing.count += needed;
						} else {
							selectedUnits.push({
								key: unit.key,
								count: needed
							});
						}
						unitCount += needed;
					}
				}
			}
		}
		
		// Muster logic: If any selected unit has muster, add ALL units with the same target
		for (const selection of selectedUnits) {
			const cardData = card_dict[selection.key];
			if (cardData && cardData.ability && cardData.ability.includes("muster") && cardData.target) {
				const musterGroup = musterGroups.get(cardData.target);
				if (musterGroup) {
					for (const unit of musterGroup) {
						const existing = selectedUnits.find(u => u.key === unit.key);
						if (!existing) {
							// Add ALL copies of this muster unit
							const maxCount = parseInt(unit.data.count || "1", 10);
							if (unitCount + maxCount <= targetUnitCount + 10) { // Allow overflow for muster
								selectedUnits.push({
									key: unit.key,
									count: maxCount
								});
								unitCount += maxCount;
							}
						}
					}
				}
			}
		}
		
		// Faction-specific requirements
		if (randomFaction === "zerrikania") {
			// Ensure at least 3 worshipper units and at least 1 worshipped unit
			const worshippers = availableUnits.filter(u => 
				u.data.ability && u.data.ability.includes("worshipper")
			);
			const worshipped = availableUnits.filter(u => 
				u.data.ability && u.data.ability.includes("worshipped")
			);
			
			// Add worshippers
			let worshipperCount = selectedUnits.filter(u => {
				const cardData = card_dict[u.key];
				return cardData && cardData.ability && cardData.ability.includes("worshipper");
			}).reduce((sum, u) => sum + u.count, 0);
			
			if (worshipperCount < 3 && worshippers.length > 0) {
				const needed = 3 - worshipperCount;
				for (let i = 0; i < needed && i < worshippers.length; i++) {
					const worshipper = worshippers[i];
					const existing = selectedUnits.find(u => u.key === worshipper.key);
					if (!existing) {
						const maxCount = parseInt(worshipper.data.count || "1", 10);
						const toAdd = Math.min(maxCount, needed - worshipperCount);
						selectedUnits.push({
							key: worshipper.key,
							count: toAdd
						});
						unitCount += toAdd;
						worshipperCount += toAdd;
					}
				}
			}
			
			// Add worshipped
			let worshippedCount = selectedUnits.filter(u => {
				const cardData = card_dict[u.key];
				return cardData && cardData.ability && cardData.ability.includes("worshipped");
			}).reduce((sum, u) => sum + u.count, 0);
			
			if (worshippedCount < 1 && worshipped.length > 0) {
				const worshippedUnit = worshipped[0];
				const existing = selectedUnits.find(u => u.key === worshippedUnit.key);
				if (!existing) {
					const maxCount = parseInt(worshippedUnit.data.count || "1", 10);
					selectedUnits.push({
						key: worshippedUnit.key,
						count: Math.min(maxCount, 1)
					});
					unitCount += Math.min(maxCount, 1);
				}
			}
		}
		
		// Randomly select 0-7 special cards
		const targetSpecialCount = randomInt(8); // 0-7
		let selectedSpecials = [];
		let specialCount = 0;
		
		const shuffledSpecials = [...availableSpecials].sort(() => Math.random() - 0.5);
		
		for (const special of shuffledSpecials) {
			if (specialCount >= targetSpecialCount) break;
			
			const maxCount = parseInt(special.data.count || "1", 10);
			const copiesToAdd = Math.min(
				maxCount,
				1 + randomInt(Math.min(maxCount, targetSpecialCount - specialCount))
			);
			
			if (copiesToAdd > 0 && specialCount + copiesToAdd <= targetSpecialCount) {
				selectedSpecials.push({
					key: special.key,
					count: copiesToAdd
				});
				specialCount += copiesToAdd;
			}
		}
		
		// Witchers requirements: at least 2 sign cards
		if (randomFaction === "witchers") {
			// Count sign cards already selected
			let signCount = selectedSpecials.filter(s => {
				const cardData = card_dict[s.key];
				return cardData && (s.key.startsWith("spe_sign_") || 
					(cardData.ability && cardData.ability.startsWith("sign_")));
			}).reduce((sum, s) => sum + s.count, 0);
			
			if (signCount < 2) {
				const signCards = availableSpecials.filter(s => {
					const cardData = card_dict[s.key];
					return cardData && (s.key.startsWith("spe_sign_") || 
						(cardData.ability && cardData.ability.startsWith("sign_")));
				});
				
				// Shuffle sign cards to add variety
				const shuffledSigns = [...signCards].sort(() => Math.random() - 0.5);
				
				const needed = 2 - signCount;
				for (let i = 0; i < needed && i < shuffledSigns.length; i++) {
					const sign = shuffledSigns[i];
					const existing = selectedSpecials.find(s => s.key === sign.key);
					if (!existing) {
						const maxCount = parseInt(sign.data.count || "1", 10);
						const toAdd = Math.min(maxCount, needed - signCount);
						selectedSpecials.push({
							key: sign.key,
							count: toAdd
						});
						specialCount += toAdd;
						signCount += toAdd;
					} else {
						// Add more copies if needed
						const maxCount = parseInt(sign.data.count || "1", 10);
						const available = maxCount - existing.count;
						if (available > 0) {
							const toAdd = Math.min(available, needed - signCount);
							existing.count += toAdd;
							specialCount += toAdd;
							signCount += toAdd;
						}
					}
				}
			}
		}
		
		// Toussaint requirements: at least 1 nightfall and at least 2 hunger cards
		if (randomFaction === "toussaint") {
			// Check for nightfall
			let hasNightfall = selectedSpecials.some(s => {
				const cardData = card_dict[s.key];
				return cardData && cardData.ability && cardData.ability.includes("nightfall");
			});
			
			if (!hasNightfall) {
				const nightfallCards = availableSpecials.filter(s => {
					const cardData = card_dict[s.key];
					return cardData && cardData.ability && cardData.ability.includes("nightfall");
				});
				
				if (nightfallCards.length > 0) {
					const nightfall = nightfallCards[0];
					const maxCount = parseInt(nightfall.data.count || "1", 10);
					selectedSpecials.push({
						key: nightfall.key,
						count: Math.min(maxCount, 1)
					});
					specialCount += Math.min(maxCount, 1);
				}
			}
			
			// Check for hunger cards (hunger cards are UNITS, not specials)
			let hungerCount = selectedUnits.filter(u => {
				const cardData = card_dict[u.key];
				return cardData && cardData.ability && cardData.ability.includes("hunger");
			}).reduce((sum, u) => sum + u.count, 0);
			
			if (hungerCount < 2) {
				const hungerCards = availableUnits.filter(u => {
					const cardData = card_dict[u.key];
					return cardData && cardData.ability && cardData.ability.includes("hunger");
				});
				
				const needed = 2 - hungerCount;
				for (let i = 0; i < needed && i < hungerCards.length; i++) {
					const hunger = hungerCards[i];
					const existing = selectedUnits.find(u => u.key === hunger.key);
					if (!existing) {
						const maxCount = parseInt(hunger.data.count || "1", 10);
						const toAdd = Math.min(maxCount, needed - hungerCount);
						selectedUnits.push({
							key: hunger.key,
							count: toAdd
						});
						unitCount += toAdd;
						hungerCount += toAdd;
					}
				}
			}
		}
		
		// Ofir requirements: at least 1 merchant or slave trader
		if (randomFaction === "ofir") {
			let hasMerchantOrSlave = selectedUnits.some(u => {
				const cardData = card_dict[u.key];
				if (!cardData) return false;
				// Check ability for merchant or slave_trader
				if (cardData.ability) {
					if (cardData.ability.includes("merchant") || cardData.ability.includes("slave_trader") || 
						cardData.ability.includes("ofir_aamad_merchant")) {
						return true;
					}
				}
				// Check name for merchant or slave/trader keywords
				const nameLower = (cardData.name || "").toLowerCase();
				if (nameLower.includes("merchant") || nameLower.includes("slave") || nameLower.includes("trader")) {
					return true;
				}
				return false;
			});
			
			if (!hasMerchantOrSlave) {
				const merchantCards = availableUnits.filter(u => {
					const cardData = card_dict[u.key];
					if (!cardData) return false;
					// Check ability for merchant or slave_trader
					if (cardData.ability) {
						if (cardData.ability.includes("merchant") || cardData.ability.includes("slave_trader") ||
							cardData.ability.includes("ofir_aamad_merchant")) {
							return true;
						}
					}
					// Check name for merchant or slave/trader keywords
					const nameLower = (cardData.name || "").toLowerCase();
					if (nameLower.includes("merchant") || nameLower.includes("slave") || nameLower.includes("trader")) {
						return true;
					}
					return false;
				});
				
				if (merchantCards.length > 0) {
					const merchant = merchantCards[0];
					const existing = selectedUnits.find(u => u.key === merchant.key);
					if (!existing) {
						const maxCount = parseInt(merchant.data.count || "1", 10);
						selectedUnits.push({
							key: merchant.key,
							count: Math.min(maxCount, 1)
						});
						unitCount += Math.min(maxCount, 1);
					}
				}
			}
		}
		
		// Randomly select a leader
		const leaders = Object.keys(card_dict).map(cid => {
			return {
				index: cid,
				card: card_dict[cid]
			};
		}).filter(c => c.card && c.card.row === "leader" && c.card.deck === randomFaction);
		
		let selectedLeader = null;
		if (leaders.length > 0) {
			selectedLeader = leaders[randomInt(leaders.length)];
		}
		
		// Build the deck object
		// Use just the faction name as the title (no "Random" prefix)
		const deck = {
			faction: randomFaction,
			leader: selectedLeader, // Object with {index, card} or null
			cards: [...selectedUnits, ...selectedSpecials].map(c => ({
				index: c.key,
				count: c.count
			})),
			title: factions[randomFaction].name
		};
		
		console.log("[RANDOM OP DECK] Generated deck:", deck.faction, "with", deck.cards.length, "unique cards,", 
			deck.cards.reduce((sum, c) => sum + c.count, 0), "total cards");
		
		return deck;
	}

	async startNewGame(fullAI = false) {
		if (fullAI) document.getElementsByTagName("main")[0].classList.add("noclick");
		game.fullAI = fullAI;
		openFullscreen();
		let warning = "";
		if (this.stats.units < 22) warning += "Your deck must have at least 22 unit cards. \n";
		if (this.stats.special > 10) warning += "Your deck must have no more than 10 special cards. \n";
		if (warning != "") return aviso("Warning", warning);
		
		// Wait for deck loader to be ready
		if (window.deckLoader && !window.deckLoader.isReady()) {
			await window.deckLoader.initialize();
		}
		
		// Convert deck array to proper format for game initialization
		// Filter out cards with 0 count and ensure proper structure
		console.log("[DECK DEBUG] Raw deck array length:", this.deck ? this.deck.length : 0);
		console.log("[DECK DEBUG] Raw deck array:", this.deck);
		
		if (!this.deck || this.deck.length === 0) {
			console.error("[DECK DEBUG] ERROR: Deck array is empty or undefined!");
			return aviso("Error", "Your deck is empty. Please add cards to your deck before starting a game.");
		}
		
		const deckCards = this.deck
			.filter(x => {
				if (!x) {
					console.warn("[DECK DEBUG] Found null/undefined entry in deck array");
					return false;
				}
				if (!x.index) {
					console.warn("[DECK DEBUG] Found entry without index:", x);
					return false;
				}
				if (x.count <= 0) {
					return false;
				}
				// Check if card exists in card_dict
				if (!card_dict[x.index]) {
					console.warn("[DECK DEBUG] Card not found in card_dict:", x.index);
					return false;
				}
				return true;
			})
			.map(x => ({
				index: x.index,
				count: x.count
			}));
		
		console.log("[DECK DEBUG] Total cards in deck array:", this.deck.length);
		console.log("[DECK DEBUG] Cards with count > 0:", deckCards.length);
		console.log("[DECK DEBUG] Deck cards:", deckCards);
		
		if (deckCards.length === 0) {
			console.error("[DECK DEBUG] ERROR: No valid cards found in deck!");
			return aviso("Error", "Your deck contains no valid cards. Please check your deck and try again.");
		}
		
		// Ensure leader has proper structure
		if (!this.leader || !this.leader.index) {
			console.error("[DECK DEBUG] Invalid leader structure:", this.leader);
		}
		
		let me_deck = {
			faction: this.faction,
			leader: this.leader ? {
				index: this.leader.index,
				card: this.leader.card
			} : null,
			cards: deckCards,
			title: this.me_deck_title
		};
		
		console.log("[DECK DEBUG] Final me_deck structure:", {
			faction: me_deck.faction,
			leaderIndex: me_deck.leader?.index,
			cardCount: me_deck.cards.length,
			totalCardCount: me_deck.cards.reduce((sum, c) => sum + (c.count || 0), 0)
		});
		if (game.randomOPDeck || !this.start_op_deck) {
			// Generate a random deck using the same logic as player randomize deck
			this.start_op_deck = this.generateRandomOpponentDeck();
			
			// Filter out invalid cards that don't exist in card_dict (safety check)
			const originalCardCount = this.start_op_deck.cards.length;
			this.start_op_deck.cards = this.start_op_deck.cards.filter(c => {
				if (!c || !c.index) {
					console.warn("[OP DECK] Filtering out card with missing index:", c);
					return false;
				}
				if (!card_dict[c.index]) {
					console.warn("[OP DECK] Filtering out invalid card (not found in card_dict):", c.index);
					return false;
				}
				return true;
			});
			
			if (this.start_op_deck.cards.length < originalCardCount) {
				console.warn(`[OP DECK] Filtered out ${originalCardCount - this.start_op_deck.cards.length} invalid cards from opponent deck`);
			}
			
			// Ensure leader is set (should already be set by generateRandomOpponentDeck, but verify)
			if (!this.start_op_deck.leader) {
				let leaders = Object.keys(card_dict).map(cid => {
					return {
						index: cid,
						card: card_dict[cid]
					};
				}).filter(c => c.card && c.card.row === "leader" && c.card.deck === this.start_op_deck.faction);
				
				if (leaders.length > 0) {
					this.start_op_deck.leader = leaders[randomInt(leaders.length)];
				} else {
					console.error("[OP DECK] No leaders available for faction:", this.start_op_deck.faction);
					// Ultimate fallback: use any leader
					const allLeaders = Object.keys(card_dict).map(cid => {
						return {
							index: cid,
							card: card_dict[cid]
						};
					}).filter(c => c.card && c.card.row === "leader");
					if (allLeaders.length > 0) {
						this.start_op_deck.leader = allLeaders[randomInt(allLeaders.length)];
					}
				}
			}
		} else {
			// Even if start_op_deck is already set, filter out invalid cards
			if (this.start_op_deck.cards) {
				const originalCardCount = this.start_op_deck.cards.length;
				this.start_op_deck.cards = this.start_op_deck.cards.filter(c => {
					if (!c || !c.index) {
						console.warn("[OP DECK] Filtering out card with missing index:", c);
						return false;
					}
					if (!card_dict[c.index]) {
						console.warn("[OP DECK] Filtering out invalid card (not found in card_dict):", c.index);
						return false;
					}
					return true;
				});
				
				if (this.start_op_deck.cards.length < originalCardCount) {
					console.warn(`[OP DECK] Filtered out ${originalCardCount - this.start_op_deck.cards.length} invalid cards from opponent deck`);
				}
			}
		}
		if (game.fullAI) {
			player_me = new Player(0, "Player 1", me_deck, true);
			player_op = new Player(1, "Player 2", this.start_op_deck, true);
		} else {
			player_me = new Player(0, "Player 1", me_deck, false);
			player_op = new Player(1, "Player 2", this.start_op_deck, true);
		}
		this.elem.classList.add("hide");
		tocar("game_opening", false);
		game.startGame();
	}

	deckToJSON() {
		let obj = {
			faction: this.faction,
			leader: this.leader.index,
			cards: this.deck.filter(x => x.count > 0).map(x => [x.index, x.count])
		};
		return JSON.stringify(obj);
	}

	selectDeck() {
		let container = new CardContainer();
		container.cards = Object.values(premade_deck).map(d => {
			let deck = d;
			return {
				abilities: [deck["faction"]],
				name: card_dict[deck["leader"]]["name"],
				row: "leader",
				filename: card_dict[deck["leader"]]["filename"],
				desc_name: deck["title"],
				desc: "<p>" +
						"<b>Faction ability:</b> " +
						factions[deck["faction"]]["description"] +
					"</p>" +
					"<p>" +
						"<b>Leader ability:</b> " +
						ability_dict[card_dict[deck["leader"]]["ability"]].description + 
					"</p>" +
					"<p>" +
						"<b>Deck description:</b> " +
						deck["description"],
				faction: deck["faction"]
			};
		});
		let index = container.cards.reduce((a, c, i) => c.faction === this.faction ? i : a, 0);
		ui.queueCarousel(container, 1, (c, i) => {
			this.me_deck_index = i;
			this.setFaction(c.cards[i].faction,true);
			this.deckFromJSON(premade_deck[i],false);
		}, () => true, false, true);
		Carousel.curr.index = this.me_deck_index;
		Carousel.curr.update();
	}

	selectOPDeck() {
		let container = new CardContainer();
		container.cards = [{
			abilities: [],
			name: "Random deck",
			row: "faction",
			filename: "random",
			desc_name: "Random deck",
			desc: "A random deck from the pool that will change every game.",
			faction: "faction"
		}];
		
		// Use deck loader if available, otherwise fall back to original logic
		let availableDecks = [];
		if (window.deckLoader && window.deckLoader.isReady()) {
			availableDecks = window.deckLoader.getAllDecks();
		} else {
			availableDecks = Object.values(premade_deck);
		}
		
		container.cards = container.cards.concat(availableDecks.map(d => {
			let deck = d;
			const leaderCard = card_dict[deck["leader"]];
			if (!leaderCard) {
				console.warn(`Leader "${deck["leader"]}" not found in card_dict for deck "${deck["title"]}"`);
			return {
				abilities: [deck["faction"]],
					name: deck["leader"] || "Unknown Leader",
				row: "leader",
					filename: "",
				desc_name: deck["title"],
				desc: "<p>" +
						"<b>Faction ability:</b> " +
							(factions[deck["faction"]] ? factions[deck["faction"]]["description"] : "Unknown") +
						"</p>" +
						"<p>" +
							"<b>Leader ability:</b> Unknown (leader card not found)" +
						"</p>" +
						"<p>" +
							"<b>Deck description:</b> " +
							(deck["description"] || "No description"),
					faction: deck["faction"]
				};
			}
			const leaderAbility = leaderCard["ability"];
			const abilityDesc = ability_dict[leaderAbility] ? ability_dict[leaderAbility].description : "Unknown ability";
			return {
				abilities: [deck["faction"]],
				name: leaderCard["name"] || deck["leader"],
				row: "leader",
				filename: leaderCard["filename"] || "",
				desc_name: deck["title"],
				desc: "<p>" +
						"<b>Faction ability:</b> " +
						(factions[deck["faction"]] ? factions[deck["faction"]]["description"] : "Unknown") +
					"</p>" +
					"<p>" +
						"<b>Leader ability:</b> " +
						abilityDesc + 
					"</p>" +
					"<p>" +
						"<b>Deck description:</b> " +
						(deck["description"] || "No description"),
				faction: deck["faction"]
			};
		}));
		ui.queueCarousel(container, 1, (c, i) => {
			this.op_deck_index = i;
			if (i === 0) {
				game.randomOPDeck = true;
				this.start_op_deck = null; // Clear any previously selected deck
				document.getElementById("op-deck-name").innerHTML = "Random deck";
			} else {
				this.start_op_deck = JSON.parse(JSON.stringify(availableDecks[i - 1]));
				this.start_op_deck.cards = this.start_op_deck.cards.map(c => ({
					index: c[0],
					count: c[1]
				}));
				this.start_op_deck.leader = {
					index: this.start_op_deck.leader,
					card: card_dict[this.start_op_deck.leader]
				};
				document.getElementById("op-deck-name").innerHTML = availableDecks[i - 1]["title"];
				game.randomOPDeck = false;
			}
		}, () => true, false, true);
		Carousel.curr.index = this.op_deck_index;
		Carousel.curr.update();
	}

	downloadDeck() {
		let json = this.deckToJSON();
		let str = "data:text/json;charset=utf-8," + encodeURIComponent(json);
		let hidden_elem = document.getElementById('download-json');
		hidden_elem.href = str;
		hidden_elem.download = "MyGwentDeck.json";
		hidden_elem.click();
	}

	uploadDeck() {
		let files = document.getElementById("add-file").files;
		if (files.length <= 0) return false;
		let fr = new FileReader();
		fr.onload = e => {
			try {
				this.deckFromJSON(e.target.result,true);
			} catch (e) {
				aviso("Warning", "Uploaded deck is not formatted correctly!");
			}
		}
		fr.readAsText(files.item(0));
		document.getElementById("add-file").value = "";
		openFullscreen();
	}

	// Save current deck to decks/saveddecks/ directory
	saveDeck() {
        // Show name input using in-game Popup, support Enter to confirm
        let def = this.me_deck_title || ((factions[this.faction] ? factions[this.faction].name : "Deck") + " Deck");
        let html = "<label for='deck-name-input'>Enter deck name:</label><br>" +
            "<input id='deck-name-input' type='text' value='" + def.replace(/\"/g, '&quot;') + "' style='width:90%; margin-top:.5vw'>";
        const self = this;
        async function doSave() {
            try {
                const input = document.getElementById('deck-name-input');
                const name = (input ? input.value.trim() : def) || def;
                const json = JSON.parse(self.deckToJSON());
                json.title = name;
                
                // Create safe filename from title
                const safeFilename = name.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '') + '.json';
                const filePath = `decks/saveddecks/${safeFilename}`;
                
                // Save to file if deckAPI is available (Electron), otherwise fallback to localStorage
                if (window.deckAPI) {
                    try {
                        await window.deckAPI.writeFile(filePath, JSON.stringify(json, null, 2));
                        self.me_deck_title = name;
                        aviso("Saved", "Deck saved as '" + name + "'.");
                    } catch (fileError) {
                        console.error('Error saving to file:', fileError);
                        // Fallback to localStorage
                let saved = [];
                try { saved = JSON.parse(localStorage.getItem('playerdecks') || '[]'); } catch(e) { saved = []; }
                const filtered = saved.filter(d => d.title !== name);
                        filtered.push(json);
                        localStorage.setItem('playerdecks', JSON.stringify(filtered));
                        self.me_deck_title = name;
                        aviso("Saved", "Deck saved as '" + name + "' (localStorage fallback).");
                    }
                } else {
                    // Browser fallback: use localStorage
                    let saved = [];
                    try { saved = JSON.parse(localStorage.getItem('playerdecks') || '[]'); } catch(e) { saved = []; }
                    const filtered = saved.filter(d => d.title !== name);
                filtered.push(json);
                localStorage.setItem('playerdecks', JSON.stringify(filtered));
                self.me_deck_title = name;
                aviso("Saved", "Deck saved as '" + name + "'.");
                }
            } catch (e) {
                console.error(e);
                aviso("Error", "Could not save deck.");
            }
        }
        new Popup(
            "Save",
            doSave,
            "Cancel",
            function() {},
            "Save Deck",
            html,
            false,
            false
        );
        setTimeout(function(){
            try {
                const input = document.getElementById('deck-name-input');
                if (input) {
                    input.focus();
                    input.select();
                    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); Popup.curr && Popup.curr.clear(); doSave(); } });
                }
            } catch(e) {}
        }, 0);
	}

	// Load a deck from decks/saveddecks/ directory
	async loadSavedDeck() {
		let saved = [];
		
		// Try loading from file system first (Electron)
		if (window.deckAPI) {
			try {
				const files = await window.deckAPI.listFiles('decks/saveddecks');
				for (const file of files) {
					try {
						const content = await window.deckAPI.readFile(file.path);
						const deck = JSON.parse(content);
						saved.push(deck);
					} catch (e) {
						console.warn('Error loading deck file:', file.path, e);
					}
				}
			} catch (e) {
				console.warn('Error listing saved decks:', e);
			}
		}
		
		// Fallback to localStorage if no files found or in browser
		if (saved.length === 0) {
		try { saved = JSON.parse(localStorage.getItem('playerdecks') || '[]'); } catch(e) { saved = []; }
		}
		
		if (!saved.length) return aviso("No Saved Decks", "You don't have any saved decks yet.");
		// Build simple modal list (yellow items + delete X per row)
		function buildListHTML(items) {
			return "<div id='saved-decks-list' style='max-height:52vh; overflow:auto; text-align:left; min-width:54vw;'>" +
				items.map((d, i) => {
					let fac = factions[d.faction]?.name || d.faction;
					let leader = card_dict[d.leader] || {};
					let leaderName = leader.name || 'Leader';
					let faction = leader.deck ? leader.deck.split(' ')[0] : d.faction;
					let leaderImg = smallURL(faction + "_" + (leader.filename || ''));
					return "<div class=\"deck-load-row\" style=\"display:grid; grid-template-columns: 3.2vw 1fr auto; align-items:center; gap:.6vw; margin:.35vw 0;\">" +
						"<div class=\"deck-leader-thumb\" style=\"width:3.2vw; height:3.2vw; border-radius:.3vw; background-size:cover; background-position:center; border:.12vw solid rgba(255,210,77,.35);\"></div>" +
						"<button class=\"deck-load-item\" data-idx=\"" + i + "\" style=\"display:block; padding:.45vw .7vw; background:transparent; border:.15vw solid rgba(255,210,77,.35); color:#ffd24d; text-align:left;\">" +
							"<div style=\"font-weight:bold;\">" + (d.title || 'Saved Deck') + "</div>" +
							"<div style=\"font-size:.9em; color:#ffd24d99;\">(" + fac + ") — Leader: " + leaderName + "</div>" +
						"</button>" +
						"<button class=\"deck-del-item\" data-idx=\"" + i + "\" title=\"Delete\" style=\"width:2.2vw; min-width:2.2vw; height:2.2vw; background:transparent; color:#ff6b6b; border:.15vw solid rgba(255,107,107,.4); font-weight:bold;\">✕</button>" +
					"</div>" +
					"<script>document.currentScript.previousElementSibling.querySelector('.deck-leader-thumb').style.backgroundImage=\"" + leaderImg + "\";<\/script>";
				}).join("") +
			"</div>";
		}
		let html = buildListHTML(saved);
		let self = this;
		new Popup(
			"",
			null,
			"Close",
			function() {},
			"Load Deck",
			html,
			true,
			false
		);
		setTimeout(function(){
			// Enlarge popup container to encompass the list
			try {
				var pop = document.getElementById('popup').children[0];
				pop.style.width = '62vw';
				pop.style.maxWidth = 'none';
			} catch(e) {}
			function bindHandlers() {
				let loadBtns = document.querySelectorAll('.deck-load-item');
				loadBtns.forEach(btn => {
					btn.addEventListener('click', function(){
						let idx = Number(this.getAttribute('data-idx'));
						let deck = saved[idx];
						if (!deck) return;
						self.deckFromJSON(JSON.stringify(deck), true);
						self.me_deck_title = deck.title;
						try { Popup.curr && Popup.curr.clear(); } catch(e) {}
					});
				});
				let delBtns = document.querySelectorAll('.deck-del-item');
				delBtns.forEach(btn => {
					btn.addEventListener('click', function(e){
						e.stopPropagation();
						let idx = Number(this.getAttribute('data-idx'));
						let deck = saved[idx];
						if (!deck) return;
						new Popup(
							"Yes",
							async function(){
								const deckToDelete = saved[idx];
								saved.splice(idx,1);
								
								// Delete from file system if deckAPI is available
								if (window.deckAPI && deckToDelete.title) {
									try {
										const safeFilename = deckToDelete.title.toLowerCase()
											.replace(/[^a-z0-9]+/g, '_')
											.replace(/^_+|_+$/g, '') + '.json';
										await window.deckAPI.deleteFile(`decks/saveddecks/${safeFilename}`);
									} catch (e) {
										console.warn('Error deleting deck file:', e);
									}
								}
								
								// Also update localStorage as fallback
								try {
								localStorage.setItem('playerdecks', JSON.stringify(saved));
								} catch (e) {}
								
								// re-render list in-place
								let container = document.getElementById('saved-decks-list');
								if (container) {
									container.outerHTML = buildListHTML(saved);
									setTimeout(bindHandlers, 0);
								}
							},
							"No",
							function(){},
							"Delete Deck",
							"Are you sure you want to delete '<b>" + (deck.title || 'Saved Deck') + "</b>'?",
							false,
							false
						);
					});
				});
			}
			bindHandlers();
		}, 0);
	}

	deckFromJSON(json,parse) {
		let deck;
		if (parse) {
			try {
				deck = JSON.parse(json);
			} catch (e) {
				aviso("Warning", "Uploaded deck is not parsable!");
				return;
			}
		} else deck = JSON.parse(JSON.stringify(json));
		let warning = "";
		if (card_dict[deck.leader].row !== "leader") warning += "'" + card_dict[deck.leader].name + "' is cannot be used as a leader\n";
		if (deck.faction != card_dict[deck.leader].deck) warning += "Leader '" + card_dict[deck.leader].name + "' doesn't match deck faction '" + deck.faction + "'.\n";
		let cards = deck.cards.filter(c => {
			let card = card_dict[c[0]];
			if (!card) {
				warning += "ID " + c[0] + " does not correspond to a card.\n";
				return false
			}
			if (!(
				[deck.faction, "neutral", "special", "weather"].includes(card.deck) ||
				(["special", "weather"].includes(card.deck.split(" ")[0]) && card.deck.split(" ").includes(deck.faction))
			)) {
				warning += "'" + card.name + "' cannot be used in a deck of faction type '" + deck.faction + "'\n";
				return false;
			}
			if (card.count < c[1]) {
				console.log(card);
				warning += "Deck contains " + c[1] + "/" + card.count + " available " + card_dict[c[0]].name + " cards\n";
				return false;
			}
			return true;
		}).map(c => ({
			index: c[0],
			count: Math.min(c[1], card_dict[c[0]].count)
		}));
		if (warning) {
			tocar("warning", false);
			if (!confirm(warning + "\n\n\Continue importing deck?")) {
				tocar("warning", false);
				return;
			}
		}
		this.setFaction(deck.faction, true);
		if (card_dict[deck.leader].row === "leader" && deck.faction === card_dict[deck.leader].deck) {
			this.leader = this.leaders.filter(c => c.index === deck.leader)[0];
			if (!this.leader) {
				console.warn(`Leader "${deck.leader}" not found in leaders array. Using first available leader.`);
				this.leader = this.leaders[0];
			}
			if (this.leader && this.leader.card) {
			getPreviewElem(this.leader_elem.children[1], this.leader.card);
			}
		}
		this.me_deck_title = deck.title;
		this.makeBank(deck.faction, cards);
		this.update();
	}
}

async function translateTo(card, container_source, container_dest) {
	if (!container_dest || !container_source) return;
	if (container_dest === player_op.hand && container_source === player_op.deck) return;
	let elem = card.elem;
	let source = !container_source ? card.elem : getSourceElem(card, container_source, container_dest);
	let dest = getDestinationElem(card, container_source, container_dest);
	if (!source || !dest) return; // Safety check - if source or dest is undefined, abort
	if (!isInDocument(elem)) source.appendChild(elem);
	let x = trueOffsetLeft(dest) - trueOffsetLeft(elem) + dest.offsetWidth / 2 - elem.offsetWidth;
	let y = trueOffsetTop(dest) - trueOffsetTop(elem) + dest.offsetHeight / 2 - elem.offsetHeight / 2;
	if (container_dest instanceof Row && container_dest.cards.length !== 0 && !card.isSpecial()) x += (container_dest.getSortedIndex(card) === container_dest.cards.length) ? elem.offsetWidth / 2 : -elem.offsetWidth / 2;
	if (card.holder.controller instanceof ControllerAI) x += elem.offsetWidth / 2;
	if (container_source instanceof Row && container_dest instanceof Grave && !card.isSpecial()) {
		let mid = trueOffset(container_source.elem, true) + container_source.elem.offsetWidth / 2;
		x += trueOffset(elem, true) - mid;
	}
	if (container_source instanceof Row && container_dest === player_me.hand) y *= 7 / 8;
	await translate(elem, x, y);

	function isInDocument(elem) {
		return elem.getBoundingClientRect().width !== 0;
	}

	function trueOffset(elem, left) {
		let total = 0;
		let curr = elem;
		while (curr) {
			total += (left ? curr.offsetLeft : curr.offsetTop);
			curr = curr.parentElement;
		}
		return total;
	}

	function trueOffsetLeft(elem) {
		return trueOffset(elem, true);
	}

	function trueOffsetTop(elem) {
		return trueOffset(elem, false);
	}

	function getSourceElem(card, source, dest) {
		if (source instanceof HandAI) return source.hidden_elem;
		if (source instanceof Deck) return source.elem.children[source.elem.children.length - 2];
		return source.elem;
	}

	function getDestinationElem(card, source, dest) {
		if (dest instanceof HandAI) return dest.hidden_elem;
		if (card.isSpecial() && dest instanceof Row) return dest.special.elem;
		if (dest instanceof Row || dest instanceof Hand || dest instanceof Weather) {
			if (dest.cards.length === 0) return dest.elem;
			let index = dest.getSortedIndex(card);
			let dcard = dest.cards[index === dest.cards.length ? index - 1 : index];
			return dcard.elem;
		}
		return dest.elem;
	}
}

async function translate(elem, x, y) {
	let vw100 = 100 / document.getElementById("dimensions").offsetWidth;
	x *= vw100;
	y *= vw100;
	elem.style.transform = "translate(" + x + "vw, " + y + "vw)";
	let margin = elem.style.marginLeft;
	elem.style.marginRight = -elem.offsetWidth * vw100 + "vw";
	elem.style.marginLeft = "";
	await sleep(499);
	elem.style.transform = "";
	elem.style.position = "";
	elem.style.marginLeft = margin;
	elem.style.marginRight = margin;
}

async function fadeOut(elem, duration, delay) {
	await fade(false, elem, duration, delay);
}

async function fadeIn(elem, duration, delay) {
	await fade(true, elem, duration, delay);
}

async function fade(fadeIn, elem, dur, delay) {
	if (delay) await sleep(delay);
	let op = fadeIn ? 0.1 : 1;
	elem.style.opacity = op;
	elem.style.filter = "alpha(opacity=" + (op * 100) + ")";
	if (fadeIn) elem.classList.remove("hide");
	let timer = setInterval(async function () {
		op += (fadeIn ? 0.1 : -0.1);
		if (op >= 1) {
			clearInterval(timer);
			return;
		} else if (op <= 0.1) {
			elem.classList.add("hide");
			elem.style.opacity = "";
			elem.style.filter = "";
			clearInterval(timer);
			return;
		}
		elem.style.opacity = op;
		elem.style.filter = "alpha(opacity=" + (op * 100) + ")";
	}, dur / 10);
}

function iconURL(name, ext = "png") {
	if (name === "card_ability_sandstorm") {
		name = "overlay_sandstorm";
	}
	// Map corrected spellings to old icon file names
	if (name === "card_ability_worshipper") {
		name = "card_ability_whorshipper";
	} else if (name === "card_ability_worshipped") {
		name = "card_ability_whorshipped";
	}
	return imgURL("icons/" + name, ext);
}

function largeURL(name, ext = "jpg") {
	return imgURL("lg/" + name, ext)
}

function smallURL(name, ext = "jpg") {
	// Only special realms cards (horn, purge, decree) use .png extension
	// Regular realms cards use .jpg
	const specialRealmsCards = ["realms_horn", "realms_purge", "realms_decree"];
	if (specialRealmsCards.includes(name) || name.startsWith("special_realms_")) {
		ext = "png";
	}
	// Handle case-insensitive matching for Realms cards (e.g., Realms_Horst.png)
	if (name.toLowerCase().startsWith("realms_") && name !== name.toLowerCase()) {
		name = name.toLowerCase();
	}
	return imgURL("sm/" + name, ext);
}

function bottomBgURL() {
	return imgURL("icons/gwent_bottom_bg","png");
}

function imgURL(path, ext) {
	return "url('images/" + path + "." + ext + "')";
}

function getPreviewElem(elem, card, nb = 0) {
	while (elem.hasChildNodes()) elem.removeChild(elem.lastChild);
	elem.classList.remove("hero");
	elem.classList.remove("faction");
	let c_abilities = "";
	c_abilities = "ability" in card ? card.ability.split(" ") : card.abilities;
	let faction = ""
	if ("deck" in card) faction = card.deck.split(" ")[0];
	else faction = card.faction;
	let imgPath = faction + "_" + card.filename;
	// Special handling for Redania special cards - now using realms_ prefix
	if (faction === "special" && card.filename.startsWith("realms_")) {
		imgPath = card.filename;
	}
	elem.style.backgroundImage = smallURL(imgPath);
	if (faction == "faction") {
		elem.classList.add("faction");
		return elem;
	}
	if (card.row != "leader" && !faction.startsWith("special") && faction != "neutral" && !faction.startsWith("weather")) {
		let factionBand = document.createElement("div");
		factionBand.style.backgroundImage = iconURL("faction-band-" + faction);
		factionBand.classList.add("card-large-faction-band");
		elem.appendChild(factionBand);
	}
	let cardbg = document.createElement("div");
	cardbg.style.backgroundImage = bottomBgURL();
	cardbg.classList.add("card-large-bg");
	elem.appendChild(cardbg);
	let card_name = document.createElement("div");
	card_name.classList.add("card-large-name");
	card_name.appendChild(document.createTextNode(card.name));
	elem.appendChild(card_name);
	if ("quote" in card) {
		let quote_elem = document.createElement("div");
		quote_elem.classList.add("card-large-quote");
		quote_elem.appendChild(document.createTextNode(card.quote));
		elem.appendChild(quote_elem);
	}
	if (card.row === "leader") return elem;
	let count = document.createElement("div");
	count.innerHTML = nb;
	count.classList.add("card-count");
	cardbg.appendChild(count);
	if (nb == 0) count.classList.add("hide");
	let power = document.createElement("div");
	power.classList.add("card-large-power");
	elem.appendChild(power);
	let bg;
	if (c_abilities[0] === "hero" || ("hero" in card && card.hero)) {
		bg = "power_hero";
		elem.classList.add("hero");
	} else if (faction.startsWith("weather")) {
		// Special handling for Skellige Storm - use power_storm.png
		if (card.filename === "storm") {
			bg = "power_storm";
		} else {
			bg = "power_" + c_abilities[0];
		}
	}
	else if (faction.startsWith("special")) {
		let str = c_abilities[0];
		if (str === "shield_c" || str == "shield_r" || str === "shield_s")
			str = "shield";
		else if (str === "redania_purge") str = "scorch"; // Use scorch icon for purge
		else if (str === "redania_horn") str = "horn"; // Use horn icon for redanian horn
		else if (str === "decree") str = "decree";
		// Sign abilities use power_ prefix
		if (str && str.startsWith("sign_")) {
			bg = "power_" + str.replace("sign_", "");
		} else {
			bg = "power_" + str;
		}
		elem.classList.add("special");
	} else bg = "power_normal";
	power.style.backgroundImage = iconURL(bg);
	let row = document.createElement("div");
	row.classList.add("card-large-row");
	elem.appendChild(row);
	if (card.row === "close" || card.row === "ranged" || card.row === "siege" || card.row === "agile" || card.row === "any" || card.row === "melee_siege" || card.row === "ranged_siege") {
		let num = document.createElement("div");
		if ("strength" in card) num.appendChild(document.createTextNode(card.strength));
		else num.appendChild(document.createTextNode(card.basePower));
		num.classList.add("card-large-power-strength");
		power.appendChild(num);
		row.style.backgroundImage = iconURL("card_row_" + card.row);
	}
	if (c_abilities.length > 0) {
		let abi = document.createElement("div");
		abi.classList.add("card-large-ability");
		elem.appendChild(abi);
		if (!faction.startsWith("special") && !faction.startsWith("weather") && c_abilities.length > 0 && c_abilities[c_abilities.length - 1] != "hero") {
			let str = c_abilities[c_abilities.length - 1];
			if (str && str.trim() !== "") {
				if (str === "cerys") str = "muster";
				if (str.startsWith("avenger")) str = "avenger";
				if (str === "scorch_c") str = "scorch_combat";
				else if (str === "scorch_r") str = "scorch_ranged";
				else if (str === "scorch_s") str = "scorch_siege";
				else if (str === "shield_c" || str == "shield_r" || str === "shield_s") str = "shield";
				else if (str === "redania_purge") str = "scorch"; // Use scorch icon for purge
				else if (str === "redania_horn") str = "horn";
				else if (str === "decree") str = "decree"; // Use decree icon
				else if (str === "worshipper") str = "worshipper";
				else if (str === "worshipped") str = "worshipped";
				else if (str === "skellige_tactics") str = "skelligetactics";
				if (str && str.trim() !== "") {
					abi.style.backgroundImage = iconURL("card_ability_" + str);
				}
			}
		} else if (card.row === "agile") abi.style.backgroundImage = iconURL("card_ability_agile");
		else if (card.row === "any") abi.style.backgroundImage = iconURL("card_ability_agile"); // Use agile icon for "any" row type
		// melee_siege and ranged_siege icons are shown on the row element, not in the ability area
		// else if (card.row === "melee_siege") abi.style.backgroundImage = iconURL("card_row_melee_siege");
		// else if (card.row === "ranged_siege") abi.style.backgroundImage = iconURL("card_row_ranged_siege");
		if ((c_abilities.length > 1 && !(c_abilities[0] === "hero")) || (c_abilities.length > 2 && c_abilities[0] === "hero")) {
			let abi2 = document.createElement("div");
			abi2.classList.add("card-large-ability-2");
			elem.appendChild(abi2);
			let str = c_abilities[c_abilities.length - 2];
			if (str && str.trim() !== "") {
				if (str === "cerys") str = "muster";
				if (str.startsWith("avenger")) str = "avenger";
				if (str === "scorch_c") str = "scorch_combat";
				else if (str === "scorch_r") str = "scorch_ranged";
				else if (str === "scorch_s") str = "scorch_siege";
				else if (str === "shield_c" || str == "shield_r" || str === "shield_s") str = "shield";
				else if (str === "redania_purge") str = "scorch"; // Use scorch icon for purge
				else if (str === "redania_horn") str = "horn";
				else if (str === "decree") str = "decree"; // Use decree icon
			else if (str === "worshipper") str = "worshipper";
			else if (str === "worshipped") str = "worshipped";
			else if (str === "skellige_tactics") str = "skelligetactics";
			if (str && str.trim() !== "") {
					abi2.style.backgroundImage = iconURL("card_ability_" + str);
				}
			}
		}
	}
	return elem;
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function isString(s) {
	return typeof (s) === 'string' || s instanceof String;
}

function randomInt(n) {
	return Math.floor(Math.random() * n);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function sleepUntil(predicate, ms) {
	return new Promise(resolve => {
		let timer = setInterval(function () {
			if (predicate()) {
				clearInterval(timer);
				resolve();
			}
		}, ms)
	});
}

function initLocalMusicSystem() {
	ui.initLocalMusic();
}

var ui = new UI();
var board = new Board();
var weather = new Weather();
var game = new Game();
var player_me, player_op;

ui.enablePlayer(false);
let dm = new DeckMaker();

document.addEventListener('contextmenu', event => event.preventDefault());

const elem_principal = document.documentElement;

const load_passT = 3;
const load_giveupT = 3;

var load_pass = load_passT;
var load_giveup = load_giveupT;
var may_pass1 = false;
var may_pass2 = "";
var may_giveup1 = false;
var may_giveup2 = "";

var timer2, timer3, lCard, playingOnline;

var statistics = new Array();
for (var i = 0; i < 3; i++) {
	statistics[i] = new Array();
	for (var j = 0; j < 2; j++) statistics[i][j] = 0;
}
var series = new Array();

var carta_selecionada = null;
var fileira_clicavel = null;

var fimC = false;
var fimU = false;

var may_leader = true;
var exibindo_lider = false;

var carta_c = false;
var iniciou = false;
var lancado = false;
var isLoaded = false;
var hover_row = true;
var may_act_card = true;
var nilfgaard_wins_draws = false;

var nova = "";
var lastSound = "";
var original = "Pass";
var original2 = "Surr.";
var cache_notif = ["op-leader"];

setTimeout(dimensionar(), 300);

document.onkeydown = function (e) {
	if (e.keyCode != 123) {
		if (document.getElementById("carousel").className != "hide") {
			switch (e.keyCode) {
				case 13:
					Carousel.curr.select(e);
					break;
				case 37:
					Carousel.curr.shift(e, -1);
					break;
				case 39:
					Carousel.curr.shift(e, 1);
					break;
			}
		} else if (document.getElementsByClassName("hover_un")[0] && document.getElementsByClassName("hover_un")[0].innerText.length > 1) {
			switch(e.keyCode) {
				case 69:
					if (Popup.curr) Popup.curr.selectYes();
					break;
				case 81:
					if (Popup.curr) Popup.curr.selectNo();
					break;
				case 13: // Enter key - also works for "Ok" button
					if (Popup.curr) Popup.curr.selectNo();
					break;
			}
		} else if (!iniciou && isLoaded && (e.keyCode == 13 || e.keyCode == 69)) inicio();
	} else return false;
}

window.onload = function() {
	dimensionar();
	playingOnline = window.location.href == "https://randompianist.github.io/gwent-classic-v3.1/";
    try { document.getElementById("load_text").style.display = "none"; } catch(e) {}
	document.getElementById("button_start").style.display = "inline-block";
    // Keep other UI hidden until start if desired
    try { document.getElementById("deck-customization").style.display = "none"; } catch(e) {}
    try { document.getElementById("toggle-music").style.display = "none"; } catch(e) {}
    try { document.getElementsByTagName("main")[0].style.display = "none"; } catch(e) {}
	document.getElementById("button_start").addEventListener("click", function() {
		inicio();
	});
	document.getElementById("pLoad").innerHTML = "* {cursor: url('images/icons/cursor.png'), default}"
	isLoaded = true;
}

window.onresize = function() {
	dimensionar();
}

function openFullscreen() {
	try {
		if (elem_principal.requestFullscreen) elem_principal.requestFullscreen();
		else if (elem_principal.webkitRequestFullscreen) elem_principal.webkitRequestFullscreen();
		else if (elem_principal.msRequestFullscreen) elem_principal.msRequestFullscreen();
		if (isMobile()) window.screen.orientation.lock("landscape");
	} catch(err) {}
}

function inicio() {
	var classe = document.getElementsByClassName("abs");
	for (var i = 0; i < classe.length; i++) classe[i].style.display = "none";
	iniciou = true;
	tocar("menu_opening", false);
	openFullscreen();
	iniciarMusica();
    try { 
		var deckEl = document.getElementById("deck-customization");
		deckEl.style.display = "";
		// Ensure table.jpg background is set
		deckEl.style.backgroundImage = "url('images/table.jpg')";
		deckEl.style.backgroundSize = "cover";
		deckEl.style.backgroundPosition = "center";
		deckEl.style.backgroundRepeat = "no-repeat";
	} catch(e) {}
    try { document.getElementById("toggle-music").style.display = ""; } catch(e) {}
    try { document.getElementsByTagName("main")[0].style.display = ""; } catch(e) {}
}

function aviso(titulo, texto, apagarFim) {
	setTimeout(function() {
		ui.popup("", "", "Ok", "", titulo, texto, true, apagarFim);
		document.getElementById("start-game").blur();
		var som = titulo != "Warning" ? "card" : "warning";
		tocar(som, false);
	}, 150);
}

function somCarta() {
	var classes = ["card", "card-lg"];
	for (var i = 0; i < classes.length; i++) {
		var cartas = document.getElementsByClassName(classes[i]);
		for (var j = 0; j < cartas.length; j++) {
			if (cartas[j].id != "no_sound" && cartas[j].id != "no_hover") cartas[j].addEventListener("mouseover", function() {
				tocar("card", false);
			});
		}
	}
	var tags = ["label", "a", "button"];
	for (var i = 0; i < tags.length; i++) {
		var rec = document.getElementsByTagName(tags[i]);
		for (var j = 0; j < rec.length; j++) rec[j].addEventListener("mouseover", function() {
			tocar("card", false);
		});
	}
	var ids = ["pass-button", "toggle-music"];
	for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).addEventListener("mouseover", function() {
		tocar("card", false);
	});
}

function cartaNaLinha(id, carta) {
	if (id.charAt(0) == "f") {
		if (!carta.hero) {
			if (carta.name != "Decoy") {
				var linha = parseInt(id.charAt(1));
				if (linha == 1 || linha == 6) tocar("common3", false);
				else if (linha == 2 || linha == 5) tocar("common2", false);
				else if (linha == 3 || linha == 4) tocar("common1", false);
			} else tocar("menu_buy", false);
		} else tocar("hero", false);
	}
}

function tocar(arquivo, pararMusica) {
	if (arquivo != lastSound && arquivo != "") {
		// Check if user has interacted (required for mobile audio)
		if (!ui.userInteracted && !iniciou) {
			// Silently fail if user hasn't interacted yet (mobile requirement)
			return;
		}
		
		var s = new Audio("sfx/" + arquivo + ".mp3");
		// Use UI's sound effects volume setting for consistent balance
		s.volume = ui.getSoundEffectsVolume();
		
		// Preload audio for better mobile performance
		s.preload = "auto";
		
		if (pararMusica && ui.backgroundMusic && !ui.backgroundMusic.paused) {
			ui.backgroundMusic.pause();
			ui.toggleMusic_elem.classList.add("fade");
		}
		lastSound = arquivo;
		
		// Play with proper error handling for mobile
		if (iniciou || ui.userInteracted) {
			const playPromise = s.play();
			if (playPromise !== undefined) {
				playPromise.catch(error => {
					// Silently handle autoplay errors on mobile
					// These are expected when user hasn't interacted yet
					if (error.name !== 'NotAllowedError' && error.name !== 'NotSupportedError') {
						console.warn("Audio play failed:", error);
					}
				});
			}
		}
		setTimeout(function() {
			lastSound = "";
		}, 50);
	}
}

function iniciarMusica() {
	try {
		if (ui.backgroundMusic.paused) {
			ui.backgroundMusic.play();
			ui.toggleMusic_elem.classList.remove("fade");
		}
	} catch(err) {}
}

function cancelaClima() {
	if (carta_c) {
		ui.cancel();
		hover_row = false;
		setTimeout(function() {
			hover_row = true;
		}, 100);
	}
}

function showStats(apagarFim) {
	var tabela = "";
	var aux = ["Victories", "Draws", "Losses"];
	for (var i = 0; i < 3; i++) {
		tabela += "<tr><td class = 'title'>" + aux[i] + "</td>";
		for (var j = 0; j < 2; j++) tabela += "<td>" + statistics[i][j] + "</td>";
		tabela += "</tr>";
	}
	if (apagarFim) {
		document.getElementById("end-screen").style.opacity = 0;
		document.getElementById("end-screen").style.zIndex = 0;
	}
	aviso("Statistics", "<table>" +
		"<tr>" +
			"<td class = 'first'>&nbsp;</td>" +
			"<td>Longest streak</td>" +
			"<td>Total</td>" +
		"</tr>" +
		tabela +
	"</table>", apagarFim);
}

function dimensionar() {
	var prop = window.innerWidth / window.innerHeight;
	var dim = document.getElementById("dimensions").offsetHeight;
	document.getElementById("very_start_bg2").style.height = prop < 1.8 ? (parseInt(dim * 0.94) - 8) + "px" : "";
	document.getElementById("very_start").style.paddingTop = "";
	document.getElementById("very_start").style.paddingTop = parseInt(
		(document.getElementById("very_start_bg2").offsetHeight - document.getElementById("very_start").offsetHeight) / 2
	) + "px";
	var tamanho = document.getElementsByTagName("main")[0].offsetHeight;
	var diferenca = Math.abs(tamanho - document.body.scrollHeight);
	if (tamanho.toString() != "NaN") {
		var deckCustomization = document.getElementById("deck-customization");
		// Set table.jpg as background image
		deckCustomization.style.backgroundImage = "url('images/table.jpg')";
		deckCustomization.style.backgroundSize = "cover";
		deckCustomization.style.backgroundPosition = "center";
		deckCustomization.style.backgroundRepeat = "no-repeat";
		if (diferenca > 5) {
			deckCustomization.style.backgroundColor = "rgba(10, 10, 10, 0.4)";
		} else {
			deckCustomization.style.backgroundColor = "rgba(10, 10, 10, 0.3)";
		}
		document.body.style.overflowY = tamanho - document.body.scrollHeight > 20 ? "visible" : "";
		window.scrollTo(0, 0);
	}
}

function alteraClicavel(obj, add) {
	try {
		if (!add && fileira_clicavel.elem.id == obj.elem.id) fileira_clicavel = null;
		else fileira_clicavel = obj;
	} catch (err) {}
}

function limpar() {
	fileira_clicavel = null;
	load_pass = load_passT;
	load_giveup = load_giveupT;
	may_pass1 = false;
	may_pass2 = "";
	may_giveup1 = false;
	may_giveup2 = "";
	timer2 = null;
	timer3 = null;
	lCard = null;
}

function passBreak() {
	clearInterval(timer2);
	load_pass = load_passT;
	may_pass2 = "";
	document.getElementById("pass-button").innerHTML = original;
}

function giveupBreak() {
	clearInterval(timer3);
	load_giveup = load_giveupT;
	may_giveup2 = "";
	document.getElementById("giveup-button").innerHTML = original2;
}

function passStart(input) {
	if (may_pass1 && may_pass2 == "") {
		may_pass2 = input;
		ui.passLoad();
		timer2 = setInterval(function () {
			ui.passLoad();
		}, 750);
	}
}

function giveupStart(input) {
	if (may_giveup1 && may_giveup2 == "") {
		may_giveup2 = input;
		ui.giveupLoad();
		timer3 = setInterval(function () {
			ui.giveupLoad();
		}, 750);
	}
}

function desistir() {
	player_me.health = 0;
	var verdict = {
		winner: null,
		score_me: player_me.total,
		score_op: player_op.total
	}
	game.roundHistory.push(verdict);
	game.endGame();
}

function isMobile() {
	if (navigator.userAgentData)
		return navigator.userAgentData.mobile;
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}