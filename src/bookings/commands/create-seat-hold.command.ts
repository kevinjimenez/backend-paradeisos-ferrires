import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { ScheduleStatus } from 'src/databases/generated/prisma/client';
import { SchedulesRepository } from 'src/schedules/schedules.repository';
import { SeatHoldsRepository } from 'src/seat-holds/seat-holds.repository';
import { SeatHoldResult } from '../interfaces/seat-hold-result.interface';

@Injectable()
export class CreateSeatHoldCommand {
  private readonly logger = new Logger(CreateSeatHoldCommand.name);

  constructor(
    private readonly schedulesRepository: SchedulesRepository,
    private readonly seatHoldsRepository: SeatHoldsRepository,
  ) {}

  async execute(
    scheduleId: string,
    seatsToReserve: number,
    holdExpiresAt: Date,
    tx: PrismaTransaction,
  ): Promise<SeatHoldResult> {
    // 1. Obtener schedule con lock (SELECT FOR UPDATE)
    const schedule = await this.schedulesRepository.findByIdWithLock(
      scheduleId,
      tx,
    );

    if (!schedule) {
      throw new BadRequestException(`Schedule ${scheduleId} not found`);
    }

    // 2. Validar status del schedule
    if (schedule.status !== ScheduleStatus.scheduled) {
      throw new BadRequestException(
        `Schedule not available (status: ${schedule.status})`,
      );
    }

    // 3. Validar asientos disponibles
    if (schedule.available_seats < seatsToReserve) {
      throw new BadRequestException(
        `Not enough seats available. Available: ${schedule.available_seats}, Requested: ${seatsToReserve}`,
      );
    }

    // 4. Crear seat hold
    const seatHold = await this.seatHoldsRepository.createHold(
      {
        schedule_id: scheduleId,
        quantity: seatsToReserve,
        expires_at: holdExpiresAt,
      },
      tx,
    );

    this.logger.debug(`Created seat hold: ${seatHold.id}`);

    // 5. Decrementar asientos disponibles
    await this.schedulesRepository.decrementSeats(
      scheduleId,
      seatsToReserve,
      tx,
    );

    return seatHold;
  }
}
