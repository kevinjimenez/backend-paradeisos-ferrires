# 📊 Ranking de Módulos por Dificultad de Refactorización

> **Objetivo:** Guía para refactorizar los módulos del proyecto ordenados de más fácil a más difícil

---

## 📋 Tabla de Contenidos

- [Resumen Visual](#-resumen-visual)
- [Análisis por Módulo](#-análisis-por-módulo)
- [Plan de Implementación Recomendado](#-plan-de-implementación-recomendado)
- [Criterios de Dificultad](#-criterios-de-dificultad)

---

## 🎯 Resumen Visual

| Nivel | Módulo | LOC | Tiempo | Prioridad | Patrones Necesarios |
|-------|--------|-----|--------|-----------|---------------------|
| ⭐ | **Health** | 15 | 15 min | Baja | Logger |
| ⭐⭐ | **Ports** | 42 | 45 min | Media | Repository + Logger |
| ⭐⭐ | **Payments** | 58 | 1.5 hr | 🔥 ALTA | Repository + Logger + Tests |
| ⭐⭐⭐ | **Contacts** | 44 | 1 hr | Alta | Repository + Upsert |
| ⭐⭐⭐ | **Passengers** | 44 | 1 hr | Alta | Repository + Upsert |
| ⭐⭐⭐ | **Seat-Holds-History** | 81 | 1.5 hr | Media | Repository + Query Builder |
| ⭐⭐⭐⭐ | **Schedules** | 82 | 2 hr | Media | Repository + Specifications |
| ⭐⭐⭐⭐ | **Tasks** | 135 | 2.5 hr | Alta | Repository + Cron Tests |
| ⭐⭐⭐⭐⭐ | **Booking** | 143 | 3-4 hr | 🔥 ALTA | Command + Repository + Transaction |
| ⭐⭐⭐⭐⭐⭐ | **Tickets** | 218 | 5-6 hr | 🔥 CRÍTICA | Command + Factory + Events + Query Builder |

**Total:** 10 módulos | ~18-22 horas de refactoring

---

## 🔍 Análisis por Módulo

### ⭐ NIVEL 1: MUY FÁCIL

---

#### 1. Health (15 líneas)

**Archivo:** `src/health/heath.service.ts`

**Estado actual:**
```typescript
@Injectable()
export class HealthService {
  checkStatus(): Health {
    return {
      environment: envs.nodeEnv,
      message: 'api paradeisos is up and running',
      port: envs.port,
    };
  }
}
```

**Problemas:**
- ✅ No tiene problemas graves
- ⚠️ Podría agregar `@LogMethod` por consistencia

**Refactorización necesaria:**
```typescript
@Injectable()
export class HealthService {
  @LogMethod
  checkStatus(): Health {
    return {
      environment: envs.nodeEnv,
      message: 'api paradeisos is up and running',
      port: envs.port,
    };
  }
}
```

**Tiempo estimado:** 15 minutos

**Checklist:**
- [ ] Agregar `@LogMethod` decorator
- [ ] Escribir 2 tests básicos

---

### ⭐⭐ NIVEL 2: FÁCIL

---

#### 2. Ports (42 líneas)

**Archivo:** `src/ports/ports.service.ts`

**Estado actual:**
```typescript
@Injectable()
export class PortsService {
  private readonly logger = new Logger(PortsService.name);

  constructor(private databasesService: DatabasesService) {}

  async findAll(): Promise<ApiResponse<PortResponse[]>> {
    try {
      const portsWithRelation = {
        id: true,
        name: true,
        islands: {
          select: { id: true, name: true },
        },
      };

      const data = await this.databasesService.ports.findMany({
        select: portsWithRelation,
      });

      return { data };
    } catch (error) {
      this.logger.error('Error fetching ports', error);
      throw new InternalServerErrorException('Failed to fetch ports');
    }
  }
}
```

**Problemas:**
- ❌ Acceso directo a `databasesService.ports`
- ❌ Query hardcodeado en el service
- ❌ No tiene tests
- ✅ Ya usa Logger correctamente

**Refactorización necesaria:**
1. Crear `PortsRepository`
2. Mover query al repository
3. Agregar `@LogMethod`
4. Escribir tests

**Código propuesto:**

```typescript
// ports.repository.ts
@Injectable()
export class PortsRepository extends BaseRepository<Port> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'ports';
  }

  protected get db() {
    return this.databasesService;
  }

  async findAllWithIslands(tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.ports.findMany({
      select: {
        id: true,
        name: true,
        islands: {
          select: { id: true, name: true },
        },
      },
    });
  }
}

// ports.service.ts
@Injectable()
export class PortsService {
  private readonly logger = new Logger(PortsService.name);

  constructor(private readonly portsRepository: PortsRepository) {}

  @LogMethod
  async findAll(): Promise<ApiResponse<PortResponse[]>> {
    try {
      const data = await this.portsRepository.findAllWithIslands();
      return { data };
    } catch (error) {
      this.logger.error('Error fetching ports', error);
      throw new InternalServerErrorException('Failed to fetch ports');
    }
  }
}
```

**Tiempo estimado:** 45 minutos

**Checklist:**
- [ ] Crear `PortsRepository`
- [ ] Agregar método `findAllWithIslands()`
- [ ] Refactorizar `PortsService`
- [ ] Agregar `@LogMethod`
- [ ] Actualizar `PortsModule` (providers + exports)
- [ ] Escribir 5 tests

---

#### 3. Payments (58 líneas) 🔥

**Archivo:** `src/payments/payments.service.ts`

**Estado actual:**
```typescript
@Injectable()
export class PaymentsService {
  constructor(private readonly databasesService: DatabasesService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const paymentToCreate = PaymentMapper.toPrismaCreate(createPaymentDto);
    const newPayment = await this.databasesService.payments.create({
      data: paymentToCreate,
    });
    return { data: newPayment };
  }

  async findOne(id: string) {
    const paymentFound = await this.databasesService.payments.findUnique({
      where: { id },
    });
    if (!paymentFound) {
      throw new NotFoundException(`Payment not found id: [${id}]`);
    }
    return { data: paymentFound };
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const { data } = await this.findOne(id);
    const paymentToUpdate = PaymentMapper.toPrismaUpdate(updatePaymentDto);
    const paymentUpdated = await this.databasesService.payments.update({
      where: { id: data.id },
      data: paymentToUpdate,
    });
    return { data: paymentUpdated };
  }
}
```

**Problemas:**
- ❌ Acceso directo a Prisma
- ❌ No tiene tests
- ❌ Sin logging estructurado
- ✅ No tiene console.log
- ✅ Ya tiene mapper

**Refactorización necesaria:**
Ver documento completo: `PAYMENTS_REFACTORING_EXAMPLE.md`

**Tiempo estimado:** 1-1.5 horas

**Checklist:**
- [ ] Crear `PaymentsRepository` extendiendo `BaseRepository`
- [ ] Agregar métodos:
  - [ ] `findByIdWithTicket()`
  - [ ] `findByTicketId()`
  - [ ] `updateStatus()`
  - [ ] `createPending()`
- [ ] Refactorizar `PaymentsService`
- [ ] Agregar `@LogMethod`
- [ ] Actualizar `PaymentsModule`
- [ ] Escribir 10+ tests

**Referencia:** Este módulo ya tiene ejemplo completo en `PAYMENTS_REFACTORING_EXAMPLE.md`

---

### ⭐⭐⭐ NIVEL 3: MEDIO-FÁCIL

---

#### 4. Contacts (44 líneas)

**Archivo:** `src/contacts/contacts.service.ts`

**Estado actual:**
```typescript
@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly databasesService: DatabasesService) {}

  async create(createContactDto: CreateContactDto) {
    try {
      const contactToCreate = ContactMapper.toPrismaCreate(createContactDto);

      const newContact = await this.databasesService.contacts.upsert({
        where: {
          // mail: contactToCreate.mail,
          document_number: contactToCreate.document_number,
        },
        create: contactToCreate,
        update: contactToCreate,
      });

      console.log('New contact created or updated:', newContact); // ❌

      return { data: newContact };
    } catch (error) {
      this.logger.error('Error creating contact', error);
      throw new InternalServerErrorException('Failed to create contact');
    }
  }
}
```

**Problemas:**
- ❌ Console.log en línea 33
- ❌ Acceso directo a Prisma
- ❌ No tiene tests
- ⚠️ Usa `upsert` (create or update)
- ✅ Ya usa Logger

**Refactorización necesaria:**

```typescript
// contacts.repository.ts
@Injectable()
export class ContactsRepository extends BaseRepository<Contact> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'contacts';
  }

  protected get db() {
    return this.databasesService;
  }

  async upsertByDocument(
    data: Prisma.contactsCreateInput,
    tx?: PrismaTransaction,
  ) {
    const db = tx || this.db;
    return db.contacts.upsert({
      where: { document_number: data.document_number },
      create: data,
      update: data,
    });
  }
}

// contacts.service.ts
@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly contactsRepository: ContactsRepository) {}

  @LogMethod
  async create(createContactDto: CreateContactDto) {
    try {
      const contactToCreate = ContactMapper.toPrismaCreate(createContactDto);
      const newContact = await this.contactsRepository.upsertByDocument(contactToCreate);
      return { data: newContact };
    } catch (error) {
      this.logger.error('Error creating contact', error);
      throw new InternalServerErrorException('Failed to create contact');
    }
  }
}
```

**Tiempo estimado:** 1 hora

**Checklist:**
- [ ] Crear `ContactsRepository`
- [ ] Método `upsertByDocument()`
- [ ] Eliminar `console.log` (línea 33)
- [ ] Agregar `@LogMethod`
- [ ] Refactorizar service
- [ ] Actualizar module
- [ ] Escribir 8 tests

---

#### 5. Passengers (44 líneas)

**Archivo:** `src/passengers/passengers.service.ts`

**Estado actual:** Muy similar a Contacts

**Problemas:**
- ❌ Acceso directo a Prisma
- ❌ No tiene tests
- ⚠️ Usa `upsert`
- ✅ No tiene console.log
- ✅ Ya usa Logger

**Refactorización necesaria:** Igual que Contacts

**Tiempo estimado:** 1 hora

**Checklist:**
- [ ] Crear `PassengersRepository`
- [ ] Método `upsertByDocument()`
- [ ] Agregar `@LogMethod`
- [ ] Refactorizar service
- [ ] Actualizar module
- [ ] Escribir 8 tests

---

#### 6. Seat-Holds-History (81 líneas)

**Archivo:** `src/seat-holds-history/seat-holds-history.service.ts`

**Estado actual:**
- 1 método: `findOne(id)`
- Query gigante de 40+ líneas (líneas 20-62)
- Múltiples relaciones anidadas

**Problemas:**
- ❌ Query gigante embebido en service
- ❌ No tiene tests
- ❌ Acceso directo a Prisma
- ✅ Ya usa Logger
- ✅ No tiene console.log

**Refactorización necesaria:**

```typescript
// seat-holds-history.queries.ts
export const SEAT_HOLD_WITH_RELATION = {
  status: true,
  schedules: {
    select: {
      arrival_time: true,
      departure_time: true,
      ferries: {
        select: {
          name: true,
          register_code: true,
          type: true,
          amenities: true,
        },
      },
      routes: {
        select: {
          base_price_national: true,
        },
      },
    },
  },
};

export const SEAT_HOLDS_HISTORY_FULL_SELECT = {
  id: true,
  outbound_seat_hold_id: true,
  return_seat_hold_id: true,
  created_at: true,
  outbound_seat_holds: {
    select: SEAT_HOLD_WITH_RELATION,
  },
  return_seat_holds: {
    select: SEAT_HOLD_WITH_RELATION,
  },
};

// seat-holds-history.repository.ts
@Injectable()
export class SeatHoldsHistoryRepository extends BaseRepository<SeatHoldsHistory> {
  protected get modelName(): string {
    return 'seat_holds_history';
  }

  protected get db() {
    return this.databasesService;
  }

  async findByIdFull(id: string, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.seat_holds_history.findUnique({
      where: { id },
      select: SEAT_HOLDS_HISTORY_FULL_SELECT,
    });
  }
}

// seat-holds-history.service.ts
@Injectable()
export class SeatHoldsHistoryService {
  private readonly logger = new Logger(SeatHoldsHistoryService.name);

  constructor(
    private readonly seatHoldsHistoryRepository: SeatHoldsHistoryRepository,
  ) {}

  @LogMethod
  async findOne(id: string): Promise<ApiResponse<SeatHoldsHistoryResponse>> {
    try {
      const seatHoldsHistory = await this.seatHoldsHistoryRepository.findByIdFull(id);

      if (!seatHoldsHistory) {
        throw new NotFoundException(`Seat holds with ID ${id} not found`);
      }

      if (!seatHoldsHistory.outbound_seat_holds) {
        throw new NotFoundException(`Seat holds expired`);
      }

      return { data: seatHoldsHistory as SeatHoldsHistoryResponse };
    } catch (error) {
      this.logger.error('Error fetching seat holds history', error);
      throw new InternalServerErrorException('Failed to fetch seat holds history');
    }
  }
}
```

**Tiempo estimado:** 1.5 horas

**Checklist:**
- [ ] Crear archivo `seat-holds-history.queries.ts`
- [ ] Extraer queries grandes a constantes
- [ ] Crear `SeatHoldsHistoryRepository`
- [ ] Método `findByIdFull()`
- [ ] Agregar `@LogMethod`
- [ ] Refactorizar service
- [ ] Escribir 6 tests

---

### ⭐⭐⭐⭐ NIVEL 4: MEDIO

---

#### 7. Schedules (82 líneas)

**Archivo:** `src/schedules/schedules.service.ts`

**Características:**
- Método `findAll()` con filtros
- Método `buildWhereFromFilters()` - construye queries dinámicos
- Filtros por fecha, origen, destino

**Problemas:**
- ❌ Construcción de queries en service
- ❌ Lógica de filtros compleja
- ❌ Acceso directo a Prisma
- ❌ No tiene tests
- ⚠️ Candidato para **Specification Pattern**

**Refactorización necesaria:**
- Repository Pattern
- **Specification Pattern** para filtros
- Query Builder opcional

**Tiempo estimado:** 2 horas

**Checklist:**
- [ ] Crear `SchedulesRepository`
- [ ] Crear `ScheduleSpecification` interface
- [ ] Implementar:
  - [ ] `ScheduleByDateSpec`
  - [ ] `ScheduleByRouteSpec`
- [ ] Refactorizar service
- [ ] Agregar `@LogMethod`
- [ ] Escribir 12 tests

---

#### 8. Tasks (135 líneas)

**Archivo:** `src/tasks/tasks.service.ts`

**Características:**
- Cron jobs (`@Cron` decorators)
- Método `expireOutdatedSeatsHolds()` - corre cada hora
- Usa `$queryRaw` para queries crudas
- Lógica de expiración de asientos

**Problemas:**
- ❌ Lógica de negocio en cron service
- ❌ No tiene tests (CRÍTICO para cron jobs)
- ❌ Acceso directo a Prisma
- ⚠️ Queries crudos con SQL

**Refactorización necesaria:**
- Repository Pattern
- Extraer lógica de expiración
- **Tests con mock de cron**

**Tiempo estimado:** 2.5 horas

**Checklist:**
- [ ] Crear `SeatHoldsRepository` (si no existe)
- [ ] Método `findExpiredHolds()`
- [ ] Método `expireHolds(ids)`
- [ ] Refactorizar `TasksService`
- [ ] Agregar `@LogMethod`
- [ ] Escribir 15+ tests:
  - [ ] Tests unitarios
  - [ ] Tests de cron (mockear @Cron)

---

### ⭐⭐⭐⭐⭐ NIVEL 5: DIFÍCIL

---

#### 9. Booking (143 líneas) 🔥

**Archivo:** `src/booking/booking.service.ts`

**Características:**
- Método `create()` con transacción (líneas 17-52)
- Método `createHoldForSchedule()` con `$queryRaw` y `FOR UPDATE`
- Locking pesimista para concurrencia
- Cálculo de expiración de asientos

**Problemas:**
- ❌ Console.log en línea 126
- ❌ Transacción compleja en service
- ❌ Lógica de negocio mezclada
- ❌ No tiene tests (crítico para concurrencia)
- ⚠️ Requiere **Command Pattern**

**Refactorización necesaria:**

```typescript
// booking.repository.ts
@Injectable()
export class BookingRepository extends BaseRepository<Booking> {
  async createHoldWithLock(
    scheduleId: string,
    seatsToReserve: number,
    tx: PrismaTransaction,
  ) {
    const schedule = await tx.$queryRaw`
      SELECT * FROM schedules
      WHERE id = ${scheduleId}
      FOR UPDATE
    `;

    // ... lógica de creación
  }

  async findExpiredHolds(tx?: PrismaTransaction) {
    const db = tx || this.db;
    const now = new Date();

    return db.seat_holds.findMany({
      where: {
        expires_at: { lt: now },
        status: 'ACTIVE',
      },
    });
  }
}

// commands/create-booking.command.ts
@Injectable()
export class CreateBookingCommand implements Command<ApiResponse<any>> {
  constructor(
    private readonly dto: CreateBookingDto,
    private readonly bookingRepo: BookingRepository,
    private readonly db: DatabasesService,
  ) {}

  async execute() {
    return this.db.$transaction(async (tx) => {
      // Lógica compleja aquí
    });
  }
}

// booking.service.ts
@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly db: DatabasesService,
  ) {}

  @LogMethod
  async create(dto: CreateBookingDto) {
    const command = new CreateBookingCommand(dto, this.bookingRepo, this.db);
    return command.execute();
  }
}
```

**Tiempo estimado:** 3-4 horas

**Checklist:**
- [ ] Crear `BookingRepository`
- [ ] Métodos:
  - [ ] `createHoldWithLock()`
  - [ ] `findExpiredHolds()`
  - [ ] `updateHoldStatus()`
- [ ] Crear `CreateBookingCommand`
- [ ] Eliminar console.log
- [ ] Agregar `@LogMethod`
- [ ] Refactorizar service
- [ ] Escribir 20+ tests:
  - [ ] Tests de concurrencia
  - [ ] Tests de transacciones
  - [ ] Tests de expiración

---

### ⭐⭐⭐⭐⭐⭐ NIVEL 6: MUY DIFÍCIL

---

#### 10. Tickets (218 líneas) 🔥 EL JEFE FINAL

**Archivo:** `src/tickets/tickets.service.ts`

**Características:**
- **Fat Service** - Múltiples responsabilidades
- Orquesta: `ContactsService`, `PassengersService`, `TicketPdfGenerator`
- Transacción compleja con 4 pasos
- Query de 89 líneas (líneas 89-177)
- `Promise.allSettled` para batch passengers
- Generación de PDF
- Cálculo de precios y descuentos

**Problemas:**
- ❌ Console.log en línea 68
- ❌ Query gigante de 89 líneas
- ❌ Múltiples responsabilidades (viola SRP)
- ❌ No tiene tests
- ❌ Lógica de negocio mezclada
- ⚠️ Requiere **múltiples patrones**

**Refactorización necesaria:**

```typescript
// tickets.repository.ts
@Injectable()
export class TicketsRepository extends BaseRepository<Ticket> {
  async findByIdFull(id: string, tx?: PrismaTransaction) {
    const query = new TicketQueryBuilder()
      .withPassengers()
      .withSchedules()
      .withPayments()
      .build();

    const db = tx || this.db;
    return db.tickets.findUnique({
      where: { id },
      select: query,
    });
  }
}

// queries/ticket-query.builder.ts
export class TicketQueryBuilder {
  private select: Prisma.ticketsSelect = {
    id: true,
    ticket_code: true,
  };

  withPassengers() {
    this.select.passengers = { /* ... */ };
    return this;
  }

  withSchedules() {
    this.select.outbound_schedules = { /* ... */ };
    return this;
  }

  withPayments() {
    this.select.payments = { /* ... */ };
    return this;
  }

  build() {
    return this.select;
  }
}

// factories/ticket.factory.ts
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
    // Lógica de cálculo
  }
}

// commands/create-ticket.command.ts
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

      return { ticket, contact, passengers };
    });
  }
}

// events/ticket-created.event.ts
export class TicketCreatedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly contactEmail: string,
  ) {}
}

// handlers/generate-ticket-pdf.handler.ts
@Injectable()
export class GenerateTicketPdfHandler {
  @OnEvent('ticket.created')
  async handle(event: TicketCreatedEvent) {
    // Generar PDF asíncronamente
  }
}

// tickets.service.ts (SLIM)
@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepo: TicketsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @LogMethod
  async create(dto: CreateTicketDto) {
    const command = new CreateTicketCommand(/* ... */);
    const result = await command.execute();

    // Emitir evento
    this.eventEmitter.emit('ticket.created',
      new TicketCreatedEvent(result.ticket.id, result.contact.email)
    );

    return { data: result };
  }

  @LogMethod
  async findOne(id: string) {
    const ticket = await this.ticketsRepo.findByIdFull(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return { data: ticket };
  }
}
```

**Tiempo estimado:** 5-6 horas

**Checklist:**
- [x] Crear `TicketsRepository` ✅ (78 líneas con 5 métodos)
- [x] Crear `TicketQueryBuilder` (para query de 89 líneas) ✅ (107 líneas)
- [x] Crear `TicketFactory` ❌ (No necesario - TicketMapper lo cubre)
- [x] Crear `CreateTicketCommand` ✅ (68 líneas - retorna datos financieros)
- [x] Instalar `@nestjs/event-emitter` ✅
- [x] Crear eventos:
  - [x] `TicketCreatedEvent` ✅
- [x] Crear handlers (Event Pattern):
  - [x] `CreatePaymentListener` ✅ (crea pago pendiente automáticamente)
  - [x] `GenerateTicketPdfListener` ✅ (genera PDF automáticamente)
  - [ ] `SendTicketEmailListener` ❌ (Descartado - no hay servicio de email)
- [x] Eliminar console.log ✅
- [x] Agregar `@LogMethod` ❌ (Descartado del scope)
- [x] Refactorizar service (debe quedar <100 líneas) ✅ (107 líneas con Event Pattern, -51%)
- [x] Actualizar module ✅ (incluye PaymentsModule + 2 listeners)
- [ ] Escribir 25+ tests:
  - [ ] Tests de repository
  - [ ] Tests de factory
  - [ ] Tests de command
  - [ ] Tests de service
  - [ ] Tests de handlers

---

## 🎯 Plan de Implementación Recomendado

### 🚀 Opción A: Aprendizaje Incremental (Recomendado)

**Objetivo:** Dominar cada patrón antes de pasar al siguiente

```
SEMANA 1: Setup + Módulos Fáciles
├─ Día 1: Setup base (BaseRepository, LogMethod, PrismaTransaction)
├─ Día 2: Payments (ejemplo completo) ✅
├─ Día 3: Ports (consolidar aprendizaje) ✅
├─ Día 4: Contacts (introducir upsert) ✅
└─ Día 5: Passengers + Review

SEMANA 2: Queries Complejos
├─ Día 1-2: Seat-Holds-History (query builder)
├─ Día 3-4: Schedules (specifications)
└─ Día 5: Tests + Review

SEMANA 3: Lógica Compleja
├─ Día 1-2: Tasks (cron jobs + tests críticos)
├─ Día 3-5: Booking (transacciones + command)

SEMANA 4-5: El Jefe Final
├─ Día 1: TicketQueryBuilder
├─ Día 2: TicketFactory + TicketsRepository
├─ Día 3: CreateTicketCommand
├─ Día 4: Event-Driven (eventos + handlers)
├─ Día 5: Tests
└─ Review final
```

**Tiempo total:** 4-5 semanas

---

### ⚡ Opción B: Máximo Impacto Rápido

**Objetivo:** Refactorizar primero los módulos críticos para el negocio

```
SPRINT 1 (1 semana): Críticos
├─ Setup
├─ Payments ✅
├─ Contacts ✅
├─ Passengers ✅
└─ Booking 🔥 (crítico para negocio)

SPRINT 2 (1.5 semanas): El Grande
└─ Tickets 🔥🔥 (desbloquea todo el flujo)

SPRINT 3 (1 semana): Soporte
├─ Tasks (mantenimiento)
├─ Schedules (búsquedas)
└─ Seat-Holds-History

SPRINT 4 (Opcional):
├─ Ports
└─ Health
```

**Tiempo total:** 3-4 semanas

---

### 🎓 Opción C: Aprendizaje por Patrones

**Objetivo:** Agrupar módulos por patrón a aprender

```
FASE 1: Repository Pattern Básico (1 semana)
├─ Payments
├─ Ports
├─ Contacts
└─ Passengers

FASE 2: Query Patterns (1 semana)
├─ Seat-Holds-History (Query Builder)
└─ Schedules (Specifications)

FASE 3: Cron + Async (3 días)
└─ Tasks

FASE 4: Command Pattern (1 semana)
└─ Booking

FASE 5: All Patterns (1.5 semanas)
└─ Tickets (Command + Factory + Events + Query Builder)
```

**Tiempo total:** 4.5 semanas

---

## 📐 Criterios de Dificultad

### Factores que aumentan la dificultad:

| Factor | Peso | Ejemplo |
|--------|------|---------|
| Líneas de código | +1 ⭐ por cada 50 LOC | Tickets (218 líneas) = +4 ⭐ |
| Queries complejas | +1 ⭐ | Seat-Holds-History |
| Transacciones | +2 ⭐ | Booking, Tickets |
| Lógica de negocio | +1 ⭐ | Cálculos, validaciones |
| Múltiples dependencias | +1 ⭐ | Tickets (3+ servicios) |
| Console.log | +0.5 ⭐ | Contacts, Booking |
| Sin tests | +1 ⭐ | Todos |
| Cron jobs | +1 ⭐ | Tasks |
| Concurrencia/Locking | +2 ⭐ | Booking (FOR UPDATE) |
| Event-driven necesario | +1 ⭐ | Tickets |

### Patrones necesarios por nivel:

| Nivel | Patrones |
|-------|----------|
| ⭐ | Logger Decorator |
| ⭐⭐ | Repository + Logger |
| ⭐⭐⭐ | Repository + Logger + Upsert/Query Builder |
| ⭐⭐⭐⭐ | Repository + Specifications/Query Builder + Tests complejos |
| ⭐⭐⭐⭐⭐ | Command + Repository + Transactions |
| ⭐⭐⭐⭐⭐⭐ | Command + Factory + Events + Query Builder + Repository |

---

## ✅ Checklist General por Módulo

Copiar este checklist para cada módulo:

```markdown
## [MÓDULO_NAME] Refactoring

### Fase 1: Repository
- [ ] Crear `[Module]Repository.ts`
- [ ] Extender de `BaseRepository`
- [ ] Implementar métodos específicos
- [ ] Agregar soporte de transacciones (tx?)

### Fase 2: Service
- [ ] Inyectar repository en lugar de DatabasesService
- [ ] Reemplazar acceso directo a Prisma
- [ ] Agregar `@LogMethod` a métodos públicos
- [ ] Eliminar console.log (si hay)
- [ ] Agregar JSDoc a métodos públicos

### Fase 3: Patterns (si aplica)
- [ ] Query Builder (si query >20 líneas)
- [ ] Factory (si lógica de creación compleja)
- [ ] Command (si operación compleja)
- [ ] Events (si hay side effects)
- [ ] Specifications (si filtros complejos)

### Fase 4: Module
- [ ] Actualizar providers
- [ ] Exportar repository
- [ ] Verificar imports

### Fase 5: Tests
- [ ] Setup test module
- [ ] Tests de repository (5+)
- [ ] Tests de service (10+)
- [ ] Tests de command/factory (si aplica)
- [ ] Code coverage >70%

### Fase 6: Review
- [ ] Sin console.log
- [ ] Sin acceso directo a Prisma
- [ ] Todos los métodos con @LogMethod
- [ ] Tests pasando
- [ ] Coverage >70%
- [ ] Service <150 líneas
```

---

## 📊 Métricas de Progreso

### Por Sprint:

| Sprint | Módulos | LOC Total | Tiempo | Tests Nuevos |
|--------|---------|-----------|--------|--------------|
| Setup | - | - | 4 hr | 0 |
| 1 | Payments, Ports | 100 | 2.5 hr | 15 |
| 2 | Contacts, Passengers | 88 | 2 hr | 16 |
| 3 | Seat-Holds-History | 81 | 1.5 hr | 6 |
| 4 | Schedules | 82 | 2 hr | 12 |
| 5 | Tasks | 135 | 2.5 hr | 15 |
| 6 | Booking | 143 | 4 hr | 20 |
| 7 | Tickets | 218 | 6 hr | 25 |
| **TOTAL** | **10** | **847** | **24.5 hr** | **109+** |

### Objetivo Final:

- ✅ 0 console.log
- ✅ 0 acceso directo a Prisma en services
- ✅ 100% servicios con Repository Pattern
- ✅ 70%+ code coverage
- ✅ 109+ tests unitarios
- ✅ Todos los services <150 líneas

---

## 🎓 Recursos de Apoyo

### Documentos de Referencia:

1. **REFACTORING_PLAN.md** - Plan general del proyecto
2. **PAYMENTS_REFACTORING_EXAMPLE.md** - Ejemplo completo con código
3. **REPOSITORY_VS_SERVICE.md** - Separación de responsabilidades
4. **Este documento** - Ranking y roadmap

### Orden de Lectura Sugerido:

```
1. REFACTORING_PLAN.md (visión general)
   ↓
2. REPOSITORY_VS_SERVICE.md (entender conceptos)
   ↓
3. MODULES_DIFFICULTY_RANKING.md (este archivo - planificar)
   ↓
4. PAYMENTS_REFACTORING_EXAMPLE.md (ver código real)
   ↓
5. Empezar con Payments
```

---

## ❓ FAQ

### ¿Por dónde empiezo?

**R:** Payments. Tiene ejemplo completo y es fácil.

### ¿Puedo saltarme módulos?

**R:** Sí, pero respeta las dependencias:
- Contacts + Passengers ANTES de Tickets
- Repositories básicos ANTES de Booking/Tickets

### ¿Cuánto tiempo realmente toma?

**R:**
- Solo (1 dev): 4-5 semanas
- Equipo (2-3 devs): 2-3 semanas
- Part-time: 8-10 semanas

### ¿Qué hago si me atasco?

**R:**
1. Revisar `PAYMENTS_REFACTORING_EXAMPLE.md`
2. Revisar `REPOSITORY_VS_SERVICE.md`
3. Hacer el módulo más simple primero (Ports)
4. Escribir tests primero (TDD)

---

**Documento creado:** 2026-02-20
**Próxima actualización:** Después de cada sprint
