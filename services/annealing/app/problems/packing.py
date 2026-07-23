"""Partición de números — base de "Empacando la Cesta de Jaime" (balancear dos cestas)."""

from __future__ import annotations

from ..schemas import QUBOInstance


def number_partition_qubo(weights: list[float]) -> QUBOInstance:
    """
    Reparte `weights` en dos grupos minimizando la diferencia de suma.
    QUBO: minimizar (Σ_i w_i (2 x_i − 1))². Expandido: lineal_i = w_i(w_i − 2S), cuad_{ij} = 8 w_i w_j.
    """
    n = len(weights)
    total = sum(weights)
    linear = [w * (w - 2 * total) for w in weights]
    quadratic: list[tuple[int, int, float]] = []
    for i in range(n):
        for j in range(i + 1, n):
            quadratic.append((i, j, 8.0 * weights[i] * weights[j]))
    return QUBOInstance(n=n, linear=linear, quadratic=quadratic)
