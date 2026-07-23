"""Tests del solver de annealing. Verifican la recomputación de energía (base del anti-trampa) y que
el recocido encuentra el óptimo en una instancia pequeña conocida."""

from __future__ import annotations

from app.problems import max_cut_qubo, number_partition_qubo
from app.schemas import QUBOInstance
from app.solver import qubo_energy, solve_qubo


def test_qubo_energy_matches_manual() -> None:
    # E = 1*x0 - 2*x1 + 3*x0*x1
    qubo = QUBOInstance(n=2, linear=[1.0, -2.0], quadratic=[(0, 1, 3.0)])
    assert qubo_energy(qubo, [0, 0]) == 0.0
    assert qubo_energy(qubo, [0, 1]) == -2.0
    assert qubo_energy(qubo, [1, 1]) == 2.0


def test_number_partition_balances() -> None:
    # [3, 1, 1, 2, 2] se puede partir en {3, 1} y {1, 2, 2}? sumas 4 y 5 (dif 1) o {3,2}=5 y {1,1,2}=4.
    qubo = number_partition_qubo([3, 1, 1, 2, 2])
    assignment, _energy, _ = solve_qubo(qubo, sweeps=500, num_reads=50)
    group_a = sum(w for w, x in zip([3, 1, 1, 2, 2], assignment) if x == 1)
    group_b = 9 - group_a
    assert abs(group_a - group_b) <= 1


def test_max_cut_small() -> None:
    # Triángulo: el mejor corte separa 1 nodo de los otros 2 (corta 2 de 3 aristas).
    qubo = max_cut_qubo(3, [(0, 1, 1.0), (1, 2, 1.0), (0, 2, 1.0)])
    assignment, energy, _ = solve_qubo(qubo, sweeps=300, num_reads=50)
    assert qubo_energy(qubo, assignment) == energy
    assert len(set(assignment)) == 2  # no todos en el mismo lado
