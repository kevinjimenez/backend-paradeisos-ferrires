import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { DatabasesService } from './../databases/databases.service';
import {
  Prisma,
  SeatHoldsStatus,
} from './../databases/generated/prisma/client';

@Injectable()
export class SeatHoldsRepository extends BaseRepository<Prisma.seat_holdsModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'seat_holds';
  }

  protected get db(): PrismaTransaction {
    return this.databasesService;
  }

  async findExpiredHolds(expiredDate: Date, tx?: PrismaTransaction) {
    const database = tx ?? this.db;

    return database.seat_holds.findMany({
      where: {
        status: SeatHoldsStatus.held,
        expires_at: {
          lt: expiredDate,
        },
      },
      include: {
        schedules: true,
      },
    });
  }

  async updateToExpired(id: string, releasedAt: Date, tx?: PrismaTransaction) {
    const database = tx ?? this.db;

    return database.seat_holds.update({
      where: { id },
      data: {
        status: SeatHoldsStatus.expired,
        released_at: releasedAt,
      },
      include: {
        outbound_ticket: true,
        return_ticket: true,
      },
    });
  }
}
