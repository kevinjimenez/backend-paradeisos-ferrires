import { PrismaPg } from '@prisma/adapter-pg';
import { DateUtil } from '../common/utils/date.util';
import { envs } from '../common/config/envs';
import { PrismaClient } from './generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: envs.databaseUrl,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database (in reverse order of dependencies)
  console.log('🧹 Cleaning database...');

  await prisma.passenger_extras.deleteMany();
  await prisma.passengers.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.tickets.deleteMany();
  await prisma.seat_holds.deleteMany();
  await prisma.schedules.deleteMany();
  await prisma.schedule_templates.deleteMany();
  await prisma.routes.deleteMany();
  await prisma.ferries.deleteMany();
  await prisma.islands.deleteMany();
  await prisma.contacts.deleteMany();
  await prisma.catalogs.deleteMany();
  await prisma.fare_extras.deleteMany();
  await prisma.fares.deleteMany();

  // FARES
  console.log('🎫 Creating fares...');
  const fareLight = await prisma.fares.create({
    data: {
      name: 'Básico',
      price: 0,
      description: 'Tarifa Básico - equipaje de mano incluido',
      variant: 'secondary',
      features: [
        { text: 'Maleta de mano (5kg)', included: true },
        { text: 'Maleta de 23kg', included: true },
        { text: 'Maleta de 10kg', included: false },
        {
          text: 'Cambio de fecha o ruta u hora',
          included: false,
          description: '48 horas antes de fecha de salida',
        },
        {
          text: 'Equipaje extra',
          included: false,
          description:
            'Tabla de surf, caja de herramientas, equipos de buceo, otros.',
        },
        {
          text: 'Reembolso 0%',
          included: false,
          description: 'Solo precio ticket ferry',
        },
      ],
    },
  });
  const fareBasic = await prisma.fares.create({
    data: {
      name: 'Light',
      price: 40,
      description: 'Tarifa Light - equipaje de mano + 1 maleta',
      variant: 'primary',
      features: [
        { text: 'Maleta de mano (5kg)', included: true },
        { text: 'Maleta de 23kg', included: true },
        { text: 'Maleta de 10kg', included: true },
        {
          text: 'Cambio de fecha o ruta u hora',
          included: true,
          description: '48 horas antes de fecha de salida',
        },
        {
          text: 'Equipaje extra',
          included: false,
          description:
            'Tabla de surf, caja de herramientas, equipos de buceo, otros.',
        },
        {
          text: 'Reembolso 50%',
          included: false,
          description: 'Solo precio ticket ferry',
        },
      ],
    },
  });
  const farePlus = await prisma.fares.create({
    data: {
      name: 'Plus',
      price: 80,
      description: 'Tarifa Plus - equipaje completo + prioridad',
      variant: 'primary',
      features: [
        { text: 'Maleta de mano (5kg)', included: true },
        { text: 'Maleta de 23kg', included: true },
        { text: 'Maleta de 10kg', included: true },
        {
          text: 'Cambio de fecha o ruta u hora',
          included: true,
          description: '48 horas antes de fecha de salida',
        },
        {
          text: 'Equipaje extra',
          included: true,
          description:
            'Tabla de surf, caja de herramientas, equipos de buceo, otros.',
        },
        {
          text: 'Reembolso 100%',
          included: true,
          description: 'Solo precio ticket ferry',
        },
      ],
    },
  });

  // FARE EXTRAS
  console.log('➕ Creating fare extras...');
  await prisma.fare_extras.createMany({
    data: [
      {
        name: 'Asistencia Muelle / Hotel',
        code: 'BAGGAGE_23',
        price: 20,
        description: 'Servicio compartido en el trayecto',
        features: [
          {
            text: 'Asistencia y transporte desde el Hotel hacia el muelle principal',
            included: true,
          },
          {
            text: 'O asistencia y transporte desde el muelle principal hacia el hotel',
            included: true,
          },
        ],
      },
      {
        name: 'Custodio de equipaje',
        code: 'BAGGAGE_32',
        price: 12,
        description: 'Hasta 12 horas en oficina de Paradeisos.',
        features: [
          {
            text: '1 equipaje de 5kg · 1 de 10kg · 1 de 23kg.',
            included: true,
          },
          {
            text: 'Registra tu equipaje en la oficina de Paradeisos Ferries.',
            included: true,
          },
        ],
      },
    ],
  });

  // CATALOGS
  console.log('📋 Creating catalogs...');
  await prisma.catalogs.createMany({
    data: [
      {
        category: 'DOC_TYPE',
        code: 'DNI',
        description: 'DNI',
        is_active: true,
      },
      {
        category: 'DOC_TYPE',
        code: 'RUC',
        description: 'RUC',
        is_active: true,
      },
      {
        category: 'DOC_TYPE',
        code: 'PASS',
        description: 'Pasaporte',
        is_active: true,
      },
      // Países
      {
        category: 'COUNTRY',
        code: 'EC',
        description: 'Ecuador',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'US',
        description: 'Estados Unidos',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'CA',
        description: 'Canadá',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'MX',
        description: 'México',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'ES',
        description: 'España',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'FR',
        description: 'Francia',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'DE',
        description: 'Alemania',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'IT',
        description: 'Italia',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'GB',
        description: 'Reino Unido',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'BR',
        description: 'Brasil',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'AR',
        description: 'Argentina',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'CO',
        description: 'Colombia',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'PE',
        description: 'Perú',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'CL',
        description: 'Chile',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'AU',
        description: 'Australia',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'CN',
        description: 'China',
        is_active: true,
      },
      {
        category: 'COUNTRY',
        code: 'JP',
        description: 'Japón',
        is_active: true,
      },
      {
        category: 'PASSENGER_COUNT',
        code: '1',
        description: '10',
        is_active: true,
      },
    ],
  });

  // CONTACTS
  console.log('👥 Creating contacts...');
  const contact1 = await prisma.contacts.create({
    data: {
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      phone: '+123456789',
      document_number: '12345678A',
      document_type: 'dni',
    },
  });

  await prisma.contacts.create({
    data: {
      first_name: 'María',
      last_name: 'García',
      email: 'maria@example.com',
      phone: '+123456780',
      document_number: 'X1234567',
      document_type: 'passport',
    },
  });

  // ISLANDS
  console.log('🏝 Creating islands...');
  const santaCruz = await prisma.islands.create({
    data: {
      name: 'Isla Santa Cruz',
      code: 'SCX',
      description: 'Galápagos - Isla Santa Cruz',
      pier_name: 'Muelle Turístico Gus Angermeyer',
      port_address: 'Puerto Ayora, Galápagos, ECU',
    },
  });

  const sanCristobal = await prisma.islands.create({
    data: {
      name: 'Isla San Cristóbal',
      code: 'SCY',
      description: 'Galápagos - Isla San Cristóbal',
      pier_name: 'Muelle Eco Turístico Tiburón Martillo',
      port_address: 'Puerto Baquerizo Moreno, Galápagos, ECU',
    },
  });

  const isabela = await prisma.islands.create({
    data: {
      name: 'Isla Isabela',
      code: 'ISA',
      description: 'Galápagos - Isla Isabela',
      pier_name: 'Muelle de Puerto Villamil',
      port_address: 'Puerto Villamil, Galápagos, ECU',
    },
  });

  const floreanaIsland = await prisma.islands.create({
    data: {
      name: 'Isla Floreana',
      code: 'FLO',
      description: 'Galápagos - Isla Floreana',
      pier_name: 'Muelle Rolf Wittmer',
      port_address: 'Puerto Velasco Ibarra, Galápagos, ECU',
    },
  });

  // FERRIES
  // Solo existe una embarcación: Paradeisos Ferry, opera todas las rutas.
  console.log('⛴ Creating ferries...');
  const ferry1 = await prisma.ferries.create({
    data: {
      name: 'Paradeisos Ferry',
      register_code: 'PDS-001',
      capacity: 50,
      operator_name: 'Paradeisos Ferries',
      operator_phone: '+593 999999999',
      operator_email: 'ops@paradeisos.com',
      year_built: 2020,
      amenities: ['WiFi', 'Restaurant'],
      status: 'active',
    },
  });

  // ROUTES
  // Santa Cruz es el hub: no hay rutas directas entre San Cristóbal, Isabela
  // y Floreana entre sí. Tarifa plana $65 (nacionales y extranjeros).
  console.log('🗺 Creating routes...');
  const route1 = await prisma.routes.create({
    data: {
      origin_island_id: santaCruz.id,
      destination_island_id: sanCristobal.id,
      distance_km: 95,
      duration_minutes: 120,
      base_price: 65,
      is_active: true,
    },
  });

  const route3 = await prisma.routes.create({
    data: {
      origin_island_id: santaCruz.id,
      destination_island_id: isabela.id,
      distance_km: 110,
      duration_minutes: 120,
      base_price: 65,
      is_active: true,
    },
  });

  // Rutas de vuelta (inversas)
  const route5 = await prisma.routes.create({
    data: {
      origin_island_id: sanCristobal.id,
      destination_island_id: santaCruz.id,
      distance_km: 95,
      duration_minutes: 120,
      base_price: 65,
      is_active: true,
    },
  });

  const route7 = await prisma.routes.create({
    data: {
      origin_island_id: isabela.id,
      destination_island_id: santaCruz.id,
      distance_km: 110,
      duration_minutes: 120,
      base_price: 65,
      is_active: true,
    },
  });

  // Floreana: solo 1 horario activo por sentido (ver SCHEDULES más abajo)
  const route9 = await prisma.routes.create({
    data: {
      origin_island_id: santaCruz.id,
      destination_island_id: floreanaIsland.id,
      distance_km: 70,
      duration_minutes: 120,
      base_price: 65,
      is_active: true,
    },
  });

  const route10 = await prisma.routes.create({
    data: {
      origin_island_id: floreanaIsland.id,
      destination_island_id: santaCruz.id,
      distance_km: 70,
      duration_minutes: 120,
      base_price: 65,
      is_active: true,
    },
  });

  // SCHEDULE TEMPLATES
  // Horario fijo diario por isla, según las rutas asignadas. Los horarios sin
  // servicio real (Floreana 15:00→17:00 salida y 08:00→10:00 regreso) se dejan
  // bloqueados: simplemente no se crea el template para esa franja. Las filas
  // concretas de `schedules` las genera la app al arrancar/cada noche
  // (ver ScheduleGeneratorService en src/tasks), no el seed.
  console.log('🗓 Creating schedule templates...');
  await prisma.schedule_templates.createMany({
    data: [
      {
        route_id: route1.id,
        ferry_id: ferry1.id,
        departure_hour: 7,
        departure_minute: 0,
        notes: 'Santa Cruz → San Cristóbal',
      },
      {
        route_id: route1.id,
        ferry_id: ferry1.id,
        departure_hour: 15,
        departure_minute: 0,
        notes: 'Santa Cruz → San Cristóbal',
      },
      {
        route_id: route5.id,
        ferry_id: ferry1.id,
        departure_hour: 7,
        departure_minute: 0,
        notes: 'San Cristóbal → Santa Cruz',
      },
      {
        route_id: route5.id,
        ferry_id: ferry1.id,
        departure_hour: 15,
        departure_minute: 0,
        notes: 'San Cristóbal → Santa Cruz',
      },
      {
        route_id: route3.id,
        ferry_id: ferry1.id,
        departure_hour: 7,
        departure_minute: 0,
        notes: 'Santa Cruz → Isabela',
      },
      {
        route_id: route3.id,
        ferry_id: ferry1.id,
        departure_hour: 15,
        departure_minute: 0,
        notes: 'Santa Cruz → Isabela',
      },
      {
        route_id: route7.id,
        ferry_id: ferry1.id,
        departure_hour: 6,
        departure_minute: 0,
        notes: 'Isabela → Santa Cruz',
      },
      {
        route_id: route7.id,
        ferry_id: ferry1.id,
        departure_hour: 15,
        departure_minute: 0,
        notes: 'Isabela → Santa Cruz',
      },
      {
        route_id: route9.id,
        ferry_id: ferry1.id,
        departure_hour: 8,
        departure_minute: 0,
        notes: 'Santa Cruz → Floreana',
      },
      {
        route_id: route10.id,
        ferry_id: ferry1.id,
        departure_hour: 15,
        departure_minute: 0,
        notes: 'Floreana → Santa Cruz',
      },
    ],
  });

  // SCHEDULES
  // Un solo schedule manual solo para poder crear el ticket/hold/pago de
  // ejemplo sin depender de que la app ya haya arrancado y generado los
  // horarios reales. Se liga al template Santa Cruz → San Cristóbal 07:00
  // para que el generador lo detecte como ya generado en esa fecha y no
  // cree una fila duplicada para la misma ruta/hora.
  console.log('📅 Creating schedules...');
  const route1MorningTemplate =
    await prisma.schedule_templates.findFirstOrThrow({
      where: { route_id: route1.id, departure_hour: 7, departure_minute: 0 },
    });

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = DateUtil.toGalapagosInstant(
    tomorrowDate.getFullYear(),
    tomorrowDate.getMonth(),
    tomorrowDate.getDate(),
    7,
    0,
  );
  const arrival = new Date(tomorrow.getTime() + 120 * 60 * 1000);

  const schedule1 = await prisma.schedules.create({
    data: {
      route_id: route1.id,
      ferry_id: ferry1.id,
      schedule_template_id: route1MorningTemplate.id,
      departure_date: tomorrow,
      departure_time: tomorrow,
      arrival_time: arrival,
      total_capacity: ferry1.capacity,
      available_seats: ferry1.capacity - 10,
      status: 'scheduled',
      notes: 'Schedule de ejemplo para el ticket de prueba del seed',
    },
  });

  // SEAT HOLDS
  console.log('⏳ Creating seat holds...');
  const hold1 = await prisma.seat_holds.create({
    data: {
      contact_id: contact1.id,
      schedule_id: schedule1.id,
      quantity: 2,
      status: 'held',
    },
  });

  // TICKETS
  console.log('🎫 Creating tickets...');
  const ticket1 = await prisma.tickets.create({
    data: {
      contacts_id: contact1.id,
      outbound_schedule_id: schedule1.id,
      ticket_code: 'TKT-2025-001',
      trip_type: 'one_way',
      total_passengers: 2,
      subtotal: 100,
      taxes: 10,
      service_fee: 0,
      discount: 0,
      total: 110,
      currency: 'USD',
      qr_code: 'QR-AYO-BQM-001',
      status: 'confirmed',
      booking_expires_at: new Date(
        schedule1.departure_time.getTime() - 2 * 60 * 60 * 1000,
      ),
      outbound_hold_id: hold1.id,
    },
  });

  // PASSENGERS
  console.log('👤 Creating passengers...');
  await prisma.passengers.createMany({
    data: [
      {
        ticket_id: ticket1.id,
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@example.com',
        phone: '+123456789',
        document_number: '12345678A',
        date_of_birth: new Date('1990-05-14'),
        unit_price: 85, // base 50 + fare basic 35
        outbound_fare_id: fareBasic.id,
        is_primary: true,
        checked_in_outbound: false,
        checked_in_return: false,
        document_type: 'dni',
      },
      {
        ticket_id: ticket1.id,
        first_name: 'Ana',
        last_name: 'Pérez',
        email: 'ana@example.com',
        phone: '+123456780',
        document_number: 'X1234567',
        date_of_birth: new Date('2021-09-02'),
        unit_price: 125, // base 90 + fare basic 35
        outbound_fare_id: fareLight.id,
        is_primary: false,
        checked_in_outbound: false,
        checked_in_return: false,
        document_type: 'passport',
      },
    ],
  });

  // PAYMENTS
  console.log('💳 Creating payments...');
  await prisma.payments.create({
    data: {
      ticket_id: ticket1.id,
      payment_provider: 'demo',
      provider_transaction_id: 'TX-001',
      amount: 110,
      currency: 'USD',
      payment_method: 'credit_card',
      status: 'completed',
      attempts: 1,
      paid_at: new Date(),
      ip_address: '127.0.0.1',
      user_agent: 'seed-script',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Contacts: ${await prisma.contacts.count()}`);
  console.log(`   - Islands: ${await prisma.islands.count()}`);
  console.log(`   - Ferries: ${await prisma.ferries.count()}`);
  console.log(`   - Routes: ${await prisma.routes.count()}`);
  console.log(`   - Schedules: ${await prisma.schedules.count()}`);
  console.log(`   - Seat holds: ${await prisma.seat_holds.count()}`);
  console.log(`   - Tickets: ${await prisma.tickets.count()}`);
  console.log(`   - Passengers: ${await prisma.passengers.count()}`);
  console.log(`   - Payments: ${await prisma.payments.count()}`);
  console.log(`   - Fares: ${await prisma.fares.count()}`);
  console.log(`   - Fare extras: ${await prisma.fare_extras.count()}`);
}

main()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error('❌ Error during seed:', error.message);
    } else {
      console.error('❌ Error during seed: Unknown error');
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
