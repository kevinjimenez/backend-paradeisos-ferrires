# API Paradeisos — Guía de Endpoints

## Resumen General

| Módulo | Método | Path | Descripción |
|---|---|---|---|
| App | GET | `/` | Redirige a `/health` |
| Health | GET | `/health` | Estado del servidor |
| Booking | POST | `/booking` | Crear reserva con seat holds |
| Schedules | GET | `/schedules` | Listar horarios con filtros |
| Tickets | POST | `/tickets` | Crear ticket |
| Tickets | GET | `/tickets` | Listar tickets |
| Tickets | GET | `/tickets/:id` | Obtener ticket con relaciones |
| Tickets | GET | `/tickets/:id/pdf` | Generar PDF del ticket |
| Tickets | PATCH | `/tickets/:id` | Actualizar ticket |
| Payments | POST | `/payments` | Crear pago |
| Payments | GET | `/payments/:id` | Obtener pago |
| Payments | PATCH | `/payments/:id` | Actualizar pago |
| Seat Holds | GET | `/seat-holds-history/:id` | Ver historial de reserva |
| Ports | GET | `/ports` | Listar puertos con islas |
| Catalogs | GET | `/catalogs` | Listar todos los catálogos |
| Catalogs | GET | `/catalogs/by-category` | Catálogos por categoría |

---

## Flujos Detallados

### GET `/health`

```
HealthController.checkHealth()
  → HealthService.checkStatus()
    → Returns { environment, message, port }
```

---

### GET `/ports`

```
PortsController.findAll()
  → PortsService.findAllWithIslands()
    → PortsRepository.findAllWithIslands()
      → prisma.ports.findMany({
          select: { id, name, islands: { id, name } }
        })

Response: { data: Port[] }
```

---

### GET `/catalogs`

```
CatalogsController.findAll()
  → CatalogsService.findAll()
    → CatalogsRepository.findAll()
      → prisma.catalogs.findMany()

Response: { data: Catalog[] }
```

---

### GET `/catalogs/by-category?category=xxx`

```
Query params:
  category: string

CatalogsController.findByCategory(query)
  → CatalogsService.findByCategory(category)
    → CatalogsRepository.findByCategory(category)
      → prisma.catalogs.findMany({
          where: { category, is_active: true },
          select: { id, code, description }
        })

Response: { data: Catalog[] }
```

---

### GET `/schedules`

```
Query params:
  departureDate?: string  (ISO datetime)
  from?:          UUID    (origin_port_id)
  to?:            UUID    (destination_port_id)

SchedulesController.findAll(filters)
  → SchedulesService.findAll(filters)
    → buildWhereFromFilters()           ← Specifications pattern
        → ScheduleSpecifications.byDepartureDate()
        → ScheduleSpecifications.byOriginPort()
        → ScheduleSpecifications.byDestinationPort()
        → ScheduleSpecifications.combine()
    → SchedulesRepository.findWithFilters(where)
      → prisma.schedules.findMany({
          select: {
            id, departure_time, arrival_time, available_seats,
            ferries: { name, amenities, type },
            routes: { base_price_national }
          },
          where: { ...filtros }
        })

Response: { data: Schedule[] }
```

---

### POST `/booking`

**Request body:**
```json
{
  "outboundScheduleId": "UUID",
  "returnScheduleId": "UUID (opcional)",
  "totalPassengers": 2
}
```

**Flujo:**
```
BookingController.create(dto)
  → BookingService.create(dto)
    → DatabasesService.$transaction() ← ATÓMICO
        → CreateSeatHoldCommand (ida)
            → SchedulesRepository.findByIdWithLock()   ← SELECT FOR UPDATE
            → Valida: status === 'scheduled'
            → Valida: available_seats >= totalPassengers
            → SeatHoldsRepository.createHold()
            → SchedulesRepository.decrementSeats()
        → CreateSeatHoldCommand (vuelta) ← opcional, mismo flujo
        → SeatHoldsHistoryRepository.createHistory()
      Commit TX

Response: { data: { id: seat_holds_history_id } }
```

> El `id` retornado es el `seat_holds_history_id` que se usa luego en `POST /tickets`.

---

### POST `/tickets`

**Request body:**
```json
{
  "tripType": "one_way | round_trip",
  "contact": {
    "...": "CreateContactDto"
  },
  "passenger": [
    { "...": "CreatePassengerDto" }
  ],
  "outboundSchedule": "UUID",
  "returnSchedule": "UUID (opcional)",
  "outboundHold": "UUID",
  "returnHold": "UUID (opcional)"
}
```

**Flujo:**
```
TicketsController.create(dto)
  → TicketsService.create(dto)
    → DatabasesService.$transaction() ← ATÓMICO
        → CreateTicketCommand.execute(dto, tx)
            → ContactsService.create(dto.contact)
                → ContactsRepository.upsertByDocument()  ← no duplica por documento
            → TicketFactory.createTicketData()           ← genera código único + calcula precios
            → TicketsRepository.createTicket()
            → Promise.allSettled(
                passengers.map → PassengersRepository.upsertByDocument()
              )                                          ← paralelo, no duplica por documento
      Commit TX
    → EventEmitter.emit('ticket.created')  ← ASÍNCRONO (no bloquea respuesta)
        ├─ GenerateTicketPdfListener → PdfService.generate()
        └─ CreatePaymentListener    → PaymentsRepository.create()  ← pago PENDIENTE automático

Response: { data: { id, contact, passengers[], total, subtotal, taxes, ... } }
```

---

### GET `/tickets`

```
TicketsController.findAll()
  → TicketsService.findAll()
    → TicketsRepository.findAll()
      → prisma.tickets.findMany()

Response: { data: Ticket[] }
```

---

### GET `/tickets/:id`

```
TicketsController.findOne(id)
  → TicketsService.findOne(id)
    → TicketQueryBuilder().withAllRelations().build()   ← builder dinámico de select
    → TicketsRepository.findOneWithRelations(id, selectConfig)
      → prisma.tickets.findUnique({
          where: { id },
          select: {
            id, status, ticket_code, qr_code,
            passengers: { ... },
            outbound_schedules: { routes, ferries, ... },
            return_schedules: { routes, ferries, ... }
          }
        })

Response: { data: Ticket con todas las relaciones }
```

---

### GET `/tickets/:id/pdf`

```
TicketsController.generateTicket(id, res)
  → TicketsService.generateTicketPdf(id)
    → TicketsService.findOne(id)
    → TicketMapper.toTicketResponse()
    → PdfService.generate(TicketPdfGenerator, ticketData)
  → res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': '...' })
  → res.send(pdfBuffer)

Response: Binary PDF stream
```

---

### PATCH `/tickets/:id`

**Request body:** `UpdateTicketDto` (todos los campos opcionales)
```json
{
  "status": "TicketsStatus enum (opcional)",
  "...": "cualquier campo de CreateTicketDto"
}
```

```
TicketsController.update(id, dto)
  → TicketsService.update(id, dto)
    → TicketsService.findOne(id)            ← valida que existe
    → TicketsRepository.updateTicket(id, data)
      → prisma.tickets.update()

Response: { data: Ticket actualizado }
```

---

### POST `/payments`

**Request body:**
```json
{
  "ticketId": "UUID",
  "amount": 150.00,
  "paymentMethod": "credit_card (default)",
  "paymentProvider": "payphone (default)"
}
```

```
PaymentsController.create(dto)
  → PaymentsService.create(dto)
    → PaymentMapper.toPrismaCreate(dto)
    → PaymentsRepository.create(data)
      → prisma.payments.create()

Response: { data: Payment }
```

> Normalmente este endpoint no se llama manualmente — el pago se crea automáticamente vía evento `ticket.created`.

---

### GET `/payments/:id`

```
PaymentsController.findOne(id)
  → PaymentsService.findOne(id)
    → PaymentsRepository.findByIdWithTicket(id)
      → prisma.payments.findUnique({
          where: { id },
          include: { tickets: true }
        })
    → Lanza NotFoundException si no existe

Response: { data: Payment con ticket relacionado }
```

---

### PATCH `/payments/:id`

**Request body:** `UpdatePaymentDto` (todos opcionales)
```json
{
  "status": "PaymentStatus enum",
  "amount": 150.00
}
```

```
PaymentsController.update(id, dto)
  → PaymentsService.update(id, dto)
    → PaymentsService.findOne(id)          ← valida que existe
    → PaymentMapper.toPrismaUpdate(dto)
    → PaymentsRepository.update(id, data)
      → prisma.payments.update()

Response: { data: Payment actualizado }
```

---

### GET `/seat-holds-history/:id`

```
SeatHoldsHistoryController.findOne(id)
  → SeatHoldsHistoryService.findOne(id)
    → SeatHoldsHistoryQueryBuilder().withAllRelations().build()
    → SeatHoldsHistoryRepository.findOneWithRelations(id)
      → prisma.seat_holds_history.findUnique({
          where: { id },
          select: { ...todas las relaciones }
        })
    → Valida que seat_holds_history existe
    → Valida que outbound_seat_holds no esté expirado

Response: { data: SeatHoldsHistory con relaciones }
```

---

## Arquitectura de Eventos

```
EventEmitter: 'ticket.created'
  payload: { ticketId, contactId, total, subtotal, taxes, serviceFee, discount }

  ├─ GenerateTicketPdfListener
  │    → TicketsService.generateTicketPdf(ticketId)
  │    → PdfService.generate(TicketPdfGenerator, data)
  │
  └─ CreatePaymentListener
       → PaymentsService.create({ ticketId, amount: total })
       → PaymentsRepository.create()   ← status: PENDING
```

---

## Flujo Completo de una Reserva

```
1. GET /schedules          → Buscar horarios disponibles
2. POST /booking           → Reservar asientos (lock + seat hold)  →  { id: holdHistoryId }
3. POST /tickets           → Crear ticket (usa holdHistoryId)       →  { id: ticketId, ... }
4. [automático]            → Pago pendiente creado vía evento
5. PATCH /payments/:id     → Actualizar estado del pago (confirmado/fallido)
6. GET /tickets/:id/pdf    → Descargar PDF del ticket
```

---

## Tablas de Base de Datos Involucradas

| Endpoint | Tablas |
|---|---|
| GET /schedules | `schedules`, `ferries`, `routes` |
| POST /booking | `schedules`, `seat_holds`, `seat_holds_history` |
| POST /tickets | `tickets`, `contacts`, `passengers`, `seat_holds` |
| GET /tickets/:id | `tickets`, `passengers`, `contacts`, `schedules`, `routes`, `ferries` |
| POST /payments | `payments`, `tickets` |
| GET /ports | `ports`, `islands` |
| GET /catalogs | `catalogs` |

---

## Notas Importantes

- **Sin autenticación**: ninguna guard implementada, API abierta.
- **Lock pesimista**: `POST /booking` usa `SELECT FOR UPDATE` para evitar overbooking.
- **Upsert por documento**: contactos y pasajeros no se duplican — se reutilizan por número de documento.
- **Pago automático**: al crear un ticket, el pago pendiente se crea automáticamente vía evento asíncrono.
- **PDF asíncrono**: el PDF se genera en background después de crear el ticket, no bloquea la respuesta.
- **Transacciones atómicas**: `/booking` y `/tickets` usan `$transaction` — si algo falla, todo se revierte.
