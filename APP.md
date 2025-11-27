## **Módulos Clave y Responsabilidades**

### **Auth Module**
- Login/Register/Logout
- JWT token generation/validation
- Refresh tokens
- Role-based access control (RBAC)

### **Bookings Module** (Núcleo del Sistema)
- Crear reserva con lock temporal en asientos
- Agregar pasajeros y vehículos
- Calcular precios (base + promociones)
- Gestión de expiración (timeout)
- Confirmación post-pago

### **Payments Module**
- Strategy pattern para múltiples pasarelas
- Webhooks de confirmación
- Manejo de reembolsos
- Registro de transacciones

### **Trips Module**
- Búsqueda de viajes disponibles
- Filtros por fecha, ruta, horario
- Actualización de disponibilidad en tiempo real
- Gestión de estados del viaje

### **Seats Module**
- Consulta de disponibilidad por trip
- Bloqueo temporal durante reserva
- Liberación automática de locks expirados

### **Notifications Module**
- Queue-based con Bull
- Templates de emails con Handlebars
- Envío asíncrono (no bloquea flujo)

## **Flujo Principal: Proceso de Compra**
```
1. Cliente busca viajes
   ├─> GET /api/trips/search?origin=1&destination=2&date=2024-12-01
   └─> TripsService.searchAvailableTrips()

2. Cliente selecciona trip y asientos
   ├─> POST /api/bookings
   ├─> BookingsService.createBooking()
   ├─> SeatsService.lockSeats(tripId, seatIds) ← Lock por 5 min
   └─> Booking creado con status='pending'

3. Cliente procesa pago
   ├─> POST /api/payments
   ├─> PaymentsService.processPayment()
   ├─> Stripe/PayPal webhook confirma
   └─> BookingsService.confirmBooking()

4. Sistema genera tickets
   ├─> TicketsService.generateTickets()
   ├─> QR codes generados
   └─> NotificationsService.sendConfirmation()

5. Job libera bookings expirados
   └─> @Cron('*/1 * * * *') releaseExpiredBookings()