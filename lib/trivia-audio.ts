// lib/trivia-audio.ts
// Browser-only helpers for Tricky Tempo Trivia: spoken questions (Web Speech API) and
// countdown / feedback sounds (Web Audio). No audio files needed.

let ctx: AudioContext | null = null;
let muted = false;

/** Call from a tap/click handler. Browsers keep audio locked until the first user gesture. */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

export function setMuted(value: boolean): void {
  muted = value;
  if (muted) stopSpeaking();
}

function beep(freq: number, durationMs: number, opts: { type?: OscillatorType; gain?: number; delayMs?: number } = {}): void {
  if (muted || !ctx) return;
  const { type = 'square', gain = 0.06, delayMs = 0 } = opts;
  const start = ctx.currentTime + delayMs / 1000;
  const end = start + durationMs / 1000;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

/** One tick per second. The last three seconds are higher and louder. */
export function playTick(secondsLeft: number): void {
  if (secondsLeft <= 3) beep(1320, 120, { gain: 0.09 });
  else beep(880, 70, { gain: 0.05 });
}

export function playCorrect(): void {
  beep(659, 110, { type: 'triangle', gain: 0.1 });
  beep(880, 180, { type: 'triangle', gain: 0.1, delayMs: 110 });
}

export function playWrong(): void {
  beep(196, 260, { type: 'sawtooth', gain: 0.08 });
}

export function playTimeUp(): void {
  beep(220, 380, { type: 'sawtooth', gain: 0.09 });
  beep(147, 520, { type: 'sawtooth', gain: 0.09, delayMs: 380 });
}

export function speak(text: string): void {
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.05;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}
