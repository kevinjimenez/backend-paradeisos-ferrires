import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import { envs } from 'src/common/config/envs';

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
  await prisma.users.deleteMany();

  // USERS
  console.log('👥 Creating users...');
  const user1 = await prisma.users.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: '+123456789',
      document_number: '12345678A',
      document_type: 'dni',
    },
  });

  await prisma.users.create({
    data: {
      firstName: 'María',
      lastName: 'García',
      email: 'maria@example.com',
      phone: '+123456780',
      document_number: 'X1234567',
      document_type: 'passport',
    },
  });

  // ISLANDS & PORTS
  console.log('🏝 Creating islands & ports...');
  const mainland = await prisma.islands.create({
    data: {
      name: 'Península',
      code: 'MAIN',
      description: 'Mainland ports',
    },
  });

  const balearic = await prisma.islands.create({
    data: {
      name: 'Islas Baleares',
      code: 'BAL',
      description: 'Balearic islands',
    },
  });

  const portBarcelona = await prisma.ports.create({
    data: {
      island_id: mainland.id,
      name: 'Port de Barcelona',
      code: 'BCN',
      address: 'Barcelona, España',
      contact_phone: '+34 000000001',
    },
  });

  const portPalma = await prisma.ports.create({
    data: {
      island_id: balearic.id,
      name: 'Port de Palma',
      code: 'PMI',
      address: 'Palma de Mallorca, España',
      contact_phone: '+34 000000002',
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

  // ROUTES
  console.log('🗺 Creating routes...');
  const route1 = await prisma.routes.create({
    data: {
      origin_port_id: portBarcelona.id,
      destination_port_id: portPalma.id,
      distance_km: 200,
      duration_minutes: 480,
      base_price_resident: 50,
      base_price_national: 70,
      base_price_foreign: 90,
      is_active: true,
    },
  });

  // SCHEDULES
  console.log('📅 Creating schedules...');
  const departure = new Date();
  departure.setHours(departure.getHours() + 24);
  const arrival = new Date(departure.getTime() + 8 * 60 * 60 * 1000);

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

  // SEAT HOLDS
  console.log('⏳ Creating seat holds...');
  const hold1 = await prisma.seat_holds.create({
    data: {
      user_id: user1.id,
      schedule_id: schedule1.id,
      quantity: 2,
      status: 'held',
    },
  });

  // TICKETS
  console.log('🎫 Creating tickets...');
  const ticket1 = await prisma.tickets.create({
    data: {
      user_id: user1.id,
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
      qr_code: 'QR-BCN-PMI-001',
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
  console.log(`   - Users: ${await prisma.users.count()}`);
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
