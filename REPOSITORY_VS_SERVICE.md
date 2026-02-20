# 🏗️ Repository vs Service - Separación de Responsabilidades

> **Pregunta clave:** ¿Qué hace cada uno y cuándo usar Repository vs Service?

---

## 📋 Tabla de Contenidos

- [Resumen Rápido](#-resumen-rápido)
- [Repository - Capa de Datos](#-repository---capa-de-datos)
- [Service - Capa de Negocio](#-service---capa-de-negocio)
- [Ejemplos Prácticos](#-ejemplos-prácticos)
- [Reglas de Oro](#-reglas-de-oro)
- [Anti-Patrones](#-anti-patrones)

---

## ⚡ Resumen Rápido

### Repository (Capa de Acceso a Datos)

**Responsabilidad:** Hablar con la base de datos

```typescript
// ✅ Repository hace esto:
- Crear, leer, actualizar, eliminar (CRUD)
- Queries a la base de datos
- Filtros y búsquedas
- Joins y relaciones
- Transacciones
```

### Service (Capa de Lógica de Negocio)

**Responsabilidad:** Implementar reglas de negocio

```typescript
// ✅ Service hace esto:
- Validaciones de negocio
- Cálculos y transformaciones
- Orquestar múltiples repositories
- Aplicar reglas de negocio
- Emitir eventos
```

---

## 🗄️ Repository - Capa de Datos

### ¿Qué es?

El **Repository** es una abstracción que **encapsula el acceso a la base de datos**. Es la única capa que sabe cómo hablar con Prisma.

### Responsabilidades

| ✅ SÍ hace | ❌ NO hace |
|-----------|-----------|
| CRUD básico (create, read, update, delete) | Validaciones de negocio |
| Queries complejas a la BD | Cálculos de precios |
| Filtros y búsquedas | Enviar emails |
| Relaciones (joins, includes) | Generar PDFs |
| Soporte de transacciones | Aplicar descuentos |
| Contar registros | Validar permisos |
| Verificar existencia | Orquestar múltiples entidades |

### Anatomía de un Repository

```typescript
@Injectable()
export class PaymentsRepository extends BaseRepository<Payment> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  // ==========================================
  // MÉTODOS BÁSICOS (heredados de BaseRepository)
  // ==========================================
  // - findById(id, tx?)
  // - findAll(tx?)
  // - create(data, tx?)
  // - update(id, data, tx?)
  // - delete(id, tx?)
  // - count(where?, tx?)
  // - exists(id, tx?)

  // ==========================================
  // MÉTODOS ESPECÍFICOS DE DOMINIO
  // ==========================================

  /**
   * 📊 QUERY: Buscar con relaciones
   */
  async findByIdWithTicket(id: string, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.payments.findUnique({
      where: { id },
      include: { tickets: true }, // ← Relación
    });
  }

  /**
   * 📊 QUERY: Filtrar por campo
   */
  async findByStatus(status: string, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.payments.findMany({
      where: { status }, // ← Filtro simple
    });
  }

  /**
   * 📊 QUERY: Filtrar por rango de fechas
   */
  async findByDateRange(start: Date, end: Date, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.payments.findMany({
      where: {
        created_at: {
          gte: start, // ← Operador de comparación
          lte: end,
        },
      },
    });
  }

  /**
   * 📊 QUERY: Buscar relacionado
   */
  async findByTicketId(ticketId: string, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.payments.findMany({
      where: { ticket_id: ticketId }, // ← Filtro por FK
    });
  }

  /**
   * ✏️ UPDATE: Actualizar campo específico
   */
  async updateStatus(id: string, status: string, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.payments.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(), // ← Dato simple
      },
    });
  }

  /**
   * ➕ CREATE: Crear con valores predefinidos
   */
  async createPending(ticketId: string, amount: number, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.payments.create({
      data: {
        ticket_id: ticketId,
        status: 'PENDING', // ← Valor por defecto
        total_amount: amount,
        created_at: new Date(),
      },
    });
  }
}
```

### Características Clave del Repository

1. **Solo habla con la BD**
   ```typescript
   // ✅ CORRECTO
   async findByStatus(status: string) {
     return this.db.payments.findMany({ where: { status } });
   }
   ```

2. **No tiene lógica de negocio**
   ```typescript
   // ❌ INCORRECTO - Lógica de negocio
   async findUnpaidPayments() {
     const payments = await this.db.payments.findMany();
     return payments.filter(p => p.status === 'PENDING' && p.total_amount > 100);
   }

   // ✅ CORRECTO - Solo query
   async findUnpaidPayments() {
     return this.db.payments.findMany({
       where: {
         status: 'PENDING',
         total_amount: { gt: 100 }
       }
     });
   }
   ```

3. **Soporte de transacciones**
   ```typescript
   // ✅ Siempre acepta transacción opcional
   async create(data: any, tx?: PrismaTransaction) {
     const db = tx || this.db;
     return db.payments.create({ data });
   }
   ```

4. **Retorna datos crudos**
   ```typescript
   // ✅ CORRECTO - Retorna modelo de Prisma
   async findById(id: string): Promise<Payment | null> {
     return this.db.payments.findUnique({ where: { id } });
   }

   // ❌ INCORRECTO - No envuelve en ApiResponse
   async findById(id: string): Promise<ApiResponse<Payment>> {
     const payment = await this.db.payments.findUnique({ where: { id } });
     return { data: payment }; // ← Esto es responsabilidad del Service
   }
   ```

---

## 🎯 Service - Capa de Negocio

### ¿Qué es?

El **Service** implementa la **lógica de negocio** de la aplicación. Orquesta repositories, aplica validaciones y reglas de negocio.

### Responsabilidades

| ✅ SÍ hace | ❌ NO hace |
|-----------|-----------|
| Validaciones de negocio | Queries directas a Prisma |
| Cálculos (precios, descuentos) | Escribir SQL |
| Transformaciones de datos | Joins de tablas |
| Orquestar múltiples repositories | Acceder directamente a `this.db.payments.create()` |
| Aplicar reglas de negocio | |
| Emitir eventos | |
| Manejar errores con contexto | |
| Envolver respuestas en DTOs | |

### Anatomía de un Service

```typescript
@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly ticketsRepository: TicketsRepository, // ← Puede usar múltiples repos
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ==========================================
  // OPERACIONES CRUD CON LÓGICA DE NEGOCIO
  // ==========================================

  /**
   * 🎯 REGLA DE NEGOCIO: Crear pago
   * - Verifica que el ticket exista
   * - Calcula el monto total
   * - Crea el pago
   * - Emite evento
   */
  @LogMethod
  async create(createPaymentDto: CreatePaymentDto): Promise<ApiResponse<Payment>> {
    // 1. VALIDACIÓN DE NEGOCIO
    const ticket = await this.ticketsRepository.findById(createPaymentDto.ticketId);
    if (!ticket) {
      throw new BadRequestException('Ticket does not exist');
    }

    // 2. LÓGICA DE NEGOCIO (cálculo)
    const totalAmount = this.calculateTotalAmount(ticket);

    // 3. PREPARAR DATOS
    const data = {
      ticket_id: createPaymentDto.ticketId,
      total_amount: totalAmount,
      status: 'PENDING',
      created_at: new Date(),
    };

    // 4. USAR REPOSITORY (acceso a datos)
    const payment = await this.paymentsRepository.create(data);

    // 5. LÓGICA POST-CREACIÓN (evento)
    this.eventEmitter.emit('payment.created', { paymentId: payment.id });

    // 6. ENVOLVER RESPUESTA
    return { data: payment };
  }

  /**
   * 🎯 REGLA DE NEGOCIO: Buscar pago
   * - Verifica que exista
   * - Lanza error específico si no existe
   */
  @LogMethod
  async findOne(id: string): Promise<ApiResponse<Payment>> {
    const payment = await this.paymentsRepository.findByIdWithTicket(id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return { data: payment };
  }

  /**
   * 🎯 REGLA DE NEGOCIO: Completar pago
   * - Verifica que el pago esté pendiente
   * - Actualiza el estado
   * - Actualiza el estado del ticket
   * - Emite evento
   */
  @LogMethod
  async completePayment(id: string): Promise<ApiResponse<Payment>> {
    // 1. VALIDACIÓN DE NEGOCIO
    const payment = await this.paymentsRepository.findByIdWithTicket(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Payment is not pending');
    }

    // 2. ORQUESTACIÓN (múltiples operaciones)
    const updatedPayment = await this.databasesService.$transaction(async (tx) => {
      // Actualizar pago
      const payment = await this.paymentsRepository.updateStatus(id, 'COMPLETED', tx);

      // Actualizar ticket relacionado
      await this.ticketsRepository.updateStatus(payment.ticket_id, 'CONFIRMED', tx);

      return payment;
    });

    // 3. EVENTO
    this.eventEmitter.emit('payment.completed', { paymentId: id });

    return { data: updatedPayment };
  }

  /**
   * 🎯 REGLA DE NEGOCIO: Calcular monto total
   * - Aplica descuentos
   * - Suma tasas
   * - Calcula impuestos
   */
  private calculateTotalAmount(ticket: any): number {
    const subtotal = ticket.subtotal;
    const discount = this.calculateDiscount(ticket);
    const taxes = (subtotal - discount) * 0.15;

    return subtotal - discount + taxes;
  }

  /**
   * 🎯 REGLA DE NEGOCIO: Calcular descuento
   */
  private calculateDiscount(ticket: any): number {
    // Lógica de negocio específica
    if (ticket.passengers.length >= 5) {
      return ticket.subtotal * 0.1; // 10% descuento grupal
    }
    return 0;
  }

  /**
   * 🎯 REGLA DE NEGOCIO: Reembolsar pago
   * - Solo si está completado
   * - Dentro de 24 horas
   * - Actualiza ticket y pago
   */
  @LogMethod
  async refundPayment(id: string): Promise<ApiResponse<Payment>> {
    const payment = await this.paymentsRepository.findByIdWithTicket(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // VALIDACIÓN DE NEGOCIO: Solo pagos completados
    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // VALIDACIÓN DE NEGOCIO: Ventana de tiempo
    const hoursSincePayment = (Date.now() - payment.created_at.getTime()) / (1000 * 60 * 60);
    if (hoursSincePayment > 24) {
      throw new BadRequestException('Refund period expired (24 hours)');
    }

    // ORQUESTACIÓN
    const refundedPayment = await this.databasesService.$transaction(async (tx) => {
      const payment = await this.paymentsRepository.updateStatus(id, 'REFUNDED', tx);
      await this.ticketsRepository.updateStatus(payment.ticket_id, 'CANCELLED', tx);
      return payment;
    });

    // EVENTO
    this.eventEmitter.emit('payment.refunded', { paymentId: id });

    return { data: refundedPayment };
  }
}
```

### Características Clave del Service

1. **Orquesta múltiples repositories**
   ```typescript
   async completePayment(id: string) {
     // ✅ Usa múltiples repositories
     const payment = await this.paymentsRepository.findById(id);
     const ticket = await this.ticketsRepository.findById(payment.ticket_id);

     // Lógica de negocio...
   }
   ```

2. **Aplica validaciones de negocio**
   ```typescript
   async create(dto: CreatePaymentDto) {
     // ✅ Validación de negocio
     if (dto.amount < 0) {
       throw new BadRequestException('Amount cannot be negative');
     }

     // ✅ Validación de existencia
     const ticket = await this.ticketsRepository.findById(dto.ticketId);
     if (!ticket) {
       throw new NotFoundException('Ticket not found');
     }
   }
   ```

3. **Realiza cálculos**
   ```typescript
   // ✅ CORRECTO - Cálculos en Service
   private calculateTotal(subtotal: number, discount: number): number {
     const taxes = (subtotal - discount) * 0.15;
     return subtotal - discount + taxes;
   }
   ```

4. **Emite eventos**
   ```typescript
   async create(dto: CreatePaymentDto) {
     const payment = await this.paymentsRepository.create(data);

     // ✅ Emite evento para desacoplar side effects
     this.eventEmitter.emit('payment.created', { paymentId: payment.id });

     return { data: payment };
   }
   ```

5. **Envuelve respuestas**
   ```typescript
   // ✅ CORRECTO - Service envuelve en ApiResponse
   async findOne(id: string): Promise<ApiResponse<Payment>> {
     const payment = await this.paymentsRepository.findById(id);
     return { data: payment }; // ← Wrapper
   }
   ```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Crear un Pago

#### ❌ Sin Repository (Todo en Service)

```typescript
// payments.service.ts
@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabasesService) {}

  async create(dto: CreatePaymentDto) {
    // ❌ Service hace query directo
    const ticket = await this.db.tickets.findUnique({
      where: { id: dto.ticketId }
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // ❌ Service hace insert directo
    const payment = await this.db.payments.create({
      data: {
        ticket_id: dto.ticketId,
        amount: dto.amount,
        status: 'PENDING',
      }
    });

    return { data: payment };
  }
}
```

**Problemas:**
- ❌ Service conoce la estructura de Prisma
- ❌ Difícil de testear (mockear `db.tickets` y `db.payments`)
- ❌ No reutilizable (otro service necesita duplicar el query)

---

#### ✅ Con Repository (Separación de Responsabilidades)

```typescript
// payments.repository.ts
@Injectable()
export class PaymentsRepository {
  constructor(private readonly db: DatabasesService) {}

  // 📊 RESPONSABILIDAD: Acceso a datos
  async create(data: Prisma.paymentsCreateInput, tx?: PrismaTransaction) {
    const database = tx || this.db;
    return database.payments.create({ data });
  }
}

// tickets.repository.ts
@Injectable()
export class TicketsRepository {
  constructor(private readonly db: DatabasesService) {}

  // 📊 RESPONSABILIDAD: Acceso a datos
  async findById(id: string, tx?: PrismaTransaction) {
    const database = tx || this.db;
    return database.tickets.findUnique({ where: { id } });
  }
}

// payments.service.ts
@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepo: PaymentsRepository,
    private readonly ticketsRepo: TicketsRepository,
  ) {}

  async create(dto: CreatePaymentDto) {
    // 🎯 RESPONSABILIDAD: Validación de negocio
    const ticket = await this.ticketsRepo.findById(dto.ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // 🎯 RESPONSABILIDAD: Preparar datos
    const data = {
      ticket_id: dto.ticketId,
      amount: dto.amount,
      status: 'PENDING',
    };

    // 🎯 RESPONSABILIDAD: Delegar a repository
    const payment = await this.paymentsRepo.create(data);

    return { data: payment };
  }
}
```

**Beneficios:**
- ✅ Service solo tiene lógica de negocio
- ✅ Repository encapsula acceso a datos
- ✅ Fácil de testear (mock simple de repositories)
- ✅ Reutilizable (otros services pueden usar los repos)

---

### Ejemplo 2: Completar un Pago (Operación Compleja)

```typescript
// payments.service.ts
@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepo: PaymentsRepository,
    private readonly ticketsRepo: TicketsRepository,
    private readonly db: DatabasesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async completePayment(id: string): Promise<ApiResponse<Payment>> {
    // 1️⃣ REPOSITORY: Obtener datos
    const payment = await this.paymentsRepo.findById(id);

    // 2️⃣ SERVICE: Validar reglas de negocio
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Payment must be in PENDING status');
    }

    // 3️⃣ SERVICE: Orquestar transacción (múltiples operaciones)
    const updatedPayment = await this.db.$transaction(async (tx) => {
      // REPOSITORY: Actualizar pago (con transacción)
      const payment = await this.paymentsRepo.updateStatus(id, 'COMPLETED', tx);

      // REPOSITORY: Actualizar ticket relacionado (con transacción)
      await this.ticketsRepo.updateStatus(payment.ticket_id, 'CONFIRMED', tx);

      return payment;
    });

    // 4️⃣ SERVICE: Side effects (eventos)
    this.eventEmitter.emit('payment.completed', {
      paymentId: id,
      ticketId: updatedPayment.ticket_id,
    });

    // 5️⃣ SERVICE: Envolver respuesta
    return { data: updatedPayment };
  }
}
```

**Separación clara:**
- 📊 **Repository:** `findById`, `updateStatus` (acceso a datos)
- 🎯 **Service:** Validaciones, orquestación, eventos (lógica de negocio)

---

### Ejemplo 3: Buscar Pagos con Filtros Complejos

```typescript
// payments.repository.ts
@Injectable()
export class PaymentsRepository {
  // 📊 RESPONSABILIDAD: Query con filtros
  async findByFilters(filters: PaymentFiltersDto, tx?: PrismaTransaction) {
    const db = tx || this.db;

    const where: Prisma.paymentsWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.minAmount) {
      where.total_amount = { gte: filters.minAmount };
    }

    if (filters.startDate && filters.endDate) {
      where.created_at = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    return db.payments.findMany({
      where,
      include: { tickets: true },
      orderBy: { created_at: 'desc' },
    });
  }
}

// payments.service.ts
@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepo: PaymentsRepository) {}

  async findAll(filters: PaymentFiltersDto): Promise<ApiResponse<Payment[]>> {
    // 🎯 RESPONSABILIDAD: Validar filtros
    if (filters.minAmount && filters.minAmount < 0) {
      throw new BadRequestException('Minimum amount cannot be negative');
    }

    // 📊 RESPONSABILIDAD: Delegar query al repository
    const payments = await this.paymentsRepo.findByFilters(filters);

    // 🎯 RESPONSABILIDAD: Aplicar lógica de negocio adicional
    const paymentsWithDiscount = payments.map(payment => ({
      ...payment,
      hasDiscount: this.checkIfHasDiscount(payment),
    }));

    return { data: paymentsWithDiscount };
  }

  // 🎯 Lógica de negocio
  private checkIfHasDiscount(payment: any): boolean {
    return payment.total_amount < payment.original_amount;
  }
}
```

---

## 🎯 Reglas de Oro

### Para Repository

1. **Solo operaciones de BD**
   ```typescript
   // ✅ CORRECTO
   async findByStatus(status: string) {
     return this.db.payments.findMany({ where: { status } });
   }

   // ❌ INCORRECTO (tiene lógica de negocio)
   async findPendingPaymentsAbove100() {
     const payments = await this.db.payments.findMany();
     return payments.filter(p => p.status === 'PENDING' && p.amount > 100);
   }
   ```

2. **Siempre soportar transacciones**
   ```typescript
   // ✅ CORRECTO
   async create(data: any, tx?: PrismaTransaction) {
     const db = tx || this.db;
     return db.payments.create({ data });
   }
   ```

3. **Retornar datos crudos de Prisma**
   ```typescript
   // ✅ CORRECTO
   async findById(id: string): Promise<Payment | null> {
     return this.db.payments.findUnique({ where: { id } });
   }

   // ❌ INCORRECTO (envuelve en ApiResponse)
   async findById(id: string): Promise<ApiResponse<Payment>> {
     const payment = await this.db.payments.findUnique({ where: { id } });
     return { data: payment };
   }
   ```

4. **No lanzar errores de negocio**
   ```typescript
   // ✅ CORRECTO (retorna null si no encuentra)
   async findById(id: string): Promise<Payment | null> {
     return this.db.payments.findUnique({ where: { id } });
   }

   // ❌ INCORRECTO (lanza error de negocio)
   async findById(id: string): Promise<Payment> {
     const payment = await this.db.payments.findUnique({ where: { id } });
     if (!payment) throw new NotFoundException('Payment not found');
     return payment;
   }
   ```

---

### Para Service

1. **Usar repositories, no Prisma directamente**
   ```typescript
   // ✅ CORRECTO
   async create(dto: CreatePaymentDto) {
     const payment = await this.paymentsRepo.create(data);
   }

   // ❌ INCORRECTO
   async create(dto: CreatePaymentDto) {
     const payment = await this.db.payments.create({ data });
   }
   ```

2. **Validar reglas de negocio**
   ```typescript
   // ✅ CORRECTO
   async completePayment(id: string) {
     const payment = await this.paymentsRepo.findById(id);

     if (payment.status !== 'PENDING') {
       throw new BadRequestException('Payment must be pending');
     }
   }
   ```

3. **Orquestar múltiples repositories**
   ```typescript
   // ✅ CORRECTO
   async completePayment(id: string) {
     await this.db.$transaction(async (tx) => {
       await this.paymentsRepo.updateStatus(id, 'COMPLETED', tx);
       await this.ticketsRepo.updateStatus(ticketId, 'CONFIRMED', tx);
     });
   }
   ```

4. **Envolver respuestas en ApiResponse**
   ```typescript
   // ✅ CORRECTO
   async findOne(id: string): Promise<ApiResponse<Payment>> {
     const payment = await this.paymentsRepo.findById(id);
     return { data: payment };
   }
   ```

---

## ❌ Anti-Patrones

### Anti-Patrón 1: Repository con Lógica de Negocio

```typescript
// ❌ INCORRECTO
@Injectable()
export class PaymentsRepository {
  async processPayment(id: string) {
    const payment = await this.db.payments.findUnique({ where: { id } });

    // ❌ Validación de negocio en repository
    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Invalid status');
    }

    // ❌ Cálculos en repository
    const discount = payment.amount * 0.1;

    // ❌ Actualización con lógica
    return this.db.payments.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        final_amount: payment.amount - discount
      }
    });
  }
}
```

**Corrección:**
```typescript
// ✅ CORRECTO - Repository solo hace queries
@Injectable()
export class PaymentsRepository {
  async updateStatus(id: string, status: string, finalAmount: number, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.payments.update({
      where: { id },
      data: { status, final_amount: finalAmount }
    });
  }
}

// ✅ CORRECTO - Service tiene la lógica
@Injectable()
export class PaymentsService {
  async processPayment(id: string) {
    const payment = await this.paymentsRepo.findById(id);

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Invalid status');
    }

    const discount = payment.amount * 0.1;
    const finalAmount = payment.amount - discount;

    return this.paymentsRepo.updateStatus(id, 'COMPLETED', finalAmount);
  }
}
```

---

### Anti-Patrón 2: Service Accediendo Directamente a Prisma

```typescript
// ❌ INCORRECTO
@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabasesService) {}

  async create(dto: CreatePaymentDto) {
    // ❌ Service hace query directo
    return this.db.payments.create({
      data: { ...dto }
    });
  }
}
```

**Corrección:**
```typescript
// ✅ CORRECTO
@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepo: PaymentsRepository) {}

  async create(dto: CreatePaymentDto) {
    const data = PaymentMapper.toPrismaCreate(dto);
    return this.paymentsRepo.create(data);
  }
}
```

---

### Anti-Patrón 3: Repository Emitiendo Eventos

```typescript
// ❌ INCORRECTO
@Injectable()
export class PaymentsRepository {
  constructor(
    private readonly db: DatabasesService,
    private readonly eventEmitter: EventEmitter2 // ❌
  ) {}

  async create(data: any) {
    const payment = await this.db.payments.create({ data });

    // ❌ Repository emitiendo eventos
    this.eventEmitter.emit('payment.created', { paymentId: payment.id });

    return payment;
  }
}
```

**Corrección:**
```typescript
// ✅ CORRECTO - Repository solo crea
@Injectable()
export class PaymentsRepository {
  async create(data: any, tx?: PrismaTransaction) {
    const db = tx || this.db;
    return db.payments.create({ data });
  }
}

// ✅ CORRECTO - Service emite eventos
@Injectable()
export class PaymentsService {
  async create(dto: CreatePaymentDto) {
    const payment = await this.paymentsRepo.create(data);

    this.eventEmitter.emit('payment.created', { paymentId: payment.id });

    return { data: payment };
  }
}
```

---

## 📊 Tabla Resumen

| Aspecto | Repository | Service |
|---------|-----------|---------|
| **Habla con BD** | ✅ Sí | ❌ No (usa Repository) |
| **Lógica de negocio** | ❌ No | ✅ Sí |
| **Validaciones** | ❌ No | ✅ Sí |
| **Cálculos** | ❌ No | ✅ Sí |
| **Eventos** | ❌ No | ✅ Sí |
| **Transacciones** | ✅ Soporte | ✅ Orquesta |
| **Retorna** | Modelos de Prisma | ApiResponse |
| **Lanza errores** | ❌ No (retorna null) | ✅ Sí (NotFoundException, etc.) |
| **Depende de** | DatabasesService | Repositories |
| **Testear con** | DB real o mock de Prisma | Mock de Repository |

---

## 🎓 Resumen Final

### Repository es para:
- 📊 **CRUD básico** (create, read, update, delete)
- 🔍 **Queries y filtros**
- 🔗 **Relaciones** (joins, includes)
- 💾 **Persistencia** de datos
- 🔄 **Transacciones** (soporte)

### Service es para:
- ✅ **Validaciones** de negocio
- 🧮 **Cálculos** y transformaciones
- 🎭 **Orquestación** de múltiples repositorios
- 📢 **Eventos** y side effects
- 🎯 **Reglas de negocio**

---

**Regla de oro:**
Si la pregunta es **"¿Cómo guardo/busco esto?"** → Repository
Si la pregunta es **"¿Qué hago con esto?"** → Service

---

**Documento creado:** 2026-02-20
