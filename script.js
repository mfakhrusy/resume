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
        let isHiding = false;
        
        // Normal distribution random (Box-Muller transform)
        const randomNormal = (mean = 0.5, stdDev = 0.15) => {
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            return Math.max(0.15, Math.min(0.85, mean + z * stdDev)); // Clamp 15%-85%
        };
        
        const setSide = (side) => {
            robot.classList.remove('side-left', 'side-right');
            robot.classList.add(`side-${side}`);
        };
        
        // Initialize on right side
        setSide('right');
        
        const showRobot = (className = 'visible') => {
            if (isHiding) return;
            clearTimeout(hideTimeout);
            robot.classList.remove('peek', 'visible', 'hiding');
            robot.classList.add(className);
        };
        
        const hideRobot = (delay = 2000) => {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                if (!isHiding) {
                    robot.classList.remove('peek', 'visible');
                }
            }, delay);
        };
        
        const teleportRobot = () => {
            isHiding = true;
            robot.classList.remove('peek', 'visible');
            robot.classList.add('hiding');
            
            // After hide animation, teleport
            setTimeout(() => {
                // Random side
                const newSide = Math.random() > 0.5 ? 'left' : 'right';
                setSide(newSide);
                
                // Normal distribution Y position (15% - 85% of viewport)
                const yPercent = randomNormal(0.5, 0.18) * 100;
                robot.style.top = `${yPercent}%`;
                
                robot.classList.remove('hiding');
                isHiding = false;
                
                // Peek after repositioning
                setTimeout(() => {
                    showRobot('peek');
                    hideRobot(3000);
                }, 800);
            }, 500);
        };
        
        // Click to teleport
        robot.addEventListener('click', (e) => {
            e.stopPropagation();
            teleportRobot();
        });
        
        // Hover behavior
        robot.addEventListener('mouseenter', () => {
            showRobot('visible');
        });
        
        robot.addEventListener('mouseleave', () => {
            hideRobot(1500);
        });
        
        // Initial peek after 3 seconds
        setTimeout(() => {
            showRobot('peek');
            hideRobot(2500);
        }, 3000);
        
        // Random peek every 20-40 seconds
        setInterval(() => {
            if (!robot.classList.contains('visible') && !isHiding) {
                showRobot('peek');
                hideRobot(3000);
            }
        }, Math.random() * 20000 + 20000);
        
        // Eyes follow cursor
        const pupils = robot.querySelectorAll('.pupil');
        const maxMove = 3;
        
        document.addEventListener('mousemove', (e) => {
            const robotRect = robot.getBoundingClientRect();
            const robotCenterX = robotRect.left + robotRect.width / 2;
            const robotCenterY = robotRect.top + robotRect.height / 2;
            
            const deltaX = e.clientX - robotCenterX;
            const deltaY = e.clientY - robotCenterY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            let moveX = (deltaX / Math.max(distance, 1)) * maxMove;
            const moveY = (deltaY / Math.max(distance, 1)) * maxMove;
            
            // Invert X when robot is flipped on left side
            if (robot.classList.contains('side-left')) {
                moveX = -moveX;
            }
            
            pupils.forEach(pupil => {
                pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
        
        // Mobile: crossing behavior
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (isMobile) {
            let isCrossing = false;
            let crossingTimeout = null;
            let crossingInterval = null;
            
            const resetRobot = () => {
                robot.classList.remove('crossing', 'crossing-left', 'crossing-right', 'floating', 'stopped', 'vanish');
                robot.style.left = '';
                robot.style.right = '';
                robot.style.transition = '';
                isCrossing = false;
            };
            
            const startCrossing = () => {
                if (isCrossing) return;
                isCrossing = true;
                
                // Random direction
                const goingRight = Math.random() > 0.5;
                const startSide = goingRight ? 'crossing-right' : 'crossing-left';
                
                // Random Y position (20% - 80%)
                const yPos = (Math.random() * 60 + 20);
                
                // Reset position
                robot.classList.remove('side-left', 'side-right', 'peek', 'visible', 'hiding', 'crossing', 'crossing-left', 'crossing-right', 'stopped', 'vanish');
                robot.classList.add(startSide, 'crossing', 'floating');
                robot.style.top = `${yPos}%`;
                robot.style.transition = '';
                
                // Start crossing after a frame
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (goingRight) {
                            robot.style.left = `calc(100vw + 80px)`;
                        } else {
                            robot.style.right = `calc(100vw + 80px)`;
                        }
                    });
                });
                
                // Reset after crossing
                crossingTimeout = setTimeout(() => {
                    resetRobot();
                }, 9000);
            };
            
            // Click to stop, vanish, then reappear
            robot.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Stop movement immediately
                clearTimeout(crossingTimeout);
                const currentLeft = robot.getBoundingClientRect().left;
                robot.style.transition = 'none';
                robot.style.left = `${currentLeft}px`;
                robot.style.right = 'auto';
                robot.classList.remove('crossing', 'crossing-left', 'crossing-right', 'floating');
                robot.classList.add('stopped');
                
                // Vanish after 1 second
                setTimeout(() => {
                    robot.classList.add('vanish');
                    
                    // Reappear after vanish animation
                    setTimeout(() => {
                        resetRobot();
                        startCrossing();
                    }, 400);
                }, 1000);
            });
            
            // Initial crossing after 4s
            setTimeout(startCrossing, 4000);
            
            // Random crossings every 20-40s
            crossingInterval = setInterval(() => {
                if (!isCrossing) {
                    startCrossing();
                }
            }, Math.random() * 20000 + 20000);
        }
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
