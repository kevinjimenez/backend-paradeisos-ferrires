import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';

@Injectable()
export class SchedulesRepository extends BaseRepository<Prisma.schedulesModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'schedules';
  }

  protected get db(): PrismaTransaction {
    return this.databasesService;
  }

  async findWithFilters(
    where: Prisma.schedulesWhereInput,
    tx?: PrismaTransaction,
  ) {
    const database = tx ?? this.db;

    return database.schedules.findMany({
      select: {
        id: true,
        departure_time: true,
        arrival_time: true,
        available_seats: true,
        ferries: {
          select: {
            name: true,
            amenities: true,
            type: true,
          },
        },
        routes: {
          select: {
            base_price_national: true,
          },
        },
      },
      where,
    });
  }

  async restoreSeats(
    scheduleId: string,
    quantity: number,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const database = tx ?? this.db;

    await database.schedules.update({
      where: { id: scheduleId },
      data: {
        available_seats: {
          increment: quantity,
        },
      },
    });
  }
}
