document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Year
    document.getElementById('year').textContent = new Date().getFullYear();

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
            setTimeout(typeText, 100); // Typing speed
        } else {
            // Blinking cursor effect after typing
            setInterval(() => {
                if (titleElement.textContent.endsWith('_')) {
                    titleElement.textContent = textToType;
                } else {
                    titleElement.textContent = textToType + '_';
                }
            }, 800);
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
