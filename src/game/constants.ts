// Параметры игры. Все числа — здесь, в логике магических чисел нет.

export const PLAYER_X_SPEED = 420;
export const PLAYER_Y = 560;
export const HORIZON_Y = 180;
export const ROAD_BOT_Y = 640;
export const ROAD_TOP_W = 220;
export const ROAD_BOT_W = 760;
export const SPAWN_EVERY = 0.9;
export const SPAWN_MIN = 0.5;
export const COIN_Z = 0.34;
export const TREE_Z = 0.32;
export const ACCEL_STEP = 0.008;
export const ACCEL_EVERY = 10;
export const HIT_TREE_X = 24;
export const HIT_PICKUP_X = 34;
export const HIT_SHRINK = 0.7;
export const HIT_TREE_SHRINK = 0.55;
export const DANGER_Z = 0.55;
export const COINS_TO_WIN = 20;
export const LIVES = 3;
export const TIME_LIMIT = 75;
export const INVULN = 1.0;

// Размеры сущностей и сцены
export const SCREEN_CX = 480;
export const PLAYER_W = 64;
export const PLAYER_H = 44;
export const WHEEL_S = 14;
export const TAIL_W = 10;
export const TAIL_H = 8;
export const COIN_R = 12;
export const TREE_W = 44;
export const TREE_H = 70;
export const TRUNK_W = 10;
export const TRUNK_H = 14;
export const SHADOW_H = 10;
export const MAX_OBJECTS = 25;
export const REMOVE_Z = 1.1;
export const SPAWN_X = 0.85;
export const COIN_P = 0.42;
export const DECOY_UPTO = 0.5;
export const DECOY_COLOR = 0xfb9236;

// Масло и сердечки (вторая половина заезда)
export const EXTRA_FROM = 30;
export const OIL_P = 0.08;
export const HEART_P = 0.05;
export const OIL_W = 44;
export const OIL_H = 14;
export const REVERSE_TIME = 3;
export const OIL_BAR_W = 200;
export const OIL_BAR_H = 10;
export const OIL_BAR_Y = 138;

// Форсаж: красное небо и разгон после 5 монет
export const OVERDRIVE_COINS = 5;
export const OVERDRIVE_MULT = 1.35;
export const OVERDRIVE_SPAWN = 0.7;
export const OVERDRIVE_FADE = 5;
export const NIGHT_EVERY_OD = 12;
export const SKY_RED_BANDS = [0x2b0a12, 0x3d0e18, 0x521220, 0x671826, 0x7c1e2a, 0x93262f];
export const SUN_RED = 0xef4444;

// Мимик: монета-оборотень
export const MIMIC_CHANCE = 0.3;
export const MIMIC_Z = 0.45;

// Отталкиватель: монета-ловушка
export const REPEL_TIME = 5;
export const REPEL_X = 0.5;
export const REPEL_EDGE = 0.95;

// Ночь и фары
export const NIGHT_FIRST = 20;
export const NIGHT_EVERY = 20;
export const NIGHT_LEN = 8;
export const NIGHT_WARN = 3;
export const NIGHT_ALPHA = 1;
export const BEAM_ALPHA = 0.85;

// Разметка дороги
export const DASH_COUNT = 7;
export const DASH_LEN = 0.06;
export const LANE_X = 0.34;

// Небо и обочина (плоская статичная декорация)
export const SKY_BANDS = [0x0b1026, 0x111a33, 0x16233f, 0x1c2f4d, 0x233c5d, 0x2a4a6e];
export const SUN_X = 770;
export const SUN_Y = 64;
export const SUN_R = 26;
export const CLOUDS = [
  { w: 110, h: 18, x: 120, y: 52, speed: 10 },
  { w: 150, h: 22, x: 520, y: 96, speed: 14 },
  { w: 90, h: 14, x: 830, y: 40, speed: 8 },
] as const;
export const BUSH_ROWS = [250, 350, 460, 570];
export const BUSH_W = 26;
export const BUSH_H = 18;

// Ощущения: наклон, тряска, пульсация
export const TILT_MAX = 0.08;
export const TILT_LERP = 10;
export const SHAKE_MS = 150;
export const SHAKE_FORCE = 0.004;
export const COIN_PULSE = 0.12;
export const COIN_PULSE_SPEED = 7;
export const FLOAT_DIST = PLAYER_H;
export const FLOAT_MS = 650;

// Слои: мир (0) < трафик/игрок (9-10) < ночь (90-91) < HUD (100+)
export const DEPTH_SHADOW = 9;
export const DEPTH_ACTOR = 10;
export const DEPTH_NIGHT = 90;
export const DEPTH_BEAM = 91;
export const DEPTH_HUD = 100;
export const DEPTH_FLOAT = 101;
export const DEPTH_FINAL = 102;

// Рекорд
export const BEST_KEY = 'rear-runner-best';
