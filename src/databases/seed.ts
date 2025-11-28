/* eslint-disable @typescript-eslint/no-unused-vars */
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
  await prisma.notifications.deleteMany();
  await prisma.tickets.deleteMany();
  await prisma.booking_vehicles.deleteMany();
  await prisma.booking_passengers.deleteMany();
  await prisma.bookings.deleteMany();
  await prisma.seats.deleteMany();
  await prisma.seat_configurations.deleteMany();
  await prisma.trips.deleteMany();
  await prisma.schedules.deleteMany();
  await prisma.routes.deleteMany();
  await prisma.ports.deleteMany();
  await prisma.ferries.deleteMany();
  await prisma.users.deleteMany();

  // Create Users
  console.log('👥 Creating users...');
  await prisma.users.create({
    data: {
      email: 'admin@paradeisos.com',
      firstName: 'Admin',
      lastName: 'System',
      phone: '+1234567890',
      role: 'ADMIN',
    },
  });

  await prisma.users.create({
    data: {
      email: 'seller@paradeisos.com',
      firstName: 'Carlos',
      lastName: 'Vendedor',
      phone: '+1234567891',
      role: 'SELLER',
    },
  });

  const customer1 = await prisma.users.create({
    data: {
      email: 'juan.perez@email.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+1234567892',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.users.create({
    data: {
      email: 'maria.garcia@email.com',
      firstName: 'María',
      lastName: 'García',
      phone: '+1234567893',
      role: 'CUSTOMER',
    },
  });

  const customer3 = await prisma.users.create({
    data: {
      email: 'pedro.lopez@email.com',
      firstName: 'Pedro',
      lastName: 'López',
      phone: '+1234567894',
      role: 'CUSTOMER',
    },
  });

  // Create Ports
  console.log('⚓ Creating ports...');
  const portBarcelona = await prisma.ports.create({
    data: {
      name: 'Port de Barcelona',
      code: 'BCN',
      city: 'Barcelona',
      role: 'CUSTOMER',
    },
  });

  const portPalma = await prisma.ports.create({
    data: {
      name: 'Port de Palma',
      code: 'PMI',
      city: 'Palma de Mallorca',
      role: 'CUSTOMER',
    },
  });

  const portIbiza = await prisma.ports.create({
    data: {
      name: "Port d'Eivissa",
      code: 'IBZ',
      city: 'Ibiza',
      role: 'CUSTOMER',
    },
  });

  const portMahon = await prisma.ports.create({
    data: {
      name: 'Port de Maó',
      code: 'MAH',
      city: 'Mahón',
      role: 'CUSTOMER',
    },
  });

  const portValencia = await prisma.ports.create({
    data: {
      name: 'Port de València',
      code: 'VLC',
      city: 'Valencia',
      role: 'CUSTOMER',
    },
  });

  // Create Ferries
  console.log('⛴️  Creating ferries...');
  const ferry1 = await prisma.ferries.create({
    data: {
      name: 'Mediterráneo Express',
      code: 'MED-001',
      total_passenger_capacity: 500,
      total_vehicle_capacity: 100,
      amenities: [
        'WiFi',
        'Restaurant',
        'Bar',
        'Shops',
        'Cinema',
        'Air Conditioning',
      ],
      type: 'FAST',
      status: 'ACTIVE',
    },
  });

  const ferry2 = await prisma.ferries.create({
    data: {
      name: 'Balear Star',
      code: 'BAL-002',
      total_passenger_capacity: 800,
      total_vehicle_capacity: 150,
      amenities: [
        'WiFi',
        'Restaurant',
        'Bar',
        'Shops',
        'Swimming Pool',
        'Casino',
        'Cabins',
      ],
      type: 'PREMIUM',
      status: 'ACTIVE',
    },
  });

  const ferry3 = await prisma.ferries.create({
    data: {
      name: 'Isla Bonita',
      code: 'ISL-003',
      total_passenger_capacity: 300,
      total_vehicle_capacity: 60,
      amenities: ['WiFi', 'Cafeteria', 'Air Conditioning'],
      type: 'STANDARD',
      status: 'ACTIVE',
    },
  });

  await prisma.ferries.create({
    data: {
      name: 'Costa Azul',
      code: 'CST-004',
      total_passenger_capacity: 600,
      total_vehicle_capacity: 120,
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Duty Free', 'Kids Area'],
      type: 'FAST',
      status: 'MAINTENANCE',
    },
  });

  // Create Routes
  console.log('🗺️  Creating routes...');
  const route1 = await prisma.routes.create({
    data: {
      origin_port_id: portBarcelona.id,
      destination_port_id: portPalma.id,
      estimated_duration_minutes: 480, // 8 hours
      status: 'ACTIVE',
    },
  });

  await prisma.routes.create({
    data: {
      origin_port_id: portPalma.id,
      destination_port_id: portBarcelona.id,
      estimated_duration_minutes: 480,
      status: 'ACTIVE',
    },
  });

  const route3 = await prisma.routes.create({
    data: {
      origin_port_id: portValencia.id,
      destination_port_id: portIbiza.id,
      estimated_duration_minutes: 180, // 3 hours
      status: 'ACTIVE',
    },
  });

  await prisma.routes.create({
    data: {
      origin_port_id: portIbiza.id,
      destination_port_id: portValencia.id,
      estimated_duration_minutes: 180,
      status: 'ACTIVE',
    },
  });

  await prisma.routes.create({
    data: {
      origin_port_id: portPalma.id,
      destination_port_id: portMahon.id,
      estimated_duration_minutes: 360, // 6 hours
      status: 'SEASONAL',
    },
  });

  // Create Schedules
  console.log('📅 Creating schedules...');
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const validFrom = new Date(now);
  validFrom.setMonth(validFrom.getMonth() - 1);

  const validUntil = new Date(now);
  validUntil.setMonth(validUntil.getMonth() + 6);

  const schedule1 = await prisma.schedules.create({
    data: {
      routes_id: route1.id,
      ferries_id: ferry1.id,
      departure_time: new Date('2025-01-01T08:00:00Z'),
      arrival_time: new Date('2025-01-01T16:00:00Z'),
      days_of_week: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      valid_from: validFrom,
      valid_until: validUntil,
      status: 'ACTIVE',
    },
  });

  const schedule2 = await prisma.schedules.create({
    data: {
      routes_id: route1.id,
      ferries_id: ferry2.id,
      departure_time: new Date('2025-01-01T22:00:00Z'),
      arrival_time: new Date('2025-01-02T06:00:00Z'),
      days_of_week: ['Tuesday', 'Thursday', 'Saturday'],
      valid_from: validFrom,
      valid_until: validUntil,
      status: 'ACTIVE',
    },
  });

  const schedule3 = await prisma.schedules.create({
    data: {
      routes_id: route3.id,
      ferries_id: ferry3.id,
      departure_time: new Date('2025-01-01T10:00:00Z'),
      arrival_time: new Date('2025-01-01T13:00:00Z'),
      days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      valid_from: validFrom,
      valid_until: validUntil,
      status: 'ACTIVE',
    },
  });

  // Create Seat Configurations
  console.log('💺 Creating seat configurations...');
  const seatConfig1 = await prisma.seat_configurations.create({
    data: {
      ferries_id: ferry1.id,
      total_seats: 500,
    },
  });

  const seatConfig2 = await prisma.seat_configurations.create({
    data: {
      ferries_id: ferry2.id,
      total_seats: 800,
    },
  });

  const seatConfig3 = await prisma.seat_configurations.create({
    data: {
      ferries_id: ferry3.id,
      total_seats: 300,
    },
  });

  // Create Seats for Ferry 1 (500 seats)
  console.log('🪑 Creating seats for ferries...');
  const seatsData1 = Array.from({ length: 100 }, (_, i) => ({
    seat_configurations_id: seatConfig1.id,
    is_free: i >= 10, // First 10 seats are occupied
  }));

  await prisma.seats.createMany({
    data: seatsData1,
  });

  // Create Seats for Ferry 2 (100 seats for demo)
  const seatsData2 = Array.from({ length: 100 }, (_, i) => ({
    seat_configurations_id: seatConfig2.id,
    is_free: true,
  }));

  await prisma.seats.createMany({
    data: seatsData2,
  });

  // Create Seats for Ferry 3 (80 seats for demo)
  const seatsData3 = Array.from({ length: 80 }, (_, i) => ({
    seat_configurations_id: seatConfig3.id,
    is_free: i >= 20, // First 20 seats are occupied
  }));

  await prisma.seats.createMany({
    data: seatsData3,
  });

  // Get some seats for bookings
  const availableSeats = await prisma.seats.findMany({
    where: { is_free: true },
    take: 20,
  });

  // Create Trips
  console.log('🚢 Creating trips...');
  const trip1DepartureDate = new Date(tomorrow);
  trip1DepartureDate.setHours(8, 0, 0, 0);
  const trip1ArrivalDate = new Date(trip1DepartureDate);
  trip1ArrivalDate.setHours(16, 0, 0, 0);

  const trip1 = await prisma.trips.create({
    data: {
      ferries_id: ferry1.id,
      routes_id: route1.id,
      schedules_id: schedule1.id,
      departure_date: trip1DepartureDate,
      departure_time: trip1DepartureDate,
      arrival_date: trip1ArrivalDate,
      arrival_time: trip1ArrivalDate,
      available_passenger_seats: 490,
      status: 'SCHEDULED',
    },
  });

  const trip2DepartureDate = new Date(tomorrow);
  trip2DepartureDate.setDate(trip2DepartureDate.getDate() + 2);
  trip2DepartureDate.setHours(22, 0, 0, 0);
  const trip2ArrivalDate = new Date(trip2DepartureDate);
  trip2ArrivalDate.setDate(trip2ArrivalDate.getDate() + 1);
  trip2ArrivalDate.setHours(6, 0, 0, 0);

  const trip2 = await prisma.trips.create({
    data: {
      ferries_id: ferry2.id,
      routes_id: route1.id,
      schedules_id: schedule2.id,
      departure_date: trip2DepartureDate,
      departure_time: trip2DepartureDate,
      arrival_date: trip2ArrivalDate,
      arrival_time: trip2ArrivalDate,
      available_passenger_seats: 800,
      status: 'SCHEDULED',
    },
  });

  const trip3DepartureDate = new Date(tomorrow);
  trip3DepartureDate.setHours(10, 0, 0, 0);
  const trip3ArrivalDate = new Date(trip3DepartureDate);
  trip3ArrivalDate.setHours(13, 0, 0, 0);

  const trip3 = await prisma.trips.create({
    data: {
      ferries_id: ferry3.id,
      routes_id: route3.id,
      schedules_id: schedule3.id,
      departure_date: trip3DepartureDate,
      departure_time: trip3DepartureDate,
      arrival_date: trip3ArrivalDate,
      arrival_time: trip3ArrivalDate,
      available_passenger_seats: 280,
      status: 'BOARDING',
    },
  });

  // Create Bookings
  console.log('📋 Creating bookings...');
  const expiresAt1 = new Date(trip1DepartureDate);
  expiresAt1.setHours(expiresAt1.getHours() - 2);

  const booking1 = await prisma.bookings.create({
    data: {
      users_id: customer1.id,
      trips_id: trip1.id,
      total_passengers: 2,
      total_vehicles: 1,
      subtotal: 250.0,
      taxes: 25.0,
      discount_amount: 0,
      total_amount: 275.0,
      status: 'CONFIRMED',
      expires_at: expiresAt1,
    },
  });

  const expiresAt2 = new Date(trip2DepartureDate);
  expiresAt2.setHours(expiresAt2.getHours() - 2);

  const booking2 = await prisma.bookings.create({
    data: {
      users_id: customer2.id,
      trips_id: trip2.id,
      total_passengers: 4,
      total_vehicles: 0,
      subtotal: 300.0,
      taxes: 30.0,
      discount_amount: 15.0,
      total_amount: 315.0,
      status: 'CONFIRMED',
      expires_at: expiresAt2,
    },
  });

  const expiresAt3 = new Date();
  expiresAt3.setHours(expiresAt3.getHours() + 1);

  const booking3 = await prisma.bookings.create({
    data: {
      users_id: customer3.id,
      trips_id: trip3.id,
      total_passengers: 3,
      total_vehicles: 1,
      subtotal: 180.0,
      taxes: 18.0,
      discount_amount: 0,
      total_amount: 198.0,
      status: 'PENDING',
      expires_at: expiresAt3,
    },
  });

  // Create Booking Passengers
  console.log('👤 Creating booking passengers...');
  await prisma.booking_passengers.create({
    data: {
      bookings_id: booking1.id,
      seats_id: availableSeats[0]?.id,
      first_name: 'Juan',
      last_name: 'Pérez',
      id_number: '12345678A',
      price: 100.0,
      passenger_type: 'ADULT',
    },
  });

  await prisma.booking_passengers.create({
    data: {
      bookings_id: booking1.id,
      seats_id: availableSeats[1]?.id,
      first_name: 'Ana',
      last_name: 'Pérez',
      id_number: '87654321B',
      price: 100.0,
      passenger_type: 'ADULT',
    },
  });

  await prisma.booking_passengers.createMany({
    data: [
      {
        bookings_id: booking2.id,
        seats_id: availableSeats[2]?.id,
        first_name: 'María',
        last_name: 'García',
        id_number: '11111111C',
        price: 100.0,
        passenger_type: 'ADULT',
      },
      {
        bookings_id: booking2.id,
        seats_id: availableSeats[3]?.id,
        first_name: 'Carlos',
        last_name: 'García',
        id_number: '22222222D',
        price: 100.0,
        passenger_type: 'ADULT',
      },
      {
        bookings_id: booking2.id,
        seats_id: availableSeats[4]?.id,
        first_name: 'Sofía',
        last_name: 'García',
        id_number: '33333333E',
        price: 50.0,
        passenger_type: 'CHILD',
      },
      {
        bookings_id: booking2.id,
        seats_id: availableSeats[5]?.id,
        first_name: 'Luis',
        last_name: 'García Martínez',
        price: 50.0,
        passenger_type: 'INFANT',
      },
    ],
  });

  // Create Booking Vehicles
  console.log('🚗 Creating booking vehicles...');
  await prisma.booking_vehicles.create({
    data: {
      bookings_id: booking1.id,
      license_plate: 'ABC1234',
      brand: 'Toyota',
      driver_name: 'Juan Pérez',
      price: 50.0,
    },
  });

  await prisma.booking_vehicles.create({
    data: {
      bookings_id: booking3.id,
      license_plate: 'XYZ5678',
      brand: 'Honda',
      driver_name: 'Pedro López',
      price: 50.0,
    },
  });

  // Create Tickets
  console.log('🎫 Creating tickets...');
  await prisma.tickets.create({
    data: {
      bookings_id: booking1.id,
      ticket_number: 'TKT-2025-001',
      qr_code: 'QR-BCN-PMI-001-20250128',
      passenger_name: 'Juan Pérez',
      status: 'VALID',
      issued_at: new Date(),
      used_at: new Date(),
    },
  });

  await prisma.tickets.create({
    data: {
      bookings_id: booking1.id,
      ticket_number: 'TKT-2025-002',
      qr_code: 'QR-BCN-PMI-002-20250128',
      passenger_name: 'Ana Pérez',
      status: 'VALID',
      issued_at: new Date(),
      used_at: new Date(),
    },
  });

  await prisma.tickets.createMany({
    data: [
      {
        bookings_id: booking2.id,
        ticket_number: 'TKT-2025-003',
        qr_code: 'QR-BCN-PMI-003-20250130',
        passenger_name: 'María García',
        status: 'VALID',
        issued_at: new Date(),
        used_at: new Date(),
      },
      {
        bookings_id: booking2.id,
        ticket_number: 'TKT-2025-004',
        qr_code: 'QR-BCN-PMI-004-20250130',
        passenger_name: 'Carlos García',
        status: 'VALID',
        issued_at: new Date(),
        used_at: new Date(),
      },
      {
        bookings_id: booking2.id,
        ticket_number: 'TKT-2025-005',
        qr_code: 'QR-BCN-PMI-005-20250130',
        passenger_name: 'Sofía García',
        status: 'VALID',
        issued_at: new Date(),
        used_at: new Date(),
      },
    ],
  });

  // Create Notifications
  console.log('🔔 Creating notifications...');
  await prisma.notifications.createMany({
    data: [
      {
        users_id: customer1.id,
        bookings_id: booking1.id,
        subject: 'Booking Confirmation',
        content:
          'Your booking TKT-2025-001 has been confirmed for the Barcelona - Palma route.',
        type: 'EMAIL',
        status: 'SENT',
        sent_at: new Date(),
      },
      {
        users_id: customer1.id,
        bookings_id: booking1.id,
        subject: 'Departure Reminder',
        content:
          'Reminder: Your ferry departs tomorrow at 8:00 AM from Port de Barcelona.',
        type: 'SMS',
        status: 'SENT',
        sent_at: new Date(),
      },
      {
        users_id: customer2.id,
        bookings_id: booking2.id,
        subject: 'Booking Confirmation',
        content: 'Your booking for 4 passengers has been confirmed.',
        type: 'EMAIL',
        status: 'SENT',
        sent_at: new Date(),
      },
      {
        users_id: customer3.id,
        bookings_id: booking3.id,
        subject: 'Payment Pending',
        content: 'Please complete your payment to confirm your booking.',
        type: 'EMAIL',
        status: 'PENDING',
        sent_at: new Date(),
      },
    ],
  });

  // Update seat availability
  if (availableSeats.length > 0) {
    await prisma.seats.updateMany({
      where: {
        id: {
          in: availableSeats.slice(0, 6).map((s) => s.id),
        },
      },
      data: {
        is_free: false,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.users.count()}`);
  console.log(`   - Ports: ${await prisma.ports.count()}`);
  console.log(`   - Ferries: ${await prisma.ferries.count()}`);
  console.log(`   - Routes: ${await prisma.routes.count()}`);
  console.log(`   - Schedules: ${await prisma.schedules.count()}`);
  console.log(`   - Trips: ${await prisma.trips.count()}`);
  console.log(`   - Bookings: ${await prisma.bookings.count()}`);
  console.log(`   - Tickets: ${await prisma.tickets.count()}`);
  console.log(`   - Seats: ${await prisma.seats.count()}`);
  console.log(`   - Notifications: ${await prisma.notifications.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
