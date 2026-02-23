import { Injectable, Logger } from '@nestjs/common';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { SeatHoldsHistoryRepository } from 'src/seat-holds-history/seat-holds-history.repository';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingResponse } from '../interfaces/booking-response.interface';
import { CreateSeatHoldCommand } from './create-seat-hold.command';

@Injectable()
export class CreateBookingCommand {
  private readonly logger = new Logger(CreateBookingCommand.name);

  constructor(
    private readonly createSeatHoldCommand: CreateSeatHoldCommand,
    private readonly seatHoldsHistoryRepository: SeatHoldsHistoryRepository,
  ) {}

  async execute(
    dto: CreateBookingDto,
    holdExpiresAt: Date,
    tx: PrismaTransaction,
  ): Promise<BookingResponse> {
    const { outboundScheduleId, returnScheduleId, totalPassengers } = dto;

    // 1. Crear hold de ida (outbound)
    const outboundHold = await this.createSeatHoldCommand.execute(
      outboundScheduleId,
      totalPassengers,
      holdExpiresAt,
      tx,
    );

    // 2. Crear hold de vuelta (return) - opcional
    let returnHoldId: string | null = null;
    if (returnScheduleId) {
      const returnHold = await this.createSeatHoldCommand.execute(
        returnScheduleId,
        totalPassengers,
        holdExpiresAt,
        tx,
      );
      returnHoldId = returnHold.id;
    }

    // 3. Crear seat_holds_history
    const history = await this.seatHoldsHistoryRepository.createHistory(
      outboundHold.id,
      returnHoldId,
      tx,
    );

    return { id: history.id };
  }
}
