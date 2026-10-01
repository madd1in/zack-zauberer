'use strict';
// ---------------------------------------------------------------------------
// Chiptune-Musik & Soundeffekte mit WebAudio (kein Download nötig).
// Optional: echte Sprach-/Sounddateien in assets/ werden bevorzugt, falls vorhanden.
// ---------------------------------------------------------------------------

const Audio8 = (() => {
  let ac = null, master = null, musGain = null, sfxGain = null;
  let enabled = true;
  try { enabled = localStorage.getItem('zack-sound') !== 'off'; } catch (e) { /* egal */ }
  let track = null, trackName = null, nextTime = 0, step = 0, timer = null;

  const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  function freq(n) {
    const m = n.match(/^([A-G]#?)(\d)$/);
    if (!m) return 0;
    const midi = 12 * (parseInt(m[2], 10) + 1) + NOTE[m[1]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  // "C5:2 E5 -:2" -> [[freq, len]...] in Achteln (Default 1)
  function parse(s) {
    return s.trim().split(/\s+/).map(tok => {
      const [n, l] = tok.split(':');
      return [n === '-' ? 0 : freq(n), l ? parseFloat(l) : 1];
    });
  }

  // Jede Spur: tempo (Achtel pro Minute), lead/bass/arp als Notenstrings
  const TRACKS = {
    title: { bpm: 300, wave: 'square',
      lead: 'C5:2 E5 G5 C6:2 B5 A5 G5:2 E5 F5 G5:4 A5:2 G5 F5 E5:2 D5 E5 C5:4 -:2 E5:2 G5 A5 B5:2 C6 D6 E6:2 D6 C6 B5:2 A5 B5 G5:4 F5:2 E5 D5 C5:2 D5 E5 C5:6 -:2',
      bass: 'C3:2 G3:2 C3:2 G3:2 F3:2 C4:2 G3:2 G2:2 F3:2 C4:2 C3:2 G3:2 G2:2 D3:2 C3:4 A2:2 E3:2 A2:2 E3:2 F3:2 C4:2 G3:2 D3:2 F3:2 A3:2 G3:2 G2:2 C3:2 G3:2 C3:4' },
    attic: { bpm: 200, wave: 'triangle',
      lead: 'A4:2 C5 E5 A5:3 G5 E5:2 F5:2 E5 D5 C5:4 B4:2 D5 F5 E5:3 C5 A4:2 B4:2 G#4 B4 A4:6 -:2',
      bass: 'A2:4 E3:4 F2:4 C3:4 D3:4 E3:4 A2:4 E2:4' },
    forest: { bpm: 260, wave: 'square',
      lead: 'G5:2 D5 G5 B5:2 A5 G5 A5:2 F#5 D5 E5:2 F#5:2 G5:2 B5 D6 C6:2 B5 A5 B5:2 G5 E5 F#5:2 A5:2 G5:4 D5 E5 F#5 G5 A5:2 B5 A5 G5:2 E5:2 C5:2 E5 G5 B4:2 D5 G5 A5:2 F#5:2 G5:4 -:2',
      bass: 'G2:2 D3:2 G2:2 D3:2 C3:2 G3:2 D3:2 A2:2 G2:2 D3:2 E3:2 B2:2 C3:2 D3:2 G2:4 G2:2 D3:2 E3:2 B2:2 C3:2 G3:2 G2:2 D3:2 D3:2 A2:2 G2:4' },
    village: { bpm: 280, wave: 'square',
      lead: 'F5 A5 C6:2 A5 F5 G5:2 A5 G5 F5 E5 F5:2 C5:2 D5 E5 F5:2 G5 A5 A#5:2 A5 G5 A5:2 F5:2 F5 A5 C6:2 D6 C6 A#5:2 A5 G5 F5 G5 A5:2 G5 F5 E5 G5 F5:4',
      bass: 'F3:2 C3:2 F3:2 C3:2 A#2:2 F3:2 C3:2 C3:2 F3:2 C3:2 A#2:2 C3:2 F3:2 C3:2 F3:4 F3:2 C3:2 A#2:2 F3:2 C3:2 G2:2 C3:2 F2:2' },
    tavern: { bpm: 330, wave: 'square',
      lead: 'D5 E5 F#5 A5:2 F#5 D5:2 F#5 E5:2 C#5 A4:3 D5 E5 F#5 A5:2 B5 A5:2 F#5 E5:2 D5 D5:3 A5 B5 A5 F#5:2 D5 E5:2 F#5 G5:2 E5 C#5:3 D5 E5 F#5 E5:2 C#5 A4:2 C#5 D5:6',
      bass: 'D3:3 A2:3 D3:3 A2:3 D3:3 A2:3 G2:3 A2:3 D3:3 A2:3 G2:3 A2:3 D3:3 A2:3 D3:6' },
    witch: { bpm: 210, wave: 'triangle',
      lead: 'E5 G5 B5 A#5 A5:2 G5 E5 F#5:2 D#5:2 E5:4 G5 B5 E6:2 D#6 C6 B5:2 A5 F#5 G5:2 F#5:2 E5:4 -:2',
      bass: 'E2:2 B2:2 E2:2 B2:2 C3:2 A2:2 B2:4 E2:2 B2:2 C3:2 G2:2 A2:2 B2:2 E2:4' },
    swamp: { bpm: 170, wave: 'triangle',
      lead: 'D4:3 F4 A4:2 G4 F4 E4:3 D4 C#4:4 D4:3 F4 A4:2 C5 A4 A#4:3 A4 G4:2 F4 E4 D4:6 -:2',
      bass: 'D2:4 A2:4 A#2:4 A2:4 D2:4 F2:4 G2:4 D2:4' },
    tower: { bpm: 180, wave: 'sawtooth',
      lead: 'C5:2 D#5 G5:2 F#5 G5:2 D#5:2 C5:2 D5:2 D#5 D5 C5 B4:4 C5:2 D#5 G5:2 G#5 G5:2 F5:2 D#5:2 D5:2 B4 D5 C5:4 -:2',
      bass: 'C2:4 G2:4 G#2:4 G2:4 C2:4 D#2:4 F2:4 G2:4' },
    ending: { bpm: 280, wave: 'square',
      lead: 'C5 E5 G5 C6:3 G5 E5 F5:2 A5 C6 D6:2 C6:2 B5 G5 A5 B5 C6:2 D6 E6:2 D6 C6 B5 G5:2 C6:6 -:2',
      bass: 'C3:2 G3:2 C3:2 E3:2 F3:2 C4:2 F3:2 A3:2 G3:2 D3:2 G3:2 B2:2 C3:2 G3:2 C3:4' },
  };
  for (const k in TRACKS) { TRACKS[k].L = parse(TRACKS[k].lead); TRACKS[k].B = parse(TRACKS[k].bass); }

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = enabled ? 0.5 : 0; master.connect(ac.destination);
      musGain = ac.createGain(); musGain.gain.value = 0.18; musGain.connect(master);
      sfxGain = ac.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
    } catch (e) { ac = null; }
  }

  function tone(t, f, dur, type, vol, dest, slideTo) {
    if (!ac || !f) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t, dur, vol, filt, dest) {
    if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt || 1200;
    const g = ac.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(dest || sfxGain);
    s.start(t);
  }

  // Sequencer: plant immer ~0.3 s im Voraus
  function schedule() {
    if (!ac || !track) return;
    const tr = track, eighth = 60 / tr.bpm;
    while (nextTime < ac.currentTime + 0.3) {
      // Positionen in Achteln für beide Stimmen berechnen
      const pos = step;
      for (const [voice, seq, type, oct, vol] of [['L', tr.L, tr.wave, 1, 0.22], ['B', tr.B, 'triangle', 1, 0.35]]) {
        let acc = 0, total = seq.reduce((a, b) => a + b[1], 0);
        const p = pos % total;
        for (const [f, l] of seq) {
          if (Math.abs(acc - p) < 0.001 && f) tone(nextTime, f * oct, l * eighth * 0.95, type, vol, musGain);
          acc += l;
          if (acc > p + 0.001) break;
        }
      }
      nextTime += eighth * 0.5;
      step += 0.5;
    }
  }

  function music(name) {
    if (name === trackName) return;
    trackName = name;
    track = TRACKS[name] || null;
    if (!ac) return;
    step = 0; nextTime = ac.currentTime + 0.1;
    if (!timer) timer = setInterval(schedule, 80);
  }

  const SFX = {
    pickup(t) { [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.05, f, 0.12, 'square', 0.2)); },
    coin(t) { tone(t, 988, 0.08, 'square', 0.2); tone(t + 0.08, 1319, 0.3, 'square', 0.2); },
    magic(t) { tone(t, 300, 1.2, 'sine', 0.3, null, 2400); tone(t + 0.1, 600, 1.0, 'triangle', 0.15, null, 3000); for (let i = 0; i < 8; i++) tone(t + i * 0.1, 1200 + Math.random() * 1600, 0.1, 'square', 0.06); },
    zap(t) { tone(t, 1600, 0.6, 'sawtooth', 0.2, null, 80); noise(t, 0.5, 0.3, 3000); },
    door(t) { noise(t, 0.25, 0.5, 400); tone(t, 90, 0.2, 'triangle', 0.4); },
    splash(t) { noise(t, 0.6, 0.5, 900); tone(t, 400, 0.3, 'sine', 0.1, null, 120); },
    fail(t) { tone(t, 160, 0.25, 'square', 0.15); tone(t + 0.25, 120, 0.35, 'square', 0.15); },
    laugh(t) { for (let i = 0; i < 6; i++) tone(t + i * 0.14, 180 - i * 6, 0.11, 'sawtooth', 0.22, null, 120); },
    snip(t) { noise(t, 0.05, 0.4, 6000); noise(t + 0.12, 0.05, 0.4, 6000); },
    cluck(t) { tone(t, 700, 0.06, 'square', 0.15, null, 500); tone(t + 0.1, 900, 0.08, 'square', 0.15, null, 600); },
    bubble(t) { tone(t, 200, 0.15, 'sine', 0.2, null, 600); },
    thud(t) { tone(t, 120, 0.25, 'triangle', 0.4, null, 50); noise(t, 0.15, 0.3, 300); },
    creak(t) { tone(t, 220, 0.5, 'sawtooth', 0.08, null, 160); },
    poof(t) { noise(t, 0.7, 0.6, 2000); tone(t, 800, 0.6, 'sine', 0.15, null, 200); },
    fanfare(t) { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(t + i * 0.12, f, i === 5 ? 0.6 : 0.14, 'square', 0.18)); },
    blip(t) { tone(t, 880, 0.04, 'square', 0.08); },
  };
  function sfx(name) {
    if (!ac || !enabled) return;
    const fn = SFX[name];
    if (fn) fn(ac.currentTime + 0.01);
  }

  function setEnabled(on) {
    enabled = on;
    try { localStorage.setItem('zack-sound', on ? 'on' : 'off'); } catch (e) { /* egal */ }
    if (master) master.gain.value = on ? 0.5 : 0;
  }

  return { init, music, sfx, setEnabled, get enabled() { return enabled; } };
})();
