"""Verificación de autorización de las peticiones (token de servicio Edge→Python y/o JWT de Supabase)."""

from __future__ import annotations

import os

from fastapi import Header, HTTPException


async def require_service_token(authorization: str | None = Header(default=None)) -> None:
    """
    Autoriza la petición comparando el token de servicio compartido. El navegador NUNCA llama directo:
    pasa por la Edge Function `anneal`, que añade este token. En producción se puede reforzar
    verificando además el JWT de Supabase contra el JWKS del proyecto.
    """
    expected = os.environ.get("ANNEAL_SERVICE_TOKEN")
    if not expected:
        # Sin token configurado (desarrollo local): se permite.
        return
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="token de servicio inválido")
