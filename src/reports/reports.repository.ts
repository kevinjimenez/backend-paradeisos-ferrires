import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { DatabasesService } from './../databases/databases.service';
import {
  PaymentStatus,
  Prisma,
  TicketsStatus,
} from './../databases/generated/prisma/client';

@Injectable()
export class ReportsRepository extends BaseRepository<Prisma.ticketsModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'tickets';
  }

  protected get db(): PrismaTransaction {
    return this.databasesService;
  }

  async findByDepartureDateRange(
    startDate: Date,
    endDate: Date,
    selectConfig: Prisma.ticketsSelect,
    status?: TicketsStatus,
    paymentStatus?: PaymentStatus,
    tx?: PrismaTransaction,
  ) {
    const database = tx ?? this.db;

    return database.tickets.findMany({
      where: {
        ...(status && { status }),
        ...(paymentStatus && { payments: { some: { status: paymentStatus } } }),
        OR: [
          {
            outbound_schedules: {
              departure_date: { gte: startDate, lte: endDate },
            },
          },
          {
            return_schedules: {
              departure_date: { gte: startDate, lte: endDate },
            },
          },
        ],
      },
      select: selectConfig,
      orderBy: { created_at: 'asc' },
    });
  }
}
