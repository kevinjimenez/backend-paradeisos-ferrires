# Plan: Migrar de EventEmitter2 a BullMQ + Redis

## Fase 1 — Entender los conceptos base

Antes de tocar código, entiende estos 4 conceptos:

**1. Queue (Cola)**
> Donde agregas trabajos pendientes. Tu app escribe aquí.

**2. Job (Trabajo)**
> Un item en la cola. Tiene un nombre y un payload (los datos).

**3. Worker (Procesador)**
> El que consume y ejecuta los jobs. Puede ser el mismo proceso o uno separado.

**4. Redis como broker**
> Solo actúa de intermediario — guarda la cola hasta que el worker la procesa.

```
Tu app (producer)          Redis              Worker (consumer)
     |                       |                      |
     |-- queue.add(job) --→  |                      |
     |                       |-- job disponible --→ |
     |                       |                      |-- procesa
     |                       |←-- job completado -- |
```

---

## Fase 2 — Leer (en orden)

1. [BullMQ — Quick Start](https://docs.bullmq.io/guide/quick-start) — 10 min
2. [@nestjs/bullmq — Getting Started](https://docs.nestjs.com/techniques/queues) — 15 min
3. [BullMQ — Workers](https://docs.bullmq.io/guide/workers) — 10 min
4. [BullMQ — Job options](https://docs.bullmq.io/guide/jobs/job-options) — 5 min
   - Enfócate en: `removeOnComplete`, `attempts`, `backoff`

---

## Fase 3 — Pasos de implementación

### Paso 1 — Instalar dependencias

```bash
npm install bullmq @nestjs/bullmq ioredis
```

---

### Paso 2 — Configurar Redis en AppModule

Registrar la conexión global de BullMQ con los datos de Redis Cloud.

```ts
// app.module.ts
BullModule.forRoot({
  connection: {
    host: 'redis-xxx.redis.cloud',
    port: 6379,
    password: 'xxx',
  },
})
```

> Para desarrollo local usa Docker:
> ```bash
> docker run -p 6379:6379 redis:alpine
> ```
> Y apunta a `host: 'localhost'`.

---

### Paso 3 — Registrar las queues en TicketsModule

Declarar las dos colas que va a usar el módulo de tickets.

```ts
// tickets.module.ts
BullModule.registerQueue(
  { name: 'generate-pdf' },
  { name: 'create-payment' },
)
```

---

### Paso 4 — Reemplazar eventEmitter.emit() en TicketsService

Cambiar el emit por `queue.add()` después de que la transacción se completa.

```ts
// ANTES
this.eventEmitter.emit('ticket.created', new TicketCreatedEvent(...))

// DESPUÉS
await this.generatePdfQueue.add('generate-pdf', { ticketId: newTicket.id })
await this.createPaymentQueue.add('create-payment', {
  ticketId: newTicket.id,
  total: newTicket.total,
})
```

> Los jobs se agregan con opciones recomendadas:
> ```ts
> { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true }
> ```

---

### Paso 5 — Convertir GenerateTicketPdfListener a Processor

El listener actual se convierte en un worker que procesa jobs de la cola `generate-pdf`.

```ts
// ANTES: listeners/generate-ticket-pdf.listener.ts
@OnEvent('ticket.created')
async handleTicketCreated(event: TicketCreatedEvent) { ... }

// DESPUÉS: processors/generate-ticket-pdf.processor.ts
@Processor('generate-pdf')
class GenerateTicketPdfProcessor extends WorkerHost {
  async process(job: Job<{ ticketId: string }>) { ... }
}
```

> La lógica interna (`ticketsService.generateTicketPdf()`) no cambia.

---

### Paso 6 — Convertir CreatePaymentListener a Processor

El mismo proceso que el Paso 5, pero para la cola `create-payment`.

```ts
// ANTES: listeners/create-payment.listener.ts
@OnEvent('ticket.created')
async handleTicketCreated(event: TicketCreatedEvent) { ... }

// DESPUÉS: processors/create-payment.processor.ts
@Processor('create-payment')
class CreatePaymentProcessor extends WorkerHost {
  async process(job: Job<{ ticketId: string; total: number }>) { ... }
}
```

---

### Paso 7 — Registrar los processors en TicketsModule

Agregar los processors como providers en el módulo.

```ts
// tickets.module.ts
providers: [
  // existentes...
  GenerateTicketPdfProcessor,
  CreatePaymentProcessor,
]
```

---

### Paso 8 — Probar localmente

1. Levantar Redis local con Docker
2. Crear un ticket via `POST /tickets`
3. Verificar en los logs que el worker procesa el job
4. Simular un fallo y verificar que reintenta (`attempts: 3`)

---

### Paso 9 — Conectar Redis Cloud free tier

1. Crear cuenta en [Redis Cloud](https://redis.io/try-free/)
2. Crear una base de datos free (30MB)
3. Copiar `host`, `port` y `password`
4. Actualizar la config del Paso 2 con las credenciales reales
5. Mover las credenciales a variables de entorno (`.env`)

```env
REDIS_HOST=redis-xxx.redis.cloud
REDIS_PORT=6379
REDIS_PASSWORD=xxx
```

---

## Resumen de archivos que cambian

| Archivo | Cambio |
|---|---|
| `app.module.ts` | Agregar `BullModule.forRoot()` |
| `tickets.module.ts` | Agregar `BullModule.registerQueue()` y registrar processors |
| `tickets.service.ts` | Reemplazar `eventEmitter.emit()` por `queue.add()` |
| `listeners/generate-ticket-pdf.listener.ts` | Eliminar o reemplazar por processor |
| `listeners/create-payment.listener.ts` | Eliminar o reemplazar por processor |
| `processors/generate-ticket-pdf.processor.ts` | Nuevo archivo |
| `processors/create-payment.processor.ts` | Nuevo archivo |

---

## Orden recomendado

```
Leer Fase 2
  → Paso 1 (instalar)
  → Paso 2-3 (configurar módulos)
  → Paso 4 (cambiar service)
  → Paso 5-6 (crear processors)
  → Paso 7 (registrar)
  → Paso 8 (probar local con Docker)
  → Paso 9 (conectar Redis Cloud)
```

Cada paso es independiente y verificable antes de continuar al siguiente.

---

## Capacidad con Redis Cloud free tier (30MB)

| Métrica | Estimado |
|---|---|
| Tamaño por job | ~1KB |
| Jobs en cola simultáneos | ~30,000 |
| Uso real para 1k requests/día | ~1MB |
| Margen disponible | 97% libre |

El límite de 30MB no será un problema para el volumen de este proyecto.
El riesgo real del free tier es la disponibilidad (best-effort SLA), no la capacidad.

---

## EventEmitter2 — ¿Se elimina?

Con BullMQ implementado, `EventEmitter2` ya no cumple ningún rol
en el flujo de `ticket.created`. Se puede eliminar:

| Qué eliminar | Archivo |
|---|---|
| `EventEmitter2` del constructor | `tickets.service.ts` |
| `TicketCreatedEvent` | `tickets/events/ticket-created.event.ts` |
| `GenerateTicketPdfListener` | `tickets/listeners/generate-ticket-pdf.listener.ts` |
| `CreatePaymentListener` | `tickets/listeners/create-payment.listener.ts` |
| `EventEmitterModule` de AppModule | `app.module.ts` (si no se usa en otro módulo) |
| `@nestjs/event-emitter` | `package.json` (desinstalar) |

> Antes de desinstalar `@nestjs/event-emitter`, verificar que no se usa en otro módulo:
> ```bash
> grep -r "OnEvent\|EventEmitter\|emit(" src/ --include="*.ts"
> ```
> Si no hay resultados fuera de tickets, se puede eliminar el paquete.
