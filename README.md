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
