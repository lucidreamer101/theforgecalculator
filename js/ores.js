// ========================================
// THE FORGE CALCULATOR - ORE DATABASE
// Updated December 2025
// ========================================

const ORES = [
  // Common Ores
  { name: 'Stone', mult: 0.2, icon: '🪨', rarity: 'common', trait: null, location: 'World 1', dropRate: 'Very Common' },
  { name: 'Sandite', mult: 0.25, icon: '🏜️', rarity: 'common', trait: null, location: 'World 1', dropRate: 'Very Common' },
  { name: 'Copper', mult: 0.3, icon: '🟠', rarity: 'common', trait: null, location: 'World 1', dropRate: 'Common' },
  { name: 'Tin', mult: 0.35, icon: '⚙️', rarity: 'common', trait: null, location: 'World 1', dropRate: 'Common' },
  { name: 'Cardboardite', mult: 0.7, icon: '📦', rarity: 'common', trait: null, location: 'World 1', dropRate: 'Uncommon' },

  // Uncommon Ores
  { name: 'Canite', mult: 0.425, icon: '🥫', rarity: 'uncommon', trait: null, location: 'World 1', dropRate: 'Uncommon' },
  { name: 'Silver', mult: 0.5, icon: '⚪', rarity: 'uncommon', trait: null, location: 'World 1', dropRate: 'Uncommon' },
  { name: 'Gold', mult: 0.65, icon: '🟡', rarity: 'uncommon', trait: null, location: 'World 1', dropRate: 'Rare' },
  { name: 'Bananite', mult: 0.85, icon: '🍌', rarity: 'uncommon', trait: null, location: 'World 1', dropRate: 'Rare' },
  { name: 'Cobalt', mult: 1.0, icon: '🔵', rarity: 'uncommon', trait: null, location: 'World 2', dropRate: 'Uncommon' },
  { name: 'Titanium', mult: 1.15, icon: '🛡️', rarity: 'uncommon', trait: null, location: 'World 2', dropRate: 'Rare' },
  { name: 'Lazuli', mult: 1.3, icon: '💠', rarity: 'uncommon', trait: null, location: 'World 2', dropRate: 'Rare' },

  // Rare Ores
  { name: 'Mushroomite', mult: 0.8, icon: '🍄', rarity: 'rare', trait: null, location: 'World 1', dropRate: 'Rare' },
  { name: 'Moonstone', mult: 0.8, icon: '⬜', rarity: 'rare', trait: null, location: 'World 1', dropRate: 'Rare' },
  { name: 'Volite', mult: 1.55, icon: '🌋', rarity: 'rare', trait: null, location: 'World 2', dropRate: 'Rare' },
  { name: 'Quartz', mult: 1.5, icon: '💎', rarity: 'rare', trait: null, location: 'World 2', dropRate: 'Rare' },
  { name: 'Amethyst', mult: 1.65, icon: '💜', rarity: 'rare', trait: null, location: 'World 2', dropRate: 'Very Rare' },
  { name: 'Topaz', mult: 1.75, icon: '🟨', rarity: 'rare', trait: null, location: 'World 2', dropRate: 'Very Rare' },
  { name: 'Diamond', mult: 2.0, icon: '💎', rarity: 'rare', trait: null, location: 'World 2', dropRate: 'Very Rare' },
  { name: 'Sapphire', mult: 2.25, icon: '🔷', rarity: 'rare', trait: null, location: 'World 2', dropRate: 'Very Rare' },
  { name: 'Boneite', mult: 1.2, icon: '🦴', rarity: 'rare', trait: null, location: 'Skeleton Dungeon', dropRate: 'Rare' },

  // Epic Ores
  { name: 'Platinum', mult: 1.0, icon: '💫', rarity: 'epic', trait: null, location: 'World 1', dropRate: 'Very Rare' },
  { name: 'Poopite', mult: 1.2, icon: '💩', rarity: 'epic', trait: { name: 'Last Stand', desc: 'Deal 15% Poison AoE Damage when HP drops below 35% (Armor)', type: 'armor' }, location: 'World 1', dropRate: 'Very Rare' },
  { name: 'Brick', mult: 2.43, icon: '🧱', rarity: 'epic', trait: null, location: 'World 2', dropRate: 'Very Rare' },
  { name: 'Obsidian', mult: 2.35, icon: '⬛', rarity: 'epic', trait: { name: 'Thorns', desc: 'Reflect 15% damage taken on Armor', type: 'armor' }, location: 'World 2', dropRate: 'Very Rare' },
  { name: 'Emerald', mult: 2.55, icon: '💚', rarity: 'epic', trait: null, location: 'World 2', dropRate: 'Very Rare' },
  { name: 'Ruby', mult: 2.95, icon: '❤️', rarity: 'epic', trait: null, location: 'World 2', dropRate: 'Very Rare' },
  { name: 'Rivalite', mult: 3.33, icon: '⚡', rarity: 'epic', trait: { name: 'Critical Strike', desc: '+20% critical hit chance on Weapons', type: 'weapon' }, location: 'World 2', dropRate: 'Ultra Rare' },
  { name: 'Orange Crystal', mult: 3.0, icon: '🟧', rarity: 'epic', trait: null, location: 'Goblin Cave', dropRate: 'Rare' },
  { name: 'Purple Crystal', mult: 3.1, icon: '🟪', rarity: 'epic', trait: null, location: 'Goblin Cave', dropRate: 'Rare' },
  { name: 'Green Crystal', mult: 3.2, icon: '🟩', rarity: 'epic', trait: null, location: 'Goblin Cave', dropRate: 'Very Rare' },
  { name: 'Red Crystal', mult: 3.3, icon: '🟥', rarity: 'epic', trait: null, location: 'Goblin Cave', dropRate: 'Very Rare' },
  { name: 'Blue Crystal', mult: 3.4, icon: '🟦', rarity: 'epic', trait: null, location: 'Goblin Cave', dropRate: 'Very Rare' },
  { name: 'Skullite', mult: 2.25, icon: '💀', rarity: 'rare', trait: null, location: 'Skeleton Dungeon Cave', dropRate: 'Very Rare' },
  { name: 'Slimeite', mult: 2.25, icon: '🟢', rarity: 'epic', trait: null, location: 'Slime Area', dropRate: 'Very Rare' },

  // Legendary Ores
  { name: 'Uranium', mult: 3.0, icon: '☢️', rarity: 'legendary', trait: { name: 'Radiation', desc: 'Enemies take +10% tick damage near you on Armor', type: 'armor' }, location: 'World 2', dropRate: 'Ultra Rare' },
  { name: 'Starite', mult: 3.5, icon: '✨', rarity: 'legendary', trait: { name: 'Stardust', desc: 'Gain +15% damage taken on Armor', type: 'armor' }, location: 'World 2', dropRate: 'Ultra Rare' },
  { name: 'Eye Ore', mult: 4.0, icon: '👁️', rarity: 'legendary', trait: { name: 'Vision', desc: '-10% Max HP, but +15% DMG on Weapons', type: 'weapon' }, location: 'World 2', dropRate: 'Ultra Rare' },
  { name: 'Fireite', mult: 4.5, icon: '🔥', rarity: 'legendary', trait: { name: 'Burn', desc: '20% DMG burn effect (5% damage on-hit) on Weapons', type: 'weapon' }, location: 'World 2', dropRate: 'Ultra Rare' },
  { name: 'Lightite', mult: 4.6, icon: '💡', rarity: 'legendary', trait: { name: 'Illumination', desc: '+15% speed and +10% attack speed on Armor', type: 'armor' }, location: 'World 2', dropRate: 'Ultra Rare' },
  { name: 'Magmaite', mult: 5.0, icon: '🌋', rarity: 'legendary', trait: { name: 'Eruption', desc: '50% DMG AoE explosion (35% chance) on Weapons', type: 'weapon' }, location: 'World 2', dropRate: 'Ultra Rare' },
  { name: 'Rainbow Crystal', mult: 5.25, icon: '🌈', rarity: 'legendary', trait: null, location: 'Goblin Cave', dropRate: 'Ultra Rare' },

  // Mythical Ores
  { name: 'Demonite', mult: 5.5, icon: '😈', rarity: 'mythical', trait: { name: 'Demonic', desc: '-15% defense (Armor) + 25% cooldown reduction on Armor', type: 'armor' }, location: 'World 2', dropRate: 'Extremely Rare' },
  { name: 'Darkryte', mult: 6.3, icon: '🌑', rarity: 'mythical', trait: { name: 'Shadow Dodge', desc: '+20% dodge chance but -10% damage on Armor', type: 'armor' }, location: 'World 2', dropRate: 'Extremely Rare' },
  { name: 'Arcane Crystal', mult: 7.5, icon: '🔮', rarity: 'mythical', trait: null, location: 'Goblin Cave', dropRate: 'Extremely Rare' },

  // Divine Ores
  { name: 'Galaxite', mult: 11.5, icon: '🌌', rarity: 'divine', trait: null, location: 'Space Biome', dropRate: 'Legendary' },
];

// Create ore lookup map
const ORE_MAP = Object.fromEntries(ORES.map(ore => [ore.name, ore]));

// Weapon Thresholds
const WEAPON_THRESHOLDS = [
  { min: 0, max: 2, items: [{ name: 'Cannot Craft', icon: '❌', chance: 100 }] },
  { min: 3, max: 4, items: [{ name: 'Dagger', icon: '🗡️', chance: 86 }, { name: 'Straight Sword', icon: '⚔️', chance: 14 }] },
  { min: 5, max: 7, items: [{ name: 'Dagger', icon: '🗡️', chance: 60 }, { name: 'Straight Sword', icon: '⚔️', chance: 30 }, { name: 'Gauntlet', icon: '🥊', chance: 10 }] },
  { min: 8, max: 12, items: [{ name: 'Straight Sword', icon: '⚔️', chance: 35 }, { name: 'Gauntlet', icon: '🥊', chance: 25 }, { name: 'Katana', icon: '🔪', chance: 40 }] },
  { min: 13, max: 19, items: [{ name: 'Katana', icon: '🔪', chance: 40 }, { name: 'Great Sword', icon: '⚔️', chance: 35 }, { name: 'Great Axe', icon: '🪓', chance: 25 }] },
  { min: 20, max: 29, items: [{ name: 'Great Sword', icon: '⚔️', chance: 30 }, { name: 'Great Axe', icon: '🪓', chance: 30 }, { name: 'Colossal Sword', icon: '🗡️', chance: 40 }] },
  { min: 30, max: 42, items: [{ name: 'Great Axe', icon: '🪓', chance: 20 }, { name: 'Colossal Sword', icon: '🗡️', chance: 80 }] },
  { min: 43, max: Infinity, items: [{ name: 'Colossal Sword', icon: '🗡️', chance: 100 }] },
];

// Armor Thresholds
const ARMOR_THRESHOLDS = [
  { min: 0, max: 2, items: [{ name: 'Cannot Craft', icon: '❌', chance: 100 }] },
  { min: 3, max: 5, items: [{ name: 'Light Helmet', icon: '⛑️', chance: 70 }, { name: 'Light Leggings', icon: '👖', chance: 30 }] },
  { min: 6, max: 9, items: [{ name: 'Light Leggings', icon: '👖', chance: 50 }, { name: 'Light Chestplate', icon: '👕', chance: 50 }] },
  { min: 10, max: 14, items: [{ name: 'Light Chestplate', icon: '👕', chance: 30 }, { name: 'Medium Helmet', icon: '🪖', chance: 40 }, { name: 'Medium Leggings', icon: '👖', chance: 30 }] },
  { min: 15, max: 21, items: [{ name: 'Medium Leggings', icon: '👖', chance: 35 }, { name: 'Medium Chestplate', icon: '🦺', chance: 65 }] },
  { min: 22, max: 29, items: [{ name: 'Medium Chestplate', icon: '🦺', chance: 25 }, { name: 'Heavy Helmet', icon: '⛑️', chance: 35 }, { name: 'Heavy Leggings', icon: '👖', chance: 40 }] },
  { min: 30, max: 39, items: [{ name: 'Heavy Leggings', icon: '👖', chance: 30 }, { name: 'Heavy Chestplate', icon: '🛡️', chance: 70 }] },
  { min: 40, max: Infinity, items: [{ name: 'Heavy Chestplate', icon: '🛡️', chance: 100 }] },
];

// Base weapon damage values
const BASE_WEAPON_DAMAGE = {
  'Dagger': { base: 15, range: 5 },
  'Straight Sword': { base: 25, range: 8 },
  'Gauntlet': { base: 20, range: 6 },
  'Katana': { base: 35, range: 10 },
  'Great Sword': { base: 50, range: 15 },
  'Great Axe': { base: 55, range: 18 },
  'Colossal Sword': { base: 80, range: 25 },
};

// Base armor defense values
const BASE_ARMOR_DEFENSE = {
  'Light Helmet': { base: 20, range: 5 },
  'Light Leggings': { base: 35, range: 8 },
  'Light Chestplate': { base: 50, range: 12 },
  'Medium Helmet': { base: 45, range: 10 },
  'Medium Leggings': { base: 70, range: 15 },
  'Medium Chestplate': { base: 100, range: 25 },
  'Heavy Helmet': { base: 80, range: 20 },
  'Heavy Leggings': { base: 120, range: 30 },
  'Heavy Chestplate': { base: 180, range: 45 },
};

// Trade values (estimated in-game currency)
const TRADE_VALUES = {
  'Galaxite': { value: 50000, trend: 'up', change: '+12%' },
  'Arcane Crystal': { value: 25000, trend: 'stable', change: '0%' },
  'Darkryte': { value: 18000, trend: 'up', change: '+5%' },
  'Demonite': { value: 15000, trend: 'down', change: '-3%' },
  'Magmaite': { value: 12000, trend: 'up', change: '+8%' },
  'Fireite': { value: 10000, trend: 'stable', change: '0%' },
  'Eye Ore': { value: 9000, trend: 'up', change: '+4%' },
  'Rainbow Crystal': { value: 8000, trend: 'down', change: '-2%' },
  'Lightite': { value: 7500, trend: 'stable', change: '+1%' },
  'Rivalite': { value: 6000, trend: 'up', change: '+6%' },
  'Ruby': { value: 4000, trend: 'stable', change: '0%' },
  'Emerald': { value: 3500, trend: 'stable', change: '0%' },
  'Diamond': { value: 2500, trend: 'down', change: '-1%' },
  'Sapphire': { value: 2200, trend: 'stable', change: '0%' },
};

// Best ore combinations for optimization
const OPTIMAL_BUILDS = {
  weapon: {
    maxDamage: {
      name: 'Maximum Damage Build',
      ores: ['Galaxite', 'Arcane Crystal', 'Darkryte', 'Magmaite'],
      description: 'Pure high-multiplier ores for maximum base damage',
    },
    critBuild: {
      name: 'Critical Strike Build',
      ores: ['Rivalite', 'Galaxite', 'Magmaite', 'Fireite'],
      description: 'High crit chance with solid damage output',
    },
    burnBuild: {
      name: 'Burn DPS Build',
      ores: ['Fireite', 'Magmaite', 'Arcane Crystal', 'Darkryte'],
      description: 'Stack burn damage for sustained DPS',
    },
  },
  armor: {
    maxDefense: {
      name: 'Maximum Defense Build',
      ores: ['Galaxite', 'Arcane Crystal', 'Darkryte', 'Demonite'],
      description: 'Highest possible defense values',
    },
    dodgeBuild: {
      name: 'Evasion Tank Build',
      ores: ['Darkryte', 'Galaxite', 'Arcane Crystal', 'Lightite'],
      description: '20% dodge chance with high defense',
    },
    speedBuild: {
      name: 'Speed Build',
      ores: ['Lightite', 'Galaxite', 'Arcane Crystal', 'Rainbow Crystal'],
      description: 'Maximum movement and attack speed',
    },
  },
};

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = { ORES, ORE_MAP, WEAPON_THRESHOLDS, ARMOR_THRESHOLDS, BASE_WEAPON_DAMAGE, BASE_ARMOR_DEFENSE, TRADE_VALUES, OPTIMAL_BUILDS };
}

