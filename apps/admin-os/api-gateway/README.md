# api-gateway

Capa de entrada para composición de APIs de TAMV + RDM.

## Componentes

- **BFF/API Gateway** (NestJS + GraphQL, roadmap) para centralizar acceso a:
  - `city/tourism-engine`
  - `ai/isabella-core`
  - `economy/cattleya-pay`
- **Edge Kernel (Go)** en `api-gateway/edge-kernel`, orientado a estrategia **Edge-First**:
  - resuelve localmente `/api/v1/kernel/nodos-cercanos` contra PostGIS,
  - escucha `LISTEN/NOTIFY` del canal `canal_autopoiesis`,
  - proxy inverso del resto de tráfico hacia `CLOUD_URL`.

## Endpoints objetivo iniciales

- `GET /dichos`
- `POST /payments/checkout`
- `POST /isabella/urban-chat`

## Variables de entorno del Edge Kernel

- `PORT` (default `8080`)
- `CLOUD_URL` (default `https://cloud.tamv.network`)
- `DATABASE_URL` (requerida)

## Kubernetes

Los manifiestos de despliegue base para `rdmdigital` están en `infra/kubernetes/`:

- `rdm-backend-stack.yaml`
- `rdm-frontend-stack.yaml`
- `rdm-edge-kernel.yaml`
