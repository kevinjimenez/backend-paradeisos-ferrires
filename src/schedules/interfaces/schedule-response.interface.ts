import { FerryType, Prisma } from 'src/databases/generated/prisma/client';

export interface ScheduleResponse {
  id: string;
  departure_time: Date;
  arrival_time: Date;
  available_seats: number;
  ferries: FerriesSchedule | null;
  routes: RoutesSchedule | null;
}

export interface FerriesSchedule {
  name: string;
  amenities: Prisma.JsonValue;
  type: FerryType;
}

export interface RoutesSchedule {
  base_price_national: Prisma.Decimal;
}
