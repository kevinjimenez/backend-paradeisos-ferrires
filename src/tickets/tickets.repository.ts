import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { DatabasesService } from './../databases/databases.service';
import {
  Prisma,
  TicketsStatus,
} from './../databases/generated/prisma/client';

@Injectable()
export class TicketsRepository extends BaseRepository<Prisma.ticketsModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'tickets';
  }

  protected get db(): PrismaTransaction {
    return this.databasesService;
  }

  async expireByIds(
    ticketIds: string[],
    tx?: PrismaTransaction,
  ): Promise<void> {
    const database = tx ?? this.db;

    await database.tickets.updateMany({
      where: { id: { in: ticketIds } },
      data: { status: TicketsStatus.expired },
    });
  }
}
