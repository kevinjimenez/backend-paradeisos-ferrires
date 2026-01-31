import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabasesService } from 'src/databases/databases.service';
import { Prisma } from 'src/databases/generated/prisma/client';

@Injectable()
export class SeatHoldsHistoryService {
  constructor(private databasesService: DatabasesService) {}

  async findOne(id: string) {
    const query: Prisma.seat_holdsWhereInput = { status: 'held' };
    const seatHoldWithRelation = {
      status: true,
      quantity: true,
      held_at: true,
      expires_at: true,
      schedules: {
        select: {
          id: true,
          departure_date: true,
          arrival_time: true,
          departure_time: true,
          available_seats: true,
          status: true,
          ferries: {
            select: {
              id: true,
              name: true,
              register_code: true,
              type: true,
              capacity: true,
              amenities: true,
            },
          },
          routes: {
            select: {
              id: true,
              base_price_national: true,
              base_price_resident: true,
              base_price_foreign: true,
              distance_km: true,
              duration_minutes: true,
              origin_ports: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              destination_ports: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
    };

    const seatHoldHistoryWithRelation: Prisma.seat_holds_historySelect = {
      id: true,
      outbound_seat_hold_id: true,
      return_seat_hold_id: true,
      created_at: true,
      outbound_seat_holds: {
        where: query,
        select: seatHoldWithRelation,
      },
      return_seat_holds: {
        where: query,
        select: seatHoldWithRelation,
      },
    };

    const seatHoldsHistory =
      await this.databasesService.seat_holds_history.findUnique({
        where: { id },
        select: seatHoldHistoryWithRelation,
      });

    if (!seatHoldsHistory) {
      throw new NotFoundException(`Seat holds history with ID ${id} not found`);
    }

    return seatHoldsHistory;
  }
}
