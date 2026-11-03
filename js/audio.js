/**
 * TABOO GAME - WEB AUDIO API SOUND SYNTHESIZER
 * 100% Offline, Zero external assets needed, ultra-low latency.
 */

const SoundEngine = {
  ctx: null,
  isMuted: false,

  init: function() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    // Resume context if suspended (browser autoplay policy)
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  setMuted: function(muted) {
    this.isMuted = muted;
    try {
      localStorage.setItem("taboo_muted", muted ? "true" : "false");
    } catch (e) {}
  },

  loadMuteState: function() {
    try {
      this.isMuted = localStorage.getItem("taboo_muted") === "true";
    } catch (e) {
      this.isMuted = false;
    }
    return this.isMuted;
  },

  vibrate: function(pattern) {
    if ("vibrate" in navigator && !this.isMuted) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  },

  // 1. Correct Answer: Bright double bell chime (Ascending major third)
  playCorrect: function() {
    this.vibrate([40]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // First tone (523.25 Hz - C5)
    this._playChimeTone(523.25, now, 0.18, 0.25);
    // Second higher tone (659.25 Hz - E5)
    this._playChimeTone(659.25, now + 0.08, 0.28, 0.3);
    // Third sparkling overtone (1046.5 Hz - C6)
    this._playChimeTone(1046.5, now + 0.16, 0.35, 0.2);
  },

  _playChimeTone: function(freq, start, duration, gainLevel) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(gainLevel, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
  },

  // 2. Taboo / Foul Buzzer: Authentic harsh, grating party buzzer!
  playBuzzer: function() {
    this.vibrate([120, 60, 150]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.45;

    // Dual detuned square-wave oscillators for harsh buzz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(130, now);
    
    osc2.type = "square";
    osc2.frequency.setValueAtTime(136, now);

    osc3.type = "sawtooth";
    osc3.frequency.setValueAtTime(65, now); // Low sub growl

    // Sharp distortion filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
    gain.gain.setValueAtTime(0.5, now + dur - 0.05);
    gain.gain.linearRampToValueAtTime(0.0001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
    osc3.stop(now + dur);
  },

  // 3. Skip: Soft neutral slide
  playSkip: function() {
    this.vibrate([30]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.15;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + dur);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur);
  },

  // 4. Timer Tick (Woodblock style)
  playTick: function() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.04;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + dur);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur);
  },

  // 5. Urgent Warning (Last 5 seconds)
  playWarning: function() {
    this.vibrate([30]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, now); // B5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  },

  // 6. Time's Up Horn / Siren
  playTimesUp: function() {
    this.vibrate([300, 100, 300]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.8;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(160, now + dur);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gain.gain.setValueAtTime(0.4, now + dur - 0.1);
    gain.gain.linearRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur);
  },

  // 7. Victory Fanfare
  playVictory: function() {
    this.vibrate([100, 80, 100, 80, 250]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.00, d: 0.15 }, // C5
      { f: 659.25, t: 0.15, d: 0.15 }, // E5
      { f: 783.99, t: 0.30, d: 0.15 }, // G5
      { f: 1046.50, t: 0.45, d: 0.60 } // C6 (long hold)
    ];

    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0, now + note.t);
      gain.gain.linearRampToValueAtTime(0.35, now + note.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }
};
