# Config: Un archivo vs tres archivos

## Opción A — actual (un solo `envs.ts`)

```
src/common/config/
└── envs.ts
```

```ts
// envs.ts — todo en uno
export const envs = {
  // App
  port, nodeEnv, apiPrefix, logLevel, corsOrigin,

  // Database
  dbName, dbHost, dbPort, dbUsername, dbPassword, databaseUrl,

  // Rate limiting
  rateLimitTtl, rateLimitMax,

  // Pagination
  paginationLimit, paginationMax, paginationPage,

  // Business
  taxesValue, serviceFeeValue, discountValue,
  holdExpirationMinutes, checkInTime, ticketCodePrefix,
};
```

**Uso:**
```ts
import { envs } from '../common/config/envs';

envs.taxesValue
envs.paginationLimit
envs.port
```

---

## Opción B — tres archivos

```
src/common/config/
├── envs.ts              ← infraestructura
├── business.config.ts   ← reglas de negocio
└── pagination.config.ts ← paginación
```

Requiere un archivo base compartido para la validación Joi:

```
src/common/config/
├── env-vars.ts          ← schema Joi + EnvVars interface (compartido)
├── envs.ts              ← infraestructura
├── business.config.ts   ← negocio
└── pagination.config.ts ← paginación
```

**`env-vars.ts`** — validación compartida:
```ts
// validación Joi y EnvVars — lo usan los 3 archivos
export const envVars = validatedEnvVars;
```

**`envs.ts`** — solo infraestructura:
```ts
import { envVars } from './env-vars';

export const envs = {
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,
  apiPrefix: envVars.API_PREFIX,
  logLevel: envVars.LOG_LEVEL,
  corsOrigin: envVars.CORS_ORIGIN,
  dbName: envVars.DB_NAME,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbUsername: envVars.DB_USERNAME,
  dbPassword: envVars.DB_PASSWORD,
  databaseUrl: envVars.DATABASE_URL,
  rateLimitTtl: envVars.RATE_LIMIT_TTL,
  rateLimitMax: envVars.RATE_LIMIT_MAX,
};
```

**`business.config.ts`** — reglas de negocio:
```ts
import { envVars } from './env-vars';

export const businessConfig = {
  taxesValue: envVars.TAXES_VALUE,
  serviceFeeValue: envVars.SERVICE_FEE_VALUE,
  discountValue: envVars.DISCOUNT_VALUE,
  holdExpirationMinutes: envVars.HOLD_EXPIRATION_MINUTES,
  checkInTime: envVars.CHECK_IN_TIME,
  ticketCodePrefix: envVars.TICKET_CODE_PREFIX,
};
```

**`pagination.config.ts`** — paginación:
```ts
import { envVars } from './env-vars';

export const paginationConfig = {
  limit: envVars.PAGINATION_LIMIT,
  max: envVars.PAGINATION_MAX,
  page: envVars.PAGINATION_PAGE,
};
```

**Uso:**
```ts
import { envs } from '../common/config/envs';
import { businessConfig } from '../common/config/business.config';
import { paginationConfig } from '../common/config/pagination.config';

envs.port
businessConfig.taxesValue
paginationConfig.limit
```

---

## Comparación

| | Opción A (1 archivo) | Opción B (3 archivos) |
|---|---|---|
| **Archivos** | 1 | 4 (incluye `env-vars.ts` base) |
| **Import** | siempre `envs` | 3 imports distintos según contexto |
| **Separación** | por comentarios | por archivo |
| **Complejidad** | baja | media |
| **Escalabilidad** | suficiente hasta ~20 vars | mejor con muchas vars |

---

## Recomendación

Con el tamaño actual del proyecto (**Opción A**) — los comentarios de sección organizan bien sin agregar complejidad.

**Migrar a Opción B** cuando:
- `envs.ts` supere ~150 líneas
- Diferentes módulos necesiten importar solo su sección (sin cargar todo)
- El equipo crece y cada área quiere ownership de su config
