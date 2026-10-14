import Phaser from 'phaser';

// --- Параметры игры (все числа — здесь, в логике магических чисел нет) ---
const PLAYER_X_SPEED = 420;
const PLAYER_Y = 560;
const HORIZON_Y = 180;
const ROAD_BOT_Y = 640;
const ROAD_TOP_W = 220;
const ROAD_BOT_W = 760;
const SPAWN_EVERY = 0.9;
const SPAWN_MIN = 0.5;
const COIN_Z = 0.34;
const TREE_Z = 0.32;
const ACCEL_STEP = 0.008;
const ACCEL_EVERY = 10;
const HIT_TREE_X = 24;
const HIT_PICKUP_X = 34;
const HIT_SHRINK = 0.7;
const HIT_TREE_SHRINK = 0.55;
const DANGER_Z = 0.55;
const COINS_TO_WIN = 20;
const LIVES = 3;
const TIME_LIMIT = 75;
const INVULN = 1.0;

// Размеры сущностей и сцены
const SCREEN_CX = 480;
const PLAYER_W = 64;
const PLAYER_H = 44;
const WHEEL_S = 14;
const TAIL_W = 10;
const TAIL_H = 8;
const COIN_R = 12;
const TREE_W = 44;
const TREE_H = 70;
const TRUNK_W = 10;
const TRUNK_H = 14;
const SHADOW_H = 10;
const MAX_OBJECTS = 25;
const REMOVE_Z = 1.1;
const SPAWN_X = 0.85;
const COIN_P = 0.42;
const DECOY_UPTO = 0.5;
const DECOY_COLOR = 0xfb9236;

// Масло и сердечки (вторая половина заезда)
const EXTRA_FROM = 30;
const OIL_P = 0.08;
const HEART_P = 0.05;
const OIL_W = 44;
const OIL_H = 14;
const REVERSE_TIME = 3;
const OIL_BAR_W = 200;
const OIL_BAR_H = 10;
const OIL_BAR_Y = 138;

// Форсаж: красное небо и разгон после 60 секунд
const OVERDRIVE_AT = 60;
const OVERDRIVE_MULT = 1.35;
const OVERDRIVE_SPAWN = 0.7;
const OVERDRIVE_FADE = 5;
const NIGHT_EVERY_OD = 12;
const SKY_RED_BANDS = [0x2b0a12, 0x3d0e18, 0x521220, 0x671826, 0x7c1e2a, 0x93262f];
const SUN_RED = 0xef4444;

// Мимик: монета-оборотень
const MIMIC_CHANCE = 0.3;
const MIMIC_Z = 0.45;

// Отталкиватель: монета-ловушка
const REPEL_TIME = 5;
const REPEL_X = 0.5;
const REPEL_EDGE = 0.95;

// Ночь и фары
const NIGHT_FIRST = 20;
const NIGHT_EVERY = 20;
const NIGHT_LEN = 8;
const NIGHT_WARN = 3;
const NIGHT_ALPHA = 1;
const BEAM_ALPHA = 0.85;

// Разметка дороги
const DASH_COUNT = 7;
const DASH_LEN = 0.06;
const LANE_X = 0.34;

// Небо и обочина (плоская статичная декорация)
const SKY_BANDS = [0x0b1026, 0x111a33, 0x16233f, 0x1c2f4d, 0x233c5d, 0x2a4a6e];
const SUN_X = 770;
const SUN_Y = 64;
const SUN_R = 26;
const CLOUDS = [
  { w: 110, h: 18, x: 120, y: 52, speed: 10 },
  { w: 150, h: 22, x: 520, y: 96, speed: 14 },
  { w: 90, h: 14, x: 830, y: 40, speed: 8 },
] as const;
const BUSH_ROWS = [250, 350, 460, 570];
const BUSH_W = 26;
const BUSH_H = 18;

// Ощущения: наклон, тряска, пульсация
const TILT_MAX = 0.08;
const TILT_LERP = 10;
const SHAKE_MS = 150;
const SHAKE_FORCE = 0.004;
const COIN_PULSE = 0.12;
const COIN_PULSE_SPEED = 7;
const FLOAT_DIST = PLAYER_H;
const FLOAT_MS = 650;

// Слои: мир (0) < трафик/игрок (9-10) < ночь (90-91) < HUD (100+)
const DEPTH_SHADOW = 9;
const DEPTH_ACTOR = 10;
const DEPTH_NIGHT = 90;
const DEPTH_BEAM = 91;
const DEPTH_HUD = 100;
const DEPTH_FLOAT = 101;
const DEPTH_FINAL = 102;

// Рекорд и звук
const BEST_KEY = 'rear-runner-best';

type TrafficKind = 'coin' | 'tree' | 'decoy' | 'oil' | 'heart';

interface TrafficItem {
  kind: TrafficKind;
  x: number;
  z: number;
  halfH: number;
  mimic: boolean;
  view: Phaser.GameObjects.Arc | Phaser.GameObjects.Container | Phaser.GameObjects.Ellipse;
  shadow: Phaser.GameObjects.Ellipse;
}

interface Best {
  coins: number;
  winTime: number | null;
}

// --- Крошечный звук без библиотек: осциллятор + огибающая ---
let audioCtx: AudioContext | null = null;
let audioReady = false;
let muted = false;

function ensureAudio(): void {
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

function sfxCoin(): void {
  beep(880, 0.09, 'square', 0.05);
  beep(1318, 0.12, 'square', 0.035, 0.06);
}

function sfxHit(): void {
  beep(120, 0.25, 'sawtooth', 0.08);
}

function sfxWin(): void {
  beep(523, 0.14, 'square', 0.05);
  beep(659, 0.14, 'square', 0.05, 0.12);
  beep(784, 0.22, 'square', 0.05, 0.24);
}

function sfxLose(): void {
  beep(330, 0.18, 'sawtooth', 0.06);
  beep(196, 0.3, 'sawtooth', 0.06, 0.16);
}

function sfxTrap(): void {
  beep(300, 0.12, 'square', 0.06);
  beep(210, 0.18, 'square', 0.06, 0.1);
}

function sfxMimic(): void {
  beep(500, 0.08, 'sawtooth', 0.05);
  beep(750, 0.1, 'sawtooth', 0.05, 0.07);
}

function sfxNight(): void {
  beep(98, 0.5, 'sine', 0.07);
}

function sfxHeart(): void {
  beep(1046, 0.1, 'sine', 0.05);
  beep(1568, 0.14, 'sine', 0.05, 0.08);
}

function sfxSkid(): void {
  beep(600, 0.12, 'sawtooth', 0.06);
  beep(320, 0.2, 'sawtooth', 0.06, 0.1);
}

function lerpColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

/**
 * «Тележка сзади»: rear-view runner, gray-box.
 * Дорога-трапеция, объекты едут с горизонта на камеру с ростом.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private playerX = SCREEN_CX;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  private roadGraphics!: Phaser.GameObjects.Graphics;
  private dashGraphics!: Phaser.GameObjects.Graphics;
  private clouds: { view: Phaser.GameObjects.Container; speed: number }[] = [];

  private traffic: TrafficItem[] = [];
  private spawnTimer = 0;
  private elapsed = 0;
  private dashPhase = 0;

  private coins = 0;
  private lives = LIVES;
  private invuln = 0;
  private finished = false;
  private paused = false;
  private best: Best = { coins: 0, winTime: null };

  private repelTimer = 0;
  private reverseTimer = 0;
  private overdriveBlend = 0;
  private skyGraphics!: Phaser.GameObjects.Graphics;
  private nightAlpha = 0;
  private wasNight = false;
  private overlay!: Phaser.GameObjects.Rectangle;
  private beam!: Phaser.GameObjects.Graphics;

  private coinsText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private recordText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private pauseText!: Phaser.GameObjects.Text;
  private repelText!: Phaser.GameObjects.Text;
  private oilText!: Phaser.GameObjects.Text;
  private oilBar!: Phaser.GameObjects.Graphics;
  private nightText!: Phaser.GameObjects.Text;
  private lastCoins = -1;
  private lastLives = -1;
  private lastTime = -1;
  private lastRecord = '';
  private lastRepel = -2;
  private lastOil = -2;
  private lastNightKey = '';

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.playerX = SCREEN_CX;
    this.traffic = [];
    this.clouds = [];
    this.spawnTimer = 0;
    this.elapsed = 0;
    this.dashPhase = 0;
    this.coins = 0;
    this.lives = LIVES;
    this.invuln = 0;
    this.finished = false;
    this.paused = false;
    this.lastCoins = -1;
    this.lastLives = -1;
    this.lastTime = -1;
    this.lastRecord = '';
    this.lastRepel = -2;
    this.lastOil = -2;
    this.lastNightKey = '';
    this.repelTimer = 0;
    this.reverseTimer = 0;
    this.overdriveBlend = 0;
    this.nightAlpha = 0;
    this.wasNight = false;
    this.best = this.loadBest();

    this.createSky();
    this.createRoad();
    this.createPlayer();
    this.createNight();
    this.createHud();

    if (!this.input.keyboard) {
      throw new Error('Keyboard input is unavailable.');
    }
    const kb = this.input.keyboard;
    this.cursors = kb.createCursorKeys();
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    // off() перед on(): защита от дублей после scene.restart().
    kb.off('keydown-R');
    kb.on('keydown-R', () => {
      this.scene.restart();
    });
    kb.off('keydown-M');
    kb.on('keydown-M', () => {
      muted = !muted;
    });
    kb.off('keydown-P');
    kb.on('keydown-P', () => {
      this.togglePause();
    });
    this.input.once('pointerdown', ensureAudio);
  }

  update(_time: number, delta: number): void {
    if (this.finished || this.paused) return;
    const dt = Math.min(delta / 1000, 0.05);

    if (!audioReady) ensureAudio();
    this.elapsed += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.repelTimer > 0) this.repelTimer -= dt;
    if (this.reverseTimer > 0) this.reverseTimer -= dt;
    if (this.isOverdrive() && this.overdriveBlend < 1) {
      this.overdriveBlend = Math.min(1, this.overdriveBlend + dt / OVERDRIVE_FADE);
      this.redrawSky(this.overdriveBlend);
    }

    this.movePlayer(dt);
    this.spawnTimer += dt;
    let interval = Phaser.Math.Linear(SPAWN_EVERY, SPAWN_MIN, this.elapsed / TIME_LIMIT);
    if (this.isOverdrive()) interval *= OVERDRIVE_SPAWN;
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawnTraffic();
    }

    this.updateTraffic(dt);
    this.updateDashes(dt);
    this.updateSky(dt);
    this.updateNight(dt);
    this.checkHits();
    this.updateHud();

    if (this.invuln > 0) {
      this.player.alpha = Math.floor(this.elapsed * 12) % 2 === 0 ? 0.35 : 1;
    } else {
      this.player.alpha = 1;
    }

    if (this.elapsed >= TIME_LIMIT) {
      this.finish(false);
    }
  }

  private trafficBonus(): number {
    return ACCEL_STEP * Math.floor(this.elapsed / ACCEL_EVERY);
  }

  private isOverdrive(): boolean {
    return this.elapsed >= OVERDRIVE_AT;
  }

  private speedMult(): number {
    return this.isOverdrive() ? OVERDRIVE_MULT : 1;
  }

  private createSky(): void {
    this.skyGraphics = this.add.graphics();
    this.redrawSky(0);
    // Облака: по 2 прямоугольника, едут медленно.
    this.clouds = CLOUDS.map((c) => {
      const main = this.add.rectangle(0, 0, c.w, c.h, 0xe2e8f0).setAlpha(0.75);
      const puff = this.add.rectangle(-c.w / 5, -c.h / 2, c.w / 2, c.h, 0xe2e8f0).setAlpha(0.75);
      const view = this.add.container(c.x, c.y, [main, puff]);
      return { view, speed: c.speed };
    });
    // Кусты на обочине: статичные, за краем дороги.
    BUSH_ROWS.forEach((y, i) => {
      const z = (y - HORIZON_Y) / (ROAD_BOT_Y - HORIZON_Y);
      const halfRoad = Phaser.Math.Linear(ROAD_TOP_W, ROAD_BOT_W, z) / 2;
      const off = halfRoad + 46 + ((i * 53) % 40);
      const color = i % 2 === 0 ? 0x166534 : 0x15803d;
      this.add.rectangle(SCREEN_CX - off, y, BUSH_W, BUSH_H, color);
      this.add.rectangle(SCREEN_CX + off, y, BUSH_W, BUSH_H, color);
    });
  }

  private redrawSky(t: number): void {
    const g = this.skyGraphics;
    g.clear();
    const bandH = HORIZON_Y / SKY_BANDS.length;
    SKY_BANDS.forEach((color, i) => {
      g.fillStyle(lerpColor(color, SKY_RED_BANDS[i], t), 1);
      g.fillRect(0, i * bandH, this.scale.width, bandH + 1);
    });
    // Солнце с мягким ореолом (в форсаже краснеет).
    const sun = lerpColor(0xfde68a, SUN_RED, t);
    g.fillStyle(sun, 0.25);
    g.fillCircle(SUN_X, SUN_Y, SUN_R * 2);
    g.fillStyle(sun, 1);
    g.fillCircle(SUN_X, SUN_Y, SUN_R);
    // Дальние горы двумя рядами.
    g.fillStyle(0x24344d, 1);
    g.fillTriangle(60, HORIZON_Y, 220, 96, 380, HORIZON_Y);
    g.fillTriangle(330, HORIZON_Y, 520, 78, 710, HORIZON_Y);
    g.fillTriangle(660, HORIZON_Y, 830, 104, 1000, HORIZON_Y);
    g.fillStyle(0x1a2438, 1);
    g.fillTriangle(-40, HORIZON_Y, 120, 128, 280, HORIZON_Y);
    g.fillTriangle(560, HORIZON_Y, 700, 122, 840, HORIZON_Y);
  }

  private updateSky(dt: number): void {
    for (const cloud of this.clouds) {
      cloud.view.x += cloud.speed * dt;
      if (cloud.view.x > this.scale.width + 150) cloud.view.x = -150;
    }
  }

  private createRoad(): void {
    // Обочина: тёмно-зелёная полоса от горизонта до низа.
    this.roadGraphics = this.add.graphics();
    this.roadGraphics.fillStyle(0x14532d, 1);
    this.roadGraphics.fillRect(0, HORIZON_Y, this.scale.width, ROAD_BOT_Y - HORIZON_Y);
    // Дорога: серый полигон-трапеция.
    const hwTop = ROAD_TOP_W / 2;
    const hwBot = ROAD_BOT_W / 2;
    this.roadGraphics.fillStyle(0x475569, 1);
    this.roadGraphics.beginPath();
    this.roadGraphics.moveTo(SCREEN_CX - hwTop, HORIZON_Y);
    this.roadGraphics.lineTo(SCREEN_CX + hwTop, HORIZON_Y);
    this.roadGraphics.lineTo(SCREEN_CX + hwBot, ROAD_BOT_Y);
    this.roadGraphics.lineTo(SCREEN_CX - hwBot, ROAD_BOT_Y);
    this.roadGraphics.closePath();
    this.roadGraphics.fillPath();

    this.dashGraphics = this.add.graphics();
  }

  private updateDashes(dt: number): void {
    // Скорость пунктира = средняя скорость трафика: ощущение скорости честное.
    const dashSpeed = ((COIN_Z + TREE_Z) / 2 + this.trafficBonus()) * this.speedMult();
    this.dashPhase = (this.dashPhase + dt * dashSpeed) % 1;
    const g = this.dashGraphics;
    g.clear();
    for (const laneX of [-LANE_X, LANE_X]) {
      for (let i = 0; i < DASH_COUNT; i += 1) {
        const z0 = (i / DASH_COUNT + this.dashPhase) % 1;
        const z1 = Math.min(z0 + DASH_LEN, 1);
        const p0 = this.project(laneX, z0);
        const p1 = this.project(laneX, z1);
        g.lineStyle(Phaser.Math.Linear(2, 6, z0), 0xffffff, 0.9);
        g.lineBetween(p0.x, p0.y, p1.x, p1.y);
      }
    }
  }

  private createPlayer(): void {
    this.playerShadow = this.add
      .ellipse(this.playerX, PLAYER_Y + PLAYER_H / 2 + 4, PLAYER_W, SHADOW_H, 0x000000, 0.3)
      .setDepth(DEPTH_SHADOW);
    const body = this.add.rectangle(0, 0, PLAYER_W, PLAYER_H, 0x2563eb);
    const tailL = this.add.rectangle(-PLAYER_W / 2 + TAIL_W, -PLAYER_H / 2 + TAIL_H, TAIL_W, TAIL_H, 0xef4444);
    const tailR = this.add.rectangle(PLAYER_W / 2 - TAIL_W, -PLAYER_H / 2 + TAIL_H, TAIL_W, TAIL_H, 0xef4444);
    const wheelL = this.add.rectangle(-PLAYER_W / 2 + WHEEL_S / 2, PLAYER_H / 2, WHEEL_S, WHEEL_S, 0x000000);
    const wheelR = this.add.rectangle(PLAYER_W / 2 - WHEEL_S / 2, PLAYER_H / 2, WHEEL_S, WHEEL_S, 0x000000);
    this.player = this.add.container(this.playerX, PLAYER_Y, [body, tailL, tailR, wheelL, wheelR]);
    this.player.setDepth(DEPTH_ACTOR);
  }

  private movePlayer(dt: number): void {
    let dir = 0;
    if (this.cursors.left.isDown || this.keyA.isDown) dir -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown) dir += 1;
    if (dir !== 0 && this.hintText.visible) this.hintText.setVisible(false);
    if (this.reverseTimer > 0) dir = -dir;
    this.playerX += dir * PLAYER_X_SPEED * dt;

    const zAtPlayer = (PLAYER_Y - HORIZON_Y) / (ROAD_BOT_Y - HORIZON_Y);
    const roadW = Phaser.Math.Linear(ROAD_TOP_W, ROAD_BOT_W, zAtPlayer);
    const limit = roadW / 2 - PLAYER_W / 2;
    this.playerX = Phaser.Math.Clamp(this.playerX, SCREEN_CX - limit, SCREEN_CX + limit);
    this.player.x = this.playerX;
    this.playerShadow.x = this.playerX;
    const targetRot = dir * TILT_MAX;
    this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetRot, Math.min(dt * TILT_LERP, 1));
  }

  private createShadow(x: number, y: number, w: number): Phaser.GameObjects.Ellipse {
    const shadow = this.add.ellipse(x, y, w, SHADOW_H, 0x000000, 0.3);
    shadow.setDepth(DEPTH_SHADOW);
    return shadow;
  }

  private createTreeView(x: number, y: number): Phaser.GameObjects.Container {
    const shade = Math.random() < 0.5 ? 0x22c55e : 0x16a34a;
    const crown = this.add.rectangle(0, -TRUNK_H / 2, TREE_W, TREE_H - TRUNK_H, shade);
    const trunk = this.add.rectangle(0, (TREE_H - TRUNK_H) / 2, TRUNK_W, TRUNK_H, 0x92400e);
    const view = this.add.container(x, y, [crown, trunk]);
    view.setDepth(DEPTH_ACTOR);
    return view;
  }

  private spawnTraffic(): void {
    if (this.traffic.length >= MAX_OBJECTS) return;
    const r = Math.random();
    let kind: TrafficKind = 'tree';
    if (this.elapsed >= EXTRA_FROM && r < OIL_P) kind = 'oil';
    else if (this.elapsed >= EXTRA_FROM && r < OIL_P + HEART_P) kind = 'heart';
    else if (r < COIN_P) kind = 'coin';
    else if (r < DECOY_UPTO) kind = 'decoy';
    const mimic = kind === 'coin' && Math.random() < MIMIC_CHANCE;
    const x = Phaser.Math.FloatBetween(-SPAWN_X, SPAWN_X);
    const z = 0;
    const p = this.project(x, z);
    const halfH = kind === 'tree' ? TREE_H / 2 : kind === 'oil' ? OIL_H / 2 : COIN_R;
    const shadowW = kind === 'tree' ? TREE_W + 10 : kind === 'oil' ? OIL_W + 8 : COIN_R * 2;
    const shadow = this.createShadow(p.x, p.y + halfH * p.s, shadowW);
    shadow.setScale(p.s);
    let view: Phaser.GameObjects.Arc | Phaser.GameObjects.Container | Phaser.GameObjects.Ellipse;
    if (kind === 'tree') {
      view = this.createTreeView(p.x, p.y);
    } else if (kind === 'oil') {
      view = this.add.ellipse(p.x, p.y, OIL_W, OIL_H, 0x1e293b);
      view.setDepth(DEPTH_ACTOR);
    } else {
      const color = kind === 'decoy' ? DECOY_COLOR : kind === 'heart' ? 0xf472b6 : 0xfacc15;
      view = this.add.circle(p.x, p.y, COIN_R, color);
      view.setDepth(DEPTH_ACTOR);
    }
    view.setScale(p.s);
    this.traffic.push({ kind, x, z, halfH, mimic, view, shadow });
  }

  private updateTraffic(dt: number): void {
    const bonus = this.trafficBonus();
    let playerWorldX = 0;
    if (this.repelTimer > 0) {
      const zP = (PLAYER_Y - HORIZON_Y) / (ROAD_BOT_Y - HORIZON_Y);
      const half = Phaser.Math.Linear(ROAD_TOP_W, ROAD_BOT_W, zP) / 2;
      playerWorldX = (this.playerX - SCREEN_CX) / half;
    }
    for (let i = this.traffic.length - 1; i >= 0; i -= 1) {
      const item = this.traffic[i];
      const roadBase = item.kind === 'tree' ? TREE_Z : item.kind === 'oil' ? (COIN_Z + TREE_Z) / 2 : COIN_Z;
      const speed = (roadBase + bonus) * this.speedMult();
      item.z += speed * dt;
      if (item.z > REMOVE_Z) {
        item.view.destroy();
        item.shadow.destroy();
        this.traffic.splice(i, 1);
        continue;
      }
      if (item.kind === 'coin' && item.mimic && item.z >= MIMIC_Z) {
        this.revealMimic(item);
        continue;
      }
      if (this.repelTimer > 0 && item.kind !== 'tree' && item.kind !== 'oil') {
        const away = item.x === playerWorldX ? (item.x >= 0 ? 1 : -1) : Math.sign(item.x - playerWorldX);
        item.x = Phaser.Math.Clamp(item.x + away * REPEL_X * dt, -REPEL_EDGE, REPEL_EDGE);
      }
      const p = this.project(item.x, item.z);
      if (item.kind === 'tree' || item.kind === 'oil') {
        item.view.setScale(p.s);
      } else {
        // Пульсация по X — дешёвая иллюзия вращения монеты.
        item.view.setScale(p.s * (1 + COIN_PULSE * Math.sin(this.elapsed * COIN_PULSE_SPEED + item.x * 4)), p.s);
      }
      item.view.setPosition(p.x, p.y);
      item.shadow.setPosition(p.x, p.y + item.halfH * p.s);
      item.shadow.setScale(p.s);
      // Телеграф угрозы: тень дерева краснеет, когда оно вот-вот достанет.
      const danger = item.kind === 'tree' && item.z >= DANGER_Z && Math.abs(p.x - this.playerX) < HIT_TREE_X;
      item.shadow.setFillStyle(danger ? 0xef4444 : 0x000000, danger ? 0.5 : 0.3);
    }
  }

  private revealMimic(item: TrafficItem): void {
    const p = this.project(item.x, item.z);
    item.view.destroy();
    item.shadow.destroy();
    const view = this.createTreeView(p.x, p.y);
    view.setScale(p.s);
    const shadow = this.createShadow(p.x, p.y + (TREE_H / 2) * p.s, TREE_W + 10);
    shadow.setScale(p.s);
    item.kind = 'tree';
    item.mimic = false;
    item.halfH = TREE_H / 2;
    item.view = view;
    item.shadow = shadow;
    sfxMimic();
    this.showFloatText(p.x, p.y - TREE_H / 2, 'Мимик!', '#c084fc');
  }

  private project(x: number, z: number): { x: number; y: number; s: number } {
    const roadW = Phaser.Math.Linear(ROAD_TOP_W, ROAD_BOT_W, z);
    return {
      x: SCREEN_CX + (x * roadW) / 2,
      y: HORIZON_Y + z * (ROAD_BOT_Y - HORIZON_Y),
      s: Phaser.Math.Linear(0.3, 1.25, z),
    };
  }

  private checkHits(): void {
    // Передний край тележки: контакт, когда низ объекта достаёт до верха машины.
    const frontY = PLAYER_Y - PLAYER_H / 2;
    for (let i = this.traffic.length - 1; i >= 0; i -= 1) {
      const item = this.traffic[i];
      const s = this.project(item.x, item.z).s;
      const isTree = item.kind === 'tree';
      const hitLimit = isTree ? HIT_TREE_X : HIT_PICKUP_X;
      const shrink = isTree ? HIT_TREE_SHRINK : HIT_SHRINK;
      if (item.view.y + item.halfH * shrink * s < frontY) continue;
      if (Math.abs(item.view.x - this.playerX) >= hitLimit) continue;
      // Контакт: объект убираем в любом случае, чтобы не было отложенных ударов.
      const hitX = item.view.x;
      const hitY = item.view.y;
      item.view.destroy();
      item.shadow.destroy();
      this.traffic.splice(i, 1);
      if (item.kind === 'coin') {
        this.coins += 1;
        sfxCoin();
        this.showFloatText(hitX, hitY, '+1', '#facc15');
        if (this.coins >= COINS_TO_WIN) {
          this.finish(true);
          return;
        }
      } else if (item.kind === 'decoy') {
        this.repelTimer = REPEL_TIME;
        sfxTrap();
        this.showFloatText(hitX, hitY, 'Ловушка!', '#fb9236');
      } else if (item.kind === 'heart') {
        if (this.lives < LIVES) this.lives += 1;
        sfxHeart();
        this.showFloatText(hitX, hitY, '+❤', '#f472b6');
      } else if (item.kind === 'oil') {
        this.reverseTimer = REVERSE_TIME;
        sfxSkid();
        this.showFloatText(hitX, hitY, 'Занос!', '#38bdf8');
      } else {
        if (this.invuln > 0) continue;
        this.lives -= 1;
        this.invuln = INVULN;
        sfxHit();
        this.cameras.main.flash(120, 220, 38, 38);
        this.cameras.main.shake(SHAKE_MS, SHAKE_FORCE);
        if (this.lives <= 0) {
          this.finish(false);
          return;
        }
      }
    }
  }

  private showFloatText(x: number, y: number, str: string, color: string): void {
    const t = this.add
      .text(x, y, str, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color,
      })
      .setOrigin(0.5)
      .setScale(0.6)
      .setDepth(DEPTH_FLOAT);
    this.tweens.add({
      targets: t,
      y: y - FLOAT_DIST,
      alpha: 0,
      scaleX: 1,
      scaleY: 1,
      duration: FLOAT_MS,
      onComplete: () => {
        t.destroy();
      },
    });
  }

  private createNight(): void {
    // Тёмная вуаль на весь экран + луч фар с аддитивным блендом (без масок — дешево).
    this.overlay = this.add.rectangle(SCREEN_CX, 320, this.scale.width, ROAD_BOT_Y, 0x050914, 0);
    this.overlay.setDepth(DEPTH_NIGHT);
    this.beam = this.add.graphics();
    this.beam.setDepth(DEPTH_BEAM);
    this.beam.setBlendMode(Phaser.BlendModes.ADD);
  }

  private nightState(): { mode: 'night' | 'warn' | 'day'; left: number } {
    const t = this.elapsed - NIGHT_FIRST;
    if (t < 0) {
      const to = -t;
      return to <= NIGHT_WARN ? { mode: 'warn', left: Math.ceil(to) } : { mode: 'day', left: 0 };
    }
    const period = this.elapsed >= OVERDRIVE_AT ? NIGHT_EVERY_OD : NIGHT_EVERY;
    const cyc = t % period;
    if (cyc < NIGHT_LEN) return { mode: 'night', left: Math.ceil(NIGHT_LEN - cyc) };
    const to = period - cyc;
    return to <= NIGHT_WARN ? { mode: 'warn', left: Math.ceil(to) } : { mode: 'day', left: 0 };
  }

  private updateNight(dt: number): void {
    const ns = this.nightState();
    const target = ns.mode === 'night' ? NIGHT_ALPHA : 0;
    this.nightAlpha += (target - this.nightAlpha) * Math.min(dt * 2.5, 1);
    if (Math.abs(target - this.nightAlpha) < 0.005) this.nightAlpha = target;
    this.overlay.setAlpha(this.nightAlpha);
    this.beam.clear();
    if (this.nightAlpha > 0.02) {
      const topHalf = ROAD_TOP_W / 2 + 30;
      this.beam.fillStyle(0xffe9a3, this.nightAlpha * BEAM_ALPHA);
      this.beam.beginPath();
      this.beam.moveTo(this.playerX - 30, PLAYER_Y - 10);
      this.beam.lineTo(SCREEN_CX - topHalf, HORIZON_Y);
      this.beam.lineTo(SCREEN_CX + topHalf, HORIZON_Y);
      this.beam.lineTo(this.playerX + 30, PLAYER_Y - 10);
      this.beam.closePath();
      this.beam.fillPath();
      this.beam.fillStyle(0xffe9a3, this.nightAlpha * 0.5);
      this.beam.fillEllipse(this.playerX, PLAYER_Y, PLAYER_W * 2, PLAYER_H * 2);
    }
    if (ns.mode === 'night' && !this.wasNight) sfxNight();
    this.wasNight = ns.mode === 'night';
  }

  private createHud(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    };
    this.coinsText = this.add.text(16, 12, '', style).setDepth(DEPTH_HUD);
    this.livesText = this.add.text(SCREEN_CX, 12, '', style).setOrigin(0.5, 0).setDepth(DEPTH_HUD);
    this.timeText = this.add.text(this.scale.width - 16, 12, '', style).setOrigin(1, 0).setDepth(DEPTH_HUD);
    this.progressText = this.add
      .text(SCREEN_CX, 42, '', { ...style, fontSize: '18px', color: '#facc15' })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_HUD);
    this.nightText = this.add
      .text(SCREEN_CX, 68, '', { ...style, fontSize: '16px', color: '#fde68a' })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_HUD)
      .setVisible(false);
    this.repelText = this.add
      .text(SCREEN_CX, 92, '', { ...style, fontSize: '16px', color: '#fb9236' })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_HUD)
      .setVisible(false);
    this.oilText = this.add
      .text(SCREEN_CX, 116, '', { ...style, fontSize: '16px', color: '#38bdf8' })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_HUD)
      .setVisible(false);
    this.oilBar = this.add.graphics().setDepth(DEPTH_HUD);
    this.recordText = this.add
      .text(this.scale.width - 16, 612, '', { ...style, fontSize: '14px', color: '#94a3b8' })
      .setOrigin(1, 0)
      .setDepth(DEPTH_HUD);
    this.hintText = this.add
      .text(
        SCREEN_CX,
        612,
        '←/→ или A/D — рулить. Собери 20 монет, объезжай деревья. M — звук.',
        { ...style, fontSize: '16px', color: '#cbd5e1' },
      )
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_HUD);
    this.pauseText = this.add
      .text(SCREEN_CX, 300, 'Пауза — жми P', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_FINAL)
      .setVisible(false);
    this.updateHud();
  }

  private togglePause(): void {
    if (this.finished) return;
    this.paused = !this.paused;
    this.pauseText.setVisible(this.paused);
    if (this.paused) this.tweens.pauseAll();
    else this.tweens.resumeAll();
  }

  private updateHud(): void {
    if (this.coins !== this.lastCoins) {
      this.lastCoins = this.coins;
      this.coinsText.setText(`Монеты: ${this.coins}/${COINS_TO_WIN}`);
      this.progressText.setText(`${'●'.repeat(this.coins)}${'○'.repeat(COINS_TO_WIN - this.coins)}`);
    }
    if (this.lives !== this.lastLives) {
      this.lastLives = this.lives;
      this.livesText.setText(`Жизни: ${'❤'.repeat(this.lives)}${'♡'.repeat(Math.max(LIVES - this.lives, 0))}`);
    }
    const left = Math.max(Math.ceil(TIME_LIMIT - this.elapsed), 0);
    if (left !== this.lastTime) {
      this.lastTime = left;
      this.timeText.setText(`Время: ${left}с`);
      this.timeText.setColor(left <= 10 ? '#ef4444' : '#ffffff');
    }
    this.timeText.setAlpha(left <= 10 && Math.floor(this.elapsed * 4) % 2 === 0 ? 0.45 : 1);
    const record = this.recordLine();
    if (record !== this.lastRecord) {
      this.lastRecord = record;
      this.recordText.setText(record);
    }
    const rs = this.repelTimer > 0 ? Math.ceil(this.repelTimer) : -1;
    if (rs !== this.lastRepel) {
      this.lastRepel = rs;
      if (rs < 0) {
        this.repelText.setVisible(false);
      } else {
        this.repelText.setVisible(true);
        this.repelText.setText(`Монеты разбегаются: ${rs}с`);
      }
    }
    const os = this.reverseTimer > 0 ? Math.ceil(this.reverseTimer) : -1;
    if (os !== this.lastOil) {
      this.lastOil = os;
      if (os < 0) {
        this.oilText.setVisible(false);
      } else {
        this.oilText.setVisible(true);
        this.oilText.setText('Занос: руль наоборот!');
      }
    }
    this.oilBar.clear();
    if (this.reverseTimer > 0) {
      const frac = this.reverseTimer / REVERSE_TIME;
      this.oilBar.fillStyle(0x334155, 1);
      this.oilBar.fillRect(SCREEN_CX - OIL_BAR_W / 2, OIL_BAR_Y, OIL_BAR_W, OIL_BAR_H);
      this.oilBar.fillStyle(0x38bdf8, 1);
      this.oilBar.fillRect(SCREEN_CX - OIL_BAR_W / 2, OIL_BAR_Y, OIL_BAR_W * frac, OIL_BAR_H);
    }
    const ns = this.nightState();
    const nightKey = `${ns.mode}${ns.left}`;
    if (nightKey !== this.lastNightKey) {
      this.lastNightKey = nightKey;
      if (ns.mode === 'day') {
        this.nightText.setVisible(false);
      } else if (ns.mode === 'warn') {
        this.nightText.setVisible(true);
        this.nightText.setColor('#94a3b8');
        this.nightText.setText(`Скоро ночь… ${ns.left}с`);
      } else {
        this.nightText.setVisible(true);
        this.nightText.setColor('#fde68a');
        this.nightText.setText('Ночь — смотри на фары!');
      }
    }
  }

  private recordLine(): string {
    const best = this.best.winTime !== null ? `победа за ${this.best.winTime}с` : `${this.best.coins}/${COINS_TO_WIN}`;
    return `Рекорд: ${best}${muted ? ' · звук выкл' : ''}`;
  }

  private loadBest(): Best {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      if (!raw) return { coins: 0, winTime: null };
      const parsed = JSON.parse(raw) as Partial<Best>;
      return {
        coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
        winTime: typeof parsed.winTime === 'number' ? parsed.winTime : null,
      };
    } catch {
      return { coins: 0, winTime: null };
    }
  }

  private saveBest(): void {
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(this.best));
    } catch {
      // Приватный режим и т.п. — игра работает без рекорда.
    }
  }

  private finish(won: boolean): void {
    if (this.finished) return;
    this.finished = true;
    if (this.coins > this.best.coins) this.best.coins = this.coins;
    if (won) {
      const t = Math.floor(this.elapsed);
      if (this.best.winTime === null || t < this.best.winTime) this.best.winTime = t;
      sfxWin();
    } else {
      sfxLose();
    }
    this.saveBest();
    this.add
      .text(SCREEN_CX, 300, won ? 'Победа!' : 'Game Over', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '64px',
        color: won ? '#facc15' : '#ef4444',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_FINAL);
    this.add
      .text(SCREEN_CX, 372, 'Жми R', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_FINAL);
  }
}
