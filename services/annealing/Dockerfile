FROM python:3.12-slim

WORKDIR /app

# Dependencias del sistema mínimas para numpy/openjij
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir .

COPY app ./app

EXPOSE 8000
# Cloud Run inyecta $PORT; por defecto 8000 en local.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
