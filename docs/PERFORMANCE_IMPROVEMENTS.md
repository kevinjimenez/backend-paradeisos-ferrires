# Performance Improvements

Guía de optimizaciones pendientes ordenadas por impacto. Incluye qué cambiar, dónde y por qué.

---

## Estado actual

| Optimización | Estado |
|---|---|
| Logger (Pino) | ✅ Implementado |
| Rate limiting (Throttler) | ✅ Implementado |
| Paginación | ✅ Implementado |
| Compresión HTTP | ❌ Pendiente |
| Prisma `select` en queries | ❌ Pendiente |
| DB connection pool | ❌ Pendiente |
| PDF generation async | ❌ Pendiente |
| Caching (Redis / in-memory) | ❌ Pendiente |

---

## 1. Caching — Mayor impacto

Rutas de solo lectura como `/ports`, `/schedules`, `/catalogs` consultan la BD en cada request aunque los datos no cambien frecuentemente.

### Opción A — Cache in-memory con `@nestjs/cache-manager`

Ideal para datos que cambian poco y no requieren invalidación entre instancias.

```bash
npm install @nestjs/cache-manager cache-manager
```

**Archivo:** `src/app.module.ts`
```ts
import { CacheModule } from '@nestjs/cache-manager';

CacheModule.register({
  isGlobal: true,
  ttl: 60 * 5, // 5 minutos
}),
```

**Archivo:** `src/ports/ports.service.ts`
```ts
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PortsService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll(): Promise<Port[]> {
    const cached = await this.cache.get<Port[]>('ports:all');
    if (cached) return cached;

    const ports = await this.portsRepository.findAll();
    await this.cache.set('ports:all', ports, 60 * 5);
    return ports;
  }
}
```

**Rutas candidatas:**
- `GET /ports` — puertos no cambian seguido
- `GET /catalogs` — datos de catálogo estáticos
- `GET /schedules` — con TTL corto (30s-1min)

### Opción B — Redis con `@nestjs/cache-manager` + `cache-manager-redis-yet`

Necesaria si hay múltiples instancias del servidor (el cache in-memory no se comparte entre procesos).

```bash
npm install cache-manager-redis-yet @types/cache-manager-redis-yet
```

**Archivo:** `src/app.module.ts`
```ts
import { redisStore } from 'cache-manager-redis-yet';

CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => ({
    store: await redisStore({ socket: { host: envs.redisHost, port: envs.redisPort } }),
    ttl: 60 * 5,
  }),
}),
```

---

## 2. Compresión HTTP

Sin compresión, los responses JSON y PDF viajan sin comprimir. `gzip` reduce el tamaño entre 60-80%.

```bash
npm install compression
npm install -D @types/compression
```

**Archivo:** `src/main.ts`
```ts
import * as compression from 'compression';

app.use(compression());
```

> Colócalo antes del `setGlobalPrefix` para que aplique a todas las rutas.

---

## 3. Prisma `select` en queries frecuentes

Por defecto Prisma retorna **todos los campos** de cada modelo, incluyendo los que el cliente no necesita. En tablas con muchas columnas esto impacta el tiempo de deserialización y el ancho de banda.

**Ejemplo — antes:**
```ts
// src/ports/repositories/ports.repository.ts
async findAll(): Promise<Port[]> {
  return this.db.port.findMany();
}
```

**Ejemplo — después:**
```ts
async findAll() {
  return this.db.port.findMany({
    select: {
      id:   true,
      name: true,
      code: true,
      city: true,
    },
  });
}
```

**Archivos a revisar:**
- `src/ports/repositories/ports.repository.ts`
- `src/schedules/repositories/schedules.repository.ts`
- `src/catalogs/repositories/catalogs.repository.ts`
- `src/passengers/repositories/passengers.repository.ts`

> Prioriza los `findAll` y `findMany` — los `findOne` impactan menos porque retornan un solo registro.

---

## 4. DB Connection Pool

Prisma usa un pool de conexiones definido en la `DATABASE_URL`. El valor por defecto puede ser insuficiente bajo carga.

**Archivo:** `.env`
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

| Parámetro | Descripción | Default |
|---|---|---|
| `connection_limit` | Máximo de conexiones abiertas | `num_cpus * 2 + 1` |
| `pool_timeout` | Segundos de espera por una conexión libre | `10` |

> Para un servidor con 2 CPUs el default sería ~5 conexiones. En producción con carga media, `10-20` es un buen punto de partida.

**Archivo:** `src/common/config/envs.ts` — agregar validación:
```ts
DATABASE_URL: joi.string().required(),
// ya existe — solo asegurarse de que incluya los query params en el .env
```

---

## 5. PDF Generation — Mover a background

La generación de PDFs (tickets) bloquea el event loop de Node.js porque es CPU-intensive. Bajo carga, un request de PDF lento afecta a todos los demás requests.

**Flujo actual:**
```
Request → Controller → GeneratePDF (bloquea) → Response
```

**Flujo recomendado:**
```
Request → Controller → Queue job → Response (202 Accepted)
Worker → GeneratePDF → Notifica al cliente (webhook / polling)
```

**Implementación con BullMQ** (ya documentado en `BULLMQ_REDIS_PLAN.md`):

**Archivo:** `src/tickets/queues/pdf.producer.ts`
```ts
@Injectable()
export class PdfProducer {
  constructor(@InjectQueue('pdf') private pdfQueue: Queue) {}

  async enqueuePdf(ticketId: string) {
    await this.pdfQueue.add('generate', { ticketId });
  }
}
```

**Archivo:** `src/tickets/queues/pdf.consumer.ts`
```ts
@Processor('pdf')
export class PdfConsumer {
  @Process('generate')
  async handle(job: Job<{ ticketId: string }>) {
    // lógica de generación de PDF aquí
  }
}
```

> Si el volumen de PDFs es bajo (< 100/día), el impacto es mínimo y puede dejarse síncrono por ahora.

---

## Prioridad de implementación

| Prioridad | Optimización | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | Caching in-memory (`/ports`, `/catalogs`) | Bajo | Alto |
| 2 | Compresión HTTP | Muy bajo | Medio |
| 3 | Prisma `select` en `findAll` | Medio | Medio |
| 4 | DB connection pool | Muy bajo | Medio en prod |
| 5 | PDF async con BullMQ | Alto | Alto si hay volumen |
