"""Solver de annealing con OpenJij (recocido simulado / cuántico simulado)."""

from __future__ import annotations

import openjij as oj

from .schemas import QUBOInstance


def _to_dict(qubo: QUBOInstance) -> dict[tuple[int, int], float]:
    """Convierte la instancia a un dict QUBO {(i, j): valor} como espera OpenJij."""
    q: dict[tuple[int, int], float] = {}
    for i, coeff in enumerate(qubo.linear):
        if coeff != 0.0:
            q[(i, i)] = float(coeff)
    for i, j, w in qubo.quadratic:
        q[(int(i), int(j))] = float(w)
    return q


def solve_qubo(qubo: QUBOInstance, sweeps: int = 500, num_reads: int = 20) -> tuple[list[int], float, int]:
    """Resuelve un QUBO con SASampler de OpenJij. Devuelve (asignación, energía, ocurrencias)."""
    sampler = oj.SASampler()
    response = sampler.sample_qubo(_to_dict(qubo), num_sweeps=sweeps, num_reads=num_reads)
    best = response.first
    assignment = [int(best.sample[i]) for i in range(qubo.n)]
    return assignment, float(best.energy), int(best.num_occurrences)


def qubo_energy(qubo: QUBOInstance, assignment: list[int]) -> float:
    """Recomputa la energía QUBO (determinista) — misma fórmula que el cliente TS y la Edge Function."""
    e = 0.0
    for i, coeff in enumerate(qubo.linear):
        e += coeff * assignment[i]
    for i, j, w in qubo.quadratic:
        e += w * assignment[int(i)] * assignment[int(j)]
    return e
