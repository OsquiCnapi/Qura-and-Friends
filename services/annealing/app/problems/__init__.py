"""Constructores de instancias QUBO para los minijuegos de la Categoría 4."""

from .ising import max_cut_qubo
from .packing import number_partition_qubo
from .tsp import tsp_qubo

__all__ = ["max_cut_qubo", "number_partition_qubo", "tsp_qubo"]
