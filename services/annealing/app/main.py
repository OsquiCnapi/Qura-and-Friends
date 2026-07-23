"""API FastAPI del servicio de annealing (OpenJij). Categoría 4: QUBO/Ising, rutas TSP, packing…

El navegador no lo llama directo: pasa por la Edge Function `anneal` de Supabase (JWT + rate-limit).
Endpoints:
  GET  /healthz     — salud
  POST /solve       — resuelve un QUBO (óptimo autoritativo / pista)
  POST /validate    — recomputa la energía de una asignación (anti-trampa, sin necesidad de resolver)
"""

from __future__ import annotations

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import require_service_token
from .schemas import (
    SolveRequest,
    SolveResponse,
    ValidateRequest,
    ValidateResponse,
)
from .solver import qubo_energy, solve_qubo

app = FastAPI(title="Quantum Party — Annealing", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # el acceso real llega vía Edge Function; endurecer en prod.
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/solve", response_model=SolveResponse, dependencies=[Depends(require_service_token)])
async def solve(req: SolveRequest) -> SolveResponse:
    assignment, energy, occurrences = solve_qubo(req.qubo, req.sweeps, req.num_reads)
    return SolveResponse(assignment=assignment, energy=energy, numOccurrences=occurrences)


@app.post("/validate", response_model=ValidateResponse, dependencies=[Depends(require_service_token)])
async def validate(req: ValidateRequest) -> ValidateResponse:
    if len(req.assignment) != req.qubo.n:
        return ValidateResponse(ok=False, energy=0.0, reason="longitud de asignación incorrecta")
    energy = qubo_energy(req.qubo, req.assignment)
    if req.claimed_energy is not None and abs(energy - req.claimed_energy) > 1e-6:
        return ValidateResponse(ok=False, energy=energy, reason="energía reclamada no coincide")
    return ValidateResponse(ok=True, energy=energy)
