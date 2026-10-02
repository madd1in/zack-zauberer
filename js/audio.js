'use strict';
// ---------------------------------------------------------------------------
// Chiptune-Musik & Soundeffekte mit WebAudio (kein Download nötig).
// Optional: echte Sprach-/Sounddateien in assets/ werden bevorzugt, falls vorhanden.
// ---------------------------------------------------------------------------

const Audio8 = (() => {
  let ac = null, master = null, musGain = null, sfxGain = null;
  let enabled = true;
  try { enabled = localStorage.getItem('zack-sound') !== 'off'; } catch (e) { /* egal */ }
  let track = null, trackName = null, nextTime = 0, pos = 0, timer = null;
  let echoIn = null, echoDly = null;

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

  // ---------------------------------------------------------------------------
  // Komposition: Jede Spur ist ein 16-Takt-Stück (je 8 Achtel). Die Melodie steht in Tonleiter-
  // stufen (1-7, ' = Oktave höher, , = Oktave tiefer, :n = Länge in Achteln, - = Pause), dadurch
  // bleibt sie automatisch in der Tonart. Akkorde (prog) sind Stufen pro Takt; Arpeggio, Bass,
  // Pad und Schlagzeug werden daraus erzeugt.
  // ---------------------------------------------------------------------------
  const MODES = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], mixo: [0, 2, 4, 5, 7, 9, 10],
    harm: [0, 2, 3, 5, 7, 8, 11], dorian: [0, 2, 3, 5, 7, 9, 10],
  };
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  function midiOf(n) { const m = n.match(/^([A-G]#?)(\d)$/); return 12 * (parseInt(m[2], 10) + 1) + NOTE[m[1]]; }
  function degMidi(sc, tonic, d, oct, acc) {
    const i = d - 1, o = Math.floor(i / 7), k = ((i % 7) + 7) % 7;
    return tonic + sc[k] + 12 * (o + (oct || 0)) + (acc || 0);
  }
  const ARP = {
    up: [0, 1, 2, 1, 0, 1, 2, 1], broken: [0, 2, 1, 2, 0, 2, 1, 2], rise: [0, 1, 2, 3, 2, 1, 2, 1],
    sparse: [0, -1, 2, -1, 1, -1, 2, -1], wave: [2, 1, 0, 1, 2, 1, 0, 1], off: [],
  };
  // Schlagzeug je Achtel: k = Kick, s = Snare, h = Hi-Hat
  const DRUMS = {
    light: { k: [0, 4], h: [2, 6] },
    beat: { k: [0, 4], s: [2, 6], h: [1, 3, 5, 7] },
    jig: { k: [0, 6], s: [3], h: [1, 2, 4, 5, 7] },
  };
  function compile(o) {
    const sc = MODES[o.mode], tonic = midiOf(o.key), bars = o.prog.length, total = bars * 8;
    const ev = []; for (let i = 0; i < total * 2; i++) ev.push(null);
    const put = (t, f, len, v, extra) => {
      const k = Math.round(t * 2) % (total * 2);
      (ev[k] = ev[k] || []).push(Object.assign({ f, len, v }, extra || {}));
    };
    const melBars = o.mel.split('|').map(x => x.trim());
    o.melBars = melBars.length; o.melSums = [];
    melBars.forEach((bar, bi) => {
      let t = bi * 8, sum = 0;
      for (const tok of bar.split(/\s+/)) {
        const [nt, ln] = tok.split(':'), len = ln ? parseFloat(ln) : 1;
        if (nt !== '-') {
          const m = nt.match(/^([#b]?)([1-7])([',]*)$/);
          const oct = (m[3].match(/'/g) || []).length - (m[3].match(/,/g) || []).length;
          put(t, mf(degMidi(sc, tonic, parseInt(m[2], 10), oct, m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0)), len, 'L');
        }
        t += len; sum += len;
      }
      o.melSums.push(sum);
    });
    const dr = DRUMS[o.drums];
    for (let b = 0; b < bars; b++) {
      const r = o.prog[b], base = b * 8;
      const ch = [0, 2, 4].map(k => degMidi(sc, tonic, r + k, -1)), root = degMidi(sc, tonic, r, -2), fifth = degMidi(sc, tonic, r + 4, -2), third = degMidi(sc, tonic, r + 2, -2);
      const pat = ARP[o.arp || 'off'];
      pat.forEach((ix, i) => { if (ix >= 0) put(base + i, mf(ix === 3 ? ch[0] + 12 : ch[ix]), 1, 'A'); });
      const bs = o.bass || 'pump';
      if (bs === 'pump') { put(base, mf(root), 2, 'B'); put(base + 2, mf(fifth), 2, 'B'); put(base + 4, mf(root), 2, 'B'); put(base + 6, mf(fifth), 2, 'B'); }
      else if (bs === 'long') { put(base, mf(root), 4, 'B'); put(base + 4, mf(fifth), 4, 'B'); }
      else if (bs === 'walk') { [root, third, fifth, third].forEach((m, i) => put(base + i * 2, mf(m), 2, 'B')); }
      else if (bs === 'drone') { put(base, mf(root), 8, 'B'); }
      if (o.pad) ch.forEach(m => put(base, mf(m), 8, 'P'));
      if (dr) {
        (dr.k || []).forEach(i => put(base + i, 0, 1, 'K'));
        (dr.s || []).forEach(i => put(base + i, 0, 1, 'S'));
        (dr.h || []).forEach(i => put(base + i, 0, 1, 'H'));
        if (o.drums !== 'light' && b % 4 === 3) put(base + 7.5, 0, 0.5, 'S');   // kleiner Fill am Phrasenende
      }
    }
    return { bpm: o.bpm, wave: o.wave, wf: o.wave === 'sawtooth' ? 0.55 : 1, ev, total, o };
  }

  const SONGS = {
    // Heldenthema, strahlend und flott
    title: { key: 'C5', mode: 'major', bpm: 250, wave: 'square', bass: 'pump', arp: 'up', drums: 'beat',
      prog: [1, 5, 6, 3, 4, 1, 4, 5, 6, 3, 4, 1, 4, 5, 1, 1],
      mel: "5:2 3 5 1':3 -|7:2 5 7 2':2 7:2|1':2 6 1' 3':3 -|5:2 7 5 3:3 -|4:2 6 1' 6 4:3|3:2 5 3 1:2 5,:2|4:2 6 1' 3':2 2':2|2':2 7 5 7:4|1':3 3' 6:2 3':2|5':2 3' 2' 3':2 7:2|6:2 1' 3' 4':2 3':2|2':2 1' 7 1':4|6:2 1' 6 4':3 -|2':2 7 5 2':2 7:2|1':3 5 3':2 1':2|1':6 -:2" },
    // Staubiger Dachboden, neugierig und leise
    attic: { key: 'A4', mode: 'minor', bpm: 190, wave: 'triangle', bass: 'long', arp: 'sparse', pad: true,
      prog: [1, 6, 4, 5, 1, 6, 3, 5, 4, 1, 6, 5, 4, 6, 5, 1],
      mel: "3:2 5 3 1:2 3:2|1:2 3 6 3:2 1:2|4:2 6 1' 6:2 4:2|5:2 7 2' 7:2 5:2|5:2 3 1 3:2 5:2|6:2 3 1 3:2 6:2|7:2 5 3 5:2 7:2|5:3 7 5:2 3:2|6:2 4 6 1':3 -|1':2 3' 1' 6:2 5:2|6:3 3' 1':2 6:2|5:2 7 5 2':4|4:2 6 4 1:3 -|1:2 3 6 3:2 1:2|7:2 5 7 5:2 3:2|1:6 -:2" },
    // Lichtung: sonniger Waldweg
    forest: { key: 'G4', mode: 'major', bpm: 240, wave: 'square', bass: 'walk', arp: 'broken', drums: 'light',
      prog: [1, 5, 6, 4, 1, 5, 4, 1, 6, 3, 4, 5, 1, 4, 5, 1],
      mel: "5:2 3 5 1':3 -|7:2 5 7 2':2 7:2|6:2 1' 6 3':2 1':2|4:2 6 4 1':3 -|3:2 5 1' 5:2 3:2|5:2 7 2' 7:2 5:2|6:2 4 6 1':2 6:2|5:3 3 1:4|6:2 7 1' 3':3 -|5:2 7 5 3:3 -|6:2 4 6 1':2 3':2|2':3 7 5:2 7:2|1':2 5 3 5:2 1':2|1':2 6 4 6:2 1':2|7:2 5 7 2':2 5:2|1':6 -:2" },
    // Dorfplatz: hüpfender Markt
    village: { key: 'F4', mode: 'major', bpm: 270, wave: 'square', bass: 'pump', arp: 'up', drums: 'beat',
      prog: [1, 4, 5, 1, 6, 4, 5, 1, 1, 3, 4, 5, 6, 4, 5, 1],
      mel: "5 3 5 1':2 5 3:2|4 6 1' 6 4:2 6:2|5 7 2' 7 5:2 7:2|1':3 5 3:2 1:2|6 1' 3' 1' 6:2 1':2|4 6 1' 6 4:2 -:2|5 7 2' 7 2':2 5:2|3:2 1 3 5:2 1':2|1':2 5 3 5:2 1':2|3 5 7 5 3:2 5:2|4 6 1' 6 2':2 1':2|5 7 2' 7 5:2 7:2|6 1' 3' 1' 6:2 3:2|4 6 1' 6 4:2 6:2|7:2 2' 7 5:2 7:2|1':6 -:2" },
    // Taverne: Fiedel-Jig, 3+3+2
    tavern: { key: 'D5', mode: 'mixo', bpm: 330, wave: 'square', bass: 'pump', arp: 'sparse', drums: 'jig',
      prog: [1, 7, 4, 1, 1, 7, 4, 1, 6, 4, 1, 7, 4, 7, 1, 1],
      mel: "1 3 5 5 3 1 3:2|7, 2 4 4 2 7, 2:2|4 6 4 6 4 2 4:2|5 3 1 3 5 3 1:2|1 3 5 1' 5 3 5:2|7, 2 4 2 7, 2 7,:2|4 6 4 2 4 6 4:2|3 5 3 1 3 1 1:2|6 1' 6 3 5 3 6:2|4 6 4 2 4 2 4:2|1 3 5 3 1 3 5:2|7, 2 4 2 4 6 4:2|4 6 1' 6 4 2 4:2|2 4 2 7, 2 7, 2:2|3 5 1' 5 3 5 3:2|1 3 5 1':5" },
    // Hexenhütte: harmonisch Moll, unheimlich
    witch: { key: 'E4', mode: 'harm', bpm: 190, wave: 'triangle', bass: 'drone', arp: 'broken', pad: true,
      prog: [1, 4, 5, 1, 6, 4, 5, 1, 4, 1, 6, 5, 4, 6, 5, 1],
      mel: "5:2 3 1 3:2 5:2|4:2 6 4 1:3 -|5:2 7 5 2':2 7:2|1':3 7 5:2 3:2|6:2 1' 6 3':2 1':2|4:2 6 1' 6:2 4:2|7:2 5 7 2':3 -|1':2 7 1' 5:4|6:2 4 6 1':3 -|5:2 3 5 1':3 -|3':2 1' 6 3':2 1':2|2':2 7 5 7:2 5:2|4:2 6 1' 6:2 4:2|3':3 1' 6:2 1':2|7:2 2' 7 5:2 7:2|1':6 -:2" },
    // Sumpf: langsam, düster
    swamp: { key: 'D4', mode: 'minor', bpm: 160, wave: 'triangle', bass: 'long', arp: 'sparse', pad: true,
      prog: [1, 6, 4, 5, 1, 6, 3, 5, 4, 1, 6, 7, 4, 6, 5, 1],
      mel: "3:3 5 1:2 -:2|6:3 5 3:2 -:2|4:3 6 4:2 -:2|5:2 7 5 3:2 5:2|1':3 5 3:2 -:2|6:2 1' 6 3':2 1':2|3:3 5 7:2 5:2|5:4 7 5 3:2|4:3 6 1':2 6:2|3:2 5 3 1:2 -:2|6:3 1' 6:2 4:2|7:3 2' 7:2 5:2|4:2 6 4 1':2 6:2|6:3 4 3:2 5:2|5:2 7 5 3:2 -:2|1:5 -:3" },
    // Turm: dunkel, bedrohlich
    tower: { key: 'C5', mode: 'harm', bpm: 200, wave: 'sawtooth', bass: 'pump', arp: 'rise', pad: true,
      prog: [1, 4, 5, 1, 6, 4, 5, 1, 4, 1, 6, 5, 4, 6, 5, 1],
      mel: "3:2 5 3 1:2 3:2|4:2 6 4 1:3 -|5:2 7 5 2:2 7,:2|1:3 3 5:2 3:2|6,:2 1 6, 3:2 1:2|4:2 6 4 1:2 6,:2|7,:2 2 7, 5:2 2:2|1:4 3 5 3:2|4:3 6 4:2 1:2|3:2 5 3 1:3 -|6,:2 1 3 6:2 3:2|5:2 7 2' 7:2 5:2|4:2 6 1' 6:2 4:2|3':3 1' 6:2 3:2|7:2 5 2 7,:2 5,:2|1:6 -:2" },
    // Abspann: Triumph
    ending: { key: 'C5', mode: 'major', bpm: 240, wave: 'square', bass: 'pump', arp: 'rise', drums: 'beat',
      prog: [1, 5, 6, 4, 1, 5, 4, 5, 6, 4, 1, 5, 4, 5, 1, 1],
      mel: "1:2 3 5 1':3 -|7,:2 2 5 2':2 7:2|6,:2 1 3 6:2 3:2|4:2 6 4 1':3 -|5:2 3 5 1':2 5:2|7:2 5 7 2':3 -|4:2 6 1' 6:2 4:2|2':2 7 5 7:2 2':2|6:2 1' 3' 1':2 6:2|4:2 6 1' 3':2 1':2|5:2 1' 3' 1':2 5:2|7:2 2' 7 5:2 7:2|6:2 4 6 1':2 4:2|2':2 7 5 2':2 7:2|1':3 5 3':2 1':2|1':6 -:2" },
  };
  const TRACKS = {};
  for (const k in SONGS) TRACKS[k] = compile(SONGS[k]);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = enabled ? 0.5 : 0; master.connect(ac.destination);
      musGain = ac.createGain(); musGain.gain.value = 0.18; musGain.connect(master);
      sfxGain = ac.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
      // weiches Echo (punktierte Achtel) für die Melodie
      echoIn = ac.createGain(); echoIn.gain.value = 0.3;
      echoDly = ac.createDelay(2); echoDly.delayTime.value = 0.36;
      const fb = ac.createGain(); fb.gain.value = 0.3;
      echoIn.connect(echoDly); echoDly.connect(fb); fb.connect(echoDly); echoDly.connect(musGain);
    } catch (e) { ac = null; }
    // Die Titelmusik wurde schon vor dem ersten Klick „gewählt“ – jetzt, wo der AudioContext
    // existiert (Browser erlauben Ton erst nach einer Geste), muss der Sequencer wirklich starten.
    if (ac && track) { pos = 0; nextTime = ac.currentTime + 0.1; setEcho(); if (!timer) timer = setInterval(schedule, 80); }
  }
  // Tab im Hintergrund: Ton anhalten, beim Zurückkehren sauber weiterlaufen
  function setHidden(hidden) {
    if (!ac) return;
    if (hidden) { if (ac.state === 'running') ac.suspend(); }
    else if (ac.state === 'suspended') ac.resume();
  }

  function tone(t, f, dur, type, vol, dest, slideTo, att, echo) {
    if (!ac || !f) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const a = Math.min(att || 0.01, dur * 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain);
    if (echo && echoIn) g.connect(echoIn);
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

  // Sequencer: plant immer ~0.3 s im Voraus, in Sechzehnteln (halbe Achtel)
  function playEv(e, t, eighth, tr) {
    switch (e.v) {
      case 'L': tone(t, e.f, Math.max(0.06, e.len * eighth * 0.96), tr.wave, 0.2 * tr.wf, musGain, null, 0.012, true); break;
      case 'A': tone(t, e.f, eighth * 0.85, tr.o.pad ? 'sine' : 'square', tr.o.pad ? 0.1 : 0.05, musGain); break;
      case 'B': tone(t, e.f, e.len * eighth * 0.92, 'triangle', 0.34, musGain); break;
      case 'P': tone(t, e.f, e.len * eighth * 1.05, 'sine', 0.045, musGain, null, 0.45); break;
      case 'K': tone(t, 120, 0.13, 'triangle', 0.28, musGain, 45); break;
      case 'S': noise(t, 0.09, 0.13, 3600, musGain); break;
      case 'H': noise(t, 0.03, 0.045, 8000, musGain); break;
    }
  }
  function schedule() {
    if (!ac || !track) return;
    // Nach Hintergrund-Pause/Timer-Drosselung nicht alle verpassten Noten auf einmal abfeuern
    if (nextTime < ac.currentTime - 0.1) nextTime = ac.currentTime + 0.05;
    const eighth = 60 / track.bpm, n = track.ev.length;
    while (nextTime < ac.currentTime + 0.3) {
      const evs = track.ev[pos % n];
      if (evs) for (const e of evs) playEv(e, nextTime, eighth, track);
      nextTime += eighth * 0.5;
      pos++;
    }
  }
  function setEcho() { if (echoDly && track) echoDly.delayTime.value = (60 / track.bpm) * 1.5; }
  function music(name) {
    if (name === trackName) return;
    trackName = name;
    track = TRACKS[name] || null;
    if (!ac) return;
    pos = 0; nextTime = ac.currentTime + 0.1;
    setEcho();
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
  // Musik leiser, während eine Stimme (TTS) spricht
  function duck(on) { if (musGain && enabled) musGain.gain.value = on ? 0.06 : 0.18; }

  return { init, music, sfx, setEnabled, setHidden, duck, tracks: SONGS, get enabled() { return enabled; } };
})();
