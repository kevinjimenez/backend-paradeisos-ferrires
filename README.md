# API Paradeisos

REST API para gestión de reservas y tickets de transbordadores (ferries). Construida con NestJS, Prisma y PostgreSQL.

## Stack

- **Framework:** NestJS 11
- **ORM:** Prisma
- **Base de datos:** PostgreSQL
- **Lenguaje:** TypeScript

## Requisitos

- Node.js >= 18
- PostgreSQL

## Instalación

```bash
npm install
```

## Configuración

Copia el template y ajusta los valores:

```bash
cp .env.template .env
```

### Variables de entorno

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `PORT` | Sí | — | Puerto del servidor |
| `NODE_ENV` | No | `local` | Entorno (`local`, `development`, `production`) |
| `DB_NAME` | Sí | — | Nombre de la base de datos |
| `DB_HOST` | Sí | — | Host de PostgreSQL |
| `DB_PORT` | Sí | — | Puerto de PostgreSQL |
| `DB_USERNAME` | Sí | — | Usuario de PostgreSQL |
| `DB_PASSWORD` | Sí | — | Contraseña de PostgreSQL |
| `DATABASE_URL` | Sí | — | URL de conexión completa (Prisma) |
| `PAGINATION_LIMIT` | Sí | — | Límite de resultados por página |
| `PAGINATION_PAGE` | Sí | — | Página por defecto |
| `CHECK_IN_TIME` | Sí | — | Minutos antes de la salida para hacer check-in |
| `TAXES_VALUE` | No | `0` | Porcentaje de impuestos (ej: `0.1` = 10%) |
| `SERVICE_FEE_VALUE` | No | `0` | Cargo por servicio (monto fijo) |
| `DISCOUNT_VALUE` | No | `0` | Descuento aplicado |
| `HOLD_EXPIRATION_MINUTES` | No | `15` | Minutos antes de liberar una reserva no confirmada |
| `TICKET_CODE_PREFIX` | No | `TKT` | Prefijo para códigos de ticket |

## Comandos

> ⚠️ Antes de levantar el servidor o correr el seed, aplicá las migraciones pendientes (ver [Base de datos](#base-de-datos)): `npx prisma migrate deploy --config prisma.config.ts`

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run start:prod

# Poblar la base de datos
npm run db:seed

# Tests
npm run test
npm run test:cov
npm run test:e2e

# Lint y formato
npm run lint
npm run format
```

## Despliegue (Railway)

El proyecto se despliega en [Railway](https://railway.com) usando su builder **Railpack** (sin Docker ni Kubernetes). Pasos:

### 1. Servicios del proyecto

- **API**: deploy desde GitHub, branch `staging` (o `main` para producción).
- **PostgreSQL**: plugin nativo de Railway (`+ New → Database → Add PostgreSQL`).
- **Redis** (pendiente, cuando se migre `EventEmitter2` → BullMQ, ver `docs/BULLMQ_REDIS_PLAN.md`).

### 2. Variables de entorno del servicio API

Referenciadas desde el plugin de Postgres (botón "Add Reference"), **no** copiadas a mano, para que se actualicen solas si Railway rota credenciales:

```
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Manuales (obligatorias según `envs.ts`, sin default):

```
PAGINATION_LIMIT=10
PAGINATION_MAX=10
PAGINATION_PAGE=1
CHECK_IN_TIME=30
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM=...
```

Recomendadas:

```
NODE_ENV=production
CORS_ORIGIN=<url del frontend>
```

Necesaria para que Chromium/Playwright funcione (ver punto 4):

```
PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright
```

`PORT` no se setea — Railway lo inyecta solo.

### 3. Settings → Build

**Custom Build Command:**

```
npm install && npx prisma generate && npx playwright install chromium --with-deps && npm run build
```

Se instala Chromium explícitamente acá (en vez de depender de la detección automática de Playwright de Railpack) porque esa detección automática guarda el navegador en una ruta que no siempre persiste hacia la imagen final de deploy.

### 4. `railpack.json` — librerías de sistema para Chromium en runtime

`--with-deps` instala las libs de sistema durante el **build**, pero Railpack no las lleva a la imagen de **deploy** (son etapas separadas). Por eso se declaran explícitamente como dependencias de runtime en `railpack.json` (raíz del repo):

```json
{
  "$schema": "https://schema.railpack.com",
  "deploy": {
    "aptPackages": ["libglib2.0-0", "libnss3", "libnspr4", "..."]
  }
}
```

Sin esto, el arranque falla con `error while loading shared libraries: libglib-2.0.so.0: cannot open shared object file`.

### 5. Settings → Deploy

- **Pre-Deploy Command**: `npx prisma migrate deploy --config prisma.config.ts` — aplica migraciones antes de cada arranque. No reemplaza ni se solapa con el Build Command (ese no toca la DB, `prisma generate` solo lee el schema).
- **Custom Start Command**: `node dist/src/main`
- **Healthcheck Path**: `/health`

### 6. Seed — manual, nunca automático

`npm run db:seed` **borra todas las tablas** antes de recrear catálogos (fares, islands, ferries). Nunca ponerlo en el Pre-Deploy Command — correría en cada deploy y destruiría datos reales. Se corre a mano, una sola vez (o cuando se quiera resetear catálogo), con la Railway CLI:

```bash
railway login
railway link
railway run npm run db:seed
```

## Troubleshooting

### Puerto ocupado (`EADDRINUSE`)

Si al levantar el servidor ves `Error: listen EADDRINUSE: address already in use :::3000`, significa que otro proceso (probablemente una instancia anterior) sigue escuchando en ese puerto:

```bash
# Ver qué proceso ocupa el puerto 3000
lsof -nP -iTCP:3000 -sTCP:LISTEN

# Matarlo por PID
kill -9 <PID>

# O directamente por nombre/patrón
pkill -9 -f "nest start"
```

## Módulos

| Módulo | Descripción |
|--------|-------------|
| `bookings` | Gestión de reservas y bloqueo de asientos |
| `tickets` | Creación y generación de tickets en PDF |
| `schedules` | Horarios de ferries |
| `passengers` | Datos de pasajeros |
| `payments` | Procesamiento de pagos |
| `ports` | Puertos e islas |
| `contacts` | Gestión de contactos |
| `catalogs` | Catálogos del sistema |
| `tasks` | Tareas programadas (liberar reservas expiradas) |
| `health` | Health check del servicio |

## Endpoints

Todos los endpoints están bajo el prefijo `/api`, excepto:

- `GET /` — Raíz
- `GET /health` — Estado del servicio

## Base de datos

### Local

```bash
# Crear migración
npx prisma migrate dev --name <nombre_migracion> --config prisma.config.ts

# Generar cliente Prisma
npx prisma generate --config prisma.config.ts

# Ver datos en Prisma Studio
npx prisma studio --config prisma.config.ts
```

### Producción

```bash
# Aplicar migraciones existentes
npx prisma migrate deploy --config prisma.config.ts

# Generar cliente Prisma
npx prisma generate --config prisma.config.ts
```
