import { PrismaPg } from '@prisma/adapter-pg';
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
            text: 'Asistencia y transporte desde el hotel al muelle principal.',
            included: true,
          },
          {
            text: 'O del muelle principal al hotel (zona urbana).',
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
  // NOTE: pier_name/port_address are placeholders for Santa Cruz, Isabela y Floreana,
  // pendientes de confirmar con el cliente. San Cristóbal viene confirmado del mockup.
  const santaCruz = await prisma.islands.create({
    data: {
      name: 'Isla Santa Cruz',
      code: 'SCX',
      description: 'Galápagos - Isla Santa Cruz',
      pier_name: 'Muelle Municipal Puerto Ayora',
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
      pier_name: 'Muelle Puerto Villamil',
      port_address: 'Puerto Villamil, Galápagos, ECU',
    },
  });

  const floreanaIsland = await prisma.islands.create({
    data: {
      name: 'Isla Floreana',
      code: 'FLO',
      description: 'Galápagos - Isla Floreana',
      pier_name: 'Muelle Puerto Velasco Ibarra',
      port_address: 'Puerto Velasco Ibarra, Galápagos, ECU',
    },
  });

  // FERRIES
  console.log('⛴ Creating ferries...');
  const ferry1 = await prisma.ferries.create({
    data: {
      name: 'Mediterráneo Express',
      register_code: 'MED-001',
      capacity: 500,
      operator_name: 'Paradeisos Ferries',
      operator_phone: '+34 111111111',
      operator_email: 'ops@paradeisos.com',
      year_built: 2015,
      amenities: ['WiFi', 'Restaurant', 'Bar'],
      status: 'active',
    },
  });

  const ferry2 = await prisma.ferries.create({
    data: {
      name: 'Paradeisos Premium',
      register_code: 'MED-002',
      capacity: 300,
      operator_name: 'Paradeisos Ferries',
      operator_phone: '+34 222222222',
      operator_email: 'premium@paradeisos.com',
      year_built: 2020,
      amenities: ['WiFi', 'Restaurant', 'VIP Lounge'],
      type: 'premium',
      status: 'active',
    },
  });

  const ferry3 = await prisma.ferries.create({
    data: {
      name: 'Paradeisos Fast',
      register_code: 'MED-003',
      capacity: 200,
      operator_name: 'Paradeisos Ferries',
      operator_phone: '+34 333333333',
      operator_email: 'fast@paradeisos.com',
      year_built: 2018,
      amenities: ['WiFi'],
      type: 'fast',
      status: 'active',
    },
  });

  // ROUTES
  console.log('🗺 Creating routes...');
  const route1 = await prisma.routes.create({
    data: {
      origin_island_id: santaCruz.id,
      destination_island_id: sanCristobal.id,
      distance_km: 95,
      duration_minutes: 150,
      base_price: 70,
      is_active: true,
    },
  });

  const route3 = await prisma.routes.create({
    data: {
      origin_island_id: santaCruz.id,
      destination_island_id: isabela.id,
      distance_km: 110,
      duration_minutes: 180,
      base_price: 60,
      is_active: true,
    },
  });

  // Rutas de vuelta (inversas)
  const route5 = await prisma.routes.create({
    data: {
      origin_island_id: sanCristobal.id,
      destination_island_id: santaCruz.id,
      distance_km: 95,
      duration_minutes: 150,
      base_price: 70,
      is_active: true,
    },
  });

  const route7 = await prisma.routes.create({
    data: {
      origin_island_id: isabela.id,
      destination_island_id: santaCruz.id,
      distance_km: 110,
      duration_minutes: 180,
      base_price: 60,
      is_active: true,
    },
  });

  // SCHEDULES
  console.log('📅 Creating schedules...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const departure = new Date(tomorrow);
  const arrival = new Date(departure.getTime() + 2.5 * 60 * 60 * 1000);

  const schedule1 = await prisma.schedules.create({
    data: {
      route_id: route1.id,
      ferry_id: ferry1.id,
      departure_date: departure,
      departure_time: departure,
      arrival_time: arrival,
      total_capacity: ferry1.capacity,
      available_seats: ferry1.capacity - 10,
      status: 'scheduled',
      notes: 'Ruta diaria de prueba',
    },
  });

  const base = new Date(tomorrow);

  const departure2 = new Date(base);
  departure2.setDate(base.getDate() + 1);
  departure2.setHours(14, 0, 0, 0);
  const arrival2 = new Date(departure2.getTime() + 2.5 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route1.id,
      ferry_id: ferry2.id,
      departure_date: departure2,
      departure_time: departure2,
      arrival_time: arrival2,
      total_capacity: ferry2.capacity,
      available_seats: ferry2.capacity - 50,
      status: 'scheduled',
      notes: 'Santa Cruz → San Cristóbal (premium) nocturno',
    },
  });

  const departure5 = new Date(base);
  departure5.setDate(base.getDate() + 4);
  departure5.setHours(9, 0, 0, 0);
  const arrival5 = new Date(departure5.getTime() + 3 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route3.id,
      ferry_id: ferry2.id,
      departure_date: departure5,
      departure_time: departure5,
      arrival_time: arrival5,
      total_capacity: ferry2.capacity,
      available_seats: ferry2.capacity - 150,
      status: 'scheduled',
      notes: 'Santa Cruz → Isabela (premium) tarde',
    },
  });

  const departure6 = new Date(base);
  departure6.setDate(base.getDate() + 5);
  departure6.setHours(13, 30, 0, 0);
  const arrival6 = new Date(departure6.getTime() + 3 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route3.id,
      ferry_id: ferry3.id,
      departure_date: departure6,
      departure_time: departure6,
      arrival_time: arrival6,
      total_capacity: ferry3.capacity,
      available_seats: ferry3.capacity - 90,
      status: 'scheduled',
      notes: 'Santa Cruz → Isabela (fast) mañana',
    },
  });

  const departure10 = new Date(base);
  departure10.setDate(base.getDate() + 9);
  departure10.setHours(11, 0, 0, 0);
  const arrival10 = new Date(departure10.getTime() + 2.5 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route1.id,
      ferry_id: ferry1.id,
      departure_date: departure10,
      departure_time: departure10,
      arrival_time: arrival10,
      total_capacity: ferry1.capacity,
      available_seats: ferry1.capacity - 30,
      status: 'scheduled',
      notes: 'Santa Cruz → San Cristóbal (normal) fin de mes',
    },
  });

  // Schedules adicionales de vuelta
  const departure11 = new Date(base);
  departure11.setDate(base.getDate() + 1);
  departure11.setHours(16, 30, 0, 0);
  const arrival11 = new Date(departure11.getTime() + 2.5 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route5.id,
      ferry_id: ferry2.id,
      departure_date: departure11,
      departure_time: departure11,
      arrival_time: arrival11,
      total_capacity: ferry2.capacity,
      available_seats: ferry2.capacity - 40,
      status: 'scheduled',
      notes: 'San Cristóbal → Santa Cruz (vuelta tarde)',
    },
  });

  const departure13 = new Date(base);
  departure13.setDate(base.getDate() + 3);
  departure13.setHours(12, 0, 0, 0);
  const arrival13 = new Date(departure13.getTime() + 3 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route7.id,
      ferry_id: ferry1.id,
      departure_date: departure13,
      departure_time: departure13,
      arrival_time: arrival13,
      total_capacity: ferry1.capacity,
      available_seats: ferry1.capacity - 100,
      status: 'scheduled',
      notes: 'Isabela → Santa Cruz (vuelta mediodía)',
    },
  });

  const departure15 = new Date(base);
  departure15.setDate(base.getDate() + 5);
  departure15.setHours(7, 0, 0, 0);
  const arrival15 = new Date(departure15.getTime() + 2.5 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route5.id,
      ferry_id: ferry1.id,
      departure_date: departure15,
      departure_time: departure15,
      arrival_time: arrival15,
      total_capacity: ferry1.capacity,
      available_seats: ferry1.capacity - 55,
      status: 'scheduled',
      notes: 'San Cristóbal → Santa Cruz (vuelta temprano)',
    },
  });

  const departure17 = new Date(base);
  departure17.setDate(base.getDate() + 7);
  departure17.setHours(10, 30, 0, 0);
  const arrival17 = new Date(departure17.getTime() + 3 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route7.id,
      ferry_id: ferry2.id,
      departure_date: departure17,
      departure_time: departure17,
      arrival_time: arrival17,
      total_capacity: ferry2.capacity,
      available_seats: ferry2.capacity - 85,
      status: 'scheduled',
      notes: 'Isabela → Santa Cruz (vuelta mañana)',
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
      booking_expires_at: new Date(departure.getTime() - 2 * 60 * 60 * 1000),
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
