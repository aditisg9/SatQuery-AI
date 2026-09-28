# Stage 1: Build backend
FROM python:3.11-slim AS backend-builder
WORKDIR /app/backend
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libjpeg-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Build frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY frontend .
RUN npm run build

# Stage 3: Runtime
FROM python:3.11-slim
WORKDIR /app

# Install runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client curl nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY backend /app/backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public
COPY frontend/package.json frontend/next.config.js /app/frontend/

# Skip npm install since it's statically built; just copy node_modules if needed
# For Next.js production, .next and package.json are sufficient

# Entrypoint
WORKDIR /app
RUN echo '#!/bin/sh\nset -e\necho "Starting backend..."\ncd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &\necho "Starting frontend..."\ncd /app/frontend && npx next start' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 3000 8000
ENTRYPOINT ["/entrypoint.sh"]
