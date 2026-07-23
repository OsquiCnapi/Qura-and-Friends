# services/annealing — Quantum Annealing (OpenJij)

Microservicio Python (FastAPI + OpenJij) para la **Categoría 4** de Quantum Party (optimización / temple
cuántico). El cliente juega con un fallback de recocido simulado en TS (`@quantum-party/quantum-engine`);
este servicio da el **óptimo autoritativo** y las **pistas**, y valida asignaciones.

## Desarrollo local

```bash
cd services/annealing
uv venv && uv pip install -e ".[dev]"     # o: python -m venv .venv && pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
pytest
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/healthz` | Salud |
| POST | `/solve` | Resuelve un QUBO (SASampler de OpenJij) |
| POST | `/validate` | Recomputa la energía de una asignación (anti-trampa) |

El navegador **no** llama aquí directamente: pasa por la Edge Function `anneal` de Supabase, que añade
`ANNEAL_SERVICE_TOKEN` y el JWT del usuario. Despliegue recomendado: **Google Cloud Run** (scale-to-zero).
