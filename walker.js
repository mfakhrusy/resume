document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const stickWalkerTrack = document.querySelector('.hero-stick-walker');
    const stickWalker = document.querySelector('.stick-walker');
    const sorbetBubbles = document.querySelectorAll('.sorbet-bubble');

    if (!stickWalkerTrack || !stickWalker) {
        return;
    }

    let stickWalkerTimer;
    let walkerX = -30;
    let walkerSpeed = 34;
    let lastWalkerTimestamp = 0;
    let isSorbetBlowing = false;
    let sorbetStopHandledThisLap = false;

    const walkerStartX = -30;
    const sorbetPauseProgress = 0.25;

    function getActiveTheme() {
        return document.documentElement.getAttribute('data-theme') || body.getAttribute('data-theme') || 'simple';
    }

    function isSorbetThemeActive() {
        return getActiveTheme() === 'sorbet';
    }

    function filterThemeForWalker() {
        const activeTheme = getActiveTheme();
        return activeTheme === 'terminal' || activeTheme === 'signal' || activeTheme === 'sorbet';
    }

    function randomizeSorbetBubbleMotion(bubble) {
        const driftX = 5 + Math.random() * 5;
        const driftY = 26 + Math.random() * 10;
        const duration = 2.25 + Math.random() * 1.05;
        const wobbleDuration = 0.7 + Math.random() * 0.5;
        const scaleStart = 0.24 + Math.random() * 0.06;
        const scaleEnd = 1.05 + Math.random() * 0.2;

        bubble.style.setProperty('--bubble-drift-x', `${driftX.toFixed(2)}px`);
        bubble.style.setProperty('--bubble-drift-y', `${driftY.toFixed(2)}px`);
        bubble.style.setProperty('--bubble-duration', `${duration.toFixed(2)}s`);
        bubble.style.setProperty('--bubble-wobble-duration', `${wobbleDuration.toFixed(2)}s`);
        bubble.style.setProperty('--bubble-scale-start', scaleStart.toFixed(2));
        bubble.style.setProperty('--bubble-scale-end', scaleEnd.toFixed(2));
    }

    function primeSorbetBubbles() {
        sorbetBubbles.forEach((bubble) => {
            bubble.style.setProperty('--bubble-delay', '0s');
            randomizeSorbetBubbleMotion(bubble);
        });
    }

    function setSorbetBlowingState(shouldBlow) {
        if (isSorbetBlowing === shouldBlow) return;
        isSorbetBlowing = shouldBlow;
        stickWalkerTrack.classList.toggle('is-blowing', shouldBlow);

        if (shouldBlow) {
            primeSorbetBubbles();
        }
    }

    function setStickWalkerState(state) {
        stickWalkerTrack.classList.remove('is-running');

        if (state === 'running' && !isSorbetThemeActive()) {
            stickWalkerTrack.classList.add('is-running');
            walkerSpeed = 68;
            return;
        }

        walkerSpeed = 34;
    }

    function scheduleStickWalkerState() {
        clearTimeout(stickWalkerTimer);

        if (!filterThemeForWalker()) {
            setStickWalkerState('walking');
            return;
        }

        const roll = Math.random();
        let nextState = 'walking';
        let duration = 3000 + Math.random() * 2200;

        if (roll < 0.35) {
            nextState = 'running';
            duration = 1800 + Math.random() * 1700;
        }

        setStickWalkerState(nextState);
        stickWalkerTimer = setTimeout(scheduleStickWalkerState, duration);
    }

    function animateStickWalker(timestamp) {
        if (filterThemeForWalker()) {
            if (!lastWalkerTimestamp) {
                lastWalkerTimestamp = timestamp;
            }

            const deltaSeconds = (timestamp - lastWalkerTimestamp) / 1000;
            lastWalkerTimestamp = timestamp;
            const loopWidth = stickWalkerTrack.clientWidth + 20;
            const loopDistance = loopWidth - walkerStartX;
            const sorbetStopX = walkerStartX + loopDistance * sorbetPauseProgress;

            if (isSorbetThemeActive()) {
                const reachedSorbetStop = !sorbetStopHandledThisLap && walkerX >= sorbetStopX;
                if (reachedSorbetStop) {
                    walkerX = sorbetStopX;
                    sorbetStopHandledThisLap = true;
                    setSorbetBlowingState(true);
                }

                if (sorbetStopHandledThisLap) {
                    stickWalker.style.left = `${walkerX}px`;
                    stickWalkerTrack.style.setProperty('--walker-x', `${walkerX}px`);
                    window.requestAnimationFrame(animateStickWalker);
                    return;
                }
            } else {
                sorbetStopHandledThisLap = false;
                setSorbetBlowingState(false);
            }

            walkerX += walkerSpeed * deltaSeconds;

            if (walkerX > loopWidth) {
                walkerX = walkerStartX;
                sorbetStopHandledThisLap = false;
                setSorbetBlowingState(false);
            }

            stickWalker.style.left = `${walkerX}px`;
            stickWalkerTrack.style.setProperty('--walker-x', `${walkerX}px`);
        } else {
            lastWalkerTimestamp = timestamp;
            sorbetStopHandledThisLap = false;
            setSorbetBlowingState(false);
            stickWalker.style.left = `${walkerStartX}px`;
            stickWalkerTrack.style.setProperty('--walker-x', `${walkerStartX}px`);
        }

        window.requestAnimationFrame(animateStickWalker);
    }

    sorbetBubbles.forEach((bubble) => {
        bubble.addEventListener('animationiteration', (event) => {
            if (event.animationName !== 'sorbet-bubble-float') return;
            randomizeSorbetBubbleMotion(event.currentTarget);
        });
    });

    window.addEventListener('themechange', scheduleStickWalkerState);

    scheduleStickWalkerState();
    window.requestAnimationFrame(animateStickWalker);
});
