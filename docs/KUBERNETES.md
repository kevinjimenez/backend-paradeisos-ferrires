# Kubernetes — API Paradeisos

## Consideración principal: Playwright

Esta API usa Playwright con Chromium para generar PDFs. Esto tiene implicaciones importantes en K8s:

- Cada pod levanta **una instancia de Chromium** (singleton via `OnModuleInit`)
- Chromium consume aprox. **300–500 MB RAM** adicionales por pod
- Los `CHROMIUM_LAUNCH_ARGS` ya están configurados para contenedores: `--no-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`
- El escalado horizontal **funciona**, pero hay que ajustar los recursos por pod

---

## Plan de despliegue

```
1. Dockerfile (multi-stage con Playwright)
2. ConfigMap  — variables no sensibles
3. Secret     — credenciales de base de datos
4. Deployment — la API
5. Service    — exposición interna
6. Ingress    — exposición externa
7. HPA        — escalado automático (con cuidado por Chromium)
```

---

## 1. Dockerfile

```dockerfile
# ── Stage 1: build ──────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ── Stage 2: producción ─────────────────────────────────────────
FROM node:20-slim AS production

# Dependencias de sistema para Playwright/Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Instalar browsers de Playwright
RUN npx playwright install chromium --with-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/databases/generated ./src/databases/generated
COPY --from=builder /app/src/databases/migrations ./src/databases/migrations
COPY --from=builder /app/src/tickets/templates ./src/tickets/templates
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# Aplicar migraciones y arrancar
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma.config.ts && node dist/src/main"]
```

> **Alternativa más segura:** usar un Init Container para las migraciones en vez del CMD compuesto (ver sección 4).

---

## 2. ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-paradeisos-config
  namespace: paradeisos
data:
  PORT: "3000"
  NODE_ENV: "production"
  PAGINATION_LIMIT: "10"
  PAGINATION_PAGE: "1"
  CHECK_IN_TIME: "30"
  HOLD_EXPIRATION_MINUTES: "15"
  TICKET_CODE_PREFIX: "TKT"
  TAXES_VALUE: "0.1"
  SERVICE_FEE_VALUE: "5"
  DISCOUNT_VALUE: "0"
  DB_HOST: "postgres-service"   # o el host del DB externo
  DB_PORT: "5432"
  DB_NAME: "ferry_db"
```

---

## 3. Secret

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-paradeisos-secret
  namespace: paradeisos
type: Opaque
stringData:
  DB_USERNAME: "postgres"
  DB_PASSWORD: "tu-password-seguro"
  DATABASE_URL: "postgresql://postgres:tu-password@postgres-service:5432/ferry_db?schema=public"
```

> En producción usar **Sealed Secrets**, **AWS Secrets Manager**, o **Vault** en vez de stringData plano.

---

## 4. Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-paradeisos
  namespace: paradeisos
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-paradeisos
  template:
    metadata:
      labels:
        app: api-paradeisos
    spec:
      # Init container: aplica migraciones antes de arrancar los pods
      initContainers:
        - name: migrate
          image: api-paradeisos:latest
          command: ["npx", "prisma", "migrate", "deploy", "--config", "prisma.config.ts"]
          envFrom:
            - configMapRef:
                name: api-paradeisos-config
            - secretRef:
                name: api-paradeisos-secret

      containers:
        - name: api
          image: api-paradeisos:latest
          ports:
            - containerPort: 3000

          envFrom:
            - configMapRef:
                name: api-paradeisos-config
            - secretRef:
                name: api-paradeisos-secret

          # Recursos — Chromium requiere más memoria que una API típica
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "1000m"

          # Health checks usando el endpoint /health
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 15
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
            failureThreshold: 3

          # /dev/shm más grande para Chromium (alternativa a --disable-dev-shm-usage)
          volumeMounts:
            - name: dshm
              mountPath: /dev/shm

      volumes:
        - name: dshm
          emptyDir:
            medium: Memory
            sizeLimit: 512Mi
```

---

## 5. Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-paradeisos-service
  namespace: paradeisos
spec:
  selector:
    app: api-paradeisos
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

---

## 6. Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-paradeisos-ingress
  namespace: paradeisos
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: api.paradeisos.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-paradeisos-service
                port:
                  number: 80
  tls:
    - hosts:
        - api.paradeisos.com
      secretName: paradeisos-tls
```

---

## 7. HPA (Horizontal Pod Autoscaler)

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-paradeisos-hpa
  namespace: paradeisos
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-paradeisos
  minReplicas: 2
  maxReplicas: 5        # limitado por el costo de Chromium por pod
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 70
```

> Con `maxReplicas: 5` y 1 GB de límite por pod, el techo es ~5 GB RAM solo para la API. Ajustar según el cluster disponible.

---

## Estructura de archivos K8s sugerida

```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secret.yaml
├── deployment.yaml
├── service.yaml
├── ingress.yaml
└── hpa.yaml
```

Aplicar en orden:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

---

## Decisiones clave

| Tema | Decisión recomendada | Por qué |
|------|----------------------|---------|
| DB en cluster vs externa | **Externa** (Neon, RDS, Cloud SQL) | PostgreSQL stateful en K8s es complejo de operar |
| Migraciones | **Init Container** | Garantiza que la DB está migrada antes de servir tráfico |
| Secrets | **Sealed Secrets o Vault** | No commitear credenciales en el repo |
| Escalado | **HPA por CPU/RAM** | Chromium hace que el escalado sea costoso — no escalar agresivamente |
| `/dev/shm` | **emptyDir Memory** | Más estable que `--disable-dev-shm-usage` para carga alta de PDFs |
| Cron tasks | **Dentro del Deployment** | El módulo `tasks` ya corre cada minuto — no se necesita K8s CronJob separado |
