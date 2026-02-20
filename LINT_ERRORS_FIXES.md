# 🔧 Errores de Lint y Soluciones

> **Archivo analizado:** `src/common/decorators/log-method.decorator.ts`

---

## 🚨 Errores Identificados

### Error 1: `@typescript-eslint/no-explicit-any`

**Líneas:** 5, 12

```typescript
// ❌ PROBLEMA
export function LogMethod(
  target: any,                    // ← Error: any sin tipo
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  descriptor.value = async function (...args: any[]) { // ← Error: any[]
    // ...
  };
}
```

**Razón:**
Aunque ESLint tiene `'@typescript-eslint/no-explicit-any': 'off'`, TypeScript sigue mostrando advertencias en modo estricto.

---

### Error 2: `@typescript-eslint/no-unsafe-argument`

**Línea:** 17

```typescript
// ❌ PROBLEMA
const result = await originalMethod.apply(this, args); // ← Error: args es any[]
```

**Razón:**
`args` es de tipo `any[]`, lo cual es inseguro al pasarlo a `apply()`.

---

### Error 3: `@typescript-eslint/no-unsafe-member-access`

**Línea:** 22

```typescript
// ❌ PROBLEMA
logger.error(`${propertyKey} failed: ${error.message}`, error.stack);
//                                      ^^^^^^^^^^^^^^  ^^^^^^^^^^^
//                                      Error sin tipo
```

**Razón:**
`error` es de tipo `unknown` en catch blocks (TypeScript 4.4+), no tiene propiedades garantizadas.

---

## ✅ Soluciones

### Opción 1: Versión Type-Safe (Recomendada)

```typescript
// src/common/decorators/log-method.decorator.ts
import { Logger } from '@nestjs/common';

/**
 * Method decorator that logs method execution
 * @param target - The prototype of the class
 * @param propertyKey - The name of the method
 * @param descriptor - The property descriptor
 */
export function LogMethod(
  target: object,                          // ✅ object en lugar de any
  propertyKey: string | symbol,            // ✅ string | symbol
  descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<unknown>>, // ✅ Tipado
) {
  const originalMethod = descriptor.value;

  if (!originalMethod) {
    throw new Error('LogMethod can only be applied to methods');
  }

  const logger = new Logger(target.constructor.name);

  descriptor.value = async function (
    ...args: unknown[]                     // ✅ unknown[] en lugar de any[]
  ): Promise<unknown> {                    // ✅ Retorno tipado
    logger.log(`Executing ${String(propertyKey)}`);
    const startTime = Date.now();

    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;
      logger.log(`${String(propertyKey)} completed in ${duration}ms`);
      return result;
    } catch (error) {
      // ✅ Type guard para error
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error';
      const errorStack = error instanceof Error
        ? error.stack
        : undefined;

      logger.error(
        `${String(propertyKey)} failed: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  };

  return descriptor;
}
```

---

### Opción 2: Versión Genérica (Más Flexible)

```typescript
// src/common/decorators/log-method.decorator.ts
import { Logger } from '@nestjs/common';

/**
 * Method decorator that logs method execution with proper typing
 */
export function LogMethod<T extends (...args: unknown[]) => Promise<unknown>>(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
): TypedPropertyDescriptor<T> {
  const originalMethod = descriptor.value;

  if (!originalMethod) {
    throw new Error('LogMethod can only be applied to methods');
  }

  const logger = new Logger(target.constructor.name);

  descriptor.value = async function (
    this: unknown,
    ...args: unknown[]
  ): Promise<unknown> {
    const methodName = String(propertyKey);
    logger.log(`Executing ${methodName}`);
    const startTime = Date.now();

    try {
      const result = await originalMethod.apply(this, args as Parameters<T>);
      const duration = Date.now() - startTime;
      logger.log(`${methodName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      logger.error(
        `${methodName} failed: ${getErrorMessage(error)}`,
        getErrorStack(error),
      );
      throw error;
    }
  } as T;

  return descriptor;
}

/**
 * Extract error message safely
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

/**
 * Extract error stack safely
 */
function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}
```

---

### Opción 3: Versión Simple con Suppress (Quick Fix)

Si quieres mantener el código simple y solo silenciar los warnings:

```typescript
// src/common/decorators/log-method.decorator.ts
import { Logger } from '@nestjs/common';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export function LogMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;
  const logger = new Logger(target.constructor.name);

  descriptor.value = async function (...args: any[]) {
    logger.log(`Executing ${propertyKey}`);
    const startTime = Date.now();

    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;
      logger.log(`${propertyKey} completed in ${duration}ms`);
      return result;
    } catch (error: any) {
      logger.error(`${propertyKey} failed: ${error?.message}`, error?.stack);
      throw error;
    }
  };

  return descriptor;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/no-unsafe-argument */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
```

---

## 📊 Comparación de Opciones

| Característica | Opción 1 (Type-Safe) | Opción 2 (Genérica) | Opción 3 (Suppress) |
|----------------|---------------------|---------------------|---------------------|
| **Type Safety** | ✅ Alta | ✅ Muy Alta | ❌ Ninguna |
| **Complejidad** | Media | Alta | Baja |
| **Mantenibilidad** | ✅ Buena | ✅ Excelente | ⚠️ Regular |
| **Lint Errors** | ✅ 0 | ✅ 0 | ⚠️ Suprimidos |
| **IntelliSense** | ✅ Funciona | ✅ Funciona mejor | ⚠️ Limitado |
| **Recomendada para** | Producción | Proyectos grandes | Quick fixes |

---

## 🎯 Recomendación

**Para este proyecto: Usar Opción 1 (Type-Safe)**

**Razones:**
1. ✅ Elimina todos los errores de lint
2. ✅ Mantiene el código legible
3. ✅ Type-safe sin ser demasiado complejo
4. ✅ Fácil de mantener
5. ✅ No necesita comentarios de supresión

---

## 🚀 Implementación Paso a Paso

### Paso 1: Reemplazar el código

```bash
# El archivo ya existe en:
# src/common/decorators/log-method.decorator.ts
```

Reemplazar con el código de la Opción 1.

---

### Paso 2: Verificar errores de lint

```bash
npm run lint
```

Debería mostrar **0 errores** en `log-method.decorator.ts`.

---

### Paso 3: Probar el decorator

```typescript
// En cualquier service
import { LogMethod } from '../common/decorators/log-method.decorator';

@Injectable()
export class PaymentsService {
  @LogMethod
  async create(dto: CreatePaymentDto) {
    // ... código
  }
}
```

---

### Paso 4: Verificar logs

Ejecutar la app y llamar al método:

```bash
npm run start:dev
```

Deberías ver logs como:
```
[PaymentsService] Executing create
[PaymentsService] create completed in 45ms
```

---

## 🔍 Explicación de los Cambios

### 1. `target: any` → `target: object`

```typescript
// ❌ Antes
target: any

// ✅ Después
target: object
```

**Por qué:**
- `any` desactiva el type checking
- `object` es suficiente porque solo necesitamos `target.constructor.name`
- Más seguro y explícito

---

### 2. `args: any[]` → `args: unknown[]`

```typescript
// ❌ Antes
async function (...args: any[])

// ✅ Después
async function (...args: unknown[]): Promise<unknown>
```

**Por qué:**
- `unknown` es más seguro que `any`
- Fuerza a hacer type checks antes de usar
- Sigue siendo flexible para cualquier tipo de argumentos

---

### 3. Type Guard para Error

```typescript
// ❌ Antes
catch (error) {
  logger.error(`${propertyKey} failed: ${error.message}`, error.stack);
}

// ✅ Después
catch (error) {
  const errorMessage = error instanceof Error
    ? error.message
    : 'Unknown error';
  const errorStack = error instanceof Error
    ? error.stack
    : undefined;

  logger.error(`${propertyKey} failed: ${errorMessage}`, errorStack);
}
```

**Por qué:**
- En TypeScript 4.4+, `error` en catch es `unknown`
- Necesitas verificar que es un `Error` antes de acceder a `.message` o `.stack`
- Maneja casos donde se lanza algo que no es un Error (ej: `throw "string"`)

---

### 4. `String(propertyKey)`

```typescript
// ❌ Antes
logger.log(`Executing ${propertyKey}`);

// ✅ Después
logger.log(`Executing ${String(propertyKey)}`);
```

**Por qué:**
- `propertyKey` puede ser `string | symbol`
- `String()` convierte símbolos correctamente
- Evita errores si alguien usa símbolos como nombres de métodos

---

## 🧪 Tests del Decorator

```typescript
// src/common/decorators/log-method.decorator.spec.ts
import { Logger } from '@nestjs/common';
import { LogMethod } from './log-method.decorator';

describe('LogMethod Decorator', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should log method execution', async () => {
    class TestService {
      @LogMethod
      async testMethod() {
        return 'success';
      }
    }

    const service = new TestService();
    await service.testMethod();

    expect(logSpy).toHaveBeenCalledWith('Executing testMethod');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('testMethod completed in'),
    );
  });

  it('should log errors', async () => {
    class TestService {
      @LogMethod
      async failingMethod() {
        throw new Error('Test error');
      }
    }

    const service = new TestService();

    await expect(service.failingMethod()).rejects.toThrow('Test error');

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('failingMethod failed: Test error'),
      expect.any(String),
    );
  });

  it('should handle non-Error throws', async () => {
    class TestService {
      @LogMethod
      async weirdMethod() {
        throw 'string error'; // eslint-disable-line @typescript-eslint/no-throw-literal
      }
    }

    const service = new TestService();

    await expect(service.weirdMethod()).rejects.toBe('string error');

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('weirdMethod failed: Unknown error'),
      undefined,
    );
  });
});
```

---

## 📝 Actualizar ESLint Config (Opcional)

Si quieres hacer las reglas más estrictas para todo el proyecto:

```javascript
// eslint.config.mjs
export default tseslint.config(
  // ... otras configs
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',        // ✅ De 'off' a 'error'
      '@typescript-eslint/no-unsafe-argument': 'error',     // ✅ De 'warn' a 'error'
      '@typescript-eslint/no-unsafe-member-access': 'warn', // ✅ Agregar esta regla
      '@typescript-eslint/no-floating-promises': 'warn',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);
```

**⚠️ Advertencia:** Esto puede generar muchos errores en el código existente. Mejor hacerlo gradualmente.

---

## 🎓 Resumen

### Errores encontrados:
1. ❌ `target: any` - Tipo inseguro
2. ❌ `args: any[]` - Argumentos inseguros
3. ❌ `error.message` - Acceso inseguro a propiedades de error

### Solución recomendada:
✅ **Opción 1 (Type-Safe)** - Balancea seguridad y simplicidad

### Próximos pasos:
1. Reemplazar código con Opción 1
2. Ejecutar `npm run lint` para verificar
3. Probar en un service
4. Opcionalmente: Agregar tests

---

**Documento creado:** 2026-02-20
**Archivo afectado:** `src/common/decorators/log-method.decorator.ts`
