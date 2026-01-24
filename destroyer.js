/**
 * Document Destroyer - Weapon Cache System
 * A fun interactive feature that lets users "destroy" the document with weapons
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create the weapon cache UI
    createWeaponCache();
    
    // Create crack layer in the main container (so cracks scroll with content)
    createCrackLayer();
    
    // Create custom hammer cursor element
    createHammerCursor();
    
    // Setup hammer mode
    setupHammerMode();
});

/**
 * Create the weapon cache UI in bottom-left corner
 */
function createWeaponCache() {
    const cache = document.createElement('div');
    cache.className = 'weapon-cache';
    cache.innerHTML = `
        <div class="weapon-tray">
            <div class="weapon-item" data-weapon="hammer" data-tooltip="Toy Hammer">
                <img src="toy-hammer.png" alt="Hammer">
            </div>
        </div>
        <button class="cache-toggle" aria-label="Open weapon cache">
            <span class="cache-toggle-icon cache-toggle-backpack">🎒</span>
            <span class="cache-toggle-icon cache-toggle-close">✕</span>
        </button>
    `;
    
    document.body.appendChild(cache);
    
    // Toggle cache open/close (or deactivate weapon on mobile)
    const toggle = cache.querySelector('.cache-toggle');
    const toggleIcon = cache.querySelector('.cache-toggle-icon');
    
    toggle.addEventListener('click', () => {
        // If in hammer mode, clicking toggle deactivates the weapon
        if (document.body.classList.contains('hammer-mode')) {
            deactivateWeapon();
            return;
        }
        cache.classList.toggle('open');
    });
    
    // Weapon selection
    const weapons = cache.querySelectorAll('.weapon-item');
    weapons.forEach(weapon => {
        weapon.addEventListener('click', () => {
            const weaponType = weapon.dataset.weapon;
            activateWeapon(weaponType, weapon);
            cache.classList.remove('open');
        });
    });
    
    // Create ESC hint text
    const escHint = document.createElement('div');
    escHint.className = 'weapon-esc-hint';
    escHint.textContent = 'Press ESC to cancel';
    document.body.appendChild(escHint);
}

/**
 * Create the crack layer inside the main container
 */
function createCrackLayer() {
    const container = document.querySelector('.container') || document.body;
    
    // Make container position relative for absolute crack positioning
    container.style.position = 'relative';
    
    const crackLayer = document.createElement('div');
    crackLayer.className = 'crack-layer';
    crackLayer.id = 'crack-layer';
    container.appendChild(crackLayer);
}

/**
 * Create the custom hammer cursor element
 */
function createHammerCursor() {
    const hammer = document.createElement('img');
    hammer.className = 'hammer-cursor';
    hammer.id = 'hammer-cursor';
    hammer.src = 'toy-hammer.png';
    hammer.alt = '';
    document.body.appendChild(hammer);
}



/**
 * Activate a weapon
 */
function activateWeapon(weaponType, element) {
    // Deactivate any current weapon
    document.querySelectorAll('.weapon-item').forEach(w => w.classList.remove('active'));
    
    if (weaponType === 'hammer') {
        element.classList.add('active');
        document.body.classList.add('hammer-mode');
        document.body.style.userSelect = 'none';
    }
}

/**
 * Deactivate current weapon
 */
function deactivateWeapon() {
    document.body.classList.remove('hammer-mode');
    document.querySelectorAll('.weapon-item').forEach(w => w.classList.remove('active'));
    document.body.style.userSelect = '';
}

/**
 * Setup hammer mode interactions
 */
function setupHammerMode() {
    const hammerCursor = document.getElementById('hammer-cursor');
    
    // Track mouse movement for custom cursor using page coordinates
    document.addEventListener('mousemove', (e) => {
        if (!document.body.classList.contains('hammer-mode')) return;
        
        // Use pageX/pageY for document-relative positioning
        hammerCursor.style.left = (e.pageX - 64) + 'px';
        hammerCursor.style.top = (e.pageY - 64) + 'px';
    });
    
    // Handle clicks (hammer swing)
    document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('hammer-mode')) return;
        
        // Don't trigger on UI elements
        if (e.target.closest('.weapon-cache') || 
            e.target.closest('.weapon-esc-hint') ||
            e.target.closest('.system-status-bar')) {
            return;
        }
        
        // Update position using page coordinates (document-relative)
        const x = e.pageX - 64;
        const y = e.pageY - 64;
        hammerCursor.style.left = x + 'px';
        hammerCursor.style.top = y + 'px';
        
        // Swing animation (just rotation, position is set via left/top)
        hammerCursor.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(-40deg)', offset: 0.35 },
            { transform: 'rotate(0deg)' }
        ], {
            duration: 180,
            easing: 'ease-out'
        });
        
        // Screen shake
        document.body.classList.add('screen-shake');
        
        // Create crack at hammer HEAD position (offset from cursor toward upper-left)
        setTimeout(() => {
            const crackX = e.pageX - 100;
            const crackY = e.pageY - 50;
            createCrack(crackX, crackY);
            createImpactFlash(crackX, crackY);
        }, 60);
        
        // Reset shake
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 150);
    });
    
    // ESC to cancel weapon mode
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('hammer-mode')) {
            deactivateWeapon();
        }
    });
}

/**
 * Create a crack at the specified position
 */
function createCrack(pageX, pageY) {
    const crackLayer = document.getElementById('crack-layer');
    if (!crackLayer) return;
    
    // Get container offset to convert page coords to relative coords
    const container = crackLayer.parentElement;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate position relative to container
    const x = pageX - rect.left - scrollLeft;
    const y = pageY - rect.top - scrollTop;
    
    // Generate random crack SVG
    const crackSvg = generateCrackSVG();
    
    const crackEl = document.createElement('div');
    crackEl.className = 'crack';
    crackEl.innerHTML = crackSvg;
    
    // Random rotation for variety
    const rotation = Math.random() * 360;
    crackEl.style.left = x + 'px';
    crackEl.style.top = y + 'px';
    crackEl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    
    crackLayer.appendChild(crackEl);
}

/**
 * Create impact flash effect
 */
function createImpactFlash(pageX, pageY) {
    const flash = document.createElement('div');
    flash.className = 'impact-flash';
    flash.style.left = pageX + 'px';
    flash.style.top = pageY + 'px';
    flash.style.position = 'absolute';
    
    const crackLayer = document.getElementById('crack-layer');
    if (!crackLayer) return;
    
    const container = crackLayer.parentElement;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const x = pageX - rect.left - scrollLeft;
    const y = pageY - rect.top - scrollTop;
    
    flash.style.left = x + 'px';
    flash.style.top = y + 'px';
    
    crackLayer.appendChild(flash);
    
    // Remove after animation
    setTimeout(() => flash.remove(), 200);
}

/**
 * Generate a random crack SVG
 */
function generateCrackSVG() {
    const size = 80 + Math.random() * 60; // 80-140px
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Generate random crack lines from center
    const numBranches = 4 + Math.floor(Math.random() * 4); // 4-7 branches
    let paths = '';
    
    for (let i = 0; i < numBranches; i++) {
        const angle = (i / numBranches) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const length = 20 + Math.random() * (size / 2 - 10);
        
        // Main branch
        const endX = centerX + Math.cos(angle) * length;
        const endY = centerY + Math.sin(angle) * length;
        
        // Add some jaggedness
        const midX = centerX + Math.cos(angle) * (length * 0.5) + (Math.random() - 0.5) * 10;
        const midY = centerY + Math.sin(angle) * (length * 0.5) + (Math.random() - 0.5) * 10;
        
        paths += `<path d="M ${centerX} ${centerY} L ${midX} ${midY} L ${endX} ${endY}" 
                        stroke="rgba(0,0,0,0.7)" stroke-width="${1 + Math.random() * 2}" 
                        fill="none" stroke-linecap="round"/>`;
        
        // Sub-branches
        if (Math.random() > 0.4) {
            const subAngle = angle + (Math.random() - 0.5) * 1.2;
            const subLength = length * 0.4 + Math.random() * 10;
            const subEndX = midX + Math.cos(subAngle) * subLength;
            const subEndY = midY + Math.sin(subAngle) * subLength;
            
            paths += `<path d="M ${midX} ${midY} L ${subEndX} ${subEndY}" 
                            stroke="rgba(0,0,0,0.5)" stroke-width="${0.5 + Math.random()}" 
                            fill="none" stroke-linecap="round"/>`;
        }
    }
    
    // Add some small fragments/shatter marks near center
    for (let i = 0; i < 3; i++) {
        const fragX = centerX + (Math.random() - 0.5) * 20;
        const fragY = centerY + (Math.random() - 0.5) * 20;
        const fragSize = 2 + Math.random() * 4;
        
        paths += `<polygon points="${fragX},${fragY - fragSize} ${fragX + fragSize},${fragY + fragSize} ${fragX - fragSize},${fragY + fragSize/2}" 
                          fill="rgba(0,0,0,0.3)"/>`;
    }
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" 
                 style="overflow:visible">${paths}</svg>`;
}
