# Stage 1: Build the React + TypeScript frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# Stage 2: Production Python FastAPI server
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy API backend source
COPY api/ /app/api/

# Copy built frontend assets from Stage 1 into web/dist
COPY --from=frontend-builder /app/web/dist /app/web/dist

EXPOSE 8000

ENV PORT=8000
WORKDIR /app/api

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
