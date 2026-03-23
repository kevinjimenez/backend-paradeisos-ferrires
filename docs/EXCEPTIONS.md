# Excepciones de Dominio

Guía de excepciones disponibles, las que faltan crear, y dónde/cómo usarlas.

---

## Estado actual

```
src/common/exceptions/
├── domian.exception.ts        ✅ existe
├── not-found.exception.ts     ✅ existe
└── conflict.exception.ts      ✅ existe
```

## Faltan crear

```
src/common/exceptions/
├── validation.exception.ts    ← reglas de negocio (422)
├── forbidden.exception.ts     ← sin permiso sobre el recurso (403)
└── index.ts                   ← barrel export
```

---

## Excepciones existentes

### `DomainException` — base
```ts
import { DomainException } from '../common/exceptions';
import { HttpStatus } from '@nestjs/common';

throw new DomainException('mensaje', HttpStatus.UNPROCESSABLE_ENTITY);
```
> Base de todas las excepciones de dominio. Usar cuando ninguna de las específicas aplica.

---

### `ResourceNotFoundException` — 404
```ts
throw new ResourceNotFoundException('Ticket', id);
// → "Ticket with id 'abc-123' not found"
```

**Dónde usarla:**
```ts
// tickets.service.ts
async findOne(id: string) {
  const ticket = await this.ticketsRepository.findById(id);

  if (!ticket) throw new ResourceNotFoundException('Ticket', id);

  return ticket;
}

// schedules.service.ts
async findOne(id: string) {
  const schedule = await this.schedulesRepository.findById(id);

  if (!schedule) throw new ResourceNotFoundException('Schedule', id);

  return schedule;
}

// catalogs.service.ts
async findByCategory(category: string) {
  const catalogs = await this.catalogsRepository.findByCategory(category);

  if (!catalogs.length) throw new ResourceNotFoundException('Catalog', category);

  return catalogs;
}
```

---

### `ResourceConflictException` — 409
```ts
throw new ResourceConflictException('mensaje del conflicto');
```

**Dónde usarla:**
```ts
// bookings — create-seat-hold.command.ts
if (schedule.availableSeats < totalPassengers) {
  throw new ResourceConflictException(
    `Schedule '${scheduleId}' does not have enough available seats`,
  );
}

// tickets — antes de crear
const existing = await this.ticketsRepository.findByCode(code);
if (existing) {
  throw new ResourceConflictException(`Ticket with code '${code}' already exists`);
}

// payments — no procesar dos veces
if (payment.status !== 'pending') {
  throw new ResourceConflictException(
    `Payment '${paymentId}' is already ${payment.status}`,
  );
}
```

---

## Excepciones a crear

### `ValidationException` — 422

Cuando la regla de negocio falla pero no es un conflicto ni un not found.

```ts
// src/common/exceptions/validation.exception.ts
import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domian.exception';

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
```

**Dónde usarla:**
```ts
// tickets — check-in fuera de tiempo
const minutesBeforeDeparture = differenceInMinutes(schedule.departureTime, new Date());
if (minutesBeforeDeparture > envs.checkInTime) {
  throw new ValidationException(
    `Check-in is not available yet. Opens ${envs.checkInTime} minutes before departure`,
  );
}

// bookings — fecha de viaje ya pasó
if (schedule.departureTime < new Date()) {
  throw new ValidationException('Cannot book a schedule that has already departed');
}

// passengers — edad inválida para la tarifa
if (passenger.type === 'adult' && passenger.age < 18) {
  throw new ValidationException('Adult passengers must be 18 or older');
}
```

---

### `ForbiddenResourceException` — 403

Cuando el usuario existe y está autenticado pero no tiene permiso sobre ese recurso específico.

```ts
// src/common/exceptions/forbidden.exception.ts
import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domian.exception';

export class ForbiddenResourceException extends DomainException {
  constructor(message: string = 'You do not have permission to access this resource') {
    super(message, HttpStatus.FORBIDDEN);
  }
}
```

**Dónde usarla:**
```ts
// tickets — solo el dueño puede ver su ticket
async findOne(id: string, requestingUserId: string) {
  const ticket = await this.ticketsRepository.findById(id);

  if (!ticket) throw new ResourceNotFoundException('Ticket', id);

  if (ticket.userId !== requestingUserId) {
    throw new ForbiddenResourceException('You do not own this ticket');
  }

  return ticket;
}

// bookings — cancelar solo si es tuya
async cancel(id: string, requestingUserId: string) {
  const booking = await this.bookingsRepository.findById(id);

  if (!booking) throw new ResourceNotFoundException('Booking', id);

  if (booking.userId !== requestingUserId) {
    throw new ForbiddenResourceException('You cannot cancel a booking that is not yours');
  }
}
```

---

### `index.ts` — barrel export

```ts
// src/common/exceptions/index.ts
export * from './domian.exception';
export * from './not-found.exception';
export * from './conflict.exception';
export * from './validation.exception';
export * from './forbidden.exception';
```

Con el barrel, el import en cualquier servicio queda limpio:
```ts
import {
  ResourceNotFoundException,
  ResourceConflictException,
  ValidationException,
  ForbiddenResourceException,
} from '../common/exceptions';
```

---

## Tabla resumen

| Excepción | HTTP | Cuándo | Ejemplo |
|-----------|------|--------|---------|
| `ResourceNotFoundException` | 404 | Registro no existe en BD | `findById` retorna null |
| `ResourceConflictException` | 409 | Duplicado / estado incompatible | Ticket ya existe, pago ya procesado |
| `ValidationException` | 422 | Regla de negocio violada | Check-in fuera de tiempo, fecha pasada |
| `ForbiddenResourceException` | 403 | Sin permiso sobre el recurso | Ticket de otro usuario |
| `DomainException` | cualquiera | Caso custom sin categoría | Cuando ninguna aplica |

---

## Regla de dónde van

```
Repository  →  solo BD, retorna null / lanza handlePrismaError
Service     →  interpreta null, valida reglas → lanza excepciones
Controller  →  no lanza excepciones, solo llama al service
```

```
¿No encontraste el registro?              → ResourceNotFoundException  (service)
¿Ya existe o estado incompatible?         → ResourceConflictException  (service)
¿Regla de negocio / validación custom?    → ValidationException        (service)
¿Sin permiso sobre el recurso?            → ForbiddenResourceException  (service)
¿Error de BD (P2002, P2025...)?           → handlePrismaError          (repository, automático)
```
