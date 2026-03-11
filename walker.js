document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const stickWalkerTrack = document.querySelector('.hero-stick-walker');
    const stickWalker = document.querySelector('.stick-walker');
    const sorbetBubbles = document.querySelectorAll('.sorbet-bubble');
    const wormSvg = document.querySelector('.worm-svg');
    const wormSegments = Array.from(wormSvg?.querySelectorAll('.worm-segment') || []);
    const wormRings = Array.from(wormSvg?.querySelectorAll('.worm-ring') || []);
    const wormHeadGroup = wormSvg?.querySelector('.worm-head-group');
    const wormHead = wormSvg?.querySelector('.worm-head');
    const wormEye = wormSvg?.querySelector('.worm-eye');
    const wormPupil = wormSvg?.querySelector('.worm-pupil');
    const wormMouth = wormSvg?.querySelector('.worm-mouth');
    const wormMouthCavity = wormSvg?.querySelector('.worm-mouth-cavity');
    const wormLowerJaw = wormSvg?.querySelector('.worm-lower-jaw');

    if (!stickWalkerTrack || !stickWalker) {
        return;
    }

    let stickWalkerTimer;
    let walkerX = -30;
    let walkerSpeed = 34;
    let walkerState = 'walking';
    let lastWalkerTimestamp = 0;
    let isSorbetBlowing = false;
    let sorbetStopHandledThisLap = false;
    let gaitPhase = 0;
    let wormAttemptedThisLap = false;
    let wormActive = false;
    let wormStartMs = 0;
    let wormX = 0;
    let wormWavePhase = 0;
    let wormLastUpdateMs = 0;

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
    const FULL_TURN = Math.PI * 2;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wormMinGapPx = 34;
    const wormBaseY = 22;
    const wormHeadOffsetX = 12;
    const wormSegmentBaseX = [16, 28, 40, 52, 64, 76, 88, 100];
    const wormSegmentBaseRx = [8.4, 8.7, 9.1, 9.4, 9.2, 8.8, 8.3, 7.7];
    const wormSegmentBaseRy = [6.2, 6.5, 6.8, 7.0, 6.8, 6.4, 6.1, 5.8];
    const wormEyeBase = { x: -1.02, y: -3.35, rx: 1.55, ry: 1.32 };
    const wormPupilBase = { x: -0.7, y: -3.4 };

    function hasWormVisual() {
        return Boolean(
            wormSvg &&
            wormSegments.length === wormSegmentBaseX.length &&
            wormRings.length === wormSegmentBaseX.length &&
            wormHeadGroup &&
            wormHead &&
            wormEye &&
            wormPupil &&
            wormMouth &&
            wormMouthCavity &&
            wormLowerJaw
        );
    }

    function isTerminalThemeActive() {
        return getActiveTheme() === 'terminal';
    }

    function renderWormShape(phase, isChomping) {
        if (!hasWormVisual()) return;

        const waveAmplitude = isChomping ? 1.7 : 2.8;
        const segmentYs = [];

        wormSegments.forEach((segment, index) => {
            const envelope = 1 - index * 0.08;
            const wave = Math.sin(phase - index * 0.68);
            const microWave = Math.sin(phase * 2.08 - index * 0.42) * 0.35;
            const y = wormBaseY + wave * waveAmplitude * envelope + microWave;
            const stretch = 1 + Math.sin(phase * 1.7 - index * 0.46) * 0.08;
            const rx = wormSegmentBaseRx[index] * stretch;
            const ry = wormSegmentBaseRy[index] * (1 - (stretch - 1) * 0.55);

            segment.setAttribute('cx', wormSegmentBaseX[index].toFixed(2));
            segment.setAttribute('cy', y.toFixed(2));
            segment.setAttribute('rx', rx.toFixed(2));
            segment.setAttribute('ry', ry.toFixed(2));
            segmentYs[index] = y;

            const ring = wormRings[index];
            ring.setAttribute('cx', (wormSegmentBaseX[index] - 0.55).toFixed(2));
            ring.setAttribute('cy', y.toFixed(2));
            ring.setAttribute('rx', (rx * 0.54).toFixed(2));
            ring.setAttribute('ry', (ry * 0.8).toFixed(2));
        });

        const tailIndex = wormSegments.length - 1;
        const headX = wormSegmentBaseX[tailIndex] + wormHeadOffsetX + Math.sin(phase + 0.9) * (isChomping ? 0.4 : 0.8);
        const headY = segmentYs[tailIndex] - 0.5 + Math.sin(phase * 1.45) * 0.46;
        const headTilt = Math.sin(phase * 1.18) * (isChomping ? 1.4 : 2.4) + (isChomping ? -1.5 : 0);
        wormHeadGroup.setAttribute('transform', `translate(${headX.toFixed(2)} ${headY.toFixed(2)}) rotate(${headTilt.toFixed(2)})`);

        const blink = isChomping ? 0 : Math.pow(Math.max(0, Math.sin(phase * 0.35 + 0.9)), 18);
        const eyeOpenScale = isChomping ? 0.82 : 1 - blink * 0.82;
        const gazeX = isChomping ? 0.24 : 0.06 + Math.sin(phase * 0.55) * 0.08;
        const gazeY = isChomping ? 0.06 : Math.sin(phase * 0.9) * 0.04;

        wormEye.setAttribute('cx', wormEyeBase.x.toFixed(2));
        wormEye.setAttribute('cy', (wormEyeBase.y + (isChomping ? 0.08 : 0)).toFixed(2));
        wormEye.setAttribute('rx', wormEyeBase.rx.toFixed(2));
        wormEye.setAttribute('ry', (wormEyeBase.ry * eyeOpenScale).toFixed(2));
        wormPupil.setAttribute('cx', (wormPupilBase.x + gazeX).toFixed(2));
        wormPupil.setAttribute('cy', (wormPupilBase.y + gazeY + (isChomping ? 0.08 : 0)).toFixed(2));

        if (isChomping) {
            wormMouthCavity.setAttribute('cx', '6.75');
            wormMouthCavity.setAttribute('cy', '3.05');
            wormMouthCavity.setAttribute('rx', '4.95');
            wormMouthCavity.setAttribute('ry', '3.25');
            wormMouth.setAttribute('d', 'M 1.8 0.7 q 5.0 2.6 9.7 0.5');
            wormLowerJaw.setAttribute('d', 'M 1.9 2.0 q 5.3 5.2 9.8 1.8');
            wormSvg.classList.add('is-chomping');
            return;
        }

        wormMouthCavity.setAttribute('cx', '6.6');
        wormMouthCavity.setAttribute('cy', '2.8');
        wormMouthCavity.setAttribute('rx', '4.65');
        wormMouthCavity.setAttribute('ry', '2.55');
        wormMouth.setAttribute('d', 'M 1.8 0.8 q 4.7 1.8 9.3 0.3');
        wormLowerJaw.setAttribute('d', 'M 2.0 2.1 q 4.9 3.6 9.2 1.0');
        wormSvg.classList.remove('is-chomping');
    }

    function setWormActive(active, timestampMs = 0) {
        if (!hasWormVisual()) return;
        wormActive = active;
        stickWalkerTrack.classList.toggle('worm-active', active);

        if (!active) {
            wormSvg.classList.remove('is-chomping');
            wormSvg.style.transform = 'translate3d(0, 0, 0)';
            renderWormShape(0, false);
            return;
        }

        wormStartMs = timestampMs;
        wormLastUpdateMs = timestampMs;
        wormWavePhase = 0;
        renderWormShape(0, false);
    }

    function maybeTriggerWormAttack(progress, timestampMs) {
        if (!hasWormVisual() || reducedMotionQuery.matches || !isTerminalThemeActive() || wormActive || wormAttemptedThisLap) {
            return;
        }

        if (progress < 0.3) {
            return;
        }

        wormAttemptedThisLap = true;
        wormX = walkerStartX;
        setWormActive(true, timestampMs);
    }

    function updateWormVisual(timestampMs) {
        if (!hasWormVisual()) return;

        if (!wormActive || !isTerminalThemeActive() || reducedMotionQuery.matches) {
            setWormActive(false);
            return;
        }

        const deltaSeconds = Math.max(0, (timestampMs - wormLastUpdateMs) / 1000);
        wormLastUpdateMs = timestampMs;
        const distanceFromBack = walkerX - wormX;
        const distanceToWalker = Math.max(0, distanceFromBack);
        const shouldChomp = distanceToWalker < 48;

        // Keep the worm visibly slower so it can chase, but never catch the walker.
        const slitherSpeed = Math.max(18, walkerSpeed * 0.72);
        wormX += slitherSpeed * deltaSeconds;

        const maxWormX = walkerX - wormMinGapPx;
        if (wormX > maxWormX) {
            wormX = maxWormX;
        }

        const waveRate = shouldChomp ? 13.4 : 9.3;
        wormWavePhase = (wormWavePhase + deltaSeconds * waveRate) % FULL_TURN;

        const bobY = Math.sin((timestampMs - wormStartMs) * 0.011) * 1.35;
        wormSvg.style.left = `${wormX}px`;
        wormSvg.style.transform = `translate3d(0, ${bobY.toFixed(2)}px, 0)`;
        renderWormShape(wormWavePhase, shouldChomp);

        // Worm keeps chasing until lap reset/theme change.
    }

    function setWalkerPose(armA, armB, legA, legB) {
        stickWalker.style.setProperty('--walker-arm-a-angle', `${armA.toFixed(2)}deg`);
        stickWalker.style.setProperty('--walker-arm-b-angle', `${armB.toFixed(2)}deg`);
        stickWalker.style.setProperty('--walker-leg-a-angle', `${legA.toFixed(2)}deg`);
        stickWalker.style.setProperty('--walker-leg-b-angle', `${legB.toFixed(2)}deg`);
    }

    function resetWalkerPose() {
        setWalkerPose(14, -36, -14, 18);
    }

    function updateProceduralGait(deltaSeconds) {
        if (reducedMotionQuery.matches) {
            resetWalkerPose();
            return;
        }

        if (isSorbetBlowing) return;

        const isRunning = walkerState === 'running';
        const stepFrequency = isRunning ? 3.8 : 2.2;
        gaitPhase = (gaitPhase + deltaSeconds * FULL_TURN * stepFrequency) % FULL_TURN;

        const stride = Math.sin(gaitPhase);
        const leadLift = Math.max(0, Math.sin(gaitPhase));
        const trailLift = Math.max(0, Math.sin(gaitPhase + Math.PI));
        const armWave = Math.sin(gaitPhase + (isRunning ? 0.36 : 0.28));
        const armReachDamping = 1 - Math.abs(stride) * 0.18;

        if (isRunning) {
            const armSwing = 24 * armReachDamping;
            const armA = 10 - armWave * armSwing + trailLift * 3;
            const armB = -32 + armWave * armSwing + leadLift * 3;
            const legA = -14 + stride * 34 - leadLift * 12;
            const legB = 16 - stride * 34 - trailLift * 12;
            setWalkerPose(armA, armB, legA, legB);
            return;
        }

        const armSwing = 16 * armReachDamping;
        const armA = 10 - armWave * armSwing + trailLift * 2;
        const armB = -30 + armWave * armSwing + leadLift * 2;
        const legA = -12 + stride * 22 - leadLift * 8;
        const legB = 16 - stride * 22 - trailLift * 8;
        setWalkerPose(armA, armB, legA, legB);
    }

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
        walkerState = 'walking';

        if (state === 'running' && !isSorbetThemeActive()) {
            stickWalkerTrack.classList.add('is-running');
            walkerState = 'running';
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
            const loopProgress = Math.max(0, Math.min(1, (walkerX - walkerStartX) / loopDistance));

            maybeTriggerWormAttack(loopProgress, timestamp);

            if (isSorbetThemeActive()) {
                const reachedSorbetStop = !sorbetStopHandledThisLap && walkerX >= sorbetStopX;
                if (reachedSorbetStop) {
                    walkerX = sorbetStopX;
                    sorbetStopHandledThisLap = true;
                    setSorbetBlowingState(true);
                }

                if (sorbetStopHandledThisLap) {
                    updateProceduralGait(deltaSeconds);
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
            updateProceduralGait(deltaSeconds);
            updateWormVisual(timestamp);

            if (walkerX > loopWidth) {
                walkerX = walkerStartX;
                sorbetStopHandledThisLap = false;
                setSorbetBlowingState(false);
                wormAttemptedThisLap = false;
                setWormActive(false);
            }

            stickWalker.style.left = `${walkerX}px`;
            stickWalkerTrack.style.setProperty('--walker-x', `${walkerX}px`);
        } else {
            lastWalkerTimestamp = timestamp;
            sorbetStopHandledThisLap = false;
            setSorbetBlowingState(false);
            stickWalker.style.left = `${walkerStartX}px`;
            stickWalkerTrack.style.setProperty('--walker-x', `${walkerStartX}px`);
            resetWalkerPose();
            wormAttemptedThisLap = false;
            setWormActive(false);
        }

        window.requestAnimationFrame(animateStickWalker);
    }

    window.addEventListener('themechange', scheduleStickWalkerState);

    resetWalkerPose();
    scheduleStickWalkerState();
    window.requestAnimationFrame(animateStickWalker);
});
