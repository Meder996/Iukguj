// Sound synthesizer for CS:PIXEL using Web Audio API

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.5;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Shoot sound based on weapon type
  playShoot(type: 'pistol' | 'rifle' | 'awp' | 'shotgun' | 'smg' | 'knife') {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, t);
    masterGain.connect(this.ctx.destination);

    if (type === 'knife') {
      // Swish sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.12);
      return;
    }

    if (type === 'awp') {
      // Huge bass boom + snappy noise
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.45);
      oscGain.gain.setValueAtTime(0.8, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.45);

      // Noise crack
      this.playNoiseCrack(t, masterGain, 0.35, 1200, 0.9);
      return;
    }

    if (type === 'shotgun') {
      // Triple punch
      for (let i = 0; i < 3; i++) {
        this.playNoiseCrack(t + i * 0.02, masterGain, 0.18, 900, 0.6);
      }
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, t);
      sub.frequency.exponentialRampToValueAtTime(40, t + 0.25);
      subG.gain.setValueAtTime(0.6, t);
      subG.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      sub.connect(subG);
      subG.connect(masterGain);
      sub.start(t);
      sub.stop(t + 0.25);
      return;
    }

    if (type === 'rifle') {
      // Crisp AK/M4 crack
      this.playNoiseCrack(t, masterGain, 0.16, 2200, 0.55);
      const punch = this.ctx.createOscillator();
      const punchG = this.ctx.createGain();
      punch.type = 'triangle';
      punch.frequency.setValueAtTime(160, t);
      punch.frequency.exponentialRampToValueAtTime(50, t + 0.14);
      punchG.gain.setValueAtTime(0.5, t);
      punchG.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
      punch.connect(punchG);
      punchG.connect(masterGain);
      punch.start(t);
      punch.stop(t + 0.14);
      return;
    }

    if (type === 'smg') {
      // Fast bright pop
      this.playNoiseCrack(t, masterGain, 0.09, 2800, 0.4);
      const p = this.ctx.createOscillator();
      const pg = this.ctx.createGain();
      p.type = 'square';
      p.frequency.setValueAtTime(220, t);
      p.frequency.exponentialRampToValueAtTime(80, t + 0.08);
      pg.gain.setValueAtTime(0.25, t);
      pg.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      p.connect(pg);
      pg.connect(masterGain);
      p.start(t);
      p.stop(t + 0.08);
      return;
    }

    // Default pistol
    this.playNoiseCrack(t, masterGain, 0.12, 1600, 0.45);
    const pop = this.ctx.createOscillator();
    const popG = this.ctx.createGain();
    pop.type = 'triangle';
    pop.frequency.setValueAtTime(240, t);
    pop.frequency.exponentialRampToValueAtTime(60, t + 0.1);
    popG.gain.setValueAtTime(0.3, t);
    popG.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    pop.connect(popG);
    popG.connect(masterGain);
    pop.start(t);
    pop.stop(t + 0.1);
  }

  private playNoiseCrack(t: number, dest: AudioNode, duration: number, filterFreq: number, vol: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, t);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);
  }

  // Hit sound (flesh or armor)
  playHit(isHeadshot: boolean = false) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (isHeadshot) {
      // High pitch metallic dink! (Classic CS helmet headshot)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1850, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.18);
      gain.gain.setValueAtTime(0.6 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);

      // Extra bell harmonic
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(3200, t);
      gain2.gain.setValueAtTime(0.4 * this.volume, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.12);
    } else {
      // Body impact thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(210, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
      gain.gain.setValueAtTime(0.35 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  // Kill confirmation sound
  playKill() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.setValueAtTime(880, t + 0.06);
    gain.gain.setValueAtTime(0.25 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Reload sound
  playReload() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Mag drop
    this.playNoiseCrack(t, this.ctx.destination, 0.08, 1100, 0.3 * this.volume);
    
    // Mag insert
    setTimeout(() => {
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      this.playNoiseCrack(t2, this.ctx.destination, 0.1, 1600, 0.4 * this.volume);
    }, 450);

    // Slide rack
    setTimeout(() => {
      if (!this.ctx) return;
      const t3 = this.ctx.currentTime;
      this.playNoiseCrack(t3, this.ctx.destination, 0.09, 2200, 0.45 * this.volume);
    }, 950);
  }

  // Empty magazine click
  playEmpty() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);
    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  // Bomb beep
  playBombBeep(speedFactor: number = 1) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5 note
    const dur = Math.max(0.04, 0.08 / speedFactor);
    gain.gain.setValueAtTime(0.35 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  // Bomb planted / defused / radio announcement
  playRadio(action: 'planted' | 'defused' | 'lost' | 'won') {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // CS radio chatter chirp
    this.playNoiseCrack(t, this.ctx.destination, 0.05, 1800, 0.25 * this.volume);

    const notes = action === 'won' ? [440, 554, 659] :
                  action === 'defused' ? [523, 659, 783] :
                  action === 'planted' ? [330, 293, 261] : [261, 220, 196];

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + 0.06 + idx * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  }

  // Player hurt
  playHurt() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Grenade explosion
  playExplosion() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playNoiseCrack(t, this.ctx.destination, 0.7, 450, 0.9 * this.volume);
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(20, t + 0.8);
    subG.gain.setValueAtTime(0.8 * this.volume, t);
    subG.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    sub.connect(subG);
    subG.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.8);
  }

  // Flashbang ear ring
  playFlashbang() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3800, t);
    gain.gain.setValueAtTime(0.4 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 2.2);
  }

  // Buy weapon sound (cash register)
  playBuy() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987, t);
    g1.gain.setValueAtTime(0.2 * this.volume, t);
    g1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc1.connect(g1);
    g1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.08);

    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1318, t + 0.08);
    g2.gain.setValueAtTime(0.25 * this.volume, t + 0.08);
    g2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc2.connect(g2);
    g2.connect(this.ctx.destination);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.2);
  }
}

export const sounds = new SoundManager();
