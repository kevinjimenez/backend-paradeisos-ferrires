# 🔧 Plan de Refactorización - Backend Paradeisos Ferrires

> **Versión:** 1.0
> **Fecha:** 2026-02-20
> **Estado:** Planificación

---

## 📋 Tabla de Contenidos

- [Resumen Ejecutivo](#-resumen-ejecutivo)
- [Problemas Identificados](#-problemas-identificados)
- [Patrones a Aplicar](#-patrones-a-aplicar)
- [Roadmap](#-roadmap)
- [Estructura Propuesta](#-estructura-propuesta)
- [Métricas de Éxito](#-métricas-de-éxito)

---

## 🎯 Resumen Ejecutivo

**Proyecto:** Sistema de Reserva de Ferry
**Stack:** NestJS + Prisma + PostgreSQL
**Puntuación Actual:** 5.75/10
**Meta:** 8/10

### Estadísticas Actuales

- 13 módulos funcionales
- 14 servicios
- 8 controladores
- **0 tests** ⚠️
- **12+ console.log** ⚠️

---

## 🚨 Problemas Identificados

### Críticos

1. **Console.log en Producción**
   - `src/booking/booking.service.ts:126`
   - `src/tickets/tickets.service.ts:68`
   - `src/contacts/contacts.service.ts:33`

2. **Cero Cobertura de Tests**
   - Alto riesgo de regresiones

3. **Fat Services**
   - `tickets.service.ts` (219 líneas) - múltiples responsabilidades

4. **Type Safety Perdido**
   - Mappers usan `Record<string, any>`

5. **Queries Gigantes**
   - `tickets.service.ts:89-177` (89 líneas de select)

---

## 🏗️ Patrones a Aplicar

### FASE 1: Fundamentos (Semanas 1-2)

#### 1.1 Repository Pattern

```typescript
// tickets.repository.ts
@Injectable()
export class TicketsRepository {
  constructor(private db: DatabasesService) {}

  async findById(id: string, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.tickets.findUnique({ where: { id } });
  }

  async create(data: Prisma.ticketsCreateInput, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.tickets.create({ data });
  }
}
```

**Beneficios:**
- ✅ Fácil de testear
- ✅ Centraliza queries
- ✅ Desacopla de Prisma

---

#### 1.2 Logger Decorator

```typescript
// src/common/decorators/log-method.decorator.ts
export function LogMethod(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const logger = new Logger(target.constructor.name);

  descriptor.value = async function (...args: any[]) {
    logger.log(`Executing ${key}`);
    try {
      const result = await originalMethod.apply(this, args);
      logger.log(`${key} completed`);
      return result;
    } catch (error) {
      logger.error(`${key} failed`, error.stack);
      throw error;
    }
  };
  return descriptor;
}
```

**Uso:**
```typescript
@Injectable()
export class TicketsService {
  @LogMethod
  async create(dto: CreateTicketDto) {
    // Implementation
  }
}
```

---

#### 1.3 Query Builder Pattern

```typescript
// src/tickets/queries/ticket-query.builder.ts
export class TicketQueryBuilder {
  private select: Prisma.ticketsSelect = {
    id: true,
    ticket_code: true,
  };

  withPassengers() {
    this.select.passengers = {
      select: { id: true, first_name: true, last_name: true }
    };
    return this;
  }

  withSchedules() {
    this.select.outbound_schedules = { /* ... */ };
    return this;
  }

  build() {
    return this.select;
  }
}
```

**Uso:**
```typescript
const query = new TicketQueryBuilder()
  .withPassengers()
  .withSchedules()
  .build();
```

---

### FASE 2: Arquitectura (Semanas 3-4)

#### 2.1 Factory Pattern

```typescript
// src/tickets/factories/ticket.factory.ts
@Injectable()
export class TicketFactory {
  createTicketData(dto: CreateTicketDto, contactId: string) {
    const pricing = this.calculatePricing(dto.passenger);

    return {
      contacts_id: contactId,
      ticket_code: this.generateCode(),
      ...pricing,
    };
  }

  private calculatePricing(passengers: CreatePassengerDto[]) {
    const subtotal = passengers.reduce((sum, p) => sum + (p.unitPrice || 0), 0);
    const taxes = subtotal * envs.taxesValue;
    const total = subtotal + taxes + envs.serviceFeeValue;

    return { subtotal, taxes, service_fee: envs.serviceFeeValue, total };
  }
}
```

---

#### 2.2 Command Pattern

```typescript
// src/tickets/commands/create-ticket.command.ts
export interface Command<T> {
  execute(): Promise<T>;
}

@Injectable()
export class CreateTicketCommand implements Command<ApiResponse<any>> {
  constructor(
    private readonly dto: CreateTicketDto,
    private readonly contactsRepo: ContactsRepository,
    private readonly ticketsRepo: TicketsRepository,
    private readonly passengersRepo: PassengersRepository,
    private readonly ticketFactory: TicketFactory,
    private readonly db: DatabasesService,
  ) {}

  async execute() {
    return this.db.$transaction(async (tx) => {
      // 1. Create contact
      const contact = await this.contactsRepo.create(this.dto.contact, tx);

      // 2. Create ticket
      const ticketData = this.ticketFactory.createTicketData(this.dto, contact.id);
      const ticket = await this.ticketsRepo.create(ticketData, tx);

      // 3. Create passengers
      const passengers = await Promise.all(
        this.dto.passenger.map(p =>
          this.passengersRepo.create({ ...p, ticketId: ticket.id }, tx)
        )
      );

      return { data: { id: ticket.id, contact: contact.id, passengers } };
    });
  }
}
```

---

#### 2.3 Observer Pattern (Event-Driven)

```typescript
// src/tickets/events/ticket-created.event.ts
export class TicketCreatedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly contactEmail: string,
  ) {}
}

// Handler
@Injectable()
export class SendTicketEmailHandler {
  @OnEvent('ticket.created')
  async handle(event: TicketCreatedEvent) {
    await this.emailService.sendTicketConfirmation(event.contactEmail);
  }
}
```

**Setup:**
```bash
npm install @nestjs/event-emitter
```

```typescript
// app.module.ts
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // ...
  ],
})
```

---

### FASE 3: Optimización (Semanas 5-8)

#### 3.1 Template Method Pattern

```typescript
// src/common/base/base.service.ts
export abstract class BaseService<T, CreateDto, UpdateDto, TRepo> {
  constructor(protected readonly repository: TRepo) {}

  async create(dto: CreateDto): Promise<ApiResponse<T>> {
    const data = this.mapToCreate(dto);
    const entity = await this.repository.create(data);
    return { data: entity };
  }

  async findOne(id: string): Promise<ApiResponse<T>> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return { data: entity };
  }

  protected abstract get entityName(): string;
  protected abstract mapToCreate(dto: CreateDto): any;
}
```

---

#### 3.2 Value Object Pattern

```typescript
// src/common/value-objects/money.vo.ts
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string = 'USD'
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  static from(amount: number): Money {
    return new Money(amount);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor);
  }

  getValue(): number {
    return this.amount;
  }

  private assertSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot operate on different currencies');
    }
  }
}
```

**Uso:**
```typescript
const subtotal = Money.from(100);
const taxes = subtotal.multiply(0.15);
const total = subtotal.add(taxes);
```

---

## 🗺️ Roadmap

### Sprint 1: Fundamentos (Semanas 1-2)

- [ ] Crear tipo `PrismaTransaction`
- [ ] Implementar `LogMethod` decorator
- [ ] Eliminar todos los `console.log`
- [ ] Crear repositories:
  - [ ] TicketsRepository
  - [ ] ContactsRepository
  - [ ] PassengersRepository
  - [ ] PaymentsRepository
  - [ ] BookingRepository
- [ ] Setup Jest
- [ ] Escribir 10+ tests

**Meta:** 0 console.log, 10+ tests pasando

---

### Sprint 2: Refactoring Tickets (Semanas 3-4)

- [ ] Crear `TicketQueryBuilder`
- [ ] Crear `TicketFactory`
- [ ] Implementar `CreateTicketCommand`
- [ ] Refactorizar `TicketsService`
- [ ] Agregar 25+ tests

**Meta:** TicketsService < 150 líneas, 25+ tests

---

### Sprint 3: Event-Driven (Semanas 5-6)

- [ ] Instalar `@nestjs/event-emitter`
- [ ] Crear eventos (TicketCreated, PaymentCompleted)
- [ ] Implementar handlers (Email, PDF, Payment)
- [ ] Refactorizar flujo de tickets
- [ ] Agregar 15+ tests

**Meta:** Servicios desacoplados, 40+ tests

---

### Sprint 4: Base Classes (Semanas 7-8)

- [ ] Crear `BaseService`
- [ ] Crear `BaseRepository`
- [ ] Refactorizar servicios CRUD
- [ ] Agregar 20+ tests

**Meta:** 50% menos código duplicado, 60+ tests

---

### Sprint 5: Value Objects (Semanas 9-10)

- [ ] Implementar `Money` VO
- [ ] Implementar `DateRange` VO
- [ ] Refactorizar cálculos de precio
- [ ] Agregar 25+ tests

**Meta:** Type safety 9/10, 85+ tests, 70% coverage

---

## 📁 Estructura Propuesta

```
src/
├── tickets/
│   ├── commands/
│   │   └── create-ticket.command.ts
│   ├── events/
│   │   └── ticket-created.event.ts
│   ├── handlers/
│   │   └── send-ticket-email.handler.ts
│   ├── factories/
│   │   └── ticket.factory.ts
│   ├── queries/
│   │   ├── ticket-query.builder.ts
│   │   └── ticket.queries.ts
│   ├── tickets.repository.ts
│   ├── tickets.service.ts
│   └── tickets.controller.ts
│
├── common/
│   ├── base/
│   │   ├── base.service.ts
│   │   └── base.repository.ts
│   ├── decorators/
│   │   └── log-method.decorator.ts
│   ├── value-objects/
│   │   ├── money.vo.ts
│   │   └── date-range.vo.ts
│   └── types/
│       └── prisma-transaction.type.ts
```

---

## 📊 Métricas de Éxito

| Métrica | Actual | Meta Sprint 5 |
|---------|--------|---------------|
| Test Coverage | 0% | 70%+ |
| Console.log | 12+ | 0 |
| Avg Service LOC | 150 | <100 |
| Code Duplication | 25% | <10% |
| Type Safety Score | 7/10 | 9/10 |
| Test Count | 0 | 85+ |

---

## 🚀 Primeros Pasos

### 1. Setup Testing

```bash
npm install --save-dev @nestjs/testing jest @types/jest ts-jest
```

### 2. Crear Tipo Global

```typescript
// src/common/types/prisma-transaction.type.ts
import { PrismaClient } from '@prisma/client';

export type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
```

### 3. Implementar Logger Decorator

Ver sección [1.2 Logger Decorator](#12-logger-decorator)

### 4. Piloto con PaymentsService

1. Crear `PaymentsRepository`
2. Aplicar `@LogMethod`
3. Escribir 5 tests
4. Refactorizar service

### 5. Replicar a Otros Módulos

---

## ✅ Checklist por Módulo

- [ ] Repository con soporte de transacciones
- [ ] @LogMethod en métodos públicos
- [ ] Mínimo 5 tests unitarios
- [ ] Query builder si hay queries >20 líneas
- [ ] Factory si hay lógica de creación compleja
- [ ] 0 console.log
- [ ] 0 código comentado
- [ ] 0 tipos `any` sin justificar
- [ ] JSDoc en métodos públicos
- [ ] Coverage >60%

---

## 🎯 Priorización

### ⚡ URGENTE (Hacer YA)
1. Eliminar `console.log`
2. Agregar tests
3. Implementar Repository Pattern

### 🔥 ALTA (Próximas 2 semanas)
4. Query Builder
5. Factory Pattern
6. Logger Decorator

### 📈 MEDIA (Mes 1)
7. Command Pattern
8. Event-Driven
9. Template Method

### 🎯 BAJA (Mes 2+)
10. Value Objects
11. Specifications
12. CQRS (si es necesario)

---

**Última actualización:** 2026-02-20
