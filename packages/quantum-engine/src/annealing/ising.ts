/**
 * Modelo de Ising y su equivalencia con QUBO.
 *
 * Ising usa espines s_i ∈ {−1, +1}:  E(s) = Σ_i h_i·s_i + Σ_{i<j} J_{ij}·s_i·s_j.
 * La conversión x_i = (1 + s_i)/2 (o s_i = 2·x_i − 1) permite pasar de QUBO a Ising y viceversa.
 * Es el lenguaje natural de OpenJij, así que este módulo puentea el fallback TS con el servicio Python.
 */
import { type QUBO, makeQUBO } from "./qubo.js";

export interface Ising {
  readonly n: number;
  readonly h: number[]; // campos locales, longitud n
  readonly J: ReadonlyArray<readonly [number, number, number]>; // acoplamientos [i, j, valor], i < j
}

export type Spins = ReadonlyArray<-1 | 1>;

/** Energía de una configuración de espines. */
export function isingEnergy(model: Ising, s: Spins): number {
  let e = 0;
  for (let i = 0; i < model.n; i++) e += (model.h[i] as number) * (s[i] as number);
  for (const [i, j, w] of model.J) e += w * (s[i] as number) * (s[j] as number);
  return e;
}

/** Convierte un QUBO en su Ising equivalente (salvo una constante de energía). */
export function quboToIsing(qubo: QUBO): Ising {
  const h = new Array<number>(qubo.n).fill(0);
  const J: Array<readonly [number, number, number]> = [];

  // x_i = (1 + s_i)/2
  for (let i = 0; i < qubo.n; i++) h[i] = (qubo.linear[i] as number) / 2;

  for (const [i, j, w] of qubo.quadratic) {
    J.push([i, j, w / 4]);
    h[i] = (h[i] as number) + w / 4;
    h[j] = (h[j] as number) + w / 4;
  }
  return { n: qubo.n, h, J };
}

/** Convierte un Ising en QUBO equivalente. */
export function isingToQubo(model: Ising): QUBO {
  const linear = new Array<number>(model.n).fill(0);
  const quadratic: Array<readonly [number, number, number]> = [];

  // s_i = 2·x_i − 1
  for (let i = 0; i < model.n; i++) linear[i] = 2 * (model.h[i] as number);
  for (const [i, j, w] of model.J) {
    quadratic.push([i, j, 4 * w]);
    linear[i] = (linear[i] as number) - 2 * w;
    linear[j] = (linear[j] as number) - 2 * w;
  }
  return makeQUBO(model.n, linear, quadratic);
}
