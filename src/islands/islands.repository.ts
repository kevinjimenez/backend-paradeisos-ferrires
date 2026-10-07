import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { Prisma } from 'src/databases/generated/prisma/client';
import { DatabasesService } from '../databases/databases.service';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';

@Injectable()
export class IslandsRepository extends BaseRepository<Prisma.islandsModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'islands';
  }

  protected get db() {
    return this.databasesService;
  }

  async findAllBasic(tx?: PrismaTransaction) {
    const database = tx ?? this.db;

    return database.islands.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        pier_name: true,
        port_address: true,
      },
    });
  }
}
