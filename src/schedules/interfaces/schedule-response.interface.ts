import { FerryType, Prisma } from '../../databases/generated/prisma/client';

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
  base_price: Prisma.Decimal;
  origin_islands: RouteIsland;
  destination_islands: RouteIsland;
}

export interface RouteIsland {
  name: string;
  description: string;
  code: string;
  pier_name: string;
  port_address: string;
}
