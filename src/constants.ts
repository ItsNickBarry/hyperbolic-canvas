declare global {
  interface Math {
    TAU: number;
  }
}

export const INFINITY = 1e12;
export const ZERO = 1e-6;

Math.TAU = 2 * Math.PI;
