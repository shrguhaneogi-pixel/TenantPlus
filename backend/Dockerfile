# ==============================================================================
# Project TenantPlus — Production FastAPI Backend Dockerfile
# Base Image: Python 3.10-slim (Optimized & Container-Native)
# ==============================================================================

FROM python:3.10-slim AS base

# Set environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies (curl for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install pinned requirements
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . /app/

# Create unprivileged security user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

# Production Gunicorn execution with 4 Uvicorn async worker processes
CMD exec gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT}
