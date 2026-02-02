import { DatabasesService } from './../databases/databases.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from './../databases/generated/prisma/client';
import { envs } from './../common/config/envs';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { PrismaTransaction } from './../databases/prisma.types';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponse } from './interfaces/booking-response.interface';
import { CreateSeatHold } from './interfaces/create-seat-hold.interface';
import { SeatHoldResult } from './interfaces/seat-hold-result.interface';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(private databasesService: DatabasesService) {}

  async create(
    createBookingDto: CreateBookingDto,
  ): Promise<ApiResponse<BookingResponse>> {
    try {
      const { outboundScheduleId, returnScheduleId, totalPassengers } =
        createBookingDto;

      const expiresAt = new Date();
      const minutes = expiresAt.getMinutes() + envs.holdExpirationMinutes;
      expiresAt.setMinutes(minutes);

      const newBooking = await this.databasesService.$transaction(
        async (tx) => {
          const holdParams = {
            seatsToReserve: totalPassengers,
            holdExpiresAt: expiresAt,
          };

          const outboundParams = {
            scheduleId: outboundScheduleId,
            ...holdParams,
          };

          const outboundHold = await this.createHoldForSchedule(
            tx,
            outboundParams,
          );

          let returnHold: SeatHoldResult | null = null;
          if (returnScheduleId) {
            const returnParams = {
              scheduleId: returnScheduleId,
              ...holdParams,
            };
            returnHold = await this.createHoldForSchedule(tx, returnParams);
          }

          const { id } = await tx.seat_holds_history.create({
            data: {
              outbound_seat_hold_id: outboundHold.id,
              ...(returnHold && { return_seat_hold_id: returnHold.id }),
            },
          });

          return {
            seatHoldsHistory: id,
          };
        },
      );

      return {
        data: newBooking,
      };
    } catch (error) {
      this.logger.error('Error creating booking', error);
      throw new InternalServerErrorException('Failed to create booking');
    }
  }

  private async createHoldForSchedule(
    transaction: PrismaTransaction,
    params: CreateSeatHold,
  ) {
    const { scheduleId, seatsToReserve, holdExpiresAt } = params;

    const schedules: Prisma.schedulesModel[] = await transaction.$queryRaw`
      SELECT id, available_seats, total_capacity, status
      FROM schedules
      WHERE id = ${scheduleId}
      FOR UPDATE
    `;

    const schedule = schedules[0];

    if (!schedule) {
      throw new BadRequestException(`Schedule ${scheduleId} not found`);
    }

    if (schedule.status !== 'scheduled') {
      throw new BadRequestException(
        `Schedule not available (status: ${schedule.status})`,
      );
    }

    if (schedule.available_seats < seatsToReserve) {
      throw new BadRequestException(
        `Not enough seats available. Available: ${schedule.available_seats}, Requested: ${seatsToReserve}`,
      );
    }

    const seatHoldToCreate = {
      schedule_id: scheduleId,
      quantity: seatsToReserve,
      expires_at: holdExpiresAt,
    };

    const seatHold = await transaction.seat_holds.create({
      select: {
        id: true,
      },
      data: seatHoldToCreate,
    });

    // 3. Decrementar asientos disponibles
    const querySchedules: Prisma.schedulesWhereUniqueInput = { id: scheduleId };
    const scheduleToUpdate: Prisma.schedulesUpdateInput = {
      available_seats: {
        decrement: seatsToReserve,
      },
    };

    await transaction.schedules.update({
      where: querySchedules,
      data: scheduleToUpdate,
    });

    return seatHold;
  }
}
