import { PrismaPg } from '@prisma/adapter-pg';
import { envs } from './../common/config/envs';
import { PrismaClient } from './generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: envs.databaseUrl,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database (in reverse order of dependencies)
  console.log('🧹 Cleaning database...');

  await prisma.passengers.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.tickets.deleteMany();
  await prisma.seat_holds.deleteMany();
  await prisma.schedules.deleteMany();
  await prisma.routes.deleteMany();
  await prisma.ferries.deleteMany();
  await prisma.ports.deleteMany();
  await prisma.islands.deleteMany();
  await prisma.contacts.deleteMany();

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

  // ISLANDS & PORTS
  console.log('🏝 Creating islands & ports...');
  const santaCruz = await prisma.islands.create({
    data: {
      name: 'Santa Cruz',
      code: 'SCZ',
      description: 'Galápagos - Santa Cruz',
    },
  });

  const sanCristobal = await prisma.islands.create({
    data: {
      name: 'San Cristóbal',
      code: 'SCB',
      description: 'Galápagos - San Cristóbal',
    },
  });

  const isabela = await prisma.islands.create({
    data: {
      name: 'Isabela',
      code: 'ISB',
      description: 'Galápagos - Isabela',
    },
  });

  const baltraIsland = await prisma.islands.create({
    data: {
      name: 'Baltra',
      code: 'BLT',
      description: 'Galápagos - Baltra',
    },
  });

  const portAyora = await prisma.ports.create({
    data: {
      island_id: santaCruz.id,
      name: 'Puerto Ayora',
      code: 'AYO',
      address: 'Santa Cruz, Galápagos, Ecuador',
      contact_phone: '+593 000000001',
    },
  });

  const portBaquerizo = await prisma.ports.create({
    data: {
      island_id: sanCristobal.id,
      name: 'Puerto Baquerizo Moreno',
      code: 'BQM',
      address: 'San Cristóbal, Galápagos, Ecuador',
      contact_phone: '+593 000000002',
    },
  });

  const portVillamil = await prisma.ports.create({
    data: {
      island_id: isabela.id,
      name: 'Puerto Villamil',
      code: 'VIL',
      address: 'Isabela, Galápagos, Ecuador',
      contact_phone: '+593 000000003',
    },
  });

  const portBaltra = await prisma.ports.create({
    data: {
      island_id: baltraIsland.id,
      name: 'Baltra',
      code: 'BTR',
      address: 'Baltra, Galápagos, Ecuador',
      contact_phone: '+593 000000004',
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
      origin_port_id: portAyora.id,
      destination_port_id: portBaquerizo.id,
      distance_km: 95,
      duration_minutes: 150,
      base_price_resident: 50,
      base_price_national: 70,
      base_price_foreign: 90,
      is_active: true,
    },
  });

  const route2 = await prisma.routes.create({
    data: {
      origin_port_id: portBaltra.id,
      destination_port_id: portAyora.id,
      distance_km: 30,
      duration_minutes: 60,
      base_price_resident: 45,
      base_price_national: 65,
      base_price_foreign: 85,
      is_active: true,
    },
  });

  const route3 = await prisma.routes.create({
    data: {
      origin_port_id: portAyora.id,
      destination_port_id: portVillamil.id,
      distance_km: 110,
      duration_minutes: 180,
      base_price_resident: 40,
      base_price_national: 60,
      base_price_foreign: 80,
      is_active: true,
    },
  });

  const route4 = await prisma.routes.create({
    data: {
      origin_port_id: portBaquerizo.id,
      destination_port_id: portBaltra.id,
      distance_km: 60,
      duration_minutes: 120,
      base_price_resident: 50,
      base_price_national: 70,
      base_price_foreign: 90,
      is_active: true,
    },
  });

  // Rutas de vuelta (inversas)
  const route5 = await prisma.routes.create({
    data: {
      origin_port_id: portBaquerizo.id,
      destination_port_id: portAyora.id,
      distance_km: 95,
      duration_minutes: 150,
      base_price_resident: 50,
      base_price_national: 70,
      base_price_foreign: 90,
      is_active: true,
    },
  });

  const route6 = await prisma.routes.create({
    data: {
      origin_port_id: portAyora.id,
      destination_port_id: portBaltra.id,
      distance_km: 30,
      duration_minutes: 60,
      base_price_resident: 45,
      base_price_national: 65,
      base_price_foreign: 85,
      is_active: true,
    },
  });

  const route7 = await prisma.routes.create({
    data: {
      origin_port_id: portVillamil.id,
      destination_port_id: portAyora.id,
      distance_km: 110,
      duration_minutes: 180,
      base_price_resident: 40,
      base_price_national: 60,
      base_price_foreign: 80,
      is_active: true,
    },
  });

  const route8 = await prisma.routes.create({
    data: {
      origin_port_id: portBaltra.id,
      destination_port_id: portBaquerizo.id,
      distance_km: 60,
      duration_minutes: 120,
      base_price_resident: 50,
      base_price_national: 70,
      base_price_foreign: 90,
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
      notes: 'Puerto Ayora → Puerto Baquerizo Moreno (premium) nocturno',
    },
  });

  const departure3 = new Date(base);
  departure3.setDate(base.getDate() + 2);
  departure3.setHours(7, 30, 0, 0);
  const arrival3 = new Date(departure3.getTime() + 1 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route2.id,
      ferry_id: ferry3.id,
      departure_date: departure3,
      departure_time: departure3,
      arrival_time: arrival3,
      total_capacity: ferry3.capacity,
      available_seats: ferry3.capacity - 80,
      status: 'scheduled',
      notes: 'Baltra → Puerto Ayora (fast) diurno',
    },
  });

  const departure4 = new Date(base);
  departure4.setDate(base.getDate() + 3);
  departure4.setHours(15, 0, 0, 0);
  const arrival4 = new Date(departure4.getTime() + 1 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route2.id,
      ferry_id: ferry1.id,
      departure_date: departure4,
      departure_time: departure4,
      arrival_time: arrival4,
      total_capacity: ferry1.capacity,
      available_seats: ferry1.capacity - 120,
      status: 'scheduled',
      notes: 'Baltra → Puerto Ayora (normal) fin de semana',
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
      notes: 'Puerto Ayora → Puerto Villamil (premium) tarde',
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
      notes: 'Puerto Ayora → Puerto Villamil (fast) mañana',
    },
  });

  const departure7 = new Date(base);
  departure7.setDate(base.getDate() + 6);
  departure7.setHours(10, 0, 0, 0);
  const arrival7 = new Date(departure7.getTime() + 2 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route4.id,
      ferry_id: ferry1.id,
      departure_date: departure7,
      departure_time: departure7,
      arrival_time: arrival7,
      total_capacity: ferry1.capacity,
      available_seats: ferry1.capacity - 200,
      status: 'scheduled',
      notes: 'Puerto Baquerizo Moreno → Baltra (normal) diurno',
    },
  });

  const departure8 = new Date(base);
  departure8.setDate(base.getDate() + 7);
  departure8.setHours(18, 0, 0, 0);
  const arrival8 = new Date(departure8.getTime() + 2 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route4.id,
      ferry_id: ferry2.id,
      departure_date: departure8,
      departure_time: departure8,
      arrival_time: arrival8,
      total_capacity: ferry2.capacity,
      available_seats: ferry2.capacity - 80,
      status: 'scheduled',
      notes: 'Puerto Baquerizo Moreno → Baltra (premium) noche',
    },
  });

  const departure9 = new Date(base);
  departure9.setDate(base.getDate() + 8);
  departure9.setHours(6, 30, 0, 0);
  const arrival9 = new Date(departure9.getTime() + 1 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route2.id,
      ferry_id: ferry3.id,
      departure_date: departure9,
      departure_time: departure9,
      arrival_time: arrival9,
      total_capacity: ferry3.capacity,
      available_seats: ferry3.capacity - 50,
      status: 'scheduled',
      notes: 'Baltra → Puerto Ayora (fast) especial',
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
      notes: 'Puerto Ayora → Puerto Baquerizo Moreno (normal) fin de mes',
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
      notes: 'Puerto Baquerizo Moreno → Puerto Ayora (vuelta tarde)',
    },
  });

  const departure12 = new Date(base);
  departure12.setDate(base.getDate() + 2);
  departure12.setHours(9, 30, 0, 0);
  const arrival12 = new Date(departure12.getTime() + 1 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route6.id,
      ferry_id: ferry3.id,
      departure_date: departure12,
      departure_time: departure12,
      arrival_time: arrival12,
      total_capacity: ferry3.capacity,
      available_seats: ferry3.capacity - 60,
      status: 'scheduled',
      notes: 'Puerto Ayora → Baltra (vuelta mañana)',
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
      notes: 'Puerto Villamil → Puerto Ayora (vuelta mediodía)',
    },
  });

  const departure14 = new Date(base);
  departure14.setDate(base.getDate() + 4);
  departure14.setHours(14, 30, 0, 0);
  const arrival14 = new Date(departure14.getTime() + 2 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route8.id,
      ferry_id: ferry2.id,
      departure_date: departure14,
      departure_time: departure14,
      arrival_time: arrival14,
      total_capacity: ferry2.capacity,
      available_seats: ferry2.capacity - 70,
      status: 'scheduled',
      notes: 'Baltra → Puerto Baquerizo Moreno (vuelta tarde)',
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
      notes: 'Puerto Baquerizo Moreno → Puerto Ayora (vuelta temprano)',
    },
  });

  const departure16 = new Date(base);
  departure16.setDate(base.getDate() + 6);
  departure16.setHours(16, 0, 0, 0);
  const arrival16 = new Date(departure16.getTime() + 1 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route6.id,
      ferry_id: ferry3.id,
      departure_date: departure16,
      departure_time: departure16,
      arrival_time: arrival16,
      total_capacity: ferry3.capacity,
      available_seats: ferry3.capacity - 45,
      status: 'scheduled',
      notes: 'Puerto Ayora → Baltra (vuelta tarde)',
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
      notes: 'Puerto Villamil → Puerto Ayora (vuelta mañana)',
    },
  });

  const departure18 = new Date(base);
  departure18.setDate(base.getDate() + 8);
  departure18.setHours(17, 30, 0, 0);
  const arrival18 = new Date(departure18.getTime() + 2 * 60 * 60 * 1000);
  await prisma.schedules.create({
    data: {
      route_id: route8.id,
      ferry_id: ferry1.id,
      departure_date: departure18,
      departure_time: departure18,
      arrival_time: arrival18,
      total_capacity: ferry1.capacity,
      available_seats: ferry1.capacity - 110,
      status: 'scheduled',
      notes: 'Baltra → Puerto Baquerizo Moreno (vuelta noche)',
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
        unit_price: 55,
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
        unit_price: 55,
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
  console.log(`   - Ports: ${await prisma.ports.count()}`);
  console.log(`   - Ferries: ${await prisma.ferries.count()}`);
  console.log(`   - Routes: ${await prisma.routes.count()}`);
  console.log(`   - Schedules: ${await prisma.schedules.count()}`);
  console.log(`   - Seat holds: ${await prisma.seat_holds.count()}`);
  console.log(`   - Tickets: ${await prisma.tickets.count()}`);
  console.log(`   - Passengers: ${await prisma.passengers.count()}`);
  console.log(`   - Payments: ${await prisma.payments.count()}`);
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
