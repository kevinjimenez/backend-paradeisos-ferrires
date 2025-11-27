# Database Seed - Datos de Prueba

Este archivo contiene datos de prueba para el sistema de reservas de ferry Paradeisos.

## Cómo ejecutar el seed

```bash
npm run db:seed
```

## Datos incluidos

### 👥 Usuarios (5)
- **Admin**: admin@paradeisos.com
- **Vendedor**: seller@paradeisos.com
- **Clientes**:
  - juan.perez@email.com
  - maria.garcia@email.com
  - pedro.lopez@email.com

### ⚓ Puertos (5)
- Barcelona (BCN)
- Palma de Mallorca (PMI)
- Ibiza (IBZ)
- Mahón (MAH)
- Valencia (VLC)

### ⛴️ Ferries (4)
- **Mediterráneo Express** (FAST) - 500 pasajeros, 100 vehículos
- **Balear Star** (PREMIUM) - 800 pasajeros, 150 vehículos
- **Isla Bonita** (STANDARD) - 300 pasajeros, 60 vehículos
- **Costa Azul** (FAST) - 600 pasajeros, 120 vehículos (en mantenimiento)

### 🗺️ Rutas (5)
- Barcelona ↔ Palma (8 horas)
- Valencia ↔ Ibiza (3 horas)
- Palma → Mahón (6 horas, estacional)

### 📅 Horarios y Viajes
- Múltiples horarios configurados con diferentes días de la semana
- 3 viajes programados (SCHEDULED, BOARDING)
- Diferentes fechas de salida

### 📋 Reservas (3)
- **Reserva 1**: Juan Pérez - 2 pasajeros + 1 vehículo (CONFIRMED)
- **Reserva 2**: María García - 4 pasajeros (2 adultos, 1 niño, 1 bebé) (CONFIRMED)
- **Reserva 3**: Pedro López - 3 pasajeros + 1 vehículo (PENDING)

### 💺 Asientos
- Ferry 1: 100 asientos (10 ocupados)
- Ferry 2: 100 asientos (todos libres)
- Ferry 3: 80 asientos (20 ocupados)

### 🎫 Tickets (5)
- Tickets válidos para las reservas confirmadas
- Formato: TKT-2025-XXX
- QR codes únicos

### 🔔 Notificaciones (4)
- Confirmaciones de reserva (EMAIL)
- Recordatorios de salida (SMS)
- Pagos pendientes (EMAIL)

## Estructura de precios

- Adultos: €100
- Niños: €50
- Bebés: €50
- Vehículos: €50
- Impuestos: 10% sobre subtotal
- Descuentos aplicables en algunas reservas

## Notas importantes

1. El seed **limpia toda la base de datos** antes de insertar los datos
2. Los IDs son UUID generados automáticamente
3. Las fechas de los viajes están configuradas para mañana y pasado mañana
4. Algunos asientos quedan marcados como ocupados para simular reservas existentes

## Scripts útiles adicionales

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio (visualizador de datos)
npm run prisma:studio
```

## Casos de uso que puedes probar

1. **Búsqueda de viajes**: Buscar viajes disponibles entre Barcelona y Palma
2. **Crear reserva**: Hacer una nueva reserva con los datos de ejemplo
3. **Consultar disponibilidad**: Ver asientos disponibles en un ferry
4. **Gestión de tickets**: Generar y validar tickets
5. **Notificaciones**: Enviar notificaciones a usuarios
6. **Reportes**: Generar reportes de ocupación y ventas
