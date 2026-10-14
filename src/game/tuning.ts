// Тюнинг геймдизайна: всё, что крутится при балансировке.
// Геометрия, цвета и слои — в constants.ts.
//
// Сложность устроена двумя фазами:
// - Фаза 1 (старт): спокойные базовые значения ниже.
// - Фаза 2 (форсаж после OVERDRIVE_COINS монет): к базе применяются
//   множители из блока фазы 2, небо краснеет, ночи чаще.

export const PLAYER_X_SPEED = 420;
export const COINS_TO_WIN = 20;
export const LIVES = 3;
export const TIME_LIMIT = 75;
export const INVULN = 1.0;

// === Фаза 1: спокойный старт ===
export const SPAWN_EVERY = 0.9;
export const SPAWN_MIN = 0.5;
export const COIN_Z = 0.34;
export const TREE_Z = 0.32;
export const ACCEL_STEP = 0.008;
export const ACCEL_EVERY = 10;
export const NIGHT_EVERY = 20;

// === Фаза 2: форсаж (включается при OVERDRIVE_COINS) ===
// Итог фазы 2: скорость 0.34→0.46 / 0.32→0.43, спавн ×0.7, ночи каждые 12с.
export const OVERDRIVE_COINS = 5;
export const OVERDRIVE_SPEED_MULT = 1.35;
export const OVERDRIVE_SPAWN_MULT = 0.7;
export const OVERDRIVE_FADE = 5;
export const NIGHT_EVERY_P2 = 12;

// Таблица спавна: деревья 50% / монеты 29% / масло 8% / ловушки 8% / сердца 5%
export const COIN_P = 0.42;
export const DECOY_UPTO = 0.5;
export const OIL_P = 0.08;
export const HEART_P = 0.05;
export const EXTRA_FROM = 30;
export const MAX_OBJECTS = 25;
export const REMOVE_Z = 1.1;

// Мимик: монета-оборотень
export const MIMIC_CHANCE = 0.3;
export const MIMIC_Z = 0.45;

// Отталкиватель: монета-ловушка
export const REPEL_TIME = 5;
export const REPEL_X = 0.5;
export const REPEL_EDGE = 0.95;

// Хитбоксы: дерево бьёт только корпусом, подбор щедрый
export const HIT_TREE_X = 24;
export const HIT_PICKUP_X = 34;
export const HIT_SHRINK = 0.7;
export const HIT_TREE_SHRINK = 0.55;
export const DANGER_Z = 0.55;

// Ощущения: наклон, тряска, пульсация, занос
export const TILT_MAX = 0.08;
export const TILT_LERP = 10;
export const SHAKE_MS = 150;
export const SHAKE_FORCE = 0.004;
export const COIN_PULSE = 0.12;
export const COIN_PULSE_SPEED = 7;
export const FLOAT_MS = 650;
export const REVERSE_TIME = 3;
