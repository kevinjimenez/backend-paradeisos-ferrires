# Prisma Error Handler

Traduce errores internos de Prisma (`PrismaClientKnownRequestError`) a excepciones HTTP del dominio, de forma centralizada.

---

## Por qué

Sin el handler, un error de Prisma llega al cliente así:
```json
{ "message": "Internal server error", "statusCode": 500 }
```

Con el handler, el mismo error llega así:
```json
{
  "error": {
    "statusCode": 409,
    "message": "Field 'code' already exists",
    "path": "/api/tickets",
    "timestamp": "2026-03-22T10:00:00.000Z"
  }
}
```

---

## Implementación

### Patrón: Message Catalog

Mensajes al cliente y descripciones internas se agrupan por código en un único catálogo (`PRISMA_CATALOG`). Ventajas:

- Todo lo relacionado a un código Prisma está en un solo lugar
- El mapa de errores queda limpio — solo lógica, sin strings hardcodeadas
- Agregar un nuevo código requiere tocar un único objeto

```ts
// Un entry por código — message (cliente) + description (interno)
const PRISMA_CATALOG = {
  P2002: {
    message:     (target: string) => `Field '${target}' already exists`,
    description: 'Unique constraint failed — registro duplicado',
  },
  P2025: {
    message:     () => `Record not found`,
    description: 'Record not found — registro no encontrado en la BD',
  },
  // ...
} as const;
```

#### Uso del catálogo

```ts
PRISMA_CATALOG.P2002.message('email')   // → "Field 'mail' already exists"
PRISMA_CATALOG.P2002.description        // → "Unique constraint failed — registro duplicado"

PRISMA_CATALOG.P2003.message('scheduleId') // → "Related record 'scheduleId' not found"
PRISMA_CATALOG.P2003.description           // → "Foreign key constraint — referencia a un registro que no existe"
```

---

### `src/common/utils/prisma-error.handler.ts`

```ts
import { HttpStatus } from '@nestjs/common';
import { Prisma } from 'src/databases/generated/prisma/client';
import { DomainException } from '../exceptions/domian.exception';
import { ConflictException } from '../exceptions/conflict.exception';
import { ResourceNotFoundException } from '../exceptions/not-found.exception';

interface PrismaMeta {
  target?: string;
  field_name?: string;
}

// ── Catalog ───────────────────────────────────────────────────────────────────
const PRISMA_CATALOG = {
  P2002: {
    message:     (target: string) => `Field '${target}' already exists`,
    description: 'Unique constraint failed — registro duplicado',
  },
  P2025: {
    message:     () => `Record not found`,
    description: 'Record not found — registro no encontrado en la BD',
  },
  P2003: {
    message:     (field: string) => `Related record '${field}' not found`,
    description: 'Foreign key constraint — referencia a un registro que no existe',
  },
  P2014: {
    message:     () => `Operation violates a required relation`,
    description: 'Relation violation — viola una relación requerida',
  },
  P2000: {
    message:     (target: string) => `Value too long for field '${target}'`,
    description: 'Value too long — el valor supera el tamaño del campo',
  },
} as const;

// ── Error Map ────────────────────────────────────────────────────────────────
type PrismaErrorHandler = (meta: PrismaMeta) => never;

const PRISMA_ERROR_MAP: Record<string, { description: string; exception: PrismaErrorHandler }> = {
  P2002: {
    description: PRISMA_CATALOG.P2002.description,
    exception: (meta) => {
      throw new ConflictException(
        PRISMA_CATALOG.P2002.message(meta.target ?? 'unknown'),
      );
    },
  },
  P2025: {
    description: PRISMA_CATALOG.P2025.description,
    exception: () => {
      throw new ResourceNotFoundException('Record', 'unknown');
    },
  },
  P2003: {
    description: PRISMA_CATALOG.P2003.description,
    exception: (meta) => {
      throw new DomainException(
        PRISMA_CATALOG.P2003.message(meta.field_name ?? 'unknown'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    },
  },
  P2014: {
    description: PRISMA_CATALOG.P2014.description,
    exception: () => {
      throw new DomainException(
        PRISMA_CATALOG.P2014.message(),
        HttpStatus.CONFLICT,
      );
    },
  },
  P2000: {
    description: PRISMA_CATALOG.P2000.description,
    exception: (meta) => {
      throw new DomainException(
        PRISMA_CATALOG.P2000.message(meta.target ?? 'unknown'),
        HttpStatus.BAD_REQUEST,
      );
    },
  },
};

// ── Public handler ───────────────────────────────────────────────────────────
export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const handler = PRISMA_ERROR_MAP[error.code];
    if (handler) {
      handler.exception(error.meta as PrismaMeta);
    }
  }
  // código no mapeado o error desconocido → llega al HttpExceptionFilter como 500
  throw error;
}
```

#### Ejemplos de mensajes generados

```ts
PRISMA_MESSAGES.P2002('code')        // → "Field 'code' already exists"
PRISMA_MESSAGES.P2002('email')       // → "Field 'mail' already exists"
PRISMA_MESSAGES.P2003('scheduleId')  // → "Related record 'scheduleId' not found"
PRISMA_MESSAGES.P2000('name')        // → "Value too long for field 'name'"
PRISMA_MESSAGES.P2025()              // → "Record not found"
PRISMA_MESSAGES.P2014()              // → "Operation violates a required relation"
```

---

## Uso — Opción A: `$use` en `DatabasesService` (recomendado)

Intercepta **todos** los queries en un solo punto. El `BaseRepository` queda sin ningún try/catch.

```ts
// src/databases/databases.service.ts
import { handlePrismaError } from '../common/utils/prisma-error.handler';

@Injectable()
export class DatabasesService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ ... });
    super({ adapter });

    this.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (e) {
        handlePrismaError(e); // ← traduce el error de Prisma a excepción de dominio
      }
    });
  }
}
```

**`BaseRepository` sin try/catch:**
```ts
// src/common/base/base.repository.ts — sin cambios, sin try/catch
async create(data: unknown, tx?: PrismaTransaction): Promise<TModel> {
  return database[this.modelName].create({ data });
}

async update(id: string, data: unknown, tx?: PrismaTransaction): Promise<TModel> {
  return database[this.modelName].update({ where: { id }, data });
}

async delete(id: string, tx?: PrismaTransaction): Promise<TModel> {
  return database[this.modelName].delete({ where: { id } });
}
```

---

## Uso — Opción B: `handlePrismaError` en `BaseRepository`

Si no quieres tocar el `DatabasesService`, envuelves solo los métodos que pueden lanzar constraints:

```ts
// src/common/base/base.repository.ts
import { handlePrismaError } from '../utils/prisma-error.handler';

async create(data: unknown, tx?: PrismaTransaction): Promise<TModel> {
  try {
    return await database[this.modelName].create({ data });
  } catch (e) {
    handlePrismaError(e);
  }
}

async update(id: string, data: unknown, tx?: PrismaTransaction): Promise<TModel> {
  try {
    return await database[this.modelName].update({ where: { id }, data });
  } catch (e) {
    handlePrismaError(e);
  }
}

async delete(id: string, tx?: PrismaTransaction): Promise<TModel> {
  try {
    return await database[this.modelName].delete({ where: { id } });
  } catch (e) {
    handlePrismaError(e);
  }
}
```

> `findById` y `findAll` no necesitan try/catch — no lanzan errores de constraint, solo retornan `null` o `[]`.

---

## Comparación de opciones

| | Opción A (`$use`) | Opción B (BaseRepository) |
|---|---|---|
| **try/catch** | ninguno | en cada método write |
| **Cobertura** | todos los queries automáticamente | solo los métodos que envuelves |
| **Centralización** | un solo punto (DatabasesService) | distribuido en el repository |
| **Complejidad** | baja | baja |

---

## Diccionario de códigos Prisma

| Código | Descripción | Excepción lanzada | HTTP |
|--------|-------------|-------------------|------|
| `P2002` | Unique constraint — campo duplicado | `ConflictException` | 409 |
| `P2025` | Record not found | `ResourceNotFoundException` | 404 |
| `P2003` | Foreign key — referencia no existe | `DomainException` | 422 |
| `P2014` | Relation violation | `DomainException` | 409 |
| `P2000` | Value too long | `DomainException` | 400 |

---

## Ejemplos de respuesta al cliente

### P2002 — campo duplicado (ej: `code` único en tickets)
```ts
// tickets.repository.ts intenta crear un ticket con code duplicado
await this.db.ticketsModel.create({ data: { code: 'TKT-001', ... } });
// Prisma lanza P2002 → handlePrismaError lo intercepta
```
```json
{
  "error": {
    "statusCode": 409,
    "message": "Field 'code' already exists",
    "path": "/api/tickets",
    "timestamp": "2026-03-22T10:00:00.000Z"
  }
}
```

### P2025 — update/delete de registro inexistente
```ts
// base.repository.ts intenta actualizar un id que no existe
await this.db.ticketsModel.update({ where: { id: 'id-falso' }, data: { ... } });
// Prisma lanza P2025 → handlePrismaError lo intercepta
```
```json
{
  "error": {
    "statusCode": 404,
    "message": "Record with id 'unknown' not found",
    "path": "/api/tickets/id-falso",
    "timestamp": "2026-03-22T10:00:00.000Z"
  }
}
```

### P2003 — foreign key inválida
```ts
// intenta crear un ticket con scheduleId que no existe en schedules
await this.db.ticketsModel.create({ data: { scheduleId: 'id-inexistente', ... } });
```
```json
{
  "error": {
    "statusCode": 422,
    "message": "Related record 'scheduleId' not found",
    "path": "/api/tickets",
    "timestamp": "2026-03-22T10:00:00.000Z"
  }
}
```

### Error no mapeado → 500
```ts
// cualquier error de Prisma sin código conocido
// o error de red, timeout, etc.
```
```json
{
  "error": {
    "statusCode": 500,
    "message": "Internal server error",
    "path": "/api/tickets",
    "timestamp": "2026-03-22T10:00:00.000Z"
  }
}
```

---

## Ejemplo de uso completo — Opción A (`$use`)

Flujo real usando `tickets` como ejemplo.

### 1. `DatabasesService` — registra el middleware una vez
```ts
// src/databases/databases.service.ts
this.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (e) {
    handlePrismaError(e);
  }
});
```

### 2. `BaseRepository` — sin try/catch
```ts
// src/common/base/base.repository.ts
async create(data: unknown, tx?: PrismaTransaction): Promise<TModel> {
  return database[this.modelName].create({ data });
}
```

### 3. `TicketsRepository` — solo lógica de queries
```ts
// src/tickets/tickets.repository.ts
async findByCode(code: string): Promise<ticketsModel | null> {
  return this.db.ticketsModel.findUnique({ where: { code } });
}
```

### 4. `TicketsService` — lanza excepciones de negocio
```ts
// src/tickets/tickets.service.ts
async create(dto: CreateTicketDto) {
  // regla de negocio → service
  const existing = await this.ticketsRepository.findByCode(dto.code);
  if (existing) throw new ConflictException(`Ticket with code '${dto.code}' already exists`);

  // error de BD (P2002, P2003...) → $use lo intercepta automáticamente
  return this.ticketsRepository.create(dto);
}

async findOne(id: string) {
  const ticket = await this.ticketsRepository.findById(id);

  // null de BD → service lo interpreta
  if (!ticket) throw new ResourceNotFoundException('Ticket', id);

  return ticket;
}
```

### 5. `TicketsController` — sin manejo de errores
```ts
// src/tickets/tickets.controller.ts
@Post()
create(@Body() dto: CreateTicketDto) {
  return this.ticketsService.create(dto);
  // si falla → el error ya fue traducido antes de llegar aquí
}

@Get(':id')
findOne(@Param('id') id: string) {
  return this.ticketsService.findOne(id);
}
```

---

## Flujo completo

```
POST /api/tickets  →  Controller  →  Service  →  Repository  →  Prisma
                                         ↓
                                  ¿regla de negocio?
                                  sí → ResourceConflictException (409)
                                         ↓
                                  Repository.create()
                                         ↓
                                  Prisma falla con P2002
                                         ↓
                                  $use intercepta
                                         ↓
                                  handlePrismaError()
                                         ↓
                              ¿código en PRISMA_ERROR_MAP?
                               sí → lanza excepción de dominio
                               no → re-lanza el error original
                                         ↓
                              HttpExceptionFilter lo captura
                                         ↓
                    { error: { statusCode, message, path, timestamp } }
```
