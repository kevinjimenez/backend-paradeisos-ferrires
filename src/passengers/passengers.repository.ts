import { DatabasesService } from '../databases/databases.service';
import { BaseRepository } from 'src/common/base/base.repository';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/databases/generated/prisma/client';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';

@Injectable()
export class PassengersRepository extends BaseRepository<Prisma.passengersModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'passengers';
  }

  protected get db(): PrismaTransaction {
    return this.databasesService;
  }

  async upsertByDocument(
    data: Prisma.passengersCreateInput,
    tx?: PrismaTransaction,
  ): Promise<Prisma.passengersModel> {
    const database = tx ?? this.db;
    return database.passengers.upsert({
      where: {
        document_number: data.document_number,
      },
      create: data,
      update: data,
    });
  }

  async createExtras(
    passengerId: string,
    extras: Array<{ extraId: string; quantity: number; unitPrice: number }>,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const database = tx ?? this.db;
    await database.passenger_extras.createMany({
      data: extras.map((e) => ({
        passenger_id: passengerId,
        extra_id: e.extraId,
        quantity: e.quantity,
        unit_price: e.unitPrice,
      })),
    });
  }
}
