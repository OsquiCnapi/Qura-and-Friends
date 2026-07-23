"""Esquemas pydantic del servicio de annealing. Coinciden con @quantum-party/schemas (zod) del cliente."""

from __future__ import annotations

from pydantic import BaseModel, Field


class QUBOInstance(BaseModel):
    """Instancia QUBO transportable. `quadratic` son tripletas [i, j, valor] con i < j."""

    n: int = Field(gt=0)
    linear: list[float]
    quadratic: list[tuple[int, int, float]]


class SolveRequest(BaseModel):
    qubo: QUBOInstance
    sweeps: int = Field(default=500, gt=0, le=5000)
    num_reads: int = Field(default=20, gt=0, le=200, alias="numReads")

    model_config = {"populate_by_name": True}


class SolveResponse(BaseModel):
    assignment: list[int]
    energy: float
    num_occurrences: int = Field(alias="numOccurrences")

    model_config = {"populate_by_name": True}


class ValidateRequest(BaseModel):
    qubo: QUBOInstance
    assignment: list[int]
    claimed_energy: float | None = Field(default=None, alias="claimedEnergy")

    model_config = {"populate_by_name": True}


class ValidateResponse(BaseModel):
    ok: bool
    energy: float
    reason: str | None = None
