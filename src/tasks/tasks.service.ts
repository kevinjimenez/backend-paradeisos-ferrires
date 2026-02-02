import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabasesService } from './../databases/databases.service';
import {
  Prisma,
  SeatHoldsStatus,
} from './../databases/generated/prisma/client';
import { PrismaTransaction } from './../databases/prisma.types';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private databasesService: DatabasesService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredHolds() {
    this.logger.log('Starting expired holds release...');

    try {
      const result = await this.processExpiredHolds();

      if (result.releasedCount > 0) {
        this.logger.log(
          `Released ${result.releasedCount} holds, ` +
            `${result.seatsRestored} seats restored`,
        );
      } else {
        this.logger.debug('No expired holds to release');
      }
    } catch (error) {
      this.logger.error('Error releasing expired holds:', error);
    }
  }

  private async processExpiredHolds() {
    let releasedCount = 0;
    let seatsRestored = 0;

    // 1. Find all expired holds
    const expiredDate = new Date();
    const holdsWithRelations: Prisma.seat_holdsInclude = {
      schedules: true,
    };
    const queryHolds: Prisma.seat_holdsWhereInput = {
      status: SeatHoldsStatus.held,
      expires_at: {
        lt: expiredDate,
      },
    };
    const expiredHolds = await this.databasesService.seat_holds.findMany({
      where: queryHolds,
      include: holdsWithRelations,
    });

    if (expiredHolds.length === 0) {
      return { releasedCount: 0, seatsRestored: 0 };
    }

    this.logger.log(`Found ${expiredHolds.length} expired holds`);

    // 2. Process each hold in a transaction
    for (const hold of expiredHolds) {
      try {
        await this.releaseHold(hold);
        releasedCount++;
        seatsRestored += hold.quantity;
      } catch (error) {
        this.logger.error(`Error releasing hold ${hold.id}:`, error);
      }
    }

    return { releasedCount, seatsRestored };
  }

  private async releaseHold(hold: Prisma.seat_holdsModel) {
    await this.databasesService.$transaction(async (tx: PrismaTransaction) => {
      // 1. Mark hold as expired
      const releasedDate = new Date();
      const holdsWithRelations: Prisma.seat_holdsInclude = {
        outbound_ticket: true,
        return_ticket: true,
      };
      const queryHold: Prisma.seat_holdsWhereUniqueInput = {
        id: hold.id,
      };
      const holdData: Prisma.seat_holdsUpdateInput = {
        status: 'expired',
        released_at: releasedDate,
      };

      const updatedHold = await tx.seat_holds.update({
        where: queryHold,
        include: holdsWithRelations,
        data: holdData,
      });

      // 2. Restore seats to schedule
      const querySchedule: Prisma.schedulesWhereUniqueInput = {
        id: hold.schedule_id!,
      };
      const scheduleData: Prisma.schedulesUpdateInput = {
        available_seats: {
          increment: hold.quantity,
        },
      };
      await tx.schedules.update({
        where: querySchedule,
        data: scheduleData,
      });

      // TODO: Update ticket status to expired
      const outboundTicket = updatedHold.outbound_ticket?.id;
      const returnTicket = updatedHold.return_ticket?.id;
      console.log({ outboundTicket });
      console.log({ returnTicket });

      this.logger.debug(
        `Hold ${hold.id} released: +${hold.quantity} seats for schedule ${hold.schedule_id}`,
      );
    });
  }
}
