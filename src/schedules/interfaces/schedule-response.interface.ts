import { FerryType, Prisma } from 'src/databases/generated/prisma/client';

export interface ScheduleResponse {
  id: string;
  departure_time: Date;
  arrival_time: Date;
  available_seats: number;
  ferries: Ferries | null;
  routes: Routes | null;
}

export interface Ferries {
  name: string;
  amenities: Prisma.JsonValue;
  type: FerryType;
}

export interface Routes {
  base_price_national: Prisma.Decimal;
}
