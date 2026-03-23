import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { ScheduleStatus } from 'src/databases/generated/prisma/client';
import { SchedulesRepository } from 'src/schedules/schedules.repository';
import { SeatHoldsRepository } from 'src/seat-holds/seat-holds.repository';
import { SeatHoldResult } from '../interfaces/seat-hold-result.interface';
import { DomainException } from './../../common/exceptions/domain.exception';
import { ResourceNotFoundException } from './../../common/exceptions/not-found.exception';

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
      // throw new BadRequestException(`Schedule ${scheduleId} not found`);
      throw new ResourceNotFoundException('Schedule', scheduleId);
    }

    // 2. Validar status del schedule
    if (schedule.status !== ScheduleStatus.scheduled) {
      throw new DomainException(
        `Schedule not available (status: ${schedule.status})`,
        HttpStatus.CONFLICT,
      );
    }

    // 3. Validar asientos disponibles
    if (schedule.available_seats < seatsToReserve) {
      throw new DomainException(
        `Not enough seats. Available: ${schedule.available_seats}, requested: ${seatsToReserve}`,
        HttpStatus.CONFLICT,
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
