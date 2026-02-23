import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';
import { SeatHoldsHistoryQueryBuilder } from './builders/seat-holds-history-query.builder';

@Injectable()
export class SeatHoldsHistoryRepository extends BaseRepository<Prisma.seat_holds_historyModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'seat_holds_history';
  }

  protected get db(): PrismaTransaction {
    return this.databasesService;
  }

  async findOneWithRelations(id: string, tx?: PrismaTransaction) {
    const database = tx ?? this.db;

    const selectConfig = new SeatHoldsHistoryQueryBuilder()
      .withAllRelations()
      .build();

    return database.seat_holds_history.findUnique({
      where: { id },
      select: selectConfig,
    });
  }

  async createHistory(
    outboundSeatHoldId: string,
    returnSeatHoldId: string | null,
    tx?: PrismaTransaction,
  ) {
    const database = tx ?? this.db;

    return database.seat_holds_history.create({
      data: {
        outbound_seat_hold_id: outboundSeatHoldId,
        ...(returnSeatHoldId && { return_seat_hold_id: returnSeatHoldId }),
      },
      select: { id: true },
    });
  }
}
