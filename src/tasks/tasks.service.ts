import { PrismaTransaction } from './../common/types/prisma-transaction.type';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';
import { SeatHoldsRepository } from './../seat-holds/seat-holds.repository';
import { ReleaseExpiredHoldsCommand } from './commands/release-expired-holds.command';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly databasesService: DatabasesService,
    private readonly seatHoldsRepository: SeatHoldsRepository,
    private readonly releaseExpiredHoldsCommand: ReleaseExpiredHoldsCommand,
  ) {}

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
    const expiredHolds =
      await this.seatHoldsRepository.findExpiredHolds(expiredDate);

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
      await this.releaseExpiredHoldsCommand.execute(hold, tx);
    });
  }
}
