# AI Ability Analysis - Missing Abilities from gwent2.js

## Abilities Currently Handled in gwent2.js

### Special Cards (playCard method):
- ✅ `spe_horn` (Commander's Horn)
- ✅ `spe_mardroeme` (Mardroeme)
- ✅ `decoy` (Decoy)
- ✅ `scorch` (Scorch)
- ✅ `cintra_slaughter` (Cintra Slaughter)
- ✅ `seize` (Seize)
- ✅ `shield`, `shield_c`, `shield_r`, `shield_s` (Shield variants)
- ✅ `lock` (Lock)
- ✅ `knockback` (Knockback)
- ✅ `toussaint_wine` (Toussaint Wine)
- ✅ `witch_hunt` (Witch Hunt)
- ✅ `bank` (Bank)

### Unit Abilities (weightCard method):
- ✅ `decoy` (weighted)
- ✅ `horn` (weighted)
- ✅ `scorch`, `scorch_c`, `scorch_r`, `scorch_s` (weighted)
- ✅ `mardroeme` (weighted)
- ✅ `witch_hunt` (weighted)
- ✅ `toussaint_wine` (weighted)
- ✅ `witcher_*` (witcher school abilities - weighted)
- ✅ `inspire` (weighted)
- ✅ `bond` (weighted)
- ✅ `morale` (weighted)
- ✅ `medic` (weighted)
- ✅ `spy` (weighted)
- ✅ `muster` (weighted)
- ✅ `berserker` (weighted)
- ✅ `avenger`, `avenger_kambi` (weighted)
- ✅ `whorshipper` (weighted)

### Weather Cards:
- ✅ `frost`, `fog`, `rain` (basic weather)
- ✅ `clear` (clear weather)

## Missing Abilities (NOT Handled in gwent2.js)

### Weather Abilities:
- ❌ `storm` (Skellige Storm - affects Range and Siege)
- ❌ `sandstorm` (Sandstorm - affects Close and Ranged)
- ❌ `nightfall` (Nightfall - triggers Hunger transformations)

### Special Card Abilities:
- ❌ `redania_purge` (Purge - like scorch but discards after)
- ❌ `peace_treaty` (Peace Treaty - special ability)
- ❌ `sign_aard` (Sign Aard - special ability)
- ❌ `alzur_maker` (Alzur Maker - leader ability, partially handled in UI but not in AI)
- ❌ `vilgefortz_sorcerer` (Vilgefortz Sorcerer - special ability)
- ❌ `vilgefortz_magician_kovir` (Vilgefortz Magician Kovir - leader ability)

### Unit Abilities:
- ❌ `hunger` (Hunger - transforms with nightfall)
- ❌ `resilience` (Resilience - stays on board between rounds)
- ❌ `redania_horn` (Redanian Horn - variant of horn)
- ❌ `zerrikanterment` (Zerrikanterment - doubles worshipper boost)
- ❌ `baal_zebuth` (Baal Zebuth - special ability)
- ❌ `rarog` (Rarog - special ability)
- ❌ `worshipped` (Worshipped - boosted by worshippers, partially handled in scoring but not in AI decision making)

### Leader Abilities (many not handled):
- ❌ `anna_henrietta_ladyship` (Anna Henrietta Ladyship)
- ❌ `anna_henrietta_grace` (Anna Henrietta Grace)
- ❌ `meve_resolute` (Meve Resolute)
- ❌ `francis_bedlam` (Francis Bedlam)
- ❌ `cyprian_wiley` (Cyprian Wiley)
- ❌ `gudrun_bjornsdottir` (Gudrun Bjornsdottir)
- ❌ `azar_javed` (Azar Javed)
- ❌ Many other leader abilities (foltest variants, emhyr variants, eredin variants, francesca variants, etc.)

### Row Designations:
- ❌ `any` (Any row - can be placed anywhere)
- ❌ `melee_siege` (Melee/Siege - can be placed in close or siege)
- ❌ `ranged_siege` (Ranged/Siege - can be placed in ranged or siege)

## Summary

**Total Abilities in abilities.js:** ~99 abilities
**Handled in gwent2.js:** ~25-30 abilities
**Missing:** ~70 abilities

The main gaps are:
1. **Weather variants** (storm, sandstorm, nightfall)
2. **Many leader abilities** (most leader-specific abilities)
3. **Row flexibility** (any, melee_siege, ranged_siege)
4. **Special abilities** (peace_treaty, sign_aard, etc.)
5. **Transformation abilities** (hunger)
6. **Resilience** (staying on board)

