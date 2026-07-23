/**
 * Formulación QUBO (Quadratic Unconstrained Binary Optimization) — base de la Categoría 4.
 *
 * NOTA: el annealing no existe en qbronze/qsilver; este módulo se crea desde cero. Sirve como
 * **fallback determinista en el cliente** (jugar offline con feedback instantáneo) y como base de la
 * **revalidación anti-trampa en el servidor** (la Edge Function recomputa la energía desde la
 * asignación enviada, sin necesitar OpenJij). El servicio Python (OpenJij) da el óptimo autoritativo.
 *
 * Minimiza  E(x) = Σ_i linear[i]·x_i + Σ_{i<j} quadratic[(i,j)]·x_i·x_j,  con x_i ∈ {0,1}.
 */
export interface QUBO {
  readonly n: number;
  /** Coeficientes lineales (diagonal), longitud n. */
  readonly linear: number[];
  /** Coeficientes cuadráticos como tripletas [i, j, valor] con i < j. */
  readonly quadratic: ReadonlyArray<readonly [number, number, number]>;
}

export type Assignment = ReadonlyArray<0 | 1>;

export function makeQUBO(
  n: number,
  linear: number[],
  quadratic: ReadonlyArray<readonly [number, number, number]>,
): QUBO {
  if (linear.length !== n) throw new Error("makeQUBO: linear debe tener longitud n");
  for (const [i, j] of quadratic) {
    if (i < 0 || j < 0 || i >= n || j >= n || i >= j) {
      throw new Error(`makeQUBO: par cuadrático inválido (${i}, ${j})`);
    }
  }
  return { n, linear: [...linear], quadratic };
}

/** Energía de una asignación binaria. Determinista — idéntica en cliente y servidor. */
export function energy(qubo: QUBO, x: Assignment): number {
  if (x.length !== qubo.n) throw new Error("energy: asignación de longitud incorrecta");
  let e = 0;
  for (let i = 0; i < qubo.n; i++) e += (qubo.linear[i] as number) * (x[i] as number);
  for (const [i, j, w] of qubo.quadratic) {
    e += w * (x[i] as number) * (x[j] as number);
  }
  return e;
}

/** Cambio de energía ΔE al voltear el bit `k` (evita recomputar toda la energía en el SA). */
export function deltaEnergyOnFlip(qubo: QUBO, x: Assignment, k: number): number {
  const xk = x[k] as number;
  const sign = xk === 1 ? -1 : 1; // 1→0 resta la contribución; 0→1 la suma
  let delta = sign * (qubo.linear[k] as number);
  for (const [i, j, w] of qubo.quadratic) {
    if (i === k) delta += sign * w * (x[j] as number);
    else if (j === k) delta += sign * w * (x[i] as number);
  }
  return delta;
}
