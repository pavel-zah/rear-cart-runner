// Технические константы: геометрия, цвета, слои, вёрстка.
// Баланс (скорости, шансы, таймеры) — в tuning.ts.

export const PLAYER_Y = 560;
export const HORIZON_Y = 180;
export const ROAD_BOT_Y = 640;
export const ROAD_TOP_W = 220;
export const ROAD_BOT_W = 760;
// Глубина, на которой стоит машина: объект с z > PLAYER_Z уже проехали.
export const PLAYER_Z = (PLAYER_Y - HORIZON_Y) / (ROAD_BOT_Y - HORIZON_Y);

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
export const SPAWN_X = 0.85;
export const OIL_W = 44;
export const OIL_H = 14;
export const DECOY_COLOR = 0xfb9236;

// Небо и обочина (плоская статичная декорация)
export const SKY_BANDS = [0x0b1026, 0x111a33, 0x16233f, 0x1c2f4d, 0x233c5d, 0x2a4a6e];
export const SKY_RED_BANDS = [0x2b0a12, 0x3d0e18, 0x521220, 0x671826, 0x7c1e2a, 0x93262f];
export const SUN_RED = 0xef4444;
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

// Разметка дороги
export const DASH_COUNT = 7;
export const DASH_LEN = 0.06;
export const LANE_X = 0.34;

// Ночь и фары
export const NIGHT_FIRST = 20;
export const NIGHT_LEN = 8;
export const NIGHT_WARN = 3;
export const NIGHT_ALPHA = 1;
export const BEAM_ALPHA = 0.85;

// Всплывающий текст и бар заноса
export const FLOAT_DIST = PLAYER_H;
export const OIL_BAR_W = 200;
export const OIL_BAR_H = 10;
export const OIL_BAR_Y = 138;

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
