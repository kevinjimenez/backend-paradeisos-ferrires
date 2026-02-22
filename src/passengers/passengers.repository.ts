import { DatabasesService } from './../databases/databases.service';
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
}
