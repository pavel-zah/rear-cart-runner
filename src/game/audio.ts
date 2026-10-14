// Крошечный звук без библиотек: осциллятор + огибающая.
// Состояние модуля: сцена читает его только через is*/toggle*.

let audioCtx: AudioContext | null = null;
let audioReady = false;
let muted = false;

export function ensureAudio(): void {
  if (audioReady) return;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
      return;
    }
    audioReady = true;
  } catch {
    // Без звука — игра работает как раньше.
  }
}

export function isAudioReady(): boolean {
  return audioReady;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMuted(): void {
  muted = !muted;
}

function beep(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0): void {
  if (muted || !audioCtx || !audioReady) return;
  try {
    const t0 = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    // Игнорируем сбои звука.
  }
}

export function sfxCoin(): void {
  beep(880, 0.09, 'square', 0.05);
  beep(1318, 0.12, 'square', 0.035, 0.06);
}

export function sfxHit(): void {
  beep(120, 0.25, 'sawtooth', 0.08);
}

export function sfxWin(): void {
  beep(523, 0.14, 'square', 0.05);
  beep(659, 0.14, 'square', 0.05, 0.12);
  beep(784, 0.22, 'square', 0.05, 0.24);
}

export function sfxLose(): void {
  beep(330, 0.18, 'sawtooth', 0.06);
  beep(196, 0.3, 'sawtooth', 0.06, 0.16);
}

export function sfxTrap(): void {
  beep(300, 0.12, 'square', 0.06);
  beep(210, 0.18, 'square', 0.06, 0.1);
}

export function sfxMimic(): void {
  beep(500, 0.08, 'sawtooth', 0.05);
  beep(750, 0.1, 'sawtooth', 0.05, 0.07);
}

export function sfxNight(): void {
  beep(98, 0.5, 'sine', 0.07);
}

export function sfxHeart(): void {
  beep(1046, 0.1, 'sine', 0.05);
  beep(1568, 0.14, 'sine', 0.05, 0.08);
}

export function sfxSkid(): void {
  beep(600, 0.12, 'sawtooth', 0.06);
  beep(320, 0.2, 'sawtooth', 0.06, 0.1);
}
