// Tiny synthesised sound effects for Twin Lanterns: no audio files, every
// sound is an oscillator shaped in code, so the game loads nothing at all.

let audioContext = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

// Browsers only allow audio after a user gesture; call this from the first
// pointer or key handler so later sounds are allowed to play.
export function unlockAudio() {
  if (!audioContext) {
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) audioContext = new Ctor();
    } catch {
      audioContext = null;
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
}

function tone(freq, startAt, length, type, volume, slideTo) {
  if (!audioContext || muted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now + startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + startAt + length);
  gain.gain.setValueAtTime(0.0001, now + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, now + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + startAt + length);
  osc.connect(gain).connect(audioContext.destination);
  osc.start(now + startAt);
  osc.stop(now + startAt + length + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(880, 0, 0.14, 'sine', 0.16);
  tone(1318, 0.09, 0.22, 'sine', 0.14);
}

// A low buzz for a wrong click.
export function playMiss() {
  tone(160, 0, 0.18, 'sawtooth', 0.08, 110);
}

// A soft shimmer when a hint is spent.
export function playHint() {
  tone(1046, 0, 0.12, 'triangle', 0.1);
  tone(1568, 0.08, 0.16, 'triangle', 0.08);
}

// A rising arpeggio when a level is cleared.
export function playLevelClear() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => tone(n, i * 0.1, 0.22, 'triangle', 0.12));
}

// A short tick in the last ten seconds.
export function playTick() {
  tone(1200, 0, 0.05, 'square', 0.04);
}
