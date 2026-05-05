import { Injectable } from '@nestjs/common';
import { DatabasesService } from 'src/databases/databases.service';
import { BaseRepository } from '../common/base/base.repository';
import { Prisma } from '../databases/generated/prisma/client';

@Injectable()
export class FareExtrasRepository extends BaseRepository<Prisma.fare_extrasModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'fare_extras';
  }

  protected get db() {
    return this.databasesService;
  }

  findAll() {
    return this.db.fare_extras.findMany({ where: { is_active: true } });
  }

  findById(id: string) {
    return this.db.fare_extras.findUnique({ where: { id } });
  }
}
