import { Injectable, Logger } from '@nestjs/common';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { Prisma, TicketsStatus } from 'src/databases/generated/prisma/client';
import { SchedulesRepository } from 'src/schedules/schedules.repository';
import { SeatHoldsRepository } from 'src/seat-holds/seat-holds.repository';
import { TicketsRepository } from 'src/tickets/tickets.repository';

@Injectable()
export class ReleaseExpiredHoldsCommand {
  private readonly logger = new Logger(ReleaseExpiredHoldsCommand.name);

  constructor(
    private readonly seatHoldsRepository: SeatHoldsRepository,
    private readonly schedulesRepository: SchedulesRepository,
    private readonly ticketsRepository: TicketsRepository,
  ) {}

  async execute(
    hold: Prisma.seat_holdsModel,
    tx: PrismaTransaction,
  ): Promise<void> {
    const releasedDate = new Date();

    // 1. Mark hold as expired
    const updatedHold = await this.seatHoldsRepository.updateToExpired(
      hold.id,
      releasedDate,
      tx,
    );

    // 2. Restore seats to schedule
    await this.schedulesRepository.restoreSeats(
      hold.schedule_id!,
      hold.quantity,
      tx,
    );

    // 3. Expire associated tickets
    const ticketIds = [
      updatedHold.outbound_ticket?.id,
      updatedHold.return_ticket?.id,
    ].filter(Boolean) as string[];

    const hasExpiredTickets =
      updatedHold.outbound_ticket?.status === TicketsStatus.pending &&
      ticketIds.length > 0;

    if (hasExpiredTickets) {
      await this.ticketsRepository.expireByIds(ticketIds, tx);
    }

    this.logger.debug(
      `Hold ${hold.id} released: +${hold.quantity} seats for schedule ${hold.schedule_id}`,
    );
  }
}
