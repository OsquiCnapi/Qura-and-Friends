/**
 * Aritmética de números complejos `a + b·i`.
 *
 * Nivel básico (qbronze) usa solo amplitudes reales (círculo unidad 2D); el nivel
 * intermedio/avanzado (qsilver) requiere amplitudes complejas para representar la fase relativa.
 * Se usa un objeto plano `{ re, im }` (sin clase) para mantener el motor liviano y tree-shakeable.
 */
export interface Complex {
  readonly re: number;
  readonly im: number;
}

export const complex = (re: number, im = 0): Complex => ({ re, im });

export const ZERO: Complex = complex(0, 0);
export const ONE: Complex = complex(1, 0);
export const I: Complex = complex(0, 1);

export const add = (a: Complex, b: Complex): Complex => complex(a.re + b.re, a.im + b.im);
export const sub = (a: Complex, b: Complex): Complex => complex(a.re - b.re, a.im - b.im);

export const mul = (a: Complex, b: Complex): Complex =>
  complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);

export const scale = (a: Complex, k: number): Complex => complex(a.re * k, a.im * k);

/** Conjugado complejo `a - b·i`. */
export const conj = (a: Complex): Complex => complex(a.re, -a.im);

/** Módulo al cuadrado `|z|²` = probabilidad de la amplitud (regla de Born). */
export const abs2 = (a: Complex): number => a.re * a.re + a.im * a.im;

export const abs = (a: Complex): number => Math.sqrt(abs2(a));

/** `e^{iθ}` — factor de fase unitario. */
export const expI = (theta: number): Complex => complex(Math.cos(theta), Math.sin(theta));

export const approxEqual = (a: Complex, b: Complex, eps = 1e-9): boolean =>
  Math.abs(a.re - b.re) < eps && Math.abs(a.im - b.im) < eps;

export const toString = (a: Complex): string => {
  const sign = a.im >= 0 ? "+" : "-";
  return `${a.re.toFixed(4)} ${sign} ${Math.abs(a.im).toFixed(4)}i`;
};
