# Plan de migración: eliminar `ports`, rutas directas entre `islands`

## Motivo

Los viajes ya no se originan/destinan en puertos específicos, sino directamente entre islas. El módulo `islands` (`src/islands/`) ya existe como reemplazo funcional de `ports`. Falta:

1. Actualizar el schema de Prisma para que `routes` apunte a `islands` en vez de `ports`.
2. Eliminar el módulo `ports`.
3. Actualizar todos los consumidores que aún referencian `origin_ports` / `destination_ports` / `origin_port_id` / `destination_port_id`.

---

## 1. `src/databases/schema.prisma`

### Modelo `islands` (líneas 67-79)

- Eliminar el comentario muerto `// ports ports[]`.
- Agregar las relaciones inversas hacia `routes` (antes vivían en `ports`):

```prisma
model islands {
  id          String  @id @default(uuid())
  name        String  @db.VarChar(100)
  code        String  @unique @db.VarChar(10)
  description String  @db.Text
  is_active   Boolean @default(true)

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  // Relations one-to-many
  origin_routes      routes[] @relation("origin_routes")
  destination_routes routes[] @relation("destination_routes")
}
```

### Modelo `ports` (líneas 81-104)

- Borrar el bloque comentado por completo.

### Modelo `routes` (líneas 107-125)

- Cambiar las relaciones de `ports` a `islands`:

```prisma
model routes {
  id                  String  @id @default(uuid())
  // Relations many-to-one
  origin_islands      islands @relation("origin_routes", fields: [origin_island_id], references: [id])
  destination_islands islands @relation("destination_routes", fields: [destination_island_id], references: [id])

  origin_island_id      String
  destination_island_id String
  //
  distance_km         Decimal? @db.Decimal(6, 2)
  duration_minutes    Int
  base_price          Decimal  @db.Decimal(10, 2)
  is_active           Boolean  @default(true)

  created_at DateTime    @default(now())
  updated_at DateTime    @updatedAt
  schedules  schedules[]
}
```

**Por qué:** las rutas ahora conectan islas directamente, ya no hay puerto intermedio.

**Cambio adicional:** se colapsaron `base_price_resident`, `base_price_national` y `base_price_foreign` en un único campo `base_price`. Esto afecta a cualquier consumidor que lea esos tres campos (ver sección 4, `schedules.repository.ts`, que seleccionaba `base_price_national`).

---

## 2. Migración de base de datos

Después de editar el schema:

```bash
npx prisma migrate dev --name replace_ports_with_islands
```

Esto genera la migración SQL (drop `ports`, drop columnas `origin_port_id`/`destination_port_id`, crea `origin_island_id`/`destination_island_id` en `routes`) y regenera el cliente Prisma en `src/databases/generated/prisma`.

> ⚠️ No editar nada dentro de `generated/` a mano — se regenera solo.

---

## 3. Eliminar el módulo `ports`

Borrar completo:

- `src/ports/ports.controller.ts`
- `src/ports/ports.service.ts`
- `src/ports/ports.repository.ts`
- `src/ports/ports.module.ts`
- `src/ports/interfaces/port-response.interface.ts`

### `src/app.module.ts`

- Quitar `import { PortsModule } from './ports/ports.module';`
- Quitar `PortsModule` del arreglo `imports`.

(`IslandsModule` ya está agregado, solo falta retirar el rastro de `ports`.)

---

## 4. Módulo `schedules`

### `src/schedules/schedules.repository.ts`

Dentro de `findWithFilters`, en el `select` de `routes`: renombrar `origin_ports` → `origin_islands`, `destination_ports` → `destination_islands`, y quitar el `select` anidado de `islands` (ya no hay puerto de por medio, los campos van directo):

```ts
routes: {
  select: {
    base_price: true,
    origin_islands: {
      select: { name: true, description: true, code: true },
    },
    destination_islands: {
      select: { name: true, description: true, code: true },
    },
  },
},
```

> También renombrar `base_price_national` → `base_price` en cualquier otro lugar que lo consuma (revisar servicios/DTOs de `schedules` y `routes` que calculen precios por tipo de pasajero).

### Otros archivos que referencian `base_price_resident` / `base_price_national` / `base_price_foreign`

- **`src/schedules/interfaces/schedule-response.interface.ts:19`** — cambiar `base_price_national: Prisma.Decimal;` → `base_price: Prisma.Decimal;`.
- **`src/seat-holds-history/builders/seat-holds-history-query.builder.ts:50`** — cambiar `base_price_national: true,` → `base_price: true,` dentro del `select`.
- **`src/databases/seed.ts`** (líneas ~444-538) — cada `route` creada en el seed tiene los tres campos `base_price_resident` / `base_price_national` / `base_price_foreign`; colapsar a un solo `base_price` (definir qué valor usar, ya no hay diferenciación por tipo de pasajero a nivel de ruta).

> Nota: se pierde el campo `address` que antes venía del puerto (no existe en `islands`). Confirmar si se necesita en otro lado o se descarta.

### `src/schedules/specifications/schedule.specifications.ts`

Renombrar métodos y campos:

```ts
static byOriginIsland(islandId: string): Prisma.schedulesWhereInput {
  return { routes: { origin_island_id: islandId } };
}

static byDestinationIsland(islandId: string): Prisma.schedulesWhereInput {
  return { routes: { destination_island_id: islandId } };
}
```

### `src/schedules/schedules.service.ts` (líneas 41 y 45)

- Actualizar las llamadas a `ScheduleSpecifications.byOriginIsland(origin)` / `byDestinationIsland(destination)`.

### `src/schedules/dto/schedules-filter.dto.ts`

- Actualizar los comentarios `// origin_port_id` / `// destination_port_id` → `// origin_island_id` / `// destination_island_id` (los nombres `origin`/`destination` del DTO están bien, son genéricos).

---

## 5. Módulo `tickets`

### `src/tickets/builders/ticket-query.builder.ts`

En `withOutboundSchedule` y `withReturnSchedule`: igual que en `schedules.repository.ts` — `origin_ports`→`origin_islands`, `destination_ports`→`destination_islands`, eliminando el `islands: { select: { name: true } }` anidado y subiendo esos campos al nivel de la isla directamente.

### `src/tickets/interfaces/ticket-response.interface.ts`

Simplificar la interfaz, ya no hay doble anidamiento puerto→isla:

```ts
export interface Routes {
  origin_islands: Islands;
  destination_islands: Islands;
}

export interface Islands {
  name: string;
  code: string;
}
```

(Se elimina la interfaz `Ports`.)

### `src/tickets/mappers/ticket.mapper.ts` (líneas 37-40 y 66-69)

Actualizar accesos:

```ts
from: ticket.outbound_schedules.routes.origin_islands.code,
origin: ticket.outbound_schedules.routes.origin_islands.name,
to: ticket.outbound_schedules.routes.destination_islands.code,
destination: ticket.outbound_schedules.routes.destination_islands.name,
```

(y análogo para el bloque de `return_schedules`).

---

## 6. `src/databases/seed.ts`

- Quitar `await prisma.ports.deleteMany();` (línea 24).
- Quitar la sección "ISLANDS & PORTS" que crea `portAyora`, `portBaquerizo`, `portVillamil`, `portBaltra` (líneas ~316-390) — usar directamente las islas ya creadas.
- En la creación de `routes` (líneas ~440-533), reemplazar `origin_port_id: portX.id` / `destination_port_id: portX.id` por `origin_island_id: islandX.id` / `destination_island_id: islandX.id`, usando las variables de isla existentes en vez de las de puerto.
- Quitar `console.log(\`   - Ports: ${await prisma.ports.count()}\`);` (línea 966).

---

## Orden recomendado de ejecución

1. Editar `schema.prisma` → correr la migración.
2. Borrar módulo `ports` + limpiar `app.module.ts`.
3. Actualizar `schedules` (repository, specifications, service, dto).
4. Actualizar `tickets` (builder, interface, mapper).
5. Actualizar `seed.ts`.
6. Correr `npm run build` (o `tsc --noEmit`) para verificar que no queden referencias rotas a `ports`.
7. Re-seedear la base de datos de desarrollo (`npx prisma db seed` o el script que uses).
