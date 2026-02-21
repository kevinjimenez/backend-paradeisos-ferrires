import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/databases/generated/prisma/client';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { DatabasesService } from '../databases/databases.service';

@Injectable()
export class PortsRepository extends BaseRepository<Prisma.portsModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'ports';
  }

  protected get db() {
    return this.databasesService;
  }

  async findAllWithIslands(tx?: PrismaTransaction) {
    const database = tx ?? this.db;

    return database.ports.findMany({
      select: {
        id: true,
        name: true,
        islands: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
