document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Clip-Path Scroll Reveal Animation using Intersection Observer
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -80px 0px',
                threshold: 0
            }
        );

        // Reveal elements already in viewport immediately, observe the rest
        const windowHeight = window.innerHeight;
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                el.classList.add('revealed');
            } else {
                revealObserver.observe(el);
            }
        });
    } else {
        // Fallback for older browsers
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('revealed');
        });
    }

    // =============================================
    // PEEKING ROBOT - Shy periodic peek
    // =============================================
    
    const robot = document.querySelector('.peeking-robot');
    if (robot) {
        let hideTimeout = null;
        
        const showRobot = (className = 'visible') => {
            clearTimeout(hideTimeout);
            robot.classList.remove('peek', 'visible');
            robot.classList.add(className);
        };
        
        const hideRobot = (delay = 2000) => {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                robot.classList.remove('peek', 'visible');
            }, delay);
        };
        
        // Hover behavior
        robot.addEventListener('mouseenter', () => {
            showRobot('visible');
        });
        
        robot.addEventListener('mouseleave', () => {
            hideRobot(1500); // Stay visible 1.5s after mouse leaves
        });
        
        // Initial peek after 3 seconds
        setTimeout(() => {
            showRobot('peek');
            hideRobot(2500);
        }, 3000);
        
        // Random peek every 20-40 seconds
        setInterval(() => {
            if (!robot.classList.contains('visible')) {
                showRobot('peek');
                hideRobot(3000);
            }
        }, Math.random() * 20000 + 20000);
        
        // Eyes follow cursor
        const pupils = robot.querySelectorAll('.pupil');
        const maxMove = 3; // Max pixels pupils can move
        
        document.addEventListener('mousemove', (e) => {
            const robotRect = robot.getBoundingClientRect();
            const robotCenterX = robotRect.left + robotRect.width / 2;
            const robotCenterY = robotRect.top + robotRect.height / 2;
            
            // Calculate direction to cursor
            const deltaX = e.clientX - robotCenterX;
            const deltaY = e.clientY - robotCenterY;
            
            // Normalize and clamp movement
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const moveX = (deltaX / Math.max(distance, 1)) * maxMove;
            const moveY = (deltaY / Math.max(distance, 1)) * maxMove;
            
            pupils.forEach(pupil => {
                pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }

    // Console System Init
    console.log(
        "%c SYSTEM INITIALIZED. WELCOME, USER. ",
        "background: #000; color: #00f3ff; font-family: monospace; padding: 10px; border: 1px solid #00f3ff;"
    );

    // Typing Effect for Title
    const titleElement = document.getElementById('typing-title');
    const textToType = "Software Engineer";
    let charIndex = 0;

    function typeText() {
        if (charIndex < textToType.length) {
            titleElement.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(typeText, 50); // Typing speed
        } else {
            // Blinking cursor effect after typing
            setInterval(() => {
                if (titleElement.textContent.endsWith('_')) {
                    titleElement.textContent = textToType;
                } else {
                    titleElement.textContent = textToType + '_';
                }
            }, 400);
        }
    }

    // Start typing after a short delay
    setTimeout(typeText, 500);

    // Morphing ASCII Art System - progressively more elaborate
    const asciiShapes = {
        // Simple theme: minimal → ornate
        simple: [
            `· · · · ·`,
        ],
        simple2: [
            `    ─────────────────────    `,
            `      ◇     ◇     ◇     ◇      `,
            `    ─────────────────────    `,
        ],
        simple3: [
            `    ╭─────────────────────────────╮    `,
            `    │   ◆ ── ◇ ── ◆ ── ◇ ── ◆   │    `,
            `    │       ╰─────────╯           │    `,
            `    ╰─────────────────────────────╯    `,
        ],
        simple4: [
            `       ╔═══════════════════════════════════╗       `,
            `    ╔══╝   ░░▒▒▓▓████████████▓▓▒▒░░        ╚══╗    `,
            `    ║    ◇ ─── ◆ ─── ◇ ─── ◆ ─── ◇ ─── ◆    ║    `,
            `    ║  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐  ║    `,
            `    ║  │ ▓▓▓ │───│ ▒▒▒ │───│ ░░░ │───│ ▓▓▓ │  ║    `,
            `    ║  └─────┘   └─────┘   └─────┘   └─────┘  ║    `,
            `    ╚══╗        ░░▒▒▓▓████████████▓▓▒▒░░   ╔══╝    `,
            `       ╚═══════════════════════════════════╝       `,
        ],
        // Terminal theme: boot sequence → full system
        terminal: [
            `> _`,
        ],
        terminal2: [
            `┌──────────────────────────────┐`,
            `│  BOOT SEQUENCE INITIATED...  │`,
            `└──────────────────────────────┘`,
        ],
        terminal3: [
            `╔══════════════════════════════════════════╗`,
            `║  ┌─────────────────────────────────────┐ ║`,
            `║  │ [■■■■■■■■■■░░░░░░░░░░] 50% LOADED  │ ║`,
            `║  │ > LOADING MODULES...               │ ║`,
            `║  └─────────────────────────────────────┘ ║`,
            `╚══════════════════════════════════════════╝`,
        ],
        terminal4: [
            `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`,
            `┃  ╔═══════════════════════════════════════════════╗  ┃`,
            `┃  ║  ██████╗ ███████╗ █████╗ ██████╗ ██╗   ██╗   ║  ┃`,
            `┃  ║  ██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝   ║  ┃`,
            `┃  ║  ██████╔╝█████╗  ███████║██║  ██║ ╚████╔╝    ║  ┃`,
            `┃  ║  ██╔══██╗██╔══╝  ██╔══██║██║  ██║  ╚██╔╝     ║  ┃`,
            `┃  ║  ██║  ██║███████╗██║  ██║██████╔╝   ██║      ║  ┃`,
            `┃  ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝      ║  ┃`,
            `┃  ╚═══════════════════════════════════════════════╝  ┃`,
            `┃  [■■■■■■■■■■■■■■■■■■■■] 100% ▓▓▓ SYSTEM ONLINE ▓▓▓  ┃`,
            `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
        ],
        // Retro theme: simple banner → full nostalgia
        retro: [
            `~ * ~`,
        ],
        retro2: [
            `+---------------------------+`,
            `|   * WELCOME VISITOR *     |`,
            `+---------------------------+`,
        ],
        retro3: [
            `#==========================================#`,
            `|     ~~~ BEST VIEWED AT 800x600 ~~~       |`,
            `|  [HOME] [ABOUT] [LINKS] [GUESTBOOK]      |`,
            `#==========================================#`,
        ],
        retro4: [
            `*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*`,
            `*                                                   *`,
            `=    ######  ###  ###### ######    # ####   ####    =`,
            `*    #    #  # #    #    #     #  ## #   # #    #   *`,
            `=    ######  ###    #    ######  # # ####  #    #   =`,
            `*    #   #   # #    #    #   #     # #   # #    #   *`,
            `=    #    # #   #   #    #    #    # #   #  ####    =`,
            `*                                                   *`,
            `=   +-----+ +-----+ +-----+ +-------+ +--------+    =`,
            `*   |HOME | |ABOUT| |LINKS| |AWARDS | |GUESTBOOK    *`,
            `=   +-----+ +-----+ +-----+ +-------+ +--------+    =`,
            `*                                                   *`,
            `*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*`,
        ],
    };

    const asciiElement = document.getElementById('ascii-art');
    let currentTheme = 'simple';
    let currentShapeIndex = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getShapesForTheme(theme) {
        const prefix = theme === 'simple' ? 'simple' : theme;
        return Object.keys(asciiShapes)
            .filter(key => key === prefix || key.startsWith(prefix))
            .map(key => asciiShapes[key]);
    }

    function morphToShape(newLines, animate = true) {
        if (prefersReducedMotion || !animate) {
            asciiElement.textContent = newLines.join('\n');
            return;
        }

        const container = asciiElement;
        container.innerHTML = '';
        
        newLines.forEach((line, lineIndex) => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'ascii-line';
            
            [...line].forEach((char, charIndex) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.className = 'ascii-char';
                span.style.animationDelay = `${(lineIndex * line.length + charIndex) * 8}ms`;
                lineDiv.appendChild(span);
            });
            
            container.appendChild(lineDiv);
        });
    }

    function cycleAsciiArt() {
        const shapes = getShapesForTheme(currentTheme);
        const isLastShape = currentShapeIndex === shapes.length - 1;
        currentShapeIndex = (currentShapeIndex + 1) % shapes.length;
        morphToShape(shapes[currentShapeIndex]);
        
        // Longer delay after last shape before restarting
        const nextDelay = isLastShape ? 8000 : 5000;
        setTimeout(cycleAsciiArt, nextDelay);
    }

    function updateAsciiArt(theme, animate = true) {
        currentTheme = theme;
        currentShapeIndex = 0;
        const shapes = getShapesForTheme(theme);
        morphToShape(shapes[0], animate);
    }

    updateAsciiArt('simple', false); // Initial load without animation
    
    if (!prefersReducedMotion) {
        setTimeout(cycleAsciiArt, 5000);
    }


    // Real-time Clock
    const clockElement = document.getElementById('clock');
    
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock(); // Initial call


    // THEME DROPDOWN LOGIC
    const themeSelect = document.getElementById('theme-select');
    const body = document.body;
    
    // Default to 'simple' on load (no localStorage check)
    // The HTML structure defaults to simple, so we just ensure the dropdown matches
    themeSelect.value = 'simple';
    // No need to updateDynamicContent('simple') here as HTML is static simple by default
    // unless we want to be super safe against browser caching input values
    
    themeSelect.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        
        if (selectedTheme === 'simple') {
            body.removeAttribute('data-theme');
        } else {
            body.setAttribute('data-theme', selectedTheme);
        }
        
        // localStorage removed as requested
        updateDynamicContent(selectedTheme);
        updateAsciiArt(selectedTheme);
    });

    // Accordion functionality
    const accordionToggles = document.querySelectorAll('.accordion-toggle');
    accordionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
            const content = toggle.nextElementSibling;
            content.classList.toggle('open');
        });
    });

    // =============================================
    // PORTAL GRID - Simple click to navigate + 3D Tilt
    // =============================================
    
    const portalCards = document.querySelectorAll('.portal-card');
    const tiltStrength = 15; // Max rotation in degrees
    const glareOpacity = 0.15; // Glare effect intensity
    
    portalCards.forEach(card => {
        // Add glare overlay element
        const glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
        
        card.addEventListener('click', () => {
            const href = card.dataset.href;
            if (href) {
                window.open(href, '_blank');
            }
        });
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate rotation based on cursor position relative to center
            const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -tiltStrength;
            const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * tiltStrength;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Move glare based on cursor position
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareOpacity}) 0%, transparent 60%)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            glare.style.background = 'transparent';
        });
    });

    // =============================================
    // MAGNETIC HOVER EFFECT - Social Links
    // =============================================
    
    const magneticElements = document.querySelectorAll('.social-links a');
    const magnetStrength = 0.4; // How strongly elements follow cursor (0-1)
    const magnetRadius = 50; // Pixel radius of magnetic effect
    
    magneticElements.forEach(el => {
        el.style.transition = 'transform 0.2s ease-out';
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            
            const moveX = deltaX * magnetStrength;
            const moveY = deltaY * magnetStrength;
            
            el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });

    function updateDynamicContent(theme) {
        // Dynamic Text Content
        const textElements = document.querySelectorAll('[data-text-terminal]');
        
        textElements.forEach(el => {
            if (theme === 'retro') {
                if (el.dataset.textRetro) {
                    el.textContent = el.dataset.textRetro;
                }
            } else if (theme === 'terminal') {
                if (el.dataset.textTerminal) {
                    el.textContent = el.dataset.textTerminal;
                }
            } else {
                // Default / Simple Theme
                // We need to store the default text somewhere if we want to revert, 
                // but since we are swapping, we can just use the initial HTML content as "Simple"
                // However, once swapped, the initial content is lost.
                // WE NEED TO FIX THIS: The initial load has the Simple text.
                // We should add a 'data-text-simple' attribute to be safe, OR
                // assume the HTML source *is* simple, but we need to store it before swapping.
                
                // Better approach: Let's assume the HTML has the simple text. 
                // But if we are already in Terminal mode (from load), the text is already swapped?
                // No, on load `updateDynamicContent` is called.
                
                // Let's add data-text-simple to all elements in HTML for robustness, 
                // or just define them here if missing.
                // Actually, finding the "Simple" text is tricky if we don't store it.
                // Let's rely on a new data attribute, or just hardcode for now? 
                // Hardcoding is bad.
                // Let's use the 'data-text-simple' convention.
                
                if (el.dataset.textSimple) {
                    el.textContent = el.dataset.textSimple;
                } else {
                    // Fallback to what's in the DOM if we haven't swapped yet? 
                    // No, if we swap to Terminal then back to Simple, we lose the text.
                    // We must add data-text-simple attributes to HTML.
                }
            }
        });
    }
});
