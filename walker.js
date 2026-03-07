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
    const bubbleSourceX = -10;
    const bubbleSourceY = 0;
    const bubbleDelayStep = 0.28;
    const bubbleDelayJitter = 0.08;
    const bubbleLaneOffsets = [-1.2, -0.6, 0, 0.6, 1.2];
    const bubbleDelayByIndex = Array.from({ length: sorbetBubbles.length }, (_, index) => {
        return index * bubbleDelayStep + Math.random() * bubbleDelayJitter;
    });

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
        const driftX = 50 + Math.random() * 2.8;
        const driftY = 28 + Math.random() * 6;
        const duration = 2.7 + Math.random() * 0.55;
        const wobbleDuration = 1.0 + Math.random() * 0.25;
        const scaleStart = 0.24 + Math.random() * 0.03;
        const scaleEnd = 1.08 + Math.random() * 0.5;

        bubble.style.setProperty('--bubble-drift-x', `${driftX.toFixed(2)}px`);
        bubble.style.setProperty('--bubble-drift-y', `${driftY.toFixed(2)}px`);
        bubble.style.setProperty('--bubble-duration', `${duration.toFixed(2)}s`);
        bubble.style.setProperty('--bubble-wobble-duration', `${wobbleDuration.toFixed(2)}s`);
        bubble.style.setProperty('--bubble-scale-start', scaleStart.toFixed(2));
        bubble.style.setProperty('--bubble-scale-end', scaleEnd.toFixed(2));
    }

    function primeSorbetBubbles() {
        sorbetBubbles.forEach((bubble, index) => {
            const laneOffset = bubbleLaneOffsets[index] || 0;
            const delay = bubbleDelayByIndex[index] || 0;

            bubble.style.setProperty('--bubble-delay', `${delay.toFixed(2)}s`);
            bubble.style.setProperty('--bubble-x', `${(bubbleSourceX + laneOffset).toFixed(2)}px`);
            bubble.style.setProperty('--bubble-y', `${bubbleSourceY.toFixed(2)}px`);
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

    window.addEventListener('themechange', scheduleStickWalkerState);

    scheduleStickWalkerState();
    window.requestAnimationFrame(animateStickWalker);
});
