// ========================================
// THE FORGE CALCULATOR - MAIN LOGIC
// ========================================

// State
let pot = {};
let mode = 'weapon';
let activeFilter = 'all';
let searchQuery = '';
let currentTool = 'calculator';

// DOM Elements
const elements = {
  btnWeapon: document.getElementById('btn-weapon'),
  btnArmor: document.getElementById('btn-armor'),
  avgMult: document.getElementById('avgMult'),
  estDamage: document.getElementById('estDamage'),
  estDamageLabel: document.getElementById('estDamageLabel'),
  oreCount: document.getElementById('oreCount'),
  oreTypes: document.getElementById('oreTypes'),
  purityIndicator: document.getElementById('purityIndicator'),
  compositionSection: document.getElementById('compositionSection'),
  compositionList: document.getElementById('compositionList'),
  traitsSection: document.getElementById('traitsSection'),
  traitsList: document.getElementById('traitsList'),
  potContent: document.getElementById('potContent'),
  clearBtn: document.getElementById('clearBtn'),
  probsGrid: document.getElementById('probsGrid'),
  searchInput: document.getElementById('searchInput'),
  oreGrid: document.getElementById('oreGrid'),
  toast: document.getElementById('toast'),
};

// Toast notification
function showToast(message, type = 'error') {
  elements.toast.textContent = message;
  elements.toast.className = 'toast ' + type + ' show';
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2500);
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Clipboard helper with fallback for older browsers
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      success ? resolve() : reject();
    } catch (err) {
      document.body.removeChild(textarea);
      reject(err);
    }
  });
}

// Calculate stats from pot
function calculateStats() {
  const entries = Object.entries(pot);
  const totalOres = entries.reduce((sum, [, count]) => sum + count, 0);
  const numTypes = entries.length;

  if (totalOres === 0) {
    return { total: 0, types: 0, avgMult: 0, maxMult: 0, composition: [], traits: [] };
  }

  let weightedSum = 0;
  let maxMult = 0;
  const composition = [];
  const traits = [];

  for (const [oreName, count] of entries) {
    const ore = ORE_MAP[oreName];
    if (!ore) continue;

    weightedSum += ore.mult * count;
    maxMult = Math.max(maxMult, ore.mult);

    const percentage = (count / totalOres) * 100;
    composition.push({ name: oreName, icon: ore.icon, count, percentage, mult: ore.mult });

    if (ore.trait && percentage >= 10) {
      const strength = Math.min(100, ((percentage - 10) / 20) * 100);
      const active = ore.trait.type === 'both' || ore.trait.type === mode;
      traits.push({
        oreName,
        oreIcon: ore.icon,
        ...ore.trait,
        percentage,
        strength: Math.round(strength),
        active,
      });
    }
  }

  const avgMult = weightedSum / totalOres;
  composition.sort((a, b) => b.percentage - a.percentage);

  return { total: totalOres, types: numTypes, avgMult, maxMult, composition, traits };
}

// Get threshold for ore count
function getThreshold(total, thresholds) {
  return thresholds.find(t => total >= t.min && total <= t.max) || thresholds[0];
}

// Estimate damage or defense
function estimateDamageOrDefense(avgMult, total) {
  const thresholds = mode === 'weapon' ? WEAPON_THRESHOLDS : ARMOR_THRESHOLDS;
  const baseStats = mode === 'weapon' ? BASE_WEAPON_DAMAGE : BASE_ARMOR_DEFENSE;
  const threshold = getThreshold(total, thresholds);

  if (total < 3 || !threshold.items[0] || threshold.items[0].name === 'Cannot Craft') {
    return null;
  }

  const bestItem = threshold.items.reduce((a, b) => (a.chance > b.chance ? a : b));
  const stats = baseStats[bestItem.name];

  if (!stats) return null;

  const estimated = Math.round(stats.base * avgMult);
  const range = Math.round(stats.range * avgMult);

  return {
    estimated,
    min: estimated - range,
    max: estimated + range,
    itemName: bestItem.name,
  };
}

// Calculate DPS for comparison
function calculateDPS(damage, attackSpeed = 1) {
  return Math.round(damage * attackSpeed);
}

// Render stats panel
function renderStats() {
  const stats = calculateStats();

  elements.avgMult.textContent = stats.avgMult.toFixed(2) + 'x';
  elements.oreCount.textContent = stats.total;
  elements.oreTypes.textContent = stats.types + '/4';


  const estimate = estimateDamageOrDefense(stats.avgMult, stats.total);
  if (estimate) {
    elements.estDamage.textContent = '~' + estimate.estimated;
  }
  elements.estDamageLabel.textContent = mode === 'weapon' ? 'Est. Damage' : 'Est. Defense';

  if (!estimate) {
    elements.estDamage.textContent = '—';
  }

  // Purity indicator
  if (stats.total > 0) {
    const purityRatio = stats.avgMult / stats.maxMult;
    const indicator = elements.purityIndicator;
    indicator.style.display = 'flex';

    const icon = indicator.querySelector('.purity-icon');
    const text = indicator.querySelector('.purity-text');

    if (purityRatio >= 0.85) {
      indicator.className = 'purity-indicator excellent';
      icon.textContent = '💎';
      text.textContent = 'Excellent Purity! Optimal mix!';
    } else if (purityRatio >= 0.5) {
      indicator.className = 'purity-indicator good';
      icon.textContent = '⚠️';
      text.textContent = 'Good Purity - Consider higher multiplier ores';
    } else {
      indicator.className = 'purity-indicator poor';
      icon.textContent = '❌';
      text.textContent = 'Poor Purity - Average stats down';
    }
  } else {
    elements.purityIndicator.style.display = 'none';
  }

  // Composition breakdown
  if (stats.composition.length > 0) {
    elements.compositionSection.style.display = 'block';
    elements.compositionList.innerHTML = stats.composition
      .map(
        (c) => `
      <div class="comp-item">
        <div class="comp-ore">
          <span class="comp-icon">${c.icon}</span>
          <span class="comp-name">${c.name}</span>
        </div>
        <div class="comp-stats">
          <div class="comp-pct">${c.percentage.toFixed(1)}%</div>
          <div class="comp-mult">×${c.count} @ ${c.mult}x</div>
        </div>
        <div class="comp-bar">
          <div class="comp-fill" style="width:${c.percentage}%"></div>
        </div>
      </div>
    `
      )
      .join('');
  } else {
    elements.compositionSection.style.display = 'none';
  }

  // Traits
  const activeTraits = stats.traits.filter((t) => t.active);
  const inactiveTraits = stats.traits.filter((t) => !t.active);

  if (stats.traits.length > 0) {
    elements.traitsSection.style.display = 'block';
    elements.traitsList.innerHTML = [
      ...activeTraits.map(
        (t) => `
        <div class="trait-card active">
          <span class="trait-icon">${t.oreIcon}</span>
          <div class="trait-content">
            <div class="trait-name">${t.name}</div>
            <div class="trait-desc">${t.desc}</div>
          </div>
          <span class="trait-strength">${t.strength}%</span>
        </div>
      `
      ),
      ...inactiveTraits.map(
        (t) => `
        <div class="trait-card inactive">
          <span class="trait-icon">${t.oreIcon}</span>
          <div class="trait-content">
            <div class="trait-name">${t.name} (${mode === 'weapon' ? 'Armor' : 'Weapon'} only)</div>
            <div class="trait-desc">${t.desc}</div>
          </div>
        </div>
      `
      ),
    ].join('');
  } else {
    elements.traitsSection.style.display = 'none';
  }
}

// Render pot contents
function renderPot() {
  const entries = Object.entries(pot);

  if (entries.length === 0) {
    elements.potContent.innerHTML = `
      <div class="pot-empty">
        <div class="pot-empty-icon">⚗️</div>
        <div>No ores added yet</div>
        <div style="font-size:0.8rem;margin-top:5px">Select ores below to start crafting!</div>
      </div>
    `;
    elements.clearBtn.style.display = 'none';
  } else {
    elements.clearBtn.style.display = 'block';
    elements.potContent.innerHTML = entries
      .map(([oreName, count]) => {
        const ore = ORE_MAP[oreName];
        return `
        <div class="pot-item" data-ore="${oreName}" title="Click to remove one ${oreName}">
          <span class="pot-item-icon">${ore.icon}</span>
          <span class="pot-item-count">×${count}</span>
          <span class="pot-item-name">${oreName}</span>
          <span class="pot-item-remove">−</span>
        </div>
      `;
      })
      .join('');

    elements.potContent.querySelectorAll('.pot-item').forEach((item) => {
      item.addEventListener('click', () => {
        removeOre(item.dataset.ore);
      });
    });
  }
}

// Render probabilities
function renderProbabilities() {
  const stats = calculateStats();
  const thresholds = mode === 'weapon' ? WEAPON_THRESHOLDS : ARMOR_THRESHOLDS;
  const threshold = getThreshold(stats.total, thresholds);

  if (stats.total < 3) {
    elements.probsGrid.innerHTML = `
      <div class="pot-empty" style="padding:20px">
        <div style="font-size:3rem;margin-bottom:10px">📊</div>
        <div>Add at least 3 ores to see probabilities</div>
        ${
          stats.total > 0
            ? `<div style="font-size:0.85rem;color:var(--text-muted);margin-top:8px">Currently: ${stats.total} ore${stats.total > 1 ? 's' : ''} (need ${3 - stats.total} more)</div>`
            : ''
        }
      </div>
    `;
    return;
  }

  const maxChance = Math.max(...threshold.items.map((i) => i.chance));
  elements.probsGrid.innerHTML = threshold.items
    .filter((item) => item.name !== 'Cannot Craft')
    .map(
      (item) => `
      <div class="prob-item ${item.chance === maxChance ? 'highlighted' : ''}">
        <div class="prob-name">
          <span class="prob-icon">${item.icon}</span>
          <span>${item.name}</span>
        </div>
        <span class="prob-chance">${item.chance}%</span>
        <div class="prob-bar">
          <div class="prob-bar-fill" style="width:${item.chance}%"></div>
        </div>
      </div>
    `
    )
    .join('');
}

// Render ore grid
function renderOreGrid() {
  let filteredOres = ORES;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredOres = filteredOres.filter(
      (ore) =>
        ore.name.toLowerCase().includes(query) ||
        ore.location.toLowerCase().includes(query) ||
        ore.rarity.toLowerCase().includes(query)
    );
  }

  if (activeFilter !== 'all') {
    if (activeFilter === 'trait') {
      filteredOres = filteredOres.filter((ore) => ore.trait !== null);
    } else if (activeFilter === 'mythical') {
      filteredOres = filteredOres.filter((ore) => ore.rarity === 'mythical' || ore.rarity === 'divine');
    } else {
      filteredOres = filteredOres.filter((ore) => ore.rarity === activeFilter);
    }
  }

  filteredOres.sort((a, b) => b.mult - a.mult);

  if (filteredOres.length === 0) {
    elements.oreGrid.innerHTML = `
      <div class="empty-grid">
        <div class="empty-grid-icon">🔍</div>
        <div>No ores matching "${searchQuery || activeFilter}"</div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:8px">Try a different search or filter</div>
      </div>
    `;
    return;
  }

  elements.oreGrid.innerHTML = filteredOres
    .map(
      (ore) => `
    <div class="ore-card ${pot[ore.name] ? 'in-pot' : ''}" 
         data-ore="${ore.name}" 
         role="listitem"
         tabindex="0"
         aria-label="${ore.name}, ${ore.mult}x multiplier, ${ore.rarity}">
      ${ore.trait ? '<span class="ore-trait-badge">TRAIT</span>' : ''}
      <div class="ore-icon">${ore.icon}</div>
      <div class="ore-name">${ore.name}</div>
      <div class="ore-mult">${ore.mult}x</div>
      <div class="ore-rarity ${ore.rarity}">${ore.rarity}</div>
    </div>
  `
    )
    .join('');

  elements.oreGrid.querySelectorAll('.ore-card').forEach((card) => {
    const addHandler = () => addOre(card.dataset.ore);
    card.addEventListener('click', addHandler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        addHandler();
      }
    });
  });
}

// Add ore to pot
function addOre(oreName) {
  const numTypes = Object.keys(pot).length;

  if (!pot[oreName] && numTypes >= 4) {
    showToast('Maximum 4 ore types allowed (in-game limit)!', 'error');
    return;
  }

  pot[oreName] = (pot[oreName] || 0) + 1;
  update();

  const ore = ORE_MAP[oreName];
  showToast(`Added ${ore.icon} ${oreName}`, 'success');
}

// Remove ore from pot
function removeOre(oreName) {
  if (pot[oreName] > 1) {
    pot[oreName]--;
  } else {
    delete pot[oreName];
  }
  update();
}

// Clear pot
function clearPot() {
  pot = {};
  update();
  showToast('Pot cleared!', 'success');
}

// Set mode (weapon/armor)
function setMode(newMode) {
  mode = newMode;
  elements.btnWeapon.classList.toggle('active', newMode === 'weapon');
  elements.btnArmor.classList.toggle('active', newMode === 'armor');
  elements.btnWeapon.setAttribute('aria-selected', newMode === 'weapon');
  elements.btnArmor.setAttribute('aria-selected', newMode === 'armor');
  update();
}

// Set filter
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
  renderOreGrid();
}

// Main update function
function update() {
  renderStats();
  renderPot();
  renderProbabilities();
  renderOreGrid();
}

// Switch tool panel
function switchTool(toolName) {
  currentTool = toolName;
  document.querySelectorAll('.tool-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tool === toolName);
    tab.setAttribute('aria-selected', tab.dataset.tool === toolName);
  });
  document.querySelectorAll('.tool-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === 'tool-' + toolName);
  });
  
  // Update nav links active state
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.tool === toolName);
  });
  
  // Smooth scroll to top of content
  window.scrollTo({ top: 200, behavior: 'smooth' });
}

// Generate share link
function generateShareLink() {
  const entries = Object.entries(pot);
  if (entries.length === 0) {
    showToast('Add ores to share a build!', 'error');
    return;
  }

  const buildData = {
    mode,
    ores: entries.map(([name, count]) => `${name}:${count}`).join(','),
  };

  const encoded = btoa(JSON.stringify(buildData));
  const shareUrl = window.location.origin + window.location.pathname + '?build=' + encoded;

  copyToClipboard(shareUrl).then(() => {
    showToast('Build link copied to clipboard! 📋', 'success');
  }).catch(() => {
    showToast('Could not copy link', 'error');
  });
}

// Load shared build from URL
function loadSharedBuild() {
  const params = new URLSearchParams(window.location.search);
  const buildParam = params.get('build');

  if (buildParam) {
    try {
      const buildData = JSON.parse(atob(buildParam));
      mode = buildData.mode || 'weapon';
      pot = {};

      buildData.ores.split(',').forEach((entry) => {
        const [name, count] = entry.split(':');
        if (ORE_MAP[name]) {
          pot[name] = parseInt(count) || 1;
        }
      });

      setMode(mode);
      showToast('Build loaded successfully! ⚔️', 'success');
    } catch (e) {
      console.error('Failed to load build:', e);
    }
  }
}

// Render DPS Calculator
function renderDPSCalculator() {
  const container = document.getElementById('dps-container');
  if (!container) return;

  const stats = calculateStats();
  const estimate = estimateDamageOrDefense(stats.avgMult, stats.total);

  const builds = [
    { name: 'Current Build', damage: estimate?.estimated || 0, attackSpeed: 1.0, traits: stats.traits },
    { name: 'Pure Galaxite', damage: Math.round(80 * 11.5), attackSpeed: 1.0, traits: [] },
    { name: 'Crit Build', damage: Math.round(80 * 8), attackSpeed: 1.0, critChance: 0.2, traits: [] },
  ];

  container.innerHTML = `
    <div class="dps-grid">
      ${builds
        .map(
          (build, i) => `
        <div class="dps-build-card ${i === 0 ? 'primary' : ''}">
          <div class="dps-build-header">
            <span class="dps-build-title">${build.name}</span>
            ${i === 0 ? '<span class="dps-build-badge">Your Build</span>' : ''}
          </div>
          <div class="dps-stat-row">
            <span class="dps-stat-label">Base Damage</span>
            <span class="dps-stat-value">${build.damage}</span>
          </div>
          <div class="dps-stat-row">
            <span class="dps-stat-label">Attack Speed</span>
            <span class="dps-stat-value">${build.attackSpeed}x</span>
          </div>
          <div class="dps-stat-row">
            <span class="dps-stat-label">Effective DPS</span>
            <span class="dps-stat-value">${calculateDPS(build.damage, build.attackSpeed)}</span>
          </div>
          ${
            build.critChance
              ? `
            <div class="dps-stat-row">
              <span class="dps-stat-label">Crit DPS (+50%)</span>
              <span class="dps-stat-value">${Math.round(calculateDPS(build.damage, build.attackSpeed) * (1 + build.critChance * 0.5))}</span>
            </div>
          `
              : ''
          }
        </div>
      `
        )
        .join('')}
    </div>
    ${
      estimate
        ? `
      <div class="dps-comparison">
        <div class="dps-comparison-value">${calculateDPS(estimate.estimated)} DPS</div>
        <div class="dps-comparison-label">Your Current Build Output</div>
      </div>
    `
        : ''
    }
  `;
}

// Render Trade Values
function renderTradeValues() {
  const container = document.getElementById('trade-container');
  if (!container) return;

  const tradeItems = Object.entries(TRADE_VALUES).map(([name, data]) => {
    const ore = ORE_MAP[name];
    return { name, ore, ...data };
  });

  container.innerHTML = `
    <div class="trade-grid">
      ${tradeItems
        .map(
          (item) => `
        <div class="trade-item">
          <div class="trade-item-icon">${item.ore?.icon || '💎'}</div>
          <div class="trade-item-name">${item.name}</div>
          <div class="trade-item-value">${item.value.toLocaleString()}</div>
          <div class="trade-item-trend ${item.trend}">
            ${item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️'}
            ${item.change}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    <p style="text-align:center;color:var(--text-dim);margin-top:20px;font-size:0.85rem;">
      * Trade values are community estimates based on Discord trading channels. Last updated: Dec 2025
    </p>
  `;
}

// Render Build Optimizer
function renderBuildOptimizer() {
  const container = document.getElementById('optimizer-container');
  if (!container) return;

  const builds = mode === 'weapon' ? OPTIMAL_BUILDS.weapon : OPTIMAL_BUILDS.armor;

  container.innerHTML = `
    <div class="optimizer-container">
      <div class="optimizer-settings">
        <div class="optimizer-field">
          <label class="optimizer-label">Goal</label>
          <select class="optimizer-select" id="optimizer-goal">
            ${Object.entries(builds)
              .map(([key, build]) => `<option value="${key}">${build.name}</option>`)
              .join('')}
          </select>
        </div>
        <div class="optimizer-field">
          <label class="optimizer-label">Available Ores (optional)</label>
          <input type="text" class="optimizer-input" id="optimizer-ores" placeholder="e.g., Galaxite, Fireite, Ruby">
        </div>
        <button class="optimizer-btn" onclick="runOptimizer()">🎯 Find Best Build</button>
      </div>
      <div class="optimizer-results" id="optimizer-results">
        <div class="optimizer-result-title">⚔️ Recommended Build</div>
        <p style="color:var(--text-dim)">Select a goal and click "Find Best Build" to get recommendations.</p>
      </div>
    </div>
  `;
}

// Run optimizer
function runOptimizer() {
  const goal = document.getElementById('optimizer-goal').value;
  const builds = mode === 'weapon' ? OPTIMAL_BUILDS.weapon : OPTIMAL_BUILDS.armor;
  const build = builds[goal];

  const results = document.getElementById('optimizer-results');
  if (!build) {
    results.innerHTML = '<p>No build found for selected goal.</p>';
    return;
  }

  results.innerHTML = `
    <div class="optimizer-result-title">⚔️ ${build.name}</div>
    <p style="color:var(--text-dim);margin-bottom:16px">${build.description}</p>
    <div class="optimizer-ore-list">
      ${build.ores
        .map((oreName) => {
          const ore = ORE_MAP[oreName];
          return `
          <div class="optimizer-ore-item">
            <span class="optimizer-ore-icon">${ore?.icon || '💎'}</span>
            <div>
              <div class="optimizer-ore-name">${oreName}</div>
              <div class="optimizer-ore-amount">${ore?.mult || '?'}x multiplier</div>
            </div>
          </div>
        `;
        })
        .join('')}
    </div>
    <button class="optimizer-btn" onclick="applyOptimalBuild('${goal}')">Apply This Build</button>
  `;
}

// Apply optimal build to pot
function applyOptimalBuild(goal) {
  const builds = mode === 'weapon' ? OPTIMAL_BUILDS.weapon : OPTIMAL_BUILDS.armor;
  const build = builds[goal];

  if (!build) return;

  pot = {};
  build.ores.forEach((oreName) => {
    if (ORE_MAP[oreName]) {
      pot[oreName] = 10; // Add 10 of each ore
    }
  });

  update();
  switchTool('calculator');
  showToast('Optimal build applied! 🎯', 'success');
}

// Initialize event listeners
function initEventListeners() {
  elements.btnWeapon?.addEventListener('click', () => setMode('weapon'));
  elements.btnArmor?.addEventListener('click', () => setMode('armor'));
  elements.clearBtn?.addEventListener('click', clearPot);

  elements.searchInput?.addEventListener(
    'input',
    debounce((e) => {
      searchQuery = e.target.value.trim();
      renderOreGrid();
    }, 200)
  );

  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => setFilter(tab.dataset.filter));
  });

  document.querySelectorAll('.tool-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      switchTool(tab.dataset.tool);
      
      // Render tool-specific content
      if (tab.dataset.tool === 'dps') renderDPSCalculator();
      if (tab.dataset.tool === 'trade') renderTradeValues();
      if (tab.dataset.tool === 'optimizer') renderBuildOptimizer();
    });
  });

  // Share button
  document.getElementById('shareBtn')?.addEventListener('click', generateShareLink);
  
  // Copy link button
  document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
    copyToClipboard(window.location.href).then(() => {
      showToast('Link copied! 📋', 'success');
    }).catch(() => {
      showToast('Could not copy link', 'error');
    });
  });

  // Nav links
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      const tool = link.dataset.tool;
      if (tool) {
        e.preventDefault();
        switchTool(tool);
        if (tool === 'dps') renderDPSCalculator();
        if (tool === 'trade') renderTradeValues();
        if (tool === 'optimizer') renderBuildOptimizer();
        
        // Close mobile menu after selection
        const navLinks = document.getElementById('navLinks');
        navLinks?.classList.remove('open');
      }
      
      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
  
  // Mobile hamburger menu
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  
  hamburger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav') && navLinks?.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger?.classList.remove('active');
    }
  });
}

// Initialize
function init() {
  initEventListeners();
  loadSharedBuild();
  renderOreGrid();
  renderStats();
  renderPot();
  renderProbabilities();

}

// Run init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Toggle guide accordion
function toggleGuide(guideId) {
  const content = document.getElementById(guideId);
  const toggle = document.getElementById(guideId + '-toggle');
  
  if (content && toggle) {
    const isOpen = content.classList.contains('open');
    
    // Close all other guides
    document.querySelectorAll('.guide-content').forEach(el => {
      el.classList.remove('open');
    });
    document.querySelectorAll('.guide-toggle').forEach(el => {
      el.classList.remove('open');
    });
    
    // Toggle this guide
    if (!isOpen) {
      content.classList.add('open');
      toggle.classList.add('open');
      
      // Scroll into view
      setTimeout(() => {
        content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }
}

// Expose functions globally for onclick handlers
window.addOre = addOre;
window.removeOre = removeOre;
window.runOptimizer = runOptimizer;
window.applyOptimalBuild = applyOptimalBuild;
window.generateShareLink = generateShareLink;
window.switchTool = switchTool;
window.toggleGuide = toggleGuide;

