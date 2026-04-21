import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { DatabasesService } from './../databases/databases.service';
import { Prisma, TicketsStatus } from './../databases/generated/prisma/client';

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

  async createTicket(
    data: Prisma.ticketsCreateInput,
    tx?: PrismaTransaction,
  ): Promise<Prisma.ticketsModel> {
    const database = tx ?? this.db;

    return database.tickets.create({
      data,
    });
  }

  async findOneWithRelations(
    id: string,
    selectConfig: Prisma.ticketsSelect,
    tx?: PrismaTransaction,
  ) {
    const database = tx ?? this.db;

    return database.tickets.findUnique({
      where: { id },
      select: selectConfig,
    });
  }

  async findAll(tx?: PrismaTransaction): Promise<Prisma.ticketsModel[]> {
    const database = tx ?? this.db;

    return database.tickets.findMany();
  }

  async updateTicket(
    id: string,
    data: Prisma.ticketsUpdateInput,
    tx?: PrismaTransaction,
  ) {
    const database = tx ?? this.db;

    return database.tickets.update({
      where: { id },
      data,
      select: {
        contacts: {
          select: {
            email: true,
          },
        },
      },
    });
  }
}
