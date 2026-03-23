# Database Improvements

Análisis y recomendaciones para el folder `src/databases/` y archivos relacionados.

---

## Índice

1. [databases.service.ts](#1-databasesservicets)
2. [schema.prisma — FK opcionales](#2-schemaprisma--fk-opcionales)
3. [schema.prisma — Nombre inconsistente contacts_id](#3-schemaprisma--nombre-inconsistente-contacts_id)
4. [schema.prisma — opening_time / closing_time con @default(now())](#4-schemaprisma--opening_time--closing_time-con-defaultnow)
5. [schema.prisma — confirmed_at / cancelled_at con @default(now())](#5-schemaprisma--confirmed_at--cancelled_at-con-defaultnow)
6. [schema.prisma — Índices en campos de búsqueda](#6-schemaprisma--índices-en-campos-de-búsqueda)
7. [schema.prisma — catalogs sin relación con otros modelos](#7-schemaprisma--catalogs-sin-relación-con-otros-modelos)
8. [seed.ts — Orden de deleteMany](#8-seedts--orden-de-deletemany)
9. [base.repository.ts — Manejo de errores Prisma](#9-baserepositorysts--manejo-de-errores-prisma)

---

## 1. `databases.service.ts`

### Problema: `$use` eliminado en Prisma 5+

`$use` fue el API de middleware de Prisma hasta la versión 4. Fue **eliminado en Prisma 5** y no existe en Prisma 7 (versión actual del proyecto). Usar `$use` no producirá error de compilación pero **no interceptará nada en runtime**.

```ts
// ❌ No funciona en Prisma 7
this.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (e) {
    handlePrismaError(e);
  }
});
```

La alternativa oficial es `$extends`, pero devuelve una **nueva instancia** del cliente en lugar de mutar `this`. Esto rompe la inyección directa de `DatabasesService` en los repositorios.

**Solución recomendada:** manejar errores en `BaseRepository` (ver [punto 9](#9-baserepositorysts--manejo-de-errores-prisma)).

```ts
// ✅ databases.service.ts — sin $use, sin import huérfano
@Injectable()
export class DatabasesService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: envs.databaseUrl,
      ssl: envs.nodeEnv !== 'local' ? { rejectUnauthorized: false } : undefined,
    });
    super({ adapter });
  }
  // ...
}
```

---

## 2. `schema.prisma` — FK opcionales

### Problema: relaciones marcadas como opcionales sin razón de negocio

Varios campos de FK tienen `?` (opcionales) cuando el registro **no puede existir** sin su padre. Esto permite insertar datos huérfanos y complica las queries al tener que considerar `null`.

```prisma
// ❌ Un schedule sin ruta o sin ferry no tiene sentido
model schedules {
  route_id String?   // puede ser null — ¿un horario sin ruta?
  ferry_id String?   // puede ser null — ¿un horario sin ferry?
}

// ❌ Un passenger sin ticket no tiene sentido
model passengers {
  ticket_id String?
}

// ❌ Un payment sin ticket no tiene sentido
model payments {
  ticket_id String?
}
```

**Solución:** hacer requeridas las FK que representen relaciones obligatorias.

```prisma
// ✅
model schedules {
  routes  routes  @relation(fields: [route_id], references: [id])
  ferries ferries @relation(fields: [ferry_id], references: [id])

  route_id String
  ferry_id String
}

model passengers {
  tickets tickets @relation(fields: [ticket_id], references: [id])
  ticket_id String
}

model payments {
  tickets tickets @relation(fields: [ticket_id], references: [id])
  ticket_id String
}
```

> **Nota:** `seat_holds.contact_id` y `seat_holds.schedule_id` podrían justificarse como opcionales si el negocio permite holds anónimos o temporales sin schedule aún. Revisar con el dominio.

---

## 3. `schema.prisma` — Nombre inconsistente `contacts_id`

### Problema: FK con nombre en plural

Todos los modelos del schema usan el patrón `{tabla_singular}_id` para las FK:

| Modelo | FK | Patrón |
|---|---|---|
| `schedules` | `route_id` | singular ✅ |
| `schedules` | `ferry_id` | singular ✅ |
| `passengers` | `ticket_id` | singular ✅ |
| `payments` | `ticket_id` | singular ✅ |
| `seat_holds` | `contact_id` | singular ✅ |
| `tickets` | `contacts_id` | **plural ❌** |

```prisma
// ❌
model tickets {
  contacts    contacts? @relation(fields: [contacts_id], references: [id])
  contacts_id String?
}

// ✅
model tickets {
  contact    contacts? @relation(fields: [contact_id], references: [id])
  contact_id String?
}
```

> Requiere migración de base de datos para renombrar la columna.

---

## 4. `schema.prisma` — `opening_time` / `closing_time` con `@default(now())`

### Problema: el horario de apertura de un puerto no debe ser la fecha de creación del registro

```prisma
// ❌ El puerto no "abre" en el momento en que se inserta el registro
model ports {
  opening_time DateTime @default(now())
  closing_time DateTime @default(now())
}
```

`@default(now())` asigna la fecha y hora actuales al crear el registro. Si se crea un puerto el 15 de enero a las 14:32, su `opening_time` quedará como `2026-01-15T14:32:00Z` — un valor sin sentido como horario de operación.

**Opciones:**

```prisma
// Opción A — campos opcionales (se rellenan cuando se conozca el horario)
model ports {
  opening_time DateTime?
  closing_time DateTime?
}

// Opción B — si el horario es solo HH:MM sin fecha, usar String
model ports {
  opening_time String? @db.VarChar(5)  // "08:00"
  closing_time String? @db.VarChar(5)  // "18:00"
}
```

La Opción B es más semántica para horarios recurrentes (el puerto abre a las 8:00 todos los días, no en una fecha específica).

---

## 5. `schema.prisma` — `confirmed_at` / `cancelled_at` con `@default(now())`

### Problema: timestamps de eventos que aún no ocurrieron

```prisma
// ❌ Un ticket recién creado NO está confirmado ni cancelado
model tickets {
  confirmed_at DateTime? @default(now())
  cancelled_at DateTime? @default(now())
}
```

`@default(now())` con `?` es contradictorio: el campo es opcional (puede ser `null`) pero si se omite al crear, recibe la fecha actual automáticamente. Esto significa que cualquier ticket recién creado tendrá `confirmed_at = now()` aunque su status sea `pending`.

**Solución:** quitar el `@default(now())` de estos campos. Solo deben llenarse cuando el evento realmente ocurra.

```prisma
// ✅ Solo se asignan cuando el negocio lo determine
model tickets {
  confirmed_at DateTime?
  cancelled_at DateTime?
}
```

El mismo problema aplica en `payments`:

```prisma
// ❌
paid_at     DateTime? @default(now())  // un pago pending no está pagado
refunded_at DateTime? @default(now())  // un pago recién creado no está reembolsado

// ✅
paid_at     DateTime?
refunded_at DateTime?
```

---

## 6. `schema.prisma` — Índices en campos de búsqueda

### Problema: queries frecuentes sin índice

El schema solo define índices explícitos en `seat_holds_history`. Los demás modelos dependen de los índices implícitos de las FK y los `@unique`. Campos que se usarán frecuentemente en `WHERE` sin índice generan full table scans.

**Campos candidatos a índice:**

```prisma
model schedules {
  // Búsquedas por fecha de salida son el core del sistema
  @@index([departure_date])
  @@index([status])
  @@index([route_id, departure_date])  // query compuesto más común
}

model tickets {
  // Búsqueda por estado para backoffice y expiración
  @@index([status])
  @@index([booking_expires_at])  // para el job de expiración
}

model seat_holds {
  // Para el job que libera holds expirados
  @@index([expires_at, status])
}

model payments {
  @@index([status])
}
```

> `ticket_code`, `contacts.email`, `contacts.document_number`, `passengers.document_number` ya tienen `@unique`, que implica un índice automáticamente.

---

## 7. `schema.prisma` — `catalogs` sin relación con otros modelos

### Problema: duplicación de responsabilidad entre `catalogs` y los enums

El modelo `catalogs` almacena valores como `DOC_TYPE = DNI | PASS`, pero el schema ya tiene el enum `DocumentType` con los mismos valores. Hay dos fuentes de verdad para el mismo concepto.

```prisma
// Enum en schema
enum DocumentType {
  dni
  passport
}

// Tabla catalogs (seed)
{ category: 'DOC_TYPE', code: 'DNI',  description: 'DNI' }
{ category: 'DOC_TYPE', code: 'PASS', description: 'Pasaporte' }
```

**Opciones:**

| Opción | Cuándo usarla |
|---|---|
| Mantener solo enums | Los valores son fijos y no cambian en runtime |
| Mantener solo `catalogs` | Los valores pueden cambiar sin deploy (ej: agregar países) |
| Mantener ambos | Si los enums son para validación de BD y catalogs para la UI (labels en español) |

Si `catalogs` se usa para mostrar labels en el frontend (ej: "Masculino" / "Femenino"), tiene sentido mantenerla. En ese caso, documentar explícitamente que `catalogs` es una tabla de presentación, no de validación.

---

## 8. `seed.ts` — Orden de `deleteMany`

### Problema: el orden de borrado no respeta las dependencias

El seed borra registros en este orden:

```ts
// ❌ Orden actual
await prisma.passengers.deleteMany();
await prisma.payments.deleteMany();
await prisma.tickets.deleteMany();       // ← passengers y payments dependen de tickets
await prisma.seat_holds.deleteMany();    // ← tickets dependen de seat_holds
await prisma.schedules.deleteMany();
await prisma.routes.deleteMany();
await prisma.ferries.deleteMany();
await prisma.ports.deleteMany();
await prisma.islands.deleteMany();
await prisma.contacts.deleteMany();
await prisma.catalogs.deleteMany();
```

Si las FK tienen restricción `RESTRICT` (sin `onDelete: Cascade`), borrar `tickets` antes de `seat_holds` falla porque `tickets` tiene FK hacia `seat_holds`. El orden correcto es borrar primero los **hijos** y luego los **padres**.

```ts
// ✅ Orden correcto — hijos antes que padres
await prisma.seat_holds_history.deleteMany();
await prisma.passengers.deleteMany();
await prisma.payments.deleteMany();
await prisma.tickets.deleteMany();
await prisma.seat_holds.deleteMany();
await prisma.schedules.deleteMany();
await prisma.routes.deleteMany();
await prisma.ferries.deleteMany();
await prisma.ports.deleteMany();
await prisma.islands.deleteMany();
await prisma.contacts.deleteMany();
await prisma.catalogs.deleteMany();
```

> `seat_holds_history` no estaba en el orden original — también debe borrarse antes que `seat_holds`.

---

## 9. `base.repository.ts` — Manejo de errores Prisma

### Contexto

`$use` no funciona en Prisma 7 (ver [punto 1](#1-databasesservicets)). La alternativa es agregar `try/catch` en los métodos write de `BaseRepository`, que es el único punto donde todos los repositorios convergen para operaciones de escritura.

```ts
// ✅ base.repository.ts
import { handlePrismaError } from '../utils/prisma-error.handler';

async create(data: unknown, tx?: PrismaTransaction): Promise<TModel> {
  const database = tx ?? this.db;
  try {
    return await database[this.modelName].create({ data });
  } catch (e) {
    handlePrismaError(e);
  }
}

async update(id: string, data: unknown, tx?: PrismaTransaction): Promise<TModel> {
  const database = tx ?? this.db;
  try {
    return await database[this.modelName].update({ where: { id }, data });
  } catch (e) {
    handlePrismaError(e);
  }
}

async delete(id: string, tx?: PrismaTransaction): Promise<TModel> {
  const database = tx ?? this.db;
  try {
    return await database[this.modelName].delete({ where: { id } });
  } catch (e) {
    handlePrismaError(e);
  }
}
```

> `findById`, `findAll`, `count` y `exists` **no necesitan** try/catch — no lanzan errores de constraint, solo retornan `null`, `[]` o un número.

---

## Resumen de prioridades

| # | Archivo | Mejora | Impacto | Requiere migración |
|---|---|---|---|---|
| 1 | `databases.service.ts` | Quitar `$use` (no funciona en Prisma 7) | **Alto** — silently broken | No |
| 9 | `base.repository.ts` | Agregar manejo de errores Prisma | **Alto** — errores no traducidos | No |
| 5 | `schema.prisma` | `confirmed_at` / `cancelled_at` sin `@default(now())` | **Alto** — datos incorrectos | Sí |
| 4 | `schema.prisma` | `opening_time` / `closing_time` sin `@default(now())` | **Alto** — datos incorrectos | Sí |
| 2 | `schema.prisma` | FK requeridas en schedules, passengers, payments | **Medio** — integridad de datos | Sí |
| 6 | `schema.prisma` | Índices en campos de búsqueda frecuente | **Medio** — performance | Sí |
| 8 | `seed.ts` | Orden correcto de `deleteMany` | **Medio** — seed puede fallar | No |
| 3 | `schema.prisma` | Renombrar `contacts_id` → `contact_id` | **Bajo** — consistencia | Sí |
| 7 | `schema.prisma` | Definir rol de `catalogs` vs enums | **Bajo** — claridad | No |
