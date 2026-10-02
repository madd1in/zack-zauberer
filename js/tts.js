'use strict';
// ---------------------------------------------------------------------------
// Sprachausgabe über die ElevenLabs-API (optional, für alle Sprechtexte).
// Ohne API-Schlüssel bleibt das Spiel genau wie bisher stumm – TTS greift
// erst, wenn im Dialog „Sprache“ ein Schlüssel eingegeben und Aktiv gesetzt
// wurde. Der Schlüssel bleibt lokal im Browser (localStorage).
// ---------------------------------------------------------------------------
const TTS = (() => {
  const LS = 'zack-tts';
  const MODELS = [
    ['eleven_flash_v2_5', 'Schnell (Flash, günstig)'],
    ['eleven_multilingual_v2', 'Beste Qualität (Multilingual v2)'],
  ];
  let cfg = { on: false, key: '', model: MODELS[0][0], zack: '', other: '' };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) { /* egal */ }

  const cache = new Map();          // Modell|Stimme|Text -> Blob-URL, damit jede Zeile nur einmal kostet
  let cur = null;                   // laufende/gestartete Sprachausgabe
  let fails = 0;

  function save() { try { localStorage.setItem(LS, JSON.stringify(cfg)); } catch (e) { /* egal */ } }
  function enabled() { return !!(cfg.on && cfg.key && voiceFor() && typeof fetch === 'function' && typeof Audio === 'function'); }
  function voiceFor(speaker) { return speaker === 'zack' ? (cfg.zack || '') : (cfg.other || cfg.zack || ''); }

  function duckOff() { try { Audio8.duck(false); } catch (e) { /* egal */ } }

  async function synth(text, voiceId) {
    const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '?output_format=mp3_44100_128', {
      method: 'POST',
      headers: { 'xi-api-key': cfg.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: cfg.model || MODELS[0][0],
        voice_settings: { stability: 0.45, similarity_boost: 0.75 },
      }),
    });
    if (!r.ok) {
      let msg = 'HTTP ' + r.status;
      try { const d = await r.json(); if (d.detail && d.detail.message) msg = d.detail.message; else if (typeof d.detail === 'string') msg = d.detail; } catch (e) { /* egal */ }
      throw new Error(msg);
    }
    return URL.createObjectURL(await r.blob());
  }
  function cached(text, voiceId) {
    const key = (cfg.model || MODELS[0][0]) + '|' + voiceId + '|' + text;
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    return synth(text, voiceId).then(url => {
      if (cache.size > 80) { const k0 = cache.keys().next().value; try { URL.revokeObjectURL(cache.get(k0)); } catch (e) { /* egal */ } cache.delete(k0); }
      cache.set(key, url);
      return url;
    });
  }

  // Eine Sprachblase (sp = E.speech) vertonen: Dauer der Blase richtet sich
  // nach dem Audio; bis es da ist, bekommt die Blase etwas Wartezeit gut.
  function speak(speaker, text, sp) {
    stop();
    if (!enabled()) return;
    const voice = voiceFor(speaker);
    if (!voice) return;
    const req = { sp, audio: null };
    cur = req;
    sp.until = Math.min(sp.until, E.t + 4);          // Platz fürs Nachladen
    cached(text, voice).then(url => {
      if (cur !== req) return;
      const a = new Audio(url);
      req.audio = a;
      a.onloadedmetadata = () => { if (cur === req && isFinite(a.duration) && a.duration > 0 && E.speech === sp) sp.until = Math.max(sp.until, E.t + a.duration + 0.4); };
      a.onended = a.onerror = () => { if (cur === req) { cur = null; duckOff(); } };
      a.play().catch(() => {});
      try { Audio8.duck(true); } catch (e) { /* egal */ }
      if (E.speech === sp) sp.until = Math.max(sp.until, E.t + Math.min(12, 1.4 + text.length * 0.07));
    }).catch(err => {
      if (cur !== req) return;
      cur = null;
      sp.until = E.t + Math.max(1.4, 0.9 + text.length * 0.055);   // Fallback: Lesetempo
      if (++fails >= 3) {
        cfg.on = false; save();
        if (typeof toast === 'function') toast('Sprachausgabe aus: ' + err.message);
      }
    });
  }

  // Aktuelle Ausgabe abbrechen (Überspringen, Raumwechsel, neue Zeile)
  function stop() {
    const r = cur; cur = null;
    if (r) {
      if (r.sp) r.sp.until = Math.min(r.sp.until, E.t);
      if (r.audio) { try { r.audio.pause(); } catch (e) { /* egal */ } }
    }
    duckOff();
  }

  async function fetchVoices() {
    const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': cfg.key } });
    if (!r.ok) throw new Error('HTTP ' + r.status + ' – Schlüssel okay?');
    const d = await r.json();
    return (d.voices || []).map(v => ({ id: v.voice_id, name: v.name }));
  }
  async function testLine() {
    const url = await cached('Hallo! Ich bin Zack, Zauberer wider Willen.', voiceFor('zack'));
    const a = new Audio(url);
    a.play().catch(() => {});
  }

  return {
    MODELS, speak, stop, enabled, fetchVoices, testLine, save,
    set(patch) { for (const k in patch) if (patch[k] !== undefined && patch[k] !== null) cfg[k] = patch[k]; save(); },
    get config() { return cfg; },
    get busy() { return !!cur; },
  };
})();
