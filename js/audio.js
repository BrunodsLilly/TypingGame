// ============================================
// Audio Engine (Web Audio API + Speech Synthesis)
// ============================================

/**
 * Audio singleton providing sound effects via Web Audio API
 * and voice prompts via SpeechSynthesis.
 *
 * @type {{
 *   correct: () => void,
 *   wrong: () => void,
 *   celebration: () => void,
 *   tap: () => void,
 *   speak: (text: string, rate?: number, language?: string) => void,
 *   toggle: () => boolean,
 *   enabled: boolean
 * }}
 */
const Audio_ = (() => {
    /** @type {AudioContext|null} */
    let ctx = null;

    /** @type {boolean} */
    let soundEnabled = true;

    /** @type {SpeechSynthesisVoice|null} */
    let speechVoice = null;

    /** @type {SpeechSynthesisVoice|null} */
    let speechVoicePt = null;

    /** @type {SpeechSynthesisVoice|null} */
    let speechVoiceKo = null;

    /**
     * Lazily creates (or resumes) the shared AudioContext.
     * @returns {AudioContext}
     */
    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    /**
     * Plays a single oscillator tone.
     * @param {number} freq - Frequency in Hz
     * @param {number} dur - Duration in seconds
     * @param {OscillatorType} [type='sine'] - Oscillator waveform type
     * @param {number} [vol=0.25] - Starting gain (0-1)
     */
    function tone(freq, dur, type = 'sine', vol = 0.25) {
        if (!soundEnabled) return;
        const c = getCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(vol, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + dur);
    }

    /** Plays a three-note ascending chime for correct answers. */
    function correct() {
        tone(523, 0.12);
        setTimeout(() => tone(659, 0.12), 60);
        setTimeout(() => tone(784, 0.15), 120);
    }

    /** Plays a low-pitched tone for wrong answers. */
    function wrong() {
        tone(250, 0.18, 'triangle', 0.15);
    }

    /** Plays a four-note ascending fanfare for celebrations. */
    function celebration() {
        tone(523, 0.12);
        setTimeout(() => tone(659, 0.12), 80);
        setTimeout(() => tone(784, 0.12), 160);
        setTimeout(() => tone(1047, 0.3), 240);
    }

    /** Plays a short high-pitched tap sound for UI feedback. */
    function tap() {
        tone(880, 0.06, 'sine', 0.1);
    }

    /**
     * Initializes the SpeechSynthesis voice, preferring
     * Samantha (Enhanced) or any English voice as fallback.
     */
    function initVoice() {
        const pick = () => {
            const voices = speechSynthesis.getVoices();
            speechVoice = voices.find(v => v.name === 'Samantha (Enhanced)') ||
                          voices.find(v => v.name.includes('Enhanced') && v.lang.startsWith('en')) ||
                          voices.find(v => v.name === 'Samantha') ||
                          voices.find(v => v.lang.startsWith('en-US')) ||
                          voices.find(v => v.lang.startsWith('en')) ||
                          voices[0];
            speechVoicePt = voices.find(v => v.name.includes('Enhanced') && v.lang.startsWith('pt-BR')) ||
                            voices.find(v => v.lang === 'pt-BR') ||
                            voices.find(v => v.lang.startsWith('pt')) ||
                            null;
            speechVoiceKo = voices.find(v => v.lang === 'ko-KR') ||
                            voices.find(v => v.lang.startsWith('ko')) ||
                            null;
        };
        if (speechSynthesis.getVoices().length > 0) pick();
        else speechSynthesis.onvoiceschanged = pick;
    }

    /**
     * Speaks text aloud using SpeechSynthesis.
     * @param {string} text - Text to speak
     * @param {number} [rate=0.85] - Speech rate (0.1 - 10)
     * @param {string} [language] - Language code ('en', 'pt', or 'ko'). Defaults to global `lang`.
     */
    function speak(text, rate = 0.85, language) {
        if (!soundEnabled) return;
        speechSynthesis.cancel();
        // Global voice-speed multiplier from the Settings screen
        if (typeof Settings !== 'undefined') rate *= (Settings.get('voiceRate') || 1);
        const useLang = language || (typeof lang !== 'undefined' ? lang : 'en');
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.pitch = 1.15;
        u.volume = 1;
        if (useLang === 'pt') {
            u.lang = 'pt-BR';
            if (speechVoicePt) u.voice = speechVoicePt;
        } else if (useLang === 'ko') {
            u.lang = 'ko-KR';
            u.rate = rate * 0.9; // slightly slower for Korean
            if (speechVoiceKo) u.voice = speechVoiceKo;
        } else {
            if (speechVoice) u.voice = speechVoice;
        }
        speechSynthesis.speak(u);
    }

    /**
     * Toggles sound on/off.
     * @returns {boolean} Whether sound is now enabled
     */
    function toggle() {
        soundEnabled = !soundEnabled;
        return soundEnabled;
    }

    /**
     * Unlocks audio on iOS/iPad. SpeechSynthesis and the AudioContext stay
     * blocked until first triggered inside a user gesture, so we prime both
     * on the first touch/click/keypress anywhere in the document.
     */
    let unlocked = false;
    function unlockAudio() {
        if (unlocked) return;
        unlocked = true;
        try { getCtx(); } catch (e) {}
        try {
            const u = new SpeechSynthesisUtterance(' ');
            u.volume = 0;
            speechSynthesis.speak(u);
        } catch (e) {}
    }

    initVoice();
    ['pointerdown', 'touchend', 'mousedown', 'keydown'].forEach(ev =>
        window.addEventListener(ev, unlockAudio, { passive: true }));
    return { correct, wrong, celebration, tap, speak, toggle, get enabled() { return soundEnabled; } };
})();

// Sound button
const soundBtn = document.getElementById('sound-btn');
soundBtn.addEventListener('click', () => {
    const on = Audio_.toggle();
    soundBtn.textContent = on ? '\uD83D\uDD0A' : '\uD83D\uDD07';
});
