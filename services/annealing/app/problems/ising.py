"""Max-Cut como QUBO — base de "El Rompecabezas de las Tazas" (sentar invitados que se odian/aman)."""

from __future__ import annotations

from ..schemas import QUBOInstance


def max_cut_qubo(n: int, edges: list[tuple[int, int, float]]) -> QUBOInstance:
    """
    Max-Cut ponderado: separar nodos maximizando el peso de las aristas cortadas.
    Como MINIMIZACIÓN: minimizar Σ w_ij (2 x_i x_j − x_i − x_j).
    """
    linear = [0.0] * n
    quadratic: list[tuple[int, int, float]] = []
    for i, j, w in edges:
        linear[i] -= w
        linear[j] -= w
        quadratic.append((i, j, 2.0 * w))
    return QUBOInstance(n=n, linear=linear, quadratic=quadratic)
