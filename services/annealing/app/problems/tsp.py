"""TSP como QUBO — base de "La Ruta del Conejo Blanco" (camino más corto por las casillas)."""

from __future__ import annotations

from ..schemas import QUBOInstance


def tsp_qubo(distances: list[list[float]], penalty: float = 10.0) -> QUBOInstance:
    """
    TSP con codificación one-hot x_{t,c} (ciudad c en el paso t). Variables indexadas v = t*N + c.
    Objetivo: Σ_t Σ_{c,c'} dist[c][c'] x_{t,c} x_{t+1,c'}.
    Restricciones (penalizadas): cada paso tiene exactamente una ciudad y cada ciudad se visita una vez.
    """
    n = len(distances)
    num_vars = n * n

    def idx(t: int, c: int) -> int:
        return t * n + c

    linear = [0.0] * num_vars
    quad: dict[tuple[int, int], float] = {}

    def add_quad(a: int, b: int, w: float) -> None:
        i, j = (a, b) if a < b else (b, a)
        quad[(i, j)] = quad.get((i, j), 0.0) + w

    # Coste del recorrido (ciclo cerrado).
    for t in range(n):
        t_next = (t + 1) % n
        for c in range(n):
            for c2 in range(n):
                if c != c2:
                    add_quad(idx(t, c), idx(t_next, c2), distances[c][c2])

    # Restricción: un único nodo por paso. (Σ_c x_{t,c} − 1)²
    for t in range(n):
        for c in range(n):
            linear[idx(t, c)] += penalty * (1 - 2)
            for c2 in range(c + 1, n):
                add_quad(idx(t, c), idx(t, c2), 2 * penalty)

    # Restricción: cada ciudad exactamente una vez. (Σ_t x_{t,c} − 1)²
    for c in range(n):
        for t in range(n):
            linear[idx(t, c)] += penalty * (1 - 2)
            for t2 in range(t + 1, n):
                add_quad(idx(t, c), idx(t2, c), 2 * penalty)

    quadratic = [(i, j, w) for (i, j), w in quad.items()]
    return QUBOInstance(n=num_vars, linear=linear, quadratic=quadratic)
