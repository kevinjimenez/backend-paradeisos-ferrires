# Plan de Implementación — Arquitectura

Todo lo que se debe crear o modificar para completar la estructura definida en [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Progreso general

- [ ] Paso 1 — `common/constants/`
- [ ] Paso 2 — `common/exceptions/`
- [ ] Paso 3 — `common/filters/`
- [ ] Paso 4 — `common/interceptors/`
- [ ] Paso 5 — `common/decorators/`
- [ ] Paso 6 — `common/guards/`
- [ ] Paso 7 — Typo fix en `health/`
- [ ] Paso 8 — `bookings/mappers/`

---

## Paso 1 — `common/constants/`

### Crear `src/common/constants/http.constants.ts`
```ts
export const HTTP_CONTENT_TYPES = {
  PDF: 'application/pdf',
  JSON: 'application/json',
  HTML: 'text/html',
} as const;

export const HTTP_MESSAGES = {
  OK: 'OK',
  CREATED: 'Created',
  BAD_REQUEST: 'Bad Request',
  NOT_FOUND: 'Not Found',
  CONFLICT: 'Conflict',
  INTERNAL: 'Internal Server Error',
} as const;
```
> Reemplaza el string `'application/pdf'` hardcodeado en `tickets/constants/response.constants.ts`.

### Crear `src/common/constants/pagination.constants.ts`
```ts
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
```
> El `100` de `@Max(100)` en `PaginationDto` pasará a usar `PAGINATION.MAX_LIMIT`.

### Crear `src/common/constants/index.ts`
```ts
export * from './http.constants';
export * from './pagination.constants';
```

---

## Paso 2 — `common/exceptions/`

### Crear `src/common/exceptions/domain.exception.ts`
```ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}
```

### Crear `src/common/exceptions/not-found.exception.ts`
```ts
import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id '${id}' not found`, HttpStatus.NOT_FOUND);
  }
}
```
> Uso: `throw new ResourceNotFoundException('Ticket', id)`

### Crear `src/common/exceptions/conflict.exception.ts`
```ts
import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ResourceConflictException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
```
> Uso: `throw new ResourceConflictException('Seat already reserved')`

### Crear `src/common/exceptions/index.ts`
```ts
export * from './domain.exception';
export * from './not-found.exception';
export * from './conflict.exception';
```

---

## Paso 3 — `common/filters/`

### Crear `src/common/filters/http-exception.filter.ts`
```ts
import {
  ArgumentsHost, Catch, ExceptionFilter,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as string | { message: string | string[] })
        : 'Internal server error';

    const resolvedMessage =
      typeof message === 'string'
        ? message
        : Array.isArray(message.message)
          ? message.message[0]
          : message.message;

    if (status >= 500) {
      this.logger.error(exception);
    }

    response.status(status).json({
      error: {
        statusCode: status,
        message: resolvedMessage,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```
> Estandariza todos los errores a `{ error: { statusCode, message, path, timestamp } }`.

### Crear `src/common/filters/index.ts`
```ts
export * from './http-exception.filter';
```

### Modificar `src/common/common.module.ts`
Agregar `APP_FILTER`:
```ts
import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PdfService } from './services/pdf/pdf.service';
import { MailService } from './services/mail/mail.service';
import { QrService } from './services/qr/qr.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';

@Global()
@Module({
  providers: [
    PdfService,
    MailService,
    QrService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
  exports: [PdfService, MailService, QrService],
})
export class CommonModule {}
```
> Se registran con `APP_FILTER` / `APP_INTERCEPTOR` (no en `main.ts`) para tener acceso a DI.

### Por qué `APP_*` en módulo y no `main.ts`

`APP_FILTER`, `APP_INTERCEPTOR`, `APP_GUARD` y `APP_PIPE` son **tokens reservados** de `@nestjs/core`.
Cuando NestJS arranca, busca todos los providers con esos tokens y los aplica globalmente — con DI disponible.

```ts
// ✅ CommonModule — NestJS instancia la clase e inyecta dependencias automáticamente
{ provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor }
// ResponseTransformInterceptor recibe Reflector por DI sin hacer nada extra
```

```ts
// ⚠️ main.ts — instancia manual, hay que pasar dependencias a mano
app.useGlobalInterceptors(new ResponseTransformInterceptor(new Reflector()));
app.useGlobalGuards(new JwtAuthGuard(new Reflector()));
// si en el futuro necesita más deps, hay que agregarlas aquí también
```

**Regla:** si la clase tiene dependencias en el constructor → `APP_*` en módulo.
Si no tiene dependencias → puede ir en `main.ts` con `new` sin problema.

```ts
// ValidationPipe no inyecta nada → está bien en main.ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

Los 4 tokens disponibles:

| Token | Equivalente en main.ts |
|-------|------------------------|
| `APP_FILTER` | `app.useGlobalFilters()` |
| `APP_INTERCEPTOR` | `app.useGlobalInterceptors()` |
| `APP_GUARD` | `app.useGlobalGuards()` |
| `APP_PIPE` | `app.useGlobalPipes()` |

---

## Paso 4 — `common/interceptors/`

> **Nota:** El interceptor importa `SKIP_TRANSFORM_KEY` del decorador del Paso 5.
> Crear ambos pasos juntos o en orden: primero Paso 5 (decoradores), luego el interceptor.

### Crear `src/common/interceptors/response-transform.interceptor.ts`
```ts
import {
  CallHandler, ExecutionContext,
  Injectable, NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, { data: T }>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<{ data: T }> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle() as unknown as Observable<{ data: T }>;
    }

    return next.handle().pipe(
      map((value) => {
        if (value !== null && typeof value === 'object' && 'data' in (value as object)) {
          return value as { data: T };
        }
        return { data: value };
      }),
    );
  }
}
```
> Garantiza `{ data: T }` en toda respuesta exitosa sin doble-envolver las que ya lo tienen.

**Caso 1 — retorno simple:** el interceptor envuelve automáticamente
```ts
@Get(':id')
findOne(@Param('id') id: string) {
  return this.ticketsService.findOne(id); // retorna el objeto plano
}
// cliente recibe: { "data": { id: "...", code: "...", ... } }
```

**Caso 2 — retorno paginado:** ya viene con `data`, no lo doble-envuelve
```ts
@Get()
findAll(@Query() query: PaginationDto) {
  return this.ticketsService.findAll(query); // retorna { data: [...], meta: {...} }
}
// cliente recibe: { "data": [...], "meta": { page, limit, total } }
// NO retorna: { "data": { "data": [...] } }  ← el interceptor lo detecta y lo deja pasar
```

**Caso 3 — PDF con `@SkipTransform()`:** se salta el interceptor por completo
```ts
@Get(':id/pdf')
@SkipTransform()
async generatePdf(@Param('id') id: string, @Res() res: Response) {
  const pdf = await this.ticketsService.generateTicketPdf(id);
  res.set({ 'Content-Type': 'application/pdf' });
  res.send(pdf);
}
// cliente recibe: [PDF binario directamente]
// SIN @SkipTransform retornaría: { "data": <Buffer ...> }  ← rompería la descarga
```

### Crear `src/common/interceptors/index.ts`
```ts
export * from './response-transform.interceptor';
```

---

## Paso 5 — `common/decorators/`

### Crear `src/common/decorators/public.decorator.ts`
```ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```
> Preparación para JWT: marca rutas que no requieren autenticación.

### Crear `src/common/decorators/skip-transform.decorator.ts`
```ts
import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_KEY = 'skipTransform';
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
```
> Usar en endpoints con `@Res()` como la descarga de PDF en tickets.

### Crear `src/common/decorators/index.ts`
```ts
export * from './public.decorator';
export * from './skip-transform.decorator';
```

---

## Paso 6 — `common/guards/`

### Instalar dependencia (si no está)
```bash
npm install @nestjs/passport passport passport-jwt @types/passport-jwt
```

### Crear `src/common/guards/jwt-auth.guard.ts`
```ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }
}
```
> En **modo pasivo** — no se registra globalmente hasta implementar JWT completo.
> Cuando se active: `{ provide: APP_GUARD, useClass: JwtAuthGuard }` en `CommonModule`.

### Crear `src/common/guards/index.ts`
```ts
export * from './jwt-auth.guard';
```

---

## Paso 7 — Typo fix en `health/`

### Renombrar archivo
```bash
mv src/health/heath.service.ts src/health/health.service.ts
```

### Modificar `src/health/health.controller.ts` — línea 2
```diff
- import { HealthService } from './heath.service';
+ import { HealthService } from './health.service';
```

### Modificar `src/health/health.module.ts` — línea 3
```diff
- import { HealthService } from './heath.service';
+ import { HealthService } from './health.service';
```

---

## Paso 8 — `bookings/mappers/`

### Crear `src/bookings/mappers/booking.mapper.ts`
```ts
import type { BookingResponse } from '../interfaces/booking-response.interface';

export class BookingMapper {
  static toResponse(id: string): BookingResponse {
    return { id };
  }
}
```
> Trivial ahora. Establece el patrón para cuando `BookingResponse` crezca con `expiresAt`, `status`, etc.

---

## Paso 9 — `boarding-passes/generators/` (futuro)

### Ubicación

```
src/boarding-passes/
└── generators/
    └── boarding-pass-pdf.generator.ts
```

> Vive dentro del módulo `boarding-passes/`, igual que `TicketPdfGenerator` vive en `tickets/generators/`.
> El `PdfService` de `common/` no cambia — solo sabe renderizar, no importa desde qué módulo se llame.

### Crear `src/boarding-passes/generators/boarding-pass-pdf.generator.ts`
```ts
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { PdfGenerator, PdfGeneratorOptions } from '../../common/interfaces/pdf-generator.interface';
import { BoardingPassData } from '../interfaces/boarding-pass-data.interface';

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

### Registrar en `boarding-passes.module.ts`
```ts
@Module({
  providers: [BoardingPassesService, BoardingPassPdfGenerator],
})
export class BoardingPassesModule {}
```

### Usar desde el service
```ts
// boarding-passes.service.ts
constructor(
  private readonly pdfService: PdfService,
  private readonly boardingPassGenerator: BoardingPassPdfGenerator,
) {}

async generatePdf(data: BoardingPassData): Promise<Buffer> {
  return this.pdfService.generatePdf(this.boardingPassGenerator, data);
}
```

> No se implementa hasta que exista el módulo `boarding-passes/`. Está documentado como ejemplo de extensión del patrón Generator.

---

## Orden recomendado de ejecución

```
Paso 7  →  independiente, hacerlo primero (no tiene deps)
Paso 1  →  constants
Paso 5  →  decorators  (necesario antes del interceptor)
Paso 2  →  exceptions
Paso 3  →  filters + actualizar CommonModule (APP_FILTER)
Paso 4  →  interceptors + actualizar CommonModule (APP_INTERCEPTOR)
Paso 6  →  guards (solo archivo, no activar globalmente aún)
Paso 8  →  booking mapper (independiente)
```

---

## Ejemplo de uso — cómo se ve todo junto

Una vez implementados los pasos 1–5, así quedan los módulos que los consumen.

### Controller limpio (tickets)

```ts
// tickets.controller.ts
import { Controller, Get, Post, Param, Body, Res } from '@nestjs/common';
import { SkipTransform } from '../common/decorators';
import { Response } from 'express';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // El interceptor envuelve automáticamente en { data: ticket }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
    // cliente recibe: { "data": { id, code, ... } }
  }

  // @SkipTransform porque devuelve un stream/buffer, no JSON
  @Get(':id/pdf')
  @SkipTransform()
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.ticketsService.generateTicketPdf(id);
    res.set({ 'Content-Type': 'application/pdf' });
    res.send(pdf);
    // cliente recibe: el PDF directamente, sin { data: ... }
  }
}
```

### `ResourceNotFoundException` — recurso no encontrado (404)

```ts
// tickets.service.ts
import { ResourceNotFoundException } from '../common/exceptions';

async findOne(id: string) {
  const ticket = await this.ticketsRepository.findById(id);

  if (!ticket) {
    throw new ResourceNotFoundException('Ticket', id);
  }

  return ticket;
}
```
```json
// GET /api/tickets/id-inexistente
{
  "error": {
    "statusCode": 404,
    "message": "Ticket with id 'id-inexistente' not found",
    "path": "/api/tickets/id-inexistente",
    "timestamp": "2026-03-22T10:00:00.000Z"
  }
}
```

### `ResourceConflictException` — regla de negocio violada (409)

```ts
// create-seat-hold.command.ts
import { ResourceConflictException } from '../../common/exceptions';

if (schedule.availableSeats < totalPassengers) {
  throw new ResourceConflictException(
    `Schedule '${scheduleId}' does not have enough available seats`,
  );
}
```
```json
// POST /api/booking — sin asientos disponibles
{
  "error": {
    "statusCode": 409,
    "message": "Schedule 'abc-123' does not have enough available seats",
    "path": "/api/booking",
    "timestamp": "2026-03-22T10:00:00.000Z"
  }
}
```

### `DomainException` — error de dominio personalizado (cualquier status)

```ts
// payments.service.ts
import { DomainException } from '../common/exceptions';
import { HttpStatus } from '@nestjs/common';

if (payment.status !== 'pending') {
  throw new DomainException(
    `Payment '${paymentId}' cannot be processed — current status: ${payment.status}`,
    HttpStatus.UNPROCESSABLE_ENTITY,
  );
}
```
```json
// POST /api/payments/process — pago ya procesado
{
  "error": {
    "statusCode": 422,
    "message": "Payment 'xyz-456' cannot be processed — current status: completed",
    "path": "/api/payments/process",
    "timestamp": "2026-03-22T10:00:00.000Z"
  }
}
```

### Respuestas que llegan al cliente

```
GET /api/tickets/123          →  { "data": { id, code, passengers, ... } }
GET /api/tickets/999          →  { "error": { statusCode: 404, message: "Ticket with id '999' not found", ... } }
GET /api/tickets/123/pdf      →  [PDF binary — sin envolver]
POST /api/booking (sin seats) →  { "error": { statusCode: 409, message: "Schedule '...' does not have...", ... } }
POST /api/tickets (dto malo)  →  { "error": { statusCode: 400, message: "outboundSchedule must be a UUID", ... } }
```
