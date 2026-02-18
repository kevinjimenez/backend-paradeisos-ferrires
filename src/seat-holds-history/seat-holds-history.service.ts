import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';
import { SeatHoldsHistoryResponse } from './interfaces/seat-holds-history-response';

@Injectable()
export class SeatHoldsHistoryService {
  private readonly logger = new Logger(SeatHoldsHistoryService.name);

  constructor(private databasesService: DatabasesService) {}

  async findOne(id: string): Promise<ApiResponse<SeatHoldsHistoryResponse>> {
    try {
      const seatHoldWithRelation = {
        status: true,
        schedules: {
          select: {
            arrival_time: true,
            departure_time: true,
            ferries: {
              select: {
                name: true,
                register_code: true,
                type: true,
                amenities: true,
              },
            },
            routes: {
              select: {
                base_price_national: true,
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
          // where: query,
          select: seatHoldWithRelation,
        },
        return_seat_holds: {
          // where: query,
          select: seatHoldWithRelation,
        },
      };

      const seatHoldsHistory =
        await this.databasesService.seat_holds_history.findUnique({
          where: { id },
          select: seatHoldHistoryWithRelation,
        });

      if (!seatHoldsHistory) {
        throw new NotFoundException(`Seat holds with ID ${id} not found`);
      }

      if (!seatHoldsHistory.outbound_seat_holds) {
        throw new NotFoundException(`Seat holds expired`);
      }

      return { data: seatHoldsHistory as SeatHoldsHistoryResponse };
    } catch (error) {
      this.logger.error('Error fetching seat holds history', error);
      throw new InternalServerErrorException(
        'Failed to fetch seat holds history',
      );
    }
  }
}
