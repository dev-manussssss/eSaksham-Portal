# Docker & Containerization Strategy — SAKSHAM

## 1. Multi-Container Architecture

SAKSHAM services are encapsulated in isolated, modular containers orchestrated via Docker Compose:

```
+--------------------------------------------------------------------+
|                         Docker Network                             |
|                                                                    |
|  [ frontend ]      ──▶  [ backend-api ]  ──▶  [ postgres-db ]      |
|  (Nginx/Static)         (Orchestrator)        (Primary SQL/PostGIS)|
|                              │                                     |
|                              ├──▶ [ redis ] (Queue & Caching)      |
|                              │                                     |
|                              ├──▶ [ cv-service ]                   |
|                              ├──▶ [ ocr-service ]                  |
|                              ├──▶ [ fraud-graph ]                  |
|                              └──▶ [ risk-engine ]                  |
+--------------------------------------------------------------------+
```

---

## 2. Container Profiles & Ports

| Container Service | Base Image | Internal Port | External Port (Dev) |
| :--- | :--- | :---: | :---: |
| `frontend` | `nginx:alpine` | 80 | 3000 |
| `backend-api` | `python:3.11-slim` / `node:20-alpine` | 8000 | 8000 |
| `postgres-db` | `postgis/postgis:15-3.3` | 5432 | 5432 |
| `redis` | `redis:7-alpine` | 6379 | 6379 |
| `risk-engine` | `python:3.11-slim` | 8001 | Internal Only |
| `cv-service` | `python:3.11-slim` | 8002 | Internal Only |
| `ocr-service` | `python:3.11-slim` | 8003 | Internal Only |
| `fraud-graph` | `python:3.11-slim` | 8004 | Internal Only |

---

## 3. Environment Segregation

- `docker/docker-compose.yml`: Standard development composition.
- `docker/docker-compose.prod.yml`: Production orchestration with hardened network policies and volume mounts.
- `docker/Dockerfile.*`: Individual service definition files with multi-stage builds.
