# Arquitectura — API Paradeisos

## Patrones de diseño

| Patrón | Descripción |
|--------|-------------|
| **Repository** | Capa de acceso a datos. Base genérica en `common/base/base.repository.ts` |
| **Command** | Lógica de negocio encapsulada por operación (`create-booking`, `create-ticket`, `release-expired-holds`) |
| **Query Builder** | Construcción de queries complejas (`tickets/`, `seat-holds-history/`) |
| **Value Objects** | `Money`, `TicketPricing` en `common/value-objects/` |
| **Mapper** | Transformación entre entidades DB y respuestas de API |
| **Factory** | Construcción de entidades complejas (`tickets/factories/`) |
| **Event + Listener** | Flujo post-creación de ticket via `EventEmitter` |
| **Specification** | Filtros de negocio reutilizables (`schedules/specifications/`) |
| **Generator** | Renderizado de PDF via `PdfGenerator<T>` (genérico por diseño) |

---

## Servicios comunes (`common/`)

| Servicio | Descripción |
|----------|-------------|
| `PdfService` | Genera PDFs con Playwright + EJS. Acepta cualquier `PdfGenerator<T>`, completamente genérico |
| `QrService` | Generación de códigos QR |
| `MailService` | Envío de emails |

### Cómo extender `PdfService`

Para generar un nuevo tipo de PDF, crear un generator que implemente `PdfGenerator<T>`:

```typescript
// ejemplo: boarding-pass-pdf.generator.ts
@Injectable()
export class BoardingPassPdfGenerator implements PdfGenerator<BoardingPassData> {
  getTemplatePath(): string {
    return path.join(__dirname, '../templates/boarding-pass.ejs');
  }

  getPdfOptions(): PdfGeneratorOptions {
    return { format: 'A5', landscape: true };
  }

  prepareData(data: BoardingPassData): Record<string, unknown> {
    return { ...data };
  }
}
```

Y llamarlo desde el servicio:

```typescript
const pdf = await this.pdfService.generate(this.boardingPassGenerator, data);
```

---

## Estructura de `common/` — estado actual y pendiente

```
src/common/
├── base/
│   └── base.repository.ts          ✓
├── config/
│   └── envs.ts                     ✓
├── dtos/
│   ├── api-response.dto.ts         ✓
│   ├── pagination.dto.ts           ✓
│   └── query-params.dto.ts         ✓
├── interfaces/
│   └── api-response.interface.ts   ✓
├── middlewares/
│   └── logger.middleware.ts        ✓
├── services/
│   ├── email/                      ✓
│   ├── pdf/                        ✓
│   └── qr/                         ✓
├── types/
│   └── prisma-transaction.type.ts  ✓
├── utils/
│   ├── code-generator.util.ts      ✓
│   └── date.util.ts                ✓
├── value-objects/                  ✓
│
├── filters/        ← pendiente — HttpExceptionFilter global
├── interceptors/   ← pendiente — ResponseTransformInterceptor
├── decorators/     ← pendiente — custom decorators
├── guards/         ← pendiente — auth guards (cuando se implemente autenticación)
├── exceptions/     ← pendiente — domain exceptions
└── constants/      ← pendiente — constantes globales compartidas
```

---

## Pendientes por módulo

| Módulo | Observación |
|--------|-------------|
| `contacts/` | Sin controller — uso interno por otros módulos |
| `passengers/` | Sin controller — uso interno por otros módulos |
| `bookings/` | Sin mapper — usa interfaces directas |
| `health/` | Typo en nombre de archivo: `heath.service.ts` → `health.service.ts` |

---

## Variables de entorno — clasificación

### Requeridas (sin default)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor |
| `DB_NAME`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` | Conexión a PostgreSQL |
| `DATABASE_URL` | URL de conexión completa (Prisma) |
| `PAGINATION_LIMIT`, `PAGINATION_PAGE` | Paginación |
| `CHECK_IN_TIME` | Minutos antes de la salida para check-in |

### Opcionales (con default)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `local` | Entorno de ejecución |
| `TAXES_VALUE` | `0` | Porcentaje de impuestos |
| `SERVICE_FEE_VALUE` | `0` | Cargo por servicio |
| `DISCOUNT_VALUE` | `0` | Descuento |
| `HOLD_EXPIRATION_MINUTES` | `15` | Minutos para liberar reservas no confirmadas |
| `TICKET_CODE_PREFIX` | `TKT` | Prefijo de código de ticket |

### Hardcoded — candidatos a mover a ENV

| Archivo | Valor | Variable sugerida |
|---------|-------|-------------------|
| `main.ts` | `'api'` (prefijo global) | `API_PREFIX` |
| `main.ts` | CORS `true` (acepta todos los orígenes) | `CORS_ORIGIN` |
| `tasks.service.ts` | `EVERY_MINUTE` (cron) | `HOLD_CLEANUP_CRON` |

---

## Variables de entorno comunes — para cuando se agreguen features

```bash
# Autenticación
JWT_SECRET=
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@paradeisos.com

# Rate limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info    # debug | info | warn | error

# CORS específico (en vez de true)
CORS_ORIGIN=http://localhost:3001

# Monitoreo
SENTRY_DSN=
```
