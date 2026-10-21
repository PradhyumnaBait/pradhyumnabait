export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function journeyStage(started: boolean, progress: number, count: number) {
  return started ? clamp(progress, 0, count) : -1;
}

export function routeFraction(stage: number, count: number) {
  return stage < 0 ? 0 : clamp(stage / Math.max(1, count - 1), 0, 1) * 0.92 + 0.04;
}

export function easeFrame(current: number, target: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-Math.min(delta, 64) / 130));
}