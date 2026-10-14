import Phaser from 'phaser';
import { HORIZON_Y, ROAD_BOT_W, ROAD_BOT_Y, ROAD_TOP_W, SCREEN_CX } from './constants';

// Одна формула проекции для всех объектов: мировой x (-1..1) и глубина z (0..1).
export function project(x: number, z: number): { x: number; y: number; s: number } {
  const roadW = Phaser.Math.Linear(ROAD_TOP_W, ROAD_BOT_W, z);
  return {
    x: SCREEN_CX + (x * roadW) / 2,
    y: HORIZON_Y + z * (ROAD_BOT_Y - HORIZON_Y),
    s: Phaser.Math.Linear(0.3, 1.25, z),
  };
}

export function lerpColor(a: number, b: number, t: number): number {
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
